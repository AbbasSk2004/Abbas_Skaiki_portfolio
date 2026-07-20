import { adminFetch } from './client';
import type { ApiService } from '../public/services';

// -----------------------------------------------------------------------------
// Admin Services service. Targets the private /api/admin/services subtree and
// covers the full write surface. Reuses the public ApiService type so the admin
// table and the public site share one source of truth for a service's shape.
//
// Media: a Service carries ONE image (serviceImage). New files are sent as a
// single multipart `image` field; already-hosted URLs the admin keeps stay in
// the JSON body. Mirrors the Projects slice, adapted from images[] → one image.
// -----------------------------------------------------------------------------

// Fields the admin form edits. serviceImage holds an already-hosted Cloudinary
// URL the admin chose to keep (or ''); a brand-new file is sent as `file`.
export type ServiceInput = {
  title: string;
  description: string;
  icon?: string;
  tags?: string[];
  serviceImage?: string;
  order?: number;
};

// Build a multipart body when a file is attached, else the caller sends JSON.
function toFormData(input: ServiceInput, file: File): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
    else fd.append(key, String(value));
  });
  fd.append('image', file);
  return fd;
}

// GET /api/admin/services — full list for the dashboard table.
export const listServices = () => adminFetch<ApiService[]>('/api/admin/services');

// GET /api/admin/services/:id — single service to hydrate the edit modal.
export const getService = (id: string) =>
  adminFetch<ApiService>(`/api/admin/services/${id}`);

// POST /api/admin/services — create. Sends multipart when a file is attached.
export const createService = (input: ServiceInput, file?: File | null) => {
  if (file) {
    return adminFetch<ApiService>('/api/admin/services', {
      method: 'POST',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiService>('/api/admin/services', {
    method: 'POST',
    body: input as Record<string, unknown>,
  });
};

// PUT /api/admin/services/:id — update. Same multipart-vs-JSON branching.
export const updateService = (id: string, input: ServiceInput, file?: File | null) => {
  if (file) {
    return adminFetch<ApiService>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiService>(`/api/admin/services/${id}`, {
    method: 'PUT',
    body: input as Record<string, unknown>,
  });
};

// DELETE /api/admin/services/:id — removes the doc and its Cloudinary image.
export const deleteService = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/services/${id}`, { method: 'DELETE' });
