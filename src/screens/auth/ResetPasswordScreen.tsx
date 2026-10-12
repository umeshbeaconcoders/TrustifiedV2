import React from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, useResetPassword } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput, ControlledPasswordInput } from '../../components/form/ControlledInput';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';
import { toast } from '../../stores/toast';

const schema = z
  .object({
    token: z.string().min(1, 'Paste the token from your reset email'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string().min(8, 'At least 8 characters'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });
type Form = z.infer<typeof schema>;

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

/**
 * Task 2.3. `token`/`email` route params support a nice-to-have universal
 * link that pre-fills this screen (not wired natively in this pass — see
 * README's Phase 7 notes); otherwise the user pastes the token from the
 * email manually.
 */
export function ResetPasswordScreen({ route, navigation }: Props) {
  const resetPassword = useResetPassword();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { token: route.params?.token ?? '', email: route.params?.email ?? '' },
  });

  const onSubmit = handleSubmit((values) => {
    resetPassword.mutate(values, {
      onSuccess: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
      onError: (err) => {
        if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
          for (const [field, messages] of Object.entries(err.errors)) {
            const message = messages[0];
            if (message) setError(field as keyof Form, { message });
          }
        } else {
          toast.error(err instanceof ApiError ? (err.firstError() ?? err.message) : 'Could not reset password. The link may have expired.');
        }
      },
    });
  });

  return (
    <KeyboardAvoidingScreen contentContainerClassName="px-6 py-16">
      <FadeIn>
        <Text className="text-center text-2xl font-bold text-ink-900 dark:text-white">Reset password</Text>
        <View className="mt-6 gap-4">
          <Field label="Reset token" required error={errors.token?.message} hint="From the link in your email">
            <ControlledInput control={control} name="token" accessibilityLabel="Reset token" />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <ControlledInput
              control={control}
              name="email"
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="Email"
            />
          </Field>
          <Field label="New password" required error={errors.password?.message}>
            <ControlledPasswordInput
              control={control}
              name="password"
              autoComplete="new-password"
              accessibilityLabel="New password"
            />
          </Field>
          <Field label="Confirm new password" required error={errors.password_confirmation?.message}>
            <ControlledPasswordInput
              control={control}
              name="password_confirmation"
              autoComplete="new-password"
              accessibilityLabel="Confirm new password"
            />
          </Field>
          <Button onPress={onSubmit} loading={resetPassword.isPending} accessibilityLabel="Reset password">
            Reset password
          </Button>
        </View>
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
