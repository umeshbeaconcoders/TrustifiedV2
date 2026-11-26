import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ScrollView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Banner } from '../api/types';
import type { RootStackParamList } from '../navigation/types';
import { MediaFrame } from './ui';
import { openLink } from '../lib/openLink';
import { preloadImages } from '../lib/preloadImages';

/** Auto-advance interval (matches the website slider). */
const AUTOPLAY_MS = 2500;
/** After the user touches/swipes, leave the slider alone for a moment. */
const RESUME_AFTER_MS = 3500;

function BannerSlide({
  banner,
  width,
  height,
  onPress,
}: {
  banner: Banner;
  width: number;
  height: number;
  onPress: (link: string | null | undefined) => void;
}) {
  const latestPressRef = useRef(() => onPress(banner.link));
  latestPressRef.current = () => onPress(banner.link);

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(Boolean(banner.link))
        .maxDistance(8)
        .maxDuration(350)
        .runOnJS(true)
        .onEnd((_event, success) => {
          if (success) {
            latestPressRef.current();
          }
        }),
    [banner.link],
  );

  return (
    <GestureDetector gesture={tap}>
      <View
        collapsable={false}
        accessibilityRole={banner.link ? 'link' : 'image'}
        accessibilityLabel="Featured offer"
        style={{ width, height }}>
        <MediaFrame
          src={banner.image_url}
          aspect="auto"
          rounded="2xl"
          resizeMode="contain"
          priority="high"
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    </GestureDetector>
  );
}

