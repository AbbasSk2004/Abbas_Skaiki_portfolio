import { apiGet } from '../api';

// Mirrors the Project documents served by the Express backend. The frontend
// `Project` type (works/types.ts) adds presentation-only layout hints on top of
// this via mapApiProject; see works/projectLayout.ts.
export type ApiProject = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  tags: string[];
  client?: string;
  role?: string;
  year?: number;
  challenge?: string;
  solution?: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

// GET /api/projects — all projects, newest first (served by projectRoutes).
export const getProjects = () =>
  apiGet<ApiProject[]>('/api/projects', { next: { revalidate: 3600 } });

// GET /api/portfolio-projects/slug/:slug — single project by slug.
// NOTE: the backend serves the slug lookup under /api/portfolio-projects, NOT
// /api/projects/:id (that route matches by Mongo _id). See apiRoutes.js.
export const getProjectBySlug = (slug: string) =>
  apiGet<ApiProject>(`/api/portfolio-projects/slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
