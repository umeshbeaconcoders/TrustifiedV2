import React from 'react';
import { View, Text } from 'react-native';
import { EmptyState, StarRating, Badge } from './ui';
import type { Review } from '../api/types';
import { formatDate } from '../lib/format';

/** RN port of `frontend/apps/web/src/components/review-list.tsx`. */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" description="Be the first to share your experience." />;
  }
  return (
    <View className="gap-4">
      {reviews.map((review) => (
        <View key={review.id} className="rounded-2xl border border-ink-100 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-ink-900">{review.user.name ?? 'Trustified user'}</Text>
            {review.is_verified_purchase ? <Badge variant="pass">Verified</Badge> : null}
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            <StarRating value={review.average_rating} size={13} />
            <Text className="text-xs text-ink-400">{formatDate(review.created_at)}</Text>
          </View>
          {review.review_text ? <Text className="mt-2 text-sm text-ink-700">{review.review_text}</Text> : null}
          {review.brand_reply ? (
            <View className="mt-3 rounded-xl bg-ink-50 p-3">
              <Text className="text-xs font-bold uppercase tracking-wide text-ink-500">Brand reply</Text>
              <Text className="mt-1 text-sm text-ink-700">{review.brand_reply}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
