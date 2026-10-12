import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ShoppingBag,
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Award,
  LayoutGrid,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShopSections, useShopBanners, useCertifiedBrands } from '../../api';
import type { ShopSection, Banner, Product, Brand } from '../../api/types';
import { ShopProductCard } from '../../components/ShopProductCard';
import { InfiniteMarquee } from '../../components/InfiniteMarquee';
import { MediaFrame, CardGridSkeleton, EmptyState, Spinner } from '../../components/ui';
import { colors, useNavColors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Main Shop Screen (/shop)
 * Includes:
 * 1. Full-Width Header Banner Slider (auto-scrolling, swipeable)
 * 2. Curated Product Rails
 * 3. "Shop by category" block with circular web-styled icons
 * 4. "Shop by brand" block with verified brand logos
 */
export function ShopScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const nav = useNavColors();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);
  const headerTopPadding = topInset + 8;

  const {
    data: sectionsRes,
    isLoading: sectionsLoading,
    isRefetching: sectionsRefetching,
    refetch: refetchSections,
  } = useShopSections();

  const {
    data: bannersRes,
    isLoading: bannersLoading,
    refetch: refetchBanners,
  } = useShopBanners();

  const {
    data: brandsRes,
    isLoading: brandsLoading,
    refetch: refetchBrands,
  } = useCertifiedBrands();

  const onRefresh = () => {
    void Promise.all([refetchSections(), refetchBanners(), refetchBrands()]);
  };

  const sections: ShopSection[] = (sectionsRes?.data ?? [])
    .filter((s) => s.show_on_shop)
    .sort((a, b) => a.sort_order - b.sort_order);

  const banners: Banner[] = (bannersRes?.data ?? []).filter(
    (b) => Boolean(b.image_url) && !b.image_url?.includes('placeholder'),
  );

  const brands: Brand[] = (brandsRes?.data ?? []).filter((b) => Boolean(b.logo_url));

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      {/* Top Header */}
      <View
        style={{
          backgroundColor: nav.headerBackground,
          paddingTop: headerTopPadding,
          paddingBottom: 12,
          paddingHorizontal: 20,
        }}
        className="flex-row items-center justify-between border-b border-ink-100 dark:border-ink-800"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-brand-500/10 items-center justify-center">
            <ShoppingBag size={20} color={colors.brand[600]} />
          </View>
          <View>
            <Text className="text-lg font-display font-extrabold text-ink-900 dark:text-white leading-tight">
              Trustified Shop
            </Text>
            <Text className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
              Tested supplements with official buy links
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'Search' })}
          accessibilityRole="button"
          accessibilityLabel="Search"
          className="w-9 h-9 rounded-full bg-ink-100 dark:bg-surface-2 items-center justify-center active:opacity-80"
        >
          <Search size={17} color={nav.headerTint} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-white dark:bg-surface-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={sectionsRefetching}
            onRefresh={onRefresh}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Header Banner Carousel */}
        {banners.length > 0 ? (
          <View className="pt-4">
            <BannerCarousel banners={banners} />
          </View>
        ) : null}

        {/* Section Rails */}
        {sectionsLoading ? (
          <View className="px-5 py-8">
            <Spinner />
          </View>
        ) : sections.length === 0 ? (
          <View className="px-5 py-12">
            <EmptyState
              title="No shop sections available"
              description="Check back soon for curated product collections."
            />
          </View>
        ) : (
          sections.map((section) => {
            // Apply shop filtering rule: active products with at least one buy link & not untested
            const validProducts = (section.products ?? []).filter(
              (p) =>
                p.is_active !== false &&
                p.status !== 'untested' &&
                Array.isArray(p.buy_links) &&
                p.buy_links.some((l) => Boolean(l.url)),
            );

            if (validProducts.length === 0) return null;

            return (
              <SectionRail
                key={section.id}
                section={section}
                products={validProducts}
                onViewAll={() =>
                  navigation.navigate('ShopSection', {
                    slug: section.slug,
                    name: section.name,
                  })
                }
              />
            );
          })
        )}

        {/* "Shop by category" block (2-column cards matching web with circular avatar images) */}
        {sections.length > 0 ? (
          <View className="mt-8 px-5 py-6 bg-ink-50/40 dark:bg-surface-2/40 border-t border-ink-100 dark:border-ink-800">
            <View className="mb-5">
              <View className="flex-row items-center gap-1.5 mb-0.5">
                <LayoutGrid size={16} color={colors.brand[600]} />
                <Text className="text-lg font-display font-extrabold text-ink-900 dark:text-white">
                  Shop by category
                </Text>
              </View>
              <Text className="text-xs text-ink-500 dark:text-ink-400">
                Pick a category to see everything in it
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-3.5">
              {sections.map((section) => (
                <Pressable
                  key={section.id}
                  onPress={() =>
                    navigation.navigate('ShopSection', {
                      slug: section.slug,
                      name: section.name,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={section.name}
                  className="w-[48%] rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 p-4 items-center justify-center shadow-2xs active:opacity-90"
                >
                  <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500/20 bg-ink-50 dark:bg-surface-2 items-center justify-center p-0.5 mb-3">
                    <View className="w-full h-full rounded-full overflow-hidden items-center justify-center">
                      {section.image_url ? (
                        <MediaFrame
                          src={section.image_url}
                          alt={section.name}
                          aspect="square"
                          rounded="full"
                          resizeMode="cover"
                          className="w-full h-full"
                        />
                      ) : (
                        <Text className="text-2xl font-display font-extrabold text-brand-600">
                          {section.name.trim().charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text
                    className="text-sm font-bold text-ink-900 dark:text-white text-center leading-tight"
                    numberOfLines={2}
                  >
                    {section.name}
                  </Text>
                  {typeof section.products_count === 'number' && section.products_count > 0 ? (
                    <Text className="text-xs font-semibold text-brand-600 text-center mt-1">
                      {section.products_count} product{section.products_count === 1 ? '' : 's'}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* "Shop by brand" single-line auto-scroll marquee matching Home screen */}
        {brands.length > 0 ? (
          <View className="mt-4 py-6 bg-white dark:bg-surface-1 border-t border-ink-100 dark:border-ink-800">
            <View className="px-5 flex-row items-center justify-between mb-4">
              <View>
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <Award size={16} color={colors.gold.strong} />
                  <Text className="text-lg font-display font-extrabold text-ink-900 dark:text-white">
                    Shop by brand
                  </Text>
                </View>
                <Text className="text-xs text-ink-500 dark:text-ink-400">
                  Certified supplements from 100% blind-tested brands
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('CertifiedBrands', { fromDrawer: true })}
                accessibilityRole="button"
                accessibilityLabel="View all brands"
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 active:opacity-80"
              >
                <Text className="text-xs font-bold text-brand-700 dark:text-brand-400">View all</Text>
                <ChevronRight size={13} color={colors.brand[600]} />
              </Pressable>
            </View>

            <View className="px-5">
              <InfiniteMarquee itemWidth={96} gap={16} speed={0.6}>
                {brands.map((brand) => (
                  <Pressable
                    key={brand.id}
                    onPress={() => navigation.navigate('BrandDetail', { slug: brand.slug })}
                    accessibilityRole="button"
                    accessibilityLabel={brand.name}
                    className="w-full items-center active:opacity-80"
                  >
                    <MediaFrame
                      src={brand.logo_url}
                      alt={brand.name}
                      aspect="square"
                      rounded="xl"
                      resizeMode="contain"
                      className="w-20 shadow-xs border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-2 p-1"
                    />
                    <Text
                      className="mt-1.5 text-center text-xs font-semibold text-ink-700 dark:text-ink-200"
                      numberOfLines={1}
                    >
                      {brand.name}
                    </Text>
                  </Pressable>
                ))}
              </InfiniteMarquee>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/** Banner Carousel Component (Full width with proper pagination, no right empty space) */
function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isInteracting) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length, isInteracting]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  const handleBannerPress = (banner: Banner) => {
    if (!banner.link) return;
    if (banner.link.startsWith('http')) {
      Linking.openURL(banner.link).catch(() => {});
    }
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setTimeout(() => setIsInteracting(false), 3500)}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={{ width: SCREEN_WIDTH }} className="px-5">
            <Pressable
              onPress={() => handleBannerPress(banner)}
              className="w-full overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 shadow-sm active:opacity-95"
              style={{ height: 168 }}
            >
              <MediaFrame
                src={banner.image_url}
                alt={banner.title ?? 'Shop banner'}
                aspect="auto"
                rounded="2xl"
                resizeMode="cover"
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      {banners.length > 1 ? (
        <View className="flex-row items-center justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-brand-500' : 'w-1.5 bg-ink-300 dark:bg-ink-700'
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Single Horizontal Section Rail */
function SectionRail({
  section,
  products,
  onViewAll,
}: {
  section: ShopSection;
  products: Product[];
  onViewAll: () => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Auto-scroll product rail smoothly, pausing on user touch
  useEffect(() => {
    if (products.length <= 2 || isInteracting) return;
    let offset = 0;
    const interval = setInterval(() => {
      offset += 180;
      if (offset > products.length * 270) offset = 0;
      scrollRef.current?.scrollTo({ x: offset, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length, isInteracting]);

  return (
    <View className="mt-7">
      {/* Rail Header */}
      <View className="px-5 flex-row items-center justify-between mb-3">
        <View className="flex-1 pr-3">
          <Text
            className="text-lg font-display font-bold text-ink-900 dark:text-white leading-tight"
            numberOfLines={1}
          >
            {section.name}
          </Text>
          <Text className="text-[11px] text-ink-500 dark:text-ink-400 font-medium mt-0.5">
            {products.length} tested option{products.length === 1 ? '' : 's'} available
          </Text>
        </View>

        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all ${section.name}`}
          className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 active:opacity-80"
        >
          <Text className="text-xs font-bold text-brand-700 dark:text-brand-400">View all</Text>
          <ChevronRight size={13} color={colors.brand[600]} />
        </Pressable>
      </View>

      {/* Horizontal Rail */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setTimeout(() => setIsInteracting(false), 3000)}
      >
        {products.map((product) => (
          <ShopProductCard key={product.id} product={product} horizontal />
        ))}
      </ScrollView>
    </View>
  );
}
