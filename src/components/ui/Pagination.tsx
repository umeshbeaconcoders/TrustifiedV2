import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

/** RN port of `frontend/packages/ui/src/components/pagination.tsx` — used on screens with a fixed page picker instead of infinite scroll (e.g. Brand detail). */
export function Pagination({
  page,
  lastPage,
  onPageChange,
  className = '',
}: {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (lastPage <= 1) return null;
  return (
    <View className={`flex-row items-center justify-center gap-3 ${className}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        disabled={page <= 1}
        onPress={() => onPageChange(page - 1)}
        className={`size-10 items-center justify-center rounded-full border border-ink-200 ${page <= 1 ? 'opacity-40' : ''}`}>
        <ChevronLeft size={18} color={colors.ink[700]} />
      </Pressable>
      <Text className="text-sm font-semibold text-ink-700 dark:text-ink-200">
        Page {page} of {lastPage}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next page"
        disabled={page >= lastPage}
        onPress={() => onPageChange(page + 1)}
        className={`size-10 items-center justify-center rounded-full border border-ink-200 ${page >= lastPage ? 'opacity-40' : ''}`}>
        <ChevronRight size={18} color={colors.ink[700]} />
      </Pressable>
    </View>
  );
}
