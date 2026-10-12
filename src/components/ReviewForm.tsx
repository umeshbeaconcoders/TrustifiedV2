import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PartyPopper } from 'lucide-react-native';
import { ApiError, useSubmitReview } from '../api';
import { useIsAuthenticated } from '../stores/auth';
import { Button, StarInput, Textarea } from './ui';
import type { RootStackParamList } from '../navigation/types';

const requiredAxes = [
  ['quality', 'Quality'],
  ['result', 'Result / effectiveness'],
  ['value_for_money', 'Value for money'],
  ['packaging', 'Packaging'],
  ['digestion', 'Digestion'],
  ['delivering_time', 'Delivery time'],
  ['customer_support', 'Customer support'],
] as const;

const optionalAxes = [
  ['taste', 'Taste'],
  ['mixability', 'Mixability'],
] as const;

type RatingKey = (typeof requiredAxes)[number][0] | (typeof optionalAxes)[number][0];

/**
 * RN port of `frontend/apps/web/src/components/review-form.tsx`. Media
 * upload (photo/video attach) is intentionally left as a fast-follow here —
 * it needs `react-native-image-picker` (not in Phase 0's dependency list)
 * to build a FormData `media[]` payload from a native picker; the text +
 * rating submission path (the primary flow) is fully wired to
 * `useSubmitReview`.
 */
export function ReviewForm({ slug, onSubmitted }: { slug: string; onSubmitted?: () => void }) {
  const isAuthenticated = useIsAuthenticated();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const submitReview = useSubmitReview(slug);
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    quality: 0,
    result: 0,
    value_for_money: 0,
    packaging: 0,
    digestion: 0,
    delivering_time: 0,
    customer_support: 0,
    taste: 0,
    mixability: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState<string | undefined>();

  if (!isAuthenticated) {
    return (
      <View className="items-center rounded-2xl border border-dashed border-ink-300 bg-ink-50 dark:bg-surface-2 p-8">
        <Text className="text-center text-sm text-ink-600 dark:text-ink-300">Sign in to write a review for this product.</Text>
        <Button
          variant="outline"
          className="mt-4"
          onPress={() => navigation.navigate('Login', { redirectTo: 'ProductDetail' as never })}
          accessibilityLabel="Log in to review">
          Log in to review
        </Button>
      </View>
    );
  }

  function setRating(key: RatingKey, value: number) {
    if (error) setError(undefined);
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setError(undefined);
    const missing = requiredAxes.filter(([key]) => ratings[key] === 0);
    if (missing.length > 0) {
      setError(`Please rate: ${missing.map(([, label]) => label).join(', ')}`);
      return;
    }

    const formData = new FormData();
    for (const [key] of requiredAxes) formData.append(key, String(ratings[key]));
    if (ratings.taste > 0) formData.append('taste', String(ratings.taste));
    if (ratings.mixability > 0) formData.append('mixability', String(ratings.mixability));
    if (reviewText.trim()) formData.append('review_text', reviewText.trim());

    submitReview.mutate(formData, {
      onSuccess: () => {
        setReviewText('');
        setError(undefined);
        setRatings({
          quality: 0,
          result: 0,
          value_for_money: 0,
          packaging: 0,
          digestion: 0,
          delivering_time: 0,
          customer_support: 0,
          taste: 0,
          mixability: 0,
        });
        onSubmitted?.();
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          const serverMsg = err.firstError() || err.message;
          setError(serverMsg);
        } else {
          setError('Could not submit review. Please try again.');
        }
      },
    });
  }

  return (
    <View className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-surface-1 p-4">
      <Text className="text-lg font-semibold text-ink-900 dark:text-white">Write a review</Text>
      <View className="mt-2">
        {requiredAxes.map(([key, label]) => (
          <StarInput key={key} label={label} value={ratings[key]} onChange={(v) => setRating(key, v)} />
        ))}
        {optionalAxes.map(([key, label]) => (
          <StarInput key={key} label={`${label} (optional)`} value={ratings[key]} onChange={(v) => setRating(key, v)} />
        ))}
      </View>

      <Textarea
        placeholder="Share your experience with this product…"
        value={reviewText}
        maxLength={5000}
        onChangeText={(text) => {
          setReviewText(text);
          if (error) setError(undefined);
        }}
        className="mt-4"
        accessibilityLabel="Review text"
      />

      {error ? <Text className="mt-3 text-sm font-medium text-fail-strong">{error}</Text> : null}

      <Button className="mt-4" loading={submitReview.isPending} onPress={submit} accessibilityLabel="Submit review">
        <PartyPopper size={16} color="#fff" />
        <Text className="ml-1 font-semibold text-white">Submit review</Text>
      </Button>
    </View>
  );
}
