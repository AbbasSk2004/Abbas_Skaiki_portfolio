import { apiGet } from '../api';

// Mirrors the TechStack documents served by the Express backend
// (GET /api/tech-stacks). Used for the Expertise marquee cards: each doc is a
// capability card with a category title, prose description, and an icon NAME
// (the frontend maps the name back to a lucide component — see IconMap).
export type ApiTechStack = {
  _id: string;
  category: string;
  technologies: string[];
  description?: string;
  icon?: string;
  order?: number;
};

// GET /api/tech-stacks — expertise cards.
// NOTE: the controller sorts by createdAt (not `order`), so the component sorts
// by `order` itself to guarantee the intended display sequence.
export const getTechStacks = () =>
  apiGet<ApiTechStack[]>('/api/tech-stacks', { next: { revalidate: 3600 } });
