import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ShieldCheck, ShieldX, Search } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useVerifyCertificate } from '../../api';
import { Badge, Button, EmptyState, Field, Input, MediaFrame, Spinner } from '../../components/ui';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

/**
 * RN port of `frontend/apps/web/src/pages/verify.tsx`. Manual certificate-number
 * entry, submitted on demand (query only enables once a lookup is triggered).
 * A QR-scan entry point is a nice-to-have per the spec but no camera lib is
 * wired up yet (react-native-vision-camera is in package.json but not
 * integrated) — skipped to keep this pass focused on the manual flow.
 */
type Props = NativeStackScreenProps<RootStackParamList, 'Verify'>;

export function VerifyScreen({ route }: Props) {
  const [value, setValue] = useState(route.params?.certificateNumber ?? '');
  const [submitted, setSubmitted] = useState(route.params?.certificateNumber ?? '');
  const { data, isLoading, isError, isFetched } = useVerifyCertificate(submitted || undefined);
  const certificate = data?.data;

  function handleSubmit() {
    setSubmitted(value.trim());
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-10" keyboardShouldPersistTaps="handled">
      <FadeIn>
        <Text className="text-2xl font-bold text-ink-900">Verify a certificate</Text>
        <Text className="mt-2 text-sm text-ink-600">
          Enter the certificate number printed on the product's Trustified seal to confirm it's genuine.
        </Text>

        <Field label="Certificate number" className="mt-6">
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                value={value}
                onChangeText={setValue}
                placeholder="e.g. TRU-2024-00123"
                autoCapitalize="characters"
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                accessibilityLabel="Certificate number"
              />
            </View>
            <Button
              onPress={handleSubmit}
              disabled={!value.trim()}
              loading={isLoading}
              accessibilityLabel="Verify certificate">
              <Search size={16} color="#fff" />
              <Text className="font-semibold text-white">Verify</Text>
            </Button>
          </View>
        </Field>

        {!submitted ? null : isLoading ? (
          <Spinner className="mt-8" />
        ) : isError || (isFetched && !certificate) ? (
          <View className="mt-8 rounded-2xl border border-fail bg-fail-soft p-6">
            <View className="flex-row items-center gap-2">
              <ShieldX size={22} color={colors.fail.strong} />
              <Text className="text-base font-bold text-fail-strong">Not found</Text>
            </View>
            <Text className="mt-2 text-sm text-ink-700">
              We couldn't find a certificate matching "{submitted}". Double-check the number and try again.
            </Text>
          </View>
        ) : certificate ? (
          <View className="mt-8 gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={22} color={colors.brand[700]} />
              <Text className="text-base font-bold text-brand-800">Valid certificate</Text>
            </View>

            <View className="flex-row items-center gap-4">
              {certificate.product_image_url ? (
                <MediaFrame src={certificate.product_image_url} alt={certificate.product_name} aspect="square" rounded="lg" className="size-16" />
              ) : null}
              <View className="flex-1">
                <Text className="text-base font-bold text-ink-900">{certificate.product_name}</Text>
                {certificate.brand?.name ? <Text className="text-sm text-ink-600">{certificate.brand.name}</Text> : null}
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <Badge variant={certificate.status?.toLowerCase() === 'pass' || certificate.status?.toLowerCase() === 'active' ? 'pass' : 'neutral'}>
                {certificate.status}
              </Badge>
              <Badge variant="info">{certificate.type}</Badge>
            </View>

            <View className="gap-1.5 border-t border-brand-200 pt-4">
              <DetailRow label="Certificate #" value={certificate.certificate_number} />
              {certificate.issue_date ? <DetailRow label="Issued" value={certificate.issue_date} /> : null}
              {certificate.expire_date ? <DetailRow label="Expires" value={certificate.expire_date} /> : null}
            </View>
          </View>
        ) : (
          <View className="mt-8">
            <EmptyState title="Enter a certificate number above" />
          </View>
        )}
      </FadeIn>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</Text>
      <Text className="text-sm font-medium text-ink-900">{value}</Text>
    </View>
  );
}
