import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Download,
  Trash2,
  Bell,
  FileText,
  CheckCircle2,
  KeyRound,
  UserCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, useLogout, useMe, useRemoveDeviceToken, useUpdateProfile, useChangePassword, useSendEmailCode, useVerifyEmailCode } from '../../api';
import { Badge, Button, Card, Field, Input, Spinner } from '../../components/ui';
import { ControlledInput, ControlledPasswordInput } from '../../components/form/ControlledInput';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { useAuthStore } from '../../stores/auth';
import { toast } from '../../stores/toast';
import type { RootStackParamList } from '../../navigation/types';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const policyLinks: { slug: string; title: string }[] = [
  { slug: 'terms', title: 'Terms & Conditions' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'disclaimer', title: 'Disclaimer' },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);
  const topPadding = topInset + 8;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const { isLoading, isRefetching, refetch } = useMe();
  const logout = useLogout();
  const removeDeviceToken = useRemoveDeviceToken();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const isVerified = Boolean(user?.email_verified_at || user?.phone_verified_at);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    if (user?.name) {
      profileForm.setValue('name', user.name);
    }
  }, [user?.name, profileForm]);

  useEffect(() => {
    if (hydrated && !user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login', params: { redirectTo: 'Tabs' } }] });
    }
  }, [hydrated, user, navigation]);

  if (!hydrated || isLoading || !user) return <Spinner className="flex-1" />;

  function handleUpdateProfile(values: ProfileFormValues) {
    updateProfile.mutate(values, {
      onSuccess: () => {
        toast.success('Profile updated successfully');
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update profile';
        toast.error(msg);
      },
    });
  }

  function handleChangePassword(values: PasswordFormValues) {
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.success('Password changed successfully');
        passwordForm.reset();
      },
      onError: (err: any) => {
        const errors = err?.response?.data?.errors;
        if (errors?.current_password?.[0]) {
          passwordForm.setError('current_password', { message: errors.current_password[0] });
        } else if (errors?.password?.[0]) {
          passwordForm.setError('password', { message: errors.password[0] });
        } else {
          const msg = err?.response?.data?.message || err?.message || 'Failed to change password';
          toast.error(msg);
        }
      },
    });
  }

  function handleLogout() {
    // Sign out locally right away (the screen resets to Login); the device token and the server-side
    // session are revoked in the background so a slow network can never leave the user "logged in".
    void removeDeviceToken
      .mutateAsync()
      .catch(() => undefined)
      .then(() => logout.mutateAsync())
      .catch(() => undefined);
    clearAuth();
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-surface-1"
      contentContainerClassName="px-6 pb-16"
      contentContainerStyle={{ paddingTop: topPadding }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} colors={[colors.brand[500]]} />}
    >
      <FadeIn>
        {/* Profile Header */}
        <View className="flex-row items-center gap-4">
          <View className="size-16 items-center justify-center rounded-full bg-brand-50">
            <UserRound size={32} color={colors.brand[700]} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap gap-2">
              <Text className="text-2xl font-bold text-ink-900 dark:text-white">{user.name}</Text>
              {isVerified ? (
                <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 border border-brand-200">
                  <CheckCircle2 size={13} color={colors.brand[700]} />
                  <Text className="text-xs font-semibold text-brand-700">Verified</Text>
                </View>
              ) : null}
            </View>

            {user.two_factor_enabled ? (
              <Badge variant="pass" className="mt-1.5 self-start">
                <ShieldCheck size={13} color={colors.brand[700]} />
                <Text className="text-xs font-semibold" style={{ color: colors.brand[700] }}>
                  {' '}2FA enabled
                </Text>
              </Badge>
            ) : null}
          </View>
        </View>

        {/* Read-Only Account Contact Info */}
        <Card className="mt-6 gap-3 p-4">
          <Text className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Account info</Text>
          <EmailRow email={user.email} verified={Boolean(user.email_verified_at)} />
          {user.phone ? (
            <View className="flex-row items-center gap-3">
              <Phone size={16} color={colors.ink[400]} />
              <Text className="flex-1 text-sm text-ink-700 dark:text-ink-200">{user.phone}</Text>
              <Badge variant={user.phone_verified_at ? 'pass' : 'warning'}>
                {user.phone_verified_at ? 'Verified' : 'Unverified'}
              </Badge>
            </View>
          ) : null}
        </Card>

        {/* Update Profile Form */}
        <Card className="mt-6 p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <UserCheck size={18} color={colors.brand[600]} />
            <Text className="text-base font-bold text-ink-900 dark:text-white">Update Profile</Text>
          </View>
          <Field label="Full Name" error={profileForm.formState.errors.name?.message} required>
            <ControlledInput
              control={profileForm.control}
              name="name"
              placeholder="Enter your name"
              accessibilityLabel="Full name"
            />
          </Field>
          <Button
            variant="primary"
            size="sm"
            className="mt-3 self-end"
            loading={updateProfile.isPending}
            onPress={profileForm.handleSubmit(handleUpdateProfile)}
            accessibilityLabel="Save profile name">
            Save Profile
          </Button>
        </Card>

        {/* Change Password — only for accounts that have a password (OTP-only / Google-only accounts have nothing to change) */}
        {user.has_password ? (
        <Card className="mt-6 p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <KeyRound size={18} color={colors.brand[600]} />
            <Text className="text-base font-bold text-ink-900 dark:text-white">Change Password</Text>
          </View>
          <View className="gap-3">
            <Field label="Current Password" error={passwordForm.formState.errors.current_password?.message} required>
              <ControlledPasswordInput
                control={passwordForm.control}
                name="current_password"
                placeholder="Enter current password"
                accessibilityLabel="Current password"
              />
            </Field>

            <Field label="New Password" error={passwordForm.formState.errors.password?.message} required>
              <ControlledPasswordInput
                control={passwordForm.control}
                name="password"
                placeholder="At least 8 characters"
                accessibilityLabel="New password"
              />
            </Field>

            <Field label="Confirm New Password" error={passwordForm.formState.errors.password_confirmation?.message} required>
              <ControlledPasswordInput
                control={passwordForm.control}
                name="password_confirmation"
                placeholder="Re-enter new password"
                accessibilityLabel="Confirm new password"
              />
            </Field>
          </View>
          <Button
            variant="primary"
            size="sm"
            className="mt-4 self-end"
            loading={changePassword.isPending}
            onPress={passwordForm.handleSubmit(handleChangePassword)}
            accessibilityLabel="Update password">
            Update Password
          </Button>
        </Card>
        ) : null}

        {/* Legal & Policies */}
        <Text className="mt-8 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Legal & Policies</Text>
        <Card className="p-1">
          {policyLinks.map((policy, i) => (
            <Pressable
              key={policy.slug}
              onPress={() => navigation.navigate('Policy', { slug: policy.slug, title: policy.title })}
              accessibilityRole="button"
              accessibilityLabel={policy.title}
              className={`flex-row items-center gap-3 px-3 py-3 active:bg-ink-50 ${i === policyLinks.length - 1 ? '' : 'border-b border-ink-100 dark:border-ink-800'}`}>
              <FileText size={18} color={colors.ink[500]} />
              <Text className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100">{policy.title}</Text>
              <ChevronRight size={16} color={colors.ink[300]} />
            </Pressable>
          ))}
        </Card>

        {/* Preferences & Account Actions */}
        <Text className="mt-6 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Preferences & Data</Text>
        <Card className="p-1">
          <ProfileLink
            icon={<Bell size={18} color={colors.ink[500]} />}
            label="Push notification settings"
            onPress={() => navigation.navigate('SettingsMenu')}
          />
          <ProfileLink
            icon={<Download size={18} color={colors.ink[500]} />}
            label="Export my data"
            onPress={() => navigation.navigate('ExportData')}
          />
          <ProfileLink
            icon={<Trash2 size={18} color={colors.fail.DEFAULT} />}
            label="Delete account"
            danger
            last
            onPress={() => navigation.navigate('DeleteAccount')}
          />
        </Card>

        {/* Red / Destructive Logout Button */}
        <Button
          variant="danger"
          size="md"
          className="mt-8"
          onPress={handleLogout}
          accessibilityLabel="Log out">
          <LogOut size={18} color="#fff" />
          <Text className="ml-1 font-semibold text-white">Log out</Text>
        </Button>
      </FadeIn>
    </ScrollView>
  );
}

