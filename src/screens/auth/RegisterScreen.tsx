import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, useOtpRequest, useOtpVerifyRegistration, useRegister } from '../../api';
import { Button, Field, Input } from '../../components/ui';
import { ControlledInput } from '../../components/form/ControlledInput';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';
import { toast } from '../../stores/toast';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '../../theme/tokens';

/**
 * Mirrors `RegisterRequest` validation (backend/app/Http/Requests/Auth/RegisterRequest.php)
 * and web's register page — phone is mandatory and must pass
 * `POST /auth/otp/verify-registration` before `/auth/register` will accept it.
 */
const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your name').max(255),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Enter a valid mobile number').max(20),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string().min(8, 'At least 8 characters'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });
type RegisterForm = z.infer<typeof registerSchema>;

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const otpRequest = useOtpRequest();
  const otpVerifyRegistration = useOtpVerifyRegistration();
  const register = useRegister();
  const [details, setDetails] = useState<RegisterForm | null>(null);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmitDetails = handleSubmit((values) => {
    otpRequest.mutate(
      { phone: values.phone },
      {
        onSuccess: () => {
          setDetails(values);
          toast.success(`OTP sent to ${values.phone}`);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            const message =
              err.status === 429
                ? 'Too many attempts — please wait a minute and try again.'
                : (err.firstError() ?? err.message);
            setError('phone', { message });
          }
        },
      },
    );
  });

  function onVerifyAndCreate() {
    if (!details || code.length !== 6) return;
    setVerifyError(undefined);
    otpVerifyRegistration.mutate(
      { phone: details.phone, otp: code },
      {
        onSuccess: () => {
          register.mutate(details, {
            onSuccess: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }),
            onError: (err) => {
              toast.error(
                err instanceof ApiError ? (err.firstError() ?? err.message) : 'Could not create your account. Please try again.',
              );
              setDetails(null);
            },
          });
        },
        onError: (err) => setVerifyError(err instanceof ApiError ? (err.firstError() ?? err.message) : 'Invalid OTP'),
      },
    );
  }

  return (
    <KeyboardAvoidingScreen contentContainerClassName="px-6 py-10">
      <FadeIn>
        <Text className="text-center text-2xl font-bold text-ink-900 dark:text-white">Create your account</Text>

        {details ? (
          <View className="mt-6 gap-4">
            <Text className="text-center text-sm text-ink-600 dark:text-ink-300">Enter the 6-digit code sent to {details.phone}.</Text>
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
            <Button
              onPress={onVerifyAndCreate}
              loading={otpVerifyRegistration.isPending || register.isPending}
              accessibilityLabel="Verify and create account"
            >
              Verify & create account
            </Button>
            <Pressable
              onPress={() => { setDetails(null); setCode(''); }}
              className="items-center py-2"
              accessibilityRole="button"
            >
              <Text className="text-xs text-ink-500 dark:text-ink-400 underline">Edit details / use a different number</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-6 gap-4">
            <Field label="Name" required error={errors.name?.message}>
              <ControlledInput control={control} name="name" autoComplete="name" accessibilityLabel="Name" />
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
            <Field label="Mobile number" required hint="We'll text you a one-time code to verify it." error={errors.phone?.message}>
              <ControlledInput
                control={control}
                name="phone"
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                accessibilityLabel="Mobile number"
              />
            </Field>
            <Field label="Password" required error={errors.password?.message}>
              <View className="relative justify-center">
                <ControlledInput
                  control={control}
                  name="password"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  accessibilityLabel="Password"
                  className="pr-12"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1"
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} color={colors.ink[400]} /> : <Eye size={20} color={colors.ink[400]} />}
                </Pressable>
              </View>
            </Field>
            <Field label="Confirm password" required error={errors.password_confirmation?.message}>
              <View className="relative justify-center">
                <ControlledInput
                  control={control}
                  name="password_confirmation"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  accessibilityLabel="Confirm password"
                  className="pr-12"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1"
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} color={colors.ink[400]} /> : <Eye size={20} color={colors.ink[400]} />}
                </Pressable>
              </View>
            </Field>

            <Button onPress={onSubmitDetails} loading={otpRequest.isPending} accessibilityLabel="Send verification code">
              Send verification code
            </Button>
          </View>
        )}

        <Text className="mt-6 text-center text-xs text-ink-500 dark:text-ink-400">
          By creating an account, you agree to our{' '}
          <Text className="font-semibold text-brand-700" onPress={() => navigation.navigate('Policy', { slug: 'terms', title: 'Terms of Service' })}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text className="font-semibold text-brand-700" onPress={() => navigation.navigate('Policy', { slug: 'privacy', title: 'Privacy Policy' })}>
            Privacy Policy
          </Text>
          .
        </Text>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-sm text-ink-500 dark:text-ink-400">Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="button">
            <Text className="text-sm font-semibold text-brand-700">Log in</Text>
          </Pressable>
        </View>
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
