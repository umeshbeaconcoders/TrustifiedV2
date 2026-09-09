import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from 'react-native';

/**
 * Standard form-screen shell: `KeyboardAvoidingView` wrapping a `ScrollView`,
 * so the keyboard never overlaps the field the user is typing into. iOS has
 * no native keyboard-resize behavior so it needs the explicit `padding`
 * behavior; Android already handles this via
 * `android:windowSoftInputMode="adjustResize"` (AndroidManifest.xml), so it
 * gets `undefined` there to avoid double-adjusting the layout.
 */
export function KeyboardAvoidingScreen({
  children,
  className = 'flex-1 bg-white',
  contentContainerClassName,
  ...rest
}: ScrollViewProps & { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className={className}
        contentContainerClassName={contentContainerClassName}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
