import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShoppingBag, Search, LayoutGrid, Award } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBanners, useShopBrands, useShopSections } from '../../api';
import type { Brand } from '../../api/types';
import { BannerSlider } from '../../components/BannerSlider';
import { ShopCategoryRow } from '../../components/ShopCategoryRow';
import { InfiniteMarquee } from '../../components/InfiniteMarquee';
import { MediaFrame, CardGridSkeleton, EmptyState } from '../../components/ui';
import { colors, useNavColors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

/** Repeats a short list until it is at least `min` long, so a marquee strip always spans the screen. */
function fillTo<T>(list: T[], min: number): T[] {
  if (list.length === 0) return list;
  const out: T[] = [];
  while (out.length < min) out.push(...list);
  return out;
}

/**
 * Shop home — a showcase of products that have affiliate buy links (NOT a report listing):
 * shop-page banners, one auto-scrolling row per category (with its sub category pills), a
 * "Shop by category" grid, a "Shop by brand" strip, then the footer banners.
 * Customers only ever see "category" / "sub category" — never "section".
 */
export function ShopScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const nav = useNavColors();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 47 : 24;

  const { data: sectionsRes, isLoading, isError, isRefetching, refetch } = useShopSections();
  const { data: shopBannersRes, refetch: refetchBanners } = useBanners('shop');
  const { data: footerBannersRes } = useBanners('footer');
  const { data: brandsRes, refetch: refetchBrands } = useShopBrands();

  const sections = sectionsRes?.data ?? [];
  const shopBanners = shopBannersRes?.data ?? [];
  const footerBanners = footerBannersRes?.data ?? [];
  const brands: Brand[] = Array.isArray(brandsRes?.data) ? brandsRes.data : [];

  const onRefresh = () => {
    void Promise.all([refetch(), refetchBanners(), refetchBrands()]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      <View
        style={{ backgroundColor: nav.headerBackground, paddingTop: topInset + 8, paddingBottom: 12, paddingHorizontal: 20 }}
        className="flex-row items-center justify-between border-b border-ink-100 dark:border-ink-800">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10">
            <ShoppingBag size={20} color={colors.brand[600]} />
          </View>
          <View>
            <Text className="text-lg font-display font-extrabold leading-tight text-ink-900 dark:text-white">Trustified Shop</Text>
            <Text className="text-[11px] font-medium text-ink-500 dark:text-ink-400">Lab-tested products with trusted places to buy</Text>
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} colors={[colors.brand[500]]} />}>
        {shopBanners.length > 0 ? (
          <View className="pt-4">
            <BannerSlider banners={shopBanners} />
          </View>
        ) : null}

        {isLoading ? (
          <View className="px-5 pt-8">
            <CardGridSkeleton count={4} />
          </View>
        ) : isError ? (
          <View className="px-5 py-12">
            <EmptyState title="Couldn't load the shop" description="The server didn't respond. Pull down to retry." />
          </View>
        ) : sections.length === 0 ? (
          <View className="px-5 py-12">
            <EmptyState title="The shop is being stocked" description="Check back soon — shoppable products will appear here." />
          </View>
        ) : (
          <>
            {sections.map((section) => (
              <ShopCategoryRow key={section.id} section={section} />
            ))}

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
                  <TouchableOpacity
                    key={section.id}
                    onPress={() => navigation.navigate('ShopSection', { slug: section.slug, name: section.name })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
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
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Shop by brand — every brand that has shop products; tap = that brand's shop products */}
            {brands.length > 0 ? (
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
                    {fillTo(brands, 8).map((brand, i) => (
                      <TouchableOpacity
                        key={`${brand.id}-${i}`}
                        onPress={() => navigation.navigate('ShopSection', { brand: brand.slug })}
                        activeOpacity={0.7}
                        accessibilityRole="button"
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
                      </TouchableOpacity>
                    ))}
                  </InfiniteMarquee>
                </View>
              </View>
            ) : null}
          </>
        )}

        {/* Banners with position "footer", at the very end of the page */}
        {footerBanners.length > 0 ? (
          <View className="mt-8">
            <BannerSlider banners={footerBanners} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
