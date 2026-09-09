import React from 'react';
import { View, Text, Linking } from 'react-native';
import { ExternalLink, ShieldCheck } from 'lucide-react-native';
import { Button } from './ui';
import type { BuyLink } from '../api/types';
import { colors } from '../theme/tokens';

/** RN port of `frontend/apps/web/src/components/buy-links.tsx`. */
export function BuyLinks({ links, className = '' }: { links: BuyLink[]; className?: string }) {
  const valid = links.filter((l) => l.url);
  if (valid.length === 0) return null;
  return (
    <View className={`gap-2 ${className}`}>
      {valid.map((link, i) => (
        <Button
          key={i}
          variant={i === 0 ? 'primary' : 'outline'}
          onPress={() => link.url && Linking.openURL(link.url)}
          accessibilityLabel={`Buy on ${link.label ?? 'store'}`}>
          <ExternalLink size={16} color={i === 0 ? '#fff' : colors.ink[800]} />
          <Text className={`ml-1 font-semibold ${i === 0 ? 'text-white' : 'text-ink-800'}`}>
            Buy on {link.label ?? 'store'}
          </Text>
        </Button>
      ))}

      {/* Trustified Buy Guarantee statement under the buy buttons */}
      <View className="flex-row items-start gap-1.5 mt-2 px-1">
        <ShieldCheck size={14} color="#2ab841" style={{ marginTop: 2 }} />
        <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-medium leading-normal flex-1">
          Buy confidently — these are verified, authentic sources for this product.
        </Text>
      </View>
    </View>
  );
}
