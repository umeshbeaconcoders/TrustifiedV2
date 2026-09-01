/**
 * Renders the queue from `src/stores/toast.ts`. Mounted once at the root
 * (App.tsx), above the navigator, so any screen can call
 * `toast.success(...)`/`toast.error(...)` — RN counterpart of web's
 * `<Toaster position="top-center" />` (public-react/src/main.tsx).
 */
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { useToastStore, type ToastItem } from '../stores/toast';
import { colors } from '../theme/tokens';

const VARIANT_STYLE = {
  success: { bg: colors.pass.soft, fg: colors.pass.strong, border: colors.brand[200], Icon: CheckCircle2 },
  error: { bg: colors.fail.soft, fg: colors.fail.strong, border: '#fecaca', Icon: XCircle },
  info: { bg: colors.blue[50], fg: colors.blue[700], border: colors.blue[200], Icon: Info },
} as const;

const AUTO_DISMISS_MS = 3500;

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, alignItems: 'center', zIndex: 1000 }}>
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} />
      ))}
    </View>
  );
}

function ToastRow({ toast: t }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const { bg, fg, border, Icon } = VARIANT_STYLE[t.variant];

  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [t.id, dismiss]);

  return (
    <View style={{ marginBottom: 8, maxWidth: '92%' }}>
      <Pressable
        onPress={() => dismiss(t.id)}
        accessibilityRole="alert"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 14,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}>
        <Icon size={18} color={fg} />
        <Text style={{ color: fg, fontSize: 13, fontWeight: '600', flexShrink: 1 }}>{t.message}</Text>
      </Pressable>
    </View>
  );
}
