import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import {
  Mail,
  Phone,
  Bell,
  FileText,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  type LucideIcon,
} from 'lucide-react-native';
import { useLogout, useRemoveDeviceToken, useSettings } from '../../api';
import { Button, Card } from '../../components/ui';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';
import { toast } from '../../stores/toast';

async function checkPushPermitted(): Promise<boolean> {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const status = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return status === RESULTS.GRANTED;
  }
  const authStatus = await messaging().hasPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

const socialIcons: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

const policyLinks: { slug: string; title: string }[] = [
  { slug: 'terms', title: 'Terms & Conditions' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'disclaimer', title: 'Disclaimer' },
];

/**
 * RN port-ish of web's footer/contact block, surfaced here as a dedicated
 * settings screen (per Section 1's "add" note) since mobile has no footer.
 * `useSettings()` supplies contact info, socials, app links.
 */
export function SettingsMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: settingsRes } = useSettings();
  const settings = settingsRes?.data;
  const logout = useLogout();
  const removeDeviceToken = useRemoveDeviceToken();

  // Mirrors actual OS notification permission on mount. RN can't revoke OS
  // permission programmatically, so turning the switch off instead removes
  // this device's token server-side (stops pushes for real); turning it on
  // when the OS has denied permission deep-links to system Settings, since
  // that's the only way to grant it back once denied.
  const [pushEnabled, setPushEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    checkPushPermitted().then((permitted) => {
      if (!cancelled) setPushEnabled(permitted);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleTogglePush(next: boolean) {
    if (!next) {
      setPushEnabled(false);
      removeDeviceToken.mutate(undefined, {
        onError: () => toast.error('Could not update notification settings. Please try again.'),
      });
      return;
    }

    checkPushPermitted().then((permitted) => {
      if (permitted) {
        setPushEnabled(true);
      } else {
        toast.info('Notifications are off at the system level — enable them in Settings.');
        void Linking.openSettings();
      }
    });
  }

  function handleLogout() {
    removeDeviceToken.mutate(undefined, { onSettled: () => logout.mutate() });
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="px-4 py-6 pb-12">
      {settings?.contact_email || settings?.contact_phone ? (
        <Card className="gap-2 p-4">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">Contact us</Text>
          {settings.contact_email ? (
            <Pressable
              onPress={() => Linking.openURL(`mailto:${settings.contact_email}`)}
              className="flex-row items-center gap-2">
              <Mail size={14} color={colors.ink[400]} />
              <Text className="text-sm text-ink-700 dark:text-ink-200">{settings.contact_email}</Text>
            </Pressable>
          ) : null}
          {settings.contact_phone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${settings.contact_phone}`)}
              className="flex-row items-center gap-2">
              <Phone size={14} color={colors.ink[400]} />
              <Text className="text-sm text-ink-700 dark:text-ink-200">{settings.contact_phone}</Text>
            </Pressable>
          ) : null}
          {settings.socials && Object.keys(settings.socials).length > 0 ? (
            <View className="mt-2 flex-row gap-3">
              {Object.entries(settings.socials).map(([key, url]) => {
                if (!url) return null;
                const Icon = socialIcons[key];
                if (!Icon) return null;
                return (
                  <Pressable
                    key={key}
                    onPress={() => Linking.openURL(url)}
                    accessibilityRole="link"
                    accessibilityLabel={key}
                    className="size-9 items-center justify-center rounded-full bg-ink-50 dark:bg-surface-2">
                    <Icon size={16} color={colors.ink[600]} />
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Card>
      ) : null}

      <SectionLabel>Notifications</SectionLabel>
      <Card className="p-1">
        <View className="flex-row items-center gap-3 px-3 py-3">
          <Bell size={18} color={colors.ink[500]} />
          <Text className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100">Manage push notifications</Text>
          <Switch
            value={pushEnabled}
            onValueChange={handleTogglePush}
            trackColor={{ true: colors.brand[500], false: colors.ink[200] }}
            accessibilityLabel="Toggle push notifications"
          />
        </View>
      </Card>

      <SectionLabel>Legal & policies</SectionLabel>
      <Card className="p-1">
        {policyLinks.map((policy, i) => (
          <MenuRow
            key={policy.slug}
            icon={<FileText size={18} color={colors.ink[500]} />}
            label={policy.title}
            last={i === policyLinks.length - 1}
            onPress={() => navigation.navigate('Policy', { slug: policy.slug, title: policy.title })}
          />
        ))}
      </Card>

      <SectionLabel>Your data</SectionLabel>
      <Card className="p-1">
        <MenuRow
          icon={<Download size={18} color={colors.ink[500]} />}
          label="Export my data"
          onPress={() => navigation.navigate('ExportData')}
        />
        <MenuRow
          icon={<Trash2 size={18} color={colors.fail.DEFAULT} />}
          label="Delete account"
          danger
          last
          onPress={() => navigation.navigate('DeleteAccount')}
        />
      </Card>

      <Button
        variant="outline"
        className="mt-6"
        loading={logout.isPending || removeDeviceToken.isPending}
        onPress={handleLogout}
        accessibilityLabel="Log out">
        <LogOut size={16} color={colors.ink[800]} />
        <Text className="ml-1 font-semibold text-ink-800 dark:text-ink-100">Log out</Text>
      </Button>

      {settings?.app_version?.ios || settings?.app_version?.android ? (
        <Text className="mt-6 text-center text-xs text-ink-400 dark:text-ink-500">
          Trustified {settings.app_version.ios ?? settings.app_version.android}
        </Text>
      ) : null}
    </ScrollView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text className="mb-2 mt-6 px-1 text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">{children}</Text>;
}

function MenuRow({
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
      className={`flex-row items-center gap-3 px-3 py-3 active:bg-ink-50 ${last ? '' : 'border-b border-ink-100'}`}>
      {icon}
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-fail' : 'text-ink-800'}`}>{label}</Text>
      <ChevronRight size={16} color={colors.ink[300]} />
    </Pressable>
  );
}
