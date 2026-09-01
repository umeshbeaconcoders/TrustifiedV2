import React from 'react';
import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCertifiedBrands } from '../../api';
import { Card, CardGridSkeleton, EmptyState, MediaFrame } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';

/** RN port of `frontend/apps/web/src/pages/certified-brands.tsx`. */
export function CertifiedBrandsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading } = useCertifiedBrands();
  const brands = (data?.data ?? [])
    .slice()
    .sort((a, b) => {
      const aHasLogo = !!a.logo_url;
      const bHasLogo = !!b.logo_url;
      if (aHasLogo && !bHasLogo) return -1;
      if (!aHasLogo && bHasLogo) return 1;
      return 0;
    });

  return (
    <View className="flex-1 bg-white p-4">
      {isLoading ? (
        <CardGridSkeleton count={8} />
      ) : brands.length === 0 ? (
        <EmptyState title="No certified brands yet" />
      ) : (
        <FlashList
          data={brands}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          estimatedItemSize={160}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: brand }) => (
            <View style={{ flex: 1, paddingHorizontal: 6 }}>
              <Card pressable onPress={() => navigation.navigate('BrandDetail', { slug: brand.slug })} className="items-center gap-2 p-4">
                <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="lg" className="w-full" />
                <Text className="text-center text-sm font-semibold text-ink-900" numberOfLines={1}>
                  {brand.name}
                </Text>
                {typeof brand.products_count === 'number' && brand.products_count > 0 ? (
                  <Text className="text-xs text-ink-500">
                    {brand.products_count} tested product{brand.products_count === 1 ? '' : 's'}
                  </Text>
                ) : null}
              </Card>
            </View>
          )}
        />
      )}
    </View>
  );
}
