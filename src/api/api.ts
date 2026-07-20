// -----------------------------------------------------------------------------
// Core API connection layer.
//
// Every request in src/api/public/* and src/api/admin/* goes through apiFetch,
// so base-URL resolution, error logging, and response parsing live in exactly
// one place. The backend wraps every payload as { success, data, message }
// (see back/controllers/*), so this unwraps `data` and throws on `success:false`.
// -----------------------------------------------------------------------------

// Resolve once. Trailing slashes are stripped so callers can always pass
// leading-slash paths ("/api/hero") without risking a double slash.
const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

// The shape every backend endpoint returns.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Options extend the standard fetch init so callers can pass Next.js caching
// hints (e.g. `{ next: { revalidate: 3600 } }`) straight through.
export type ApiFetchOptions = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

// Thrown on network failure, non-2xx status, or `success:false`. Carries the
// HTTP status (0 for network-level failures) so callers can branch on 404 etc.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Base fetch wrapper. Prepends the API base URL, parses JSON, unwraps the
 * `data` field, and normalizes every failure mode into an ApiError.
 *
 * @param path  endpoint path beginning with "/" (e.g. "/api/hero")
 * @param options  standard fetch init + Next.js `next` caching hints
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (networkErr) {
    // DNS failure, connection refused, CORS at the transport level, etc.
    console.error(`[api] Network error for ${url}:`, networkErr);
    throw new ApiError(
      `Network request to ${url} failed. Is the API running?`,
      0
    );
  }

  // Parse defensively — an error page or empty body must not crash JSON.parse.
  let body: ApiEnvelope<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      console.error(`[api] Non-JSON response from ${url}:`, text.slice(0, 200));
      throw new ApiError(`Invalid JSON from ${url}`, res.status);
    }
  }

  if (!res.ok || !body?.success) {
    const message = body?.message ?? `Request to ${url} failed`;
    console.error(`[api] ${res.status} ${url}: ${message}`);
    throw new ApiError(message, res.status);
  }

  return body.data;
}

// One-hour ISR window shared by every public GET. This is now the FALLBACK
// refresh cadence: content is also revalidated ON DEMAND the instant an admin
// saves (see /app/api/revalidate + the backend's revalidation ping), so the
// long window is just a safety net, not the primary freshness mechanism.
export const PUBLIC_REVALIDATE = 3600;

// Single cache tag applied to every public GET. The on-demand revalidate route
// invalidates this one tag, which drops the cached data for ALL public sections
// at once — simpler and less error-prone than a per-section tag map, and fine
// here because a content edit is rare and re-fetching a few small docs is cheap.
export const PUBLIC_CACHE_TAG = 'public-content';

/**
 * Convenience wrapper for GET requests — the only verb the public layer needs.
 * Forces method GET and defaults to the shared ISR window + the shared cache
 * tag, while still letting callers override `next` (e.g. a different revalidate,
 * or additional tags).
 */
export function apiGet<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const caller = options.next ?? {};
  return apiFetch<T>(path, {
    ...options,
    method: 'GET',
    next: {
      revalidate: PUBLIC_REVALIDATE,
      ...caller,
      // Always include the shared tag, merging with any caller-supplied tags.
      tags: [PUBLIC_CACHE_TAG, ...(caller.tags ?? [])],
    },
  });
}

// -----------------------------------------------------------------------------
// Admin sub-services, connected into the centralized entry point.
//
// Public callers keep importing apiFetch/apiGet from here as before. Admin
// callers get a single namespaced surface:
//
//   import { admin } from '@/api/api';
//   await admin.auth.login({ username, password });
//   const projects = await admin.projects.list();
//   const stats = await admin.stats.overview();
//
// The re-export lives at the bottom on purpose: the admin modules import
// API_BASE_URL/ApiError from this file, and they only touch those at call time
// (inside async functions), so this import cycle resolves cleanly under ESM.
// -----------------------------------------------------------------------------
export * as admin from './admin';
