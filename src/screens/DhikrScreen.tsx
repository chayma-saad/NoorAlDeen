import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Vibration,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING, RADIUS, ThemeColors } from '../constants/theme';
import {
  DHIKR_LIST,
  MORNING_ADHKAR,
  EVENING_ADHKAR,
  AFTER_PRAYER_ADHKAR,
} from '../constants/islamicData';
import { toArabicNum } from '../utils/helpers';
import { getDhikrCounts, setDhikrCount, getDailyChecks, toggleDailyCheck } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function DhikrScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [activeDhikr, setActiveDhikr] = useState(DHIKR_LIST[0]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [dailyChecks, setDailyChecks] = useState<Record<string, boolean>>({});
  const [celebration, setCelebration] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const c = await getDhikrCounts();
    const d = await getDailyChecks();
    setCounts(c);
    setDailyChecks(d);
  };

  const currentCount = counts[activeDhikr.id] || 0;
  const progress = Math.min(currentCount / activeDhikr.target, 1);

  const tapCounter = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }

    const newCount = currentCount + 1;
    const newCounts = { ...counts, [activeDhikr.id]: newCount };
    setCounts(newCounts);
    await setDhikrCount(activeDhikr.id, newCount);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.08, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (newCount === activeDhikr.target) {
      setCelebration(true);
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ]).start(() => setCelebration(false));
      if (Platform.OS !== 'web') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      }
    }
  };

  const resetCounter = async () => {
    const newCounts = { ...counts, [activeDhikr.id]: 0 };
    setCounts(newCounts);
    await setDhikrCount(activeDhikr.id, 0);
  };

  const handleDailyCheck = async (checkId: string) => {
    const newVal = await toggleDailyCheck(checkId);
    setDailyChecks((prev) => ({ ...prev, [checkId]: newVal }));
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(201,146,46,0)', 'rgba(201,146,46,0.3)'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.screenTitle}>متتبع الأذكار</Text>

      {/* Counter Widget */}
      <Animated.View style={[styles.counterWidget, { backgroundColor: glowColor as any }]}>
        <Text style={styles.counterName}>{activeDhikr.text}</Text>
        <Text style={styles.counterTranslit}>{activeDhikr.transliteration}</Text>

        <TouchableOpacity onPress={tapCounter} activeOpacity={0.85}>
          <Animated.View style={[styles.counterCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.counterNum}>{toArabicNum(currentCount)}</Text>
            <Text style={styles.counterTarget}>من {toArabicNum(activeDhikr.target)}</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, { width: `${progress * 100}%` }]} />
        </View>

        {celebration && (
          <View style={styles.celebrationBadge}>
            <Text style={styles.celebrationText}>🎉 اكتمل الذكر! بارك الله فيك</Text>
          </View>
        )}

        <View style={styles.counterBtns}>
          <TouchableOpacity style={styles.tapBtn} onPress={tapCounter}>
            <Text style={styles.tapBtnText}>تسبيح  +١</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={resetCounter}>
            <Text style={styles.resetBtnText}>إعادة</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Dhikr Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dhikrSelector} contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8 }}>
        {DHIKR_LIST.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[styles.dhikrPill, activeDhikr.id === d.id && styles.dhikrPillActive]}
            onPress={() => setActiveDhikr(d)}
          >
            <Text style={[styles.dhikrPillText, activeDhikr.id === d.id && styles.dhikrPillTextActive]}>
              {d.text}
            </Text>
            {(counts[d.id] || 0) >= d.target && (
              <Text style={styles.dhikrPillDone}> ✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* All Dhikr Progress */}
      <View style={styles.allDhikrCard}>
        <Text style={styles.sectionTitle}>تقدم الأذكار اليومية</Text>
        {DHIKR_LIST.map((d) => {
          const c = counts[d.id] || 0;
          const p = Math.min(c / d.target, 1);
          return (
            <TouchableOpacity key={d.id} style={styles.dhikrRow} onPress={() => setActiveDhikr(d)}>
              <Text style={styles.dhikrRowText}>{d.text}</Text>
              <View style={styles.dhikrRowProgress}>
                <View style={[styles.dhikrRowBar, { width: `${p * 100}%` }]} />
              </View>
              <Text style={styles.dhikrRowCount}>
                {toArabicNum(c)}/{toArabicNum(d.target)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Morning Adhkar */}
      <AdhkarSection
        title="أذكار الصباح"
        icon="🌅"
        items={MORNING_ADHKAR}
        prefix="morning"
        checks={dailyChecks}
        onCheck={handleDailyCheck}
      />

      {/* Evening Adhkar */}
      <AdhkarSection
        title="أذكار المساء"
        icon="🌆"
        items={EVENING_ADHKAR}
        prefix="evening"
        checks={dailyChecks}
        onCheck={handleDailyCheck}
      />

      {/* After Prayer Adhkar */}
      <AdhkarSection
        title="أذكار بعد الصلاة"
        icon="🕌"
        items={AFTER_PRAYER_ADHKAR}
        prefix="afterprayer"
        checks={dailyChecks}
        onCheck={handleDailyCheck}
      />

      {/* Sleep Adhkar */}
      <AdhkarSection
        title="أذكار النوم"
        icon="🌙"
        items={['آية الكرسي قبل النوم', 'سورة الإخلاص والمعوذتان', 'التسبيح ٣٣ مرة', 'التحميد ٣٣ مرة', 'التكبير ٣٤ مرة', 'دعاء النوم']}
        prefix="sleep"
        checks={dailyChecks}
        onCheck={handleDailyCheck}
      />
    </ScrollView>
  );
}

interface AdhkarSectionProps {
  title: string;
  icon: string;
  items: string[];
  prefix: string;
  checks: Record<string, boolean>;
  onCheck: (id: string) => void;
}

function AdhkarSection({ title, icon, items, prefix, checks, onCheck }: AdhkarSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const done = items.filter((_, i) => checks[`${prefix}_${i}`]).length;
  return (
    <View style={styles.adhkarSection}>
      <View style={styles.adhkarHeader}>
        <Text style={styles.adhkarIcon}>{icon}</Text>
        <Text style={styles.adhkarTitle}>{title}</Text>
        <Text style={styles.adhkarProgress}>{toArabicNum(done)}/{toArabicNum(items.length)}</Text>
      </View>
      {items.map((item, i) => {
        const id = `${prefix}_${i}`;
        const isDone = checks[id];
        return (
          <TouchableOpacity key={i} style={styles.adhkarItem} onPress={() => onCheck(id)}>
            <View style={[styles.taskCheck, isDone && styles.taskCheckDone]}>
              {isDone && <Text style={styles.taskCheckMark}>✓</Text>}
            </View>
            <Text style={[styles.adhkarItemText, isDone && styles.adhkarItemDone]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.deep },
  screenTitle: { fontFamily: FONTS.amiriBold, fontSize: 22, color: colors.goldLight, padding: SPACING.lg, paddingBottom: SPACING.sm },
  counterWidget: { margin: SPACING.lg, marginTop: 0, backgroundColor: colors.deep2, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,146,46,0.2)' },
  counterName: { fontFamily: FONTS.amiriBold, fontSize: 26, color: colors.cream, marginBottom: 4 },
  counterTranslit: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted, marginBottom: SPACING.lg },
  counterCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(201,146,46,0.1)', borderWidth: 2, borderColor: 'rgba(201,146,46,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  counterNum: { fontFamily: FONTS.cairoBold, fontSize: 56, color: colors.goldLight, lineHeight: 64 },
  counterTarget: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted },
  progressOuter: { width: '100%', height: 6, backgroundColor: colors.bgTint, borderRadius: 3, overflow: 'hidden', marginBottom: SPACING.lg },
  progressInner: { height: 6, backgroundColor: colors.gold, borderRadius: 3 },
  celebrationBadge: { backgroundColor: 'rgba(46,107,79,0.2)', borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 6, marginBottom: SPACING.md },
  celebrationText: { fontFamily: FONTS.cairo, fontSize: 13, color: colors.green3 },
  counterBtns: { flexDirection: 'row', gap: SPACING.md },
  tapBtn: { backgroundColor: colors.gold, borderRadius: RADIUS.full, paddingHorizontal: 28, paddingVertical: 12 },
  tapBtnText: { fontFamily: FONTS.cairoBold, fontSize: 16, color: colors.deep },
  resetBtn: { backgroundColor: colors.bgTint, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 12 },
  resetBtnText: { fontFamily: FONTS.cairo, fontSize: 14, color: colors.muted },
  dhikrSelector: { marginBottom: SPACING.md },
  dhikrPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(201,146,46,0.25)', backgroundColor: colors.deep2 },
  dhikrPillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  dhikrPillText: { fontFamily: FONTS.amiri, fontSize: 14, color: colors.muted },
  dhikrPillTextActive: { color: colors.deep, fontFamily: FONTS.amiriBold },
  dhikrPillDone: { color: colors.green3 },
  allDhikrCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)' },
  sectionTitle: { fontFamily: FONTS.amiriBold, fontSize: 17, color: colors.goldLight, marginBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.15)', paddingBottom: SPACING.sm },
  dhikrRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: colors.borderTint },
  dhikrRowText: { fontFamily: FONTS.amiri, fontSize: 14, color: colors.cream2, width: 130 },
  dhikrRowProgress: { flex: 1, height: 4, backgroundColor: colors.bgTint, borderRadius: 2, overflow: 'hidden' },
  dhikrRowBar: { height: 4, backgroundColor: colors.green3, borderRadius: 2 },
  dhikrRowCount: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.muted, width: 48, textAlign: 'left' },
  adhkarSection: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)' },
  adhkarHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, backgroundColor: 'rgba(201,146,46,0.06)', borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.12)' },
  adhkarIcon: { fontSize: 18 },
  adhkarTitle: { fontFamily: FONTS.amiriBold, fontSize: 17, color: colors.goldLight, flex: 1 },
  adhkarProgress: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted },
  adhkarItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: colors.borderTint },
  adhkarItemText: { fontFamily: FONTS.cairo, fontSize: 13, color: colors.cream2, flex: 1 },
  adhkarItemDone: { color: colors.muted, textDecorationLine: 'line-through' },
  taskCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(201,146,46,0.35)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  taskCheckDone: { backgroundColor: colors.green2, borderColor: colors.green3 },
  taskCheckMark: { fontSize: 12, color: 'white' },
});
