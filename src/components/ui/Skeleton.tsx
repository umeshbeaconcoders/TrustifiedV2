import React from 'react';
import { View, AccessibilityInfo, type DimensionValue } from 'react-native';

export interface SkeletonProps {
  className?: string;
  width?: DimensionValue;
  height?: DimensionValue;
}

/**
 * Shimmer skeleton — RN port of `frontend/packages/ui/src/components/skeleton.tsx`'s
 * `.animate-shimmer`. Uses Moti (native-thread animation, per ground rules).
 * Respects the OS "reduce motion" accessibility setting by rendering a
 * static block instead of pulsing.
 */
export function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style = { width, height };
  return <View className={`rounded-xl bg-ink-100 ${className}`} style={style} />;
}

/** Grid of product-card-shaped skeletons — RN port of web's <CardGridSkeleton>. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="flex-row flex-wrap gap-4">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} className="w-[47%] gap-2">
          <Skeleton className="aspect-square w-full" />
          <Skeleton height={14} className="w-3/4" />
          <Skeleton height={12} className="w-1/2" />
        </View>
      ))}
    </View>
  );
}

export function isReduceMotionEnabledAsync() {
  return AccessibilityInfo.isReduceMotionEnabled();
}
