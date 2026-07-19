import { apiGet } from '../api';

// Mirrors the Approach documents served by the Express backend
// (GET /api/approaches, sorted by stepNumber). Each doc is one phase card.
export type ApiApproach = {
  _id: string;
  stepNumber: number;
  title: string;
  description: string;
  approachImage?: string;
};

// GET /api/approaches — process phases in step order.
// NOTE: the route base is the plural "/api/approaches" (see approachRoutes.js),
// not "/api/approach".
export const getApproach = () =>
  apiGet<ApiApproach[]>('/api/approaches', { next: { revalidate: 3600 } });
