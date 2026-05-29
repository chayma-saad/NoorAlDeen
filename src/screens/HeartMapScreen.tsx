import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Dimensions, TextInput, Platform, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS, SPACING, RADIUS, ThemeColors } from '../constants/theme';
import { toArabicNum } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';

const { width: SW } = Dimensions.get('window');
const STATE_KEY = 'quran_map_v2';

const SURAHS = [
  {n:1,ar:'الفاتحة',pages:1,juz:1},{n:2,ar:'البقرة',pages:49,juz:1},
  {n:3,ar:'آل عمران',pages:20,juz:3},{n:4,ar:'النساء',pages:24,juz:4},
  {n:5,ar:'المائدة',pages:17,juz:6},{n:6,ar:'الأنعام',pages:21,juz:7},
  {n:7,ar:'الأعراف',pages:25,juz:8},{n:8,ar:'الأنفال',pages:9,juz:9},
  {n:9,ar:'التوبة',pages:21,juz:10},{n:10,ar:'يونس',pages:11,juz:11},
  {n:11,ar:'هود',pages:11,juz:11},{n:12,ar:'يوسف',pages:12,juz:12},
  {n:13,ar:'الرعد',pages:6,juz:13},{n:14,ar:'إبراهيم',pages:7,juz:13},
  {n:15,ar:'الحجر',pages:6,juz:14},{n:16,ar:'النحل',pages:13,juz:14},
  {n:17,ar:'الإسراء',pages:12,juz:15},{n:18,ar:'الكهف',pages:12,juz:15},
  {n:19,ar:'مريم',pages:7,juz:16},{n:20,ar:'طه',pages:9,juz:16},
  {n:21,ar:'الأنبياء',pages:11,juz:17},{n:22,ar:'الحج',pages:9,juz:17},
  {n:23,ar:'المؤمنون',pages:9,juz:18},{n:24,ar:'النور',pages:9,juz:18},
  {n:25,ar:'الفرقان',pages:7,juz:18},{n:26,ar:'الشعراء',pages:11,juz:19},
  {n:27,ar:'النمل',pages:9,juz:19},{n:28,ar:'القصص',pages:10,juz:20},
  {n:29,ar:'العنكبوت',pages:7,juz:20},{n:30,ar:'الروم',pages:6,juz:21},
  {n:31,ar:'لقمان',pages:4,juz:21},{n:32,ar:'السجدة',pages:3,juz:21},
  {n:33,ar:'الأحزاب',pages:9,juz:21},{n:34,ar:'سبأ',pages:6,juz:22},
  {n:35,ar:'فاطر',pages:5,juz:22},{n:36,ar:'يس',pages:5,juz:22},
  {n:37,ar:'الصافات',pages:7,juz:23},{n:38,ar:'ص',pages:5,juz:23},
  {n:39,ar:'الزمر',pages:8,juz:23},{n:40,ar:'غافر',pages:9,juz:24},
  {n:41,ar:'فصلت',pages:7,juz:24},{n:42,ar:'الشورى',pages:7,juz:25},
  {n:43,ar:'الزخرف',pages:7,juz:25},{n:44,ar:'الدخان',pages:3,juz:25},
  {n:45,ar:'الجاثية',pages:4,juz:25},{n:46,ar:'الأحقاف',pages:5,juz:26},
  {n:47,ar:'محمد',pages:4,juz:26},{n:48,ar:'الفتح',pages:4,juz:26},
  {n:49,ar:'الحجرات',pages:3,juz:26},{n:50,ar:'ق',pages:3,juz:26},
  {n:51,ar:'الذاريات',pages:3,juz:26},{n:52,ar:'الطور',pages:3,juz:27},
  {n:53,ar:'النجم',pages:3,juz:27},{n:54,ar:'القمر',pages:3,juz:27},
  {n:55,ar:'الرحمن',pages:3,juz:27},{n:56,ar:'الواقعة',pages:4,juz:27},
  {n:57,ar:'الحديد',pages:5,juz:27},{n:58,ar:'المجادلة',pages:4,juz:28},
  {n:59,ar:'الحشر',pages:4,juz:28},{n:60,ar:'الممتحنة',pages:3,juz:28},
  {n:61,ar:'الصف',pages:2,juz:28},{n:62,ar:'الجمعة',pages:2,juz:28},
  {n:63,ar:'المنافقون',pages:2,juz:28},{n:64,ar:'التغابن',pages:2,juz:28},
  {n:65,ar:'الطلاق',pages:3,juz:28},{n:66,ar:'التحريم',pages:2,juz:28},
  {n:67,ar:'الملك',pages:3,juz:29},{n:68,ar:'القلم',pages:3,juz:29},
  {n:69,ar:'الحاقة',pages:2,juz:29},{n:70,ar:'المعارج',pages:2,juz:29},
  {n:71,ar:'نوح',pages:2,juz:29},{n:72,ar:'الجن',pages:2,juz:29},
  {n:73,ar:'المزمل',pages:2,juz:29},{n:74,ar:'المدثر',pages:2,juz:29},
  {n:75,ar:'القيامة',pages:2,juz:29},{n:76,ar:'الإنسان',pages:2,juz:29},
  {n:77,ar:'المرسلات',pages:2,juz:29},{n:78,ar:'النبأ',pages:2,juz:30},
  {n:79,ar:'النازعات',pages:2,juz:30},{n:80,ar:'عبس',pages:1,juz:30},
  {n:81,ar:'التكوير',pages:1,juz:30},{n:82,ar:'الانفطار',pages:1,juz:30},
  {n:83,ar:'المطففين',pages:2,juz:30},{n:84,ar:'الانشقاق',pages:1,juz:30},
  {n:85,ar:'البروج',pages:1,juz:30},{n:86,ar:'الطارق',pages:1,juz:30},
  {n:87,ar:'الأعلى',pages:1,juz:30},{n:88,ar:'الغاشية',pages:1,juz:30},
  {n:89,ar:'الفجر',pages:2,juz:30},{n:90,ar:'البلد',pages:1,juz:30},
  {n:91,ar:'الشمس',pages:1,juz:30},{n:92,ar:'الليل',pages:1,juz:30},
  {n:93,ar:'الضحى',pages:1,juz:30},{n:94,ar:'الشرح',pages:1,juz:30},
  {n:95,ar:'التين',pages:1,juz:30},{n:96,ar:'العلق',pages:1,juz:30},
  {n:97,ar:'القدر',pages:1,juz:30},{n:98,ar:'البينة',pages:2,juz:30},
  {n:99,ar:'الزلزلة',pages:1,juz:30},{n:100,ar:'العاديات',pages:1,juz:30},
  {n:101,ar:'القارعة',pages:1,juz:30},{n:102,ar:'التكاثر',pages:1,juz:30},
  {n:103,ar:'العصر',pages:1,juz:30},{n:104,ar:'الهمزة',pages:1,juz:30},
  {n:105,ar:'الفيل',pages:1,juz:30},{n:106,ar:'قريش',pages:1,juz:30},
  {n:107,ar:'الماعون',pages:1,juz:30},{n:108,ar:'الكوثر',pages:1,juz:30},
  {n:109,ar:'الكافرون',pages:1,juz:30},{n:110,ar:'النصر',pages:1,juz:30},
  {n:111,ar:'المسد',pages:1,juz:30},{n:112,ar:'الإخلاص',pages:1,juz:30},
  {n:113,ar:'الفلق',pages:1,juz:30},{n:114,ar:'الناس',pages:1,juz:30},
];

