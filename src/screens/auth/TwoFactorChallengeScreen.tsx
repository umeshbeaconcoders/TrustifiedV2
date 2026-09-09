import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, useTwoFactorVerify } from '../../api';
import { Button, Input } from '../../components/ui';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';

/** Handles the `requires_2fa` login response (Task 2.2) — 6-digit authenticator code + the challenge_token from /auth/login. */
type Props = NativeStackScreenProps<RootStackParamList, 'TwoFactorChallenge'>;

export function TwoFactorChallengeScreen({ route, navigation }: Props) {
  const { challengeToken } = route.params;
  const twoFactorVerify = useTwoFactorVerify();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  function verify() {
    if (code.length !== 6) return;
    setError(undefined);
    twoFactorVerify.mutate(
      { challenge_token: challengeToken, code },
      {
        onSuccess: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }),
        onError: (err) => setError(err instanceof ApiError ? (err.firstError() ?? err.message) : 'Invalid code'),
      },
    );
  }

  return (
    <KeyboardAvoidingScreen contentContainerClassName="px-6 py-10">
      <FadeIn>
        <Text className="text-center text-2xl font-bold text-ink-900 dark:text-white">Two-factor verification</Text>
        <Text className="mt-2 text-center text-sm text-ink-600 dark:text-ink-300">
          Enter the 6-digit code from your authenticator app.
        </Text>
        <View className="mt-6 gap-4">
          <Input
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
            placeholder="000000"
            className="text-center text-lg tracking-[8px]"
            accessibilityLabel="Two-factor code"
          />
          {error ? <Text className="text-center text-xs font-medium text-fail-strong">{error}</Text> : null}
          <Button onPress={verify} loading={twoFactorVerify.isPending} accessibilityLabel="Verify">
            Verify
          </Button>
        </View>
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
