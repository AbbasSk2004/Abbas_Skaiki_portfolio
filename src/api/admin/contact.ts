import { adminFetch } from './client';
import type { ApiSocialLink } from '../public/socialLinks';

// -----------------------------------------------------------------------------
// Admin ContactInfo service. SINGLETON, NO MEDIA (get + upsert). `socialLinks`
// is an array of SocialLink _ids on write; on read the backend populates them to
// full documents, so the read shape differs from the write shape.
// -----------------------------------------------------------------------------

// Read shape — socialLinks arrive populated as full SocialLink documents.
export type ApiContactInfo = {
  _id: string;
  email: string;
  phone?: string;
  address?: string;
  availabilityNote?: string;
  socialLinks: ApiSocialLink[];
};

// Write shape — socialLinks is a list of ids the admin selected.
export type ContactInput = {
  email: string;
  phone?: string;
  address?: string;
  availabilityNote?: string;
  socialLinks?: string[];
};

// GET /api/admin/contact — the singleton with socialLinks populated (or null).
export const getContactInfo = () =>
  adminFetch<ApiContactInfo | null>('/api/admin/contact');

// PUT /api/admin/contact — upsert the singleton.
export const updateContactInfo = (input: ContactInput) =>
  adminFetch<ApiContactInfo>('/api/admin/contact', {
    method: 'PUT',
    body: input as unknown as Record<string, unknown>,
  });
