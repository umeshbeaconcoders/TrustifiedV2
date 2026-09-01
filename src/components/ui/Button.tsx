import React from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { colors } from '../../theme/tokens';

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'gold' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 rounded-lg',
  md: 'h-11 px-5 rounded-xl',
  lg: 'h-14 px-8 rounded-2xl',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 active:bg-brand-700',
  secondary: 'bg-blue-600 active:bg-blue-700',
  gold: 'bg-gold-400 active:bg-gold-600',
  outline: 'bg-transparent border border-ink-200 active:bg-ink-50',
  ghost: 'bg-transparent active:bg-ink-50',
  danger: 'bg-fail active:bg-fail-strong',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  gold: 'text-ink-900',
  outline: 'text-ink-800',
  ghost: 'text-ink-800',
  danger: 'text-white',
};

/** RN port of `frontend/packages/ui/src/components/button.tsx`. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={typeof children === 'string' ? children : accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      style={({ pressed }) => [pressed && !isDisabled ? { opacity: 0.85 } : null]}
      {...pressableProps}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.brand[600] : '#fff'}
        />
      ) : null}
      {typeof children === 'string' ? (
        <Text className={`font-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
