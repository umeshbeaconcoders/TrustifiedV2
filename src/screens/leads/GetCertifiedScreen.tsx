import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PartyPopper, ShoppingBag, TestTube, Globe, ShieldCheck, FileText, CheckCircle2, Award, Users, Megaphone } from 'lucide-react-native';
import { ApiError, useSubmitLead } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput, ControlledTextarea } from '../../components/form/ControlledInput';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { toast } from '../../stores/toast';

/** RN port of `frontend/apps/web/src/pages/get-certified.tsx` — same zod schema/fields, `useSubmitLead()`. */
const leadSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(255),
  email: z.string().email('Enter a valid email').max(255),
  company_name: z.string().max(255).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d][\d\s-]*$/, 'Enter a valid phone number')
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
      <ScrollView className="flex-1 bg-white" contentContainerClassName="items-center px-6 py-24">
        <FadeIn className="items-center">
          <View className="size-16 items-center justify-center rounded-full bg-pass-soft">
            <PartyPopper size={32} color={colors.pass.strong} />
          </View>
          <Text className="mt-6 text-center text-2xl font-bold text-ink-900">Request received!</Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-ink-600">
            Our certification team will get back to you within 2 business days. Meanwhile, read how our
            blind-testing process works from the Testing section.
          </Text>
        </FadeIn>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ink-50" contentContainerClassName="px-5 py-8" keyboardShouldPersistTaps="handled">
      <FadeIn>
        <Text className="text-2xl font-display font-extrabold text-ink-900">Get certified</Text>
        <Text className="mt-2 text-sm leading-relaxed text-ink-600">
          Certification is earned, not bought. We buy your product blind from the market, test it at
          accredited labs, and publish the result — whichever way it goes.
        </Text>

        {/* Lead Request Form Card */}
        <View className="mt-6 bg-white border border-ink-100 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] gap-4">
          <View className="border-l-4 border-brand-500 pl-4 mb-1">
            <Text className="text-xs italic text-ink-700 leading-relaxed">
              "The seal means one thing: this batch was tested by someone the brand couldn't influence."
            </Text>
          </View>

          <Field label="Name" required error={errors.name?.message}>
            <ControlledInput control={control} name="name" autoComplete="name" accessibilityLabel="Name" />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <ControlledInput control={control} name="email" keyboardType="email-address" autoComplete="email" accessibilityLabel="Email" />
          </Field>
          <Field label="Company" error={errors.company_name?.message}>
            <ControlledInput control={control} name="company_name" autoComplete="organization" accessibilityLabel="Company" />
          </Field>
          <Field label="Contact number" error={errors.phone?.message}>
            <ControlledInput control={control} name="phone" keyboardType="phone-pad" autoComplete="tel" accessibilityLabel="Contact number" />
          </Field>
          <Field label="Message" error={errors.message?.message} hint="Tell us about your product(s) and category.">
            <ControlledTextarea control={control} name="message" accessibilityLabel="Message" />
          </Field>

          <Pressable
            onPress={() => {
              const next = !termsAccepted;
              setTermsAccepted(next);
              setValue('terms', next, { shouldValidate: true });
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            className="flex-row items-start gap-2.5 mt-1">
            <View
              className={`mt-0.5 size-5 items-center justify-center rounded border ${
                termsAccepted ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white'
              }`}>
              {termsAccepted ? <Text className="text-xs font-bold text-white">✓</Text> : null}
            </View>
            <Text className="flex-1 text-xs text-ink-600 leading-relaxed">
              I agree that testing is independent and results will be published regardless of outcome.
            </Text>
          </Pressable>
          {errors.terms ? <Text className="text-xs font-medium text-fail-strong">{errors.terms.message}</Text> : null}

          <Button onPress={onSubmit} loading={submitLead.isPending} accessibilityLabel="Request certification" className="mt-2">
            Request certification
          </Button>
        </View>

        {/* Section: How Certification Works */}
        <View className="mt-12 mb-4">
          <Text className="text-2xl font-display font-extrabold text-ink-900 text-center">How Certification Works</Text>
          <Text className="mt-1 text-sm font-semibold text-ink-500 text-center">Four steps, all of them public</Text>

          <View className="gap-6 mt-8">
            {/* Step 1 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-20 h-20 bg-white border border-ink-100 rounded-[28px] items-center justify-center shadow-sm relative">
                <View className="absolute -top-2 -right-2 bg-brand-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm">
                  <Text className="text-white text-xs font-display font-extrabold">1</Text>
                </View>
                <ShoppingBag size={28} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Blind Purchase</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                We buy your product off the shelf like any customer — no samples, no advance notice.
              </Text>
            </View>

            {/* Step 2 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-20 h-20 bg-white border border-ink-100 rounded-[28px] items-center justify-center shadow-sm relative">
                <View className="absolute -top-2 -right-2 bg-brand-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm">
                  <Text className="text-white text-xs font-display font-extrabold">2</Text>
                </View>
                <ShieldCheck size={28} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Lab Testing</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                The sealed unit goes straight to an accredited lab for 6- or 7-level analysis.
              </Text>
            </View>

            {/* Step 3 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-20 h-20 bg-white border border-ink-100 rounded-[28px] items-center justify-center shadow-sm relative">
                <View className="absolute -top-2 -right-2 bg-brand-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm">
                  <Text className="text-white text-xs font-display font-extrabold">3</Text>
                </View>
                <FileText size={28} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Result Published</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                Pass or fail, the report goes live on Trustified — full transparency, no exceptions.
              </Text>
            </View>

            {/* Step 4 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-20 h-20 bg-white border border-ink-100 rounded-[28px] items-center justify-center shadow-sm relative">
                <View className="absolute -top-2 -right-2 bg-brand-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm">
                  <Text className="text-white text-xs font-display font-extrabold">4</Text>
                </View>
                <Award size={28} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Certified & Listed</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                Products that pass get the Trustified seal and a spot in our certified database.
              </Text>
            </View>
          </View>
        </View>

        {/* Section: What It Does For Your Brand */}
        <View className="mt-8 mb-6">
          <Text className="text-2xl font-display font-extrabold text-ink-900 text-center">What It Does For Your Brand</Text>
          <Text className="mt-1 text-sm font-semibold text-ink-500 text-center">Certification isn't just a badge — it's leverage</Text>

          <View className="gap-5 mt-8">
            {/* Benefit 1 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl items-center justify-center">
                <ShieldCheck size={24} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Earned Consumer Trust</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                The seal signals your product was tested by someone you couldn't influence — trust customers can verify.
              </Text>
            </View>

            {/* Benefit 2 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl items-center justify-center">
                <CheckCircle2 size={24} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Stand Out From Claims</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                Most labels just claim quality. Certification proves it with a published, independent report.
              </Text>
            </View>

            {/* Benefit 3 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl items-center justify-center">
                <Users size={24} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Access Our Audience</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                Get discovered by health-conscious buyers actively browsing the Standard and Certified Brands database.
              </Text>
            </View>

            {/* Benefit 4 */}
            <View className="bg-white border border-ink-100 rounded-3xl p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <View className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl items-center justify-center">
                <Megaphone size={24} color={colors.brand[600]} />
              </View>
              <Text className="text-base font-display font-extrabold text-ink-900 mt-4 text-center">Marketing You Can Use</Text>
              <Text className="text-xs text-ink-500 text-center mt-2 leading-relaxed px-2">
                Use the Trustified seal and your published report in your own marketing, backed by real data.
              </Text>
            </View>
          </View>
        </View>
      </FadeIn>
    </ScrollView>
  );
}
