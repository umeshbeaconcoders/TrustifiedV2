import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, type ListRenderItem, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const AUTO_SCROLL_MS = 3500;
/** After the user touches/scrolls, leave the rail alone for a while. */
const USER_IDLE_MS = 6000;

/**
 * Horizontal rail that gently auto-scrolls one card at a time and loops back to the start.
 * It pauses while the user touches/scrolls (resumes after a few idle seconds), while the screen
 * isn't focused, and when the OS "reduce motion" setting is on. With only a few items the row is
 * centred instead of left-aligned; with many it scrolls from the left as usual.
 */
export function ProductRail<T>({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  gap = 14,
  paddingHorizontal = 20,
}: {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  /** Fixed card width — used for the one-card scroll step. */
  itemWidth: number;
  gap?: number;
  paddingHorizontal?: number;
}) {
  const listRef = useRef<FlatList<T>>(null);
  const focused = useIsFocused();
  const offset = useRef(0);
  const pausedUntil = useRef(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const overflowing = contentWidth > layoutWidth + 4 && layoutWidth > 0;
  const step = itemWidth + gap;

  useEffect(() => {
    if (!focused || reduceMotion || !overflowing) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      const atEnd = offset.current + layoutWidth >= contentWidth - 4;
      listRef.current?.scrollToOffset({ offset: atEnd ? 0 : offset.current + step, animated: true });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [focused, reduceMotion, overflowing, layoutWidth, contentWidth, step]);

  const holdOff = useCallback(() => {
    pausedUntil.current = Date.now() + USER_IDLE_MS;
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offset.current = e.nativeEvent.contentOffset.x;
  };

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      onContentSizeChange={(w) => setContentWidth(w)}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onScrollBeginDrag={holdOff}
      onTouchStart={holdOff}
      // flexGrow + centre: a short row sits in the middle instead of hugging the left edge.
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal, gap }}
      initialNumToRender={4}
      windowSize={5}
    />
  );
}
