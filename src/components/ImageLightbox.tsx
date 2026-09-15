import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, PanResponder, Dimensions, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Minus, Plus, X } from 'lucide-react-native';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_MS = 280;

function distance(touches: any[]) {
  if (!touches || touches.length < 2) return 0;
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return 0;
  const ax = a.pageX ?? a.clientX ?? a.locationX ?? 0;
  const ay = a.pageY ?? a.clientY ?? a.locationY ?? 0;
  const bx = b.pageX ?? b.clientX ?? b.locationX ?? 0;
  const by = b.pageY ?? b.clientY ?? b.locationY ?? 0;
  return Math.hypot(ax - bx, ay - by);
}

/**
 * RN port of full-screen pinch/pan/double-tap zoom viewer for product gallery images.
 */
export function ImageLightbox({
  visible,
  src,
  alt,
  onClose,
}: {
  visible: boolean;
  src: string | null | undefined;
  alt?: string;
  onClose: () => void;
}) {
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
  const IMAGE_H = SCREEN_H * 0.75;

  const [zoomPct, setZoomPct] = useState(100);
  const scale = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const zoomRef = useRef(1);
  const currentTranslate = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const pinchOrigin = useRef({ dist: 0, zoom: 1 });
  const lastTap = useRef(0);

  const clampTranslate = (x: number, y: number, currentScale: number) => {
    const maxX = (SCREEN_W * (currentScale - 1)) / 2;
    const maxY = (IMAGE_H * (currentScale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const reset = () => {
    zoomRef.current = 1;
    setZoomPct(100);
    scale.setValue(1);
    translate.setValue({ x: 0, y: 0 });
    currentTranslate.current = { x: 0, y: 0 };
    panOrigin.current = { x: 0, y: 0 };
    pinchOrigin.current = { dist: 0, zoom: 1 };
  };

  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [visible, src]);

  const setZoom = (targetZoom: number, animate = true) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom));
    zoomRef.current = clamped;
    setZoomPct(Math.round(clamped * 100));

    if (animate) {
      Animated.spring(scale, {
        toValue: clamped,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }).start();
    } else {
      scale.setValue(clamped);
    }

    if (clamped === MIN_ZOOM) {
      currentTranslate.current = { x: 0, y: 0 };
      panOrigin.current = { x: 0, y: 0 };
      if (animate) {
        Animated.spring(translate, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start();
      } else {
        translate.setValue({ x: 0, y: 0 });
      }
    } else {
      const clampedPos = clampTranslate(currentTranslate.current.x, currentTranslate.current.y, clamped);
      currentTranslate.current = clampedPos;
      panOrigin.current = clampedPos;
      translate.setValue(clampedPos);
    }
  };

  const toggleDoubleTapZoom = () => {
    setZoom(zoomRef.current > MIN_ZOOM ? MIN_ZOOM : 2);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e) => {
        const touches = e.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const d = distance(touches);
          if (d > 0) {
            pinchOrigin.current = { dist: d, zoom: zoomRef.current };
          }
        } else {
          pinchOrigin.current = { dist: 0, zoom: zoomRef.current };
          panOrigin.current = { ...currentTranslate.current };
        }
      },
      onPanResponderMove: (e, gestureState) => {
        const touches = e.nativeEvent.touches;

        // Multi-touch pinch gesture handling (2 or more fingers)
        if (touches && touches.length >= 2) {
          const d = distance(touches);
          if (d > 0) {
            if (pinchOrigin.current.dist === 0) {
              // Pinch started mid-gesture
              pinchOrigin.current = { dist: d, zoom: zoomRef.current };
            } else {
              const factor = d / pinchOrigin.current.dist;
              const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchOrigin.current.zoom * factor));
              zoomRef.current = nextZoom;
              scale.setValue(nextZoom);
              setZoomPct(Math.round(nextZoom * 100));

              // Re-clamp translate if needed for new scale
              const clampedPos = clampTranslate(currentTranslate.current.x, currentTranslate.current.y, nextZoom);
              currentTranslate.current = clampedPos;
              translate.setValue(clampedPos);
            }
          }
          return;
        }

        // Finger lifted, reset pinch tracking & anchor pan origin
        if (pinchOrigin.current.dist > 0) {
          pinchOrigin.current.dist = 0;
          panOrigin.current = { ...currentTranslate.current };
        }

        // Single finger pan when zoomed in
        if (zoomRef.current > MIN_ZOOM) {
          const rawX = panOrigin.current.x + gestureState.dx;
          const rawY = panOrigin.current.y + gestureState.dy;
          const clampedPos = clampTranslate(rawX, rawY, zoomRef.current);
          currentTranslate.current = clampedPos;
          translate.setValue(clampedPos);
        }
      },
      onPanResponderRelease: (_e, gestureState) => {
        pinchOrigin.current.dist = 0;
        if (zoomRef.current > MIN_ZOOM) {
          panOrigin.current = { ...currentTranslate.current };
        } else {
          panOrigin.current = { x: 0, y: 0 };
          currentTranslate.current = { x: 0, y: 0 };
          Animated.spring(translate, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }

        const now = Date.now();
        const isTap = Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6;
        if (isTap) {
          if (now - lastTap.current < DOUBLE_TAP_MS) {
            toggleDoubleTapZoom();
            lastTap.current = 0;
          } else {
            lastTap.current = now;
          }
        }
      },
      onPanResponderTerminate: () => {
        pinchOrigin.current.dist = 0;
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  if (!src) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: 'rgba(6,10,8,0.96)' }}>
        <View className="flex-row items-center justify-between px-4 pt-14 pb-2 z-10">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setZoom(zoomRef.current - 0.5)}
              disabled={zoomPct <= 100}
              accessibilityLabel="Zoom out"
              className="size-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
              style={{ opacity: zoomPct <= 100 ? 0.3 : 1 }}
            >
              <Minus size={18} color="#fff" />
            </Pressable>
            <Text className="min-w-14 text-center text-sm font-semibold text-white/80">{zoomPct}%</Text>
            <Pressable
              onPress={() => setZoom(zoomRef.current + 0.5)}
              disabled={zoomPct >= 400}
              accessibilityLabel="Zoom in"
              className="size-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
              style={{ opacity: zoomPct >= 400 ? 0.3 : 1 }}
            >
              <Plus size={18} color="#fff" />
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              reset();
              onClose();
            }}
            accessibilityLabel="Close"
            className="size-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
          >
            <X size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={{ flex: 1, overflow: 'hidden' }} {...panResponder.panHandlers}>
          <Animated.View
            pointerEvents="none"
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }],
            }}
          >
            <FastImage
              source={{ uri: src }}
              resizeMode={FastImage.resizeMode.contain}
              style={{ width: SCREEN_W, height: IMAGE_H }}
              accessibilityLabel={alt}
            />
          </Animated.View>
        </View>

        <Text className="pb-8 text-center text-xs text-white/50">Pinch or double-tap to zoom · drag to pan</Text>
      </View>
    </Modal>
  );
}

