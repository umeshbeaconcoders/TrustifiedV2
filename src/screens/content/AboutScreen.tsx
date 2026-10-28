import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ShieldCheck, TestTube2, Building2, FileSearch, Beaker, CheckCircle2 } from 'lucide-react-native';
import { useSettings } from '../../api';
import { FadeIn, StaggerChildren, StaggerItem } from '../../components/motion';
import { colors } from '../../theme/tokens';

/** RN port of `frontend/apps/web/src/pages/about.tsx` — hero/mission copy + live stats, condensed to a single scroll (web's parallax/gradient sections don't have an RN equivalent worth building here). */
export function AboutScreen() {
  // Same live numbers and labels as the Home hero; nothing is shown (rather than a made-up number) until loaded.
  const { data: settingsRes } = useSettings();
  const heroStats = settingsRes?.data?.hero_stats;

  const stats = [
    { label: 'Total certified products', value: heroStats?.certified_products, Icon: FileSearch },
    { label: 'Brands', value: heroStats?.brands, Icon: ShieldCheck },
    { label: 'Tests conducted', value: heroStats?.tests_conducted, Icon: Beaker },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="px-6 py-10 pb-16">
      <FadeIn>
        <View className="flex-row items-center gap-2 self-start rounded-full bg-brand-50 px-3 py-1.5">
          <ShieldCheck size={14} color={colors.brand[700]} />
          <Text className="text-xs font-bold uppercase tracking-widest text-brand-700">Independent Testing</Text>
        </View>
        <Text className="mt-4 text-3xl font-black leading-tight text-ink-900 dark:text-white">
          The Truth About What You Consume.
        </Text>
        <Text className="mt-4 text-base leading-relaxed text-ink-600 dark:text-ink-300">
          Independent lab testing. Unbiased results. Greater transparency in every product you choose.
        </Text>
      </FadeIn>

      <View className="mt-8 rounded-3xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 p-6 shadow-sm">
        <Text className="text-xl font-bold text-ink-900 dark:text-white">Independence is our product.</Text>
        <Text className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          We are an independent certification company: we buy products blind from the open market, send
          them to NABL-accredited laboratories, and publish the results — whether the product passes or
          fails.
        </Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          Brands cannot pay us to test favourably, cannot choose the batch we test, and cannot suppress a
          failed result.
        </Text>
      </View>

      <StaggerChildren className="mt-8 gap-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <View className="flex-row items-center gap-4 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 p-5 shadow-sm">
              <View className="size-12 items-center justify-center rounded-full bg-brand-50">
                <stat.Icon size={22} color={colors.brand[600]} />
              </View>
              <View>
                <Text className="text-2xl font-black text-ink-900 dark:text-white">
                  {typeof stat.value === 'number' ? `${stat.value.toLocaleString('en-IN')}+` : '–'}
                </Text>
                <Text className="text-xs font-bold uppercase tracking-widest text-ink-500 dark:text-ink-400">{stat.label}</Text>
              </View>
            </View>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <View className="mt-10">
        <Text className="text-xl font-bold text-ink-900 dark:text-white">How Trustified works</Text>
        <View className="mt-5 gap-4">
          {[
            { title: 'Blind Procurement', desc: 'We buy products randomly from retail stores using secret shopper methods. Brands never know when or where we purchase.', Icon: TestTube2 },
            { title: 'Lab Testing', desc: 'Products are sent directly to NABL-accredited third-party labs for rigorous scientific testing of label claims and heavy metals.', Icon: Building2 },
            { title: 'Public Results', desc: 'Reports are uploaded immediately to our database for full public transparency. Passed products get certified, failed products stay visible.', Icon: CheckCircle2 },
          ].map((step, idx) => (
            <View key={step.title} className="flex-row gap-4 rounded-2xl border border-ink-100 dark:border-ink-800 p-4">
              <View className="size-11 items-center justify-center rounded-xl bg-ink-900">
                <step.Icon size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-brand-600">Step {idx + 1}</Text>
                <Text className="mt-0.5 text-base font-bold text-ink-900 dark:text-white">{step.title}</Text>
                <Text className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-10 gap-4">
        <Text className="text-xl font-bold text-ink-900 dark:text-white">Our laboratory partners</Text>
        <View className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-surface-1 p-5">
          <Text className="text-base font-bold text-ink-900 dark:text-white">NABL Accredited</Text>
          <Text className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            National Accreditation Board for Testing and Calibration Laboratories. Ensuring the highest
            standard of testing competence globally recognized.
          </Text>
        </View>
        <View className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-surface-1 p-5">
          <Text className="text-base font-bold text-ink-900 dark:text-white">ISO/IEC 17025</Text>
          <Text className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            The primary international standard for testing and calibration laboratories, guaranteeing
            reliable and impartial results.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
