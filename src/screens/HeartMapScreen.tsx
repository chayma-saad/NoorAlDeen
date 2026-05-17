import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, G, Rect, Text as SvgText, Circle, Defs, ClipPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { toArabicNum } from '../utils/helpers';
import { getQuranJuz, cycleJuzState } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W } = Dimensions.get('window');
const HEART_W = SCREEN_W - 32;
const HEART_H = HEART_W * 1.1;

const SURAHS = [
  { n: 1, ar: 'الفاتحة', juz: 1 }, { n: 2, ar: 'البقرة', juz: 1 },
  { n: 3, ar: 'آل عمران', juz: 3 }, { n: 4, ar: 'النساء', juz: 4 },
  { n: 5, ar: 'المائدة', juz: 6 }, { n: 6, ar: 'الأنعام', juz: 7 },
  { n: 7, ar: 'الأعراف', juz: 8 }, { n: 8, ar: 'الأنفال', juz: 9 },
  { n: 9, ar: 'التوبة', juz: 10 }, { n: 10, ar: 'يونس', juz: 11 },
  { n: 11, ar: 'هود', juz: 11 }, { n: 12, ar: 'يوسف', juz: 12 },
  { n: 13, ar: 'الرعد', juz: 13 }, { n: 14, ar: 'إبراهيم', juz: 13 },
  { n: 15, ar: 'الحجر', juz: 14 }, { n: 16, ar: 'النحل', juz: 14 },
  { n: 17, ar: 'الإسراء', juz: 15 }, { n: 18, ar: 'الكهف', juz: 15 },
  { n: 19, ar: 'مريم', juz: 16 }, { n: 20, ar: 'طه', juz: 16 },
  { n: 21, ar: 'الأنبياء', juz: 17 }, { n: 22, ar: 'الحج', juz: 17 },
  { n: 23, ar: 'المؤمنون', juz: 18 }, { n: 24, ar: 'النور', juz: 18 },
  { n: 25, ar: 'الفرقان', juz: 18 }, { n: 26, ar: 'الشعراء', juz: 19 },
  { n: 27, ar: 'النمل', juz: 19 }, { n: 28, ar: 'القصص', juz: 20 },
  { n: 29, ar: 'العنكبوت', juz: 20 }, { n: 30, ar: 'الروم', juz: 21 },
  { n: 31, ar: 'لقمان', juz: 21 }, { n: 32, ar: 'السجدة', juz: 21 },
  { n: 33, ar: 'الأحزاب', juz: 21 }, { n: 34, ar: 'سبأ', juz: 22 },
  { n: 35, ar: 'فاطر', juz: 22 }, { n: 36, ar: 'يس', juz: 22 },
  { n: 37, ar: 'الصافات', juz: 23 }, { n: 38, ar: 'ص', juz: 23 },
  { n: 39, ar: 'الزمر', juz: 23 }, { n: 40, ar: 'غافر', juz: 24 },
  { n: 41, ar: 'فصلت', juz: 24 }, { n: 42, ar: 'الشورى', juz: 25 },
  { n: 43, ar: 'الزخرف', juz: 25 }, { n: 44, ar: 'الدخان', juz: 25 },
  { n: 45, ar: 'الجاثية', juz: 25 }, { n: 46, ar: 'الأحقاف', juz: 26 },
  { n: 47, ar: 'محمد', juz: 26 }, { n: 48, ar: 'الفتح', juz: 26 },
  { n: 49, ar: 'الحجرات', juz: 26 }, { n: 50, ar: 'ق', juz: 26 },
  { n: 51, ar: 'الذاريات', juz: 26 }, { n: 52, ar: 'الطور', juz: 27 },
  { n: 53, ar: 'النجم', juz: 27 }, { n: 54, ar: 'القمر', juz: 27 },
  { n: 55, ar: 'الرحمن', juz: 27 }, { n: 56, ar: 'الواقعة', juz: 27 },
  { n: 57, ar: 'الحديد', juz: 27 }, { n: 58, ar: 'المجادلة', juz: 28 },
  { n: 59, ar: 'الحشر', juz: 28 }, { n: 60, ar: 'الممتحنة', juz: 28 },
  { n: 61, ar: 'الصف', juz: 28 }, { n: 62, ar: 'الجمعة', juz: 28 },
  { n: 63, ar: 'المنافقون', juz: 28 }, { n: 64, ar: 'التغابن', juz: 28 },
  { n: 65, ar: 'الطلاق', juz: 28 }, { n: 66, ar: 'التحريم', juz: 28 },
  { n: 67, ar: 'الملك', juz: 29 }, { n: 68, ar: 'القلم', juz: 29 },
  { n: 69, ar: 'الحاقة', juz: 29 }, { n: 70, ar: 'المعارج', juz: 29 },
  { n: 71, ar: 'نوح', juz: 29 }, { n: 72, ar: 'الجن', juz: 29 },
  { n: 73, ar: 'المزمل', juz: 29 }, { n: 74, ar: 'المدثر', juz: 29 },
  { n: 75, ar: 'القيامة', juz: 29 }, { n: 76, ar: 'الإنسان', juz: 29 },
  { n: 77, ar: 'المرسلات', juz: 29 }, { n: 78, ar: 'النبأ', juz: 30 },
  { n: 79, ar: 'النازعات', juz: 30 }, { n: 80, ar: 'عبس', juz: 30 },
  { n: 81, ar: 'التكوير', juz: 30 }, { n: 82, ar: 'الانفطار', juz: 30 },
  { n: 83, ar: 'المطففين', juz: 30 }, { n: 84, ar: 'الانشقاق', juz: 30 },
  { n: 85, ar: 'البروج', juz: 30 }, { n: 86, ar: 'الطارق', juz: 30 },
  { n: 87, ar: 'الأعلى', juz: 30 }, { n: 88, ar: 'الغاشية', juz: 30 },
  { n: 89, ar: 'الفجر', juz: 30 }, { n: 90, ar: 'البلد', juz: 30 },
  { n: 91, ar: 'الشمس', juz: 30 }, { n: 92, ar: 'الليل', juz: 30 },
  { n: 93, ar: 'الضحى', juz: 30 }, { n: 94, ar: 'الشرح', juz: 30 },
  { n: 95, ar: 'التين', juz: 30 }, { n: 96, ar: 'العلق', juz: 30 },
  { n: 97, ar: 'القدر', juz: 30 }, { n: 98, ar: 'البينة', juz: 30 },
  { n: 99, ar: 'الزلزلة', juz: 30 }, { n: 100, ar: 'العاديات', juz: 30 },
  { n: 101, ar: 'القارعة', juz: 30 }, { n: 102, ar: 'التكاثر', juz: 30 },
  { n: 103, ar: 'العصر', juz: 30 }, { n: 104, ar: 'الهمزة', juz: 30 },
  { n: 105, ar: 'الفيل', juz: 30 }, { n: 106, ar: 'قريش', juz: 30 },
  { n: 107, ar: 'الماعون', juz: 30 }, { n: 108, ar: 'الكوثر', juz: 30 },
  { n: 109, ar: 'الكافرون', juz: 30 }, { n: 110, ar: 'النصر', juz: 30 },
  { n: 111, ar: 'المسد', juz: 30 }, { n: 112, ar: 'الإخلاص', juz: 30 },
  { n: 113, ar: 'الفلق', juz: 30 }, { n: 114, ar: 'الناس', juz: 30 },
];

