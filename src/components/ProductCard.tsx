import React, { useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MediaFrame, StatusBadge, StarRating } from './ui';
import type { Product } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { navigationRef } from '../navigation/navigationRef';
import { prefetchProduct } from '../api/prefetch';
import { preloadImages } from '../lib/preloadImages';

/** RN port of `frontend/apps/web/src/components/product-card.tsx`. */
function ProductCardInner({
  product,
  to = 'ProductDetail',
  showRating = true,
}: {
  product: Product;
  to?: 'ProductDetail' | 'ReportDetail';
  showRating?: boolean;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const navigatingRef = useRef(false);

  const handlePress = () => {
    if (navigatingRef.current) return;
    const slug = product?.slug || (product?.id ? String(product.id) : '');
    if (!slug) return;

    navigatingRef.current = true;
    setTimeout(() => {
      navigatingRef.current = false;
    }, 800);

    // Warm product detail + report + reviews & gallery images in parallel with screen transition
    prefetchProduct(slug, to === 'ReportDetail');
    const gallery = Array.isArray(product.gallery) ? product.gallery : [];
    preloadImages([product.image_url, ...gallery], 'high');

    if (navigationRef.isReady()) {
      navigationRef.navigate(to as any, { slug });
    } else {
      navigation.navigate(to, { slug });
    }
  };

  // Keep latest handler in a ref so FlashList / ScrollView cell recycling never holds a stale closure
  const latestPressRef = useRef(handlePress);
  latestPressRef.current = handlePress;

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(8)
        .maxDuration(350)
        .runOnJS(true)
        .onEnd((_event, success) => {
          if (success) {
            latestPressRef.current();
          }
        }),
    [],
  );

  return (
    <GestureDetector gesture={tap}>
      <View
        collapsable={false}
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
      </View>
    </GestureDetector>
  );
}

export const ProductCard = React.memo(ProductCardInner, (prev, next) => {
  return (
    prev.to === next.to &&
    prev.showRating === next.showRating &&
    prev.product.id === next.product.id &&
    prev.product.slug === next.product.slug &&
    prev.product.name === next.product.name &&
    prev.product.image_url === next.product.image_url &&
    prev.product.status === next.product.status &&
    prev.product.is_gold === next.product.is_gold &&
    prev.product.reviews_count === next.product.reviews_count &&
    prev.product.rating_avg === next.product.rating_avg &&
    prev.product.gallery === next.product.gallery
  );
});
