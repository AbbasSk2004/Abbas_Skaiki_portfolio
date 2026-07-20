import { adminFetch } from './client';
import type { ApiTechStack } from '../public/techStack';

// -----------------------------------------------------------------------------
// Admin TechStack service. Targets the private /api/admin/tech-stacks subtree.
// Reuses the public ApiTechStack type so the admin table and the public site
// share one source of truth for a card's shape.
//
// NO MEDIA: a card's `icon` is a lucide component NAME (a string), not an
// uploaded asset — so every request here is plain JSON (no FormData, no file
// branching). This is the reference frontend pattern for media-free models.
// -----------------------------------------------------------------------------

// Fields the admin form edits.
export type TechStackInput = {
  category: string;
  technologies?: string[];
  description?: string;
  icon?: string;
  order?: number;
};

// GET /api/admin/tech-stacks — full list for the dashboard table.
export const listTechStacks = () =>
  adminFetch<ApiTechStack[]>('/api/admin/tech-stacks');

// GET /api/admin/tech-stacks/:id — single card to hydrate the edit modal.
export const getTechStack = (id: string) =>
  adminFetch<ApiTechStack>(`/api/admin/tech-stacks/${id}`);

// POST /api/admin/tech-stacks — create.
export const createTechStack = (input: TechStackInput) =>
  adminFetch<ApiTechStack>('/api/admin/tech-stacks', {
    method: 'POST',
    body: input as Record<string, unknown>,
  });

// PUT /api/admin/tech-stacks/:id — update.
export const updateTechStack = (id: string, input: TechStackInput) =>
  adminFetch<ApiTechStack>(`/api/admin/tech-stacks/${id}`, {
    method: 'PUT',
    body: input as Record<string, unknown>,
  });

// DELETE /api/admin/tech-stacks/:id — delete (no assets to clean up).
export const deleteTechStack = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/tech-stacks/${id}`, { method: 'DELETE' });
