import { adminFetch } from './client';
import type { ApiProject } from '../public/projects';

// -----------------------------------------------------------------------------
// Admin Projects service. Mirrors the public projects service (../public/
// projects.ts) but targets the private /api/admin/projects subtree and covers
// the full write surface. Reuses the public ApiProject type so the admin table
// and the public site share one source of truth for a project's shape.
// -----------------------------------------------------------------------------

// Fields the admin form edits. images[] holds already-hosted Cloudinary URLs
// the admin chose to keep; brand-new files are sent separately as `imageFiles`.
export type ProjectInput = {
  title: string;
  slug: string;
  category?: string;
  tags?: string[];
  client?: string;
  role?: string;
  year?: number;
  challenge?: string;
  solution?: string;
  stack?: string[];
  liveUrl?: string;
  githubUrl?: string;
  images?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
};

// Build a multipart body when there are files to upload, otherwise send JSON.
// The backend controller accepts either (see admin/projectController.js).
function toFormData(input: ProjectInput, files: File[]): FormData {
  const fd = new FormData();
  // Scalars + arrays. Arrays are JSON-encoded; the controller JSON.parses them.
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
    else fd.append(key, String(value));
  });
  files.forEach((file) => fd.append('images', file));
  return fd;
}

// GET /api/admin/projects — full list for the dashboard table.
export const listProjects = () => adminFetch<ApiProject[]>('/api/admin/projects');

// GET /api/admin/projects/:id — single project to hydrate the edit modal.
export const getProject = (id: string) =>
  adminFetch<ApiProject>(`/api/admin/projects/${id}`);

// POST /api/admin/projects — create. Sends multipart when files are present
// (adminFetch omits Content-Type for FormData so the browser sets the boundary),
// otherwise a plain JSON object body that adminFetch encodes.
export const createProject = (input: ProjectInput, files: File[] = []) => {
  const body = files.length ? toFormData(input, files) : (input as Record<string, unknown>);
  return adminFetch<ApiProject>('/api/admin/projects', { method: 'POST', body });
};

// PUT /api/admin/projects/:id — update. Same multipart-vs-JSON branching.
export const updateProject = (id: string, input: ProjectInput, files: File[] = []) => {
  const body = files.length ? toFormData(input, files) : (input as Record<string, unknown>);
  return adminFetch<ApiProject>(`/api/admin/projects/${id}`, { method: 'PUT', body });
};

// DELETE /api/admin/projects/:id — removes the doc and its Cloudinary assets.
export const deleteProject = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/projects/${id}`, { method: 'DELETE' });
