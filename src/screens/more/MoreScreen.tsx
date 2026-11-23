import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ShieldCheck,
  Trophy,
  ScanSearch,
  BadgeCheck,
  Swords,
  Info,
  TestTube2,
  ListChecks,
  Settings as SettingsIcon,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react-native';
import { useSettings } from '../../api';
import { Card } from '../../components/ui';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

/**
 * "More" tab — simple nav-list to every remaining top-level section that
 * doesn't warrant its own bottom-tab slot (Section 0 nav map). No direct web
 * equivalent (web uses a header nav + footer); this is a mobile-only menu.
 */
type MenuItem = {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: settingsRes, isRefetching, refetch } = useSettings();
  const settings = settingsRes?.data;

  const items: MenuItem[] = [
    {
      label: 'Certified Brands',
      description: 'Browse every certified brand',
      icon: <ShieldCheck size={20} color={colors.brand[600]} />,
      onPress: () => navigation.navigate('CertifiedBrands'),
    },
    {
      label: 'Rankings',
      description: 'Top-ranked products by category',
      icon: <Trophy size={20} color={colors.gold.strong} />,
      onPress: () => navigation.navigate('RankingsIndex'),
    },
    {
      label: 'Verify Certificate',
      description: 'Check a certificate number',
      icon: <ScanSearch size={20} color={colors.blue[600]} />,
      onPress: () => navigation.navigate('Verify'),
    },
    {
      label: 'Get Certified',
      description: 'Apply to get your product tested',
      icon: <BadgeCheck size={20} color={colors.brand[600]} />,
      onPress: () => navigation.navigate('GetCertified'),
    },
    {
      label: 'Challenge a Result',
      description: 'Doubt a certified product? Challenge it',
      icon: <Swords size={20} color={colors.fail.strong} />,
      onPress: () => navigation.navigate('Challenge'),
    },
    {
      label: 'About Us',
      icon: <Info size={20} color={colors.ink[600]} />,
      onPress: () => navigation.navigate('About'),
    },
    {
      label: 'Gold Certification',
      icon: <TestTube2 size={20} color={colors.ink[600]} />,
      onPress: () => navigation.navigate('Testing'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon size={20} color={colors.ink[600]} />,
      onPress: () => navigation.navigate('SettingsMenu'),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-surface-1"
      contentContainerClassName="px-4 py-6 pb-12"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} colors={[colors.brand[500]]} />}
    >
      <Text className="px-1 text-2xl font-bold text-ink-900 dark:text-white">More</Text>

      {settings?.contact_email || settings?.contact_phone ? (
        <Card className="mt-4 gap-2 p-4">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">Need help?</Text>
          {settings.contact_email ? (
            <View className="flex-row items-center gap-2">
              <Mail size={14} color={colors.ink[400]} />
              <Text className="text-sm text-ink-700 dark:text-ink-200">{settings.contact_email}</Text>
            </View>
          ) : null}
          {settings.contact_phone ? (
            <View className="flex-row items-center gap-2">
              <Phone size={14} color={colors.ink[400]} />
              <Text className="text-sm text-ink-700 dark:text-ink-200">{settings.contact_phone}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      <View className="mt-4 gap-2">
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14 }}>
            <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5' }}>{item.icon}</View>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-semibold text-ink-900 dark:text-white">{item.label}</Text>
              {item.description ? <Text className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{item.description}</Text> : null}
            </View>
            <ChevronRight size={18} color={colors.ink[300]} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
