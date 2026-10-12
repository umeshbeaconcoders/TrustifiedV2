import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { CheckCircle2, Activity } from 'lucide-react-native';
import { useProductTypes } from '../../api';
import { Badge, CardGridSkeleton, MediaFrame } from '../../components/ui';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';

/** RN port of `frontend/apps/web/src/pages/what-gets-certified.tsx` — `useProductTypes()`, split into "certified today" / "coming soon". */
export function WhatGetsCertifiedScreen() {
  const { data, isLoading } = useProductTypes();
  const categories = data?.data ?? [];
  const current = categories.filter((c) => !c.is_upcoming);
  const upcoming = categories.filter((c) => c.is_upcoming);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="px-6 py-10 pb-16">
      <FadeIn>
        <Text className="text-2xl font-bold text-ink-900 dark:text-white">What gets certified</Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          We started with sports nutrition and keep expanding into every category where labels need
          checking.
        </Text>
      </FadeIn>

      {isLoading ? (
        <View className="mt-8">
          <CardGridSkeleton count={6} />
        </View>
      ) : (
        <>
          <View className="mt-8">
            <View style={{ minHeight: 1 }}>
              <FlashList
                data={current}
                keyExtractor={(item) => String(item.id)}
                numColumns={3}
                estimatedItemSize={110}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item: category }) => (
                  <View style={{ flex: 1, paddingHorizontal: 5 }} className="items-center gap-2 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 p-3">
                    <MediaFrame src={category.image_url} alt={category.name} aspect="square" rounded="lg" className="size-12" />
                    <Text className="text-center text-xs font-bold text-ink-900 dark:text-white" numberOfLines={2}>
                      {category.name}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>

          {upcoming.length > 0 ? (
            <View className="mt-10 border-t border-ink-100 dark:border-ink-800 pt-8">
              <View className="mb-4 flex-row flex-wrap items-center gap-2">
                <View className="size-9 items-center justify-center rounded-full bg-ink-100 dark:bg-surface-2">
                  <Activity size={18} color={colors.ink[600]} />
                </View>
                <Text className="text-lg font-bold text-ink-900 dark:text-white">Coming soon</Text>
                <Badge variant="info">Upcoming</Badge>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {upcoming.map((category) => (
                  <View key={category.id} className="rounded-full border border-dashed border-ink-300 bg-ink-50 dark:bg-surface-2 px-4 py-2">
                    <Text className="text-sm font-semibold text-ink-600 dark:text-ink-300">{category.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
