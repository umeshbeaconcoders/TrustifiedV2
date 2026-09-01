import React, { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '../../theme/tokens';

export interface InputProps extends TextInputProps {
  invalid?: boolean;
  className?: string;
}

/** RN port of `frontend/packages/ui/src/components/input.tsx`. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { invalid, className = '', style, ...rest },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.ink[400]}
      className={`h-12 rounded-xl border bg-white px-4 text-base text-ink-900 ${
        invalid ? 'border-fail' : 'border-ink-200'
      } ${className}`}
      style={style}
      {...rest}
    />
  );
});

export const Textarea = forwardRef<TextInput, InputProps>(function Textarea(
  { invalid, className = '', style, ...rest },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      multiline
      textAlignVertical="top"
      placeholderTextColor={colors.ink[400]}
      className={`min-h-[110px] rounded-xl border bg-white px-4 py-3 text-base text-ink-900 ${
        invalid ? 'border-fail' : 'border-ink-200'
      } ${className}`}
      style={style}
      {...rest}
    />
  );
});
