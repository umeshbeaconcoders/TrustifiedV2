import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, PartyPopper, Quote } from 'lucide-react-native';
import { ApiError, useSubmitLead } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput, ControlledTextarea } from '../../components/form/ControlledInput';
import { KeyboardAvoidingScreen } from '../../components/KeyboardAvoidingScreen';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { toast } from '../../stores/toast';

/**
 * RN port of `public-react/src/pages/get-certified.tsx` — the content and fields of the old trustified.in
 * "Get certified" page: Name, Email, Company name, Contact, a brief description, plus the Terms &
 * Conditions for Blind Testing. Submits through `useSubmitLead()`.
 */
const PRINCIPLES = [
  'Our duty is to consumers, not companies. Participation in this program is optional, but transparency is not.',
  'Register only if you are confident in your product. Every result will be shown to the world.',
];

const BLIND_TESTING_TERMS = [
  { title: 'Independent Testing only', body: 'We never accept samples directly from companies. Products are always purchased by us anonymously without any prior notice to ensure fairness.' },
  { title: 'Publication of Results', body: 'By registering, companies agree that all results, including failed results, will be published openly for consumers to see.' },
  { title: 'No Legal Action', body: 'By registering, companies also agree that they cannot pursue legal action against TRUSTIFIED in the event their product fails testing.' },
  { title: 'No Interference', body: "Companies have no role in deciding when, where, or how products are purchased or tested. The process remains strictly under TRUSTIFIED's control." },
  { title: 'Ethical Commitment', body: 'This program is designed to protect consumers from adulterated or misleading products. Only genuine companies with nothing to hide should apply.' },
];

const leadSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(255),
  email: z.string().email('Enter a valid email').max(255),
  company_name: z.string().max(255).optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number (starting with 6-9)')
    .optional()
    .or(z.literal('')),
  message: z.string().max(5000).optional().or(z.literal('')),
  terms: z.boolean().refine((v) => v === true, { message: 'Please accept the terms to continue' }),
});
type LeadForm = z.infer<typeof leadSchema>;

export function GetCertifiedScreen() {
  const submitLead = useSubmitLead();
  const [success, setSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LeadForm>({ resolver: zodResolver(leadSchema), defaultValues: { terms: false } });

  const onSubmit = handleSubmit((values) => {
    submitLead.mutate(
      {
        name: values.name,
        email: values.email,
        company_name: values.company_name || null,
        phone: values.phone || null,
        message: values.message || null,
      },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => {
          if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
            for (const [field, messages] of Object.entries(err.errors)) {
              const message = messages[0];
              if (message) setError(field as keyof LeadForm, { message });
            }
          } else {
            toast.error('Could not submit your request. Please try again.');
          }
        },
      },
    );
  });

  if (success) {
    return (
      <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="items-center px-6 py-24">
        <FadeIn className="items-center">
          <View className="size-16 items-center justify-center rounded-full bg-pass-soft">
            <PartyPopper size={32} color={colors.pass.strong} />
          </View>
          <Text className="mt-6 text-center text-2xl font-bold text-ink-900 dark:text-white">Thanks for submitting!</Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            Our team will get back to you shortly. You can also write to us at support@trustified.in.
          </Text>
        </FadeIn>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-ink-50 dark:bg-surface-2" contentContainerClassName="px-5 py-8">
      <FadeIn>
        <Text className="text-2xl font-display font-extrabold text-ink-900 dark:text-white">Interested in getting Trustified?</Text>
        <Text className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          Show your customers that you are completely transparent about what's in the label is in your product with India's
          first and only 100% blind testing certification.
        </Text>
        <Text className="mt-2 text-sm text-ink-600 dark:text-ink-300">Fill out this form to submit your request.</Text>

        <View className="mt-5 gap-3">
          {PRINCIPLES.map((text) => (
            <View key={text} className="flex-row gap-3 border-l-4 border-brand-500 pl-4">
              <Quote size={14} color={colors.brand[500]} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs italic leading-relaxed text-ink-700 dark:text-ink-200">"{text}"</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => void Linking.openURL('mailto:support@trustified.in')} accessibilityRole="link" className="mt-5 flex-row items-center gap-2 self-start">
          <Mail size={15} color={colors.brand[600]} />
          <Text className="text-xs text-ink-600 dark:text-ink-300">
            Email us at <Text className="font-bold text-brand-700">support@trustified.in</Text>
          </Text>
        </Pressable>

        {/* Lead Request Form Card */}
        <View className="mt-6 gap-4 rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-surface-1">
          <Field label="Name" required error={errors.name?.message}>
            <ControlledInput control={control} name="name" autoComplete="name" accessibilityLabel="Name" />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <ControlledInput control={control} name="email" keyboardType="email-address" autoComplete="email" accessibilityLabel="Email" />
          </Field>
          <Field label="Company name" error={errors.company_name?.message}>
            <ControlledInput control={control} name="company_name" autoComplete="organization" accessibilityLabel="Company name" />
          </Field>
          <Field label="Contact" error={errors.phone?.message}>
            <ControlledInput control={control} name="phone" keyboardType="phone-pad" autoComplete="tel" placeholder="Enter 10-digit mobile number" accessibilityLabel="Contact" />
          </Field>
          <Field label="Kindly mention a brief description of what you would like to discuss" error={errors.message?.message}>
            <ControlledTextarea control={control} name="message" accessibilityLabel="Brief description of what you would like to discuss" />
          </Field>

          <Pressable
            onPress={() => {
              const next = !termsAccepted;
              setTermsAccepted(next);
              setValue('terms', next, { shouldValidate: true });
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            className="mt-1 flex-row items-start gap-2.5">
            <View className={`mt-0.5 size-5 items-center justify-center rounded border ${termsAccepted ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white'}`}>
              {termsAccepted ? <Text className="text-xs font-bold text-white">✓</Text> : null}
            </View>
            <Text className="flex-1 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
              I have read and accept the Terms & Conditions for Blind Testing below.
            </Text>
          </Pressable>
          {errors.terms ? <Text className="text-xs font-medium text-fail-strong">{errors.terms.message}</Text> : null}

          <Button onPress={onSubmit} loading={submitLead.isPending} accessibilityLabel="Send" className="mt-2">
            Send
          </Button>
        </View>

        {/* Terms & Conditions for Blind Testing */}
        <View className="mb-6 mt-12">
          <Text className="text-center text-2xl font-display font-extrabold text-ink-900 dark:text-white">Terms & Conditions for Blind Testing</Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            At TRUSTIFIED, we stand for 100% ethical, transparent, and unbiased certification. Companies are welcome to register
            their products for blind testing by covering the testing charges, but by doing so, they must accept the following
            non-negotiable terms:
          </Text>
          <View className="mt-6 gap-4">
            {BLIND_TESTING_TERMS.map((term, i) => (
              <View key={term.title} className="flex-row gap-4 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-surface-1">
                <View className="size-9 items-center justify-center rounded-full bg-brand-600">
                  <Text className="text-sm font-bold text-white">{i + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-display font-extrabold text-ink-900 dark:text-white">{term.title}</Text>
                  <Text className="mt-1.5 text-xs leading-relaxed text-ink-600 dark:text-ink-300">{term.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </FadeIn>
    </KeyboardAvoidingScreen>
  );
}