const TOTAL_PAGES = 604;
type ProgressMap = Record<number, number>;

function tileColor(ratio: number, colors: ThemeColors): string {
  if (ratio === 0)  return colors.bgTint;
  if (ratio < 0.34) return 'rgba(180,120,20,0.28)';
  if (ratio < 0.67) return 'rgba(201,146,46,0.55)';
  if (ratio < 1)    return 'rgba(201,146,46,0.82)';
  return colors.green3;
}

export default function QuranMapScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [progress, setProgress] = useState<ProgressMap>({});
  const [selected, setSelected] = useState<number|null>(null);
  const [inputVal, setInputVal] = useState('');
  const [modal, setModal]       = useState(false);
  const [filter, setFilter]     = useState<'all'|'done'|'partial'|'none'>('all');
  const celebAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(STATE_KEY).then(v => { if (v) setProgress(JSON.parse(v)); }).catch(() => {});
  }, []);

  const save = (p: ProgressMap) => AsyncStorage.setItem(STATE_KEY, JSON.stringify(p)).catch(() => {});

  const totalDone = SURAHS.reduce((a, sr) => a + Math.min(progress[sr.n] ?? 0, sr.pages), 0);
  const surahsDone = SURAHS.filter(sr => (progress[sr.n] ?? 0) >= sr.pages).length;
  const juzDone    = totalDone / (TOTAL_PAGES / 30);
  const hizbDone   = totalDone / (TOTAL_PAGES / 60);
  const pct        = Math.round((totalDone / TOTAL_PAGES) * 100);

  const openSurah = (n: number) => {
    if (Platform.OS !== 'web') try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setSelected(n);
    setInputVal(String(progress[n] ?? 0));
    setModal(true);
  };

  const confirm = async () => {
    if (selected === null) return;
    const sr = SURAHS.find(x => x.n === selected)!;
    const v = Math.max(0, Math.min(parseInt(inputVal) || 0, sr.pages));
    const np = { ...progress, [selected]: v };
    setProgress(np);
    save(np);
    setModal(false);
    if (v >= sr.pages) {
      if (Platform.OS !== 'web') try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Animated.sequence([
        Animated.timing(celebAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(celebAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]).start();
    }
  };

  const visible = SURAHS.filter(sr => {
    const dp = progress[sr.n] ?? 0;
    if (filter === 'done')    return dp >= sr.pages;
    if (filter === 'partial') return dp > 0 && dp < sr.pages;
    if (filter === 'none')    return dp === 0;
    return true;
  });

  const sel = selected ? SURAHS.find(x => x.n === selected) : null;
  const selPages = selected ? (progress[selected] ?? 0) : 0;

  const COLS = 5;
  const GAP  = 4;
  const TILE  = (SW - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* TITLE */}
        <Text style={s.title}>خريطة القرآن الكريم</Text>

        {/* 3D BOOK */}
        <View style={s.bookArea}>
          <View style={[s.page, { right: SW*0.22+4, transform:[{rotate:'5deg'}], backgroundColor:'#0C1E32' }]} />
          <View style={[s.page, { right: SW*0.22+2, transform:[{rotate:'2.5deg'}], backgroundColor:'#112840' }]} />
          <View style={s.cover}>
            <View style={s.coverInner}>
              <Text style={s.bism}>﷽</Text>
              <Text style={s.coverTitle}>القرآن الكريم</Text>
              <View style={s.coverLine} />
              <Text style={s.coverPct}>{toArabicNum(pct)}٪</Text>
              <Text style={s.coverSub}>{toArabicNum(totalDone)} / {toArabicNum(TOTAL_PAGES)} صفحة</Text>
            </View>
          </View>
          <View style={s.spine}>
            <Text style={s.spineText}>القرآن</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={s.statsRow}>
          {[
            { v: toArabicNum(surahsDone), label: 'سورة', color: colors.green3, pct: surahsDone/114 },
            { v: juzDone.toFixed(1),       label: 'جزء / ٣٠', color: colors.gold, pct: juzDone/30 },
            { v: hizbDone.toFixed(1),      label: 'حزب / ٦٠', color: colors.goldLight, pct: hizbDone/60 },
          ].map((st) => (
              <View key={st.label} style={s.statCard}>
              <Text style={[s.statVal, { color: st.color }]}>{st.v}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
              <View style={s.bar}><View style={[s.barFill, { width:`${Math.min(st.pct*100,100)}%`, backgroundColor:st.color }]} /></View>
            </View>
          ))}
        </View>

        {/* HIZB BAR */}
        <View style={s.section}>
          <Text style={s.secTitle}>الأحزاب الستون</Text>
          <View style={s.hizbRow}>
            {Array.from({ length: 60 }).map((_, i) => {
              const fill = Math.min(Math.max(hizbDone - i, 0), 1);
              return (
                <View key={i} style={s.hizbSeg}>
                  <View style={[s.hizbFill, { height: `${fill * 100}%` }]} />
                  {(i+1) % 10 === 0 && <Text style={s.hizbLbl}>{toArabicNum(i+1)}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* LEGEND */}
        <View style={s.legend}>
          {[
            {c: colors.bgTint, l:'لم تبدأ'},
            {c:'rgba(180,120,20,0.4)', l:'بداية'},
            {c:'rgba(201,146,46,0.7)', l:'جارية'},
            {c: colors.green3,          l:'مكتملة'},
          ].map(lg => (
            <View key={lg.l} style={s.legItem}>
              <View style={[s.legSwatch, { backgroundColor: lg.c }]} />
              <Text style={s.legLabel}>{lg.l}</Text>
            </View>
          ))}
        </View>

        {/* FILTERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8, paddingBottom: 12 }}>
          {([
            {k:'all',    lbl:`الكل · ${toArabicNum(114)}`},
            {k:'done',   lbl:`✅ مكتملة · ${toArabicNum(surahsDone)}`},
            {k:'partial',lbl:'🔄 جارية'},
            {k:'none',   lbl:'⬜ لم تبدأ'},
          ] as const).map(f => (
            <TouchableOpacity key={f.k}
              style={[s.pill, filter===f.k && s.pillOn]}
              onPress={() => setFilter(f.k)}>
              <Text style={[s.pillTxt, filter===f.k && s.pillTxtOn]}>{f.lbl}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* GRID */}
        <View style={{ flexDirection:'row', flexWrap:'wrap', paddingHorizontal: SPACING.lg, gap: GAP }}>
          {visible.map(sr => {
            const dp    = progress[sr.n] ?? 0;
            const ratio = sr.pages > 0 ? dp / sr.pages : 0;
            const done  = dp >= sr.pages;
            return (
              <TouchableOpacity
                key={sr.n}
                style={[s.tile, { width: TILE, minHeight: TILE * 1.4, backgroundColor: tileColor(ratio, colors) }]}
                onPress={() => openSurah(sr.n)}
                activeOpacity={0.78}>
                <View style={s.tileSheen} />
                <View style={[s.badge, done && s.badgeDone]}>
                  <Text style={s.badgeTxt}>{toArabicNum(sr.n)}</Text>
                </View>
                <Text style={[s.tileName, { color: ratio >= 1 ? colors.deep : colors.cream }]}
                  numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {sr.ar}
                </Text>
                <Text style={s.tilePageCount}>{toArabicNum(sr.pages)}</Text>
                <View style={s.tileBar}>
                  <View style={[s.tileBarFill, {
                    width: `${ratio * 100}%`,
                    backgroundColor: done ? colors.green : colors.goldLight,
                  }]} />
                </View>
                {done && <Text style={s.doneCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* MODAL */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <View style={s.modalCard}>
            {sel && <>
              <View style={s.modalHandle} />
              <Text style={s.modalTitle}>سورة {sel.ar}</Text>
              <Text style={s.modalMeta}>
                {toArabicNum(sel.pages)} صفحة · الجزء {toArabicNum(sel.juz)}
              </Text>
              <View style={s.mProgOuter}>
                <View style={[s.mProgFill, { width: `${Math.min((selPages/sel.pages)*100,100)}%` }]} />
              </View>
              <Text style={s.mProgTxt}>{toArabicNum(selPages)} / {toArabicNum(sel.pages)} صفحة مكتملة</Text>
              <View style={s.quickRow}>
                {[0, Math.round(sel.pages*0.25), Math.round(sel.pages*0.5), Math.round(sel.pages*0.75), sel.pages]
                 .filter((v, idx, arr) => arr.indexOf(v) === idx)
                 .map((v) =>  (
                  <TouchableOpacity key={v} style={[s.qBtn, inputVal===String(v) && s.qBtnOn]}
                    onPress={() => setInputVal(String(v))}>
                    <Text style={[s.qBtnTxt, inputVal===String(v) && s.qBtnTxtOn]}>
                      {v === 0 ? '٠' : v === sel.pages ? 'كاملة ✓' : toArabicNum(v)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>أدخل عدد الصفحات:</Text>
                <TextInput
                  style={s.input}
                  value={inputVal}
                  onChangeText={setInputVal}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  maxLength={3}
                  selectTextOnFocus
                />
              </View>
              <View style={s.mActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={s.cancelTxt}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={confirm}>
                  <Text style={s.saveTxt}>حفظ ✓</Text>
                </TouchableOpacity>
              </View>
            </>}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root:  { flex:1, backgroundColor: colors.deep },
  title: { fontFamily: FONTS.amiriBold, fontSize: 22, color: colors.goldLight,
           textAlign:'center', paddingTop: SPACING.lg, marginBottom: SPACING.lg },

  bookArea: { height:185, alignItems:'center', marginBottom: 20, position:'relative' },
  page: { position:'absolute', width: SW*0.55, height:158, borderRadius:6, bottom:0 },
  cover:{ position:'absolute', right: SW*0.22, bottom:0, width: SW*0.55, height:162,
          backgroundColor:'#0A1E35', borderRadius:8,
          borderWidth:1.5, borderColor: colors.gold,
          shadowColor:'#000', shadowOffset:{width:-3,height:5}, shadowOpacity:0.5, shadowRadius:8, elevation:10,
          overflow:'hidden' },
  coverInner:{ flex:1, margin:6, borderWidth:1, borderColor:'rgba(201,146,46,0.25)',
               borderRadius:4, alignItems:'center', justifyContent:'center', gap:3 },
  bism:      { fontFamily: FONTS.amiri, fontSize:12, color: colors.gold, opacity:0.8 },
  coverTitle:{ fontFamily: FONTS.amiriBold, fontSize:15, color: colors.goldLight },
  coverLine: { width:55, height:1, backgroundColor: colors.gold, opacity:0.35, marginVertical:3 },
  coverPct:  { fontFamily: FONTS.cairoBold, fontSize:28, color: colors.gold },
  coverSub:  { fontFamily: FONTS.cairo, fontSize:10, color: colors.muted },
  spine:     { position:'absolute', right: SW*0.22-20, bottom:0, width:20, height:162,
               backgroundColor:'#040E1C', borderRadius:4,
               borderWidth:1, borderColor:'rgba(201,146,46,0.35)',
               alignItems:'center', justifyContent:'center' },
  spineText: { fontFamily: FONTS.amiri, fontSize:8, color: colors.gold, opacity:0.6,
               transform:[{rotate:'-90deg'}], width:90, textAlign:'center' },

  statsRow: { flexDirection:'row', marginHorizontal: SPACING.lg, gap:8, marginBottom:14 },
  statCard: { flex:1, backgroundColor: colors.deep2, borderRadius: RADIUS.md,
              padding: SPACING.md, borderWidth:1, borderColor:'rgba(201,146,46,0.12)' },
  statVal:  { fontFamily: FONTS.cairoBold, fontSize:19, textAlign:'center' },
  statLabel:{ fontFamily: FONTS.cairo, fontSize:10, color: colors.muted, textAlign:'center' },
  bar:      { height:3, backgroundColor: colors.bgTint, borderRadius:2, marginTop:5, overflow:'hidden' },
  barFill:  { height:3, borderRadius:2 },

  section:  { marginHorizontal: SPACING.lg, marginBottom:14 },
  secTitle: { fontFamily: FONTS.amiriBold, fontSize:14, color: colors.goldLight, marginBottom:8 },
  hizbRow:  { flexDirection:'row', gap:2, height:36, alignItems:'flex-end' },
  hizbSeg:  { flex:1, height:28, backgroundColor: colors.bgTint,
              borderRadius:2, overflow:'hidden', position:'relative', justifyContent:'flex-end' },
  hizbFill: { width:'100%', backgroundColor: colors.green3, borderRadius:2 },
  hizbLbl:  { position:'absolute', bottom:-13, left:0, right:0, textAlign:'center',
              fontFamily: FONTS.cairo, fontSize:7, color: colors.muted },

  legend:   { flexDirection:'row', justifyContent:'center', gap:12,
              marginHorizontal: SPACING.lg, marginBottom:10 },
  legItem:  { flexDirection:'row', alignItems:'center', gap:4 },
  legSwatch:{ width:10, height:10, borderRadius:3, borderWidth:0.5, borderColor:'rgba(201,146,46,0.2)' },
  legLabel: { fontFamily: FONTS.cairo, fontSize:10, color: colors.muted },

  pill:     { paddingHorizontal:12, paddingVertical:6, borderRadius:20,
              borderWidth:1, borderColor:'rgba(201,146,46,0.2)', backgroundColor: colors.deep2 },
  pillOn:   { backgroundColor: colors.gold, borderColor: colors.gold },
  pillTxt:  { fontFamily: FONTS.cairo, fontSize:11, color: colors.muted },
  pillTxtOn:{ color: colors.deep, fontFamily: FONTS.cairoBold },

  tile:       { borderRadius:6, padding:4, borderWidth:0.5, borderColor:'rgba(201,146,46,0.18)',
                overflow:'hidden', alignItems:'center', position:'relative',
                shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.25, shadowRadius:3, elevation:3 },
  tileSheen:  { position:'absolute', top:0, left:0, right:0, height:'38%',
                backgroundColor:'rgba(255,255,255,0.07)', borderRadius:6 },
  badge:      { width:16, height:16, borderRadius:8, backgroundColor:'rgba(201,146,46,0.14)',
                alignItems:'center', justifyContent:'center', marginBottom:2 },
  badgeDone:  { backgroundColor: colors.green },
  badgeTxt:   { fontFamily: FONTS.cairo, fontSize:7, color: colors.muted },
  tileName:   { fontFamily: FONTS.amiri, fontSize:12, textAlign:'center', lineHeight:15, flex:1 },
  tilePageCount:{ fontFamily: FONTS.cairo, fontSize:8, color: colors.muted },
  tileBar:    { width:'88%', height:2, backgroundColor: colors.bgTint, borderRadius:1, overflow:'hidden', marginTop:2 },
  tileBarFill:{ height:2, borderRadius:1 },
  doneCheck:  { position:'absolute', top:2, right:2, fontSize:8, color: colors.green3 },

  overlay:    { flex:1, backgroundColor: colors.overlay, justifyContent:'flex-end' },
  modalCard:  { backgroundColor: colors.deep2, borderTopLeftRadius:24, borderTopRightRadius:24,
                padding: SPACING.xl, borderTopWidth:1, borderColor:'rgba(201,146,46,0.28)' },
  modalHandle:{ width:40, height:4, borderRadius:2, backgroundColor: colors.bgTint,
                alignSelf:'center', marginBottom: SPACING.lg },
  modalTitle: { fontFamily: FONTS.amiriBold, fontSize:24, color: colors.goldLight, textAlign:'center' },
  modalMeta:  { fontFamily: FONTS.cairo, fontSize:13, color: colors.muted, textAlign:'center', marginBottom: SPACING.md },
  mProgOuter: { height:8, backgroundColor: colors.bgTint, borderRadius:4, overflow:'hidden', marginBottom:6 },
  mProgFill:  { height:8, backgroundColor: colors.gold, borderRadius:4 },
  mProgTxt:   { fontFamily: FONTS.cairo, fontSize:12, color: colors.muted, textAlign:'center', marginBottom: SPACING.md },
  quickRow:   { flexDirection:'row', gap:6, marginBottom: SPACING.md },
  qBtn:       { flex:1, backgroundColor:'rgba(201,146,46,0.1)', borderRadius: RADIUS.md,
                paddingVertical:8, alignItems:'center', borderWidth:1, borderColor:'rgba(201,146,46,0.2)' },
  qBtnOn:     { backgroundColor: colors.gold, borderColor: colors.gold },
  qBtnTxt:    { fontFamily: FONTS.cairo, fontSize:11, color: colors.cream2 },
  qBtnTxtOn:  { color: colors.deep, fontFamily: FONTS.cairoBold },
  inputWrap:  { flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                backgroundColor: colors.deep3, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  inputLabel: { fontFamily: FONTS.cairo, fontSize:13, color: colors.cream2 },
  input:      { fontFamily: FONTS.cairoBold, fontSize:22, color: colors.gold,
                width:70, textAlign:'center', borderBottomWidth:1.5, borderBottomColor: colors.gold },
  mActions:   { flexDirection:'row', gap: SPACING.md },
  cancelBtn:  { flex:1, backgroundColor: colors.bgTint, borderRadius: RADIUS.full,
                paddingVertical:14, alignItems:'center' },
  cancelTxt:  { fontFamily: FONTS.cairo, fontSize:14, color: colors.muted },
  saveBtn:    { flex:2, backgroundColor: colors.green2, borderRadius: RADIUS.full,
                paddingVertical:14, alignItems:'center' },
  saveTxt:    { fontFamily: FONTS.cairoBold, fontSize:15, color:'white' },
});
