import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { Button, Spinner, EmptyState } from '../../components/ui';
import { useRequireAuth } from '../../navigation/useRequireAuth';

interface ExportData {
  profile: Record<string, unknown>;
  reviews: Record<string, unknown>[];
}

/** GET /account/export (auth:sanctum) — new profile action per Section 1's "add" note. */
export function ExportDataScreen() {
  const { isChecking, isAuthenticated } = useRequireAuth('ExportData');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['account', 'export'],
    queryFn: () => api.get<{ data: ExportData }>('/account/export'),
    enabled: isAuthenticated,
  });

  if (isChecking || isLoading) return <Spinner className="flex-1" />;

  if (isError || !data) {
    return (
      <View className="flex-1 justify-center px-6">
        <EmptyState title="Couldn't load your data" description="Please try again." action={<Button onPress={() => void refetch()}>Retry</Button>} />
      </View>
    );
  }

  const { profile, reviews } = data.data;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-8">
      <Text className="text-lg font-bold text-ink-900">Your profile</Text>
      <View className="mt-3 rounded-xl bg-ink-50 p-4">
        {Object.entries(profile).map(([key, value]) => (
          <View key={key} className="flex-row justify-between py-1">
            <Text className="text-xs uppercase tracking-wide text-ink-500">{key}</Text>
            <Text className="text-sm font-medium text-ink-900">{String(value ?? '—')}</Text>
          </View>
        ))}
      </View>

      <Text className="mt-8 text-lg font-bold text-ink-900">Your reviews ({reviews.length})</Text>
      {reviews.length === 0 ? (
        <Text className="mt-2 text-sm text-ink-500">No reviews yet.</Text>
      ) : (
        <View className="mt-3 gap-3">
          {reviews.map((review, i) => (
            <View key={i} className="rounded-xl border border-ink-100 p-4">
              <Text className="text-sm text-ink-700">{String(review.review_text ?? '(no text)')}</Text>
              <Text className="mt-1 text-xs text-ink-400">{String(review.created_at ?? '')}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
