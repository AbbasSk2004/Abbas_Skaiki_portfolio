import { adminFetch } from './client';
import type { ApiSocialLink } from '../public/socialLinks';

// -----------------------------------------------------------------------------
// Admin SocialLink service. Targets the private /api/admin/social-links subtree.
// NO MEDIA — `icon` is a lucide component NAME (a string), so every request is
// plain JSON. Reuses the public ApiSocialLink type as the single source of truth.
// -----------------------------------------------------------------------------

export type SocialLinkInput = {
  platform: string;
  url: string;
  icon?: string;
};

// GET /api/admin/social-links — full list for the dashboard table.
export const listSocialLinks = () =>
  adminFetch<ApiSocialLink[]>('/api/admin/social-links');

// GET /api/admin/social-links/:id — single link to hydrate the edit modal.
export const getSocialLink = (id: string) =>
  adminFetch<ApiSocialLink>(`/api/admin/social-links/${id}`);

// POST /api/admin/social-links — create.
export const createSocialLink = (input: SocialLinkInput) =>
  adminFetch<ApiSocialLink>('/api/admin/social-links', {
    method: 'POST',
    body: input as Record<string, unknown>,
  });

// PUT /api/admin/social-links/:id — update.
export const updateSocialLink = (id: string, input: SocialLinkInput) =>
  adminFetch<ApiSocialLink>(`/api/admin/social-links/${id}`, {
    method: 'PUT',
    body: input as Record<string, unknown>,
  });

// DELETE /api/admin/social-links/:id — delete (no assets to clean up).
export const deleteSocialLink = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/social-links/${id}`, { method: 'DELETE' });
