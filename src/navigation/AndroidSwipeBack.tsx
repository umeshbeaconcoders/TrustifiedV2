/**
 * AndroidSwipeBack
 *
 * Android pe native-stack ka gestureEnabled iOS-only hai.
 * Yeh component left-edge se right-swipe detect karta hai
 * aur navigationRef.goBack() call karta hai.
 *
 * iOS pe yeh nothing karta — native swipe already handle karta hai.
 */
import React, { useRef } from 'react';
import { Platform, PanResponder, View } from 'react-native';
import { navigationRef } from './navigationRef';

/** Left edge zone (px) se swipe start hona chahiye */
const EDGE_ZONE = 35;
/** Minimum horizontal distance to trigger goBack */
const MIN_DISTANCE = 70;
/** Minimum horizontal velocity to trigger goBack */
const MIN_VELOCITY = 0.4;

export function AndroidSwipeBack({ children }: { children: React.ReactNode }) {
  // iOS: native gesture already works — render children as-is
  if (Platform.OS !== 'android') {
    return <>{children}</>;
  }

  const startX = useRef(0);
  const tracking = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture if touch started in the left edge zone
      onStartShouldSetPanResponder: (evt) => {
        startX.current = evt.nativeEvent.pageX;
        return startX.current <= EDGE_ZONE;
      },
      // Don't steal from child responders on start (let ScrollViews etc. work)
      onStartShouldSetPanResponderCapture: () => false,

      // Claim on move only if: started in edge zone + moving rightward > downward
      onMoveShouldSetPanResponder: (_evt, gs) => {
        return (
          startX.current <= EDGE_ZONE &&
          gs.dx > 8 &&
          Math.abs(gs.dx) > Math.abs(gs.dy)
        );
      },
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderGrant: () => {
        tracking.current = true;
      },

      onPanResponderRelease: (_evt, gs) => {
        if (
          tracking.current &&
          gs.dx >= MIN_DISTANCE &&
          gs.vx >= MIN_VELOCITY &&
          navigationRef.isReady() &&
          navigationRef.canGoBack()
        ) {
          navigationRef.goBack();
        }
        tracking.current = false;
      },

      onPanResponderTerminate: () => {
        tracking.current = false;
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
