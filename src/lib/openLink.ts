import { Linking } from 'react-native';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList> | NavigationContainerRef<RootStackParamList>;

const SITE = 'https://www.trustified.in';

const INTERNAL_HOSTS = new Set([
  'trustified.in',
  'www.trustified.in',
  'shop.trustified.in',
]);

/**
 * Pure-JS query string parser — React Native's built-in URLSearchParams throws
 * "URLSearchParams.get is not implemented", so parse manually and decode safely.
 */
function parseQueryParams(query: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!query) return out;
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    const rawKey = eqIdx >= 0 ? pair.slice(0, eqIdx) : pair;
    const rawVal = eqIdx >= 0 ? pair.slice(eqIdx + 1) : '';
    try {
      const key = decodeURIComponent(rawKey.replace(/\+/g, ' ')).trim();
      const val = decodeURIComponent(rawVal.replace(/\+/g, ' ')).trim();
      if (key) out[key] = val;
    } catch {
      if (rawKey) out[rawKey] = rawVal;
    }
  }
  return out;
}

/**
 * Extracts an in-app path (e.g. "/shop/protein?sub=isolate") if `raw` points to the
 * Trustified website, a relative path, or the `trustified://` scheme.
 * Returns `null` for external websites, mailto/tel, storage/uploads, or direct PDFs/files.
 */
