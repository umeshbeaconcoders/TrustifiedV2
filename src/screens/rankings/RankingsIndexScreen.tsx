import React from 'react';
import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Trophy } from 'lucide-react-native';
import { useRankingCategories } from '../../api';
import { Card, CardGridSkeleton, EmptyState, MediaFrame } from '../../components/ui';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

/** RN port of `frontend/apps/web/src/pages/rankings-index.tsx` — list of ranking categories, tap through to a category's ranked product list. */
export function RankingsIndexScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, isError } = useRankingCategories();
  const categories = data?.data ?? [];

  return (
    <View className="flex-1 bg-white p-4">
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <EmptyState title="Couldn't load rankings" description="The server didn't respond. Please retry in a moment." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Trophy size={28} color={colors.ink[300]} />}
          title="No ranking categories yet"
          description="Check back once category rankings are published."
        />
      ) : (
        <FlashList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          estimatedItemSize={84}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item: category }) => (
            <Card
              pressable
              onPress={() => navigation.navigate('RankingsCategory', { slug: category.slug })}
              className="flex-row items-center gap-4 p-3">
              <MediaFrame src={category.image_url} alt={category.name} aspect="square" rounded="lg" className="size-14" />
              <View className="flex-1">
                <Text className="text-base font-bold text-ink-900">{category.name}</Text>
                {category.description ? (
                  <Text className="mt-0.5 text-xs text-ink-500" numberOfLines={2}>
                    {category.description}
                  </Text>
                ) : null}
              </View>
              <ChevronRight size={20} color={colors.ink[400]} />
            </Card>
          )}
        />
      )}
    </View>
  );
}