type SurahState = 'none' | 'learning' | 'done';
const HEART_STATE_KEY = 'heart_surah_states';

// Pre-computed heart cell positions (114 cells inside heart shape)
function buildHeartPositions(w: number, h: number) {
  const cx = w / 2;
  const cy = h * 0.48;
  const rx = w * 0.44;
  const ry = h * 0.42;
  const positions: { x: number; y: number; width: number; height: number }[] = [];

  const cols = 13;
  const rows = 11;
  const cw = w / (cols + 2);
  const ch = h / (rows + 2);

  function inHeart(px: number, py: number) {
    const tx = (px - cx) / rx;
    const ty = (py - cy) / ry;
    const v = tx * tx + ty * ty - 1;
    return v * v * v - tx * tx * ty * ty * ty < 0.08;
  }

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = (col + 0.5) * (w / (cols + 1));
      const y = (row + 0.5) * (h / (rows + 1)) + h * 0.05;
      if (inHeart(x, y)) {
        positions.push({ x: x - cw / 2 + 1, y: y - ch / 2 + 1, width: cw - 2, height: ch - 2 });
        if (positions.length >= 114) return positions;
      }
    }
  }
  return positions;
}

export default function HeartMapScreen() {
  const [surahStates, setSurahStates] = useState<Record<number, SurahState>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const celebAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStates();
    setPositions(buildHeartPositions(HEART_W, HEART_H));
  }, []);

  const loadStates = async () => {
    try {
      const val = await AsyncStorage.getItem(HEART_STATE_KEY);
      if (val) setSurahStates(JSON.parse(val));
    } catch {}
  };

  const saveStates = async (states: Record<number, SurahState>) => {
    try {
      await AsyncStorage.setItem(HEART_STATE_KEY, JSON.stringify(states));
    } catch {}
  };

  const handleCellPress = (n: number) => {
    if (Platform.OS !== 'web') {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
    setSelected(n);
  };

  const markSurah = async (n: number, state: SurahState) => {
    const newStates = { ...surahStates };
    if (state === 'none') delete newStates[n];
    else newStates[n] = state;
    setSurahStates(newStates);
    await saveStates(newStates);

    if (state === 'done') {
      Animated.sequence([
        Animated.timing(celebAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(celebAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
      if (Platform.OS !== 'web') {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      }
    }
  };

  const getCellColor = (n: number) => {
    const s = surahStates[n];
    if (s === 'done') return COLORS.green3;
    if (s === 'learning') return 'rgba(201,146,46,0.55)';
    return 'rgba(255,255,255,0.07)';
  };

  const getCellStroke = (n: number) => {
    const s = surahStates[n];
    if (s === 'done') return COLORS.green;
    if (s === 'learning') return COLORS.gold;
    return 'rgba(201,146,46,0.18)';
  };

  const doneCount = Object.values(surahStates).filter((s) => s === 'done').length;
  const learningCount = Object.values(surahStates).filter((s) => s === 'learning').length;
  const pct = Math.round((doneCount / 114) * 100);
  const selectedSurah = selected ? SURAHS[selected - 1] : null;
  const selectedState = selected ? surahStates[selected] || 'none' : 'none';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.title}>قلب القرآن الكريم</Text>
      <Text style={styles.sub}>اضغط على كل سورة لتلوينها عند إتمامها 🌿</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{toArabicNum(doneCount)}</Text>
          <Text style={styles.statLabel}>مكتملة</Text>
        </View>
        <View style={[styles.statBox, { borderColor: COLORS.gold }]}>
          <Text style={[styles.statNum, { color: COLORS.gold }]}>{toArabicNum(pct)}٪</Text>
          <Text style={styles.statLabel}>التقدم</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: COLORS.goldLight }]}>{toArabicNum(learningCount)}</Text>
          <Text style={styles.statLabel}>في التعلم</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progOuter}>
        <Animated.View style={[styles.progInner, {
          width: `${pct}%`,
          opacity: celebAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.6, 1] }),
        }]} />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { color: COLORS.green3, label: 'مكتملة' },
          { color: 'rgba(201,146,46,0.55)', label: 'في التعلم' },
          { color: 'rgba(255,255,255,0.1)', label: 'لم تبدأ' },
        ].map((leg) => (
          <View key={leg.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: leg.color }]} />
            <Text style={styles.legendText}>{leg.label}</Text>
          </View>
        ))}
      </View>

      {/* Heart SVG */}
      <View style={styles.heartWrap}>
        <Svg width={HEART_W} height={HEART_H} viewBox={`0 0 ${HEART_W} ${HEART_H}`}>
          <Defs>
            <ClipPath id="heartClip">
              <Path
                d={`M${HEART_W / 2},${HEART_H * 0.88}
                  C${HEART_W / 2},${HEART_H * 0.88} ${HEART_W * 0.08},${HEART_H * 0.62}
                  ${HEART_W * 0.08},${HEART_H * 0.36}
                  C${HEART_W * 0.08},${HEART_H * 0.18} ${HEART_W * 0.23},${HEART_H * 0.1}
                  ${HEART_W * 0.36},${HEART_H * 0.1}
                  C${HEART_W * 0.44},${HEART_H * 0.1} ${HEART_W * 0.49},${HEART_H * 0.16}
                  ${HEART_W / 2},${HEART_H * 0.19}
                  C${HEART_W * 0.51},${HEART_H * 0.16} ${HEART_W * 0.56},${HEART_H * 0.1}
                  ${HEART_W * 0.64},${HEART_H * 0.1}
                  C${HEART_W * 0.77},${HEART_H * 0.1} ${HEART_W * 0.92},${HEART_H * 0.18}
                  ${HEART_W * 0.92},${HEART_H * 0.36}
                  C${HEART_W * 0.92},${HEART_H * 0.62} ${HEART_W / 2},${HEART_H * 0.88}
                  ${HEART_W / 2},${HEART_H * 0.88} Z`}
              />
            </ClipPath>
          </Defs>

          {/* Heart background */}
          <Path
            d={`M${HEART_W / 2},${HEART_H * 0.88}
              C${HEART_W / 2},${HEART_H * 0.88} ${HEART_W * 0.08},${HEART_H * 0.62}
              ${HEART_W * 0.08},${HEART_H * 0.36}
              C${HEART_W * 0.08},${HEART_H * 0.18} ${HEART_W * 0.23},${HEART_H * 0.1}
              ${HEART_W * 0.36},${HEART_H * 0.1}
              C${HEART_W * 0.44},${HEART_H * 0.1} ${HEART_W * 0.49},${HEART_H * 0.16}
              ${HEART_W / 2},${HEART_H * 0.19}
              C${HEART_W * 0.51},${HEART_H * 0.16} ${HEART_W * 0.56},${HEART_H * 0.1}
              ${HEART_W * 0.64},${HEART_H * 0.1}
              C${HEART_W * 0.77},${HEART_H * 0.1} ${HEART_W * 0.92},${HEART_H * 0.18}
              ${HEART_W * 0.92},${HEART_H * 0.36}
              C${HEART_W * 0.92},${HEART_H * 0.62} ${HEART_W / 2},${HEART_H * 0.88}
              ${HEART_W / 2},${HEART_H * 0.88} Z`}
            fill="rgba(13,27,42,0.98)"
            stroke="rgba(201,146,46,0.35)"
            strokeWidth="1.5"
          />

          {/* Surah cells */}
          <G clipPath="url(#heartClip)">
            {positions.slice(0, 114).map((pos, i) => {
              const surah = SURAHS[i];
              const isSelected = selected === surah.n;
              const shortName = surah.ar.length > 5 ? surah.ar.slice(0, 4) : surah.ar;
              return (
                <G key={surah.n} onPress={() => handleCellPress(surah.n)}>
                  <Rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.width}
                    height={pos.height}
                    rx={3}
                    fill={getCellColor(surah.n)}
                    stroke={isSelected ? COLORS.goldLight : getCellStroke(surah.n)}
                    strokeWidth={isSelected ? 1.5 : 0.5}
                  />
                  <SvgText
                    x={pos.x + pos.width / 2}
                    y={pos.y + pos.height / 2 + 3}
                    textAnchor="middle"
                    fontFamily="Cairo"
                    fontSize={6.5}
                    fill={surahStates[surah.n] === 'done' ? COLORS.deep : 'rgba(245,237,216,0.8)'}
                  >
                    {shortName}
                  </SvgText>
                </G>
              );
            })}
          </G>

          {/* Bismillah */}
          <SvgText
            x={HEART_W / 2}
            y={HEART_H * 0.06}
            textAnchor="middle"
            fontFamily="Amiri"
            fontSize={12}
            fill="rgba(201,146,46,0.6)"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </SvgText>
        </Svg>
      </View>

      {/* Selected Surah Detail */}
      {selectedSurah ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>سورة {selectedSurah.ar}</Text>
            <Text style={styles.detailMeta}>
              رقم {toArabicNum(selectedSurah.n)} · الجزء {toArabicNum(selectedSurah.juz)}
            </Text>
          </View>
          <Text style={styles.detailStatus}>
            الحالة:{' '}
            {selectedState === 'done' ? '✅ مكتملة' : selectedState === 'learning' ? '🔄 في التعلم' : '⬜ لم تبدأ'}
          </Text>
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={[styles.actionBtn, selectedState === 'done' && styles.actionBtnActive]}
              onPress={() => markSurah(selectedSurah.n, 'done')}
            >
              <Text style={styles.actionBtnText}>✅ أتممتها</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnAmber]}
              onPress={() => markSurah(selectedSurah.n, 'learning')}
            >
              <Text style={styles.actionBtnText}>🔄 في التعلم</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnReset]}
              onPress={() => markSurah(selectedSurah.n, 'none')}
            >
              <Text style={[styles.actionBtnText, { color: COLORS.muted }]}>إعادة</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.hintCard}>
          <Text style={styles.hintText}>اضغط على أي خلية في القلب لعرض تفاصيل السورة</Text>
        </View>
      )}

      {/* Motivational quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteArabic}>«وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا»</Text>
        <Text style={styles.quoteRef}>النساء: ١١٣</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },
  title: { fontFamily: FONTS.amiriBold, fontSize: 24, color: COLORS.goldLight, textAlign: 'center', paddingTop: SPACING.lg, marginBottom: 4 },
  sub: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted, textAlign: 'center', marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', marginHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.sm },
  statBox: { flex: 1, backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,146,46,0.15)' },
  statNum: { fontFamily: FONTS.cairoBold, fontSize: 22, color: COLORS.green3 },
  statLabel: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 2 },
  progOuter: { marginHorizontal: SPACING.lg, height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: SPACING.sm },
  progInner: { height: 5, backgroundColor: COLORS.green3, borderRadius: 3 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted },
  heartWrap: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, alignItems: 'center' },
  detailCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.deep2, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.2)', marginBottom: SPACING.md },
  detailHeader: { marginBottom: SPACING.sm },
  detailTitle: { fontFamily: FONTS.amiriBold, fontSize: 22, color: COLORS.goldLight },
  detailMeta: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted, marginTop: 3 },
  detailStatus: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.cream3, marginBottom: SPACING.md },
  actionBtns: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  actionBtn: { backgroundColor: COLORS.green2, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 9 },
  actionBtnActive: { backgroundColor: COLORS.green, borderWidth: 1.5, borderColor: COLORS.green3 },
  actionBtnAmber: { backgroundColor: 'rgba(201,146,46,0.25)' },
  actionBtnReset: { backgroundColor: 'rgba(255,255,255,0.06)' },
  actionBtnText: { fontFamily: FONTS.cairoBold, fontSize: 13, color: 'white' },
  hintCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  hintText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  quoteCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: 'rgba(201,146,46,0.05)', borderRightWidth: 3, borderRightColor: COLORS.gold, borderRadius: RADIUS.sm, padding: SPACING.lg },
  quoteArabic: { fontFamily: FONTS.amiriBold, fontSize: 18, color: COLORS.cream, lineHeight: 32 },
  quoteRef: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted, marginTop: 4 },
});
