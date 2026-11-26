import React, { useMemo, useRef } from 'react';
import { View, type AccessibilityRole, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export interface TapTargetProps {
  onPress: () => void;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: { disabled?: boolean; selected?: boolean; checked?: boolean; busy?: boolean; expanded?: boolean };
  className?: string;
  style?: ViewStyle;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
  children: React.ReactNode;
}

/**
 * Scroll-safe tap wrapper powered by RNGH Gesture.Tap.
 * Unlike RN TouchableOpacity/Pressable, it never holds a JS responder lock, so horizontal
 * and vertical ScrollViews drag smoothly from anywhere on the element while single taps fire cleanly.
 */
export function TapTarget({
  onPress,
  disabled = false,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
  className,
  style,
  hitSlop,
  children,
}: TapTargetProps) {
  const latestPressRef = useRef(onPress);
  latestPressRef.current = onPress;

  const hitTop = hitSlop?.top;
  const hitBottom = hitSlop?.bottom;
  const hitLeft = hitSlop?.left;
  const hitRight = hitSlop?.right;

  const tap = useMemo(() => {
    const gesture = Gesture.Tap()
      .enabled(!disabled)
      .maxDistance(8)
      .maxDuration(350)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          latestPressRef.current();
        }
      });
    if (hitTop !== undefined || hitBottom !== undefined || hitLeft !== undefined || hitRight !== undefined) {
      gesture.hitSlop({ top: hitTop, bottom: hitBottom, left: hitLeft, right: hitRight });
    }
    return gesture;
  }, [disabled, hitTop, hitBottom, hitLeft, hitRight]);

  return (
    <GestureDetector gesture={tap}>
      <View
        collapsable={false}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        style={style}
        className={className}>
        {children}
      </View>
    </GestureDetector>
  );
}
