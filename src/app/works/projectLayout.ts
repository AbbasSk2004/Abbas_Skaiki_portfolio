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
// Note: column placement is NOT a per-slug hint. The listing derives it from
// position — first project full-width, the rest 2-up (see WorksList) — so the
// pattern holds for any project count, including admin-added rows. Only the
// mobile aspect ratio, title scale, and editorial index are authored here.
type LayoutHint = {
  index: string;
  aspect: string;
  titleSize: string;
};

const LAYOUT_HINTS: Record<string, LayoutHint> = {
  destello: {
    index: '01',
    aspect: 'aspect-[16/10]',
    titleSize: 'text-2xl md:text-7xl',
  },
  libro: {
    index: '02',
    aspect: 'aspect-[4/5]',
    titleSize: 'text-2xl md:text-5xl',
  },
  dibeh: {
    index: '03',
    aspect: 'aspect-[16/9]',
    titleSize: 'text-2xl md:text-6xl',
  },
  glidex: {
    index: '04',
    aspect: 'aspect-[3/4]',
    titleSize: 'text-2xl md:text-3xl',
  },
  veon: {
    index: '05',
    aspect: 'aspect-[16/10]',
    titleSize: 'text-2xl md:text-5xl',
  },
};

// Fallback for any project added via the DB/admin panel that has no layout hint
// yet. Column placement is positional (see WorksList), so only the card's mobile
// aspect and title scale need a default here.
const DEFAULT_HINT: LayoutHint = {
  index: '—',
  aspect: 'aspect-[4/5]',
  titleSize: 'text-3xl md:text-5xl',
};

/**
 * Merge an API project document with its frontend layout hints.
 *
 * Cover vs. gallery: the backend now stores a dedicated `coverImage` (card /
 * hero thumbnail) separately from `images` (the detail-page gallery). The card
 * `image` maps from `coverImage`, falling back to the first gallery image for
 * any legacy doc that predates the split; the gallery maps straight from
 * `images`.
 */
export function mapApiProject(api: ApiProject): Project {
  const hint = LAYOUT_HINTS[api.slug] ?? DEFAULT_HINT;
  return {
    slug: api.slug,
    index: hint.index,
    title: api.title,
    category: api.category ?? '',
    tags: api.tags ?? [],
    image: api.coverImage || api.images?.[0] || '',
    aspect: hint.aspect,
    titleSize: hint.titleSize,
    role: api.role ?? '',
    year: api.year != null ? String(api.year) : '',
    stack: api.stack ?? [],
    challenge: api.challenge ?? '',
    solution: api.solution ?? '',
    gallery: api.images ?? [],
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
