import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForgotPassword } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput } from '../../components/form/ControlledInput';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Form = z.infer<typeof schema>;

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

/**
 * Task 2.3. Since the reset link from the email opens in a browser (matches
 * web behavior — no deep-linking required for v1 per the instructions), this
 * screen just confirms the request was sent.
 */
export function ForgotPasswordScreen({ navigation }: Props) {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    forgot.mutate(values, { onSuccess: () => setSent(true) });
  });

  if (sent) {
    return (
      <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="px-6 py-16">
        <FadeIn>
          <Text className="text-center text-2xl font-bold text-ink-900 dark:text-white">Check your email</Text>
          <Text className="mt-3 text-center text-sm text-ink-600 dark:text-ink-300">
            If that email exists, a reset link is on its way. Open it on this device to continue in your browser,
            or come back here once you have a reset token.
          </Text>
          <Button variant="outline" className="mt-8" onPress={() => navigation.navigate('ResetPassword')}>
            I have a reset token
          </Button>
        </FadeIn>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingScreen contentContainerClassName="px-6 py-16">
      <FadeIn>
        <Text className="text-center text-2xl font-bold text-ink-900 dark:text-white">Forgot password</Text>
        <Text className="mt-2 text-center text-sm text-ink-600 dark:text-ink-300">
          Enter your email and we'll send you a reset link.
        </Text>
        <View className="mt-6 gap-4">
          <Field label="Email" required error={errors.email?.message}>
            <ControlledInput
              control={control}
              name="email"
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="Email"
            />
          </Field>
          <Button onPress={onSubmit} loading={forgot.isPending} accessibilityLabel="Send reset link">
            Send reset link
          </Button>
        </View>
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
