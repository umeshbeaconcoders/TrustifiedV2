import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError, useRegister } from '../../api';
import { Button, Field } from '../../components/ui';
import { ControlledInput } from '../../components/form/ControlledInput';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';
import { toast } from '../../stores/toast';

/** Mirrors `RegisterRequest` validation (backend/app/Http/Requests/Auth/RegisterRequest.php) and web's register.tsx schema (Task 2.1). */
const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your name').max(255),
    email: z.string().email('Enter a valid email'),
    phone: z.string().max(20).optional().or(z.literal('')),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string().min(8, 'At least 8 characters'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });
type RegisterForm = z.infer<typeof registerSchema>;

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const register = useRegister();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    const { phone, ...rest } = values;
    register.mutate(
      { ...rest, phone: phone || null },
      {
        onSuccess: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }),
        onError: (err) => {
          if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
            for (const [field, messages] of Object.entries(err.errors)) {
              const message = messages[0];
              if (message) setError(field as keyof RegisterForm, { message });
            }
          } else {
            toast.error(err instanceof ApiError ? (err.firstError() ?? err.message) : 'Could not create your account. Please try again.');
          }
        },
      },
    );
  });

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-10" keyboardShouldPersistTaps="handled">
      <FadeIn>
        <Text className="text-center text-2xl font-bold text-ink-900">Create your account</Text>

        <View className="mt-6 gap-4">
          <Field label="Name" required error={errors.name?.message}>
            <ControlledInput control={control} name="name" autoComplete="name" accessibilityLabel="Name" />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <ControlledInput
              control={control}
              name="email"
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="Email"
            />
          </Field>
          <Field label="Phone (optional)" error={errors.phone?.message}>
            <ControlledInput control={control} name="phone" keyboardType="phone-pad" accessibilityLabel="Phone" />
          </Field>
          <Field label="Password" required error={errors.password?.message}>
            <ControlledInput
              control={control}
              name="password"
              secureTextEntry
              autoComplete="new-password"
              accessibilityLabel="Password"
            />
          </Field>
          <Field label="Confirm password" required error={errors.password_confirmation?.message}>
            <ControlledInput
              control={control}
              name="password_confirmation"
              secureTextEntry
              autoComplete="new-password"
              accessibilityLabel="Confirm password"
            />
          </Field>

          <Button onPress={onSubmit} loading={register.isPending} accessibilityLabel="Create account">
            Create account
          </Button>
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text className="text-sm text-ink-500">Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="button">
            <Text className="text-sm font-semibold text-brand-700">Log in</Text>
          </Pressable>
        </View>
      </FadeIn>
    </ScrollView>
  );
}
