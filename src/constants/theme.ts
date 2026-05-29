export const COLORS = { // dark theme (default)
  // Core dark backgrounds — layered depth
  deep: '#060D16',
  deep2: '#0B1622',
  deep3: '#11202F',
  deep4: '#182B3D',

  // Gold — warm, rich, luminous
  gold: '#C9922E',
  goldLight: '#F5C842',
  goldDark: '#7A5518',
  goldSoft: 'rgba(201,146,46,0.10)',
  goldGlow: 'rgba(245,200,66,0.18)',

  // Emerald green — life and hope
  green: '#1C4A38',
  green2: '#25654E',
  green3: '#3CA87C',
  greenGlow: 'rgba(60,168,124,0.15)',

  // Sapphire blue — serenity and depth
  blue: '#192B52',
  blue2: '#224075',
  blue3: '#4A7EC7',
  blueGlow: 'rgba(74,126,199,0.15)',

  // Rose — compassion and love
  pink: '#5C1E36',
  rose: '#A83060',
  roseGlow: 'rgba(168,48,96,0.15)',

  // Amethyst — wisdom and reflection
  purple: '#261846',
  purple2: '#8050C0',
  purpleGlow: 'rgba(128,80,192,0.15)',

  // Warm amber — joy
  amber: '#7A3A10',
  amber2: '#D06020',
  amberGlow: 'rgba(208,96,32,0.15)',

  // Text & UI
  cream: '#F5EDD8',
  cream2: '#EAD09A',
  cream3: '#C5A06A',
  white: '#FDFAF4',
  muted: '#6A5D45',
  mutedLight: '#9A8B6A',

  // Status
  error: '#C0392B',
  transparent: 'transparent',
  // Tints used for dividers / progress-bar tracks (change by theme)
  borderTint: 'rgba(255,255,255,0.06)',
  bgTint: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.72)',
};

export type ThemeColors = typeof COLORS;

export const LIGHT_COLORS: ThemeColors = {
  deep:  '#F2EDE0',
  deep2: '#FFFFFF',
  deep3: '#EAE4D4',
  deep4: '#E2DBC8',

  gold:      '#C9922E',
  goldLight: '#7A5000',
  goldDark:  '#5A3A00',
  goldSoft:  'rgba(201,146,46,0.12)',
  goldGlow:  'rgba(201,146,46,0.22)',

  green:     '#E0F0E8',
  green2:    '#25654E',
  green3:    '#1A7A58',
  greenGlow: 'rgba(26,122,88,0.15)',

  blue:     '#E0E8F5',
  blue2:    '#224075',
  blue3:    '#2050A8',
  blueGlow: 'rgba(32,80,168,0.15)',

  pink:     '#F5E0EC',
  rose:     '#A83060',
  roseGlow: 'rgba(168,48,96,0.15)',

  purple:     '#EEE0F5',
  purple2:    '#6040A0',
  purpleGlow: 'rgba(96,64,160,0.15)',

  amber:     '#F5ECE0',
  amber2:    '#D06020',
  amberGlow: 'rgba(208,96,32,0.15)',

  cream:     '#1A1008',
  cream2:    '#3C2410',
  cream3:    '#6A4828',
  white:     '#FDFAF4',
  muted:     '#8A7860',
  mutedLight:'#6A5840',

  error:       '#C0392B',
  transparent: 'transparent',
  borderTint:  'rgba(0,0,0,0.08)',
  bgTint:      'rgba(0,0,0,0.05)',
  overlay:     'rgba(0,0,0,0.60)',
};

export const FONTS = {
  amiri: 'Amiri_400Regular',
  amiriBold: 'Amiri_700Bold',
  cairo: 'Cairo_400Regular',
  cairoBold: 'Cairo_700Bold',
  cairoLight: 'Cairo_300Light',
  cairoSemiBold: 'Cairo_600SemiBold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SHADOWS = {
  gold: {
    shadowColor: COLORS.goldLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
