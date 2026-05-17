export const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export const HARAM_MONTHS = [0, 6, 10, 11]; // محرم، رجب، ذو القعدة، ذو الحجة

export const MONTH_VIRTUES: Record<number, string> = {
  0: 'أول أشهر السنة الهجرية وأحد الأشهر الحُرم. يُستحب فيه صيام يوم عاشوراء (١٠ محرم) وصيام التاسع معه.',
  1: 'شهر صفر، استمرار على الطاعات والعبادات.',
  2: 'شهر مولد سيد الخلق محمد ﷺ. يُكثر فيه من الصلاة على النبي الكريم.',
  3: 'ربيع الثاني، استمرار للعبادة والتقرب إلى الله.',
  4: 'جمادى الأولى، شهر للنوافل والذكر والتقرب إلى الله.',
  5: 'جمادى الثانية، استعداد لموسم رجب ثم شعبان ثم رمضان.',
  6: 'أحد الأشهر الحُرم الأربعة. وفيه ليلة الإسراء والمعراج ٢٧ رجب.',
  7: 'شعبان شهر الغفلة وفيه تُرفع الأعمال. كان النبي ﷺ يكثر فيه من الصيام.',
  8: 'سيد الشهور، شهر الصيام والقرآن. فيه ليلة القدر خير من ألف شهر.',
  9: 'شهر شوال وفيه عيد الفطر. ومن صام ستة أيام من شوال كان كصيام الدهر.',
  10: 'أحد الأشهر الحُرم. شهر الاستعداد لموسم الحج والتقرب إلى الله.',
  11: 'أفضل أيام الدنيا هي العشر الأوائل منه. فيه يوم عرفة أفضل الأيام ويوم الأضحى.',
};

