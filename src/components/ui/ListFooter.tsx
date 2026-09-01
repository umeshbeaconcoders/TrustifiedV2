import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/tokens';

/** FlashList `ListFooterComponent` for infinite-scroll fetch-next-page loading state. */
export function ListFooterLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View className="items-center py-6">
      <ActivityIndicator size="small" color={colors.brand[600]} />
    </View>
  );
}
