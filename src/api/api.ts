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

// One-hour ISR window shared by every public GET. Centralized so a global
// cache-policy change is a single-line edit rather than a find-and-replace.
export const PUBLIC_REVALIDATE = 3600;

/**
 * Convenience wrapper for GET requests — the only verb the public layer needs.
 * Forces method GET and defaults to the shared 1-hour ISR window, while still
 * letting callers override `next` (e.g. a different revalidate, or tags).
 */
export function apiGet<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'GET',
    next: { revalidate: PUBLIC_REVALIDATE, ...(options.next ?? {}) },
  });
}
