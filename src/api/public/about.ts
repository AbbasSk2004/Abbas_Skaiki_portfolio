import { apiGet } from '../api';

export type ApiAbout = {
  _id: string;
  bio: string;
  resumeLink?: string;
  aboutImage?: string;
  availabilityStatus?: boolean;
};

// GET /api/about — the singleton About document (served by aboutRoutes).
// The controller returns a single object (or 404 if unset), so the type is a
// single document, not an array.
export const getAbout = () =>
  apiGet<ApiAbout>('/api/about', { next: { revalidate: 3600 } });
