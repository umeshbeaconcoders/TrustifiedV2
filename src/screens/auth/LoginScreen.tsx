import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, isRequires2fa, isRequires2faSetup, useLogin } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput } from '../../components/form/ControlledInput';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';
import { toast } from '../../stores/toast';

const passwordSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type PasswordForm = z.infer<typeof passwordSchema>;

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const redirectTo = route.params?.redirectTo ?? 'Tabs';
  const [activeTab, setActiveTab] = useState<'email' | 'otp'>('email');
  const login = useLogin();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(
      { ...values, device_name: 'Trustified Mobile' },
      {
        onSuccess: (res) => {
          if (isRequires2fa(res.data)) {
            navigation.navigate('TwoFactorChallenge', { challengeToken: res.data.challenge_token });
          } else if (isRequires2faSetup(res.data)) {
            setError('password', {
              message: res.data.message ?? 'This account requires 2FA setup — please contact support.',
            });
          } else {
            navigation.reset({ index: 0, routes: [{ name: redirectTo as 'Tabs' }] });
          }
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setError('password', { message: err.firstError() ?? err.message });
          } else {
            toast.error('Could not sign in. Please check your connection and try again.');
          }
        },
      },
    );
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-surface-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <FadeIn>

          {/* Trustified® wordmark */}
          <View className="items-center mb-8">
            <View className="flex-row items-start">
              <Text
                className="font-display font-extrabold text-ink-900 dark:text-white"
                style={{ fontSize: 32, letterSpacing: -0.5 }}
              >
                Trustified
              </Text>
              <Text
                className="text-ink-400 dark:text-ink-500 font-semibold"
                style={{ fontSize: 14, marginTop: 4 }}
              >
                ®
              </Text>
            </View>
          </View>

          {/* Welcome back heading — same as web */}
          <Text className="text-2xl font-display font-extrabold text-ink-900 dark:text-white text-center">
            Welcome back
          </Text>
          <Text className="mt-2 text-sm text-ink-500 dark:text-ink-400 text-center leading-relaxed">
            Log in to review products and manage your profile.
          </Text>

          {/* Tab switcher — "Email & password" | "Mobile OTP" — pill style like web */}
          <View className="flex-row bg-ink-100 dark:bg-surface-2 rounded-xl p-1 mt-8 mb-5">
            <Pressable
              onPress={() => setActiveTab('email')}
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'email' ? 'bg-white dark:bg-surface-3 shadow-sm' : ''}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'email' }}
            >
              <Text className={`text-sm font-semibold ${activeTab === 'email' ? 'text-ink-900 dark:text-white' : 'text-ink-500 dark:text-ink-400'}`}>
                Email & password
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('otp')}
              className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'otp' ? 'bg-white dark:bg-surface-3 shadow-sm' : ''}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'otp' }}
            >
              <Text className={`text-sm font-semibold ${activeTab === 'otp' ? 'text-ink-900 dark:text-white' : 'text-ink-500 dark:text-ink-400'}`}>
                Mobile OTP
              </Text>
            </Pressable>
          </View>

          {/* Email/password form */}
          {activeTab === 'email' && (
            <View className="gap-4">
              <Field label="Email" required error={errors.email?.message}>
                <ControlledInput
                  control={control}
                  name="email"
                  keyboardType="email-address"
                  autoComplete="email"
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                />
              </Field>

              <Field label="Password" required error={errors.password?.message}>
                <ControlledInput
                  control={control}
                  name="password"
                  secureTextEntry
                  autoComplete="current-password"
                  accessibilityLabel="Password"
                />
              </Field>

              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                className="self-end"
                accessibilityRole="button"
              >
                <Text className="text-xs font-semibold text-brand-600">
                  Forgot password?
                </Text>
              </Pressable>

              <Button
                onPress={onSubmit}
                loading={login.isPending}
                accessibilityLabel="Log in"
              >
                Log in
              </Button>
            </View>
          )}

          {/* OTP tab */}
          {activeTab === 'otp' && (
            <View className="gap-4">
              <Text className="text-sm text-ink-600 dark:text-ink-300 text-center leading-relaxed">
                We'll send a one-time code to your registered mobile number. No password needed.
              </Text>
              <Button
                onPress={() => navigation.navigate('OtpLogin')}
                accessibilityLabel="Continue with OTP"
              >
                Continue with OTP
              </Button>
            </View>
          )}

          {/* Register link — same as web "New here? Create an account" */}
          <View className="flex-row justify-center items-center gap-1 mt-8">
            <Text className="text-sm text-ink-500 dark:text-ink-400">New here?</Text>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-semibold text-brand-700">
                {' '}Create an account
              </Text>
            </Pressable>
          </View>

          <Text className="mt-4 text-center text-xs text-ink-500 dark:text-ink-400">
            <Text className="font-semibold text-brand-700" onPress={() => navigation.navigate('Policy', { slug: 'terms', title: 'Terms of Service' })}>
              Terms of Service
            </Text>
            {'  ·  '}
            <Text className="font-semibold text-brand-700" onPress={() => navigation.navigate('Policy', { slug: 'privacy', title: 'Privacy Policy' })}>
              Privacy Policy
            </Text>
          </Text>

        </FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
