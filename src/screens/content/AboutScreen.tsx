import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ShieldCheck, TestTube2, Building2, FileSearch, Beaker, CheckCircle2 } from 'lucide-react-native';
import { useReports, useCertifiedBrands } from '../../api';
import { FadeIn, StaggerChildren, StaggerItem } from '../../components/motion';
import { colors } from '../../theme/tokens';

/** RN port of `frontend/apps/web/src/pages/about.tsx` — hero/mission copy + live stats, condensed to a single scroll (web's parallax/gradient sections don't have an RN equivalent worth building here). */
export function AboutScreen() {
  const { data: passFail } = useReports('pass-fail', { per_page: 1 });
  const { data: brands } = useCertifiedBrands();

  const totalTested = passFail?.meta.total ?? 542;
  const brandList = Array.isArray(brands?.data) ? brands.data : [];
  const totalBrands = brandList.length > 0 ? brandList.length : 120;

  const stats = [
    { label: 'Products Tested', value: totalTested, Icon: FileSearch },
    { label: 'Brands Certified', value: totalBrands, Icon: ShieldCheck },
    { label: 'Lab Partners', value: 3, Icon: Beaker },
  ];

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-10 pb-16">
      <FadeIn>
        <View className="flex-row items-center gap-2 self-start rounded-full bg-brand-50 px-3 py-1.5">
          <ShieldCheck size={14} color={colors.brand[700]} />
          <Text className="text-xs font-bold uppercase tracking-widest text-brand-700">Independent Testing</Text>
        </View>
        <Text className="mt-4 text-3xl font-black leading-tight text-ink-900">
          The Truth About What You Consume.
        </Text>
        <Text className="mt-4 text-base leading-relaxed text-ink-600">
          Labels lie more often than they should. We exist to bring absolute transparency to the Indian
          health and supplement market.
        </Text>
      </FadeIn>

      <View className="mt-8 rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
        <Text className="text-xl font-bold text-ink-900">Independence is our product.</Text>
        <Text className="mt-4 text-sm leading-relaxed text-ink-600">
          We are an independent certification company: we buy products blind from the open market, send
          them to NABL-accredited laboratories, and publish the results — whether the product passes or
          fails.
        </Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600">
          Brands cannot pay us to test favourably, cannot choose the batch we test, and cannot suppress a
          failed result.
        </Text>
      </View>

      <StaggerChildren className="mt-8 gap-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <View className="flex-row items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
              <View className="size-12 items-center justify-center rounded-full bg-brand-50">
                <stat.Icon size={22} color={colors.brand[600]} />
              </View>
              <View>
                <Text className="text-2xl font-black text-ink-900">{stat.value}+</Text>
                <Text className="text-xs font-bold uppercase tracking-widest text-ink-500">{stat.label}</Text>
              </View>
            </View>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <View className="mt-10">
        <Text className="text-xl font-bold text-ink-900">How Trustified works</Text>
        <View className="mt-5 gap-4">
          {[
            { title: 'Blind Procurement', desc: 'We buy products randomly from retail stores using secret shopper methods. Brands never know when or where we purchase.', Icon: TestTube2 },
            { title: 'Lab Testing', desc: 'Products are sent directly to NABL-accredited third-party labs for rigorous scientific testing of label claims and heavy metals.', Icon: Building2 },
            { title: 'Public Results', desc: 'Reports are uploaded immediately to our database for full public transparency. Passed products get certified, failed products stay visible.', Icon: CheckCircle2 },
          ].map((step, idx) => (
            <View key={step.title} className="flex-row gap-4 rounded-2xl border border-ink-100 p-4">
              <View className="size-11 items-center justify-center rounded-xl bg-ink-900">
                <step.Icon size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-brand-600">Step {idx + 1}</Text>
                <Text className="mt-0.5 text-base font-bold text-ink-900">{step.title}</Text>
                <Text className="mt-1 text-sm leading-relaxed text-ink-600">{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-10 gap-4">
        <Text className="text-xl font-bold text-ink-900">Our laboratory partners</Text>
        <View className="rounded-2xl border border-ink-200 bg-white p-5">
          <Text className="text-base font-bold text-ink-900">NABL Accredited</Text>
          <Text className="mt-2 text-sm leading-relaxed text-ink-600">
            National Accreditation Board for Testing and Calibration Laboratories. Ensuring the highest
            standard of testing competence globally recognized.
          </Text>
        </View>
        <View className="rounded-2xl border border-ink-200 bg-white p-5">
          <Text className="text-base font-bold text-ink-900">ISO/IEC 17025</Text>
          <Text className="mt-2 text-sm leading-relaxed text-ink-600">
            The primary international standard for testing and calibration laboratories, guaranteeing
            reliable and impartial results.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
