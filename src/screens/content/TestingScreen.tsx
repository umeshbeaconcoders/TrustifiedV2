import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Check, Medal } from 'lucide-react-native';
import { FadeIn, StaggerChildren, StaggerItem } from '../../components/motion';
import { colors } from '../../theme/tokens';

/** RN port of `frontend/apps/web/src/pages/testing.tsx` — web merged the old SixLevelPage/SevenLevelPage split into a single GoldPage (8-level testing incl. the WADA panel); mirrored here as one screen. */
const testLevels = [
  { name: 'Macro Accuracy', detail: 'Claimed vs actual protein, carbs, fat — verified in the lab.' },
  { name: 'Amino Spiking', detail: 'Detects cheap amino acids passed off as protein.' },
  { name: 'Melamine', detail: 'Screens for the industrial adulterant behind fake protein counts.' },
  { name: 'Non-Protein Nitrogen (NPN)', detail: 'Catches nitrogen-based inflation of protein numbers.' },
  { name: 'Heavy Metals', detail: 'Lead, arsenic, cadmium and mercury within safe limits.' },
  { name: 'Aflatoxins & Pesticides', detail: 'Fungal toxins and residue screening for everyday safety.' },
];

const wadaSubstances = [
  'Anabolic steroids (multiple)', 'SARMs (Ostarine, LGD-4033…)', 'Stimulants', 'Diuretics & masking agents',
  'Beta-2 agonists', 'Hormone modulators', 'Peptide hormones', 'Banned nutraceutical adulterants',
];

function LevelList({ levels }: { levels: { name: string; detail: string }[] }) {
  return (
    <StaggerChildren className="mt-6 gap-3">
      {levels.map((level, i) => (
        <StaggerItem key={level.name}>
          <View className="flex-row items-start gap-4 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-surface-1 p-4">
            <View className="size-9 shrink-0 items-center justify-center rounded-full bg-pass-soft">
              <Text className="text-sm font-bold text-pass-strong">{i + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-ink-900 dark:text-white">{level.name}</Text>
              <Text className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{level.detail}</Text>
            </View>
          </View>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

export function TestingScreen() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="px-6 py-10 pb-16">
      <FadeIn>
        <View className="flex-row items-center gap-2 self-start rounded-full bg-gold-soft px-3 py-1.5">
          <Medal size={14} color={colors.gold.strong} />
          <Text className="text-xs font-bold uppercase tracking-widest text-gold-800">Gold certification</Text>
        </View>
        <Text className="mt-4 text-2xl font-bold text-ink-900 dark:text-white">Gold Certification — 8 Level Testing</Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          Eight independent laboratory checks stand between a product and the Trustified Gold seal —
          including a WADA-listed banned-substance panel. Fail any one, and the product fails — publicly.
        </Text>
      </FadeIn>
      <LevelList levels={testLevels} />

      <View className="mt-10 border-t border-ink-100 dark:border-ink-800 pt-10">
        <View className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <Text className="text-sm font-bold text-ink-900 dark:text-white">The doping panel covers</Text>
          <View className="mt-3 gap-2">
            {wadaSubstances.map((substance) => (
              <View key={substance} className="flex-row items-center gap-2">
                <Check size={16} color={colors.gold.strong} />
                <Text className="text-sm text-ink-700 dark:text-ink-200">{substance}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
