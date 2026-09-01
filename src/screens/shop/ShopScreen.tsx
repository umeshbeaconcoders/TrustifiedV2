import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SlidersHorizontal, Search } from 'lucide-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useBrands, useCategories, api } from '../../api';
import type { Paginated, Product } from '../../api/types';
import { Button, CardGridSkeleton, EmptyState, Input, ListFooterLoader } from '../../components/ui';
import { ProductCard } from '../../components/ProductCard';
import { useDebouncedValue } from '../../lib/useDebounce';
import { colors } from '../../theme/tokens';

type Tier = '' | 'gold' | 'standard';
type Status = '' | 'pass' | 'fail';

/**
 * RN port of `frontend/apps/web/src/pages/shop.tsx`. FlashList + infinite
 * scroll (fetch-next-page on end-reached) instead of web's page-number
 * pagination, per Section 5. Search is debounced ~300ms per Section 5 /
 * the recent web fix.
 */
export function ShopScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [tier, setTier] = useState<Tier>('');
  const [status, setStatus] = useState<Status>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categoriesRes } = useCategories();
  const { data: brandsRes } = useBrands({ per_page: 500 });
  const categories = (categoriesRes?.data ?? []).filter((c) => !c.is_upcoming);
  const brandList = Array.isArray(brandsRes?.data) ? brandsRes.data : [];

  const params = useMemo(
    () => ({ search: debouncedSearch, category, brand, tier, status, per_page: 12 }),
    [debouncedSearch, category, brand, tier, status],
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['products', 'shop-infinite', params],
    queryFn: ({ pageParam, signal }) => api.get<Paginated<Product>>('/products', { ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined),
    staleTime: 60_000,
  });

  const products = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  function clearFilters() {
    setSearch('');
    setCategory('');
    setBrand('');
    setTier('');
    setStatus('');
  }

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-ink-100 px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-ink-900">Shop tested products</Text>
        <View className="mt-3 flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-xl border border-ink-200 px-3">
            <Search size={16} color={colors.ink[400]} />
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search shop..."
              className="h-11 flex-1 border-0 px-2"
              accessibilityLabel="Search products"
            />
          </View>
          <Pressable
            onPress={() => setFiltersOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Toggle filters"
            className="size-11 items-center justify-center rounded-xl border border-ink-200">
            <SlidersHorizontal size={18} color={colors.ink[700]} />
          </Pressable>
        </View>

        {filtersOpen ? (
          <View className="mt-3 gap-3">
            <ChipRow
              label="Category"
              value={category}
              options={[{ value: '', label: 'All' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
              onChange={setCategory}
            />
            {brandList.length > 0 ? (
              <ChipRow
                label="Brand"
                value={brand}
                options={[{ value: '', label: 'All' }, ...brandList.slice(0, 20).map((b) => ({ value: b.slug, label: b.name }))]}
                onChange={setBrand}
              />
            ) : null}
            <ChipRow
              label="Tier"
              value={tier}
              options={[
                { value: '', label: 'All' },
                { value: 'gold', label: 'Gold' },
                { value: 'standard', label: 'Standard' },
              ]}
              onChange={(v) => setTier(v as Tier)}
            />
            <ChipRow
              label="Status"
              value={status}
              options={[
                { value: '', label: 'All' },
                { value: 'pass', label: 'Pass' },
                { value: 'fail', label: 'Fail' },
              ]}
              onChange={(v) => setStatus(v as Status)}
            />
          </View>
        ) : null}

        {data ? <Text className="mt-2 text-xs font-medium text-ink-500">{total} products</Text> : null}
      </View>

      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : isError ? (
          <EmptyState title="Couldn't load products" description="The server didn't respond. Please retry in a moment." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try adjusting your filters or search query."
            action={<Button variant="outline" onPress={clearFilters}>Clear all filters</Button>}
          />
        ) : (
          <FlashList
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            estimatedItemSize={220}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={{ flex: 1, paddingHorizontal: 6 }}>
                <ProductCard product={item} />
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

function ChipRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <Text className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-500">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value || 'all'}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`rounded-full border px-3.5 py-1.5 ${active ? 'border-brand-600 bg-brand-50' : 'border-ink-200 bg-white'}`}>
              <Text className={`text-xs font-semibold ${active ? 'text-brand-700' : 'text-ink-600'}`}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
