import React, { useState } from 'react';
import { View, Text, Pressable, Linking, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExternalLink, ShoppingCart, ShieldCheck, X, ChevronRight, Store } from 'lucide-react-native';
import { MediaFrame, StatusBadge, StarRating } from './ui';
import type { Product, BuyLink } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { appendUtmParams } from './BuyLinks';
import { colors } from '../theme/tokens';

function getStoreColor(label?: string | null) {
  const l = (label ?? '').toLowerCase();
  if (l.includes('amazon')) return { bg: '#FF9900', text: '#111827' };
  if (l.includes('flipkart')) return { bg: '#2874F0', text: '#ffffff' };
  if (l.includes('blinkit')) return { bg: '#F8CB46', text: '#111827' };
  if (l.includes('zepto')) return { bg: '#8B5CF6', text: '#ffffff' };
  if (l.includes('hyuga') || l.includes('healthkart')) return { bg: '#0D9488', text: '#ffffff' };
  return { bg: colors.brand[600], text: '#ffffff' };
}

export function ShopProductCard({
  product,
  horizontal = false,
}: {
  product: Product;
  horizontal?: boolean;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [storesModalOpen, setStoresModalOpen] = useState(false);

  const buyLinks = (product.buy_links ?? []).filter((l) => Boolean(l.url));
  const primaryLinks = buyLinks.slice(0, 2);
  const remainingCount = buyLinks.length - 2;

  const handleOpenStore = (url: string | null | undefined) => {
    if (!url) return;
    const trackedUrl = appendUtmParams(url);
    Linking.openURL(trackedUrl).catch(() => {});
  };

  const handleProductPress = () => {
    navigation.navigate('ProductDetail', { slug: product.slug });
  };

  return (
    <View
      className={`overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 shadow-sm ${
        horizontal ? 'w-64' : 'w-full flex-1'
      }`}
    >
      {/* Product Image & Tap Area */}
      <Pressable
        onPress={handleProductPress}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        className="active:opacity-90"
      >
        <View className="relative bg-ink-50/50 dark:bg-surface-2 p-3 items-center justify-center">
          <MediaFrame
            src={product.image_url}
            alt={product.name}
            aspect="square"
            rounded="xl"
            className="w-full h-40"
          />
          {product.is_gold ? (
            <View className="absolute top-2 left-2 bg-[#f9b531] px-2 py-0.5 rounded-full flex-row items-center gap-1 shadow-sm">
              <ShieldCheck size={11} color="#000" />
              <Text className="text-[10px] font-extrabold text-black uppercase tracking-wider">Gold</Text>
            </View>
          ) : product.status !== 'untested' ? (
            <View className="absolute top-2 left-2">
              <StatusBadge status={product.status} size="sm" />
            </View>
          ) : null}
        </View>

        {/* Details */}
        <View className="px-3 pt-3 pb-2">
          {product.brand?.name ? (
            <Text
              className="text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-0.5"
              numberOfLines={1}
            >
              {product.brand.name}
            </Text>
          ) : null}

          <Text
            className="text-xs font-bold text-ink-900 dark:text-white leading-tight"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          {/* Rating */}
          <View className="mt-1.5 flex-row items-center gap-1.5">
            {product.rating_avg > 0 ? (
              <>
                <StarRating value={product.rating_avg} size={11} />
                <Text className="text-[11px] font-semibold text-ink-600 dark:text-ink-400">
                  {Number(product.rating_avg).toFixed(1)}
                </Text>
                {product.reviews_count > 0 ? (
                  <Text className="text-[10px] text-ink-400 dark:text-ink-500">
                    ({product.reviews_count})
                  </Text>
                ) : null}
              </>
            ) : (
              <Text className="text-[10px] font-medium text-ink-400 dark:text-ink-500">
                100% Blind Tested
              </Text>
            )}
          </View>
        </View>
      </Pressable>

      {/* Affiliate Buy Buttons */}
      <View className="px-3 pb-3 pt-1 border-t border-ink-100/60 dark:border-ink-800/60 mt-auto gap-1.5">
        {primaryLinks.map((link, idx) => {
          const store = getStoreColor(link.label);
          return (
            <Pressable
              key={idx}
              onPress={() => handleOpenStore(link.url)}
              accessibilityRole="button"
              accessibilityLabel={`Buy on ${link.label ?? 'Store'}`}
              className="w-full flex-row items-center justify-between py-1.5 px-2.5 rounded-xl active:opacity-85 shadow-2xs"
              style={{ backgroundColor: store.bg }}
            >
              <View className="flex-row items-center gap-1.5 flex-1 pr-1">
                <ShoppingCart size={13} color={store.text} />
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: store.text }}
                  numberOfLines={1}
                >
                  Buy on {link.label ?? 'Store'}
                </Text>
              </View>
              <ExternalLink size={11} color={store.text} />
            </Pressable>
          );
        })}

        {remainingCount > 0 ? (
          <Pressable
            onPress={() => setStoresModalOpen(true)}
            accessibilityRole="button"
            className="w-full py-1.5 items-center justify-center rounded-xl border border-dashed border-brand-500/50 bg-brand-50/20 dark:bg-brand-950/20 active:bg-brand-50/40"
          >
            <Text className="text-[11px] font-bold text-brand-600">
              +{remainingCount} more {remainingCount === 1 ? 'store' : 'stores'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* All Stores Modal */}
      <Modal
        visible={storesModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStoresModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => setStoresModalOpen(false)}
          />
          <View className="bg-white dark:bg-surface-1 rounded-t-3xl p-5 pb-8 max-h-[80%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-ink-100 dark:border-ink-800">
              <View className="flex-1 pr-3">
                <Text className="text-base font-bold text-ink-900 dark:text-white" numberOfLines={1}>
                  Available Stores
                </Text>
                <Text className="text-xs text-ink-500 dark:text-ink-400" numberOfLines={1}>
                  {product.name}
                </Text>
              </View>
              <Pressable
                onPress={() => setStoresModalOpen(false)}
                className="p-1 rounded-full bg-ink-100 dark:bg-surface-2"
              >
                <X size={18} color={colors.ink[600]} />
              </Pressable>
            </View>

            <ScrollView className="mt-3 gap-2" showsVerticalScrollIndicator={false}>
              {buyLinks.map((link, idx) => {
                const store = getStoreColor(link.label);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setStoresModalOpen(false);
                      handleOpenStore(link.url);
                    }}
                    className="flex-row items-center justify-between p-3 rounded-2xl border border-ink-100 dark:border-ink-800 active:bg-ink-50 dark:active:bg-surface-2 mb-2"
                  >
                    <View className="flex-row items-center gap-2.5">
                      <View
                        className="w-8 h-8 rounded-xl items-center justify-center"
                        style={{ backgroundColor: store.bg }}
                      >
                        <Store size={16} color={store.text} />
                      </View>
                      <View>
                        <Text className="text-sm font-bold text-ink-900 dark:text-white">
                          {link.label ?? 'Store'}
                        </Text>
                        <Text className="text-[11px] text-ink-400">Verified official seller</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1 bg-brand-500/10 px-2.5 py-1 rounded-full">
                      <Text className="text-xs font-bold text-brand-600">Buy</Text>
                      <ChevronRight size={13} color={colors.brand[600]} />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
