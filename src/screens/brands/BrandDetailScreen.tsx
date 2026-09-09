import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBrand, useBrandProducts } from '../../api';
import { Button, CardGridSkeleton, EmptyState, MediaFrame, Pagination } from '../../components/ui';
import { ProductCard } from '../../components/ProductCard';
import { FadeIn, StaggerChildren } from '../../components/motion';
import { usePullToRefresh } from '../../lib/usePullToRefresh';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

/** RN port of `frontend/apps/web/src/pages/brand-detail.tsx`. */
type Props = NativeStackScreenProps<RootStackParamList, 'BrandDetail'>;

export function BrandDetailScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const [page, setPage] = useState(1);
  const { data: brandRes, isError, refetch: refetchBrand } = useBrand(slug);
  const { data: products, isLoading, refetch: refetchProducts } = useBrandProducts(slug, { page, per_page: 12 });
  const brand = brandRes?.data;
  const { refreshing, onRefresh } = usePullToRefresh([refetchBrand, refetchProducts]);

  if (isError) {
    return (
      <View className="flex-1 justify-center px-6">
        <EmptyState title="Brand not found" action={<Button variant="outline" onPress={() => navigation.navigate('CertifiedBrands')}>All certified brands</Button>} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-surface-1"
      contentContainerClassName="p-4 pb-16"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand[500]]} />}
    >
      {brand ? (
        <FadeIn>
          <View className="flex-row items-center gap-4">
            <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="xl" className="size-20" />
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ink-900 dark:text-white">{brand.name}</Text>
              {brand.description ? <Text className="mt-1 text-sm text-ink-600 dark:text-ink-300" numberOfLines={3}>{brand.description}</Text> : null}
            </View>
          </View>
        </FadeIn>
      ) : null}

      <View className="mt-8">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : !products || products.data.length === 0 ? (
          <EmptyState title="No tested products yet" description="This brand's results will appear here once published." />
        ) : (
          <>
            <StaggerChildren className="flex-row flex-wrap justify-between gap-y-4">
              {products.data.map((product) => (
                <View key={product.id} className="w-[48%]">
                  <ProductCard product={product} />
                </View>
              ))}
            </StaggerChildren>
            <Pagination page={page} lastPage={products.meta.last_page} onPageChange={setPage} className="mt-8" />
          </>
        )}
      </View>
    </ScrollView>
  );
}
