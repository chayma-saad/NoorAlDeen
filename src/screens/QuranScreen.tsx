import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { FONTS, SPACING, RADIUS, ThemeColors } from '../constants/theme';
import { QURAN_PORTIONS } from '../constants/islamicData';
import { toArabicNum } from '../utils/helpers';
import { getQuranJuz, cycleJuzState, getDailyChecks, toggleDailyCheck } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function QuranScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [juzProgress, setJuzProgress] = useState<Record<number, 'done' | 'partial' | 'none'>>({});
  const [portionChecks, setPortionChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const juz = await getQuranJuz();
    const checks = await getDailyChecks();
    setJuzProgress(juz);
    setPortionChecks(checks);
  };

  const handleJuzTap = async (juzNum: number) => {
    const newState = await cycleJuzState(juzNum);
    setJuzProgress((prev) => ({ ...prev, [juzNum]: newState }));
  };

  const handlePortionCheck = async (id: string) => {
    const newVal = await toggleDailyCheck(id);
    setPortionChecks((prev) => ({ ...prev, [id]: newVal }));
  };

  const doneCount = Object.values(juzProgress).filter((s) => s === 'done').length;
  const partialCount = Object.values(juzProgress).filter((s) => s === 'partial').length;
  const totalProgress = doneCount + partialCount * 0.5;
  const pct = Math.round((totalProgress / 30) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.screenTitle}>متتبع القرآن الكريم</Text>

      {/* Overall Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>تقدم الختمة</Text>
          <Text style={styles.progressPct}>{toArabicNum(pct)}٪</Text>
        </View>
        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { width: `${pct}%` }]} />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressStat}>
            ✅ {toArabicNum(doneCount)} جزء مكتمل
          </Text>
          <Text style={styles.progressStat}>
            🔄 {toArabicNum(partialCount)} جزء جزئي
          </Text>
          <Text style={styles.progressStat}>
            📖 من ٣٠ جزء
          </Text>
        </View>
        <Text style={styles.progressHint}>اضغط على الجزء: مرة = جزئي · مرتين = مكتمل · ثلاثة = إعادة</Text>
      </View>

      {/* Juz Grid */}
      <Text style={styles.sectionTitle}>الأجزاء الثلاثون</Text>
      <View style={styles.juzGrid}>
        {Array.from({ length: 30 }).map((_, i) => {
          const juzNum = i + 1;
          const state = juzProgress[juzNum] || 'none';
          return (
            <TouchableOpacity
              key={juzNum}
              style={[
                styles.juzCell,
                state === 'done' && styles.juzCellDone,
                state === 'partial' && styles.juzCellPartial,
              ]}
              onPress={() => handleJuzTap(juzNum)}
            >
              <Text style={[styles.juzNum, state === 'done' && styles.juzNumDone]}>
                {toArabicNum(juzNum)}
              </Text>
              <Text style={styles.juzLabel}>
                {state === 'done' ? '✓' : state === 'partial' ? '◑' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quran Portions */}
      <View style={styles.portionsCard}>
        <Text style={styles.sectionTitle}>مقاطع التلاوة والحفظ</Text>
        <Text style={styles.portionsHint}>قسّم القرآن إلى ٨ مقاطع لسهولة الختم</Text>
        {QURAN_PORTIONS.map((portion, i) => {
          const id = `portion_${i}`;
          const done = portionChecks[id];
          return (
            <TouchableOpacity key={i} style={styles.portionItem} onPress={() => handlePortionCheck(id)}>
              <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                {done && <Text style={styles.taskCheckMark}>✓</Text>}
              </View>
              <View style={styles.portionInfo}>
                <Text style={[styles.portionText, done && styles.portionTextDone]}>
                  من {portion.from} إلى {portion.to}
                </Text>
                <Text style={styles.portionJuz}>
                  الجزء {toArabicNum(portion.juzFrom)} — {toArabicNum(portion.juzTo)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Daily Quran Goals */}
      <View style={styles.goalsCard}>
        <Text style={styles.sectionTitle}>أهداف اليوم القرآنية</Text>
        {[
          { id: 'quran_fajr', label: 'ورد الفجر', sub: 'تلاوة بعد صلاة الفجر' },
          { id: 'quran_morning', label: 'ورد الصباح', sub: 'ربع حزب على الأقل' },
          { id: 'quran_evening', label: 'ورد المساء', sub: 'قبل المغرب' },
          { id: 'quran_night', label: 'قيام الليل', sub: 'تلاوة في صلاة الليل' },
          { id: 'quran_tadabbur', label: 'التدبر والتفسير', sub: 'فهم المعاني' },
        ].map((goal) => {
          const done = portionChecks[goal.id];
          return (
            <TouchableOpacity key={goal.id} style={styles.goalItem} onPress={() => handlePortionCheck(goal.id)}>
              <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                {done && <Text style={styles.taskCheckMark}>✓</Text>}
              </View>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalLabel, done && styles.goalLabelDone]}>{goal.label}</Text>
                <Text style={styles.goalSub}>{goal.sub}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          «إن هذا القرآن يهدي للتي هي أقوم»
        </Text>
        <Text style={styles.quoteRef}>سورة الإسراء، آية ٩</Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.deep },
  screenTitle: { fontFamily: FONTS.amiriBold, fontSize: 22, color: colors.goldLight, padding: SPACING.lg, paddingBottom: SPACING.sm },
  progressCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.15)' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  progressLabel: { fontFamily: FONTS.amiri, fontSize: 18, color: colors.cream },
  progressPct: { fontFamily: FONTS.cairoBold, fontSize: 20, color: colors.gold },
  progressBarOuter: { height: 8, backgroundColor: colors.bgTint, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
  progressBarInner: { height: 8, backgroundColor: colors.green3, borderRadius: 4 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressStat: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.muted },
  progressHint: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontFamily: FONTS.amiriBold, fontSize: 17, color: colors.goldLight, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  juzGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: 6, marginBottom: SPACING.lg },
  juzCell: { width: '17%', aspectRatio: 1, backgroundColor: colors.deep2, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)', alignItems: 'center', justifyContent: 'center' },
  juzCellDone: { backgroundColor: 'rgba(46,107,79,0.2)', borderColor: colors.green2 },
  juzCellPartial: { backgroundColor: 'rgba(201,146,46,0.08)', borderColor: 'rgba(201,146,46,0.3)' },
  juzNum: { fontFamily: FONTS.cairo, fontSize: 13, color: colors.cream2 },
  juzNumDone: { color: colors.green3 },
  juzLabel: { fontSize: 10, color: colors.green3 },
  portionsCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)' },
  portionsHint: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted, marginBottom: SPACING.md },
  portionItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: colors.borderTint },
  portionInfo: { flex: 1 },
  portionText: { fontFamily: FONTS.amiri, fontSize: 16, color: colors.cream2 },
  portionTextDone: { color: colors.muted, textDecorationLine: 'line-through' },
  portionJuz: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.muted },
  goalsCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: colors.deep2, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)' },
  goalItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: colors.borderTint },
  goalInfo: { flex: 1 },
  goalLabel: { fontFamily: FONTS.cairo, fontSize: 14, color: colors.cream2 },
  goalLabelDone: { color: colors.muted, textDecorationLine: 'line-through' },
  goalSub: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.muted },
  taskCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(201,146,46,0.35)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  taskCheckDone: { backgroundColor: colors.green2, borderColor: colors.green3 },
  taskCheckMark: { fontSize: 12, color: 'white' },
  quoteCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: 'rgba(201,146,46,0.05)', borderRightWidth: 3, borderRightColor: colors.gold, borderRadius: RADIUS.sm, padding: SPACING.lg },
  quoteText: { fontFamily: FONTS.amiriBold, fontSize: 18, color: colors.cream, lineHeight: 32, marginBottom: 6 },
  quoteRef: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted },
});
