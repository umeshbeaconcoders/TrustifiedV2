import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Facebook, Instagram, Youtube, Send, ArrowRight } from 'lucide-react-native';
import { TrustifiedStamp } from './icons/TrustifiedStamp';
import { colors } from '../theme/tokens';

export function Footer() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email.trim()) {
      Alert.alert("Subscribed", "You'll get new test results in your inbox.");
      setEmail('');
    }
  };

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
          <Text className="mt-4 text-xs leading-relaxed text-ink-400 font-semibold">
            India's independent blind-testing and certification platform. We buy products off the shelf, test them in accredited labs, and publish the true results — pass or fail.
          </Text>
        </View>

        {/* Socials row */}
        <View className="flex-row gap-3">
          <SocialLink icon={Facebook} url="https://facebook.com" />
          <SocialLink icon={Instagram} url="https://instagram.com" />
          <SocialLink icon={Youtube} url="https://youtube.com" />
        </View>

        {/* Explore Links */}
        <View>
          <Text className="text-white text-xs font-bold uppercase tracking-wider mb-3">Explore</Text>
          <View className="gap-2.5">
            <FooterLink label="Standard Database" onPress={() => navigation.navigate('Reports', { type: 'pass-fail' })} />
            <FooterLink label="Gold Certified" onPress={() => navigation.navigate('Reports', { type: 'gold' })} />
            <FooterLink label="NMR Reports" onPress={() => navigation.navigate('Reports', { type: 'nmr' })} />
          </View>
        </View>

        {/* Stay Updated Card */}
        <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Text className="text-white text-xs font-bold uppercase tracking-wider mb-1">Stay Updated</Text>
          <Text className="text-[10px] text-ink-450 font-bold mb-3">
            Get new test results and alerts delivered directly to your inbox.
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#4b5563"
              keyboardType="email-address"
              className="flex-1 bg-[#111827] text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-white/10"
            />
            <Pressable 
              onPress={handleSubscribe} 
              className="bg-brand-500 rounded-xl px-3.5 items-center justify-center active:opacity-90"
            >
              <Send size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Support email contact strip */}
        <View className="flex-row items-center gap-3 border-t border-white/10 pt-6">
          <View className="size-8 rounded-full bg-white/5 items-center justify-center border border-white/10">
            <Mail size={14} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-[10px] text-ink-500 font-bold uppercase">Contact Email</Text>
            <Text 
              className="text-xs font-bold text-white mt-0.5" 
              onPress={() => Linking.openURL('mailto:support@trustified.in')}
            >
              support@trustified.in
            </Text>
          </View>
        </View>

        {/* Copyright notice */}
        <View className="border-t border-white/10 pt-4 flex-row justify-between items-center">
          <Text className="text-[10px] font-bold text-ink-500">
            © {new Date().getFullYear()} Trustified platforms.
          </Text>
          <Text className="text-[10px] font-bold text-ink-500">
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
      <Text className="text-ink-400 text-xs font-semibold">{label}</Text>
    </Pressable>
  );
}
