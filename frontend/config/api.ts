/**
 * Single source of truth for the backend URL + a safe fetch helper.
 *
 * LOCAL DEV  : put EXPO_PUBLIC_API_URL in .env.local (see .env.example)
 *              (in dev builds only, falls back to DEV_FALLBACK below)
 * PRODUCTION : EXPO_PUBLIC_API_URL must be a PUBLIC https:// URL, set in the
 *              EAS "production" environment BEFORE building. It is baked into
 *              the APK at build time, so changing it means rebuilding.
 *
 * In a release build there is deliberately NO fallback to a LAN address: a
 * build without a valid https URL shows a clear "not configured" error
 * instead of silently trying 192.168.x.x on someone else's phone.
 */
const DEV_FALLBACK =
  'http://192.168.29.215/voting-system/voting-professor-change/backend/api/';

const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
const raw = configured || (__DEV__ ? DEV_FALLBACK : '');

export const API_BASE_URL = raw ? raw.replace(/\/+$/, '') + '/' : '';

/** Release builds need https (Android/iOS block plain http by default). */
export const API_READY =
  API_BASE_URL !== '' && (__DEV__ || /^https:\/\//i.test(API_BASE_URL));

export type ApiErrorKind = 'config' | 'timeout' | 'network' | 'parse';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export type ApiResponse = {
  success?: boolean;
  message?: string;
  [key: string]: any;
};

/**
 * fetch + timeout + JSON parsing. Always resolves to parsed JSON or throws
 * an ApiError (config | timeout | network | parse).
 */
export async function apiFetch<T = ApiResponse>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<T> {
  if (!API_READY) {
    throw new ApiError(
      'config',
      'EXPO_PUBLIC_API_URL is missing or is not an https:// URL.',
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(API_BASE_URL + path.replace(/^\/+/, ''), {
      ...init,
      signal: controller.signal,
    });
    const text = await res.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      if (__DEV__) console.log(`API parse error [${res.status}] ${path}:`, text);
      throw new ApiError('parse', 'Server returned a non-JSON response.', res.status);
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as any)?.name === 'AbortError') {
      throw new ApiError('timeout', 'The request timed out.');
    }
    if (__DEV__) console.log(`API network error ${path}:`, e);
    throw new ApiError('network', 'Network request failed.');
  } finally {
    clearTimeout(timer);
  }
}

export function postJson<T = ApiResponse>(
  path: string,
  body: unknown,
  timeoutMs?: number,
): Promise<T> {
  return apiFetch<T>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );
}

/** Voter-friendly text for any error thrown by apiFetch/postJson. */
export function describeApiError(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    switch (e.kind) {
      case 'config':
        return 'This build is not configured with a secure server address. Please install the latest version of the app.';
      case 'timeout':
        return 'The server took too long to respond. Check your internet connection and try again.';
      case 'network':
        return 'Unable to reach the server. Check your internet connection and try again.';
      case 'parse':
        return 'The server sent an unexpected response. Please try again.';
    }
  }
  return fallback;
}
