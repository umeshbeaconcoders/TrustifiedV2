import React from 'react';
import { View, Text, Linking } from 'react-native';
import { FileText, ShieldCheck, FlaskConical, XCircle, CheckCircle } from 'lucide-react-native';
import { mediaUrl, parseParameterGroups, parseReportSummary } from '../api';
import type { ReportParameterGroup, TestReport } from '../api/types';
import { Badge, Button, MediaFrame } from './ui';
import { ScrollReveal } from './motion';
import { formatDate } from '../lib/format';
import { colors } from '../theme/tokens';

export function ReportView({ report, hideMetaStrip = false }: { report: TestReport; hideMetaStrip?: boolean }) {
  const summaryBlocks = parseReportSummary(report.summary);
  const groups = parseParameterGroups(report.parameter_groups);
  const pdfUrl = mediaUrl(report.report_pdf_url);

  return (
    <View className="gap-6">
      {!hideMetaStrip ? (
        <View className="flex-row flex-wrap gap-4 rounded-2xl border border-ink-200 bg-white p-5">
          <MetaItem label="Batch no." value={report.batch_no ?? '—'} />
          <MetaItem label="Mfg date" value={formatDate(report.mfg_date)} />
          <MetaItem label="Exp date" value={formatDate(report.exp_date)} />
          <MetaItem label="Published" value={formatDate(report.published_at)} />
          {report.tested_by || report.lab_accreditation ? (
            <View className="w-full border-t border-ink-100 pt-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-ink-500">Laboratory</Text>
              <Text className="mt-1 text-sm text-ink-700">
                {report.tested_by ?? 'Accredited partner lab'}
                {report.lab_accreditation ? `  ·  ${report.lab_accreditation}` : ''}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Group Overview Pills (from web) */}
      {groups.length > 0 ? (
        <View className="flex-row flex-wrap gap-3 mb-2">
          {groups.map((group, idx) => {
            const title = group.name ?? group.title ?? group.group ?? 'Parameters';
            const rows = group.rows ?? group.parameters ?? [];
            const groupStatus = (group.status ?? 'na').toLowerCase();
            const isPass = groupStatus === 'pass' || groupStatus === 'passed';
            const isFail = groupStatus === 'fail' || groupStatus === 'failed';
            const badgeVariant = isPass ? 'pass' : isFail ? 'fail' : 'neutral';
            
            return (
              <View 
                key={idx} 
                className="flex-1 min-w-[140px] flex-row items-center gap-2.5 rounded-2xl border border-ink-200 bg-white p-3.5 shadow-sm"
              >
                <View className="size-10 rounded-full items-center justify-center bg-pass-soft">
                  {group.group_type === 'amino_acid' ? (
                    <FlaskConical size={18} color={colors.pass.strong} />
                  ) : (
                    <ShieldCheck size={18} color={colors.pass.strong} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 justify-between">
                    <Text className="text-xs font-bold text-ink-900 flex-1 truncate" numberOfLines={1}>
                      {title}
                    </Text>
                    {group.status && (
                      <Badge variant={badgeVariant}>
                        {isPass ? 'Pass' : isFail ? 'Fail' : group.status}
                      </Badge>
                    )}
                  </View>
                  <Text className="text-[10px] text-ink-500 font-semibold mt-0.5">
                    {rows.length} parameter{rows.length === 1 ? '' : 's'} tested
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Main Parameters lists/cards */}
      {groups.length > 0 ? (
        <View className="gap-6">
          {groups.map((group, i) => (
            <ScrollReveal key={i}>
              <ParameterGroupView group={group} />
            </ScrollReveal>
          ))}
        </View>
      ) : null}

      {summaryBlocks.length > 0 ? (
        <View className="gap-8">
          {summaryBlocks.map((block, i) => {
            if (block.type === 'file') {
              const images = block.value.split(',').map((s) => s.trim()).filter(Boolean);
              if (images.length === 0) return null;
              return (
                <ScrollReveal key={`${block.title}-${i}`}>
                  <Text className="mb-3 text-base font-semibold text-ink-900">{block.title}</Text>
                  <View className="gap-3">
                    {images.map((src) => (
                      <MediaFrame key={src} src={src} alt={`${block.title} test chart`} aspect="video" rounded="xl" />
                    ))}
                  </View>
                </ScrollReveal>
              );
            }
            const text = block.value?.replace(/<[^>]+>/g, '').trim();
            if (!text || text.length <= 1) return null;
            return (
              <ScrollReveal key={`${block.title}-${i}`}>
                <Text className="mb-2 text-base font-semibold text-ink-900">{block.title}</Text>
                <Text className="text-sm leading-relaxed text-ink-700">{text}</Text>
              </ScrollReveal>
            );
          })}
        </View>
      ) : report.summary && report.summary.trim() ? (
        <ScrollReveal>
          <Text className="mb-2 text-base font-semibold text-ink-900">Summary / Notes</Text>
          <Text className="text-sm leading-relaxed text-ink-700">{report.summary.trim()}</Text>
        </ScrollReveal>
      ) : null}

      {!hideMetaStrip && pdfUrl ? (
        <Button variant="outline" onPress={() => Linking.openURL(pdfUrl)} accessibilityLabel="View full lab report PDF">
          <FileText size={16} color={colors.ink[800]} />
          <Text className="ml-1 font-semibold text-ink-800">View full lab report (PDF)</Text>
        </Button>
      ) : null}
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-[47%]">
      <Text className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</Text>
      <Text className="mt-1 text-sm font-semibold text-ink-900">{value}</Text>
    </View>
  );
}

function ParameterGroupView({ group }: { group: ReportParameterGroup }) {
  const rows = group.rows ?? group.parameters ?? [];
  const title = group.name ?? group.title ?? group.group ?? 'Parameters';
  const chartImage = group.chart_image_url ? mediaUrl(group.chart_image_url) : null;

  if (rows.length === 0 && !chartImage) return null;

  const isMacroAccuracy = title.toLowerCase().includes('macro') || group.group_type === 'parameter';

  return (
    <View className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      {/* Header */}
      <View className="border-b border-ink-100 bg-ink-50 px-4 py-3 flex-row justify-between items-center">
        <Text className="text-base font-display font-bold text-ink-900">{title}</Text>
        {group.status && (
          <Badge variant={group.status.toLowerCase() === 'pass' ? 'pass' : group.status.toLowerCase() === 'fail' ? 'fail' : 'neutral'}>
            {group.status.toUpperCase()}
          </Badge>
        )}
      </View>
      {chartImage ? <MediaFrame src={chartImage} alt={`${title} chart`} aspect="video" rounded="lg" className="m-3" /> : null}

      {/* Render Macro Accuracy cards if it is Macro Accuracy group */}
      {isMacroAccuracy ? (
        <View className="p-4 gap-4 bg-ink-50/10">
          {rows.map((row, i) => {
            const result = (row.result_status ?? row.result ?? row.status ?? '').toLowerCase();
            const paramName = row.title ?? row.name ?? row.parameter ?? 'Parameter';
            const claimedVal = row.claimed_value ?? row.claimed ?? '—';
            const testedVal = row.tested_value ?? row.tested ?? '—';
            const unit = row.unit ?? 'g';
            const isPass = result === 'pass' || result === 'passed';

            const claimedNum = parseFloat(String(claimedVal)) || 0;
            const testedNum = parseFloat(String(testedVal)) || 0;
            const maxVal = Math.max(claimedNum, testedNum, 1);
            const claimedPct = (claimedNum / maxVal) * 100;
            const testedPct = (testedNum / maxVal) * 100;

            return (
              <View key={i} className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
                {/* Card Title & Values */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    {isPass ? (
                      <CheckCircle size={32} fill="#2ab841" color="#fff" />
                    ) : (
                      <XCircle size={32} fill="#dc2626" color="#fff" />
                    )}
                    <Text className="text-sm font-display font-bold text-ink-900">{paramName}</Text>
                  </View>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-base font-extrabold text-ink-900">{testedVal} {unit}</Text>
                    <Text className="text-[10px] font-bold text-ink-400">claimed {claimedVal}{unit}</Text>
                  </View>
                </View>

                {/* Progress bars layout claimed vs tested */}
                <View className="mt-4 gap-2 pt-2 border-t border-ink-100/50">
                  <View className="flex-row items-center">
                    <Text className="w-14 text-[10px] font-bold text-ink-500">Claimed</Text>
                    <View className="flex-1 h-2.5 bg-ink-100 rounded-full overflow-hidden">
                      <View className="h-full bg-ink-400" style={{ width: `${claimedPct}%` }} />
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="w-14 text-[10px] font-bold text-ink-500">Tested</Text>
                    <View className="flex-1 h-2.5 bg-ink-100 rounded-full overflow-hidden">
                      <View 
                        className={`h-full ${isPass ? 'bg-brand-500' : 'bg-fail'}`} 
                        style={{ width: `${testedPct}%` }} 
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        /* Render other groups (e.g. Amino Spiking) as a clean list table */
        rows.length > 0 ? (
          <View className="divide-y divide-ink-100">
            <View className="flex-row bg-ink-50/30 px-4 py-2.5">
              <HeaderCell label="PARAMETER" flex={2} className="pr-4" />
              <HeaderCell label="RESULT VALUE" flex={1.5} />
              <HeaderCell label="STATUS" flex={1} />
            </View>
            {rows.map((row, i) => {
              const result = (row.result_status ?? row.result ?? row.status ?? '').toLowerCase();
              const paramName = row.title ?? row.name ?? row.parameter ?? 'Parameter';
              const testedVal = row.tested_value ?? row.tested ?? '—';
              const unit = row.unit ?? 'g';
              const isPass = result === 'pass' || result === 'passed';
              const isFail = result === 'fail' || result === 'failed';

              return (
                <View key={i} className="flex-row items-center px-4 py-3 bg-white">
                  <View style={{ flex: 2 }} className="pr-4">
                    <Text className="text-sm font-semibold text-ink-900">{paramName}</Text>
                    {row.loq_note ? <Text className="mt-0.5 text-[10px] font-medium text-ink-400">{row.loq_note}</Text> : null}
                  </View>
                  <Text style={{ flex: 1.5 }} className="text-sm font-semibold text-ink-800">
                    {testedVal !== '—' ? `${testedVal}${unit}` : '—'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    {result ? (
                      <Badge variant={isPass ? 'pass' : isFail ? 'fail' : 'neutral'}>
                        {isPass ? 'Pass' : isFail ? 'Fail' : result}
                      </Badge>
                    ) : (
                      <Text className="text-ink-400">—</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null
      )}
    </View>
  );
}

function HeaderCell({ label, flex = 1, className = '' }: { label: string; flex?: number; className?: string }) {
  return (
    <Text style={{ flex }} className={`text-[10px] font-bold uppercase tracking-wider text-ink-400 ${className}`}>
      {label}
    </Text>
  );
}
