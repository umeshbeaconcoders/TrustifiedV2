import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MediaFrame, StatusBadge, StarRating } from './ui';
import type { Product } from '../api/types';
import type { RootStackParamList } from '../navigation/types';

/** RN port of `frontend/apps/web/src/components/product-card.tsx`. */
export function ProductCard({
  product,
  to = 'ProductDetail',
  showRating = true,
}: {
  product: Product;
  to?: 'ProductDetail' | 'ReportDetail';
  showRating?: boolean;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      onPress={() => navigation.navigate(to, { slug: product.slug })}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="w-full overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 active:opacity-90">
      <MediaFrame src={product.image_url} alt={product.name} aspect="square" rounded="lg" className="m-2" />
      <View className="gap-1 px-3 pb-3">
        {product.brand ? (
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-brand-700" numberOfLines={1}>
            {product.brand.name}
          </Text>
        ) : null}
        <Text className="text-sm font-bold text-ink-900 dark:text-white" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          {product.status !== 'untested' ? <StatusBadge status={product.status} isGold={product.is_gold} size="sm" /> : null}
          {showRating && product.reviews_count > 0 ? (
            <View className="flex-row items-center gap-1">
              <StarRating value={product.rating_avg} size={11} />
              <Text className="text-[11px] text-ink-500 dark:text-ink-400">({product.reviews_count})</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
