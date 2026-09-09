import React, { useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, PanResponder, Dimensions, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Minus, Plus, X } from 'lucide-react-native';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_MS = 280;

function distance(touches: { pageX: number; pageY: number }[]) {
  const [a, b] = touches;
  if (!a || !b) return 0;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

/**
 * RN port of `frontend/apps/web/src/components/image-lightbox.tsx` — full-screen
 * pinch/pan/double-tap zoom viewer for the product gallery image, built on core
 * RN (Modal + Animated + PanResponder) so it needs no extra native dependency.
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
  const [zoomPct, setZoomPct] = useState(100);
  const scale = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const zoomRef = useRef(1);
  const panOrigin = useRef({ x: 0, y: 0 });
  const pinchOrigin = useRef({ dist: 0, zoom: 1 });
  const lastTap = useRef(0);

  const setZoom = (z: number, animate = true) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    zoomRef.current = clamped;
    setZoomPct(Math.round(clamped * 100));
    Animated.timing(scale, { toValue: clamped, duration: animate ? 150 : 0, useNativeDriver: true }).start();
    if (clamped === MIN_ZOOM) {
      panOrigin.current = { x: 0, y: 0 };
      Animated.timing(translate, { toValue: { x: 0, y: 0 }, duration: animate ? 150 : 0, useNativeDriver: true }).start();
    }
  };

  const reset = () => {
    zoomRef.current = 1;
    setZoomPct(100);
    scale.setValue(1);
    translate.setValue({ x: 0, y: 0 });
    panOrigin.current = { x: 0, y: 0 };
  };

  const toggleDoubleTapZoom = () => {
    setZoom(zoomRef.current > MIN_ZOOM ? MIN_ZOOM : 2);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 2) {
          pinchOrigin.current = { dist: distance(e.nativeEvent.touches), zoom: zoomRef.current };
        }
      },
      onPanResponderMove: (e, gestureState) => {
        if (e.nativeEvent.touches.length === 2) {
          const d = distance(e.nativeEvent.touches);
          if (pinchOrigin.current.dist > 0) {
            const next = pinchOrigin.current.zoom * (d / pinchOrigin.current.dist);
            setZoom(next, false);
          }
          return;
        }
        if (zoomRef.current > MIN_ZOOM) {
          translate.setValue({
            x: panOrigin.current.x + gestureState.dx,
            y: panOrigin.current.y + gestureState.dy,
          });
        }
      },
      onPanResponderRelease: (_e, gestureState) => {
        if (zoomRef.current > MIN_ZOOM) {
          panOrigin.current = {
            x: panOrigin.current.x + gestureState.dx,
            y: panOrigin.current.y + gestureState.dy,
          };
        }
        const now = Date.now();
        const isTap = Math.abs(gestureState.dx) < 4 && Math.abs(gestureState.dy) < 4;
        if (isTap) {
          if (now - lastTap.current < DOUBLE_TAP_MS) {
            toggleDoubleTapZoom();
            lastTap.current = 0;
          } else {
            lastTap.current = now;
          }
        }
      },
    }),
  ).current;

  if (!src) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: 'rgba(6,10,8,0.94)' }}>
        <View className="flex-row items-center justify-between px-4 pt-14 pb-2">
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
            onPress={() => { reset(); onClose(); }}
            accessibilityLabel="Close"
            className="size-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
          >
            <X size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={{ flex: 1, overflow: 'hidden' }} {...panResponder.panHandlers}>
          <Animated.View
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
              style={{ width: SCREEN_W, height: SCREEN_H * 0.75 }}
              accessibilityLabel={alt}
            />
          </Animated.View>
        </View>

        <Text className="pb-8 text-center text-xs text-white/50">Pinch or double-tap to zoom · drag to pan</Text>
      </View>
    </Modal>
  );
}
