// -----------------------------------------------------------------------------
// Shared project shape for the works surfaces.
//
// Project data is served from the Express API (see src/api/public/projects.ts)
// and merged with frontend layout hints (see projectLayout.ts). This file holds
// the shared TYPE only, decoupled from any data, so every works surface agrees
// on one shape.
//
// Consumers: WorksList.tsx, works/[slug]/ProjectDetails.tsx, projectLayout.ts.
// -----------------------------------------------------------------------------

// A social link as served by /api/social-links and populated into ContactInfo.
export type SocialLinkItem = {
  _id: string;
  platform: string;
  url: string;
  icon?: string;
};

// Site contact details — the singleton served by GET /api/contact.
// socialLinks is populated server-side, so it arrives as full documents.
export type ContactInfo = {
  _id: string;
  email: string;
  phone?: string;
  address?: string;
  availabilityNote?: string;
  socialLinks: SocialLinkItem[];
};

export type Project = {
  /** URL slug — the route param, e.g. /works/destello */
  slug: string;
  /** Two-digit editorial index shown on cards and the case-study header. */
  index: string;
  title: string;
  category: string;
  /** Short monospace tags rendered on listing cards. */
  tags: string[];
  /** Cover image used on listing cards. */
  image: string;

  // --- Listing macro-grid hints (md+) ---------------------------------------
  /** Tailwind column placement on the md:grid-cols-4 macro layout. */
  span: string;
  /** Aspect ratio of the card image cell — varied to break the uniform grid. */
  aspect: string;
  /** Title scale — the hero reads larger than the satellite blocks. */
  titleSize: string;

  // --- Case-study fields (detail page) --------------------------------------
  /** One-line role summary shown in the header metadata column. */
  role: string;
  year: string;
  /** Full tech-stack list for the metadata column (can differ from card tags). */
  stack: string[];
  /** "The Challenge" body copy. */
  challenge: string;
  /** "The Solution" body copy. */
  solution: string;
  /** Edge-to-edge mockup images stacked in the media gallery. */
  gallery: string[];
  /** External links. Empty string = link hidden. */
  liveUrl: string;
  githubUrl: string;
};
