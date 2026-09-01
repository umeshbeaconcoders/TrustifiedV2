import React from 'react';
import { View, Text, ScrollView, Linking, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { 
  ExternalLink,
  ShieldCheck,
  FlaskConical,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { useProduct, useProductReport, mediaUrl } from '../../api';
import { Button, EmptyState, MediaFrame, Spinner, StarRating } from '../../components/ui';
import { BuyLinks } from '../../components/BuyLinks';
import { ReportView } from '../../components/ReportView';
import { FadeIn } from '../../components/motion';
import { formatDate } from '../../lib/format';
import { TrustifiedStamp } from '../../components/icons/TrustifiedStamp';
import type { RootStackParamList } from '../../navigation/types';

// Web trust indicators data inside colored verdict banner
const TRUST_INDICATORS = [
  { icon: ShieldCheck, label: '100% Blind Testing' },
  { icon: FlaskConical, label: 'ISO 17025 Labs' },
  { icon: EyeOff, label: 'No Brand Bias' },
  { icon: Eye, label: 'Transparency' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const { data: productRes, isLoading, isError } = useProduct(slug);
  const { data: reportRes } = useProductReport(slug);

  if (isLoading) return <Spinner className="flex-1" />;

  const product = productRes?.data;
  if (isError || !product) {
    return (
      <View className="flex-1 justify-center px-6">
        <EmptyState
          title="Report not found"
          description="This product may have been removed or the link is outdated."
          action={<Button variant="outline" onPress={() => navigation.goBack()}>Go back</Button>}
        />
      </View>
    );
  }

  const report = reportRes?.data ?? product.latest_test_report ?? null;
  const hasReport = Boolean(report && typeof report === 'object' && 'id' in report);
  
  const isFail = product.status.toLowerCase() === 'fail';
  const isGold = report?.type === 'gold' || product.is_gold;
  const bannerBg = isFail ? 'bg-fail' : isGold ? 'bg-[#b08c2f]' : 'bg-brand-600';

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="pb-16">
      <FadeIn>
        {/* Web aligned Verdict Banner Box */}
        <View className={`m-4 rounded-[24px] p-6 relative overflow-hidden ${bannerBg}`}>
          {/* Rotated background watermark logo */}
          <View className="absolute -right-16 -bottom-16 opacity-10 rotate-12">
            <TrustifiedStamp size={240} />
          </View>

          {/* Top Verdict Pill */}
          <View className="inline-flex flex-row items-center gap-1.5 self-start px-3.5 py-1.5 bg-white/10 rounded-full border border-white/20 mb-5 shadow-sm">
            <TrustifiedStamp size={16} />
            <Text className="text-[10px] font-display font-bold tracking-widest uppercase text-white/90">
              Trustified Verdict
            </Text>
          </View>

          <Text className="text-5xl font-display font-black uppercase text-white tracking-tight drop-shadow-md">
            {product.status}
          </Text>
          
          <Text className="text-xl font-display font-bold text-white mt-3 leading-snug">
            {product.name}
          </Text>

          {/* Brand & Category badges */}
          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            {product.brand ? (
              <Text
                className="text-white font-bold text-xs uppercase tracking-wider bg-white/15 px-2.5 py-1.5 rounded-lg border border-white/10"
                onPress={() => navigation.navigate('BrandDetail', { slug: product.brand!.slug })}>
                {product.brand.name}
              </Text>
            ) : null}
            {product.category ? (
              <Text className="text-white/90 font-semibold text-[10px] uppercase tracking-wider bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                {product.category.name}
              </Text>
            ) : null}
          </View>

          {/* Web styled 4 Trust Indicators inside Verdict Banner */}
          <View className="mt-4 flex-row flex-wrap items-center gap-2">
            {TRUST_INDICATORS.map((i) => {
              const Icon = i.icon;
              return (
                <View key={i.label} className="flex-row items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <Icon size={10} color="#fff" />
                  <Text className="text-[9px] font-bold text-white uppercase tracking-wider">{i.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Detailed metadata panel (All 5 web dates + Lab) */}
          {hasReport && report ? (
            <View className="mt-6 gap-3 rounded-2xl bg-black/20 border border-white/20 p-5 shadow-lg">
              <MetaRow label="Batch No." value={report.batch_no || '—'} />
              <MetaRow label="Mfg Date" value={report.mfg_date ? formatDate(report.mfg_date) : '—'} />
              <MetaRow label="Exp Date" value={report.exp_date ? formatDate(report.exp_date) : '—'} />
              <MetaRow label="Tested Date" value={report.published_at ? formatDate(report.published_at) : '—'} />
              <MetaRow label="Valid Till" value={report.exp_date ? formatDate(report.exp_date) : '—'} />
              <MetaRow 
                label="Laboratory" 
                value={
                  report.tested_by 
                    ? `${report.tested_by}${report.lab_accreditation ? ` (${report.lab_accreditation})` : ''}` 
                    : 'Accredited partner lab'
                } 
              />

              {report.report_pdf_url ? (
                <Button
                  onPress={() => Linking.openURL(mediaUrl(report.report_pdf_url) ?? '')}
                  className="mt-2 bg-white rounded-xl py-3 justify-center items-center flex-row gap-2 active:opacity-90 shadow-sm"
                  accessibilityLabel="View lab PDF"
                >
                  <ExternalLink size={16} color={isFail ? '#dc2626' : isGold ? '#b08c2f' : '#1c7a2d'} />
                  <Text 
                    className="font-bold text-sm" 
                    style={{ color: isFail ? '#dc2626' : isGold ? '#b08c2f' : '#1c7a2d' }}
                  >
                    View Lab PDF
                  </Text>
                </Button>
              ) : null}
            </View>
          ) : null}
        </View>

        <View className="px-4">
          <MediaFrame src={product.image_url} alt={product.name} aspect="square" rounded="2xl" className="mb-4" />

          {/* Product info details card */}
          <View className="mb-6 rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
            <Text className="mb-4 font-display font-bold text-ink-900 text-base">Product Info</Text>
            
            <View className="gap-3">
              {product.category ? (
                <View>
                  <Text className="text-xs text-ink-500 font-bold">Category</Text>
                  <Text className="text-sm font-semibold text-ink-900 mt-0.5">{product.category.name}</Text>
                </View>
              ) : null}

              {product.reviews_count > 0 ? (
                <View>
                  <Text className="text-xs text-ink-500 font-bold">Community rating</Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <StarRating value={product.rating_avg} size={14} />
                    <Text className="text-sm text-ink-900 font-bold">
                      {product.rating_avg.toFixed(1)} ({product.reviews_count} reviews)
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            <BuyLinks links={product.buy_links} className="mt-5" />
            
          </View>

          {/* Trustified Test Reports card (from web left column) */}
          {product.test_reports && product.test_reports.length > 0 ? (
            <View className="mb-6 rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
              <View className="flex-row items-center gap-2 mb-4">
                <TrustifiedStamp size={24} />
                <Text className="font-display font-bold text-ink-900 text-base">
                  Trustified Test Reports
                </Text>
              </View>
              <View className="gap-3">
                {product.test_reports.map((rep) => {
                  const isActiveReport = rep.id === report?.id;
                  return (
                    <Pressable
                      key={rep.id}
                      onPress={() => navigation.navigate('ReportDetail', { slug: product.slug })}
                      className={`rounded-xl border p-3 ${isActiveReport ? 'border-brand-300 bg-brand-50/30' : 'border-ink-100 bg-white active:bg-ink-50'}`}
                    >
                      <Text className={`text-xs font-bold ${isActiveReport ? 'text-brand-700' : 'text-ink-800'}`}>
                        Trustified Report — {rep.batch_no || 'N/A'}
                      </Text>
                      <Text className="text-[10px] text-ink-400 font-bold mt-1">
                        {rep.published_at ? formatDate(rep.published_at) : 'N/A'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* SUMMARY OF TEST RESULTS Header */}
          <View className="flex-row items-center gap-3 mb-5 mt-2">
            <TrustifiedStamp size={32} />
            <Text className="text-lg font-display font-bold text-ink-900 tracking-tight">
              SUMMARY OF TEST RESULTS
            </Text>
          </View>

          {hasReport && report ? (
            <ReportView report={report} hideMetaStrip />
          ) : (
            <EmptyState
              title="Report details coming soon"
              description="The verdict is in, but the detailed parameter breakdown hasn't been published yet."
            />
          )}
        </View>
      </FadeIn>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-white/20 pb-2.5">
      <Text className="text-xs text-white/80 font-bold">{label}</Text>
      <Text className="text-xs font-bold text-white max-w-[75%] text-right">{value}</Text>
    </View>
  );
}
