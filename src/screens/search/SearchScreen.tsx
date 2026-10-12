import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, X, ChevronRight } from 'lucide-react-native';
import { useProducts, useCategories, useCertifiedBrands } from '../../api';
import { useDebouncedValue } from '../../lib/useDebounce';
import { StatusBadge, MediaFrame, Spinner, EmptyState } from '../../components/ui';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);
  const topPadding = topInset + 8;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: categoriesRes, isLoading: categoriesLoading, refetch: refetchCategories, isRefetching: isRefetchingCategories } = useCategories();
  const { data: brandsRes, isLoading: brandsLoading, refetch: refetchBrands, isRefetching: isRefetchingBrands } = useCertifiedBrands();
  const { data: productsRes, isLoading: productsLoading, refetch: refetchProducts, isRefetching: isRefetchingProducts } = useProducts({
    search: debouncedSearch,
    per_page: 20,
  });

  const isRefreshing = isRefetchingCategories || isRefetchingBrands || isRefetchingProducts;

  const onRefresh = () => {
    void refetchCategories();
    void refetchBrands();
    void refetchProducts();
  };

  const categories = useMemo(() => {
    return (categoriesRes?.data ?? []).filter((c) => !c.is_upcoming);
  }, [categoriesRes]);

  const brands = useMemo(() => {
    return (brandsRes?.data ?? []).filter((b) => !!b.logo_url);
  }, [brandsRes]);

  const matchingBrands = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const query = debouncedSearch.toLowerCase();
    const allBrands = Array.isArray(brandsRes?.data) ? brandsRes.data : [];
    return allBrands.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [debouncedSearch, brandsRes]);

  const products = productsRes?.data ?? [];

  const handleCategoryPress = (slug: string) => {
    navigation.navigate('Tabs', {
      screen: 'Reports',
      params: { category: slug },
    });
  };

  const handleBrandPress = (slug: string) => {
    navigation.navigate('BrandDetail', { slug });
  };

  const hasSearch = debouncedSearch.trim().length > 0;
  const isLoading = (hasSearch && productsLoading) || (!hasSearch && (categoriesLoading || brandsLoading));

  return (
    <View className="flex-1 bg-white dark:bg-surface-1" style={{ paddingTop: topPadding }}>
      {/* Search Header */}
      <View className="px-4 pb-3 border-b border-ink-100 dark:border-ink-800">
        <Text className="text-2xl font-display font-bold text-ink-900 dark:text-white mb-3">Search</Text>
        <View className="flex-row items-center rounded-xl border border-ink-200 dark:border-ink-700 px-3 bg-ink-50/50">
          <Search size={18} color={colors.ink[400]} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products or brands..."
            placeholderTextColor={colors.ink[400]}
            className="h-12 flex-1 text-sm text-ink-900 dark:text-white font-semibold px-2"
            accessibilityLabel="Search products or brands"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} className="p-1">
              <X size={16} color={colors.ink[500]} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Spinner />
        </View>
      ) : hasSearch ? (
        /* Search Results View */
        <ScrollView
          className="flex-1 bg-white dark:bg-surface-1"
          contentContainerClassName="py-4 px-4 pb-8"
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.brand[500]]} />}
        >
          {/* Brands Matching */}
          {matchingBrands.length > 0 ? (
            <View className="mb-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">
                Matching Brands ({matchingBrands.length})
              </Text>
              <View className="gap-2">
                {matchingBrands.map((brand) => (
                  <Pressable
                    key={brand.id}
                    onPress={() => brand.slug && handleBrandPress(brand.slug)}
                    className="flex-row items-center gap-3 bg-ink-50/40 border border-ink-100 dark:border-ink-800 p-3 rounded-2xl active:bg-ink-100/50"
                  >
                    <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="xl" className="w-10 h-10 border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1" />
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-ink-900 dark:text-white">{brand.name}</Text>
                      <Text className="text-[10px] font-semibold text-brand-700 uppercase">Certified Brand</Text>
                    </View>
                    <ChevronRight size={16} color={colors.ink[300]} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {/* Products Matching */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">
              Matching Products ({products.length})
            </Text>
            {products.length === 0 && matchingBrands.length === 0 ? (
              <EmptyState
                title="No results found"
                description={`We couldn't find any products or brands matching "${search}"`}
                action={
                  <Pressable onPress={() => setSearch('')} className="bg-brand-50 border border-brand-100 px-4 py-2 rounded-xl">
                    <Text className="text-xs font-bold text-brand-700">Clear Search</Text>
                  </Pressable>
                }
              />
            ) : (
              <View className="gap-3">
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
                    className="flex-row items-center gap-3 bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 p-3 rounded-2xl active:bg-ink-50"
                  >
                    <MediaFrame src={product.image_url} alt={product.name} aspect="square" rounded="xl" className="w-16 h-16 border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1" />
                    <View className="flex-1 gap-0.5">
                      {product.brand ? (
                        <Text className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                          {product.brand.name}
                        </Text>
                      ) : null}
                      <Text className="text-xs font-bold text-ink-900 dark:text-white" numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        {product.status !== 'untested' ? (
                          <StatusBadge status={product.status} isGold={product.is_gold} size="sm" />
                        ) : null}
                      </View>
                    </View>
                    <ChevronRight size={16} color={colors.ink[300]} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Empty State Suggestions & Browse categories/brands */
        <ScrollView
          className="flex-1 bg-white dark:bg-surface-1"
          contentContainerClassName="py-4 pb-8"
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.brand[500]]} />}
        >

          {/* Browse by Category */}
          {categories.length > 0 ? (
            <View className="px-4 mb-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">Browse Categories</Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat.slug)}
                    className="w-[48%] flex-row items-center gap-2.5 bg-ink-50/30 border border-ink-100 dark:border-ink-800 p-3 rounded-2xl active:bg-ink-100/50"
                  >
                    <View className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 items-center justify-center">
                      {cat.image_url ? (
                        <Image source={{ uri: cat.image_url }} className="w-full h-full object-cover" />
                      ) : (
                        <Text className="text-xs font-bold text-ink-300">
                          {cat.name.trim().charAt(0).toUpperCase() || '?'}
                        </Text>
                      )}
                    </View>
                    <Text className="flex-1 text-xs font-bold text-ink-800 dark:text-ink-100" numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {/* Browse by Brand */}
          {brands.length > 0 ? (
            <View className="mb-4">
              <Text className="px-4 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">Certified Brands</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4">
                {brands.map((brand) => (
                  <Pressable
                    key={brand.id}
                    onPress={() => brand.slug && handleBrandPress(brand.slug)}
                    className="w-24 items-center gap-1 bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 p-2.5 rounded-2xl shadow-sm active:border-brand-300"
                  >
                    <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="lg" className="w-16 h-16 border border-ink-50" />
                    <Text className="text-center text-[10px] font-bold text-ink-700 dark:text-ink-200 w-full" numberOfLines={1}>
                      {brand.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
