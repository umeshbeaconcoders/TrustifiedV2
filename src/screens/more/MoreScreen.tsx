import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
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
  const { data: settingsRes } = useSettings();
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
      label: 'Our Testing Process',
      icon: <TestTube2 size={20} color={colors.ink[600]} />,
      onPress: () => navigation.navigate('Testing'),
    },
    {
      label: 'What Gets Certified',
      icon: <ListChecks size={20} color={colors.ink[600]} />,
      onPress: () => navigation.navigate('WhatGetsCertified'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon size={20} color={colors.ink[600]} />,
      onPress: () => navigation.navigate('SettingsMenu'),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-4 py-6 pb-12">
      <Text className="px-1 text-2xl font-bold text-ink-900">More</Text>

      {settings?.contact_email || settings?.contact_phone ? (
        <Card className="mt-4 gap-2 p-4">
          <Text className="text-xs font-bold uppercase tracking-wide text-ink-500">Need help?</Text>
          {settings.contact_email ? (
            <View className="flex-row items-center gap-2">
              <Mail size={14} color={colors.ink[400]} />
              <Text className="text-sm text-ink-700">{settings.contact_email}</Text>
            </View>
          ) : null}
          {settings.contact_phone ? (
            <View className="flex-row items-center gap-2">
              <Phone size={14} color={colors.ink[400]} />
              <Text className="text-sm text-ink-700">{settings.contact_phone}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      <View className="mt-4 gap-2">
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            className="flex-row items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3.5 active:bg-ink-50">
            <View className="size-10 items-center justify-center rounded-full bg-ink-50">{item.icon}</View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink-900">{item.label}</Text>
              {item.description ? <Text className="mt-0.5 text-xs text-ink-500">{item.description}</Text> : null}
            </View>
            <ChevronRight size={18} color={colors.ink[300]} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
