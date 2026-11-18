import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  Image,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Banner } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { MediaFrame } from './ui';
import { openLink } from '../lib/openLink';

/** Auto-advance interval (matches the website slider). */
const AUTOPLAY_MS = 2500;
/** After the user touches/swipes, leave the slider alone for a moment. */
const RESUME_AFTER_MS = 3500;

/**
 * Auto-advancing banner carousel with dots and swipe. Tapping a slide opens its admin-set link
 * (in-app screen, website, mail/tel…). A single banner renders without dots.
 * Height automatically matches the banner's natural aspect ratio (1920x672 = ~2.86:1) so
 * no content or text is cropped.
 */
export function BannerSlider({
  banners,
  className = 'mx-5',
  aspectRatio: customAspectRatio,
}: {
  banners: Banner[];
  className?: string;
  aspectRatio?: number;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const focused = useIsFocused();
  // Defensive: the API only returns active banners, but never show an inactive one.
  const slides = banners.filter((b) => b.image_url && b.is_active !== false);
  const count = slides.length;

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  // Default to standard banner ratio (1920 / 672 ≈ 2.857)
  const [aspectRatio, setAspectRatio] = useState<number>(customAspectRatio ?? 1920 / 672);

  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const pausedUntil = useRef(0);

  // Measure natural aspect ratio from first slide's image
  useEffect(() => {
    if (customAspectRatio) {
      setAspectRatio(customAspectRatio);
      return;
    }
    const firstUrl = slides[0]?.image_url;
    if (firstUrl) {
      Image.getSize(
        firstUrl,
        (w, h) => {
          if (w > 0 && h > 0) {
            setAspectRatio(w / h);
          }
        },
        () => {
          // Fallback to standard 1920:672
          setAspectRatio(1920 / 672);
        },
      );
    }
  }, [slides[0]?.image_url, customAspectRatio]);

  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width)), []);

  const goTo = useCallback(
    (next: number, animated = true) => {
      indexRef.current = next;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated });
    },
    [width],
  );

  useEffect(() => {
    if (count < 2 || width === 0 || !focused) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      goTo((indexRef.current + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, width, focused, goTo]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = next;
    setIndex(next);
  };

  if (count === 0) return null;

  const bannerHeight = width > 0 ? Math.round(width / aspectRatio) : 120;

  return (
    <View className={className}>
      <View onLayout={onLayout} className="overflow-hidden rounded-2xl bg-ink-100 dark:bg-surface-2" style={{ height: width > 0 ? bannerHeight : undefined }}>
        {width > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              pausedUntil.current = Date.now() + RESUME_AFTER_MS;
            }}
            onMomentumScrollEnd={onMomentumEnd}
            style={{ width, height: bannerHeight }}>
            {slides.map((banner) => (
              <Pressable
                key={banner.id}
                disabled={!banner.link}
                onPress={() => openLink(navigation, banner.link)}
                accessibilityRole={banner.link ? 'link' : 'image'}
                accessibilityLabel="Featured offer"
                style={{ width, height: bannerHeight }}>
                <MediaFrame
                  src={banner.image_url}
                  aspect="auto"
                  rounded="2xl"
                  resizeMode="contain"
                  style={{ width: '100%', height: '100%' }}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={{ height: 120 }} />
        )}
      </View>

      {count > 1 ? (
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          {slides.map((banner, i) => (
            <View key={banner.id} className={`h-1.5 rounded-full ${i === index ? 'w-5 bg-brand-500' : 'w-1.5 bg-ink-300 dark:bg-ink-700'}`} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
