import { adminFetch } from './client';
import type { ApiHero } from '../public/hero';

// -----------------------------------------------------------------------------
// Admin Hero service. SINGLETON (get + upsert), same shape as the About slice.
// Media: ONE image (headerImage). Reuses the public ApiHero type.
// -----------------------------------------------------------------------------

export type HeroInput = {
  firstName: string;
  lastName: string;
  roleLabel?: string;
  intro?: string;
  badge?: string;
  headerImage?: string;
};

function toFormData(input: HeroInput, file: File): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  fd.append('image', file);
  return fd;
}

// GET /api/admin/hero — the singleton (data may be null before first save).
export const getHero = () => adminFetch<ApiHero | null>('/api/admin/hero');

// PUT /api/admin/hero — upsert. Multipart when a new file is attached.
export const updateHero = (input: HeroInput, file?: File | null) => {
  if (file) {
    return adminFetch<ApiHero>('/api/admin/hero', {
      method: 'PUT',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiHero>('/api/admin/hero', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
};
