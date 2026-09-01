import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { X, RefreshCw, ChevronDown, ShieldCheck, Trophy, FlaskConical } from 'lucide-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api, useBrands, useCategories } from '../../api';
import type { Paginated, Product } from '../../api/types';
import type { ReportCollection } from '../../api/hooks/public';
import { Button, CardGridSkeleton, EmptyState, ListFooterLoader, Tabs, TabsList, TabsTrigger, TabsContent, TabsContext } from '../../components/ui';
import { ProductCard } from '../../components/ProductCard';
import { colors } from '../../theme/tokens';
import { CategoryIcon } from '../../components/CategoryIcon';

function getCategoryInitials(name: string): string {
  const clean = name.trim();
  if (clean.toLowerCase() === 'all') return 'ALL';
  return clean.substring(0, Math.min(2, clean.length)).toUpperCase();
}

function TabHeaderLabel({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  const activeColor = value === 'gold' ? colors.gold.strong : colors.brand[600];
  const activeTextColor = value === 'gold' ? 'text-gold-800' : 'text-brand-700';
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon size={14} color={active ? activeColor : colors.ink[400]} />
      <Text className={`text-[11px] font-bold ${active ? activeTextColor : 'text-ink-500'}`}>
        {label}
      </Text>
    </View>
  );
}

export function ReportsScreen() {
  return (
    <View className="flex-1 bg-white pt-4">
      <Text className="px-4 text-2xl font-display font-bold text-ink-900">Trustified</Text>
      <Tabs defaultValue="pass-fail" className="mt-2 flex-1">
        <View className="px-4">
          <TabsList className="bg-ink-50 border border-ink-100">
            <TabsTrigger
              value="pass-fail"
              activeClassName="bg-brand-50 border border-brand-500/50 shadow-sm"
              inactiveClassName="border border-transparent"
            >
              <TabHeaderLabel value="pass-fail" label="Standard" icon={ShieldCheck} />
            </TabsTrigger>
            <TabsTrigger
              value="gold"
              activeClassName="bg-gold-50 border border-gold/40 shadow-sm"
              inactiveClassName="border border-transparent"
            >
              <TabHeaderLabel value="gold" label="Gold Certified" icon={Trophy} />
            </TabsTrigger>
            <TabsTrigger
              value="nmr"
              activeClassName="bg-brand-50 border border-brand-500/50 shadow-sm"
              inactiveClassName="border border-transparent"
            >
              <TabHeaderLabel value="nmr" label="NMR Reports" icon={FlaskConical} />
            </TabsTrigger>
          </TabsList>
        </View>
        <TabsContent value="pass-fail" className="mt-4 flex-1">
          <ReportsCollectionList collection="pass-fail" showStatusFilter />
        </TabsContent>
        <TabsContent value="gold" className="mt-4 flex-1">
          <ReportsCollectionList collection="gold" showStatusFilter={false} />
        </TabsContent>
        <TabsContent value="nmr" className="mt-4 flex-1">
          <ReportsCollectionList collection="nmr" showStatusFilter />
        </TabsContent>
      </Tabs>
    </View>
  );
}

type Sort = 'newest' | 'oldest' | 'name_asc';
type Status = '' | 'pass' | 'fail' | 'expired';

