import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Swords } from 'lucide-react-native';
import { ApiError, useSubmitChallenge } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput, ControlledTextarea } from '../../components/form/ControlledInput';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { toast } from '../../stores/toast';

/** RN port of `frontend/apps/web/src/pages/challenge.tsx` — same zod schema/fields, `useSubmitChallenge()`. */
const challengeSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(255),
  email: z.string().email('Enter a valid email').max(255),
  phone: z.string().max(20).optional().or(z.literal('')),
  message: z.string().min(10, 'Tell us which product and why').max(5000),
});
type ChallengeForm = z.infer<typeof challengeSchema>;

const rules = [
  "Any Trustified-certified product can be challenged by anyone — consumer, competitor or brand.",
  'The challenged product is bought blind again and re-tested at an accredited lab.',
  "If the product fails the re-test, its certification is revoked and the result is published.",
  "If it passes, the result is published too — transparency cuts both ways.",
];

export function ChallengeScreen() {
  const submitChallenge = useSubmitChallenge();
  const [success, setSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChallengeForm>({ resolver: zodResolver(challengeSchema) });

  const onSubmit = handleSubmit((values) => {
    submitChallenge.mutate(
      { ...values, phone: values.phone || null },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => {
          if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
            for (const [field, messages] of Object.entries(err.errors)) {
              const message = messages[0];
              if (message) setError(field as keyof ChallengeForm, { message });
            }
          } else {
            toast.error('Could not submit the challenge. Please try again.');
          }
        },
      },
    );
  });

  return (
    <KeyboardAvoidingScreen contentContainerClassName="px-6 py-10">
      <FadeIn>
        <View className="size-12 items-center justify-center rounded-xl bg-fail-soft">
          <Swords size={22} color={colors.fail.strong} />
        </View>
        <Text className="mt-5 text-2xl font-bold text-ink-900 dark:text-white">Can you challenge a result?</Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          Yes. That's the point. If you doubt any certified product, challenge it and we'll re-test it
          blind.
        </Text>

        <View className="mt-6 gap-3">
          {rules.map((rule, i) => (
            <View key={i} className="flex-row gap-3">
              <View className="size-6 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-surface-2">
                <Text className="text-xs font-bold text-ink-600 dark:text-ink-300">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{rule}</Text>
            </View>
          ))}
        </View>

        {success ? (
          <View className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <Text className="text-base font-bold text-brand-800">Challenge submitted</Text>
            <Text className="mt-1 text-sm text-ink-700 dark:text-ink-200">We'll take it from here.</Text>
          </View>
        ) : (
          <View className="mt-8 gap-4 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-surface-1 p-5">
            <Text className="text-base font-bold text-ink-900 dark:text-white">Raise a challenge</Text>
            <Field label="Name" required error={errors.name?.message}>
              <ControlledInput control={control} name="name" autoComplete="name" accessibilityLabel="Name" />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <ControlledInput control={control} name="email" keyboardType="email-address" autoComplete="email" accessibilityLabel="Email" />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <ControlledInput control={control} name="phone" keyboardType="phone-pad" autoComplete="tel" accessibilityLabel="Phone" />
            </Field>
            <Field
              label="Which product, and why?"
              required
              error={errors.message?.message}
              hint="Name the certified product and describe what makes you doubt the result.">
              <ControlledTextarea control={control} name="message" accessibilityLabel="Which product, and why?" />
            </Field>
            <Button onPress={onSubmit} loading={submitChallenge.isPending} accessibilityLabel="Submit challenge">
              Submit challenge
            </Button>
          </View>
        )}
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
