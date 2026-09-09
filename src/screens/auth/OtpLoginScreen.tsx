import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, useOtpRequest, useOtpVerify } from '../../api';
import { Button, Field, Input } from '../../components/ui';
import { ControlledInput } from '../../components/form/ControlledInput';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';

/** RN split of web login.tsx's Mobile OTP tab (Task 2.2). Two steps: request OTP, then verify 6-digit code. */
const otpRequestSchema = z.object({
  phone: z.string().min(10, 'Enter a valid mobile number').max(20),
});
type OtpRequestForm = z.infer<typeof otpRequestSchema>;

type Props = NativeStackScreenProps<RootStackParamList, 'OtpLogin'>;

export function OtpLoginScreen({ navigation }: Props) {
  const otpRequest = useOtpRequest();
  const otpVerify = useOtpVerify();
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OtpRequestForm>({ resolver: zodResolver(otpRequestSchema) });

  const onRequestOtp = handleSubmit((values) => {
    otpRequest.mutate(values, {
      onSuccess: () => setPhone(values.phone),
      onError: (err) => {
        if (err instanceof ApiError) {
          // Surface throttling (429, 10/min server-side) clearly, per Task 2.2.
          const message =
            err.status === 429
              ? "Too many attempts — please wait a minute and try again."
              : (err.firstError() ?? err.message);
          setError('phone', { message });
        }
      },
    });
  });

  function onVerifyOtp() {
    if (!phone || code.length !== 6) return;
    setVerifyError(undefined);
    otpVerify.mutate(
      { phone, otp: code },
      {
        onSuccess: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }),
        onError: (err) => setVerifyError(err instanceof ApiError ? (err.firstError() ?? err.message) : 'Invalid OTP'),
      },
    );
  }

  return (
    <KeyboardAvoidingScreen contentContainerClassName="px-6 py-10">
      <FadeIn>
        <Text className="text-center text-2xl font-bold text-ink-900 dark:text-white">Log in with mobile OTP</Text>

        {!phone ? (
          <View className="mt-6 gap-4">
            <Field label="Mobile number" required error={errors.phone?.message}>
              <ControlledInput
                control={control}
                name="phone"
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                accessibilityLabel="Mobile number"
              />
            </Field>
            <Button onPress={onRequestOtp} loading={otpRequest.isPending} accessibilityLabel="Send OTP">
              Send OTP
            </Button>
          </View>
        ) : (
          <View className="mt-6 gap-4">
            <Text className="text-center text-sm text-ink-600 dark:text-ink-300">Enter the 6-digit code sent to {phone}.</Text>
            <Input
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-lg tracking-[8px]"
              accessibilityLabel="One-time code"
            />
            {verifyError ? <Text className="text-center text-xs font-medium text-fail-strong">{verifyError}</Text> : null}
            <Button onPress={onVerifyOtp} loading={otpVerify.isPending} accessibilityLabel="Verify and continue">
              Verify & continue
            </Button>
            <Pressable onPress={() => setPhone(null)} className="items-center py-2" accessibilityRole="button">
              <Text className="text-xs text-ink-500 dark:text-ink-400 underline">Use a different number</Text>
            </Pressable>
          </View>
        )}
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
