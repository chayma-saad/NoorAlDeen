import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { fetchPrayerTimes, AladhanResponse } from '../services/api';
import { schedulePrayerNotifications } from '../services/notifications';
import { PRAYER_NAMES } from '../constants/islamicData';
import { isTimePassed, getTimeDiffMinutes, formatCountdown } from '../utils/helpers';

export interface NextPrayer {
  name: string;
  arabic: string;
  time: string;
  countdown: string;
  minutesLeft: number;
}

export const usePrayerTimes = () => {
  const [prayerData, setPrayerData] = useState<AladhanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [countdown, setCountdown] = useState('');

  const findNextPrayer = useCallback((data: AladhanResponse) => {
    const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    for (const key of prayerKeys) {
      const time = data.timings[key as keyof typeof data.timings];
      if (!isTimePassed(time)) {
        const info = PRAYER_NAMES.find((p) => p.key === key);
        const mins = getTimeDiffMinutes(time);
        setNextPrayer({
          name: key,
          arabic: info?.arabic || key,
          time,
          countdown: formatCountdown(mins),
          minutesLeft: mins,
        });
        return;
      }
    }
    // All prayers passed, next is Fajr tomorrow
    setNextPrayer({
      name: 'Fajr',
      arabic: 'الفجر',
      time: data.timings.Fajr,
      countdown: formatCountdown(getTimeDiffMinutes(data.timings.Fajr) + 24 * 60),
      minutesLeft: getTimeDiffMinutes(data.timings.Fajr) + 24 * 60,
    });
  }, []);

  const loadPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Default to Tunis coordinates
        const data = await fetchPrayerTimes(36.8065, 10.1815);
        if (data) {
          setPrayerData(data);
          findNextPrayer(data);
          await schedulePrayerNotifications(data.timings);
        }
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const data = await fetchPrayerTimes(
        location.coords.latitude,
        location.coords.longitude
      );
      if (data) {
        setPrayerData(data);
        findNextPrayer(data);
        await schedulePrayerNotifications(data.timings);
      } else {
        setError('تعذر تحميل أوقات الصلاة');
      }
    } catch (err) {
      setError('خطأ في تحميل أوقات الصلاة');
    } finally {
      setLoading(false);
    }
  }, [findNextPrayer]);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerData) findNextPrayer(prayerData);
    }, 60000);
    return () => clearInterval(interval);
  }, [prayerData, findNextPrayer]);

  return { prayerData, loading, error, nextPrayer, reload: loadPrayerTimes };
};
