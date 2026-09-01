/**
 * NativeWind v4 theme — ported 1:1 (as hex fallbacks) from the web design
 * tokens in `frontend/packages/ui/src/styles.css`. That file defines the
 * brand ramps in oklch(); RN's older color parser doesn't reliably support
 * oklch(), so every token here is pinned to a hex value sampled from the
 * documented anchors/oklch coordinates (see comments next to each token,
 * cross-referenced against styles.css line numbers as of this port).
 *
 * Keep this file in sync BY CONVENTION with styles.css — there is no shared
 * package between frontend/ (pnpm workspace) and react-native/ (bare CLI,
 * own package.json), see Section 0 ("GROUND RULES") of
 * REACT_NATIVE_INSTRUCTIONS.md.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── BRAND GREEN — anchor #2ab841 (HSL 130,63%,44%) ── styles.css:16-26
        brand: {
          50: '#eafbee',
          100: '#d1f5d9',
          200: '#a6ebb6',
          300: '#72da8d',
          400: '#48c869',
          500: '#2ab841', // exact anchor
          600: '#1f9a35',
          700: '#1c7a2d',
          800: '#1a6027',
          900: '#164f22',
          950: '#0a2c11',
        },
        // ── GOLD / ORANGE — anchor #f9b531 (HSL 40,94%,58%) ── styles.css:29-44
        gold: {
          DEFAULT: '#f9b531',
          strong: '#e0932a',
          soft: '#fef6e4',
          50: '#fef8ec',
          100: '#fceccb',
          200: '#fadb9c',
          300: '#f7c66a',
          400: '#f9b531', // exact anchor
          600: '#dc9a1f',
          700: '#b97b16',
          800: '#935f11',
          900: '#6d470c',
        },
        // ── BLUE — anchor #164595 (HSL 218,74%,34%) ── styles.css:47-60
        blue: {
          50: '#eef3fb',
          100: '#d3e0f4',
          200: '#a7c1e9',
          300: '#7aa2de',
          400: '#4d83d3',
          500: '#2a63bb',
          600: '#164595', // exact anchor
          700: '#123574',
          800: '#0e285a',
          900: '#0a1c40',
          950: '#06101f',
        },
        info: { DEFAULT: '#164595', soft: '#eef3fb', strong: '#123574' },

        // ── SEMANTIC PASS (= brand green) ── styles.css:69-72
        pass: { DEFAULT: '#2ab841', strong: '#1c7a2d', soft: '#eafbee' },
        // ── SEMANTIC FAIL — oklch(0.59 0.215 25) ≈ strong red ── styles.css:75-77
        fail: { DEFAULT: '#dc2626', strong: '#b91c1c', soft: '#fef2f2' },

        // ── INK NEUTRALS — charcoal w/ tiny green bias ── styles.css:84-94
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
        // ── DARK SURFACES — anchor #141515 ── styles.css:100-104
        surface: {
          0: '#141515',
          1: '#1c1e1e',
          2: '#262929',
          3: '#313535',
          4: '#3d4242',
        },
        // ── ACCENT (alias of gold, non-gold-semantic contexts) ── styles.css:110-113
        accent: {
          300: '#f7c66a',
          400: '#f9b531',
          500: '#e0932a',
          600: '#c77c1a',
        },
      },
      fontFamily: {
        // PostScript names — actual .ttf/.otf files must be dropped into
        // src/assets/fonts/ and linked natively (see that folder's README).
        sans: ['Inter'],
        display: ['Sora'],
        mono: ['JetBrains Mono'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [],
};
