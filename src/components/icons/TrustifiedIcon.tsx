import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

/**
 * The Trustified brand icon — dark green rounded square with white checkmark,
 * matching the favicon.svg used on the web:
 *   <rect width="32" height="32" rx="8" fill="#0b5e4a"/>
 *   <path d="M9 16.5l4.5 4.5L23 11.5" stroke="#fff" stroke-width="3.5" .../>
 */
export function TrustifiedIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#0b5e4a" />
      <Path
        d="M9 16.5l4.5 4.5L23 11.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
