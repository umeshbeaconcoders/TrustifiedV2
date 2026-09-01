import React, { useEffect, useRef } from 'react';
import { ScrollView, View, InteractionManager } from 'react-native';

export function InfiniteMarquee({ 
  children, 
  itemWidth, 
  gap = 16, 
  speed = 0.5 
}: { 
  children: React.ReactNode[]; 
  itemWidth: number; 
  gap?: number; 
  speed?: number; 
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const totalItemWidth = itemWidth + gap;
  const count = children.length;
  const resetLimit = totalItemWidth * count;

  useEffect(() => {
    if (count === 0) return;

    let frameId: number;
    let isActive = true;

    const tick = () => {
      if (!isActive) return;
      offset.current += speed;
      if (offset.current >= resetLimit) {
        offset.current = 0;
      }
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: offset.current, animated: false });
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
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      decelerationRate="fast"
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