function extractInternalPath(raw: string): string | null {
  const link = raw.trim();
  if (!link) return null;

  // Relative path ("/shop/protein", "/products/xyz")
  if (link.startsWith('/') && !link.startsWith('//')) {
    if (/^\/(?:storage|uploads)\//i.test(link) || /\.(?:pdf|png|jpe?g|webp|mp4|zip)(?:$|\?)/i.test(link)) {
      return null;
    }
    return link;
  }

  // Custom app scheme ("trustified://shop/protein")
  if (/^trustified:\/\//i.test(link)) {
    const rest = link.replace(/^trustified:\/\//i, '');
    return rest.startsWith('/') ? rest : `/${rest}`;
  }

  // Non-http schemes (mailto:, tel:, whatsapp:, etc.) -> external
  if (/^[a-z][a-z0-9+.-]*:/i.test(link) && !/^https?:/i.test(link)) {
    return null;
  }

  // Normalize full or bare URLs ("https://www.trustified.in/...", "//trustified.in/...", "www.trustified.in/...")
  let normalized = link;
  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized)) {
    // Only treat bare host strings as domains if they match known Trustified hostnames
    if (!/^(?:www\.|shop\.)?trustified\.in(?:\/|\?|#|$)/i.test(normalized)) {
      return null;
    }
    normalized = `https://${normalized}`;
  }

  const match = normalized.match(/^https?:\/\/([^/?#]+)(.*)$/i);
  if (!match) return null;
  const host = (match[1] ?? '').toLowerCase().replace(/:\d+$/, '');
  const rest = match[2] || '/';

  if (!INTERNAL_HOSTS.has(host)) {
    return null;
  }

  // Direct media/PDF downloads on trustified.in must still open externally
  if (/^\/(?:storage|uploads)\//i.test(rest) || /\.(?:pdf|png|jpe?g|webp|mp4|zip)(?:$|\?)/i.test(rest)) {
    return null;
  }

  if (host === 'shop.trustified.in' && !/^\/shop(?:\/|\?|#|$)/i.test(rest)) {
    return `/shop${rest.startsWith('/') ? rest : `/${rest}`}`;
  }

  return rest.startsWith('/') ? rest : `/${rest}`;
}

/**
 * Attempts to route `raw` to an in-app screen if it's a Trustified website/deep link.
 * Returns `true` if handled in-app, `false` if it's an external link or unmatched path.
 */
export function tryOpenInternalLink(navigation: Nav, raw: string | null | undefined): boolean {
  const link = (raw ?? '').trim();
  if (!link) return false;

  const internalPath = extractInternalPath(link);
  if (!internalPath) return false;

  return openInternalPath(navigation, internalPath, link);
}

/**
 * Opens a link entered by an admin (banner links, promos, deep links):
 *  - Same-website URLs ("https://www.trustified.in/shop/protein", "https://trustified.in/products/x",
 *    "/shop", "trustified://...") → navigates directly inside the mobile app
 *  - External websites, PDFs, mailto/tel → opens via system Linking.openURL
 */
export function openLink(navigation: Nav, raw: string | null | undefined): void {
  const link = (raw ?? '').trim();
  if (!link) return;

  if (tryOpenInternalLink(navigation, link)) {
    return;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) {
    void Linking.openURL(link).catch(() => {});
    return;
  }

  const clean = link.startsWith('//') ? `https:${link}` : `https://${link.replace(/^\/+/, '')}`;
  void Linking.openURL(clean).catch(() => {});
}

function openInternalPath(navigation: Nav, path: string, originalRaw?: string): boolean {
  const withoutHash = path.split('#')[0] ?? '';
  const [pathname = '', query = ''] = withoutHash.split('?');
  const parts = pathname.split('/').filter(Boolean);
  const params = parseQueryParams(query);
  const first = parts[0]?.toLowerCase();
  const second = parts[1];
  const third = parts[2];

  if (!first || first === 'home') {
    navigation.navigate('Tabs', { screen: 'Home' });
    return true;
  }

  switch (first) {
    case 'shop':
      if (second && second.toLowerCase() !== 'all') {
        navigation.navigate('ShopSection', {
          slug: second,
          sub: third ?? (params.sub || undefined),
          brand: params.brand || undefined,
        });
      } else if (second?.toLowerCase() === 'all' || params.brand || params.slug || params.section) {
        navigation.navigate('ShopSection', {
          slug: params.slug || params.section || undefined,
          sub: params.sub || undefined,
          brand: params.brand || undefined,
        });
      } else {
        navigation.navigate('Tabs', { screen: 'ShopTab' });
      }
      return true;

    case 'products':
    case 'product':
      if (second) {
        if (third?.toLowerCase() === 'report') {
          navigation.navigate('ReportDetail', { slug: second });
        } else {
          navigation.navigate('ProductDetail', { slug: second });
        }
      } else {
        navigation.navigate('Tabs', {
          screen: 'Reports',
          params: {
            category: params.category || undefined,
            brand: params.brand || undefined,
          },
        });
      }
      return true;

    case 'categories':
    case 'category':
      navigation.navigate('Tabs', {
        screen: 'Reports',
        params: {
          category: second ?? (params.category || undefined),
          brand: params.brand || undefined,
        },
      });
      return true;

    case 'reports':
      if (second && !['pass-fail', 'gold', 'nmr'].includes(second.toLowerCase())) {
        navigation.navigate('ReportDetail', { slug: second });
      } else {
        navigation.navigate('Tabs', {
          screen: 'Reports',
          params: {
            category: params.category || undefined,
            brand: params.brand || undefined,
          },
        });
      }
      return true;

    case 'pass-fail':
    case 'gold-certified':
    case 'gold':
    case 'nmr':
      navigation.navigate('Tabs', {
        screen: 'Reports',
        params: {
          category: params.category || undefined,
          brand: params.brand || undefined,
        },
      });
      return true;

    case 'certified-brands':
      navigation.navigate('CertifiedBrands');
      return true;

    case 'brands':
    case 'brand':
      if (second) navigation.navigate('BrandDetail', { slug: second });
      else navigation.navigate('CertifiedBrands');
      return true;

    case 'rankings':
      if (second?.toLowerCase() === 'categories' && third) {
        navigation.navigate('RankingsCategory', { slug: third });
      } else if (second) {
        navigation.navigate('RankingsCategory', { slug: second });
      } else {
        navigation.navigate('RankingsIndex');
      }
      return true;

    case 'verify':
      navigation.navigate('Verify', {
        certificateNumber: second ?? (params.certificate || params.cert || undefined),
      });
      return true;

    case 'get-certified':
      navigation.navigate('GetCertified');
      return true;

    case 'challenge':
      navigation.navigate('Challenge');
      return true;

    case 'about':
    case 'about-us':
      navigation.navigate('About');
      return true;

    case 'testing':
    case 'gold-certification':
      navigation.navigate('Testing');
      return true;

    case 'privacy':
    case 'privacy-policy':
      navigation.navigate('Policy', { slug: 'privacy', title: 'Privacy Policy' });
      return true;

    case 'terms':
    case 'terms-of-service':
    case 'terms-and-conditions':
      navigation.navigate('Policy', { slug: 'terms', title: 'Terms of Service' });
      return true;

    case 'disclaimer':
      navigation.navigate('Policy', { slug: 'disclaimer', title: 'Disclaimer' });
      return true;

    case 'policy':
    case 'policies':
      if (second) {
        navigation.navigate('Policy', { slug: second });
        return true;
      }
      break;

    case 'search':
      navigation.navigate('Tabs', { screen: 'Search' });
      return true;

    case 'login':
      navigation.navigate('Login');
      return true;

    case 'register':
      navigation.navigate('Register');
      return true;

    default:
      break;
  }

  // Fallback for unrecognized Trustified web pages
  if (originalRaw && /^https?:\/\//i.test(originalRaw)) {
    void Linking.openURL(originalRaw).catch(() => {});
  } else {
    void Linking.openURL(`${SITE}${path}`).catch(() => {});
  }
  return true;
}
