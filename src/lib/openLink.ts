import { Linking } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SITE = 'https://www.trustified.in';

/**
 * Opens a link entered by an admin (banner links etc.). They come in several shapes:
 *  - "/shop", "/shop/protein", "/products", "/certified-brands" … → the matching in-app screen
 *    (falls back to the website when there is no in-app equivalent)
 *  - "https://…", "mailto:…", "tel:…" → handed to the system
 *  - a bare "www.site.com" → treated as https://
 */
export function openLink(navigation: Nav, raw: string | null | undefined): void {
  const link = (raw ?? '').trim();
  if (!link) return;

  if (link.startsWith('/') && !link.startsWith('//')) {
    openInternalPath(navigation, link);
    return;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) {
    void Linking.openURL(link).catch(() => {});
    return;
  }

  void Linking.openURL(`https://${link.replace(/^\/+/, '')}`).catch(() => {});
}

function openInternalPath(navigation: Nav, path: string): void {
  const [pathname = '', query = ''] = path.split('?');
  const parts = pathname.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  const [first, second] = parts;

  switch (first) {
    case 'shop':
      if (second && second !== 'all') {
        navigation.navigate('ShopSection', { slug: second, sub: params.get('sub') ?? undefined, brand: params.get('brand') ?? undefined });
      } else if (second === 'all') {
        navigation.navigate('ShopSection', { brand: params.get('brand') ?? undefined });
      } else {
        navigation.navigate('Shop');
      }
      return;
    case 'products':
      if (second) navigation.navigate('ProductDetail', { slug: second });
      else navigation.navigate('Tabs', { screen: 'Reports', params: { category: params.get('category') ?? undefined } });
      return;
    case 'certified-brands':
      navigation.navigate('CertifiedBrands');
      return;
    case 'brands':
      if (second) navigation.navigate('BrandDetail', { slug: second });
      return;
    case 'get-certified':
      navigation.navigate('GetCertified');
      return;
    case 'challenge':
      navigation.navigate('Challenge');
      return;
    case 'about':
      navigation.navigate('About');
      return;
    case 'verify':
      navigation.navigate('Verify', { certificateNumber: second });
      return;
    default:
      void Linking.openURL(`${SITE}${path}`).catch(() => {});
  }
}
