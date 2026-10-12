/**
 * Domain types for API responses — RN port of
 * `frontend/packages/api-client/src/types.ts`. Since react-native/ is not
 * part of the frontend/ pnpm workspace it cannot import the generated OpenAPI
 * schema package; the handful of request-body shapes used by this app are
 * inlined below instead (copied from
 * `frontend/packages/api-client/src/generated/schema.d.ts`, cross-check that
 * file if the backend contract changes).
 */

/* ---------- envelopes ---------- */

export interface Envelope<T> {
  data: T;
  meta?: unknown;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/* ---------- resources ---------- */

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  products_count?: number;
}

export interface SubCategory {
  id: number;
  category_id?: number;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  is_upcoming: boolean;
  sub_categories?: SubCategory[];
}

export interface BuyLink {
  label: string | null;
  url: string | null;
}

export interface ShopSection {
  id: number;
  name: string;
  slug: string;
  image_path?: string | null;
  image_url?: string | null;
  sort_order: number;
  show_on_shop: boolean;
  products_count: number;
  products?: Product[];
}

/** Legacy report sections stored as a JSON string in `summary`. */
export interface ReportSummaryBlock {
  title: string;
  type: 'file' | 'textarea' | string;
  value: string;
}

export interface ReportParameterRow {
  id?: number;
  name?: string;
  parameter?: string;
  title?: string;
  claimed?: string | number | null;
  claimed_value?: string | number | null;
  tested?: string | number | null;
  tested_value?: string | number | null;
  unit?: string | null;
  loq_note?: string | null;
  result?: string | null;
  status?: string | null;
  result_status?: string | null;
  chart_image_url?: string | null;
}

export interface ReportParameterGroup {
  name?: string;
  title?: string;
  group?: string;
  group_type?: string;
  status?: string;
  rows?: ReportParameterRow[];
  parameters?: ReportParameterRow[];
  chart_image_url?: string | null;
}

export interface TestReport {
  id: number;
  product_id: number;
  type: string;
  status: string;
  batch_no: string | null;
  mfg_date: string | null;
  exp_date: string | null;
  tested_by: string | null;
  lab_accreditation: string | null;
  published_at: string | null;
  report_pdf_url: string | null;
  summary: string | null;
  parameter_groups: ReportParameterGroup[] | string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  gallery: string[];
  buy_links: BuyLink[];
  is_gold: boolean;
  is_active?: boolean;
  shop_section_id?: number | null;
  status: string;
  tier: string;
  reviews_count: number;
  rating_avg: number;
  published_at: string | null;
  review_video_url?: string | null;
  test_video_url?: string | null;
  brand?: Brand | null;
  category?: Category | null;
  sub_category?: SubCategory | null;
  latest_test_report?: TestReport | null;
  test_reports?: TestReport[];
}

export interface ReviewRatings {
  quality: number;
  result: number;
  value_for_money: number;
  packaging: number;
  digestion: number;
  delivering_time: number;
  customer_support: number;
  taste: number | null;
  mixability: number | null;
}

export interface Review {
  id: number;
  review_text: string | null;
  ratings: ReviewRatings;
  average_rating: number;
  media: (string | null)[];
  is_verified_purchase: boolean;
  helpful_count: number;
  brand_reply: string | null;
  user: { name?: string };
  created_at: string;
  status?: string;
  product?: Pick<Product, 'id' | 'name' | 'slug'> | null;
}

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  two_factor_enabled: boolean;
  is_active: boolean;
  roles?: string[];
  created_at: string | null;
}

export interface CertificateEvent {
  id?: number;
  event?: string;
  type?: string;
  notes?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface Certificate {
  id: number;
  certificate_number: string;
  type: string;
  status: string;
  product_name: string;
  product_details: string | null;
  amount: number | null;
  issue_date: string | null;
  expire_date: string | null;
  first_test_date: string | null;
  re_test_date: string | null;
  product_image_url: string | null;
  pdf_url: string | null;
  brand?: Brand | null;
  product?: Product | null;
  events?: CertificateEvent[];
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  message: string | null;
  status?: string;
  created_at?: string;
}

export interface Settings {
  site_name: string;
  logo_path: string | null;
  favicon_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  socials: Partial<Record<'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube', string>>;
  app_links: Partial<Record<'ios' | 'android', string>>;
  app_version?: Partial<Record<'ios' | 'android', string>>;
  maintenance_mode: boolean;
  maintenance_message?: string;
  hero_stats?: {
    certified_products?: number;
    brands?: number;
    tests_conducted?: number;
  };
}

export interface Banner {
  id: number;
  title?: string | null;
  image_url?: string | null;
  link?: string | null;
  position?: string | null;
  [key: string]: unknown;
}

export interface Offer {
  id: number;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  link?: string | null;
  link_url?: string | null;
  [key: string]: unknown;
}

export interface Video {
  id: number;
  title?: string | null;
  url?: string | null;
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  [key: string]: unknown;
}

export interface YoutubeVideo {
  id: string;
  title?: string | null;
  url?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
  [key: string]: unknown;
}

export interface Policy {
  id: number;
  title?: string;
  slug?: string;
  content?: string | null;
  body?: string | null;
  updated_at?: string;
  [key: string]: unknown;
}

export interface Subscriber {
  id: number;
  email: string;
  created_at?: string;
  [key: string]: unknown;
}

/* ---------- request bodies (inlined from generated OpenAPI schema) ---------- */

export interface LoginRequest {
  email?: string | null;
  phone?: string | null;
  password: string;
  device_name?: string | null;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  /** OTP-verified via POST /auth/otp/verify-registration before register will accept it. */
  phone: string;
  password: string;
  password_confirmation: string;
  device_name?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface OtpRequestRequest {
  phone: string;
  channel?: 'sms' | 'whatsapp' | null;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
  name?: string | null;
}

export interface StoreLeadRequest {
  name: string;
  email: string;
  company_name?: string | null;
  phone?: string | null;
  message?: string | null;
}

export interface StoreSubscriberRequest {
  email: string;
}

/* ---------- parse helpers ---------- */

/** `summary` arrives as a JSON string of legacy blocks; parse defensively. */
export function parseReportSummary(summary: string | null | undefined): ReportSummaryBlock[] {
  if (!summary) return [];
  try {
    const parsed: unknown = JSON.parse(summary);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is ReportSummaryBlock => typeof b === 'object' && b !== null && 'title' in b,
    );
  } catch {
    return [];
  }
}

/** `parameter_groups` may arrive as an array, a JSON string, or junk. */
export function parseParameterGroups(value: TestReport['parameter_groups']): ReportParameterGroup[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as ReportParameterGroup[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** The categories endpoint can leak PHP-serialized junk into sub_categories. */
export function sanitizeCategory(category: Category): Category {
  return {
    ...category,
    sub_categories: Array.isArray(category.sub_categories) ? category.sub_categories : [],
  };
}
