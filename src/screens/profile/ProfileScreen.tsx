import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogOut, Mail, Phone, ShieldCheck, UserRound, Download, Trash2, Bell, FileText, Trophy, ScanSearch, Swords, Info, TestTube2, ListChecks } from 'lucide-react-native';
import { useLogout, useMe, useRemoveDeviceToken } from '../../api';
import { Badge, Button, Spinner } from '../../components/ui';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { useAuthStore } from '../../stores/auth';
import type { RootStackParamList } from '../../navigation/types';

/** RN port of `frontend/apps/web/src/pages/profile.tsx`, extended per Section 1's "add" note: push toggle, data export, delete account. */
export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const { isLoading } = useMe();
  const logout = useLogout();
  const removeDeviceToken = useRemoveDeviceToken();

  React.useEffect(() => {
    if (hydrated && !user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login', params: { redirectTo: 'Tabs' } }] });
    }
  }, [hydrated, user, navigation]);

  if (!hydrated || isLoading || !user) return <Spinner className="flex-1" />;

  function handleLogout() {
    // Revoke this device's push registration before clearing the session so
    // a shared/sold device doesn't keep receiving another user's pushes
    // (Task 2.4 / Task 5.1).
    removeDeviceToken.mutate(undefined, {
      onSettled: () =>
        logout.mutate(undefined, {
          onSettled: () => {
            // useLogout clears keychain + React Query cache but does NOT update
            // the Zustand auth store. Calling clearAuth() here sets user → null
            // so the useEffect redirect to Login fires immediately.
            clearAuth();
          },
        }),
    });
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-10">
      <FadeIn>
        <View className="flex-row items-center gap-4">
          <View className="size-16 items-center justify-center rounded-full bg-brand-50">
            <UserRound size={32} color={colors.brand[700]} />
          </View>
          <View>
            <Text className="text-2xl font-bold text-ink-900">{user.name}</Text>
            {user.two_factor_enabled ? (
              <Badge variant="pass" className="mt-1">
                <ShieldCheck size={14} color={colors.brand[700]} />
                <Text className="text-xs font-semibold" style={{ color: colors.brand[700] }}>
                  {' '}2FA enabled
                </Text>
              </Badge>
            ) : null}
          </View>
        </View>

        <View className="mt-7 gap-3 border-t border-ink-100 pt-6">
          {user.email ? (
            <View className="flex-row items-center gap-3">
              <Mail size={16} color={colors.ink[400]} />
              <Text className="flex-1 text-sm text-ink-700">{user.email}</Text>
              <Badge variant={user.email_verified_at ? 'pass' : 'warning'}>
                {user.email_verified_at ? 'Verified' : 'Unverified'}
              </Badge>
            </View>
          ) : null}
          {user.phone ? (
            <View className="flex-row items-center gap-3">
              <Phone size={16} color={colors.ink[400]} />
              <Text className="flex-1 text-sm text-ink-700">{user.phone}</Text>
              <Badge variant={user.phone_verified_at ? 'pass' : 'warning'}>
                {user.phone_verified_at ? 'Verified' : 'Unverified'}
              </Badge>
            </View>
          ) : null}
        </View>

        {/* Commented out Explore Section (uncomment if needed in the future)
        <View className="mt-8 border-t border-ink-100 pt-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3 px-1">Explore</Text>
          <View className="gap-1">
            <ProfileLink
              icon={<ShieldCheck size={18} color={colors.brand[600]} />}
              label="Certified Brands"
              onPress={() => navigation.navigate('CertifiedBrands')}
            />
            <ProfileLink
              icon={<Trophy size={18} color={colors.gold.strong} />}
              label="Rankings"
              onPress={() => navigation.navigate('RankingsIndex')}
            />
            <ProfileLink
              icon={<ScanSearch size={18} color={colors.blue[600]} />}
              label="Verify Certificate"
              onPress={() => navigation.navigate('Verify')}
            />
            <ProfileLink
              icon={<Swords size={18} color={colors.fail.strong} />}
              label="Challenge a Result"
              onPress={() => navigation.navigate('Challenge')}
            />
            <ProfileLink
              icon={<Info size={18} color={colors.ink[600]} />}
              label="About Us"
              onPress={() => navigation.navigate('About')}
            />
            <ProfileLink
              icon={<TestTube2 size={18} color={colors.ink[600]} />}
              label="Our Testing Process"
              onPress={() => navigation.navigate('Testing')}
            />
            <ProfileLink
              icon={<ListChecks size={18} color={colors.ink[600]} />}
              label="What Gets Certified"
              onPress={() => navigation.navigate('WhatGetsCertified')}
            />
          </View>
        </View>
        */}

        <View className="mt-8 gap-1 border-t border-ink-100 pt-6">
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
            icon={<FileText size={18} color={colors.ink[500]} />}
            label="Legal & policies"
            onPress={() => navigation.navigate('SettingsMenu')}
          />
          <ProfileLink
            icon={<Trash2 size={18} color={colors.fail.DEFAULT} />}
            label="Delete account"
            danger
            onPress={() => navigation.navigate('DeleteAccount')}
          />
        </View>

        <Button
          variant="outline"
          className="mt-8"
          loading={logout.isPending || removeDeviceToken.isPending}
          onPress={handleLogout}
          accessibilityLabel="Log out">
          <LogOut size={16} color={colors.ink[800]} />
          <Text className="ml-1 font-semibold text-ink-800">Log out</Text>
        </Button>
      </FadeIn>
    </ScrollView>
  );
}

function ProfileLink({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-3 rounded-xl px-1 py-3 active:bg-ink-50">
      {icon}
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-fail' : 'text-ink-800'}`}>{label}</Text>
    </Pressable>
  );
}
