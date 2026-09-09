import React from 'react';
import { View, Text, ScrollView, Linking, Pressable, Image, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  PlayCircle,
  FileText,
  ShieldCheck,
  FlaskConical,
  Eye,
  EyeOff,
  ChevronRight,
  HelpCircle,
  ZoomIn
} from 'lucide-react-native';
import { useProduct, useReviews } from '../../api';
import { Button, EmptyState, MediaFrame, Skeleton, StarRating, StatusBadge, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui';
import { BuyLinks } from '../../components/BuyLinks';
import { ImageLightbox } from '../../components/ImageLightbox';
import { ReviewForm } from '../../components/ReviewForm';
import { ReviewList } from '../../components/ReviewList';
import { FadeIn } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { extractYoutubeId, formatDate } from '../../lib/format';
import { usePullToRefresh } from '../../lib/usePullToRefresh';
import type { RootStackParamList } from '../../navigation/types';

// Web trust indicators data
const TRUST_INDICATORS = [
  { iconName: 'ShieldCheck', label: '100% Blind Testing' },
  { iconName: 'FlaskConical', label: 'ISO 17025 Accredited Labs' },
  { iconName: 'EyeOff', label: 'No Brand Visibility' },
  { iconName: 'Eye', label: 'Complete Transparency' },
];

function getIndicatorIcon(name: string) {
  switch (name) {
    case 'ShieldCheck': return <ShieldCheck size={16} color="#2ab841" />;
    case 'FlaskConical': return <FlaskConical size={16} color="#2ab841" />;
    case 'EyeOff': return <EyeOff size={16} color="#2ab841" />;
    case 'Eye': return <Eye size={16} color="#2ab841" />;
    default: return null;
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const { data: productRes, isLoading, isError, refetch: refetchProduct } = useProduct(slug);
  const { data: reviewsRes, refetch: refetchReviews } = useReviews(slug, { sort: 'high_to_low', per_page: 20 });
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const { refreshing, onRefresh } = usePullToRefresh([refetchProduct, refetchReviews]);

  if (isLoading) {
    return (
      <View className="flex-1 gap-4 bg-white dark:bg-surface-1 p-4">
        <Skeleton className="aspect-square w-full" />
        <Skeleton height={16} className="w-1/3" />
        <Skeleton height={28} className="w-3/4" />
      </View>
    );
  }

  const product = productRes?.data;
  if (isError || !product) {
    return (
      <View className="flex-1 justify-center px-6">
        <EmptyState
          title="Product not found"
          action={<Button variant="outline" onPress={() => navigation.goBack()}>Go back</Button>}
        />
      </View>
    );
  }

  const images = [product.image_url, ...product.gallery].filter((s): s is string => Boolean(s));
  const reviews = reviewsRes?.data ?? [];
  const reviewVideoId = extractYoutubeId(product.review_video_url);
  const testVideoId = extractYoutubeId(product.test_video_url);

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-surface-1"
      contentContainerClassName="pb-16"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand[500]]} />}
    >
      <FadeIn>
        <View className="p-4">
          {/* Main Product Image — tap to open the full-screen zoom/pan viewer */}
          <Pressable
            onPress={() => images[selectedImageIndex] && setLightboxOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="View full-size image"
          >
            <MediaFrame src={images[selectedImageIndex]} alt={product.name} aspect="square" rounded="2xl" />
            {images[selectedImageIndex] ? (
              <View className="absolute bottom-3 right-3 size-9 rounded-full bg-ink-900/70 items-center justify-center">
                <ZoomIn size={16} color="#fff" />
              </View>
            ) : null}
          </Pressable>

          {/* Dynamic Image Gallery Slider (Circular Thumbnails) */}
          {images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 mt-3 pb-2 px-1">
              {images.map((img, idx) => {
                const active = idx === selectedImageIndex;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedImageIndex(idx)}
                    className={`size-16 rounded-xl overflow-hidden border-2 bg-white ${active ? 'border-brand-600 shadow-md' : 'border-ink-200'}`}
                  >
                    <Image source={{ uri: img }} className="w-full h-full object-cover" />
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {product.brand ? (
            <Text
              className="mt-5 text-xs font-display font-bold uppercase tracking-wider text-brand-700"
              onPress={() => navigation.navigate('BrandDetail', { slug: product.brand!.slug })}>
              {product.brand.name}
            </Text>
          ) : null}
          <Text className="mt-1.5 text-2xl font-display font-extrabold text-ink-900 dark:text-white leading-snug">{product.name}</Text>

          <View className="mt-3 flex-row flex-wrap items-center gap-3">
            {product.status !== 'untested' ? <StatusBadge status={product.status} isGold={product.is_gold} /> : null}
            {product.reviews_count > 0 ? (
              <View className="flex-row items-center gap-1.5">
                <StarRating value={product.rating_avg} size={14} />
                <Text className="text-sm text-ink-600 dark:text-ink-300 font-bold">
                  {product.rating_avg.toFixed(1)} ({product.reviews_count} reviews)
                </Text>
              </View>
            ) : null}
          </View>

          {/* Web Trust Indicators Grid */}
          <View className="mt-6 flex-row flex-wrap justify-between gap-y-2">
            {TRUST_INDICATORS.map((i) => (
              <View key={i.label} className="w-[48%] flex-row items-center gap-2.5 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
                <View className="size-8 rounded-full bg-brand-100 items-center justify-center shrink-0">
                  {getIndicatorIcon(i.iconName)}
                </View>
                <Text className="text-[10px] font-bold leading-tight text-ink-800 dark:text-ink-100 flex-1">{i.label}</Text>
              </View>
            ))}
          </View>

          {/* Web Trust explanation statement */}
          <Text className="mt-4 text-xs leading-relaxed text-ink-600 dark:text-ink-300 font-semibold bg-ink-50 dark:bg-surface-2 p-4 rounded-xl border border-ink-100 dark:border-ink-800">
            At Trustified, we buy products like you do, test them in accredited labs, and share the truth — no brand influence, no paid reviews.
          </Text>

          {product.description ? (
            <Text className="mt-5 text-sm leading-relaxed text-ink-700 dark:text-ink-200 font-medium">{product.description}</Text>
          ) : null}

          <BuyLinks links={product.buy_links} className="mt-6" />

          {/* Lab Test Reports panel redesigned like web */}
          <View className="mt-8 rounded-3xl border-2 border-brand-200 bg-brand-50/40 p-5 shadow-sm">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-full bg-brand-600 items-center justify-center shadow-md">
                <FileText size={18} color="#fff" />
              </View>
              <Text className="text-lg font-display font-bold text-ink-900 dark:text-white">Trustified Lab Test Reports</Text>
            </View>

            {/* Check if product is expired */}
            {product.status.toLowerCase() === 'expired' ? (
              <View className="flex-row items-center gap-3 rounded-2xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-surface-2 p-4 mt-3">
                <HelpCircle size={18} color={colors.ink[500]} />
                <Text className="text-xs font-bold text-ink-600 dark:text-ink-300 flex-1 leading-relaxed">
                  This certification has expired — the detailed report is no longer published.
                </Text>
              </View>
            ) : product.test_reports && product.test_reports.length > 0 ? (
              <View className="gap-1">
                {product.test_reports.map((rep, index) => {
                  const isLatest = index === 0;
                  const typeLabel = rep.type === 'gold' ? 'Gold' : rep.type === 'nmr' ? 'NMR' : 'Standard';
                  return (
                    <Pressable
                      key={rep.id}
                      onPress={() => navigation.navigate('ReportDetail', { slug: product.slug, reportId: rep.id })}
                      className="relative rounded-2xl border border-brand-200 bg-white dark:bg-surface-1 p-5 mt-4 shadow-sm active:opacity-95 overflow-visible items-center"
                    >
                      {isLatest ? (
                        <View className="absolute -top-2.5 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 shadow-sm">
                          <Text className="text-[10px] font-bold uppercase tracking-wider text-white">Latest</Text>
                        </View>
                      ) : null}

                      {/* Centered Beaker Icon */}
                      <View className="size-14 items-center justify-center rounded-full bg-brand-50 border border-brand-100 mb-2">
                        <FlaskConical size={24} color="#1f9a35" />
                      </View>

                      {/* Centered Report Title */}
                      <Text className="font-display font-bold text-brand-700 text-base text-center leading-snug">
                        Trustified Report — {rep.batch_no || 'N/A'}
                      </Text>

                      {/* Centered Metadata Details */}
                      <View className="mt-2.5 gap-1 items-center">
                        <Text className="text-xs text-ink-500 dark:text-ink-400 font-bold text-center">
                          Type:{' '}
                          <Text className="text-ink-800 dark:text-ink-100 font-extrabold">{typeLabel}</Text>
                          {'    '}Tested:{' '}
                          <Text className="text-ink-800 dark:text-ink-100 font-extrabold">
                            {rep.published_at ? formatDate(rep.published_at) : 'N/A'}
                          </Text>
                        </Text>
                        
                        {rep.exp_date ? (
                          <Text className="text-xs text-ink-500 dark:text-ink-400 font-bold text-center">
                            Valid till:{' '}
                            <Text className="text-ink-800 dark:text-ink-100 font-extrabold">{formatDate(rep.exp_date)}</Text>
                          </Text>
                        ) : null}

                        <Text className="text-xs text-ink-500 dark:text-ink-400 font-bold text-center">
                          Lab:{' '}
                          <Text className="text-ink-800 dark:text-ink-100 font-extrabold">
                            {rep.tested_by || 'Accredited partner lab'}
                          </Text>
                        </Text>
                      </View>

                      {/* Stretched/Centered Status Action Row at the bottom */}
                      <View className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800 w-full flex-row items-center justify-center gap-2">
                        <StatusBadge 
                          status={rep.status} 
                          size="sm" 
                          isGold={rep.status.toLowerCase() === 'pass' && (rep.type === 'gold' || product.is_gold)} 
                        />
                        <ChevronRight size={16} color="#c1cec8" />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Button 
                variant="outline" 
                onPress={() => navigation.navigate('ReportDetail', { slug: product.slug })} 
                className="w-full mt-3 rounded-2xl"
                accessibilityLabel="See latest lab test report"
              >
                <FileText size={16} color={colors.ink[800]} />
                <Text className="ml-1 font-semibold text-ink-800 dark:text-ink-100">See latest lab test report</Text>
              </Button>
            )}
          </View>

          {/* Videos segment */}
          {reviewVideoId || testVideoId ? (
            <View className="mt-8 gap-3">
              <Text className="text-lg font-display font-bold text-ink-900 dark:text-white">Videos</Text>
              {reviewVideoId ? (
                <VideoThumb id={reviewVideoId} label="Review Video" />
              ) : null}
              {testVideoId ? <VideoThumb id={testVideoId} label="Live Test Video" /> : null}
            </View>
          ) : null}
        </View>

        <View className="mt-4 px-4">
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="write">Write a review</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews">
              <ReviewList reviews={reviews} />
            </TabsContent>
            <TabsContent value="write">
              <ReviewForm slug={product.slug} onSubmitted={() => void refetchReviews()} />
            </TabsContent>
          </Tabs>
        </View>
      </FadeIn>

      <ImageLightbox
        visible={lightboxOpen}
        src={images[selectedImageIndex]}
        alt={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    </ScrollView>
  );
}

function VideoThumb({ id, label }: { id: string; label: string }) {
  return (
    <Button
      variant="outline"
      className="h-auto justify-start py-3.5 rounded-2xl border-ink-200 dark:border-ink-700"
      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${id}`)}
      accessibilityLabel={label}>
      <PlayCircle size={20} color="#FF0000" />
      <Text className="ml-2 font-semibold text-ink-800 dark:text-ink-100">{label}</Text>
    </Button>
  );
}
