/**
 * RN port of `frontend/packages/api-client/src/hooks/public.ts` — same hook
 * names, params, and query keys, ported 1:1 per Appendix B of
 * REACT_NATIVE_INSTRUCTIONS.md.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import {
  sanitizeCategory,
  type Banner,
  type Brand,
  type Category,
  type Certificate,
  type Envelope,
  type Offer,
  type Paginated,
  type Policy,
  type Product,
  type Review,
  type Settings,
  type ShopSection,
  type StoreLeadRequest,
  type TestReport,
  type Video,
  type YoutubeVideo,
} from '../types';

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  status?: string;
  tier?: string;
  brand?: string;
  category?: string;
  sub_category?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/* ---------- products & reports ---------- */

export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: ({ signal }) => api.get<Paginated<Product>>('/products', params, signal),
    staleTime: 60_000,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['products', 'detail', slug],
    queryFn: ({ signal }) => api.get<Envelope<Product>>(`/products/${slug}`, undefined, signal),
    enabled: Boolean(slug),
  });
}

export function useProductReport(slug: string | undefined) {
  return useQuery({
    queryKey: ['products', 'report', slug],
    queryFn: ({ signal }) => api.get<Envelope<TestReport>>(`/products/${slug}/report`, undefined, signal),
    enabled: Boolean(slug),
  });
}

/** Fetch one specific report by id — used when a product has more than one
 * (retests/history) and a particular one is selected from the reports list. */
export function useReport(id: number | undefined) {
  return useQuery({
    queryKey: ['reports', 'detail', id],
    queryFn: ({ signal }) => api.get<Envelope<TestReport>>(`/reports/${id}`, undefined, signal),
    enabled: Boolean(id),
  });
}

export type ReportCollection = 'pass-fail' | 'gold' | 'nmr';

export function useReports(collection: ReportCollection, params: ListParams = {}) {
  return useQuery({
    queryKey: ['reports', collection, params],
    queryFn: ({ signal }) => api.get<Paginated<Product>>(`/reports/${collection}`, params, signal),
    staleTime: 60_000,
  });
}

/* ---------- brands & categories ---------- */

export function useBrands(params: ListParams = {}) {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: ({ signal }) => api.get<Paginated<Brand> | Envelope<Brand[]>>('/brands', params, signal),
    staleTime: 5 * 60_000,
  });
}

export function useCertifiedBrands() {
  return useQuery({
    queryKey: ['brands', 'certified'],
    queryFn: ({ signal }) =>
      api.get<Envelope<Brand[]> | Paginated<Brand>>('/certified-brands', undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export function useBrand(slug: string | undefined) {
  return useQuery({
    queryKey: ['brands', 'detail', slug],
    queryFn: ({ signal }) => api.get<Envelope<Brand>>(`/brands/${slug}`, undefined, signal),
    enabled: Boolean(slug),
  });
}

export function useBrandProducts(slug: string | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: ['brands', 'products', slug, params],
    queryFn: ({ signal }) => api.get<Paginated<Product>>(`/brands/${slug}/products`, params, signal),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => api.get<Envelope<Category[]>>('/categories', undefined, signal),
    select: (res) => ({ ...res, data: res.data.map(sanitizeCategory) }),
    staleTime: 5 * 60_000,
  });
}

export function useProductTypes() {
  return useQuery({
    queryKey: ['product-types'],
    queryFn: ({ signal }) => api.get<Envelope<Category[]>>('/product-types', undefined, signal),
    select: (res) => ({ ...res, data: res.data.map(sanitizeCategory) }),
    staleTime: 5 * 60_000,
  });
}

export function useCategoryProducts(slug: string | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: ['categories', 'products', slug, params],
    queryFn: ({ signal }) => api.get<Paginated<Product>>(`/categories/${slug}/products`, params, signal),
    enabled: Boolean(slug),
  });
}

/* ---------- rankings ---------- */

