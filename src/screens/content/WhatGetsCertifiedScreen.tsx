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
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-10 pb-16">
      <FadeIn>
        <Text className="text-2xl font-bold text-ink-900">What gets certified</Text>
        <Text className="mt-3 text-sm leading-relaxed text-ink-600">
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
            <View className="mb-4 flex-row items-center gap-2">
              <View className="size-9 items-center justify-center rounded-full bg-brand-50">
                <CheckCircle2 size={18} color={colors.brand[600]} />
              </View>
              <Text className="text-lg font-bold text-ink-900">Certified today</Text>
            </View>
            <View style={{ minHeight: 1 }}>
              <FlashList
                data={current}
                keyExtractor={(item) => String(item.id)}
                numColumns={3}
                estimatedItemSize={110}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item: category }) => (
                  <View style={{ flex: 1, paddingHorizontal: 5 }} className="items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3">
                    <MediaFrame src={category.image_url} alt={category.name} aspect="square" rounded="lg" className="size-12" />
                    <Text className="text-center text-xs font-bold text-ink-900" numberOfLines={2}>
                      {category.name}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>

          {upcoming.length > 0 ? (
            <View className="mt-10 border-t border-ink-100 pt-8">
              <View className="mb-4 flex-row flex-wrap items-center gap-2">
                <View className="size-9 items-center justify-center rounded-full bg-ink-100">
                  <Activity size={18} color={colors.ink[600]} />
                </View>
                <Text className="text-lg font-bold text-ink-900">Coming soon</Text>
                <Badge variant="info">Upcoming</Badge>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {upcoming.map((category) => (
                  <View key={category.id} className="rounded-full border border-dashed border-ink-300 bg-ink-50 px-4 py-2">
                    <Text className="text-sm font-semibold text-ink-600">{category.name}</Text>
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
