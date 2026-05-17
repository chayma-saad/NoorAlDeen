import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { PRAYER_NAMES } from '../constants/islamicData';
import {
  formatTime,
  isTimePassed,
  toArabicNum,
} from '../utils/helpers';
import {
  getPrayerNotifications,
  setPrayerNotification,
  getDailyChecks,
  toggleDailyCheck,
} from '../services/storage';

export default function PrayerTimesScreen() {
  const { prayerData, loading, error, nextPrayer, reload } = usePrayerTimes();
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [dailyChecks, setDailyChecks] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const notifs = await getPrayerNotifications();
    const checks = await getDailyChecks();
    setNotifications(notifs);
    setDailyChecks(checks);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const toggleNotif = async (prayer: string) => {
    const newVal = !notifications[prayer];
    await setPrayerNotification(prayer, newVal);
    setNotifications((prev) => ({ ...prev, [prayer]: newVal }));
  };

  const handleCheck = async (checkId: string) => {
    const newVal = await toggleDailyCheck(checkId);
    setDailyChecks((prev) => ({ ...prev, [checkId]: newVal }));
  };

  const hijriDate = prayerData?.date.hijri;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.gold} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>أوقات الصلاة</Text>
        {hijriDate && (
          <Text style={styles.headerSub}>
            {hijriDate.weekday.ar} · {toArabicNum(hijriDate.day)} {hijriDate.month.ar} {toArabicNum(hijriDate.year)} هـ
          </Text>
        )}
      </View>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextLabel}>الصلاة القادمة</Text>
          <Text style={styles.nextName}>{nextPrayer.arabic}</Text>
          <Text style={styles.nextTime}>{formatTime(nextPrayer.time)}</Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{nextPrayer.countdown}</Text>
          </View>
        </View>
      )}

      {loading && !prayerData && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.gold} size="large" />
          <Text style={styles.loadingText}>جارٍ تحميل أوقات الصلاة...</Text>
        </View>
      )}

      {error && !prayerData && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Prayer List */}
      {prayerData && (
        <View style={styles.prayerList}>
          {PRAYER_NAMES.map((prayer) => {
            const time = prayerData.timings[prayer.key as keyof typeof prayerData.timings] || '';
            const passed = isTimePassed(time);
            const isCurrent = nextPrayer?.name === prayer.key;
            const notifOn = notifications[prayer.key] !== false;

            return (
              <View
                key={prayer.key}
                style={[
                  styles.prayerItem,
                  passed && styles.prayerPassed,
                  isCurrent && styles.prayerCurrent,
                ]}
              >
                <View style={styles.prayerLeft}>
                  <Text style={[styles.prayerName, passed && styles.mutedText]}>
                    {prayer.arabic}
                  </Text>
                  <Text style={styles.prayerSunnah}>{prayer.sunnah}</Text>
                </View>
                <Text style={[styles.prayerTime, passed && styles.mutedText]}>
                  {formatTime(time)}
                </Text>
                {prayer.key !== 'Sunrise' && (
                  <TouchableOpacity
                    style={[styles.bellBtn, notifOn && styles.bellBtnOn]}
                    onPress={() => toggleNotif(prayer.key)}
                  >
                    <Text style={styles.bellIcon}>{notifOn ? '🔔' : '🔕'}</Text>
                  </TouchableOpacity>
                )}
                {isCurrent && (
                  <View style={styles.currentDot}>
                    <View style={styles.currentDotInner} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Duha & Qiyam Tracker */}
      <View style={styles.extraCard}>
        <Text style={styles.extraTitle}>عبادات إضافية اليوم</Text>
        {[
          { id: 'duha', label: 'صلاة الضحى', sub: 'ركعتان على الأقل بعد الشروق' },
          { id: 'qiyam', label: 'قيام الليل', sub: 'بعد العشاء قبل الفجر' },
          { id: 'witr', label: 'صلاة الوتر', sub: 'ختام الليل بالوتر' },
          { id: 'fasting', label: 'صيام اليوم', sub: 'اقتداءً بسنة النبي ﷺ' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.extraItem}
            onPress={() => handleCheck(item.id)}
          >
            <View style={[styles.checkBox, dailyChecks[item.id] && styles.checkBoxDone]}>
              {dailyChecks[item.id] && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <View style={styles.extraInfo}>
              <Text style={styles.extraLabel}>{item.label}</Text>
              <Text style={styles.extraSub}>{item.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },
  content: { paddingBottom: 100 },
  header: { padding: SPACING.lg, paddingBottom: SPACING.sm, alignItems: 'center' },
  headerTitle: { fontFamily: FONTS.amiriBold, fontSize: 26, color: COLORS.goldLight, marginBottom: 4 },
  headerSub: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.muted },
  nextPrayerCard: {
    margin: SPACING.lg,
    marginTop: 0,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  nextLabel: { fontFamily: FONTS.cairo, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  nextName: { fontFamily: FONTS.amiriBold, fontSize: 30, color: 'white', marginBottom: 4 },
  nextTime: { fontFamily: FONTS.cairoBold, fontSize: 40, color: 'white', letterSpacing: 2, marginBottom: 8 },
  countdownBadge: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 5 },
  countdownText: { fontFamily: FONTS.cairo, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontFamily: FONTS.cairo, fontSize: 14, color: COLORS.muted, marginTop: 12 },
  errorBox: { margin: SPACING.lg, alignItems: 'center', padding: 20 },
  errorText: { fontFamily: FONTS.cairo, fontSize: 14, color: COLORS.error, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { fontFamily: FONTS.cairoBold, fontSize: 13, color: COLORS.deep },
  prayerList: { marginHorizontal: SPACING.lg, gap: SPACING.sm },
  prayerItem: {
    backgroundColor: COLORS.deep2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.1)',
  },
  prayerPassed: { opacity: 0.5 },
  prayerCurrent: { borderColor: COLORS.gold, backgroundColor: 'rgba(201,146,46,0.08)' },
  prayerLeft: { flex: 1 },
  prayerName: { fontFamily: FONTS.amiri, fontSize: 20, color: COLORS.cream, marginBottom: 2 },
  prayerSunnah: { fontFamily: FONTS.cairo, fontSize: 10, color: COLORS.green3, backgroundColor: 'rgba(46,107,79,0.2)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, alignSelf: 'flex-start' },
  prayerTime: { fontFamily: FONTS.cairoBold, fontSize: 18, color: COLORS.goldLight, marginHorizontal: SPACING.md },
  mutedText: { color: COLORS.muted },
  bellBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(201,146,46,0.1)', alignItems: 'center', justifyContent: 'center' },
  bellBtnOn: { backgroundColor: COLORS.gold },
  bellIcon: { fontSize: 14 },
  currentDot: { position: 'absolute', top: 8, left: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  currentDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  extraCard: {
    margin: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.deep2,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.15)',
  },
  extraTitle: { fontFamily: FONTS.amiriBold, fontSize: 18, color: COLORS.goldLight, marginBottom: SPACING.md },
  extraItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(201,146,46,0.4)', alignItems: 'center', justifyContent: 'center' },
  checkBoxDone: { backgroundColor: COLORS.green2, borderColor: COLORS.green3 },
  checkMark: { fontSize: 13, color: 'white' },
  extraInfo: { flex: 1 },
  extraLabel: { fontFamily: FONTS.cairo, fontSize: 14, color: COLORS.cream2 },
  extraSub: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted },
});
