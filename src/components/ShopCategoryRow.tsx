import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Platform, type ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';
import type { Product, ShopSectionWithProducts } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';
import { MediaFrame } from './ui';
import { ProductCard } from './ProductCard';
import { TapTarget } from './TapTarget';
import { prefetchShopSection } from '../api/prefetch';
import { preloadImages } from '../lib/preloadImages';

const CARD_WIDTH = 176;
const CARD_GAP = 14;
const VIEW_ALL_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function CardSeparator() {
  return <View style={{ width: CARD_GAP }} />;
}

/**
 * One shop category: title + "View all products", its sub category pills, then a virtualized
 * horizontal row of its products. Shared by Shop home and the bottom of every category screen.
 * Uses RNGH FlatList + Gesture.Tap so scrolling glides smoothly while only visible cards mount.
 */
function ShopCategoryRowInner({ section }: { section: ShopSectionWithProducts }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const navigatingRef = useRef(false);

  const subs = useMemo(() => section.sub_sections ?? [], [section.sub_sections]);
  const products = useMemo(() => section.products ?? [], [section.products]);

  useEffect(() => {
    if (products.length > 0) {
      preloadImages(
        products.slice(0, 6).map((p) => p.image_url),
        'normal',
      );
    }
  }, [products]);

  const openCategory = useCallback(
    (sub?: string) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      setTimeout(() => {
        navigatingRef.current = false;
      }, 800);
      prefetchShopSection({ section: section.slug, sub });
      navigation.navigate('ShopSection', { slug: section.slug, name: section.name, sub });
    },
    [navigation, section.slug, section.name],
  );

  const renderProduct: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <View style={{ width: CARD_WIDTH }}>
        <ProductCard product={item} to="ProductDetail" />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Product) => String(item.id), []);

  return (
    <View className="mt-8">
      <View className="mb-3 flex-row items-center justify-between px-5">
        <View className="mr-3 flex-1 flex-row items-center gap-3">
          {section.image_url ? (
            <View className="h-11 w-11 overflow-hidden rounded-full border border-ink-100 dark:border-ink-800">
              <MediaFrame src={section.image_url} alt={section.name} aspect="square" rounded="full" resizeMode="cover" className="h-full w-full" />
            </View>
          ) : null}
          <View className="flex-1">
            <Text className="text-xl font-display font-extrabold leading-tight text-ink-900 dark:text-white" numberOfLines={1}>
              {section.name}
            </Text>
            {typeof section.products_count === 'number' ? (
              <Text className="mt-0.5 text-[11px] font-medium text-ink-500 dark:text-ink-400">
                {section.products_count} product{section.products_count === 1 ? '' : 's'}
              </Text>
            ) : null}
          </View>
        </View>
        <TapTarget
          onPress={() => openCategory()}
          accessibilityLabel={`View all ${section.name} products`}
          hitSlop={VIEW_ALL_HIT_SLOP}
          className="flex-row items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 dark:bg-brand-950/40">
          <Text className="text-xs font-bold text-brand-700 dark:text-brand-400">View all</Text>
          <ChevronRight size={13} color={colors.brand[600]} />
        </TapTarget>
      </View>

      {subs.length > 0 ? (
        <FlatList
          horizontal
          data={subs}
          keyExtractor={(sub) => String(sub.id)}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          decelerationRate="normal"
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
          ListHeaderComponent={
            <Text className="text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Sub categories</Text>
          }
          renderItem={({ item: sub }) => (
            <TapTarget
              onPress={() => openCategory(sub.slug)}
              accessibilityLabel={sub.name}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 dark:border-ink-700 dark:bg-surface-1">
              <Text className="text-xs font-semibold text-ink-700 dark:text-ink-200">{sub.name}</Text>
            </TapTarget>
          )}
        />
      ) : null}

      {products.length > 0 ? (
        <FlatList<Product>
          horizontal
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderProduct}
          ItemSeparatorComponent={CardSeparator}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          decelerationRate="normal"
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          windowSize={3}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      ) : null}
    </View>
  );
}

export const ShopCategoryRow = React.memo(ShopCategoryRowInner);
