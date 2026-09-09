import React from 'react';
import { View, Text } from 'react-native';
import { badgeVariants, type BadgeVariant } from '../../theme/tokens';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/** RN port of `frontend/packages/ui/src/components/badge.tsx` — variants: pass/fail/gold/info/warning/neutral. */
export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const tone = badgeVariants[variant];
  return (
    <View
      className={`flex-row items-center gap-1 self-start rounded-full border px-2.5 py-1 ${className}`}
      style={{ backgroundColor: tone.bg, borderColor: tone.border }}>
      {typeof children === 'string' ? (
        <Text className="text-xs font-semibold" style={{ color: tone.fg }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

/** Maps product/report `status` (+ is_gold) to the correct Badge variant, matching web's <StatusBadge>. */
export function StatusBadge({
  status,
  isGold = false,
  size = 'md',
}: {
  status: string;
  isGold?: boolean;
  size?: 'sm' | 'md';
}) {
  const normalized = status.toLowerCase();
  const label =
    isGold && normalized === 'pass'
      ? 'GOLD CERTIFIED'
      : normalized === 'certified'
        ? 'CERTIFIED'
        : normalized === 'untested' || !normalized
          ? 'NOT CERTIFIED'
          : status.toUpperCase();
  const variant: BadgeVariant =
    isGold && normalized === 'pass'
      ? 'gold'
      : normalized === 'pass' || normalized === 'certified'
        ? 'pass'
        : normalized === 'fail'
          ? 'fail'
          : 'neutral';
  return (
    <Badge variant={variant} className={size === 'sm' ? 'px-2 py-0.5' : ''}>
      <Text className={`font-bold tracking-wide ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`} style={{ color: badgeVariants[variant].fg }}>
        {label}
      </Text>
    </Badge>
  );
}
