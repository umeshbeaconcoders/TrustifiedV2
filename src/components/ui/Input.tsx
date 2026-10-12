import React, { forwardRef, useState } from 'react';
import { TextInput, View, Pressable, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
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

export const PasswordInput = forwardRef<TextInput, InputProps>(function PasswordInput(
  { invalid, className = '', style, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <View className="relative justify-center">
      <TextInput
        ref={ref}
        placeholderTextColor={colors.ink[400]}
        secureTextEntry={!show}
        className={`h-12 rounded-xl border bg-white pl-4 pr-12 text-base text-ink-900 ${
          invalid ? 'border-fail' : 'border-ink-200'
        } ${className}`}
        style={style}
        {...rest}
      />
      <Pressable
        onPress={() => setShow((s) => !s)}
        className="absolute right-3 p-1.5"
        accessibilityRole="button"
        accessibilityLabel={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} color={colors.ink[400]} /> : <Eye size={18} color={colors.ink[400]} />}
      </Pressable>
    </View>
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
