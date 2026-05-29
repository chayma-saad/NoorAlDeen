import React, { useState, useEffect, useMemo } from 'react';
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
import { FONTS, SPACING, RADIUS, ThemeColors } from '../constants/theme';
import { PRAYER_NAMES } from '../constants/islamicData';
import { formatTime, isTimePassed, toArabicNum } from '../utils/helpers';
import {
  getPrayerNotifications,
  setPrayerNotification,
  getDailyChecks,
  toggleDailyCheck,
} from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙', Sunrise: '🌅', Dhuhr: '☀️', Asr: '🌤', Maghrib: '🌆', Isha: '🌃',
};

export default function PrayerTimesScreen() {
  const { colors, mode, toggle } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { prayerData, loading, error, nextPrayer, reload } = usePrayerTimes();
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [dailyChecks, setDailyChecks] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadSettings(); }, []);

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

  const hijri = prayerData?.date.hijri;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerDecor}>✦ ركز على دينك ✦</Text>
        {hijri && (
          <Text style={styles.headerDate}>
            {hijri.weekday.ar} · {toArabicNum(parseInt(hijri.day))} {hijri.month.ar} {toArabicNum(parseInt(hijri.year))} هـ
          </Text>
        )}
        {/* Theme toggle */}
        <TouchableOpacity style={styles.themeToggle} onPress={toggle}>
          <Text style={styles.themeToggleIcon}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Next Prayer Hero */}
      {nextPrayer ? (
        <View style={styles.heroCard}>
          <Text style={styles.ornamentTL}>❧</Text>
          <Text style={styles.ornamentTR}>❧</Text>
          <Text style={styles.heroLabel}>الصلاة القادمة</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroIcon}>{PRAYER_ICONS[nextPrayer.name] || '🕌'}</Text>
          <Text style={styles.heroName}>{nextPrayer.arabic}</Text>
          <Text style={styles.heroTime}>{formatTime(nextPrayer.time)}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{nextPrayer.countdown}</Text>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loadingText}>جارٍ تحميل أوقات الصلاة...</Text>
        </View>
      ) : null}

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
        <View style={styles.prayerCard}>
          <Text style={styles.sectionLabel}>مواقيت الصلاة</Text>
          <View style={styles.separator} />
          {PRAYER_NAMES.map((prayer) => {
            const time = prayerData.timings[prayer.key as keyof typeof prayerData.timings] || '';
            const passed = isTimePassed(time);
            const isCurrent = nextPrayer?.name === prayer.key;
            const notifOn = notifications[prayer.key] !== false;
            return (
              <View key={prayer.key} style={[styles.prayerRow, isCurrent && styles.prayerRowActive, passed && !isCurrent && styles.prayerRowPassed]}>
                {isCurrent && <View style={styles.activeBar} />}
                <Text style={styles.prayerRowIcon}>{PRAYER_ICONS[prayer.key] || '🕌'}</Text>
                <View style={styles.prayerRowMeta}>
                  <Text style={[styles.prayerRowName, passed && !isCurrent && styles.mutedText, isCurrent && styles.activeText]}>
                    {prayer.arabic}
                  </Text>
                  <Text style={styles.prayerSunnah}>{prayer.sunnah}</Text>
                </View>
                <Text style={[styles.prayerRowTime, passed && !isCurrent && styles.mutedText, isCurrent && styles.activeText]}>
                  {formatTime(time)}
                </Text>
                {prayer.key !== 'Sunrise' && (
                  <TouchableOpacity style={[styles.bellBtn, notifOn && styles.bellBtnOn]} onPress={() => toggleNotif(prayer.key)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.bellIcon}>{notifOn ? '🔔' : '🔕'}</Text>
                  </TouchableOpacity>
                )}
                {passed && !isCurrent && <Text style={styles.passedMark}>✓</Text>}
              </View>
            );
          })}
        </View>
      )}

      {/* Daily Sunnah Tracker */}
      <View style={styles.sunnahCard}>
        <Text style={styles.sectionLabel}>عبادات إضافية</Text>
        <View style={styles.separator} />
        {[
          { id: 'duha',    label: 'صلاة الضحى',  sub: 'ركعتان على الأقل بعد الشروق', icon: '🌤' },
          { id: 'qiyam',  label: 'قيام الليل',   sub: 'بعد العشاء قبل الفجر',        icon: '🌙' },
          { id: 'witr',   label: 'صلاة الوتر',   sub: 'ختام الليل بالوتر',           icon: '⭐' },
          { id: 'fasting',label: 'صيام اليوم',   sub: 'اقتداءً بسنة النبي ﷺ',       icon: '🤍' },
        ].map((item) => {
          const done = dailyChecks[item.id];
          return (
            <TouchableOpacity key={item.id} style={[styles.sunnahItem, done && styles.sunnahItemDone]} onPress={() => handleCheck(item.id)} activeOpacity={0.75}>
              <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
                {done ? <Text style={styles.checkMark}>✓</Text> : <Text style={styles.sunnahItemIcon}>{item.icon}</Text>}
              </View>
              <View style={styles.sunnahInfo}>
                <Text style={[styles.sunnahLabel, done && styles.sunnahLabelDone]}>{item.label}</Text>
                <Text style={styles.sunnahSub}>{item.sub}</Text>
              </View>
              {done && <Text style={styles.doneBadge}>أنجزت</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.deep },
  content: { paddingBottom: 100 },

  header: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.lg, position: 'relative' },
  headerDecor: { fontFamily: FONTS.amiriBold, fontSize: 22, color: colors.goldLight, letterSpacing: 2, marginBottom: 6 },
  headerDate: { fontFamily: FONTS.cairo, fontSize: 13, color: colors.muted },
  themeToggle: { position: 'absolute', top: SPACING.xl, left: SPACING.lg, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.deep2, borderWidth: 1, borderColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  themeToggleIcon: { fontSize: 18 },

  heroCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: colors.deep2, borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', borderWidth: 1, borderColor: colors.gold, position: 'relative', overflow: 'hidden' },
  ornamentTL: { position: 'absolute', top: 10, right: 14, color: colors.goldDark, fontSize: 20, transform: [{ scaleX: -1 }] },
  ornamentTR: { position: 'absolute', top: 10, left: 14, color: colors.goldDark, fontSize: 20 },
  heroLabel: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted, letterSpacing: 1, marginBottom: 8 },
  heroDivider: { width: 40, height: 1, backgroundColor: colors.gold, opacity: 0.4, marginBottom: 12 },
  heroIcon: { fontSize: 36, marginBottom: 6 },
  heroName: { fontFamily: FONTS.amiriBold, fontSize: 34, color: colors.goldLight, marginBottom: 4 },
  heroTime: { fontFamily: FONTS.cairoBold, fontSize: 48, color: colors.cream, letterSpacing: 2, marginBottom: 14 },
  heroBadge: { backgroundColor: colors.goldSoft, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(201,146,46,0.3)' },
  heroBadgeText: { fontFamily: FONTS.cairoSemiBold, fontSize: 14, color: colors.goldLight },

  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontFamily: FONTS.cairo, fontSize: 14, color: colors.muted, marginTop: 14 },
  errorBox: { margin: SPACING.lg, alignItems: 'center', padding: 20 },
  errorText: { fontFamily: FONTS.cairo, fontSize: 14, color: colors.error, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: colors.gold, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { fontFamily: FONTS.cairoBold, fontSize: 13, color: colors.deep },

  prayerCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)' },
  sectionLabel: { fontFamily: FONTS.cairoSemiBold, fontSize: 12, color: colors.gold, letterSpacing: 2, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  separator: { height: 1, backgroundColor: 'rgba(201,146,46,0.12)', marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },

  prayerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, gap: SPACING.sm, position: 'relative', borderBottomWidth: 1, borderBottomColor: colors.borderTint },
  prayerRowActive: { backgroundColor: 'rgba(201,146,46,0.07)' },
  prayerRowPassed: { opacity: 0.45 },
  activeBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, backgroundColor: colors.gold, borderRadius: 2 },
  prayerRowIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  prayerRowMeta: { flex: 1 },
  prayerRowName: { fontFamily: FONTS.amiri, fontSize: 20, color: colors.cream, marginBottom: 1 },
  prayerSunnah: { fontFamily: FONTS.cairo, fontSize: 10, color: colors.green3, backgroundColor: colors.greenGlow, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, alignSelf: 'flex-start' },
  prayerRowTime: { fontFamily: FONTS.cairoBold, fontSize: 17, color: colors.goldLight },
  activeText: { color: colors.gold },
  mutedText: { color: colors.muted },
  bellBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  bellBtnOn: { backgroundColor: colors.gold },
  bellIcon: { fontSize: 13 },
  passedMark: { fontSize: 12, color: colors.green3, marginLeft: 4 },

  sunnahCard: { marginHorizontal: SPACING.lg, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)', marginBottom: SPACING.lg },
  sunnahItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: colors.borderTint },
  sunnahItemDone: { backgroundColor: 'rgba(60,168,124,0.06)' },
  checkCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(201,146,46,0.3)', alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: colors.green2, borderColor: colors.green3 },
  checkMark: { fontSize: 14, color: 'white' },
  sunnahItemIcon: { fontSize: 16 },
  sunnahInfo: { flex: 1 },
  sunnahLabel: { fontFamily: FONTS.cairoSemiBold, fontSize: 14, color: colors.cream2 },
  sunnahLabelDone: { color: colors.green3 },
  sunnahSub: { fontFamily: FONTS.cairoLight, fontSize: 11, color: colors.muted },
  doneBadge: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.green3, backgroundColor: colors.greenGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
});
