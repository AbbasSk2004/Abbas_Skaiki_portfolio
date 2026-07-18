// -----------------------------------------------------------------------------
// Single source of truth for project data.
//
// Both the listing surfaces (SelectedWorksSection, WorksPage) and the
// ProjectDetailsPage read from here. Listing pages consume the macro-grid
// layout hints (`span`, `aspect`, `titleSize`) plus the summary fields; the
// detail page consumes the richer case-study fields (`role`, `client`,
// `challenge`, `solution`, `gallery`, links). Keeping everything in one array
// means a project is described in exactly one place and every surface stays in
// sync — add a project here and it appears in the grid AND becomes routable.
// -----------------------------------------------------------------------------

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
  client: string;
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

export const projects: Project[] = [
  {
    slug: 'destello',
    index: '01',
    title: 'DESTELLO',
    category: 'Creative Digital Studio',
    tags: ['UI/UX DESIGN', 'BRANDING', 'NEXT.JS DEV', 'AI AUTOMATION'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    span: 'md:col-span-4',
    aspect: 'aspect-[16/10] md:aspect-[21/9]',
    titleSize: 'text-4xl md:text-7xl',
    role: 'Lead Frontend Engineer & UI Designer',
    year: '2024',
    client: 'Destello Studio',
    stack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Stripe API', 'Framer Motion'],
    challenge:
      'A boutique creative studio needed a digital presence that matched the calibre of its client roster without sacrificing load performance. The brief demanded heavy motion and full-bleed imagery, which typically comes at the cost of speed and Core Web Vitals.',
    solution:
      'I built a Next.js App Router architecture with route-level code splitting and streamed server components, keeping the initial payload lean. Motion is orchestrated with Framer Motion and gated behind reduced-motion preferences, so the site feels alive without punishing performance or accessibility.',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
    ],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
  },
  {
    slug: 'libro',
    index: '02',
    title: 'LIBRO',
    category: 'Management System',
    tags: ['WEB DESIGN', 'BRANDING', 'MERN STACK'],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    span: 'md:col-span-2',
    aspect: 'aspect-[4/5]',
    titleSize: 'text-3xl md:text-5xl',
    role: 'Full-Stack Engineer',
    year: '2024',
    client: 'Internal Product',
    stack: ['React', 'Redux Toolkit', 'Node.js', 'Express', 'MongoDB', 'JWT Auth'],
    challenge:
      'Managing a growing physical and digital library manually had become error-prone: overlapping loans, no audit trail, and no way to search inventory quickly. The system needed role-based access and had to stay usable by non-technical staff.',
    solution:
      'A MERN-stack application with normalised Redux state, JWT-based authentication, and granular role permissions. Inventory search is debounced and indexed on the server, and every loan transaction writes an immutable audit record, giving administrators a reliable history.',
    gallery: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop',
    ],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
  },
  {
    slug: 'dibeh',
    index: '03',
    title: 'DIBEH',
    category: 'Platform / Web App',
    tags: ['E-COMMERCE', 'UI/UX DESIGN', 'SANITY CMS', 'FRAMER MOTION'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
    span: 'md:col-start-2 md:col-span-3',
    aspect: 'aspect-[16/9]',
    titleSize: 'text-3xl md:text-6xl',
    role: 'Frontend Engineer',
    year: '2023',
    client: 'Dibeh Architecture',
    stack: ['React', 'Sanity CMS', 'Framer Motion', 'Tailwind CSS', 'Vercel'],
    challenge:
      'An architecture practice wanted an immersive portfolio that let editors publish new projects without touching code, while preserving a gallery experience precise enough to do the architecture justice.',
    solution:
      'I modelled the content in Sanity so the studio can compose case studies with a structured editor, then rendered them through a React front end tuned for large imagery. Technical SEO was engineered in from the start — semantic markup, generated sitemaps, and optimised responsive images.',
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=2070&auto=format&fit=crop',
    ],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
  },
  {
    slug: 'glidex',
    index: '04',
    title: 'GLIDEX',
    category: 'Film Production',
    tags: ['WEB DESIGN', 'BRANDING', 'SEO'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop',
    span: 'md:col-span-1',
    aspect: 'aspect-[3/4]',
    titleSize: 'text-2xl md:text-3xl',
    role: 'Frontend Engineer & Designer',
    year: '2023',
    client: 'Glidex Films',
    stack: ['React', 'GSAP', 'Tailwind CSS', 'Cloudinary'],
    challenge:
      'A film production house needed a showreel-first site where video is the hero, but autoplaying heavy media risked slow loads and jarring layout shifts on mobile.',
    solution:
      'Video is served adaptively through Cloudinary with poster frames and lazy hydration, so the reel loads only when in view. GSAP timelines drive scroll-linked transitions that stay smooth on mid-range devices, and structured metadata improved discoverability for their brand searches.',
    gallery: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
    ],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
  },
  {
    slug: 'veon',
    index: '05',
    title: 'VEON',
    category: 'E-Commerce',
    tags: ['E-COMMERCE', 'UI/UX DESIGN', 'SHOPIFY', 'FRAMER DEV'],
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
    span: 'md:col-span-3',
    aspect: 'aspect-[16/10]',
    titleSize: 'text-3xl md:text-5xl',
    role: 'Frontend Engineer',
    year: '2024',
    client: 'Veon Apparel',
    stack: ['Shopify Hydrogen', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    challenge:
      'A fashion label migrating off a slow template store wanted a bespoke storefront that felt editorial rather than templated, without losing Shopify’s checkout and inventory backbone.',
    solution:
      'Built on Shopify Hydrogen so the storefront stays fully headless while checkout remains native. Product galleries use motion-driven transitions, and the cart is optimistic — updates render instantly and reconcile with the server, so the shopping experience never feels like it is waiting.',
    gallery: [
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    ],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
  },
];

/** Look up a single project by its URL slug. Returns undefined if not found. */
export const getProjectBySlug = (slug: string | undefined): Project | undefined =>
  projects.find((p) => p.slug === slug);

/**
 * The next project in the array, wrapping around to the first. Powers the
 * "NEXT PROJECT" footer CTA on the detail page.
 */
export const getNextProject = (slug: string): Project => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
