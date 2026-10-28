import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Check, ChevronDown, LayoutGrid, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBanners, useShopBrands, useShopProductsInfinite, useShopSections } from '../../api';
import type { Product } from '../../api/types';
import { BannerSlider } from '../../components/BannerSlider';
import { ProductCard } from '../../components/ProductCard';
import { ShopCategoryRow } from '../../components/ShopCategoryRow';
import { Button, CardGridSkeleton, EmptyState, ListFooterLoader, MediaFrame } from '../../components/ui';
import { colors, useNavColors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'ShopSection'>;

const PAGE_SIZE = 24;
const GRID_GAP = 12;
const GRID_PADDING = 12;

/** Compact rounded filter pill (optional tiny thumbnail). */
function Pill({ active, onPress, image, icon, children }: { active: boolean; onPress: () => void; image?: string | null; icon?: React.ReactNode; children: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`h-9 flex-row items-center gap-2 rounded-full border px-3.5 ${
        active ? 'border-brand-600 bg-brand-600' : 'border-ink-200 bg-white active:bg-brand-50 dark:border-ink-700 dark:bg-surface-1'
      }`}>
      {image ? (
        <View className="h-5 w-5 overflow-hidden rounded-full">
          <MediaFrame src={image} alt={children} aspect="square" rounded="full" resizeMode="cover" className="h-full w-full" />
        </View>
      ) : (
        icon
      )}
      <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-ink-700 dark:text-ink-200'}`} numberOfLines={1}>
        {children}
      </Text>
    </Pressable>
  );
}

/** A labelled, horizontally scrollable row of pills. */
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {children}
      </ScrollView>
    </View>
  );
}

