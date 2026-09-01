import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  pressable?: boolean;
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}

/** RN port of `frontend/packages/ui/src/components/card.tsx`. */
export function Card({ pressable, onPress, className = '', children, ...rest }: CardProps) {
  const base = `rounded-2xl border border-ink-200 bg-white ${className}`;
  if (pressable || onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className={base}
        style={({ pressed }) => [pressed ? { opacity: 0.9 } : null]}>
        {children}
      </Pressable>
    );
  }
  return (
    <View className={base} {...rest}>
      {children}
    </View>
  );
}