export interface IslamicEvent {
  id: string;
  title: string;
  hijriDay: number;
  hijriMonth: number;
  icon: string;
  color: 'gold' | 'green' | 'blue';
  significance: string;
  amaal: string[];
  hadith?: string;
  hadithRef?: string;
  hasDayPlan?: boolean;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'ashara_dhul_hijjah',
    title: 'عشر ذي الحجة',
    hijriDay: 1,
    hijriMonth: 11,
    icon: '✨',
    color: 'green',
    significance: 'أفضل أيام الدنيا. العمل الصالح فيها أحب إلى الله من سائر الأيام.',
    amaal: [
      'الصلاة في وقتها',
      'صلاة الضحى',
      'قيام الليل',
      'التكبير والتهليل والتحميد',
      'قراءة ورد قرآني يومي',
      'الصدقة',
      'صيام التسع الأوائل',
      'أذكار الصباح والمساء',
      'الصلاة على النبي ﷺ',
      'الاستغفار',
    ],
    hadith: 'ما من أيام العمل الصالح فيهن أحب إلى الله من هذه الأيام العشر',
    hadithRef: 'رواه البخاري',
    hasDayPlan: false,
  },
  {
    id: 'arafa',
    title: 'يوم عرفة',
    hijriDay: 9,
    hijriMonth: 11,
    icon: '🌄',
    color: 'gold',
    significance: 'أعظم أيام السنة. يوم تُرفع الأيادي تضرعًا وتُكفَّر السنوات.',
    amaal: [
      'صيام يوم عرفة',
      'الإكثار من الدعاء',
      'قراءة القرآن',
      'إخراج الصدقة',
      'الاستغفار',
      'التكبير والتهليل',
      'الصلاة على النبي ﷺ',
      'صلاة الظهر والعصر في وقتهما',
    ],
    hadith: 'صيام يوم عرفة أحتسب على الله أن يكفر السنة التي قبله والسنة التي بعده',
    hadithRef: 'رواه مسلم',
    hasDayPlan: true,
  },
  {
    id: 'eid_adha',
    title: 'عيد الأضحى',
    hijriDay: 10,
    hijriMonth: 11,
    icon: '🐑',
    color: 'gold',
    significance: 'يوم النحر، أعظم أيام الله وأحبها إليه.',
    amaal: [
      'التكبير من فجر عرفة',
      'صلاة العيد',
      'الأضحية',
      'صلة الرحم وزيارة الأهل',
      'إطعام الطعام والصدقة',
    ],
    hadith: 'ما عمل ابن آدم يوم النحر عملاً أحب إلى الله من إهراق الدم',
    hadithRef: 'رواه الترمذي',
    hasDayPlan: false,
  },
  {
    id: 'eid_fitr',
    title: 'عيد الفطر',
    hijriDay: 1,
    hijriMonth: 9,
    icon: '🌙',
    color: 'gold',
    significance: 'جائزة الله للصائمين بعد رمضان المبارك.',
    amaal: [
      'تكبيرات العيد',
      'صلاة العيد',
      'إخراج زكاة الفطر',
      'صلة الأرحام',
      'الأكل قبل الصلاة من التمر',
      'السلام على الجميع',
    ],
    hadith: '',
    hadithRef: '',
    hasDayPlan: false,
  },
  {
    id: 'ashura',
    title: 'يوم عاشوراء',
    hijriDay: 10,
    hijriMonth: 0,
    icon: '💧',
    color: 'blue',
    significance: 'يوم نجّى الله فيه موسى عليه السلام وقومه.',
    amaal: [
      'صيام يوم عاشوراء',
      'صيام يوم التاسع معه',
      'الإكثار من الذكر',
      'إخراج الصدقة',
    ],
    hadith: 'صيام يوم عاشوراء أحتسب على الله أن يكفر السنة التي قبله',
    hadithRef: 'رواه مسلم',
    hasDayPlan: false,
  },
  {
    id: 'isra_miraj',
    title: 'ليلة الإسراء والمعراج',
    hijriDay: 27,
    hijriMonth: 6,
    icon: '🌠',
    color: 'gold',
    significance: 'ليلة فُرضت فيها الصلاة وعُرج بالنبي ﷺ إلى السماوات العلا.',
    amaal: [
      'قيام الليل',
      'قراءة سورة الإسراء',
      'التأمل في نعمة الصلاة',
      'الصلاة على النبي ﷺ',
      'الاستغفار',
    ],
    hadith: '',
    hadithRef: '',
    hasDayPlan: false,
  },
  {
    id: 'nisf_shaban',
    title: 'ليلة النصف من شعبان',
    hijriDay: 15,
    hijriMonth: 7,
    icon: '🌕',
    color: 'gold',
    significance: 'ليلة تُرفع فيها الأعمال ويغفر الله لعباده.',
    amaal: [
      'إحياء الليل بالصلاة',
      'الاستغفار',
      'الدعاء',
      'الصدقة',
      'صيام اليوم الخامس عشر',
    ],
    hadith: '',
    hadithRef: '',
    hasDayPlan: false,
  },
  {
    id: 'ras_sana',
    title: 'رأس السنة الهجرية',
    hijriDay: 1,
    hijriMonth: 0,
    icon: '📅',
    color: 'blue',
    significance: 'بداية سنة هجرية جديدة، فرصة للتجديد والنية.',
    amaal: [
      'النية على الخير والطاعة',
      'وضع أهداف إيمانية للسنة',
      'الصيام في محرم',
      'الدعاء بالتوفيق',
    ],
    hadith: '',
    hadithRef: '',
    hasDayPlan: false,
  },
  {
    id: 'mawlid',
    title: 'المولد النبوي',
    hijriDay: 12,
    hijriMonth: 2,
    icon: '⭐',
    color: 'green',
    significance: 'ذكرى مولد سيد الخلق محمد ﷺ.',
    amaal: [
      'الإكثار من الصلاة على النبي ﷺ',
      'قراءة السيرة النبوية',
      'ذكر فضائله ﷺ',
      'الصدقة',
    ],
    hadith: '',
    hadithRef: '',
    hasDayPlan: false,
  },
];

export const ARAFA_DAY_PLAN = [
  {
    period: 'قبل الفجر',
    timeRange: 'قبل الأذان',
    icon: '🌙',
    tasks: [
      'تهجد وأذكار بالأسحار',
      'ورد قرآني للسحور',
      'نية صوم يوم عرفة',
    ],
  },
  {
    period: 'بعد الفجر إلى الشروق',
    timeRange: 'الفجر — الشروق',
    icon: '🌅',
    tasks: [
      'صلاة الفجر في وقتها',
      'أذكار بعد الصلاة',
      'أذكار الصباح',
      'ورد قرآني',
      'ورد الذكر (سبحان الله، الحمد لله، لا إله إلا الله، الله أكبر)',
      'ركعتا الشروق',
      'صلاة الضحى',
    ],
  },
  {
    period: 'من الظهر إلى العصر',
    timeRange: 'الظهر — العصر',
    icon: '☀️',
    tasks: [
      'صلاة الظهر',
      'أذكار بعد الصلاة',
      'ورد قرآني',
      'إخراج صدقة',
      'التكبير',
      'دعاء: لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير',
    ],
  },
  {
    period: 'من العصر إلى المغرب',
    timeRange: 'العصر — المغرب ⬤ الأهم',
    icon: '🌇',
    tasks: [
      'صلاة العصر',
      'أذكار بعد الصلاة',
      'أذكار المساء',
      'ورد الذكر',
      'الدعاء المتواصل حتى المغرب',
      'لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير',
    ],
  },
  {
    period: 'بعد المغرب',
    timeRange: 'المغرب — العشاء',
    icon: '🌙',
    tasks: [
      'صلاة المغرب',
      'أذكار المساء',
      'الإفطار والشكر لله',
      'صلاة العشاء',
      'قيام الليل',
    ],
  },
];

