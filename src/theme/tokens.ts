/**
 * Plain-JS mirror of tailwind.config.js's color ramp, for contexts that
 * cannot take a NativeWind className (icon `color` props, StatusBar,
 * ActivityIndicator, chart libs, etc). Keep in sync with tailwind.config.js
 * by hand — see the comment header there for the styles.css provenance of
 * each value.
 */
export const colors = {
  brand: {
    50: '#eafbee',
    100: '#d1f5d9',
    200: '#a6ebb6',
    300: '#72da8d',
    400: '#48c869',
    500: '#2ab841',
    600: '#1f9a35',
    700: '#1c7a2d',
    800: '#1a6027',
    900: '#164f22',
    950: '#0a2c11',
  },
  gold: {
    DEFAULT: '#f9b531',
    strong: '#e0932a',
    soft: '#fef6e4',
    50: '#fef8ec',
    100: '#fceccb',
    200: '#fadb9c',
    300: '#f7c66a',
    400: '#f9b531',
    600: '#dc9a1f',
    700: '#b97b16',
    800: '#935f11',
    900: '#6d470c',
  },
  blue: {
    50: '#eef3fb',
    100: '#d3e0f4',
    200: '#a7c1e9',
    300: '#7aa2de',
    400: '#4d83d3',
    500: '#2a63bb',
    600: '#164595',
    700: '#123574',
    800: '#0e285a',
    900: '#0a1c40',
    950: '#06101f',
  },
  pass: { DEFAULT: '#2ab841', strong: '#1c7a2d', soft: '#eafbee' },
  fail: { DEFAULT: '#dc2626', strong: '#b91c1c', soft: '#fef2f2' },
  ink: {
    50: '#f8faf9',
    100: '#eef2f0',
    200: '#dbe4e0',
    300: '#c1cec8',
    400: '#94a69d',
    500: '#6b7d74',
    600: '#4f5f57',
    700: '#3a4740',
    800: '#262f2a',
    900: '#171e1a',
    950: '#0d1210',
  },
  surface: {
    0: '#141515',
    1: '#1c1e1e',
    2: '#262929',
    3: '#313535',
    4: '#3d4242',
  },
  white: '#ffffff',
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
} as const;

/** Semantic badge variant → color mapping, matches web's Badge component. */
export const badgeVariants = {
  pass: { bg: colors.pass.soft, fg: colors.pass.strong, border: colors.brand[200] },
  fail: { bg: colors.fail.soft, fg: colors.fail.strong, border: '#fecaca' },
  gold: { bg: colors.gold.soft, fg: colors.gold[800], border: colors.gold[200] },
  info: { bg: colors.blue[50], fg: colors.blue[700], border: colors.blue[200] },
  warning: { bg: '#fffbeb', fg: '#92400e', border: '#fde68a' },
  neutral: { bg: colors.ink[100], fg: colors.ink[700], border: colors.ink[200] },
} as const;

export type BadgeVariant = keyof typeof badgeVariants;
