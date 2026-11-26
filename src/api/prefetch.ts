import { api } from './client';
import { queryClient } from './queryClient';
import { preloadImages } from '../lib/preloadImages';
import type {
  Banner,
  Brand,
  Category,
  Envelope,
  Paginated,
  Product,
  Review,
  ShopSectionWithProducts,
  TestReport,
} from './types';

function matchSlug(list: unknown, slug: string): Product | undefined {
  if (!Array.isArray(list)) return undefined;
  for (const item of list) {
    if (item && typeof item === 'object' && 'slug' in item && (item as Product).slug === slug) {
      return item as Product;
    }
  }
  return undefined;
}

/**
 * Searches already-fetched list caches (Shop sections, Shop products, Reports, Brand/Category lists)
 * for a Product matching `slug`, so ProductDetailScreen / ReportDetailScreen render immediately at 0ms
 * instead of blocking on a blank skeleton.
 */
export function findCachedProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;

  // 1. Shop sections cache (each section already embeds its initial products)
  const sectionsEnvelope = queryClient.getQueryData<Envelope<ShopSectionWithProducts[]>>(['shop', 'sections']);
  if (sectionsEnvelope?.data) {
    for (const section of sectionsEnvelope.data) {
      const found = matchSlug(section.products, slug);
      if (found) return found;
    }
  }

  // 2. Infinite queries: shop products & reports
  const shopProductQueries = queryClient.getQueriesData<{ pages?: Paginated<Product>[] }>({
    queryKey: ['shop', 'products'],
  });
  for (const [, data] of shopProductQueries) {
    if (data?.pages) {
      for (const page of data.pages) {
        const found = matchSlug(page?.data, slug);
        if (found) return found;
      }
    }
  }

  const reportQueries = queryClient.getQueriesData<{ pages?: Paginated<Product>[]; data?: Product[] }>({
    queryKey: ['reports'],
  });
  for (const [, data] of reportQueries) {
    if (data?.pages) {
      for (const page of data.pages) {
        const found = matchSlug(page?.data, slug);
        if (found) return found;
      }
    }
    const found = matchSlug(data?.data, slug);
    if (found) return found;
  }

  // 3. Flat product / brand / category / ranking lists
  for (const prefix of [['products'], ['brands', 'products'], ['categories', 'products'], ['rankings']] as const) {
    const entries = queryClient.getQueriesData<{ data?: Product[] }>({ queryKey: [...prefix] });
    for (const [, data] of entries) {
      const found = matchSlug(data?.data, slug);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Fires immediately at app boot (during SplashScreen) so the initial Shop tab and its banners/images
 * are already warm in memory and disk cache before the user even sees the first screen.
 */
export function prefetchBootData(): void {
  void queryClient
    .prefetchQuery({
      queryKey: ['shop', 'sections'],
      queryFn: ({ signal }) => api.get<Envelope<ShopSectionWithProducts[]>>('/shop/sections', undefined, signal),
      staleTime: 5 * 60_000,
    })
    .then(() => {
      const res = queryClient.getQueryData<Envelope<ShopSectionWithProducts[]>>(['shop', 'sections']);
      const thumbUrls: (string | null | undefined)[] = [];
      for (const sec of (res?.data ?? []).slice(0, 4)) {
        for (const prod of (sec.products ?? []).slice(0, 4)) {
          thumbUrls.push(prod.image_url);
        }
      }
      if (thumbUrls.length > 0) preloadImages(thumbUrls, 'high');
    });

  void queryClient
    .prefetchQuery({
      queryKey: ['banners'],
      queryFn: ({ signal }) => api.get<Envelope<Banner[]>>('/banners', undefined, signal),
      staleTime: 5 * 60_000,
    })
    .then(() => {
      const res = queryClient.getQueryData<Envelope<Banner[]>>(['banners']);
      const urls = (res?.data ?? []).filter((b) => b.position === 'shop' || b.position === 'home').map((b) => b.image_url);
      if (urls.length > 0) preloadImages(urls, 'high');
    });

  void queryClient.prefetchQuery({
    queryKey: ['shop', 'brands', '', ''],
    queryFn: ({ signal }) => api.get<Envelope<Brand[]>>('/shop/brands', { section: undefined, sub: undefined }, signal),
    staleTime: 5 * 60_000,
  });
}

let secondaryPrefetched = false;

/**
 * Silently warms Home & Products tab data right after Shop settles, so tab switches feel instant.
 */
export function prefetchSecondaryTabsData(): void {
  if (secondaryPrefetched) return;
  secondaryPrefetched = true;

  void queryClient.prefetchQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => api.get<Envelope<Category[]>>('/categories', undefined, signal),
    staleTime: 5 * 60_000,
  });

  void queryClient.prefetchQuery({
    queryKey: ['reports', 'pass-fail', { per_page: 6, status: 'pass' }],
    queryFn: ({ signal }) => api.get<Paginated<Product>>('/reports/pass-fail', { per_page: 6, status: 'pass' }, signal),
    staleTime: 2 * 60_000,
  });

  void queryClient.prefetchInfiniteQuery({
    queryKey: ['reports', 'pass-fail', 'infinite', { search: '', category: '', brand: '', status: '', sort: 'newest', per_page: 24 }],
    queryFn: ({ pageParam, signal }) =>
      api.get<Paginated<Product>>('/reports/pass-fail', { search: '', category: '', brand: '', status: '', sort: 'newest', per_page: 24, page: pageParam }, signal),
    initialPageParam: 1,
    staleTime: 2 * 60_000,
  });
}

/**
 * Prefetches product detail + reviews the instant a user taps a product card.
 */
export function prefetchProduct(slug: string, includeReport = false): void {
  if (!slug) return;
  void queryClient.prefetchQuery({
    queryKey: ['products', 'detail', slug],
    queryFn: ({ signal }) => api.get<Envelope<Product>>(`/products/${slug}`, undefined, signal),
    staleTime: 3 * 60_000,
  });
  void queryClient.prefetchQuery({
    queryKey: ['reviews', slug, { sort: 'high_to_low', per_page: 20 }],
    queryFn: ({ signal }) => api.get<Paginated<Review>>(`/products/${slug}/reviews`, { sort: 'high_to_low', per_page: 20 }, signal),
    staleTime: 2 * 60_000,
  });
  if (includeReport) {
    void queryClient.prefetchQuery({
      queryKey: ['products', 'report', slug],
      queryFn: ({ signal }) => api.get<Envelope<TestReport>>(`/products/${slug}/report`, undefined, signal),
      staleTime: 3 * 60_000,
    });
  }
}

/**
 * Prefetches category/sub-category/brand shop products immediately on tap.
 */
export function prefetchShopSection(params: { section?: string; sub?: string; brand?: string }): void {
  const queryParams = {
    section: params.section,
    sub: params.sub || undefined,
    brand: params.brand || undefined,
    per_page: 24,
  };
  void queryClient.prefetchInfiniteQuery({
    queryKey: ['shop', 'products', queryParams],
    queryFn: ({ pageParam, signal }) =>
      api.get<Paginated<Product>>('/shop/products', { ...queryParams, page: pageParam }, signal),
    initialPageParam: 1,
    staleTime: 2 * 60_000,
  });
  void queryClient.prefetchQuery({
    queryKey: ['shop', 'brands', params.section ?? '', params.sub ?? ''],
    queryFn: ({ signal }) => api.get<Envelope<Brand[]>>('/shop/brands', { section: params.section, sub: params.sub || undefined }, signal),
    staleTime: 5 * 60_000,
  });
}
