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
      if (!notifSettings[prayer.key]) continue;
      const timeStr = timings[prayer.key as keyof PrayerTimes];
      if (!timeStr) continue;

      const [hours, minutes] = timeStr.split(':').map(Number);
      const trigger = new Date();
      trigger.setHours(hours, minutes, 0, 0);

      if (trigger <= new Date()) {
        trigger.setDate(trigger.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 حان وقت ${prayer.arabic}`,
          body: 'حيّ على الصلاة، حيّ على الفلاح',
          sound: true,
          data: { prayer: prayer.key },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as Notifications.DailyTriggerInput,
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
