import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShieldAlert } from 'lucide-react-native';
import { api, setAuthToken } from '../../api';
import { Button, Input } from '../../components/ui';
import { colors } from '../../theme/tokens';
import { useAuthStore } from '../../stores/auth';
import { useRequireAuth } from '../../navigation/useRequireAuth';
import type { RootStackParamList } from '../../navigation/types';

/** DELETE /account (auth:sanctum) — new profile action per Section 1's "add" note. Requires typing DELETE to confirm (irreversible + 30-day purge job per AccountController::destroy). */
export function DeleteAccountScreen() {
  const { isChecking } = useRequireAuth('DeleteAccount');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clear);
  const [confirmText, setConfirmText] = useState('');

  const destroy = useMutation({
    mutationFn: () => api.delete<unknown>('/account'),
    onSuccess: async () => {
      await setAuthToken(null);
      clearAuth();
      queryClient.clear();
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    },
  });

  if (isChecking) return null;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-10">
      <View className="items-center">
        <View className="size-14 items-center justify-center rounded-2xl bg-fail-soft">
          <ShieldAlert size={28} color={colors.fail.strong} />
        </View>
        <Text className="mt-4 text-center text-xl font-bold text-ink-900">Delete your account</Text>
        <Text className="mt-2 text-center text-sm text-ink-600">
          This is permanent. Your profile and reviews will be scheduled for deletion. This cannot be undone.
        </Text>
      </View>

      <View className="mt-8 gap-3">
        <Text className="text-sm font-semibold text-ink-800">Type DELETE to confirm</Text>
        <Input value={confirmText} onChangeText={setConfirmText} autoCapitalize="characters" accessibilityLabel="Type DELETE to confirm" />
        <Button
          variant="danger"
          disabled={confirmText.trim() !== 'DELETE'}
          loading={destroy.isPending}
          onPress={() => destroy.mutate()}
          accessibilityLabel="Permanently delete my account">
          Permanently delete my account
        </Button>
      </View>
    </ScrollView>
  );
}
