import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { toArabicNum } from '../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// =================== DATA ===================

const ADAB_STEPS = [
  { num: 1, title: 'الثناء على الله', text: 'يا الله يا ذا الجلال والإكرام يا ذا الطول والإنعام' },
  { num: 2, title: 'الصلاة على النبي ﷺ', text: 'اللهم يا رب صل وسلم وبارك على سيدنا محمد' },
  { num: 3, title: 'التوسل باسم الله الأعظم', text: 'اللهم إني أسألك بأني أشهد أنك أنت الله لا إله إلا أنت الأحد الصمد الذي لم يلد ولم يولد ولم يكن له كفوًا أحد' },
  { num: 4, title: 'الدعاء الجامع', text: 'اللهم إني أسألك من الخير كله عاجله وآجله ما علمتُ منه وما لم أعلم وأعوذ بك من الشر كله عاجله وآجله ما علمتُ منه وما لم أعلم' },
  { num: 5, title: 'يا حي يا قيوم', text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين' },
  { num: 6, title: 'خير الدنيا والآخرة', text: 'اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار' },
  { num: 7, title: 'الختام بالصلاة على النبي', text: 'اللهم صل وسلم وبارك على سيدنا محمد وعلى آله وصحبه أجمعين' },
];

interface Duaa {
  text: string;
  src: string;
  note?: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  mood: string;
  duaas: Duaa[];
}

const CATEGORIES: Category[] = [
  {
    id: 'anxiety',
    label: 'القلق والهم',
    icon: '💙',
    color: COLORS.blue,
    mood: 'عند الضيق والقلق، تذكر أن الله أقرب إليك من حبل الوريد. هذه الأدعية تُعيد للقلب سكينته.',
    duaas: [
      { text: 'اللهم إني أعوذ بك من الهمّ والحزن والعجز والكسل والبخل والجبن وضلع الدَّين وغلبة الرجال', src: 'البخاري: ٦٣٦٣' },
      { text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين', src: 'صحيح الترغيب: ٦٥٤' },
      { text: 'اللهم لا سهل إلا ما جعلته سهلًا وأنت تجعل الحزن سهلًا إذا شئتَ', src: 'صحيح ابن حبان: ١٩٧٤' },
      { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', src: 'آل عمران: ١٧٣' },
      { text: 'لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', src: 'الأنبياء: ٨٧ — دعاء يونس', note: 'دعاء يونس عليه السلام في بطن الحوت، نجّاه الله به' },
      { text: 'اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين وأصلح لي شأني كله لا إله إلا أنت', src: 'صحيح أبي داود: ٤٢٤٦' },
      { text: 'اللهم اجعل في قلبي نورًا وفي بصري نورًا وفي سمعي نورًا واجعل لي نورًا', src: 'البخاري: ٦٣١٦' },
    ],
  },
  {
    id: 'hope',
    label: 'الرجاء والأمل',
    icon: '🌱',
    color: COLORS.green2,
    mood: 'الأمل في الله لا ينقطع. ادعُ ربك وأنت موقن بالإجابة، فإن الله لا يُخيّب من دعاه.',
    duaas: [
      { text: 'رَبَّنَا آتِنَا مِنْ لَدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا', src: 'الكهف: ١٠' },
      { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', src: 'طه: ٢٥-٢٦' },
      { text: 'اللهم إني أسألك الهدى والتقى والعفاف والغنى', src: 'مسلم: ٢٧٢١' },
      { text: 'اللهم أصلح لي ديني الذي هو عصمة أمري وأصلح لي دنياي التي فيها معاشي وأصلح لي آخرتي التي فيها معادي', src: 'مسلم: ٢٧٢٠' },
      { text: 'اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمَّن سواك', src: 'صحيح الترمذي: ٢٨٢٢' },
      { text: 'اللهم إني أسألك علمًا نافعًا ورزقًا طيبًا وعملًا متقبَّلًا', src: 'صحيح ابن ماجه: ٧٥٣' },
    ],
  },
  {
    id: 'forgiveness',
    label: 'التوبة والاستغفار',
    icon: '💧',
    color: COLORS.blue2,
    mood: 'الله يفرح بتوبة عبده أكثر من فرح من وجد ضالته. لا تيأس من رحمة الله أبدًا.',
    duaas: [
      { text: 'اللهم إني ظلمتُ نفسي ظلمًا كثيرًا ولا يغفر الذنوب إلا أنت فاغفر لي مغفرةً من عندك وارحمني إنك أنت الغفور الرحيم', src: 'البخاري: ٨٣٤' },
      { text: 'اللهم إنك عفوٌّ تحب العفو فاعفُ عني', src: 'البخاري: ٣٢٩٤', note: 'دعاء ليلة القدر الذي علّمه النبي ﷺ لعائشة' },
      { text: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', src: 'الأعراف: ٢٣ — دعاء آدم وحواء' },
      { text: 'اللهم اغفر لي خطيئتي وجهلي وإسرافي في أمري وما أنت أعلمُ به مني', src: 'البخاري: ٦٣٩٩' },
      { text: 'اللهم باعِد بيني وبين خطاياي كما باعدتَ بين المشرق والمغرب اللهم نقِّني من خطاياي كما ينقى الثوب الأبيض من الدَّنس', src: 'مسلم: ٥٩٨' },
      { text: 'أستغفر الله الذي لا إله إلا هو الحيَّ القيُّومَ وأتوب إليه', src: 'صحيح أبي داود: ١٣٤٣' },
      { text: 'أنت وليُّنا فاغفر لنا وارحمنا وأنت خير الغافرين', src: 'الأعراف: ١٥٥' },
    ],
  },
  {
    id: 'strength',
    label: 'الثبات والقوة',
    icon: '⚡',
    color: COLORS.gold,
    mood: 'الثبات على الحق من أعظم النعم. استعن بهذه الأدعية لتثبيت قلبك في مواجهة الفتن.',
    duaas: [
      { text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ', src: 'آل عمران: ٨' },
      { text: 'يا مقلِّب القلوب ثبِّت قلبي على دِينك', src: 'صحيح الترمذي: ٢٧٩٢' },
      { text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', src: 'البقرة: ٢٥٠' },
      { text: 'اللهم آتِ نفسي تقواها وزكِّها أنت خيرُ مَن زكاها أنت وليُّها ومولاها', src: 'مسلم: ٢٧٢٢' },
      { text: 'ربِّ أعنِّي ولا تُعِنْ عليَّ وانصرني ولا تنصر عليَّ واهدِني ويسِّر لي الهدى وانصرني على مَن بغى علي', src: 'صحيح أبي داود: ١٣٣٧' },
      { text: 'يا وليَّ الإسلام وأهله ثبِّتْني به حتى ألقاك', src: 'السلسلة الصحيحة: ١٨٢٣' },
    ],
  },
  {
    id: 'gratitude',
    label: 'الشكر والنعمة',
    icon: '🌸',
    color: COLORS.green3,
    mood: 'الشكر يزيد النعم ويجلب البركة. تذكر نعم الله عليك وادعُ بشكرها.',
    duaas: [
      { text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ', src: 'الأحقاف: ١٥' },
      { text: 'اللهم أعنِّي على ذِكرك وشُكرك وحُسن عبادتك', src: 'صحيح أبي داود: ١٣٤٧' },
      { text: 'اللهم لك الحمدُ كله لا قابضَ لما بسطتَ ولا معطيَ لما منعتَ اللهم ابسُط علينا من بركاتك ورحمتك وفضلك ورزقك', src: 'صحيح الأدب المفرد: ٥٤١' },
      { text: 'اللهم اقسِمْ لنا من خشيتك ما يحول بيننا وبين معاصيك ومن طاعتك ما تبلِّغنا به جنتك', src: 'صحيح الترمذي: ٢٧٨٣' },
    ],
  },
  {
    id: 'protection',
    label: 'الحفظ والاستعاذة',
    icon: '🛡️',
    color: COLORS.deep3,
    mood: 'الذكر والدعاء حصن حصين من الشيطان وكل شر. داوم عليها صباحًا ومساءً.',
    duaas: [
      { text: 'اللهم إني أعوذ بك من عذاب القبر ومن عذاب النار ومن فتنة المحيا والممات ومن فتنة المسيح الدجال', src: 'البخاري: ١٣٧٧' },
      { text: 'أعوذ بكلمات الله التامات من شر ما خلَق', src: 'مسلم: ٢٧٠٨' },
      { text: 'اللهم احفَظْني بالإسلام قائمًا واحفَظْني بالإسلام قاعدًا واحفظني بالإسلام راقدًا ولا تُشمِتْ بي عدوًّا حاسدًا', src: 'صحيح الجامع: ١٢٦٠' },
      { text: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ', src: 'المؤمنون: ٩٧-٩٨' },
      { text: 'اللهم إني أعوذ بك من شر سمعي ومن شر بصري ومن شر لساني ومن شر قلبي ومن شر منيِّي', src: 'صحيح أبي داود: ١٣٧٢' },
      { text: 'اللهم اعصِمْني من الشيطان الرجيم', src: 'صحيح ابن ماجه: ٦٢٧' },
    ],
  },
  {
    id: 'health',
    label: 'الصحة والعافية',
    icon: '💚',
    color: COLORS.green,
    mood: 'العافية من أجل نعم الله، وقد كان النبي ﷺ يسألها دائمًا. فاحرص على سؤالها كل يوم.',
    duaas: [
      { text: 'اللهم عافني في بدني اللهم عافني في سمعي اللهم عافني في بصري لا إله إلا أنت اللهم إني أعوذ بك من الكفر والفقر', src: 'صحيح أبي داود: ٤٢٤٥' },
      { text: 'اللهم إني أسألك العافية في الدنيا والآخرة اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي', src: 'صحيح أبي داود: ٤٢٣٩' },
      { text: 'اللهم إني أعوذ بك من البَرَص والجنون والجُذَام ومن سيِّئ الأسقام', src: 'صحيح أبي داود: ١٣٧٥' },
      { text: 'اللهم متِّعني بسمعي وبصري واجعَلهما الوارث مني وانصُرني على من يظلمني وخُذ منه بثأري', src: 'صحيح الترمذي: ٢٨٥٤' },
    ],
  },
  {
    id: 'family',
    label: 'الأسرة والذرية',
    icon: '👨‍👩‍👧',
    color: COLORS.pink,
    mood: 'الأسرة الصالحة كنز لا يُقدَّر. ادعُ الله لأهلك وذريتك بالصلاح والهداية.',
    duaas: [
      { text: 'رَبِّ هَبْ لِي مِنْ لَدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ', src: 'آل عمران: ٣٨' },
      { text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ', src: 'إبراهيم: ٤٠' },
      { text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', src: 'إبراهيم: ٤١' },
      { text: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', src: 'الإسراء: ٢٤' },
      { text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', src: 'الفرقان: ٧٤' },
      { text: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ', src: 'الصافات: ١٠٠' },
    ],
  },
  {
    id: 'quran',
    label: 'أدعية قرآنية',
    icon: '📖',
    color: COLORS.goldDark,
    mood: 'أدعية الأنبياء من القرآن الكريم — كلام الله يُعلّمك كيف تدعوه.',
    duaas: [
      { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', src: 'البقرة: ٢٠١' },
      { text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', src: 'البقرة: ٢٨٦' },
      { text: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا', src: 'البقرة: ٢٨٦' },
      { text: 'رَبِّ زِدْنِي عِلْمًا', src: 'طه: ١١٤' },
      { text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ', src: 'الحشر: ١٠' },
      { text: 'رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ', src: 'الممتحنة: ٤' },
      { text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', src: 'التحريم: ٨' },
      { text: 'رَبِّ ابْنِ لِي عِنْدَكَ بَيْتًا فِي الْجَنَّةِ', src: 'التحريم: ١١' },
    ],
  },
];

export default function DuaaScreen() {
  const [activeTab, setActiveTab] = useState<'adab' | 'cats'>('adab');
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleDuaa = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  };

  const selectCat = (cat: Category) => {
    setActiveCat(cat);
    setOpenIndex(null);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <View style={styles.container}>
      {/* Top mode tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'adab' && styles.modeTabActive]}
          onPress={() => setActiveTab('adab')}
        >
          <Text style={[styles.modeTabText, activeTab === 'adab' && styles.modeTabTextActive]}>
            🌟 آداب الدعاء
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'cats' && styles.modeTabActive]}
          onPress={() => setActiveTab('cats')}
        >
          <Text style={[styles.modeTabText, activeTab === 'cats' && styles.modeTabTextActive]}>
            🤲 الأدعية المصنّفة
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'adab' ? (
        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
          {/* Adab intro */}
          <View style={styles.adabIntro}>
            <Text style={styles.adabIntroTitle}>الترتيب الأمثل للدعاء</Text>
            <Text style={styles.adabIntroSub}>
              «خير الدعاء دعاء يوم عرفة» — اتبع هذه الخطوات لدعاء مقبول بإذن الله
            </Text>
          </View>

          {ADAB_STEPS.map((step, i) => (
            <View key={i} style={styles.adabCard}>
              <View style={styles.adabNumWrap}>
                <Text style={styles.adabNum}>{toArabicNum(step.num)}</Text>
              </View>
              <View style={styles.adabContent}>
                <Text style={styles.adabTitle}>{step.title}</Text>
                <Text style={styles.adabText}>{step.text}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>💡 من آداب الدعاء</Text>
            {[
              'استقبل القبلة وارفع يديك',
              'ابدأ بالحمد والثناء على الله',
              'صلِّ على النبي ﷺ في البداية والنهاية',
              'كن موقنًا بالإجابة',
              'ألحّ على الله وكرِّر الدعاء ثلاثًا',
              'أفضل أوقات الدعاء: السحر، بين الأذان والإقامة، يوم عرفة، ليلة القدر',
            ].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Category Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, activeCat.id === cat.id && styles.catPillActive]}
                onPress={() => selectCat(cat)}
              >
                <Text style={styles.catPillText}>{cat.icon} {cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
            {/* Mood message */}
            <View style={styles.moodBox}>
              <Text style={styles.moodText}>{activeCat.mood}</Text>
            </View>

            {/* Duaa cards */}
            {activeCat.duaas.map((duaa, i) => (
              <TouchableOpacity
                key={i}
                style={styles.duaaCard}
                onPress={() => toggleDuaa(i)}
                activeOpacity={0.85}
              >
                <View style={styles.duaaHeader}>
                  <View style={[styles.duaaNum, { backgroundColor: `${activeCat.color}22` }]}>
                    <Text style={[styles.duaaNumText, { color: activeCat.color }]}>
                      {toArabicNum(i + 1)}
                    </Text>
                  </View>
                  <Text style={styles.duaaSrc} numberOfLines={1}>{duaa.src}</Text>
                  <Text style={styles.duaaArrow}>{openIndex === i ? '▲' : '▼'}</Text>
                </View>
                {openIndex === i && (
                  <View style={styles.duaaBody}>
                    <Text style={styles.duaaArabic}>{duaa.text}</Text>
                    {duaa.note && (
                      <View style={styles.noteBox}>
                        <Text style={styles.noteText}>💡 {duaa.note}</Text>
                      </View>
                    )}
                    <Text style={styles.duaaRef}>{duaa.src}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },
  modeTabs: { flexDirection: 'row', backgroundColor: COLORS.deep2, borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.2)' },
  modeTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  modeTabActive: { borderBottomColor: COLORS.gold },
  modeTabText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.muted },
  modeTabTextActive: { color: COLORS.goldLight, fontFamily: FONTS.cairoBold },
  adabIntro: { backgroundColor: 'rgba(201,146,46,0.07)', borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.2)' },
  adabIntroTitle: { fontFamily: FONTS.amiriBold, fontSize: 20, color: COLORS.goldLight, marginBottom: 6 },
  adabIntroSub: { fontFamily: FONTS.amiri, fontSize: 13, color: COLORS.cream3, lineHeight: 24 },
  adabCard: { flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)', alignItems: 'flex-start' },
  adabNumWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  adabNum: { fontFamily: FONTS.cairoBold, fontSize: 14, color: COLORS.deep },
  adabContent: { flex: 1 },
  adabTitle: { fontFamily: FONTS.cairoBold, fontSize: 13, color: COLORS.goldLight, marginBottom: 4 },
  adabText: { fontFamily: FONTS.amiri, fontSize: 15, color: COLORS.cream2, lineHeight: 26 },
  tipsBox: { backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.sm, borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)' },
  tipsTitle: { fontFamily: FONTS.cairoBold, fontSize: 15, color: COLORS.goldLight, marginBottom: SPACING.md },
  tipItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipDot: { color: COLORS.gold, fontSize: 16, lineHeight: 22 },
  tipText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.cream3, flex: 1, lineHeight: 22 },
  catScroll: { maxHeight: 52, marginVertical: SPACING.sm },
  catPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(201,146,46,0.25)', backgroundColor: COLORS.deep2 },
  catPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  catPillText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream2 },
  moodBox: { backgroundColor: 'rgba(201,146,46,0.06)', borderRightWidth: 3, borderRightColor: COLORS.gold, borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.md },
  moodText: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, lineHeight: 26 },
  duaaCard: { backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)', overflow: 'hidden' },
  duaaHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  duaaNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  duaaNumText: { fontFamily: FONTS.cairoBold, fontSize: 12 },
  duaaSrc: { flex: 1, fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted },
  duaaArrow: { color: COLORS.muted, fontSize: 11 },
  duaaBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: 'rgba(201,146,46,0.08)', paddingTop: SPACING.md },
  duaaArabic: { fontFamily: FONTS.amiri, fontSize: 17, color: COLORS.cream, lineHeight: 32, textAlign: 'right', direction: 'rtl' } as any,
  noteBox: { backgroundColor: 'rgba(201,146,46,0.07)', borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.sm, marginBottom: SPACING.sm },
  noteText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream3 },
  duaaRef: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 6 },
});
