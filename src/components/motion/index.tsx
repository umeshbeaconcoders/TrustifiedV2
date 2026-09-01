import React from 'react';
import { View } from 'react-native';

/**
 * Motion primitives — MotiView temporarily replaced with plain View
 * because moti@0.29 crashes with "useContext of null" on this RN version.
 * Animations will be restored once moti is upgraded to a compatible version.
 */

export function FadeIn({
  children,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return <View className={className}>{children}</View>;
}

/** Scroll-triggered reveal — approximated as mount-triggered fade. */
export function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <FadeIn delay={delay} className={className}>
      {children}
    </FadeIn>
  );
}

export function StaggerChildren({
  children,
  className = '',
  staggerMs = 60,
}: {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}) {
  const items = React.Children.toArray(children);
  return (
    <View className={className}>
      {items.map((child, i) => (
        <StaggerItem key={i} index={i} staggerMs={staggerMs}>
          {child}
        </StaggerItem>
      ))}
    </View>
  );
}

export function StaggerItem({
  children,
  index = 0,
  staggerMs = 60,
  className = '',
}: {
  children: React.ReactNode;
  index?: number;
  staggerMs?: number;
  className?: string;
}) {
  if (className) {
    return <View className={className}>{children}</View>;
  }
  return <>{children}</>;
}

