import { adminFetch } from './client';
import type { ApiDrivenResult } from '../public/drivenResults';

// -----------------------------------------------------------------------------
// Admin DrivenResult service. Targets the private /api/admin/driven-results
// subtree. NO MEDIA — a metric is pure data, so every request is plain JSON.
// Reuses the public ApiDrivenResult type as the single source of truth.
// -----------------------------------------------------------------------------

export type DrivenResultInput = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
  order?: number;
};

// GET /api/admin/driven-results — full list for the dashboard table.
export const listDrivenResults = () =>
  adminFetch<ApiDrivenResult[]>('/api/admin/driven-results');

// GET /api/admin/driven-results/:id — single metric to hydrate the edit modal.
export const getDrivenResult = (id: string) =>
  adminFetch<ApiDrivenResult>(`/api/admin/driven-results/${id}`);

// POST /api/admin/driven-results — create.
export const createDrivenResult = (input: DrivenResultInput) =>
  adminFetch<ApiDrivenResult>('/api/admin/driven-results', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// PUT /api/admin/driven-results/:id — update.
export const updateDrivenResult = (id: string, input: DrivenResultInput) =>
  adminFetch<ApiDrivenResult>(`/api/admin/driven-results/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

// DELETE /api/admin/driven-results/:id — delete (no assets to clean up).
export const deleteDrivenResult = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/driven-results/${id}`, { method: 'DELETE' });
