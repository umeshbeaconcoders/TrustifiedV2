import React, { useEffect, useRef } from 'react';
import { View, InteractionManager } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export function InfiniteMarquee({
  children,
  itemWidth,
  gap = 16,
  speed = 0.5,
}: {
  children: React.ReactNode[];
  itemWidth: number;
  gap?: number;
  speed?: number;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const pausedUntil = useRef(0);
  const totalItemWidth = itemWidth + gap;
  const count = children.length;
  const resetLimit = totalItemWidth * count;

  useEffect(() => {
    if (count === 0) return;

    let frameId: number;
    let isActive = true;

    const tick = () => {
      if (!isActive) return;
      if (Date.now() >= pausedUntil.current) {
        offset.current += speed;
        if (offset.current >= resetLimit) {
          offset.current = 0;
        }
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: offset.current, animated: false });
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    const task = InteractionManager.runAfterInteractions(() => {
      frameId = requestAnimationFrame(tick);
    });

    return () => {
      isActive = false;
      task.cancel();
      cancelAnimationFrame(frameId);
    };
  }, [count, resetLimit, speed]);

  if (count === 0) return null;

  // Duplicate children to ensure seamless looping
  const duplicatedChildren = [...children, ...children, ...children];

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      nestedScrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      decelerationRate="fast"
      onTouchStart={() => { pausedUntil.current = Date.now() + 2500; }}
      onScrollBeginDrag={() => { pausedUntil.current = Date.now() + 6000; }}
      onScrollEndDrag={(e) => {
        pausedUntil.current = Date.now() + 2500;
        if (resetLimit > 0) {
          offset.current = ((e.nativeEvent.contentOffset.x % resetLimit) + resetLimit) % resetLimit;
        }
      }}
      onMomentumScrollEnd={(e) => {
        if (resetLimit > 0) {
          offset.current = ((e.nativeEvent.contentOffset.x % resetLimit) + resetLimit) % resetLimit;
        }
      }}
      contentContainerStyle={{ gap }}
    >
      {duplicatedChildren.map((child, idx) => (
        <View key={idx} style={{ width: itemWidth }}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}
