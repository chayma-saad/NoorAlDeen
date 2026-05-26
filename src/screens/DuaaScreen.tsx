import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { toArabicNum } from '../utils/helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Adab Steps ────────────────────────────────────────────────────────────────

const ADAB_STEPS = [
  { num: 1, title: 'الثناء على الله', text: 'يا الله يا ذا الجلال والإكرام يا ذا الطول والإنعام' },
  { num: 2, title: 'الصلاة على النبي ﷺ', text: 'اللهم يا رب صل وسلم وبارك على سيدنا محمد' },
  { num: 3, title: 'التوسل باسم الله الأعظم', text: 'اللهم إني أسألك بأني أشهد أنك أنت الله لا إله إلا أنت الأحد الصمد الذي لم يلد ولم يولد ولم يكن له كفوًا أحد' },
  { num: 4, title: 'الدعاء الجامع', text: 'اللهم إني أسألك من الخير كله عاجله وآجله ما علمتُ منه وما لم أعلم' },
  { num: 5, title: 'يا حي يا قيوم', text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين' },
  { num: 6, title: 'خير الدنيا والآخرة', text: 'اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار' },
  { num: 7, title: 'الختام بالصلاة على النبي', text: 'اللهم صل وسلم وبارك على سيدنا محمد وعلى آله وصحبه أجمعين' },
];

// ─── Duaa Data ─────────────────────────────────────────────────────────────────

interface Duaa {
  text: string;
  src: string;
  note?: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  accent: string;
  mood: string;
  duaas: Duaa[];
}

const CATEGORIES: Category[] = [
  // ── 1. Anxiety ──────────────────────────────────────────────────────────────
  {
    id: 'anxiety',
    label: 'القلق والهم',
    icon: '💙',
    accent: COLORS.blue3,
    mood: 'عند الضيق والقلق، تذكر أن الله أقرب إليك من حبل الوريد. هذه الأدعية تُعيد للقلب سكينته.',
    duaas: [
      { text: 'اللهم إني أعوذ بك من الهمّ والحزن والعجز والكسل والبخل والجبن وضلع الدَّين وغلبة الرجال', src: 'البخاري: ٦٣٦٣' },
      { text: 'يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين', src: 'صحيح الترغيب: ٦٥٤' },
      { text: 'اللهم لا سهل إلا ما جعلته سهلًا وأنت تجعل الحزن سهلًا إذا شئتَ', src: 'صحيح ابن حبان: ١٩٧٤' },
      { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', src: 'آل عمران: ١٧٣' },
      { text: 'لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', src: 'الأنبياء: ٨٧', note: 'دعاء يونس عليه السلام في بطن الحوت — نجّاه الله به' },
      { text: 'اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين وأصلح لي شأني كله لا إله إلا أنت', src: 'صحيح أبي داود: ٤٢٤٦' },
      { text: 'اللهم اجعل في قلبي نورًا وفي بصري نورًا وفي سمعي نورًا واجعل لي نورًا', src: 'البخاري: ٦٣١٦' },
    ],
  },

  // ── 2. Joy & Happiness ──────────────────────────────────────────────────────
  {
    id: 'joy',
    label: 'الفرح والبهجة',
    icon: '🌟',
    accent: COLORS.goldLight,
    mood: 'الفرح بنعمة الله وحمده عليها من أعظم العبادات. دوام الفرح بالله نور لا ينطفئ.',
    duaas: [
      { text: 'اللهم إني أسألك من فضلك فرحة القلب وبهجة الروح وسكينة النفس', src: 'دعاء مأثور' },
      { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', src: 'البقرة: ٢٠١', note: 'الحسنة في الدنيا تشمل صحة البدن وفرح القلب والعلم النافع' },
      { text: 'اللهم اجعل قلبي سليمًا مطمئنًا فرحًا بذكرك', src: 'دعاء مأثور' },
      { text: 'اللهم كما فرَّحتني بالإسلام فلا تحرمني من فرح لقائك', src: 'دعاء السلف' },
      { text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', src: 'الرعد: ٢٨', note: 'أثبت اللهُ في كتابه أن الطمأنينة والبهجة الحقيقية في ذكره' },
      { text: 'اللهم أعنِّي على ذِكرك وشُكرك وحُسن عبادتك', src: 'صحيح أبي داود: ١٣٤٧' },
      { text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ', src: 'الأحقاف: ١٥', note: 'شكر النعمة يُبقيها ويزيدها ويجلب الفرح المستدام' },
    ],
  },

  // ── 3. Hope ─────────────────────────────────────────────────────────────────
  {
    id: 'hope',
    label: 'الرجاء والأمل',
    icon: '🌱',
    accent: COLORS.green3,
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

  // ── 4. Marriage ─────────────────────────────────────────────────────────────
  {
    id: 'marriage',
    label: 'الزواج والنكاح',
    icon: '💞',
    accent: COLORS.rose,
    mood: 'الزواج الصالح سكن ومودة ورحمة. ادعُ الله بهذه الأدعية الجامعة من القرآن والسنة.',
    duaas: [
      { text: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ', src: 'الصافات: ١٠٠', note: 'دعاء إبراهيم عليه السلام طالبًا الذرية الصالحة والزوج الصالح' },
      { text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', src: 'الفرقان: ٧٤' },
      { text: 'اللهم ارزقني زوجًا صالحًا يعينني على طاعتك ويُقرِّبني إليك', src: 'دعاء مأثور' },
      { text: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ', src: 'أبو داود: ٢١٣٠', note: 'هذا ما يُقال للمتزوج حديثًا — أفضل دعاء يُهدى في الزفاف' },
      { text: 'اللهم ألِّف بين قلبينا كما ألَّفتَ بين الأنبياء وأزواجهم الصالحين', src: 'دعاء مأثور' },
      { text: 'اللهم أرزقنا من الحب الحلال ما تجعله سكنًا ومودةً ورحمة', src: 'مستوحى من الروم: ٢١' },
      { text: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً', src: 'الروم: ٢١', note: 'جعل الله المودة والرحمة من آياته الكونية — سُبحانه' },
    ],
  },

  // ── 5. Qada al-haja ─────────────────────────────────────────────────────────
  {
    id: 'qadahaja',
    label: 'قضاء الحاجة',
    icon: '🤲',
    accent: COLORS.amber2,
    mood: 'إذا أغلقت الأبواب فلا تنسَ أن لله مفتاحًا لكل باب. توكَّل وادعُ فإن الله يُيسِّر.',
    duaas: [
      { text: 'اللهم لا سهل إلا ما جعلته سهلًا وأنت تجعل الحزن إذا شئتَ سهلًا', src: 'صحيح ابن حبان: ٩٧٤', note: 'يُقرأ عند كل أمر يُراد تيسيره' },
      { text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', src: 'التوبة: ١٢٩', note: 'يقولها سبع مرات صباحًا ومساءً فيكفيه الله ما أهمه' },
      { text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ', src: 'الطلاق: ٣' },
      { text: 'اللهم يسِّر لي أموري وأعنِّي على ما أريد تيسيره برحمتك يا أرحم الراحمين', src: 'دعاء مأثور' },
      { text: 'اللهم إني أسألك بأن لك الحمد لا إله إلا أنت المنان بديع السماوات والأرض يا ذا الجلال والإكرام يا حي يا قيوم', src: 'أبو داود: ١٤٩٥', note: 'هذا من الأدعية التي يُقال أنها من اسم الله الأعظم' },
      { text: 'فَسَيَكْفِيكَهُمُ اللَّهُ وَهُوَ السَّمِيعُ الْعَلِيمُ', src: 'البقرة: ١٣٧' },
      { text: 'اللهم إني عبدك ابن عبدك ابن أمتك ناصيتي بيدك ماضٍ فيَّ حكمك عدلٌ فيَّ قضاؤك', src: 'أحمد: ٣٧١٢', note: 'دعاء الفرج — قاله النبي ﷺ ومن دعا به أذهب الله همّه وأبدله فرحًا' },
    ],
  },

  // ── 6. Forgiveness ──────────────────────────────────────────────────────────
  {
    id: 'forgiveness',
    label: 'التوبة والاستغفار',
    icon: '💧',
    accent: COLORS.blue3,
    mood: 'الله يفرح بتوبة عبده أكثر من فرح من وجد ضالته. لا تيأس من رحمة الله أبدًا.',
    duaas: [
      { text: 'اللهم إني ظلمتُ نفسي ظلمًا كثيرًا ولا يغفر الذنوب إلا أنت فاغفر لي مغفرةً من عندك وارحمني إنك أنت الغفور الرحيم', src: 'البخاري: ٨٣٤' },
      { text: 'اللهم إنك عفوٌّ تحب العفو فاعفُ عني', src: 'البخاري: ٣٢٩٤', note: 'دعاء ليلة القدر الذي علّمه النبي ﷺ لعائشة رضي الله عنها' },
      { text: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', src: 'الأعراف: ٢٣' },
      { text: 'اللهم باعِد بيني وبين خطاياي كما باعدتَ بين المشرق والمغرب اللهم نقِّني من الخطايا كما ينقى الثوب الأبيض من الدَّنس', src: 'مسلم: ٥٩٨' },
      { text: 'أستغفر الله الذي لا إله إلا هو الحيَّ القيُّومَ وأتوب إليه', src: 'صحيح أبي داود: ١٣٤٣' },
    ],
  },

  // ── 7. Strength ─────────────────────────────────────────────────────────────
  {
    id: 'strength',
    label: 'الثبات والقوة',
    icon: '⚡',
    accent: COLORS.gold,
    mood: 'الثبات على الحق من أعظم النعم. استعن بهذه الأدعية لتثبيت قلبك في مواجهة الفتن.',
    duaas: [
      { text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ', src: 'آل عمران: ٨' },
      { text: 'يا مقلِّب القلوب ثبِّت قلبي على دِينك', src: 'صحيح الترمذي: ٢٧٩٢' },
      { text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا', src: 'البقرة: ٢٥٠' },
      { text: 'اللهم آتِ نفسي تقواها وزكِّها أنت خيرُ مَن زكاها', src: 'مسلم: ٢٧٢٢' },
      { text: 'ربِّ أعنِّي ولا تُعِنْ عليَّ وانصرني ولا تنصر عليَّ', src: 'صحيح أبي داود: ١٣٣٧' },
    ],
  },

  // ── 8. Gratitude ────────────────────────────────────────────────────────────
  {
    id: 'gratitude',
    label: 'الشكر والنعمة',
    icon: '🌸',
    accent: COLORS.green3,
    mood: 'الشكر يزيد النعم ويجلب البركة. تذكر نعم الله عليك وادعُ بشكرها.',
    duaas: [
      { text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ', src: 'الأحقاف: ١٥' },
      { text: 'اللهم أعنِّي على ذِكرك وشُكرك وحُسن عبادتك', src: 'صحيح أبي داود: ١٣٤٧' },
      { text: 'اللهم لك الحمدُ كله ولك الشكر كله ولك الثناء الحسن كله', src: 'صحيح الأدب المفرد: ٥٤١' },
      { text: 'اللهم اقسِمْ لنا من خشيتك ما يحول بيننا وبين معاصيك', src: 'صحيح الترمذي: ٢٧٨٣' },
    ],
  },

  // ── 9. Family ───────────────────────────────────────────────────────────────
  {
    id: 'family',
    label: 'الأسرة والذرية',
    icon: '👨‍👩‍👧',
    accent: COLORS.green3,
    mood: 'الأسرة الصالحة كنز لا يُقدَّر. ادعُ الله لأهلك وذريتك بالصلاح والهداية.',
    duaas: [
      { text: 'رَبِّ هَبْ لِي مِنْ لَدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ', src: 'آل عمران: ٣٨' },
      { text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', src: 'الفرقان: ٧٤' },
      { text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', src: 'إبراهيم: ٤١' },
      { text: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', src: 'الإسراء: ٢٤' },
    ],
  },

  // ── 10. Protection ──────────────────────────────────────────────────────────
  {
    id: 'protection',
    label: 'الحفظ والاستعاذة',
    icon: '🛡️',
    accent: COLORS.blue2,
    mood: 'الذكر والدعاء حصن حصين من الشيطان وكل شر. داوم عليها صباحًا ومساءً.',
    duaas: [
      { text: 'اللهم إني أعوذ بك من عذاب القبر ومن عذاب النار ومن فتنة المحيا والممات', src: 'البخاري: ١٣٧٧' },
      { text: 'أعوذ بكلمات الله التامات من شر ما خلَق', src: 'مسلم: ٢٧٠٨' },
      { text: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ', src: 'المؤمنون: ٩٧-٩٨' },
      { text: 'اللهم إني أعوذ بك من شر سمعي ومن شر بصري ومن شر لساني ومن شر قلبي', src: 'صحيح أبي داود: ١٣٧٢' },
    ],
  },

  // ── 11. Health ──────────────────────────────────────────────────────────────
  {
    id: 'health',
    label: 'الصحة والعافية',
    icon: '💚',
    accent: COLORS.green2,
    mood: 'العافية من أجل نعم الله، وكان النبي ﷺ يسألها دائمًا. فاحرص على سؤالها كل يوم.',
    duaas: [
      { text: 'اللهم عافني في بدني اللهم عافني في سمعي اللهم عافني في بصري لا إله إلا أنت', src: 'صحيح أبي داود: ٤٢٤٥' },
      { text: 'اللهم إني أسألك العافية في الدنيا والآخرة اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي', src: 'صحيح أبي داود: ٤٢٣٩' },
      { text: 'اللهم إني أعوذ بك من البَرَص والجنون والجُذَام ومن سيِّئ الأسقام', src: 'صحيح أبي داود: ١٣٧٥' },
    ],
  },

  // ── 12. Quranic Duas ────────────────────────────────────────────────────────
  {
    id: 'quran',
    label: 'أدعية قرآنية',
    icon: '📖',
    accent: COLORS.goldDark,
    mood: 'أدعية الأنبياء من القرآن الكريم — كلام الله يُعلِّمك كيف تدعوه بأحسن الكلام.',
    duaas: [
      { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', src: 'البقرة: ٢٠١' },
      { text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', src: 'البقرة: ٢٨٦' },
      { text: 'رَبِّ زِدْنِي عِلْمًا', src: 'طه: ١١٤' },
      { text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ', src: 'الحشر: ١٠' },
      { text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', src: 'التحريم: ٨' },
      { text: 'رَبِّ ابْنِ لِي عِنْدَكَ بَيْتًا فِي الْجَنَّةِ', src: 'التحريم: ١١' },
      { text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ', src: 'إبراهيم: ٤٠' },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DuaaScreen() {
  const [activeTab, setActiveTab] = useState<'adab' | 'cats'>('cats');
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerDecor}>✦ ✦ ✦</Text>
        <Text style={styles.headerTitle}>كنز الأدعية</Text>
      </View>

      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'adab' && styles.modeTabActive]}
          onPress={() => setActiveTab('adab')}
        >
          <Text style={[styles.modeTabText, activeTab === 'adab' && styles.modeTabTextActive]}>
            آداب الدعاء
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'cats' && styles.modeTabActive]}
          onPress={() => setActiveTab('cats')}
        >
          <Text style={[styles.modeTabText, activeTab === 'cats' && styles.modeTabTextActive]}>
            الأدعية المصنَّفة
          </Text>
        </TouchableOpacity>
      </View>

      {/* Adab Tab */}
      {activeTab === 'adab' ? (
        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>
          <View style={styles.adabIntro}>
            <Text style={styles.adabIntroTitle}>الترتيب الأمثل للدعاء</Text>
            <Text style={styles.adabIntroSub}>
              «خير الدعاء دعاء يوم عرفة» — اتبع هذه الخطوات لدعاء مقبول بإذن الله
            </Text>
          </View>
          {ADAB_STEPS.map((step) => (
            <View key={step.num} style={styles.adabCard}>
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
            <Text style={styles.tipsTitle}>من آداب الدعاء</Text>
            {[
              'استقبل القبلة وارفع يديك',
              'ابدأ بالحمد والثناء على الله',
              'صلِّ على النبي ﷺ في البداية والنهاية',
              'كن موقنًا بالإجابة',
              'ألحّ على الله وكرِّر الدعاء ثلاثًا',
              'أفضل أوقات الدعاء: السحر، بين الأذان والإقامة، يوم عرفة، ليلة القدر',
            ].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Text style={styles.tipDot}>✦</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>

          {/* Category Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8, paddingVertical: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const active = activeCat.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catPill,
                    active && { backgroundColor: cat.accent, borderColor: cat.accent },
                  ]}
                  onPress={() => selectCat(cat)}
                >
                  <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                    {cat.icon} {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Duaa List */}
          <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}>

            {/* Mood box */}
            <View style={[styles.moodBox, { borderRightColor: activeCat.accent }]}>
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
                  <View style={[styles.duaaNum, { backgroundColor: `${activeCat.accent}22` }]}>
                    <Text style={[styles.duaaNumText, { color: activeCat.accent }]}>
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
                      <View style={[styles.noteBox, { borderRightColor: activeCat.accent }]}>
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

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },

  header: { alignItems: 'center', paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerDecor: { fontSize: 11, color: COLORS.gold, letterSpacing: 8, marginBottom: 4 },
  headerTitle: { fontFamily: FONTS.amiriBold, fontSize: 24, color: COLORS.goldLight },

  modeTabs: {
    flexDirection: 'row', backgroundColor: COLORS.deep2,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.2)',
    marginTop: SPACING.sm,
  },
  modeTab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  modeTabActive: { borderBottomColor: COLORS.gold },
  modeTabText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.muted },
  modeTabTextActive: { color: COLORS.goldLight, fontFamily: FONTS.cairoBold },

  // Adab
  adabIntro: {
    backgroundColor: 'rgba(201,146,46,0.07)', borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.2)',
  },
  adabIntroTitle: { fontFamily: FONTS.amiriBold, fontSize: 20, color: COLORS.goldLight, marginBottom: 6 },
  adabIntroSub: { fontFamily: FONTS.amiri, fontSize: 13, color: COLORS.cream3, lineHeight: 24 },
  adabCard: {
    flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.deep2,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)', alignItems: 'flex-start',
  },
  adabNumWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  adabNum: { fontFamily: FONTS.cairoBold, fontSize: 14, color: COLORS.deep },
  adabContent: { flex: 1 },
  adabTitle: { fontFamily: FONTS.cairoBold, fontSize: 13, color: COLORS.goldLight, marginBottom: 4 },
  adabText: { fontFamily: FONTS.amiri, fontSize: 15, color: COLORS.cream2, lineHeight: 26 },
  tipsBox: {
    backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.sm, borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)',
  },
  tipsTitle: { fontFamily: FONTS.cairoBold, fontSize: 15, color: COLORS.goldLight, marginBottom: SPACING.md },
  tipItem: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  tipDot: { color: COLORS.gold, fontSize: 10, marginTop: 5 },
  tipText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.cream3, flex: 1, lineHeight: 22 },

  // Categories
  catScroll: { maxHeight: 56 },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.25)', backgroundColor: COLORS.deep2,
  },
  catPillText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream3 },
  catPillTextActive: { color: COLORS.deep, fontFamily: FONTS.cairoBold },

  moodBox: {
    backgroundColor: 'rgba(201,146,46,0.05)', borderRightWidth: 3,
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.md,
  },
  moodText: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, lineHeight: 28 },

  duaaCard: {
    backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)', overflow: 'hidden',
  },
  duaaHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  duaaNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  duaaNumText: { fontFamily: FONTS.cairoBold, fontSize: 12 },
  duaaSrc: { flex: 1, fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted },
  duaaArrow: { color: COLORS.muted, fontSize: 11 },
  duaaBody: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
    borderTopWidth: 1, borderTopColor: 'rgba(201,146,46,0.08)', paddingTop: SPACING.md,
  },
  duaaArabic: {
    fontFamily: FONTS.amiri, fontSize: 18, color: COLORS.cream,
    lineHeight: 34, textAlign: 'right',
  } as any,
  noteBox: {
    borderRightWidth: 2, borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginVertical: SPACING.sm,
    backgroundColor: 'rgba(245,200,66,0.05)',
  },
  noteText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream3, lineHeight: 20 },
  duaaRef: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 6 },
});
