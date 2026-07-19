import { apiGet } from '../api';

export type ApiAbout = {
  _id: string;
  bio: string;
  resumeLink?: string;
  aboutImage?: string;
  availabilityStatus?: boolean;
};

// GET /api/about — single about document (served by aboutRoutes).
export const getAbout = () =>
  apiGet<ApiAbout | ApiAbout[] | null>('/api/about', {
    next: { revalidate: 3600 },
  });
