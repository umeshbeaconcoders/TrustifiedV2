import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

/** Read-only star display — RN port of `frontend/packages/ui/src/components/star-rating.tsx`. */
export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <View className="flex-row items-center gap-0.5" accessibilityLabel={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          color={colors.gold[400]}
          fill={i < rounded ? colors.gold[400] : 'transparent'}
        />
      ))}
    </View>
  );
}

/** Interactive star picker with a label — RN port of web's <StarInput> used in the review form. */
export function StarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-ink-100 dark:border-ink-800 py-3">
      <Text className="flex-1 pr-3 text-sm text-ink-700 dark:text-ink-200">{label}</Text>
      <View className="flex-row gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${starValue} out of 5 for ${label}`}
              hitSlop={6}
              onPress={() => onChange(starValue)}>
              <Star
                size={24}
                color={colors.gold[400]}
                fill={starValue <= value ? colors.gold[400] : 'transparent'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