/**
 * Auto-advancing infinite banner carousel with dots and manual left/right swipe.
 * Uses RNGH ScrollView + Gesture.Tap so touching anywhere on a banner scrolls left/right
 * smoothly even during auto-scroll, and a single tap opens its admin-set link.
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
  const isLooping = count >= 2;
  const loopSlides = useMemo(
    () => (isLooping ? [slides[count - 1]!, ...slides, slides[0]!] : slides),
    [isLooping, slides, count],
  );

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  // Default to standard banner ratio (1920 / 672 ≈ 2.857)
  const [aspectRatio, setAspectRatio] = useState<number>(customAspectRatio ?? 1920 / 672);

  const scrollRef = useRef<ScrollView>(null);
  const loopIndexRef = useRef(isLooping ? 1 : 0);
  const dotIndexRef = useRef(0);
  const pausedUntil = useRef(0);
  const isTouchingRef = useRef(false);
  const wrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openingRef = useRef(false);

  const clearWrapTimer = useCallback(() => {
    if (wrapTimerRef.current) {
      clearTimeout(wrapTimerRef.current);
      wrapTimerRef.current = null;
    }
  }, []);

  const handleBannerPress = useCallback(
    (link: string | null | undefined) => {
      if (!link || openingRef.current) return;
      openingRef.current = true;
      setTimeout(() => {
        openingRef.current = false;
      }, 800);
      openLink(navigation, link);
    },
    [navigation],
  );

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
          setAspectRatio(1920 / 672);
        },
      );
    }
  }, [slides[0]?.image_url, customAspectRatio]);

  // Position scroll at the first real slide (index 1 when looping) once width is known
  useEffect(() => {
    if (width === 0) return;
    const initialLoopIdx = isLooping ? 1 : 0;
    loopIndexRef.current = initialLoopIdx;
    dotIndexRef.current = 0;
    setIndex(0);
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialLoopIdx * width, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [width, isLooping, count]);

  useEffect(() => clearWrapTimer, [clearWrapTimer]);

  // Warm FastImage cache for all slides so swiping reveals banners instantaneously
  useEffect(() => {
    if (slides.length > 0) {
      preloadImages(
        slides.map((s) => s.image_url),
        'high',
      );
    }
  }, [slides]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const nextW = Math.round(e.nativeEvent.layout.width);
    setWidth((prev) => (prev === nextW ? prev : nextW));
  }, []);

  const snapIfCloned = useCallback(
    (rawLoopIdx: number) => {
      if (!isLooping || width === 0) {
        loopIndexRef.current = 0;
        dotIndexRef.current = 0;
        setIndex(0);
        return;
      }
      if (rawLoopIdx <= 0) {
        loopIndexRef.current = count;
        dotIndexRef.current = count - 1;
        setIndex(count - 1);
        scrollRef.current?.scrollTo({ x: count * width, animated: false });
      } else if (rawLoopIdx >= count + 1) {
        loopIndexRef.current = 1;
        dotIndexRef.current = 0;
        setIndex(0);
        scrollRef.current?.scrollTo({ x: width, animated: false });
      } else {
        const real = rawLoopIdx - 1;
        loopIndexRef.current = rawLoopIdx;
        dotIndexRef.current = real;
        setIndex(real);
      }
    },
    [isLooping, count, width],
  );

  // Autoplay advances one slide forward seamlessly; stops cleanly whenever user touches/drags
  useEffect(() => {
    if (!isLooping || width === 0 || !focused) return;
    const timer = setInterval(() => {
      if (isTouchingRef.current || Date.now() < pausedUntil.current) return;
      const nextLoop = loopIndexRef.current + 1;
      loopIndexRef.current = nextLoop;
      const nextDot = nextLoop >= count + 1 ? 0 : nextLoop - 1;
      dotIndexRef.current = nextDot;
      setIndex(nextDot);
      scrollRef.current?.scrollTo({ x: nextLoop * width, animated: true });

      // Fallback snap for Android where programmatic scrollTo may skip onMomentumScrollEnd
      if (nextLoop >= count + 1) {
        clearWrapTimer();
        wrapTimerRef.current = setTimeout(() => {
          if (!isTouchingRef.current && loopIndexRef.current >= count + 1) {
            snapIfCloned(count + 1);
          }
        }, 420);
      }
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(timer);
      clearWrapTimer();
    };
  }, [isLooping, count, width, focused, clearWrapTimer, snapIfCloned]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isLooping || width === 0) return;
    const raw = Math.round(e.nativeEvent.contentOffset.x / width);
    const mapped = raw <= 0 ? count - 1 : raw >= count + 1 ? 0 : raw - 1;
    if (mapped !== dotIndexRef.current) {
      dotIndexRef.current = mapped;
      setIndex(mapped);
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    clearWrapTimer();
    isTouchingRef.current = false;
    if (width === 0) return;
    const raw = Math.round(e.nativeEvent.contentOffset.x / width);
    snapIfCloned(raw);
  };

  const pauseAutoplay = () => {
    clearWrapTimer();
    pausedUntil.current = Date.now() + RESUME_AFTER_MS;
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
            bounces={true}
            decelerationRate="fast"
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onTouchStart={() => {
              isTouchingRef.current = true;
              pauseAutoplay();
            }}
            onTouchEnd={() => {
              isTouchingRef.current = false;
              pausedUntil.current = Date.now() + RESUME_AFTER_MS;
            }}
            onTouchCancel={() => {
              isTouchingRef.current = false;
            }}
            onScrollBeginDrag={() => {
              isTouchingRef.current = true;
              pauseAutoplay();
            }}
            onScrollEndDrag={(e) => {
              isTouchingRef.current = false;
              pausedUntil.current = Date.now() + RESUME_AFTER_MS;
              // If user stopped exactly on a clone without momentum, wrap immediately
              const vx = e.nativeEvent.velocity?.x ?? 0;
              if (Math.abs(vx) < 0.05 && width > 0) {
                const raw = Math.round(e.nativeEvent.contentOffset.x / width);
                if (raw <= 0 || raw >= count + 1) {
                  snapIfCloned(raw);
                } else {
                  loopIndexRef.current = raw;
                }
              }
            }}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumEnd}
            style={{ width, height: bannerHeight }}>
            {loopSlides.map((banner, idx) => (
              <BannerSlide
                key={`${banner.id}-${idx}`}
                banner={banner}
                width={width}
                height={bannerHeight}
                onPress={handleBannerPress}
              />
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
