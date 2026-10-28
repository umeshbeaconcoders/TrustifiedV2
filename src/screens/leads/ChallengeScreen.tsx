import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { Mail, Swords } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';

const LEGAL_EMAIL = 'legal@trustified.in';

/**
 * RN port of `public-react/src/pages/challenge.tsx` — the content of the old trustified.in
 * "Can you challenge Trustified" page. Challenges are sent by email, so there is no form.
 */
const rules = [
  'Trustified always purchases two samples for all its tested products; therefore, the latest sample cannot be requested and submitted by the challenger.',
  'In case the challenger has some doubt in our blind testing process, then they can request a video document of how we purchased the product and sent the sealed box of it to our testing partner (we always film a proof document of our blind testing process for all our tested products).',
  'The challenger will be responsible for advance payment of the testing costs, and it will be non-refundable.',
  'Once the payment is received by Trustified through valid invoices, the challenge process will begin at our independent ISO 17025, NABL accredited laboratory partner. Challenger cannot request testing in any other specific lab.',
  'If the challenge confirms that the product initial result was correct, then no modifications will be done at Trustified sources, but in case a considerable correction is found, the results of this retest will be final and will be updated in all our sources.',
  'The previous result of the challenged product will remain live during the challenge process.',
];

export function ChallengeScreen() {
  const mail = () => void Linking.openURL(`mailto:${LEGAL_EMAIL}?subject=Challenge%20request`);

  return (
    <ScrollView className="flex-1 bg-ink-50 dark:bg-surface-2" contentContainerClassName="px-5 py-8 pb-16">
      <FadeIn>
        <View className="size-12 items-center justify-center rounded-xl bg-fail-soft">
          <Swords size={24} color={colors.fail.strong} />
        </View>
        <Text className="mt-5 text-2xl font-display font-extrabold text-ink-900 dark:text-white">Can you challenge Trustified?</Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          A manufacturer or company can send a challenge request against any of their failed products listed on Trustified at{' '}
          <Text className="font-bold text-brand-700" onPress={mail}>
            {LEGAL_EMAIL}
          </Text>
          .
        </Text>
        <Button onPress={mail} accessibilityLabel="Send a challenge request" className="mt-5 self-start">
          <Mail size={16} color="#fff" />
          <Text className="font-semibold text-white">Send a challenge request</Text>
        </Button>

        <Text className="mt-10 text-xl font-display font-extrabold text-ink-900 dark:text-white">Rules for challengers</Text>
        <Text className="mt-1 text-sm text-ink-600 dark:text-ink-300">Please note the challenger commits to the rules mentioned below:</Text>

        <View className="mt-5 gap-3">
          {rules.map((rule, i) => (
            <View key={i} className="flex-row gap-3 rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-surface-1">
              <View className="size-7 items-center justify-center rounded-full bg-ink-100 dark:bg-surface-3">
                <Text className="text-xs font-bold text-ink-600 dark:text-ink-200">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-xs leading-relaxed text-ink-700 dark:text-ink-200">{rule}</Text>
            </View>
          ))}
        </View>

        <View className="mt-5 rounded-xl border border-gold-200 bg-gold-50 p-4">
          <Text className="text-xs leading-relaxed text-ink-700">
            *If two products with different batch numbers arrive, we notify the lab in advance to test and keep the remaining sample,
            ensuring we can retest the same batch number in the event of a challenge.
          </Text>
        </View>
      </FadeIn>
    </ScrollView>
  );
}
