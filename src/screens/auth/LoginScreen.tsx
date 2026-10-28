import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, BackHandler,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, isRequires2fa, isRequires2faSetup, useLogin, useOtpRequest, useOtpVerify } from '../../api';
import { Button, Field, Input } from '../../components/ui';
import { ControlledInput, ControlledPasswordInput } from '../../components/form/ControlledInput';
import { useFocusEffect } from '@react-navigation/native';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';
import { toast } from '../../stores/toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { colors, useNavColors } from '../../theme/tokens';

const passwordSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type PasswordForm = z.infer<typeof passwordSchema>;

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const redirectTo = route.params?.redirectTo ?? 'Tabs';
  const [activeTab, setActiveTab] = useState<'email' | 'otp'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const nav = useNavColors();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          className="p-2 -ml-2 mr-2 active:bg-ink-50 dark:active:bg-ink-800 rounded-full"
          accessibilityRole="button"
          accessibilityLabel="Go to Home"
        >
          <ArrowLeft size={24} color={nav.headerTint} />
        </Pressable>
      ),
    });
  }, [navigation, nav]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Tabs', { screen: 'Home' });
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

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
                <ControlledPasswordInput
                  control={control}
                  name="password"
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
            <OtpLoginTabSection navigation={navigation} />
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

const otpRequestSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number (starting with 6-9)'),
});
type OtpRequestForm = z.infer<typeof otpRequestSchema>;

function OtpLoginTabSection({ navigation }: { navigation: any }) {
  const otpRequest = useOtpRequest();
  const otpVerify = useOtpVerify();
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const [cooldown, setCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OtpRequestForm>({ resolver: zodResolver(otpRequestSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onRequestOtp = handleSubmit((values) => {
    otpRequest.mutate(values, {
      onSuccess: () => {
        setPhone(values.phone);
        setCooldown(30);
        setResendCount(1);
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
    });
  });

  function handleResendOtp() {
    if (!phone || cooldown > 0 || resendCount >= 3) return;
    setVerifyError(undefined);
    otpRequest.mutate(
      { phone },
      {
        onSuccess: () => {
          setCooldown(30);
          setResendCount((c) => c + 1);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setVerifyError(err.firstError() ?? err.message);
          }
        },
      },
    );
  }

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
    <View>
      {!phone ? (
        <View className="gap-4">
          <Field label="Mobile number" required error={errors.phone?.message}>
            <ControlledInput
              control={control}
              name="phone"
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              accessibilityLabel="Mobile number"
            />
          </Field>
          <Button onPress={onRequestOtp} loading={otpRequest.isPending} accessibilityLabel="Send OTP">
            Send OTP
          </Button>
        </View>
      ) : (
        <View className="gap-4">
          <Text className="text-center text-sm text-ink-600 dark:text-ink-300">
            Enter the 6-digit code sent to {phone}.
          </Text>
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

          {resendCount >= 3 ? (
            <Text className="text-center text-xs text-ink-400">Maximum resend attempts (3) reached</Text>
          ) : cooldown > 0 ? (
            <Text className="text-center text-xs font-semibold text-ink-400">
              Resend OTP in {cooldown}s
            </Text>
          ) : (
            <Pressable onPress={handleResendOtp} disabled={otpRequest.isPending} className="items-center py-1" accessibilityRole="button">
              <Text className="text-xs font-semibold text-brand-600 underline">Resend OTP</Text>
            </Pressable>
          )}

          <Pressable onPress={() => { setPhone(null); setCooldown(0); setResendCount(0); }} className="items-center py-1" accessibilityRole="button">
            <Text className="text-xs text-ink-500 dark:text-ink-400 underline">Use a different number</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