export function useRankingCategories() {
  return useQuery({
    queryKey: ['rankings', 'categories'],
    queryFn: ({ signal }) => api.get<Envelope<Category[]>>('/rankings/categories', undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export function useCategoryRankings(slug: string | undefined) {
  return useQuery({
    queryKey: ['rankings', slug],
    queryFn: ({ signal }) =>
      api.get<Envelope<Product[]> | Paginated<Product>>(`/rankings/categories/${slug}`, undefined, signal),
    enabled: Boolean(slug),
  });
}

/* ---------- reviews ---------- */

export function useReviews(slug: string | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: ['reviews', slug, params],
    queryFn: ({ signal }) => api.get<Paginated<Review>>(`/products/${slug}/reviews`, params, signal),
    enabled: Boolean(slug),
  });
}

export function useSubmitReview(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.postForm<Envelope<Review>>(`/products/${slug}/reviews`, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      void queryClient.invalidateQueries({ queryKey: ['products', 'detail', slug] });
    },
  });
}

/* ---------- content ---------- */

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => api.get<Envelope<Settings>>('/settings', undefined, signal),
    staleTime: 10 * 60_000,
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: ({ signal }) => api.get<Envelope<Banner[]>>('/banners', undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: ({ signal }) => api.get<Envelope<Offer[]>>('/offers', undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: ({ signal }) => api.get<Envelope<Video[]>>('/videos', undefined, signal),
    staleTime: 5 * 60_000,
  });
}

/** Latest videos pulled live from the Trustified YouTube channel's RSS feed — not admin-managed. */
export function useYoutubeVideos() {
  return useQuery({
    queryKey: ['youtube-videos'],
    queryFn: ({ signal }) => api.get<Envelope<YoutubeVideo[]>>('/youtube-videos', undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export function usePolicy(slug: string | undefined) {
  return useQuery({
    queryKey: ['policies', slug],
    queryFn: ({ signal }) => api.get<Envelope<Policy>>(`/policies/${slug}`, undefined, signal),
    enabled: Boolean(slug),
    staleTime: 10 * 60_000,
  });
}

/* ---------- forms ---------- */

export function useSubmitLead() {
  return useMutation({
    mutationFn: (body: StoreLeadRequest) => api.post<Envelope<unknown>>('/leads', body),
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (body: { email: string }) => api.post<Envelope<unknown>>('/subscribers', body),
  });
}

export function useSubmitChallenge() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<Envelope<unknown>>('/challenge', body),
  });
}

/* ---------- certificate verification ---------- */

export function useVerifyCertificate(certificateNumber: string | undefined) {
  return useQuery({
    queryKey: ['verify', certificateNumber],
    queryFn: ({ signal }) =>
      api.get<Envelope<Certificate>>(`/verify/${encodeURIComponent(certificateNumber ?? '')}`, undefined, signal),
    enabled: Boolean(certificateNumber),
    retry: false,
  });
}

/* ---------- shop ---------- */

export function useShopSections() {
  return useQuery({
    queryKey: ['shop', 'sections'],
    queryFn: ({ signal }) => api.get<Envelope<ShopSection[]>>('/shop/sections', undefined, signal),
    staleTime: 60_000,
  });
}

export function useShopSection(slug: string | undefined) {
  return useQuery({
    queryKey: ['shop', 'section', slug],
    queryFn: ({ signal }) => api.get<Envelope<ShopSection>>(`/shop/sections/${slug}`, undefined, signal),
    enabled: Boolean(slug),
  });
}

export function useShopBrands(sectionSlug: string | undefined) {
  return useQuery({
    queryKey: ['shop', 'brands', sectionSlug],
    queryFn: ({ signal }) =>
      api.get<Envelope<Brand[]>>('/shop/brands', sectionSlug ? { section: sectionSlug } : undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export function useShopProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: ['shop', 'products', params],
    queryFn: ({ signal }) => api.get<Paginated<Product>>('/shop/products', params, signal),
    staleTime: 60_000,
  });
}

export function useShopBanners() {
  return useQuery({
    queryKey: ['banners', 'header'],
    queryFn: ({ signal }) => api.get<Envelope<Banner[]>>('/banners', { position: 'header' }, signal),
    staleTime: 5 * 60_000,
  });
}
