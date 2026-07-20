import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { PUBLIC_CACHE_TAG } from '@/api/api';

// -----------------------------------------------------------------------------
// On-demand revalidation endpoint.
//
// The Express backend calls this the moment an admin saves content (see the
// revalidation middleware on the admin router). It drops the cached data for
// every public section by invalidating the shared PUBLIC_CACHE_TAG, so edits go
// live within seconds instead of waiting out the 1-hour ISR window — while the
// public pages stay fully static/cached between edits.
//
// AUTH: gated by a shared secret (REVALIDATE_SECRET) so only our backend can
// trigger a cache purge. Without it, this would be a public cache-buster anyone
// could hammer. The secret is compared in constant time to avoid leaking length
// via timing. Rejects with 401 on mismatch, 500 if the server isn't configured.
// -----------------------------------------------------------------------------

// Never cache this handler itself.
export const dynamic = 'force-dynamic';

// Timing-safe string compare without pulling in node:crypto (keeps this handler
// edge-compatible). Compares every char so runtime doesn't depend on where the
// first mismatch is; the initial length check leaks only length, not content.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    // Misconfiguration, not an auth failure — fail loud so it's noticed in logs.
    console.error('[revalidate] REVALIDATE_SECRET is not set; refusing to run.');
    return NextResponse.json(
      { revalidated: false, message: 'Revalidation not configured' },
      { status: 500 }
    );
  }

  // Accept the secret from a header (preferred) or a ?secret= query fallback.
  const provided =
    req.headers.get('x-revalidate-secret') ??
    req.nextUrl.searchParams.get('secret') ??
    '';

  if (!safeEqual(provided, expected)) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid secret' },
      { status: 401 }
    );
  }

  // Optional explicit tag(s); default to the shared public tag (purge-all).
  let tags: string[] = [PUBLIC_CACHE_TAG];
  try {
    const body = await req.json();
    if (Array.isArray(body?.tags) && body.tags.length) {
      tags = body.tags.filter((t: unknown): t is string => typeof t === 'string');
    }
  } catch {
    // No/!JSON body is fine — fall back to the default tag.
  }

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}
