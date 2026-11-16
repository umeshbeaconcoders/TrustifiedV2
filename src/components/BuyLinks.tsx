import React from 'react';
import { View, Text, Linking, TouchableOpacity } from 'react-native';
import { ShoppingCart, ExternalLink, Tag } from 'lucide-react-native';
import type { BuyLink } from '../api/types';

export function appendUtmParams(url: string): string {
  if (!url) return url;
  if (url.includes('utm_source=')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=trustified&utm_medium=referral`;
}

/** RN port of `frontend/apps/web/src/components/buy-links.tsx`. */
export function BuyLinks({
  links,
  className = '',
  showHeading = true,
}: {
  links: BuyLink[];
  className?: string;
  showHeading?: boolean;
}) {
  const valid = links.filter((l) => l.url);
  if (valid.length === 0) return null;

  return (
    <View className={className}>
      {showHeading ? (
        <Text className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2.5">
          WHERE TO BUY
        </Text>
      ) : null}

      <View className="flex-row flex-wrap gap-2.5">
        {valid.map((link, i) => {
          const rawLabel = link.label ?? 'Website';
          const label = rawLabel.replace(/^buy on\s+/i, '').trim();
          const isWebsite = /website/i.test(label) || (i === 0 && !/amazon|blinkit|flipkart/i.test(label));
          const bgClass = isWebsite ? 'bg-[#3e6a00]' : 'bg-[#121710] dark:bg-black';

          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => link.url && Linking.openURL(appendUtmParams(link.url))}
              accessibilityRole="button"
              accessibilityLabel={`Buy on ${label}`}
              className={`h-12 flex-row items-center justify-center gap-2 px-3 rounded-2xl ${bgClass} border border-transparent dark:border-ink-800`}
              style={{ width: '48.5%' }}
            >
              <ShoppingCart size={17} color="#ffffff" />
              <Text className="font-bold text-white text-sm" numberOfLines={1}>
                {label}
              </Text>
              <ExternalLink size={15} color="#ffffff" />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Trustified discount promo matching web UI */}
      <View className="flex-row items-center gap-1.5 mt-3 px-0.5">
        <Tag size={15} color="#3e6a00" />
        <Text className="text-xs text-ink-600 dark:text-ink-300">
          Use code{' '}
          <Text className="font-bold text-[#2d5203] dark:text-brand-400">TRUSTIFIED</Text>
          {' '}at checkout for a discount. (Website only)
        </Text>
      </View>
    </View>
  );
}
