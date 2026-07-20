// -----------------------------------------------------------------------------
// Authenticated admin fetch core.
//
// Distinct from the public apiGet (../api.ts) in three deliberate ways:
//   1. credentials: 'include'  — the backend authenticates via an HttpOnly
//      `token` cookie (see back/middlewares/authMiddleware.js). Without this the
//      cookie is never sent and every /api/admin call 401s. The public layer
//      omits it on purpose (public GETs need no cookie); admin REQUIRES it.
//   2. cache: 'no-store'       — admin data is live, never ISR-cached.
//   3. FormData awareness      — when the body is FormData (image uploads) we do
//      NOT set Content-Type, so the browser adds the multipart boundary itself.
//
// It reuses the exact { success, data, message } envelope + ApiError contract
// from the public layer so callers get one consistent error surface.
// -----------------------------------------------------------------------------

import { API_BASE_URL, ApiError, type ApiEnvelope } from '../api';

export type AdminFetchOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
};

/**
 * Core authenticated request. Prepends the API base, sends the auth cookie,
 * normalizes JSON vs FormData bodies, unwraps `data`, and throws ApiError on any
 * non-2xx / `success:false` / network failure — mirroring apiFetch semantics.
 */
export async function adminFetch<T>(
  path: string,
  options: AdminFetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  // Only JSON-encode plain objects. FormData and pre-encoded strings pass through.
  let body = options.body as BodyInit | null | undefined;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

  if (body != null && !isFormData && typeof body === 'object' && !(body instanceof Blob)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }
  // NOTE: never set Content-Type for FormData — the boundary must be auto-set.

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      body,
      headers,
      credentials: 'include', // send the HttpOnly auth cookie
      cache: 'no-store', // admin data is always live
    });
  } catch (networkErr) {
    console.error(`[admin-api] Network error for ${url}:`, networkErr);
    throw new ApiError(`Network request to ${url} failed. Is the API running?`, 0);
  }

  let parsed: ApiEnvelope<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      console.error(`[admin-api] Non-JSON response from ${url}:`, text.slice(0, 200));
      throw new ApiError(`Invalid JSON from ${url}`, res.status);
    }
  }

  if (!res.ok || !parsed?.success) {
    const message = parsed?.message ?? `Request to ${url} failed`;
    // 401 is expected when the session expires — callers redirect to /admin/login.
    if (res.status !== 401) console.error(`[admin-api] ${res.status} ${url}: ${message}`);
    throw new ApiError(message, res.status);
  }

  return parsed.data;
}

// Verb helpers — thin sugar so services read declaratively.
export const adminGet = <T>(path: string, options: AdminFetchOptions = {}) =>
  adminFetch<T>(path, { ...options, method: 'GET' });

export const adminPost = <T>(path: string, body?: AdminFetchOptions['body'], options: AdminFetchOptions = {}) =>
  adminFetch<T>(path, { ...options, method: 'POST', body });

export const adminPut = <T>(path: string, body?: AdminFetchOptions['body'], options: AdminFetchOptions = {}) =>
  adminFetch<T>(path, { ...options, method: 'PUT', body });

export const adminDelete = <T>(path: string, options: AdminFetchOptions = {}) =>
  adminFetch<T>(path, { ...options, method: 'DELETE' });
