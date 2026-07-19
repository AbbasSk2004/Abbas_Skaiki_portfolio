// -----------------------------------------------------------------------------
// Presentation layer for projects.
//
// Per the Phase 5 decision: CONTENT lives in the database (served by the Express
// API) while LAYOUT HINTS (macro-grid placement, card aspect ratio, title scale,
// editorial index) stay in the frontend — they're pure presentation and were
// intentionally never seeded.
//
// `mapApiProject` merges an API document with its layout hints to produce the
// exact `Project` shape the existing components already consume, so ProjectBlock
// and ProjectDetails need no field changes.
// -----------------------------------------------------------------------------

import type { Project } from './types';
import type { ApiProject } from '@/api/public/projects';

// Per-slug layout hints. Keyed by slug so a project's placement is stable no
// matter what order the API returns rows in.
type LayoutHint = {
  index: string;
  span: string;
  aspect: string;
  titleSize: string;
};

const LAYOUT_HINTS: Record<string, LayoutHint> = {
  destello: {
    index: '01',
    span: 'md:col-span-4',
    aspect: 'aspect-[16/10] md:aspect-[21/9]',
    titleSize: 'text-4xl md:text-7xl',
  },
  libro: {
    index: '02',
    span: 'md:col-span-2',
    aspect: 'aspect-[4/5]',
    titleSize: 'text-3xl md:text-5xl',
  },
  dibeh: {
    index: '03',
    span: 'md:col-start-2 md:col-span-3',
    aspect: 'aspect-[16/9]',
    titleSize: 'text-3xl md:text-6xl',
  },
  glidex: {
    index: '04',
    span: 'md:col-span-1',
    aspect: 'aspect-[3/4]',
    titleSize: 'text-2xl md:text-3xl',
  },
  veon: {
    index: '05',
    span: 'md:col-span-3',
    aspect: 'aspect-[16/10]',
    titleSize: 'text-3xl md:text-5xl',
  },
};

// Fallback for any project added via the DB/admin panel that has no layout hint
// yet — a safe, single-column block so new rows render rather than crash.
const DEFAULT_HINT: LayoutHint = {
  index: '—',
  span: 'md:col-span-2',
  aspect: 'aspect-[4/5]',
  titleSize: 'text-3xl md:text-5xl',
};

/**
 * Merge an API project document with its frontend layout hints.
 *
 * Image reconstruction: the backend stores `images: [cover, ...gallery]`
 * (see back/config/seed.js), so the cover is `images[0]` and the detail-page
 * gallery is `images.slice(1)` — this reproduces the original component data
 * exactly.
 */
export function mapApiProject(api: ApiProject): Project {
  const hint = LAYOUT_HINTS[api.slug] ?? DEFAULT_HINT;
  return {
    slug: api.slug,
    index: hint.index,
    title: api.title,
    category: api.category ?? '',
    tags: api.tags ?? [],
    image: api.images?.[0] ?? '',
    span: hint.span,
    aspect: hint.aspect,
    titleSize: hint.titleSize,
    role: api.role ?? '',
    year: api.year != null ? String(api.year) : '',
    client: api.client ?? '',
    stack: api.stack ?? [],
    challenge: api.challenge ?? '',
    solution: api.solution ?? '',
    gallery: api.images?.slice(1) ?? [],
    liveUrl: api.liveUrl ?? '',
    githubUrl: api.githubUrl ?? '',
  };
}

/**
 * Stable editorial order (01, 02, 03…). The API sorts by createdAt, which is
 * not guaranteed to match the intended design order, so listing surfaces sort
 * by the layout `index` instead. Unknown-index projects sort to the end.
 */
export function sortByIndex(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const ai = parseInt(a.index, 10);
    const bi = parseInt(b.index, 10);
    if (Number.isNaN(ai)) return 1;
    if (Number.isNaN(bi)) return -1;
    return ai - bi;
  });
}
