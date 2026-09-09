import React, { useState } from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import FastImage, { type Source } from 'react-native-fast-image';
import { ImageOff } from 'lucide-react-native';
import { colors } from '../../theme/tokens';
import { mediaUrl } from '../../api/client';

export interface MediaFrameProps {
  src?: string | null;
  alt?: string;
  aspect?: 'square' | 'video' | 'auto';
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  style?: ViewStyle;
}

const aspectRatios: Record<NonNullable<MediaFrameProps['aspect']>, number | undefined> = {
  square: 1,
  video: 16 / 9,
  auto: undefined,
};

const roundedClasses: Record<NonNullable<MediaFrameProps['rounded']>, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

/**
 * RN port of `frontend/packages/ui/src/components/media-frame.tsx` —
 * FastImage (disk+memory cache, fade-in) inside a soft-gradient-equivalent
 * frame, with a graceful fallback initials/icon on load failure/empty src. Per
 * ground rules, every image in this app goes through this component (or
 * FastImage directly) instead of RN's built-in <Image>.
 */
export function MediaFrame({ src, alt, aspect = 'square', rounded = 'xl', className = '', style }: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const resolved = mediaUrl(src ?? undefined) ?? (src ?? undefined);
  const ratio = aspectRatios[aspect];

  return (
    <View
      className={`items-center justify-center overflow-hidden bg-ink-50 ${roundedClasses[rounded]} ${className}`}
      style={[ratio ? { aspectRatio: ratio } : null, style]}>
      {resolved && !failed ? (
        <FastImage
          source={{ uri: resolved, priority: FastImage.priority.normal } as Source}
          resizeMode={FastImage.resizeMode.contain}
          style={{ width: '100%', height: '100%' }}
          onError={() => setFailed(true)}
          accessibilityLabel={alt}
        />
      ) : alt ? (
        <View className="w-full h-full bg-ink-100 dark:bg-surface-2 items-center justify-center">
          <Text className="text-base font-bold text-ink-600 dark:text-ink-300 uppercase">
            {getInitials(alt)}
          </Text>
        </View>
      ) : (
        <ImageOff size={28} color={colors.ink[300]} accessibilityLabel="Image unavailable" />
      )}
    </View>
  );
}
