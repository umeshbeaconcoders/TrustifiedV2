import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/tokens';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <View className={`items-center justify-center py-10 ${className}`}>
      <ActivityIndicator size="large" color={colors.brand[600]} />
    </View>
  );
}
