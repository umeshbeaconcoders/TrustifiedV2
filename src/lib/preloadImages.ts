import FastImage from 'react-native-fast-image';
import { mediaUrl } from '../api/client';

const preloadedUrls = new Set<string>();
const MAX_TRACKED_URLS = 400;

/**
 * Warms FastImage disk + memory cache for the provided media paths/URLs,
 * deduplicating across renders so repeated calls cost almost nothing.
 */
export function preloadImages(
  urls: (string | null | undefined)[],
  priority: 'low' | 'normal' | 'high' = 'normal',
): void {
  const sources: { uri: string; priority: (typeof FastImage.priority)[keyof typeof FastImage.priority]; cache: (typeof FastImage.cacheControl)['immutable'] }[] = [];

  for (const raw of urls) {
    const resolved = mediaUrl(raw ?? undefined);
    if (!resolved || preloadedUrls.has(resolved)) continue;
    if (preloadedUrls.size >= MAX_TRACKED_URLS) {
      preloadedUrls.clear();
    }
    preloadedUrls.add(resolved);
    sources.push({
      uri: resolved,
      priority: FastImage.priority[priority],
      cache: FastImage.cacheControl.immutable,
    });
  }

  if (sources.length > 0) {
    try {
      FastImage.preload(sources);
    } catch {
      // Non-fatal — individual MediaFrame views still load normally
    }
  }
}
