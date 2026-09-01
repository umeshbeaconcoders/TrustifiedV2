/**
 * Thin typed fetch layer for the Trustified Laravel API — RN port of
 * `frontend/packages/api-client/src/client.ts`.
 *
 * Auth model differs from web on purpose: web uses cookie/XSRF sessions with
 * a bearer-token fallback; mobile ALWAYS wants a Sanctum bearer token, so we
 * send `X-Client: mobile` on every request (see
 * `backend/app/Http/Requests/Auth/LoginRequest.php::wantsToken()`, which
 * checks exactly this header) and never touch cookies/CSRF at all. The token
 * is persisted in `react-native-keychain` (encrypted), never AsyncStorage,
 * never logged.
 */
import * as Keychain from 'react-native-keychain';

// Safe wrapper — react-native-config native module can be null on some RN versions
let _Config: Record<string, string | undefined> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RNConfig = require('react-native-config').default ?? require('react-native-config');
  _Config = RNConfig ?? {};
} catch {
  _Config = {};
}

const DEFAULT_API = 'https://trustified-laravelapi-jyroqs-2f60ac-51-79-17-70.sslip.io';
export const API_ORIGIN = (_Config.API_ORIGIN ?? DEFAULT_API).replace(/\/$/, '');
const API_BASE = _Config.API_URL ?? `${API_ORIGIN}/api/v1`;

// 🔍 DEBUG: Log resolved base URL at module load
console.log('[API] API_ORIGIN =', API_ORIGIN);
console.log('[API] API_BASE =', API_BASE);

const KEYCHAIN_SERVICE = 'trustified.auth.token';

/**
 * In-memory token cache so synchronous callers (request building) don't have
 * to await the keychain on every call. `hydrateAuthToken()` must be awaited
 * once at app boot (see src/stores/auth.ts) before any authenticated request
 * is made; `setAuthToken`/`getAuthToken` keep this in sync thereafter.
 */
let memoryToken: string | null = null;
let hydrated = false;

export async function hydrateAuthToken(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    memoryToken = creds ? creds.password : null;
  } catch {
    memoryToken = null;
  }
  hydrated = true;
  return memoryToken;
}

export async function setAuthToken(token: string | null): Promise<void> {
  memoryToken = token;
  try {
    if (token) {
      await Keychain.setGenericPassword('trustified', token, { service: KEYCHAIN_SERVICE });
    } else {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    }
  } catch {
    // Keychain unavailable (e.g. simulator w/o secure enclave in some
    // configs) — token stays in-memory only for this session.
  }
}

/** Synchronous read of the in-memory token. Call `hydrateAuthToken()` first at boot. */
export function getAuthToken(): string | null {
  return memoryToken;
}

export function isAuthHydrated(): boolean {
  return hydrated;
}

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;
  readonly code: string | undefined;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.errors = body.errors ?? {};
    this.code = body.code;
  }

  /** First field-level validation message, if any — forms rely on this. */
  firstError(): string | undefined {
    const first = Object.values(this.errors)[0];
    return first?.[0];
  }
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, params?: QueryParams): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = `${API_BASE}${cleanPath}`;
  if (!params) return baseUrl;

  const queryParts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  if (queryParts.length === 0) return baseUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryParts.join('&')}`;
}

interface RequestOptions {
  params?: QueryParams;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      // Tells the backend to issue a bearer token instead of a cookie session.
      'X-Client': 'mobile',
    };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body: BodyInit_ | undefined;
    if (options.formData) {
      body = options.formData;
      // Do NOT set Content-Type for FormData — RN's fetch sets the correct
      // multipart boundary itself; forcing it breaks multipart parsing.
    } else if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const fullUrl = buildUrl(path, options.params);

    // 🔍 DEBUG: Log every outgoing request
    console.log(`[API] ▶ ${method} ${fullUrl}`);
    if (options.params) console.log('[API]   params =', JSON.stringify(options.params));

    const fetchOptions: RequestInit = {
      method,
      headers,
      ...(body !== undefined ? { body } : {}),
    };

    // Only include signal if defined and not aborted
    if (options.signal && !options.signal.aborted) {
      fetchOptions.signal = options.signal;
    }

    const response = await fetch(fullUrl, fetchOptions);

    // 🔍 DEBUG: Log response status
    console.log(`[API] ◀ ${response.status} ${response.statusText} — ${method} ${fullUrl}`);

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = undefined;
    }

    if (!response.ok) {
      // 🔍 DEBUG: Log non-2xx errors with body
      console.error(`[API] ✖ HTTP ${response.status} for ${method} ${fullUrl}`);
      console.error('[API]   response body =', text.slice(0, 500));
      throw new ApiError(response.status, (json as ApiErrorBody) ?? { message: response.statusText });
    }
    return json as T;
  } catch (err) {
    console.error(`[API EXCEPTION] Error in ${method} ${path}:`, err);
    throw err;
  }
}

export const api = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
    request<T>('GET', path, { ...(params ? { params } : {}), ...(signal ? { signal } : {}) }),
  post: <T>(path: string, body?: unknown, params?: QueryParams) =>
    request<T>('POST', path, { ...(body !== undefined ? { body } : {}), ...(params ? { params } : {}) }),
  postForm: <T>(path: string, formData: FormData) => request<T>('POST', path, { formData }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body !== undefined ? { body } : {}),
  delete: <T>(path: string, body?: unknown) =>
    request<T>('DELETE', path, body !== undefined ? { body } : {}),
};

/** Resolve backend-relative media paths (e.g. "/uploads/x.png") to absolute URLs. */
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}/storage/${path.replace(/^\/+/, '').replace(/^storage\//, '')}`;
}
