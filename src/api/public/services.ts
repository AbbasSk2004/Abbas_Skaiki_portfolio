import { apiGet } from '../api';

export type ApiService = {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  tags: string[];
  serviceImage?: string;
  order?: number;
};

// GET /api/services — services in display order (served by serviceRoutes).
export const getServices = () =>
  apiGet<ApiService[]>('/api/services', { next: { revalidate: 3600 } });
