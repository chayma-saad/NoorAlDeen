import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayKey } from '../utils/helpers';

const KEYS = {
  PRAYER_NOTIFICATIONS: 'prayer_notifications',
  DHIKR_COUNTS: 'dhikr_counts',
  DAILY_CHECKS: 'daily_checks',
  QURAN_JUZ: 'quran_juz',
  QURAN_PAGES_TODAY: 'quran_pages_today',
  EVENT_CHECKS: 'event_checks',
  STREAK: 'streak',
  LAST_OPEN: 'last_open',
};

// Prayer notification settings
export const getPrayerNotifications = async (): Promise<Record<string, boolean>> => {
  try {
    const val = await AsyncStorage.getItem(KEYS.PRAYER_NOTIFICATIONS);
    return val ? JSON.parse(val) : { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
  } catch {
    return { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
  }
};

export const setPrayerNotification = async (prayer: string, enabled: boolean): Promise<void> => {
  try {
    const current = await getPrayerNotifications();
    current[prayer] = enabled;
    await AsyncStorage.setItem(KEYS.PRAYER_NOTIFICATIONS, JSON.stringify(current));
  } catch {}
};

// Dhikr counter
export const getDhikrCounts = async (): Promise<Record<string, number>> => {
  try {
    const key = `${KEYS.DHIKR_COUNTS}_${getTodayKey()}`;
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
};

export const setDhikrCount = async (dhikrId: string, count: number): Promise<void> => {
  try {
    const key = `${KEYS.DHIKR_COUNTS}_${getTodayKey()}`;
    const current = await getDhikrCounts();
    current[dhikrId] = count;
    await AsyncStorage.setItem(key, JSON.stringify(current));
  } catch {}
};

// Daily checklist
export const getDailyChecks = async (): Promise<Record<string, boolean>> => {
  try {
    const key = `${KEYS.DAILY_CHECKS}_${getTodayKey()}`;
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
};

export const toggleDailyCheck = async (checkId: string): Promise<boolean> => {
  try {
    const key = `${KEYS.DAILY_CHECKS}_${getTodayKey()}`;
    const current = await getDailyChecks();
    current[checkId] = !current[checkId];
    await AsyncStorage.setItem(key, JSON.stringify(current));
    return current[checkId];
  } catch {
    return false;
  }
};

// Quran juz progress
export const getQuranJuz = async (): Promise<Record<number, 'done' | 'partial' | 'none'>> => {
  try {
    const val = await AsyncStorage.getItem(KEYS.QURAN_JUZ);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
};

export const cycleJuzState = async (
  juz: number
): Promise<'done' | 'partial' | 'none'> => {
  try {
    const current = await getQuranJuz();
    const states: Array<'done' | 'partial' | 'none'> = ['none', 'partial', 'done'];
    const currentState = current[juz] || 'none';
    const nextState = states[(states.indexOf(currentState) + 1) % states.length];
    current[juz] = nextState;
    await AsyncStorage.setItem(KEYS.QURAN_JUZ, JSON.stringify(current));
    return nextState;
  } catch {
    return 'none';
  }
};

// Event-specific checks
export const getEventChecks = async (
  eventId: string
): Promise<Record<string, boolean>> => {
  try {
    const key = `${KEYS.EVENT_CHECKS}_${eventId}_${getTodayKey()}`;
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
};

export const toggleEventCheck = async (
  eventId: string,
  taskIndex: number
): Promise<boolean> => {
  try {
    const key = `${KEYS.EVENT_CHECKS}_${eventId}_${getTodayKey()}`;
    const current = await getEventChecks(eventId);
    const taskKey = String(taskIndex);
    current[taskKey] = !current[taskKey];
    await AsyncStorage.setItem(key, JSON.stringify(current));
    return current[taskKey];
  } catch {
    return false;
  }
};

// Streak
export const updateStreak = async (): Promise<number> => {
  try {
    const today = getTodayKey();
    const lastOpen = await AsyncStorage.getItem(KEYS.LAST_OPEN);
    const streakVal = await AsyncStorage.getItem(KEYS.STREAK);
    let streak = streakVal ? parseInt(streakVal) : 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    if (lastOpen === yKey) {
      streak += 1;
    } else if (lastOpen !== today) {
      streak = 1;
    }
    await AsyncStorage.setItem(KEYS.STREAK, String(streak));
    await AsyncStorage.setItem(KEYS.LAST_OPEN, today);
    return streak;
  } catch {
    return 0;
  }
};
