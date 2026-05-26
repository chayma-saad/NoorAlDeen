import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTimes } from './api';
import { PRAYER_NAMES } from '../constants/islamicData';
import { getPrayerNotifications } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const schedulePrayerNotifications = async (
  timings: PrayerTimes
): Promise<void> => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const notifSettings = await getPrayerNotifications();

    for (const prayer of PRAYER_NAMES) {
      // Sunrise has no athan — skip
      if (prayer.key === 'Sunrise') continue;
      if (notifSettings[prayer.key] === false) continue;

      const timeStr = timings[prayer.key as keyof PrayerTimes];
      if (!timeStr) continue;

      // Strip any "(+01)" timezone suffix from the API time string
      const cleanTime = timeStr.replace(/\s*\(.*\)$/, '').trim();
      const [hours, minutes] = cleanTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 حان وقت ${prayer.arabic}`,
          body: 'حيّ على الصلاة · حيّ على الفلاح',
          sound: 'adhan.mp3',
          // ── CRITICAL: these fields drive the in-app PrayerCallScreen ──
          data: {
            type: 'PRAYER_CALL',
            prayer: prayer.key,
            prayerArabic: prayer.arabic,
            prayerTime: cleanTime,
          },
          ...(Platform.OS === 'android' && { channelId: 'prayer-call' }),
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as any,
      });
    }
  } catch (error) {
    console.warn('Failed to schedule notifications:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
