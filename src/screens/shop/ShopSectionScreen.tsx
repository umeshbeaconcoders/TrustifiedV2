import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Search,
  X,
  SlidersHorizontal,
  Layers,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useShopSections,
  useShopBrands,
  api,
} from '../../api';
import type { Paginated, Product, Brand, ShopSection } from '../../api/types';
import { ShopProductCard } from '../../components/ShopProductCard';
import {
  MediaFrame,
  CardGridSkeleton,
  EmptyState,
  ListFooterLoader,
} from '../../components/ui';
import { useDebouncedValue } from '../../lib/useDebounce';
import { colors, useNavColors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'ShopSection'>;

/**
 * Section Detail Screen (/shop/:slug)
 * Includes:
 * 1. Top Section Picker with images
 * 2. Section name, product count, and brand filter
 * 3. Search filter
 * 4. Scroll-based pagination with ShopProductCard
 */
export function ShopSectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();
  const nav = useNavColors();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);
  const headerTopPadding = topInset + 8;

  const initialSlug = route.params?.slug ?? '';
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  // 1. All sections for top picker
  const { data: sectionsRes } = useShopSections();
  const sections: ShopSection[] = (sectionsRes?.data ?? [])
    .filter((s) => s.show_on_shop)
    .sort((a, b) => a.sort_order - b.sort_order);

  const currentSection = sections.find((s) => s.slug === activeSlug) ?? {
    name: route.params?.name ?? 'Shop Section',
    slug: activeSlug,
  };

  // 2. Brands available for this section
  const { data: brandsRes } = useShopBrands(activeSlug);
  const brands: Brand[] = Array.isArray(brandsRes?.data) ? brandsRes.data : [];

  // 3. Paginated products query
  const queryParams = useMemo(
    () => ({
      section: activeSlug,
      brand: selectedBrand || undefined,
      search: debouncedSearch || undefined,
      per_page: 12,
    }),
    [activeSlug, selectedBrand, debouncedSearch],
  );

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['shop', 'products-infinite', queryParams],
    queryFn: ({ pageParam = 1, signal }) =>
      api.get<Paginated<Product>>(
        '/shop/products',
        { ...queryParams, page: pageParam },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta && lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 60_000,
  });

  const rawProducts = data?.pages.flatMap((page) => page.data ?? []) ?? [];
  // Apply shop business rules: active, has buy links, not untested
  const products = rawProducts.filter(
    (p) =>
      p.is_active !== false &&
      p.status !== 'untested' &&
      Array.isArray(p.buy_links) &&
      p.buy_links.some((l) => Boolean(l.url)),
  );

  const totalCount = data?.pages[0]?.meta?.total ?? products.length;

  const handleSelectSection = (slug: string) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);
    setSelectedBrand('');
    setSearch('');
  };

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      {/* Header */}
      <View
        style={{
          backgroundColor: nav.headerBackground,
          paddingTop: headerTopPadding,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}
        className="flex-row items-center border-b border-ink-100 dark:border-ink-800"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 mr-2 rounded-full active:bg-ink-100 dark:active:bg-surface-2"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={nav.headerTint} />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-lg font-display font-bold text-ink-900 dark:text-white leading-tight"
            numberOfLines={1}
          >
            {currentSection.name}
          </Text>
          <Text className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
            {totalCount} tested product{totalCount === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      {/* Top Section Picker (Scrollable strip of sections with images) */}
      {sections.length > 1 ? (
        <View className="py-2.5 border-b border-ink-100/60 dark:border-ink-800/60 bg-ink-50/30 dark:bg-surface-2/20">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {sections.map((sec) => {
              const isSelected = sec.slug === activeSlug;
              return (
                <Pressable
                  key={sec.id}
                  onPress={() => handleSelectSection(sec.slug)}
                  accessibilityRole="button"
                  accessibilityLabel={sec.name}
                  className={`flex-row items-center gap-2 py-1.5 px-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-brand-600 border-brand-600 shadow-xs'
                      : 'bg-white dark:bg-surface-1 border-ink-200 dark:border-ink-700 active:bg-ink-50'
                  }`}
                >
                  <View className="w-6 h-6 rounded-lg overflow-hidden bg-ink-100 dark:bg-surface-2">
                    <MediaFrame
                      src={sec.image_url}
                      alt={sec.name}
                      aspect="square"
                      rounded="lg"
                      className="w-full h-full"
                    />
                  </View>
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-ink-800 dark:text-ink-200'
                    }`}
                  >
                    {sec.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Search & Brand Filter Bar */}
      <View className="px-4 pt-3 pb-2 border-b border-ink-100/60 dark:border-ink-800/60">
        {/* Search input */}
        <View className="flex-row items-center rounded-xl bg-ink-50 dark:bg-surface-2 px-3 py-1.5 border border-ink-200 dark:border-ink-700 mb-2.5">
          <Search size={15} color={colors.ink[400]} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search in ${currentSection.name}...`}
            placeholderTextColor={colors.ink[400]}
            className="flex-1 ml-2 text-xs text-ink-900 dark:text-white py-1"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} className="p-1">
              <X size={14} color={colors.ink[500]} />
            </Pressable>
          ) : null}
        </View>

        {/* Brand Filter Chips */}
        {brands.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              onPress={() => setSelectedBrand('')}
              accessibilityRole="button"
              className={`py-1 px-3 rounded-full border ${
                selectedBrand === ''
                  ? 'bg-ink-900 dark:bg-white border-ink-900 dark:border-white'
                  : 'bg-white dark:bg-surface-1 border-ink-200 dark:border-ink-700'
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  selectedBrand === ''
                    ? 'text-white dark:text-ink-900'
                    : 'text-ink-700 dark:text-ink-300'
                }`}
              >
                All Brands ({brands.length})
              </Text>
            </Pressable>

            {brands.map((brand) => {
              const isBrandSelected = selectedBrand === brand.slug;
              return (
                <Pressable
                  key={brand.id}
                  onPress={() =>
                    setSelectedBrand(isBrandSelected ? '' : brand.slug)
                  }
                  accessibilityRole="button"
                  className={`flex-row items-center gap-1.5 py-1 px-2.5 rounded-full border ${
                    isBrandSelected
                      ? 'bg-brand-600 border-brand-600'
                      : 'bg-white dark:bg-surface-1 border-ink-200 dark:border-ink-700'
                  }`}
                >
                  {brand.logo_url ? (
                    <View className="w-3.5 h-3.5 rounded-full overflow-hidden">
                      <MediaFrame
                        src={brand.logo_url}
                        alt={brand.name}
                        aspect="square"
                        rounded="full"
                        className="w-full h-full"
                      />
                    </View>
                  ) : null}
                  <Text
                    className={`text-[11px] font-bold ${
                      isBrandSelected
                        ? 'text-white'
                        : 'text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {brand.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {/* Product List Grid */}
      <View className="flex-1 px-3 pt-3">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : isError ? (
          <EmptyState
            title="Unable to load products"
            description="The server did not respond. Please try again in a moment."
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching products found"
            description="Try clearing your search query or selecting another brand."
          />
        ) : (
          <FlashList
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            estimatedItemSize={280}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => void refetch()}
                colors={[colors.brand[500]]}
              />
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={{ flex: 1, paddingHorizontal: 5 }}>
                <ShopProductCard product={item} />
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
