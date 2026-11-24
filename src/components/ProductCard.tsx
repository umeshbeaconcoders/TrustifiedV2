import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, type GestureResponderEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MediaFrame, StatusBadge, StarRating } from './ui';
import type { Product } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';

/** RN port of `frontend/apps/web/src/components/product-card.tsx`. */
export function ProductCard({
  product,
  to = 'ProductDetail',
  showRating = true,
}: {
  product: Product;
  to?: 'ProductDetail' | 'ReportDetail';
  showRating?: boolean;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const navigatingRef = useRef(false);

  const handlePress = () => {
    if (navigatingRef.current) return;
    const slug = product?.slug || (product?.id ? String(product.id) : '');
    if (!slug) return;

    navigatingRef.current = true;
    setTimeout(() => {
      navigatingRef.current = false;
    }, 800);

    if (navigationRef.isReady()) {
      navigationRef.navigate(to as any, { slug });
    } else {
      navigation.navigate(to, { slug });
    }
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    touchStartRef.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
    };
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const dx = Math.abs(e.nativeEvent.pageX - start.x);
    const dy = Math.abs(e.nativeEvent.pageY - start.y);
    const dt = Date.now() - start.time;

    // If moved less than 15px and released within 450ms, it is a single click / tap
    if (dx < 15 && dy < 15 && dt < 450) {
      handlePress();
    }
  };

  const onTouchCancel = () => {
    touchStartRef.current = null;
  };

  return (
    <View
      style={{ width: '100%' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}>
      <TouchableOpacity
        activeOpacity={0.7}
        delayPressIn={0}
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        style={{ width: '100%' }}
        className="w-full overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1">
        <MediaFrame
          src={product.image_url}
          alt={product.name}
          aspect="square"
          rounded="lg"
          className="m-2"
        />
        <View className="gap-1 px-3 pb-3">
          {product.brand ? (
            <Text
              className="text-[11px] font-semibold uppercase tracking-wide text-brand-700"
              numberOfLines={1}>
              {product.brand.name}
            </Text>
          ) : null}
          <Text
            className="text-sm font-bold text-ink-900 dark:text-white"
            numberOfLines={2}>
            {product.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            {product.status !== 'untested' ? (
              <StatusBadge
                status={product.status}
                isGold={product.is_gold}
                size="sm"
              />
            ) : null}
            {showRating && Number(product.reviews_count) > 0 ? (
              <View className="flex-row items-center gap-1">
                <StarRating
                  value={Number(product.rating_avg) || 0}
                  size={11}
                />
                <Text className="text-[11px] text-ink-500 dark:text-ink-400">
                  ({Number(product.reviews_count)})
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
