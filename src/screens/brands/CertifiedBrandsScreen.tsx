import React, { useCallback } from 'react';
import { View, Text, RefreshControl, Pressable, BackHandler, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute, type RouteProp, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../api';
import type { Brand, Envelope, Paginated } from '../../api/types';
import { Card, CardGridSkeleton, EmptyState, ListFooterLoader, MediaFrame } from '../../components/ui';
import { colors, useNavColors } from '../../theme/tokens';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList, TabParamList } from '../../navigation/types';

/** RN port of `frontend/apps/web/src/pages/certified-brands.tsx`. */
export function CertifiedBrandsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CertifiedBrands'>>();
  const nav = useNavColors();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);
  const topPadding = topInset + 8;
  const fromDrawer = route.params?.fromDrawer;

  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['brands', 'certified-infinite'],
    queryFn: ({ pageParam, signal }) =>
      api.get<Paginated<Brand>>('/certified-brands', { page: pageParam, per_page: 20 }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage: Paginated<Brand>) => {
      if (lastPage?.meta) {
        return lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined;
      }
      return undefined;
    },
    staleTime: 5 * 60_000,
  });

  useFocusEffect(
    useCallback(() => {
      if (fromDrawer) {
        const onBackPress = () => {
          navigation.navigate('Tabs', { screen: 'Home', params: { openDrawer: true } });
          return true;
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }
    }, [fromDrawer, navigation])
  );

  const rawBrands = data?.pages.flatMap((p: Paginated<Brand>) => p.data ?? []) ?? [];
  const brands = rawBrands
    .slice()
    .sort((a, b) => {
      const aHasLogo = !!a.logo_url;
      const bHasLogo = !!b.logo_url;
      if (aHasLogo && !bHasLogo) return -1;
      if (!aHasLogo && bHasLogo) return 1;
      return 0;
    });

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      {/* Custom Header with Back Button (conditionally shown) */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-ink-100 dark:border-ink-800"
        style={{ backgroundColor: nav.headerBackground, paddingTop: fromDrawer ? topPadding : 12 }}
      >
        {fromDrawer && (
          <Pressable
            onPress={() => navigation.navigate('Tabs', { screen: 'Home', params: { openDrawer: true } })}
            className="p-2 -ml-2 mr-2 active:bg-ink-50 dark:active:bg-ink-800 rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color={nav.headerTint} />
          </Pressable>
        )}
        <Text className="text-xl font-bold" style={{ color: nav.headerTint }}>
          Certified Brands
        </Text>
      </View>

      <View className="flex-1 p-4">
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
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} colors={[colors.brand[500]]} />
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item: brand }) => (
              <View style={{ flex: 1, paddingHorizontal: 6 }}>
                <Card pressable onPress={() => navigation.navigate('BrandDetail', { slug: brand.slug })} className="items-center gap-2 p-4">
                  <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="lg" className="w-full" />
                  <Text className="text-center text-sm font-semibold text-ink-900 dark:text-white" numberOfLines={1}>
                    {brand.name}
                  </Text>
                  {typeof brand.products_count === 'number' && brand.products_count > 0 ? (
                    <Text className="text-xs text-ink-500 dark:text-ink-400">
                      {brand.products_count} tested product{brand.products_count === 1 ? '' : 's'}
                    </Text>
                  ) : null}
                </Card>
              </View>
            )}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            ListFooterComponent={<ListFooterLoader visible={isFetchingNextPage} />}
          />
        )}
      </View>
    </View>
  );
}
