import { adminFetch } from './client';
import type { ApiTestimonial } from '../public/testimonials';

// -----------------------------------------------------------------------------
// Admin Testimonials service. Targets the private /api/admin/testimonials
// subtree. Reuses the public ApiTestimonial type so the admin table and the
// public site share one source of truth.
//
// Media: ONE image (avatar). Same single-image multipart pattern as Services.
// -----------------------------------------------------------------------------

export type TestimonialInput = {
  clientName: string;
  role?: string;
  company?: string;
  feedback: string;
  avatar?: string;
};

function toFormData(input: TestimonialInput, file: File): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  fd.append('image', file);
  return fd;
}

// GET /api/admin/testimonials — full list for the dashboard table.
export const listTestimonials = () =>
  adminFetch<ApiTestimonial[]>('/api/admin/testimonials');

// GET /api/admin/testimonials/:id — single testimonial for the edit modal.
export const getTestimonial = (id: string) =>
  adminFetch<ApiTestimonial>(`/api/admin/testimonials/${id}`);

// POST /api/admin/testimonials — create. Multipart when a file is attached.
export const createTestimonial = (input: TestimonialInput, file?: File | null) => {
  if (file) {
    return adminFetch<ApiTestimonial>('/api/admin/testimonials', {
      method: 'POST',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiTestimonial>('/api/admin/testimonials', {
    method: 'POST',
    body: input as Record<string, unknown>,
  });
};

// PUT /api/admin/testimonials/:id — update.
export const updateTestimonial = (
  id: string,
  input: TestimonialInput,
  file?: File | null
) => {
  if (file) {
    return adminFetch<ApiTestimonial>(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiTestimonial>(`/api/admin/testimonials/${id}`, {
    method: 'PUT',
    body: input as Record<string, unknown>,
  });
};

// DELETE /api/admin/testimonials/:id — removes the doc and its Cloudinary avatar.
export const deleteTestimonial = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/testimonials/${id}`, {
    method: 'DELETE',
  });
