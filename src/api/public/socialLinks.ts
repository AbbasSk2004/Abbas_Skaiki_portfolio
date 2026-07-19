import { apiGet } from '../api';

// Mirrors the SocialLink documents served by the Express backend
// (see back/models/SocialLink.js).
export type ApiSocialLink = {
  _id: string;
  platform: string;
  url: string;
  icon?: string;
};

// GET /api/social-links — all social links (served by socialLinkRoutes).
export const getSocialLinks = () =>
  apiGet<ApiSocialLink[]>('/api/social-links', { next: { revalidate: 3600 } });