export const ASHARA_DAY_TASKS = [
  'الصلاة في وقتها',
  'صلاة الضحى',
  'قيام الليل',
  'التكبير (الله أكبر الله أكبر لا إله إلا الله والله أكبر الله أكبر ولله الحمد)',
  'قراءة ورد قرآني',
  'الصدقة',
  'صيام اليوم (١-٩)',
  'أذكار الصباح',
  'أذكار المساء',
  'الصلاة على النبي ﷺ',
  'الاستغفار',
];

export const DHIKR_LIST = [
  { id: 'subhan', text: 'سبحان الله', target: 33, transliteration: 'SubhanAllah' },
  { id: 'hamdulillah', text: 'الحمد لله', target: 33, transliteration: 'Alhamdulillah' },
  { id: 'allahu_akbar', text: 'الله أكبر', target: 33, transliteration: 'Allahu Akbar' },
  { id: 'la_ilaha', text: 'لا إله إلا الله', target: 100, transliteration: 'La ilaha illallah' },
  { id: 'istighfar', text: 'أستغفر الله', target: 100, transliteration: 'Astaghfirullah' },
  { id: 'salawat', text: 'اللهم صل على محمد', target: 100, transliteration: 'Allahumma salli ala Muhammad' },
  { id: 'takbir', text: 'الله أكبر كبيرا', target: 33, transliteration: 'Allahu Akbar Kabira' },
  { id: 'hawqala', text: 'لا حول ولا قوة إلا بالله', target: 33, transliteration: 'La hawla wala quwwata illa billah' },
];

export const MORNING_ADHKAR = [
  'أذكار الصباح كاملة',
  'آية الكرسي',
  'سورة الإخلاص ×٣',
  'سورة الفلق ×٣',
  'سورة الناس ×٣',
  'الدعاء: اللهم بك أصبحنا وبك أمسينا',
];

export const EVENING_ADHKAR = [
  'أذكار المساء كاملة',
  'آية الكرسي',
  'سورة الإخلاص ×٣',
  'سورة الفلق ×٣',
  'سورة الناس ×٣',
  'الدعاء: اللهم بك أمسينا وبك أصبحنا',
];

export const AFTER_PRAYER_ADHKAR = [
  'أستغفر الله ×٣',
  'اللهم أنت السلام ومنك السلام',
  'لا إله إلا الله وحده لا شريك له',
  'سبحان الله ×٣٣',
  'الحمد لله ×٣٣',
  'الله أكبر ×٣٣',
  'لا إله إلا الله وحده لا شريك له له الملك',
];

export const QURAN_PORTIONS = [
  { from: 'الفاتحة', to: 'آل عمران', juzFrom: 1, juzTo: 3 },
  { from: 'النساء', to: 'المائدة', juzFrom: 4, juzTo: 6 },
  { from: 'الأنعام', to: 'التوبة', juzFrom: 7, juzTo: 10 },
  { from: 'يونس', to: 'الإسراء', juzFrom: 11, juzTo: 15 },
  { from: 'الكهف', to: 'النور', juzFrom: 15, juzTo: 18 },
  { from: 'الفرقان', to: 'فاطر', juzFrom: 18, juzTo: 22 },
  { from: 'يس', to: 'الحديد', juzFrom: 22, juzTo: 27 },
  { from: 'المجادلة', to: 'الناس', juzFrom: 27, juzTo: 30 },
];

export const PRAYER_NAMES = [
  { key: 'Fajr', arabic: 'الفجر', sunnah: 'ركعتان قبلية' },
  { key: 'Sunrise', arabic: 'الشروق', sunnah: 'ركعتا الشروق' },
  { key: 'Dhuhr', arabic: 'الظهر', sunnah: '٤ قبلية · ٢ بعدية' },
  { key: 'Asr', arabic: 'العصر', sunnah: '٤ ركعة قبلية' },
  { key: 'Maghrib', arabic: 'المغرب', sunnah: '٢ بعدية' },
  { key: 'Isha', arabic: 'العشاء', sunnah: '٢ بعدية · الوتر' },
];
