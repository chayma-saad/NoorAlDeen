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

// Holds setTimeout IDs for web prayer notifications so we can cancel them on reschedule
let webNotifTimeouts: ReturnType<typeof setTimeout>[] = [];

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
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
  if (Platform.OS === 'web') {
    // Cancel previous web timeouts before rescheduling
    webNotifTimeouts.forEach(clearTimeout);
    webNotifTimeouts = [];

    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const notifSettings = await getPrayerNotifications();
    const now = new Date();

    for (const prayer of PRAYER_NAMES) {
      if (prayer.key === 'Sunrise') continue;
      if (notifSettings[prayer.key] === false) continue;

      const timeStr = timings[prayer.key as keyof PrayerTimes];
      if (!timeStr) continue;

      const cleanTime = timeStr.replace(/\s*\(.*\)$/, '').trim();
      const [hours, minutes] = cleanTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;

      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      const delay = prayerTime.getTime() - now.getTime();
      if (delay <= 0) continue; // already passed today

      const prayerArabic = prayer.arabic;
      const timeout = setTimeout(() => {
        new Notification(`🕌 حان وقت ${prayerArabic}`, {
          body: 'حيّ على الصلاة · حيّ على الفلاح',
          icon: '/FocusAlDeen/assets/icon.png',
          tag: prayer.key,
        });
      }, delay);

      webNotifTimeouts.push(timeout);
    }
    return;
  }

  // Native path
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const notifSettings = await getPrayerNotifications();

    for (const prayer of PRAYER_NAMES) {
      if (prayer.key === 'Sunrise') continue;
      if (notifSettings[prayer.key] === false) continue;

      const timeStr = timings[prayer.key as keyof PrayerTimes];
      if (!timeStr) continue;

      const cleanTime = timeStr.replace(/\s*\(.*\)$/, '').trim();
      const [hours, minutes] = cleanTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 حان وقت ${prayer.arabic}`,
          body: 'حيّ على الصلاة · حيّ على الفلاح',
          sound: 'adhan.mp3',
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
  if (Platform.OS === 'web') {
    webNotifTimeouts.forEach(clearTimeout);
    webNotifTimeouts = [];
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
};
