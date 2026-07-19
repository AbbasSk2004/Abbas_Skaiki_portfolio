import { apiGet } from '../api';

export type ApiHero = {
  _id: string;
  firstName: string;
  lastName: string;
  roleLabel?: string;
  intro?: string;
  badge?: string;
  headerImage?: string;
};

// GET /api/hero — single hero document (added in apiRoutes.js).
export const getHero = () =>
  apiGet<ApiHero | null>('/api/hero', { next: { revalidate: 3600 } });