const STATUS_OPTIONS = [
  { value: 'pass', label: 'Passed' },
  { value: 'fail', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name A–Z' },
];

function ReportsCollectionList({ collection, showStatusFilter }: { collection: ReportCollection; showStatusFilter: boolean }) {
  const route = useRoute();
  const initialCategory = (route.params as { category?: string } | undefined)?.category || '';

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [sort, setSort] = useState<Sort>('newest');
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Sync category if navigated from Home screen category list
  useEffect(() => {
    const params = route.params as { category?: string } | undefined;
    if (params && 'category' in params) {
      setCategory(params.category || '');
    }
  }, [route.params]);

  const { data: categoriesRes } = useCategories();
  const { data: brandsRes } = useBrands({ per_page: 500 });
  const categories = (categoriesRes?.data ?? []).filter((c) => !c.is_upcoming);
  const brandList = Array.isArray(brandsRes?.data) ? brandsRes.data : [];

  const selectedBrandName = useMemo(() => {
    if (!brand) return 'All Brands';
    const found = brandList.find((b) => b.slug === brand);
    return found ? found.name : 'All Brands';
  }, [brand, brandList]);

  const selectedSortLabel = useMemo(() => {
    const found = SORT_OPTIONS.find((o) => o.value === sort);
    return found ? found.label : 'Newest first';
  }, [sort]);

  const params = useMemo(
    () => ({ search: '', category, brand, status, sort, per_page: 12 }),
    [category, brand, status, sort],
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['reports', collection, 'infinite', params],
    queryFn: ({ pageParam, signal }) =>
      api.get<Paginated<Product>>(`/reports/${collection}`, { ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
    staleTime: 60_000,
  });

  const products = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  function clearFilters() {
    setCategory('');
    setBrand('');
    setStatus('');
    setSort('newest');
  }

  const hasActiveFilters = !!(category || brand || status || sort !== 'newest');

  // Build active filters list for dismissible chips
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (status) {
      const opt = STATUS_OPTIONS.find((o) => o.value === status);
      list.push({ key: 'status', label: opt?.label || status, clear: () => setStatus('') });
    }
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      list.push({ key: 'category', label: cat?.name || category, clear: () => setCategory('') });
    }
    if (brand) {
      const br = brandList.find((b) => b.slug === brand);
      list.push({ key: 'brand', label: br?.name || brand, clear: () => setBrand('') });
    }
    if (sort !== 'newest') {
      const opt = SORT_OPTIONS.find((o) => o.value === sort);
      list.push({ key: 'sort', label: opt?.label || sort, clear: () => setSort('newest') });
    }
    return list;
  }, [status, category, brand, sort, categories, brandList]);

  return (
    <View style={{ height: '100%' }}>
      {/* Horizontal Status Filter Chips (Standard / NMR only) */}
      {showStatusFilter && (
        <View className="flex-row gap-2 px-4 mb-4">
          <Pressable
            onPress={() => setStatus('')}
            className={`flex-1 items-center justify-center py-2 rounded-full border ${status === '' ? 'border-brand-600 bg-brand-50' : 'border-ink-200 bg-white'}`}
          >
            <Text className={`text-[11px] font-bold ${status === '' ? 'text-brand-700' : 'text-ink-600'}`}>All</Text>
          </Pressable>
          {STATUS_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setStatus(opt.value as Status)}
              className={`flex-1 items-center justify-center py-2 rounded-full border ${status === opt.value ? 'border-brand-600 bg-brand-50' : 'border-ink-200 bg-white'}`}
            >
              <Text className={`text-[11px] font-bold ${status === opt.value ? 'text-brand-700' : 'text-ink-600'}`}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Selectors Row */}
      <View className="flex-row gap-3 px-4 mb-4">
        <Pressable
          onPress={() => setBrandModalVisible(true)}
          className="flex-1 flex-row items-center justify-between border border-ink-200 bg-white px-3 py-2.5 rounded-xl active:bg-ink-50"
        >
          <Text className="text-xs font-bold text-ink-700 flex-1 mr-1" numberOfLines={1}>
            {selectedBrandName}
          </Text>
          <ChevronDown size={14} color={colors.ink[500]} />
        </Pressable>
        <Pressable
          onPress={() => setSortModalVisible(true)}
          className="flex-1 flex-row items-center justify-between border border-ink-200 bg-white px-3 py-2.5 rounded-xl active:bg-ink-50"
        >
          <Text className="text-xs font-bold text-ink-700 flex-1 mr-1" numberOfLines={1}>
            {selectedSortLabel}
          </Text>
          <ChevronDown size={14} color={colors.ink[500]} />
        </Pressable>
      </View>

      {/* Active Filters Row (Web style) */}
      {activeFilters.length > 0 ? (
        <View className="px-4 mb-3 flex-row items-center flex-wrap gap-2">
          <Text className="text-xs font-bold text-ink-500">Active filters:</Text>
          {activeFilters.map((filt) => (
            <View key={filt.key} className="flex-row items-center gap-1 bg-[#eefcf2] px-3 py-1 rounded-full border border-brand-200">
              <Text className="text-[11px] font-bold text-brand-700">{filt.label}</Text>
              <Pressable onPress={filt.clear} className="p-0.5 rounded-full active:bg-brand-100">
                <X size={10} color={colors.brand[600]} />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={clearFilters} className="ml-auto active:opacity-85">
            <Text className="text-xs font-bold text-brand-600 underline">Clear all</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Results Counter */}
      <View className="px-4 mb-2">
        {data ? (
          <Text className="text-xs font-bold text-ink-500">
            {new Intl.NumberFormat().format(total)} products found
          </Text>
        ) : <View />}
      </View>

      {/* Categories Horizontal circular bar (from web) */}
      {categories.length > 0 ? (
        <View className="mb-4 border-b border-ink-100 pb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {/* "All" Category circular item */}
            <Pressable
              onPress={() => setCategory('')}
              className="items-center w-[76px]"
            >
              <View className={`size-14 rounded-full border items-center justify-center mb-1.5 ${!category ? 'border-2 border-brand-500 bg-brand-50' : 'border-ink-200 bg-white'}`}>
                <Text className={`text-sm font-display font-extrabold ${!category ? 'text-brand-700' : 'text-ink-300'}`}>ALL</Text>
              </View>
              <Text className={`text-center text-[10px] font-bold ${!category ? 'text-brand-700' : 'text-ink-700'}`}>
                All
              </Text>
            </Pressable>

            {/* Individual categories items */}
            {categories.map((cat) => {
              const active = category === cat.slug;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.slug)}
                  className="items-center w-[76px]"
                >
                  <View className={`size-14 rounded-full overflow-hidden border items-center justify-center mb-1.5 ${active ? 'border-2 border-brand-500 bg-brand-50' : 'border-ink-200 bg-white'}`}>
                    {cat.image_url ? (
                      <Image source={{ uri: cat.image_url }} className="w-full h-full object-cover" />
                    ) : (
                      <Text className={`text-sm font-display font-extrabold ${active ? 'text-brand-700' : 'text-ink-300'}`}>
                        {getCategoryInitials(cat.name)}
                      </Text>
                    )}
                  </View>
                  <Text className={`text-center text-[10px] font-bold leading-snug line-clamp-2 ${active ? 'text-brand-700' : 'text-ink-700'}`} numberOfLines={2}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Main product list */}
      <View className="flex-1 px-2">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : isError ? (
          <View className="flex-1 justify-center items-center px-4">
            <EmptyState
              title="Couldn't load results"
              description="The server didn't respond. Please retry."
              action={
                <Button variant="outline" onPress={() => void refetch()} className="flex-row gap-2">
                  <RefreshCw size={14} color={colors.ink[700]} />
                  <Text className="font-semibold text-ink-700">Retry</Text>
                </Button>
              }
            />
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <EmptyState
              title="No products found"
              description="Try adjusting your categories or brand filters."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onPress={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </View>
        ) : (
          <FlashList
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            estimatedItemSize={240}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={{ flex: 1, paddingHorizontal: 6 }}>
                <ProductCard product={item} to="ProductDetail" />
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

      {/* Brand Selection Modal */}
      <Modal visible={brandModalVisible} transparent animationType="fade" onRequestClose={() => setBrandModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <Pressable className="absolute inset-0" onPress={() => setBrandModalVisible(false)} />
          <View className="bg-white rounded-3xl w-full max-h-[75%] p-6 shadow-2xl overflow-hidden">
            <View className="flex-row items-center justify-between border-b border-ink-100 pb-3 mb-4">
              <Text className="text-base font-bold text-ink-900">Select Brand</Text>
              <Pressable onPress={() => setBrandModalVisible(false)} className="p-1 rounded-full active:bg-ink-50">
                <X size={18} color={colors.ink[600]} />
              </Pressable>
            </View>
            <FlatList
              data={[{ slug: '', name: 'All Brands' }, ...brandList]}
              keyExtractor={(item) => item.slug}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setBrand(item.slug);
                    setBrandModalVisible(false);
                  }}
                  className={`py-3.5 px-3 rounded-2xl flex-row items-center justify-between my-0.5 ${brand === item.slug ? 'bg-brand-50' : 'active:bg-ink-50'}`}
                >
                  <Text className={`text-sm ${brand === item.slug ? 'font-bold text-brand-700' : 'font-semibold text-ink-800'}`}>
                    {item.name}
                  </Text>
                  {brand === item.slug && <Text className="text-brand-600 font-bold">✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Sort Selection Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <Pressable className="absolute inset-0" onPress={() => setSortModalVisible(false)} />
          <View className="bg-white rounded-3xl w-full max-h-[75%] p-6 shadow-2xl overflow-hidden">
            <View className="flex-row items-center justify-between border-b border-ink-100 pb-3 mb-4">
              <Text className="text-base font-bold text-ink-900">Sort By</Text>
              <Pressable onPress={() => setSortModalVisible(false)} className="p-1 rounded-full active:bg-ink-50">
                <X size={18} color={colors.ink[600]} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} className="gap-1 mb-2">
              {SORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setSort(opt.value as Sort);
                    setSortModalVisible(false);
                  }}
                  className={`py-3.5 px-3 rounded-2xl flex-row items-center justify-between my-0.5 ${sort === opt.value ? 'bg-brand-50' : 'active:bg-ink-50'}`}
                >
                  <Text className={`text-sm ${sort === opt.value ? 'font-bold text-brand-700' : 'font-semibold text-ink-800'}`}>
                    {opt.label}
                  </Text>
                  {sort === opt.value && <Text className="text-brand-600 font-bold">✓</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
