import { apiGet } from '../api';

// Mirrors the DrivenResult documents served by the Express backend
// (GET /api/driven-results, sorted by `order`). The frontend counter reads
// `value` + `suffix`; `label` and `description` fill the metric card.
export type ApiDrivenResult = {
  _id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
  order?: number;
};

// GET /api/driven-results — impact metrics in display order.
export const getDrivenResults = () =>
  apiGet<ApiDrivenResult[]>('/api/driven-results', {
    next: { revalidate: 3600 },
  });
