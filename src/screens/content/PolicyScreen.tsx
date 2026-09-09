import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePolicy } from '../../api';
import { EmptyState, Skeleton } from '../../components/ui';
import { FadeIn } from '../../components/motion';
import type { RootStackParamList } from '../../navigation/types';

const titles: Record<string, string> = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  disclaimer: 'Disclaimer',
};

/**
 * RN port of `frontend/apps/web/src/pages/policy.tsx`. Web renders
 * `policy.content`/`.body` as sanitized HTML (`dangerouslySetInnerHTML`);
 * there's no markdown/HTML renderer installed in this app and it's not
 * worth adding a dependency for one screen, so we strip tags to plain text
 * and render it in a ScrollView instead.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type Props = NativeStackScreenProps<RootStackParamList, 'Policy'>;

export function PolicyScreen({ route }: Props) {
  const { slug, title: paramTitle } = route.params;
  const { data, isLoading, isError } = usePolicy(slug);
  const policy = data?.data;
  const title = paramTitle ?? policy?.title ?? titles[slug] ?? 'Policy';
  const rawHtml = policy?.content ?? policy?.body ?? '';
  const plainText = useMemo(() => stripHtml(rawHtml), [rawHtml]);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-surface-1" contentContainerClassName="px-6 py-10">
      <FadeIn>
        <Text className="text-2xl font-bold text-ink-900 dark:text-white">{title}</Text>

        {isLoading ? (
          <View className="mt-8 gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} height={14} className={i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-2/3'} />
            ))}
          </View>
        ) : isError || !plainText ? (
          <EmptyState
            title="Content unavailable"
            description="This policy hasn't been published yet."
          />
        ) : (
          <Text className="mt-6 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{plainText}</Text>
        )}
      </FadeIn>
    </ScrollView>
  );
}
