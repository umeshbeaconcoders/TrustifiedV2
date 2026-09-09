import React from 'react';
import { View, Text } from 'react-native';
import { SearchX } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** RN port of `frontend/packages/ui/src/components/empty-state.tsx`. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 px-6 py-16">
      <View className="size-16 items-center justify-center rounded-full bg-ink-50 dark:bg-surface-2">
        {icon ?? <SearchX size={28} color={colors.ink[300]} />}
      </View>
      <Text className="text-center text-lg font-bold text-ink-900 dark:text-white">{title}</Text>
      {description ? <Text className="max-w-xs text-center text-sm text-ink-500 dark:text-ink-400">{description}</Text> : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  );
}
