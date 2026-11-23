import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  const touchableRef = useRef<TouchableOpacity>(null);
  const openedRef = useRef(false);

  const handlePressIn = () => {
    touchableRef.current?.setNativeProps({ opacity: 0.7 });
    handlePress();
  };

  const handlePressOut = () => {
    touchableRef.current?.setNativeProps({ opacity: 1 });
  };

  const handlePress = () => {
    if (openedRef.current) return;

    const slug = product?.slug || (product?.id ? String(product.id) : '');
    if (!slug) return;

    openedRef.current = true;

    if (navigationRef.isReady()) {
      navigationRef.navigate(to, { slug });
    } else {
      navigation.navigate(to, { slug });
    }

    setTimeout(() => {
      openedRef.current = false;
    }, 700);
  };

  return (
    <TouchableOpacity
      ref={touchableRef}
      activeOpacity={0.7}
      delayPressIn={0}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="w-full overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1">
      <MediaFrame src={product.image_url} alt={product.name} aspect="square" rounded="lg" className="m-2" />
      <View className="gap-1 px-3 pb-3">
        {product.brand ? (
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-brand-700" numberOfLines={1}>
            {product.brand.name}
          </Text>
        ) : null}
        <Text className="text-sm font-bold text-ink-900 dark:text-white" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          {product.status !== 'untested' ? <StatusBadge status={product.status} isGold={product.is_gold} size="sm" /> : null}
          {showRating && Number(product.reviews_count) > 0 ? (
            <View className="flex-row items-center gap-1">
              <StarRating value={Number(product.rating_avg) || 0} size={11} />
              <Text className="text-[11px] text-ink-500 dark:text-ink-400">({Number(product.reviews_count)})</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
