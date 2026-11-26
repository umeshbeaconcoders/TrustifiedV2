import React from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import { Logo, LogoWhite } from '../../assets';

// Generated from src/assets/Trustified.JPG.jpeg as crisp transparent PNGs (903x168).
const LOGO_ASPECT_RATIO = 903 / 168;

/**
 * Official Trustified transparent wordmark logo.
 * - `variant="light"` (default): black wordmark + green check for light backgrounds.
 * - `variant="dark"`: white wordmark + green check for dark backgrounds (#141515 / #0b0f19).
 */
export function TrustifiedLogo({
  height = 24,
  variant = 'light',
  style,
}: {
  height?: number;
  variant?: 'light' | 'dark';
  style?: ViewStyle;
}) {
  const width = Math.round(height * LOGO_ASPECT_RATIO);
  const image = (
    <Image
      source={variant === 'dark' ? LogoWhite : Logo}
      resizeMode="contain"
      accessibilityLabel="Trustified"
      style={{ width, height }}
    />
  );

  return style ? <View style={style}>{image}</View> : image;
}
