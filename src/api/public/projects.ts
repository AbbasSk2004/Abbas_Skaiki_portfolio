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
  role?: string;
  year?: number;
  challenge?: string;
  solution?: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
  /** Dedicated card/hero thumbnail (Cloudinary URL). '' when unset. */
  coverImage?: string;
  /** Detail-page gallery images (cover lives in coverImage). */
  images: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// GET /api/projects — published projects, newest first (served by projectRoutes).
export const getProjects = () =>
  apiGet<ApiProject[]>('/api/projects', { next: { revalidate: 3600 } });

// GET /api/projects?featured=true — published AND featured projects, for the
// homepage "Selected Works" section. Shares the same ISR window + cache tag as
// getProjects, so an admin toggling isFeatured triggers on-demand revalidation.
export const getFeaturedProjects = () =>
  apiGet<ApiProject[]>('/api/projects?featured=true', {
    next: { revalidate: 3600 },
  });

// GET /api/portfolio-projects/slug/:slug — single project by slug.
// NOTE: the backend serves the slug lookup under /api/portfolio-projects, NOT
// /api/projects/:id (that route matches by Mongo _id). See apiRoutes.js.
export const getProjectBySlug = (slug: string) =>
  apiGet<ApiProject>(`/api/portfolio-projects/slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
