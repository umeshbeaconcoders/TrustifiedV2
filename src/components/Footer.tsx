import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Facebook, Instagram, Youtube, Linkedin, ArrowRight } from 'lucide-react-native';
import { useSettings } from '../api';
import { TrustifiedStamp } from './icons/TrustifiedStamp';

export function Footer() {
  const navigation = useNavigation<any>();
  const { data } = useSettings();
  const socials = data?.data?.socials ?? {};
  const contactEmail = data?.data?.contact_email || 'support@trustified.in';

  return (
    <View className="bg-[#0b0f19] pt-12 pb-8 border-t-[3px] border-[#2563eb]">
      {/* Decorative top border color layout */}
      <View className="absolute top-0 left-0 right-0 h-1 flex-row">
        <View style={{ flex: 1, backgroundColor: '#2563eb' }} />
        <View style={{ flex: 1, backgroundColor: '#10b981' }} />
        <View style={{ flex: 1, backgroundColor: '#b08c2f' }} />
      </View>

      <View className="px-6 gap-8">
        {/* Brand / Logo section */}
        <View>
          <View className="flex-row items-center gap-2">
            <TrustifiedStamp size={32} />
            <Text className="text-xl font-display font-extrabold text-white">Trustified</Text>
          </View>
          <Text className="mt-4 text-xs leading-relaxed text-ink-400 dark:text-ink-500 font-semibold">
            India's independent blind-testing and certification platform. We buy products off the shelf, test them in accredited labs, and publish the true results — pass or fail.
          </Text>
        </View>

        {/* Socials row — only the ones set in admin settings (incl. LinkedIn) */}
        <View className="flex-row gap-3">
          {socials.facebook ? <SocialLink icon={Facebook} url={socials.facebook} /> : null}
          {socials.instagram ? <SocialLink icon={Instagram} url={socials.instagram} /> : null}
          {socials.youtube ? <SocialLink icon={Youtube} url={socials.youtube} /> : null}
          {socials.linkedin ? <SocialLink icon={Linkedin} url={socials.linkedin} /> : null}
        </View>

        {/* Explore Links — Standard / Gold / NMR are one Pass/Fail page */}
        <View>
          <Text className="text-white text-xs font-bold uppercase tracking-wider mb-3">Explore</Text>
          <View className="gap-2.5">
            <FooterLink label="Pass/Fail" onPress={() => navigation.navigate('Reports')} />
            <FooterLink label="Certified Brands" onPress={() => navigation.navigate('CertifiedBrands')} />
            <FooterLink label="Shop" onPress={() => navigation.navigate('Shop')} />
          </View>
        </View>

        {/* Support email contact strip */}
        <View className="flex-row items-center gap-3 border-t border-white/10 pt-6">
          <View className="size-8 rounded-full bg-white/5 items-center justify-center border border-white/10">
            <Mail size={14} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-bold uppercase">Contact Email</Text>
            <Text
              className="text-xs font-bold text-white mt-0.5"
              onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
            >
              {contactEmail}
            </Text>
          </View>
        </View>

        {/* Copyright notice */}
        <View className="border-t border-white/10 pt-4 flex-row justify-between items-center">
          <Text className="text-[10px] font-bold text-ink-500 dark:text-ink-400">
            © {new Date().getFullYear()} Trustified platforms.
          </Text>
          <Text className="text-[10px] font-bold text-ink-500 dark:text-ink-400">
            All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

function SocialLink({ icon: Icon, url }: { icon: any; url: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      className="size-9 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-brand-500 active:border-brand-500"
    >
      <Icon size={16} color="#9ca3af" />
    </Pressable>
  );
}

function FooterLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-1.5 active:opacity-75">
      <ArrowRight size={10} color="#6b7280" />
      <Text className="text-ink-400 dark:text-ink-500 text-xs font-semibold">{label}</Text>
    </Pressable>
  );
}
