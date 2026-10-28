import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';
import type { Product, ShopSectionWithProducts } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/tokens';
import { MediaFrame } from './ui';
import { ProductCard } from './ProductCard';
import { ProductRail } from './ProductRail';

const CARD_WIDTH = 176;
const CARD_GAP = 14;

/**
 * One shop category: title + "View all products", its sub category pills, then an auto-scrolling
 * rail of its products. Shared by the Shop home and the bottom of every category screen.
 * Product tiles are the plain Pass & Fail tile — "View Details" opens the full product page.
 */
export function ShopCategoryRow({ section }: { section: ShopSectionWithProducts }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const openCategory = (sub?: string) => navigation.navigate('ShopSection', { slug: section.slug, name: section.name, sub });
  const subs = section.sub_sections ?? [];

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
        <Pressable
          onPress={() => openCategory()}
          accessibilityRole="button"
          accessibilityLabel={`View all ${section.name} products`}
          className="flex-row items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 active:opacity-80 dark:bg-brand-950/40">
          <Text className="text-xs font-bold text-brand-700 dark:text-brand-400">View all</Text>
          <ChevronRight size={13} color={colors.brand[600]} />
        </Pressable>
      </View>

      {subs.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }} className="mb-3">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Sub categories</Text>
          {subs.map((sub) => (
            <Pressable
              key={sub.id}
              onPress={() => openCategory(sub.slug)}
              accessibilityRole="button"
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 active:bg-brand-50 dark:border-ink-700 dark:bg-surface-1">
              <Text className="text-xs font-semibold text-ink-700 dark:text-ink-200">{sub.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <ProductRail<Product>
        data={section.products}
        keyExtractor={(p) => String(p.id)}
        itemWidth={CARD_WIDTH}
        gap={CARD_GAP}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