/**
 * Email line with inline verification: "Verify email" mails a 6-digit code, entering it marks the email
 * verified. A phone-only account can add an email here too — it is saved once its code is confirmed.
 */
function EmailRow({ email, verified }: { email: string | null; verified: boolean }) {
  const sendCode = useSendEmailCode();
  const verifyCode = useVerifyEmailCode();
  const [step, setStep] = useState<'idle' | 'email' | 'code'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  const errorText = (err: unknown, fallback: string) => (err instanceof ApiError ? (err.firstError() ?? err.message) : fallback);

  function send(target?: string) {
    sendCode.mutate(target ? { email: target } : {}, {
      onSuccess: (res) => {
        setSentTo(res.data.email);
        setCode('');
        setStep('code');
        toast.success(`Code sent to ${res.data.email}`);
      },
      onError: (err) => toast.error(errorText(err, 'Could not send the code')),
    });
  }

  function confirm() {
    verifyCode.mutate(
      { code },
      {
        onSuccess: () => {
          toast.success('Email verified');
          setStep('idle');
          setCode('');
        },
        onError: (err) => toast.error(errorText(err, 'Incorrect code')),
      },
    );
  }

  return (
    <View>
      <View className="flex-row flex-wrap items-center gap-3">
        <Mail size={16} color={colors.ink[400]} />
        {email ? (
          <>
            <Text className="flex-shrink text-sm text-ink-700 dark:text-ink-200">{email}</Text>
            <Badge variant={verified ? 'pass' : 'warning'}>{verified ? 'Verified' : 'Unverified'}</Badge>
            {!verified && step === 'idle' ? (
              <Button size="sm" variant="outline" loading={sendCode.isPending} onPress={() => send()} accessibilityLabel="Verify email">
                Verify email
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Text className="text-sm text-ink-500 dark:text-ink-400">No email added</Text>
            {step === 'idle' ? (
              <Button size="sm" variant="outline" onPress={() => setStep('email')} accessibilityLabel="Add and verify email">
                Add & verify email
              </Button>
            ) : null}
          </>
        )}
      </View>

      {step === 'email' ? (
        <View className="mt-3 gap-2 pl-7">
          <Input
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            accessibilityLabel="Email address"
          />
          <View className="flex-row gap-2">
            <Button size="sm" loading={sendCode.isPending} onPress={() => newEmail.trim() && send(newEmail.trim())} accessibilityLabel="Send code">
              Send code
            </Button>
            <Button size="sm" variant="ghost" onPress={() => setStep('idle')}>
              Cancel
            </Button>
          </View>
        </View>
      ) : null}

      {step === 'code' ? (
        <View className="mt-3 gap-2 pl-7">
          <Text className="text-xs text-ink-500 dark:text-ink-400">Enter the 6-digit code we sent to {sentTo}. It expires in 10 minutes.</Text>
          <Input
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
            accessibilityLabel="Email verification code"
            className="w-40 text-center"
          />
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" loading={verifyCode.isPending} disabled={code.length !== 6} onPress={confirm} accessibilityLabel="Verify code">
              Verify
            </Button>
            <Button size="sm" variant="ghost" loading={sendCode.isPending} onPress={() => send(email ? undefined : (sentTo ?? undefined))}>
              Resend code
            </Button>
            <Button size="sm" variant="ghost" onPress={() => setStep('idle')}>
              Cancel
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ProfileLink({
  icon,
  label,
  onPress,
  danger,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center gap-3 px-3 py-3 active:bg-ink-50 ${last ? '' : 'border-b border-ink-100 dark:border-ink-800'}`}>
      {icon}
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-fail' : 'text-ink-800 dark:text-ink-100'}`}>{label}</Text>
      <ChevronRight size={16} color={colors.ink[300]} />
    </Pressable>
  );
}

