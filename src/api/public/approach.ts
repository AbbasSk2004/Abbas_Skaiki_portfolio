import { apiGet } from '../api';

// Mirrors the Approach SINGLETON served by the Express backend
// (GET /api/approaches). The section is ONE document: a single section image
// plus an ordered array of text-only steps — NOT a collection of step docs.
export type ApiApproach = {
  _id: string;
  approachImage?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;
};

// GET /api/approaches — the singleton Approach section (or null before first save).
// NOTE: the route base is the plural "/api/approaches" (see approachRoutes.js),
// not "/api/approach".
export const getApproach = () =>
  apiGet<ApiApproach | null>('/api/approaches', { next: { revalidate: 3600 } });
