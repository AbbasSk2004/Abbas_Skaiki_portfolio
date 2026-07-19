import { apiGet } from '../api';
import type { ContactInfo } from '@/app/works/types';

// GET /api/contact — the singleton contact document (added in apiRoutes.js).
// socialLinks is populated server-side, so it arrives as full documents.
export const getContactInfo = () =>
  apiGet<ContactInfo>('/api/contact', { next: { revalidate: 3600 } });
