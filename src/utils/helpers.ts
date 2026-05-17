export const toArabicNum = (n: number | string): string => {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((d) => (/\d/.test(d) ? arabicNums[parseInt(d)] : d))
    .join('');
};

export const formatTime = (time: string): string => {
  if (!time) return '--:--';
  const [h, m] = time.split(':');
  return toArabicNum(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`);
};

export const getTimeDiffMinutes = (timeStr: string): number => {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.floor((target.getTime() - now.getTime()) / 60000);
};

export const formatCountdown = (minutes: number): string => {
  if (minutes <= 0) return 'الآن';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `بعد ${toArabicNum(m)} دقيقة`;
  if (m === 0) return `بعد ${toArabicNum(h)} ساعة`;
  return `بعد ${toArabicNum(h)} ساعة و${toArabicNum(m)} دقيقة`;
};

export const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

export const getWeekKey = (): string => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${week}`;
};

export const getCurrentTimeStr = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const isTimePassed = (timeStr: string): boolean => {
  const now = getCurrentTimeStr();
  return now > timeStr;
};

export const getDaysUntilHijri = (
  targetDay: number,
  targetMonth: number,
  currentDay: number,
  currentMonth: number
): number => {
  if (targetMonth === currentMonth) {
    if (targetDay >= currentDay) return targetDay - currentDay;
  }
  // Simplified approximation
  const monthDiff =
    targetMonth >= currentMonth
      ? targetMonth - currentMonth
      : 12 - currentMonth + targetMonth;
  return monthDiff * 29 + targetDay - currentDay;
};
