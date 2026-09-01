import React from 'react';
import { View, Text } from 'react-native';

export interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * RN port of `frontend/packages/ui/src/components/form-field.tsx`
 * (label+error wrapper for React Hook Form). Unlike web's render-prop API
 * (`{(props) => <Input {...props} />}`, needed there for `htmlFor`/`aria-*`
 * wiring), RN has no DOM id linkage, so this just wraps children directly:
 * `<Field label="Email" error={...}><Input {...register('email')} /></Field>`.
 */
export function Field({ label, required, error, hint, children, className = '' }: FieldProps) {
  return (
    <View className={className}>
      <Text className="mb-1.5 text-sm font-semibold text-ink-800">
        {label}
        {required ? <Text className="text-fail"> *</Text> : null}
      </Text>
      {children}
      {hint && !error ? <Text className="mt-1.5 text-xs text-ink-500">{hint}</Text> : null}
      {error ? (
        <Text accessibilityRole="alert" className="mt-1.5 text-xs font-medium text-fail-strong">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