/** Bottom-sheet style brand picker (the native equivalent of the website's brand dropdown). */
function BrandPicker({
  visible,
  brands,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  brands: { id: number; name: string; slug: string }[];
  value: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const options = [{ id: 0, name: 'All brands', slug: '' }, ...brands];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={onClose} accessibilityLabel="Close brand filter" />
      <View className="max-h-[70%] rounded-t-3xl bg-white pb-6 dark:bg-surface-1">
        <View className="flex-row items-center justify-between px-5 py-4">
          <Text className="text-base font-bold text-ink-900 dark:text-white">Filter by brand</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" className="p-1">
            <X size={20} color={colors.ink[500]} />
          </Pressable>
        </View>
        <FlatList
          data={options}
          keyExtractor={(o) => String(o.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item.slug);
                onClose();
              }}
              accessibilityRole="button"
              className="flex-row items-center justify-between border-t border-ink-100 px-5 py-3.5 active:bg-ink-50 dark:border-ink-800">
              <Text className={`text-sm ${value === item.slug ? 'font-bold text-brand-700' : 'text-ink-800 dark:text-ink-100'}`}>{item.name}</Text>
              {value === item.slug ? <Check size={16} color={colors.brand[600]} /> : null}
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

/**
 * One shop category (or "All products" when there is no slug). Back button + brand filter on one
 * aligned row; inside a category only its sub categories are shown as pills (the category itself
 * is the screen); "All products" keeps category pills for navigation. Products use the plain
 * Pass & Fail tile — "View Details" opens the full product page with the report and buy links.
 * After the list: every other category's row, then the shop banners.
 */
export function ShopSectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();
  const nav = useNavColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 47 : 24;

  const slug = route.params?.slug;
  const isAll = !slug;
  const [sub, setSub] = useState(route.params?.sub ?? '');
  const [brand, setBrand] = useState(route.params?.brand ?? '');
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);

  // Re-sync when the screen is re-targeted (e.g. from a banner link or the category pills).
  useEffect(() => {
    setSub(route.params?.sub ?? '');
    setBrand(route.params?.brand ?? '');
  }, [slug, route.params?.sub, route.params?.brand]);

  const { data: sectionsRes, isLoading: sectionsLoading } = useShopSections();
  const { data: bannersRes } = useBanners('shop');
  const sections = sectionsRes?.data ?? [];
  const section = sections.find((s) => s.slug === slug);

  // Ignore a stale/unknown sub category so it never produces an empty list.
  const subCategories = section?.sub_sections ?? [];
  const activeSub = subCategories.find((s) => s.slug === sub);
  const subSlug = activeSub?.slug ?? '';

  const { data: brandsRes } = useShopBrands(slug, subSlug || undefined);
  const brands = Array.isArray(brandsRes?.data) ? brandsRes.data : [];
  const activeBrand = brands.find((b) => b.slug === brand);

  const params = useMemo(
    () => ({ section: slug, sub: subSlug || undefined, brand: brand || undefined, per_page: PAGE_SIZE }),
    [slug, subSlug, brand],
  );
  const { data, isLoading, isError, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useShopProductsInfinite(params);

  const products: Product[] = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total;
  const nextPageFailed = isError && products.length > 0;
  const otherSections = sections.filter((s) => s.slug !== slug);
  const cardWidth = Math.floor((width - GRID_PADDING * 2 - GRID_GAP) / 2);

  const title = isAll ? 'All products' : (activeSub?.name ?? section?.name ?? route.params?.name ?? '');
  const notFound = !isAll && !sectionsLoading && sections.length > 0 && !section;

  const selectCategory = (nextSlug?: string, name?: string) => navigation.setParams({ slug: nextSlug, name, sub: undefined, brand: undefined });
  const selectSub = (next: string) => {
    setSub(next);
    setBrand('');
  };

  const header = (
    <View className="px-3 pt-3">
      {isAll && sections.length > 0 ? (
        <View className="rounded-2xl border border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-surface-1">
          <FilterRow label="Category">
            <Pill active onPress={() => selectCategory(undefined)} icon={<LayoutGrid size={15} color="#fff" />}>
              All
            </Pill>
            {sections.map((s) => (
              <Pill key={s.id} active={false} onPress={() => selectCategory(s.slug, s.name)} image={s.image_url}>
                {s.name}
              </Pill>
            ))}
          </FilterRow>
        </View>
      ) : null}

      {!isAll && subCategories.length > 0 ? (
        <View className="rounded-2xl border border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-surface-1">
          <FilterRow label="Sub category">
            <Pill active={!activeSub} onPress={() => selectSub('')}>
              All
            </Pill>
            {subCategories.map((s) => (
              <Pill key={s.id} active={s.slug === subSlug} onPress={() => selectSub(s.slug)} image={s.image_url}>
                {s.name}
              </Pill>
            ))}
          </FilterRow>
        </View>
      ) : null}

      <View className="mb-3 mt-4 px-1">
        {activeSub && section ? <Text className="text-xs font-medium text-ink-500 dark:text-ink-400">{section.name}</Text> : null}
        <Text className="text-2xl font-display font-extrabold text-ink-900 dark:text-white" numberOfLines={2}>
          {title}
        </Text>
        {typeof total === 'number' ? (
          <Text className="mt-0.5 text-xs font-medium text-ink-500 dark:text-ink-400">
            {total} product{total === 1 ? '' : 's'}
          </Text>
        ) : null}
      </View>
    </View>
  );

  const footer = (
    <View>
      {hasNextPage ? (
        nextPageFailed ? (
          <View className="items-center gap-2 py-6">
            <Text className="text-xs text-ink-500">Couldn't load more products.</Text>
            <Button size="sm" variant="outline" onPress={() => void fetchNextPage()}>
              Retry
            </Button>
          </View>
        ) : (
          <ListFooterLoader visible={isFetchingNextPage} />
        )
      ) : (
        <>
          {otherSections.length > 0 ? (
            <View className="mt-6 border-t border-ink-100 pt-6 dark:border-ink-800">
              <Text className="px-5 text-center text-xl font-display font-extrabold text-ink-900 dark:text-white">
                {isAll ? 'Shop by category' : 'Explore more categories'}
              </Text>
              {otherSections.map((s) => (
                <ShopCategoryRow key={s.id} section={s} />
              ))}
            </View>
          ) : null}
          {(bannersRes?.data ?? []).length > 0 ? (
            <View className="mt-8">
              <BannerSlider banners={bannersRes?.data ?? []} />
            </View>
          ) : null}
          <View style={{ height: 32 }} />
        </>
      )}
    </View>
  );

  if (notFound) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-surface-1">
        <EmptyState title="This category isn't available" description="It may have been removed or hidden from the shop." />
        <View className="mt-4">
          <Button variant="outline" onPress={() => navigation.navigate('Shop')}>
            Back to shop
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      {/* Action row: back on the left, brand filter on the right, same height */}
      <View
        style={{ backgroundColor: nav.headerBackground, paddingTop: topInset + 8, paddingBottom: 10, paddingHorizontal: 12 }}
        className="flex-row items-center justify-between border-b border-ink-100 dark:border-ink-800">
        <Pressable
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Shop'))}
          accessibilityRole="button"
          accessibilityLabel="Back to all categories"
          className="h-10 flex-row items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 active:bg-ink-50 dark:border-ink-700 dark:bg-surface-1">
          <ArrowLeft size={16} color={nav.headerTint} />
          <Text className="text-sm font-medium text-ink-800 dark:text-ink-100">All categories</Text>
        </Pressable>

        {brands.length > 0 || brand ? (
          <Pressable
            onPress={() => setBrandPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter by brand"
            className="h-10 max-w-[55%] flex-row items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 active:bg-ink-50 dark:border-ink-700 dark:bg-surface-1">
            <Text className="flex-shrink text-sm font-medium text-ink-800 dark:text-ink-100" numberOfLines={1}>
              {activeBrand?.name ?? 'All brands'}
            </Text>
            <ChevronDown size={15} color={colors.ink[500]} />
          </Pressable>
        ) : null}
      </View>

      {isLoading && products.length === 0 ? (
        <View className="px-3">
          {header}
          <CardGridSkeleton count={6} />
        </View>
      ) : isError && products.length === 0 ? (
        <View className="flex-1 justify-center px-5">
          <EmptyState title="Couldn't load products" description="The server didn't respond. Please retry in a moment." />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          // Short or partial rows are centred instead of hugging the left edge.
          columnWrapperStyle={{ justifyContent: 'center', gap: GRID_GAP, paddingHorizontal: GRID_PADDING }}
          ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <View className="items-center px-6 py-12">
              <Text className="mb-1 text-lg font-bold text-ink-900 dark:text-white">No products found</Text>
              <Text className="mb-4 text-center text-sm text-ink-600 dark:text-ink-300">
                {brand ? 'No products from this brand here.' : 'There are no shop products here yet.'}
              </Text>
              {brand ? <Button onPress={() => setBrand('')}>Clear brand filter</Button> : null}
            </View>
          }
          ListFooterComponent={footer}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ProductCard product={item} />
            </View>
          )}
          onEndReachedThreshold={1.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage && !nextPageFailed) void fetchNextPage();
          }}
          refreshControl={<RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={() => void refetch()} colors={[colors.brand[500]]} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BrandPicker visible={brandPickerOpen} brands={brands} value={brand} onSelect={setBrand} onClose={() => setBrandPickerOpen(false)} />
    </View>
  );
}
