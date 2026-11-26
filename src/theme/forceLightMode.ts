import { Appearance } from 'react-native';

/**
 * Enforce Light Mode synchronously BEFORE NativeWind (`react-native-css-interop`)
 * imports and reads `Appearance.getColorScheme()` into `systemColorScheme`.
 */
try {
  Appearance.setColorScheme('light');
  (Appearance as { getColorScheme: () => 'light' }).getColorScheme = () => 'light';
} catch {
  // Ignore if Appearance host object is read-only.
}
