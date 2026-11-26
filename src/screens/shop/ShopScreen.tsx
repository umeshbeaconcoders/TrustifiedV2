import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, InteractionManager } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShoppingBag, Search, LayoutGrid, Award } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBanners, useShopBrands, useShopSections } from '../../api';
import type { Brand, ShopSectionWithProducts } from '../../api/types';
import { BannerSlider } from '../../components/BannerSlider';
import { ShopCategoryRow } from '../../components/ShopCategoryRow';
import { InfiniteMarquee } from '../../components/InfiniteMarquee';
import { TapTarget } from '../../components/TapTarget';
import { TrustifiedLogo } from '../../components/icons/TrustifiedLogo';
import { TrustifiedStamp } from '../../components/icons/TrustifiedStamp';
import { RNGHScrollView } from '../../components/RNGHScrollView';
import { MediaFrame, CardGridSkeleton, EmptyState } from '../../components/ui';
import { colors, useNavColors } from '../../theme/tokens';
import { prefetchSecondaryTabsData, prefetchShopSection } from '../../api/prefetch';
import { preloadImages } from '../../lib/preloadImages';
import type { RootStackParamList } from '../../navigation/types';

/** Repeats a short list until it is at least `min` long, so a marquee strip always spans the screen. */
function fillTo<T>(list: T[], min: number): T[] {
  if (list.length === 0) return list;
  const out: T[] = [];
  while (out.length < min) out.push(...list);
  return out;
}

/**
 * Shop home — virtualized with FlashList + RNGH ScrollView so only visible category rows mount,
 * banners/images preload with FastImage, and tapping anywhere opens immediately.
 */
