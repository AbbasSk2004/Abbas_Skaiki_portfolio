import { apiGet } from '../api';

export type ApiHero = {
  _id: string;
  firstName: string;
  lastName: string;
  roleLabel?: string;
  intro?: string;
  badge?: string;
  headerImage?: string;
  // Four-cell facts row (InfoStrip). Optional until seeded/saved.
  location?: string;
  field?: string;
  approach?: string;
  clients?: string;
};

// GET /api/hero — single hero document (added in apiRoutes.js).
export const getHero = () =>
  apiGet<ApiHero | null>('/api/hero', { next: { revalidate: 3600 } });
