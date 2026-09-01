import React from 'react';
import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCategoryRankings } from '../../api';
import { CardGridSkeleton, EmptyState } from '../../components/ui';
import { ProductCard } from '../../components/ProductCard';
import type { RootStackParamList } from '../../navigation/types';

/** RN port of `frontend/apps/web/src/pages/rankings-category.tsx` — ranked product list for one category. */
type Props = NativeStackScreenProps<RootStackParamList, 'RankingsCategory'>;

export function RankingsCategoryScreen({ route }: Props) {
  const { slug } = route.params;
  const { data, isLoading, isError } = useCategoryRankings(slug);
  const products = Array.isArray(data?.data) ? data.data : [];

  return (
    <View className="flex-1 bg-white p-4">
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <EmptyState title="Couldn't load rankings" description="The server didn't respond. Please retry in a moment." />
      ) : products.length === 0 ? (
        <EmptyState title="No rankings yet" description="This category doesn't have published rankings yet." />
      ) : (
        <FlashList
          data={products}
          keyExtractor={(item) => String(item.id)}
          estimatedItemSize={100}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: product, index }) => (
            <View className="flex-row items-center gap-3">
              <View className="size-8 items-center justify-center rounded-full bg-ink-100">
                <Text className="text-sm font-extrabold text-ink-700">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <ProductCard product={product} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
