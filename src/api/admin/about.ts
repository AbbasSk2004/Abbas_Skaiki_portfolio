import { adminFetch } from './client';
import type { ApiAbout } from '../public/about';

// -----------------------------------------------------------------------------
// Admin About service. SINGLETON: no list/create/delete — only "get the one
// doc" and "upsert the one doc" (GET/PUT /api/admin/about). Reuses the public
// ApiAbout type so the admin form and the public site share one source of truth.
//
// Media: ONE image (aboutImage). Same single-image multipart pattern as Service.
// -----------------------------------------------------------------------------

export type AboutInput = {
  bio: string;
  resumeLink?: string;
  availabilityStatus?: boolean;
  aboutImage?: string;
};

function toFormData(input: AboutInput, file: File): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  fd.append('image', file);
  return fd;
}

// GET /api/admin/about — the singleton (data may be null before first save).
export const getAbout = () => adminFetch<ApiAbout | null>('/api/admin/about');

// PUT /api/admin/about — upsert. Multipart when a new file is attached.
export const updateAbout = (input: AboutInput, file?: File | null) => {
  if (file) {
    return adminFetch<ApiAbout>('/api/admin/about', {
      method: 'PUT',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiAbout>('/api/admin/about', {
    method: 'PUT',
    body: input as Record<string, unknown>,
  });
};
