import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable, ScrollView, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
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
 * (in-app screen, website, mail/tel…). A single banner renders without dots. Height follows the
 * website's phone ratio (2:1).
 */
export function BannerSlider({ banners, className = 'mx-5' }: { banners: Banner[]; className?: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const focused = useIsFocused();
  // Defensive: the API only returns active banners, but never show an inactive one.
  const slides = banners.filter((b) => b.image_url && b.is_active !== false);
  const count = slides.length;

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const pausedUntil = useRef(0);

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

  return (
    <View className={className}>
      <View onLayout={onLayout} className="overflow-hidden rounded-2xl bg-ink-100 dark:bg-surface-2">
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
            style={{ width }}>
            {slides.map((banner) => (
              <Pressable
                key={banner.id}
                disabled={!banner.link}
                onPress={() => openLink(navigation, banner.link)}
                accessibilityRole={banner.link ? 'link' : 'image'}
                accessibilityLabel="Featured offer"
                style={{ width, height: Math.round(width * 0.5) }}>
                <MediaFrame src={banner.image_url} aspect="auto" rounded="2xl" resizeMode="cover" style={{ width: '100%', height: '100%' }} />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={{ height: 160 }} />
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