export function ShopScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const nav = useNavColors();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 47 : 24;
  const navigatingRef = useRef(false);

  const navigateShopSection = useCallback(
    (params: RootStackParamList['ShopSection']) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      setTimeout(() => {
        navigatingRef.current = false;
      }, 800);
      prefetchShopSection({ section: params?.slug, sub: params?.sub, brand: params?.brand });
      navigation.navigate('ShopSection', params);
    },
    [navigation],
  );

  const { data: sectionsRes, isLoading, isError, isRefetching, refetch } = useShopSections();
  const { data: shopBannersRes, refetch: refetchBanners } = useBanners('shop');
  const { data: footerBannersRes } = useBanners('footer');
  const { data: brandsRes, refetch: refetchBrands } = useShopBrands();

  const sections = useMemo(() => sectionsRes?.data ?? [], [sectionsRes]);
  const shopBanners = useMemo(() => shopBannersRes?.data ?? [], [shopBannersRes]);
  const footerBanners = useMemo(() => footerBannersRes?.data ?? [], [footerBannersRes]);
  const brands: Brand[] = useMemo(() => (Array.isArray(brandsRes?.data) ? brandsRes.data : []), [brandsRes]);
  const marqueeBrands = useMemo(() => fillTo(brands, 8), [brands]);

  // Warm image cache & background-prefetch Home/Products tabs once Shop settles
  useEffect(() => {
    if (sections.length === 0) return;
    const urls: (string | null | undefined)[] = [
      ...shopBanners.map((b) => b.image_url),
      ...footerBanners.map((b) => b.image_url),
      ...sections.map((s) => s.image_url),
      ...brands.slice(0, 12).map((b) => b.logo_url),
    ];
    preloadImages(urls, 'normal');

    const task = InteractionManager.runAfterInteractions(() => {
      prefetchSecondaryTabsData();
    });
    return () => task.cancel();
  }, [sections, shopBanners, footerBanners, brands]);

  const onRefresh = useCallback(() => {
    void Promise.all([refetch(), refetchBanners(), refetchBrands()]);
  }, [refetch, refetchBanners, refetchBrands]);

  const renderSection: ListRenderItem<ShopSectionWithProducts> = useCallback(
    ({ item }) => <ShopCategoryRow section={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ShopSectionWithProducts) => String(item.id), []);

  const listHeader = useMemo(
    () =>
      shopBanners.length > 0 ? (
        <View className="pt-4">
          <BannerSlider banners={shopBanners} />
        </View>
      ) : null,
    [shopBanners],
  );

  const listEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View className="px-5 pt-8">
          <CardGridSkeleton count={4} />
        </View>
      );
    }
    if (isError) {
      return (
        <View className="px-5 py-12">
          <EmptyState title="Couldn't load the shop" description="The server didn't respond. Pull down to retry." />
        </View>
      );
    }
    return (
      <View className="px-5 py-12">
        <EmptyState title="The shop is being stocked" description="Check back soon — shoppable products will appear here." />
      </View>
    );
  }, [isLoading, isError]);

  const listFooter = useMemo(
    () => (
      <View>
        {sections.length > 0 ? (
          <>
            {/* Shop by category — centred even with only one or two categories */}
            <View className="mt-10 border-t border-ink-100 bg-ink-50/40 px-5 py-6 dark:border-ink-800 dark:bg-surface-2/40">
              <View className="mb-5 items-center">
                <View className="mb-0.5 flex-row items-center gap-1.5">
                  <LayoutGrid size={16} color={colors.brand[600]} />
                  <Text className="text-lg font-display font-extrabold text-ink-900 dark:text-white">Shop by category</Text>
                </View>
                <Text className="text-xs text-ink-500 dark:text-ink-400">Pick a category to see everything in it</Text>
              </View>
              <View className="flex-row flex-wrap justify-center gap-3.5">
                {sections.map((section) => (
                  <TapTarget
                    key={section.id}
                    onPress={() => navigateShopSection({ slug: section.slug, name: section.name })}
                    accessibilityLabel={section.name}
                    style={{ width: '47%', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', backgroundColor: '#fff', padding: 16 }}>
                    <View style={{ marginBottom: 12, height: 96, width: 96, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 48, borderWidth: 2, borderColor: 'rgba(42,184,65,0.2)', backgroundColor: '#f5f5f5' }}>
                      {section.image_url ? (
                        <MediaFrame src={section.image_url} alt={section.name} aspect="square" rounded="full" resizeMode="cover" className="h-full w-full" />
                      ) : (
                        <ShoppingBag size={30} color={colors.ink[300]} />
                      )}
                    </View>
                    <Text className="text-center text-sm font-bold leading-tight text-ink-900 dark:text-white" numberOfLines={2}>
                      {section.name}
                    </Text>
                    {typeof section.products_count === 'number' && section.products_count > 0 ? (
                      <Text className="mt-1 text-center text-xs font-semibold text-brand-600">
                        {section.products_count} product{section.products_count === 1 ? '' : 's'}
                      </Text>
                    ) : null}
                  </TapTarget>
                ))}
              </View>
            </View>

            {/* Shop by brand — every brand that has shop products; tap = that brand's shop products */}
            {marqueeBrands.length > 0 ? (
              <View className="border-t border-ink-100 bg-white py-6 dark:border-ink-800 dark:bg-surface-1">
                <View className="mb-4 items-center px-5">
                  <View className="mb-0.5 flex-row items-center gap-1.5">
                    <Award size={16} color={colors.gold.strong} />
                    <Text className="text-lg font-display font-extrabold text-ink-900 dark:text-white">Shop by brand</Text>
                  </View>
                  <Text className="text-xs text-ink-500 dark:text-ink-400">Pick a brand to see its shoppable products</Text>
                </View>
                <View className="px-5">
                  <InfiniteMarquee itemWidth={104} gap={16} speed={0.6}>
                    {marqueeBrands.map((brand, i) => (
                      <TapTarget
                        key={`${brand.id}-${i}`}
                        onPress={() => navigateShopSection({ brand: brand.slug })}
                        accessibilityLabel={`Shop ${brand.name}`}
                        style={{ width: '100%', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', backgroundColor: '#fff', padding: 12 }}>
                        <View style={{ marginBottom: 8, height: 56, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          {brand.logo_url ? (
                            <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="xl" resizeMode="contain" className="h-14 w-14 bg-transparent" />
                          ) : (
                            <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#f0f0f0' }}>
                              <Text className="text-lg font-bold text-ink-400">{brand.name.charAt(0).toUpperCase()}</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-center text-xs font-bold text-ink-800 dark:text-ink-100" numberOfLines={1}>
                          {brand.name}
                        </Text>
                      </TapTarget>
                    ))}
                  </InfiniteMarquee>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {/* Banners with position "footer", at the very end of the page */}
        {!isLoading && footerBanners.length > 0 ? (
          <View className="mt-8">
            <BannerSlider banners={footerBanners} />
          </View>
        ) : null}
      </View>
    ),
    [isLoading, sections, marqueeBrands, footerBanners, navigateShopSection],
  );

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      <View
        style={{ backgroundColor: nav.headerBackground, paddingTop: topInset + 8, paddingBottom: 12, paddingHorizontal: 20 }}
        className="flex-row items-center justify-between border-b border-ink-100 dark:border-ink-800">
        <View className="flex-row items-center gap-2.5 flex-1 mr-3">
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#141515', alignItems: 'center', justifyContent: 'center' }}>
            <TrustifiedStamp size={30} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <TrustifiedLogo height={22} />
              <View className="rounded-md bg-brand-50 px-2 py-0.5 border border-brand-100">
                <Text className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">Shop</Text>
              </View>
            </View>
            <Text className="text-[11px] font-medium text-ink-500 dark:text-ink-400 mt-0.5" numberOfLines={1}>
              Lab-tested products with trusted places to buy
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Tabs', { screen: 'Search' })}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Search"
          style={{ height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#f0f0f0' }}>
          <Search size={17} color={nav.headerTint} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlashList
          data={sections}
          keyExtractor={keyExtractor}
          renderItem={renderSection}
          estimatedItemSize={360}
          drawDistance={500}
          renderScrollComponent={RNGHScrollView}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} colors={[colors.brand[500]]} />}
        />
      </View>
    </View>
  );
}
