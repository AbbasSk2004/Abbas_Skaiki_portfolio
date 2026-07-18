# Abbas Skaiki — Portfolio (Next.js)

A high-end, editorial personal portfolio for a full-stack web developer. Dark aesthetic, asymmetrical brutalist-grid layout, precise typography, and motion-driven micro-interactions throughout.

This is the **current, canonical frontend**. It was migrated from an earlier Vite + React Router single-page app to the **Next.js App Router** to gain server rendering, static generation, first-class SEO metadata, and image optimization. The legacy Vite version (`../front-react`) is retained for reference only and is no longer maintained.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Architecture](#architecture)
  - [Rendering model: Server vs. Client Components](#rendering-model-server-vs-client-components)
  - [Routing](#routing)
  - [The shared layout shell](#the-shared-layout-shell)
  - [Single source of truth for project data](#single-source-of-truth-for-project-data)
- [Styling system](#styling-system)
- [Typography & fonts](#typography--fonts)
- [Images & `next/image`](#images--nextimage)
- [SEO & metadata](#seo--metadata)
- [Components reference](#components-reference)
- [Configuration](#configuration)
- [Contact form](#contact-form)
- [Known gaps / TODOs](#known-gaps--todos)
- [Deployment](#deployment)
- [Related packages](#related-packages)

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | **Next.js 14.2.5** (App Router)                    |
| UI library         | **React 18.3.1** / React DOM 18.3.1                |
| Language           | **TypeScript 5.5.3** (`strict` mode)               |
| Styling            | **Tailwind CSS v4.1.12** (CSS-first, `@theme`)     |
| PostCSS plugin     | `@tailwindcss/postcss` 4.1.12                       |
| Animation          | **motion** 12.23.24 (the `motion/react` package)   |
| Icons              | `lucide-react` 0.487.0                              |
| Class utilities    | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Extra animations   | `tw-animate-css` 1.3.8                              |

> Note on the animation import: this project uses the standalone **`motion`** package and imports from `motion/react` (e.g. `import { motion } from 'motion/react'`), not the older `framer-motion` specifier.

---

## Requirements

- **Node.js 18.17+** (the minimum for Next.js 14). Node 20 LTS recommended.
- npm (a `package-lock.json` is committed). pnpm/yarn work too, but the lockfile is npm.

---

## Quick start

```bash
# from this directory (front/)
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```bash
npm run build
npm run start
```

---

## Available scripts

| Script          | What it does                                    |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Start the Next.js dev server (HMR) on `:3000`.  |
| `npm run build` | Create an optimized production build.           |
| `npm run start` | Serve the production build.                     |
| `npm run lint`  | Run `next lint`.                                |

---

## Project structure

```
front/
├── next.config.mjs          # Next config — remote image hosts
├── postcss.config.mjs       # Tailwind v4 PostCSS plugin
├── tsconfig.json            # TS config; "@/*" → ./src/*
├── next-env.d.ts            # Next-generated types (do not edit)
├── package.json
├── public/
│   └── assets/              # Static assets served from site root
│       ├── abbas.png        # Portrait (832×1248, true 2:3)
│       ├── logo.png         # Brand mark — also the favicon
│       ├── approach.png
│       └── service.png
└── src/
    └── app/                 # App Router root
        ├── layout.tsx       # Root layout + global <metadata> (SEO, favicon)
        ├── page.tsx         # Home page — composes every home section
        ├── globals.css      # Tailwind entrypoint (import order matters)
        ├── fonts.css        # Google Fonts @import (MUST load first)
        ├── theme.css        # Design tokens + @theme + base layer
        ├── data/
        │   └── projects.ts  # Single source of truth for all project data
        ├── components/      # Section + chrome components
        │   ├── Navbar.tsx
        │   ├── GridBackground.tsx
        │   ├── HeroSection.tsx
        │   ├── InfoStrip.tsx
        │   ├── TextAboutSection.tsx
        │   ├── DrivenResultsSection.tsx
        │   ├── AboutSection.tsx        # exports ExpertiseSection
        │   ├── ServicesSection.tsx
        │   ├── ApproachSection.tsx
        │   ├── SelectedWorksSection.tsx
        │   ├── TestimonialsSection.tsx
        │   └── ContactFooter.tsx
        └── works/
            ├── page.tsx               # /works — full project index
            └── [slug]/
                ├── page.tsx           # Server: static params + metadata + redirect
                └── ProjectDetails.tsx # Client: case-study presentation
```

---

## Architecture

### Rendering model: Server vs. Client Components

The migration deliberately keeps components on the server unless they need the browser. A component opts into the client only when it uses hooks, state, or motion.

- **Server Components (default, no directive):**
  `layout.tsx`, `page.tsx`, `GridBackground`, `InfoStrip`, `ApproachSection`, `SelectedWorksSection`, and the `works/[slug]/page.tsx` route handler.
- **Client Components (`'use client'`):**
  `Navbar`, `HeroSection`, `TextAboutSection`, `DrivenResultsSection`, `AboutSection` (Expertise marquee), `ServicesSection`, `TestimonialsSection`, `ContactFooter`, `works/page.tsx`, and `works/[slug]/ProjectDetails.tsx` — each needs `motion`, local state, or event handlers.

The home page (`page.tsx`) itself stays a Server Component and simply composes the sections in order; interactivity is pushed down into the leaf sections that need it.

### Routing

App Router, file-based:

| Route            | File                              | Rendering                                  |
| ---------------- | --------------------------------- | ------------------------------------------ |
| `/`              | `app/page.tsx`                    | Static — the landing page                  |
| `/works`         | `app/works/page.tsx`              | Static — full project index                |
| `/works/[slug]`  | `app/works/[slug]/page.tsx`       | **SSG** via `generateStaticParams()`       |

`/works/[slug]` pre-renders one static page per project at build time. Unknown slugs are `redirect()`-ed back to `/works` (replacing the old client-side `<Navigate to="/works" />`).

### The shared layout shell

`layout.tsx` is the single place the site chrome is defined. Every route renders inside:

```
GridBackground
└── Navbar
    <main>{children}</main>
    ContactFooter
```

This replaces the old `App.tsx` `RootLayout` + React Router `<Outlet />`; `{children}` now fills the outlet role. Because the footer and navbar live here, individual pages only render their own content.

### Single source of truth for project data

`src/app/data/projects.ts` is the one place any project is described. It exports:

- `projects: Project[]` — the full ordered list.
- `getProjectBySlug(slug)` — lookup for the detail route.
- `getNextProject(slug)` — wraps around the array to power the "NEXT PROJECT" CTA.

Every surface reads from this array, so they never drift:

- `SelectedWorksSection` shows `projects.slice(0, 3)` (home teaser).
- `works/page.tsx` renders the full asymmetrical grid.
- `works/[slug]/page.tsx` resolves the case study and generates its static params + metadata.

Each `Project` carries both **layout hints** for the listing grid (`span`, `aspect`, `titleSize`) and **case-study fields** for the detail page (`role`, `client`, `challenge`, `solution`, `gallery`, `stack`, `liveUrl`, `githubUrl`). Add one object to the array and it appears in the grid **and** becomes a routable, statically-generated page automatically.

---

## Styling system

Tailwind **v4**, configured CSS-first (there is no `tailwind.config.js`). The pipeline runs through `@tailwindcss/postcss` (`postcss.config.mjs`); v4 handles vendor prefixing internally, so there is no `autoprefixer`.

`globals.css` is the entrypoint and its import order is load-bearing:

```css
@import './fonts.css';     /* 1. Google Fonts @import — MUST be first */
@import 'tailwindcss';     /* 2. Tailwind core */
@import 'tw-animate-css';  /* 3. Animation utilities */
@import './theme.css';     /* 4. Design tokens + base layer */
```

Why `fonts.css` is first: CSS requires all `@import url(...)` rules to precede other style rules. `@import 'tailwindcss'` expands into real rules, so if it came first the browser could silently drop the Google Fonts import.

`theme.css` holds:

- **Design tokens** as CSS variables under `:root` and `.dark` (colors in `oklch`/hex, radii, font weights, chart + sidebar palettes — carried over from the shadcn base theme).
- An `@theme inline { ... }` block that maps those variables to Tailwind color/radius utilities.
- A `@layer base` that pins the brand background `#050505`, forces `color-scheme: dark`, disables overscroll bounce, and sets default element typography.

The brand background `#050505` is enforced in multiple places (`html/body` base layer, `layout.tsx` `<body>`, and `GridBackground`) so there is no flash of a lighter background.

---

## Typography & fonts

Fonts load via a Google Fonts `@import` in `fonts.css`:

- **Space Grotesk** (400–700) — display headings, big uppercase type. Referenced as `font-['Space_Grotesk']`.
- **Inter** (400–600) — body copy. `font-['Inter']`.
- **Space Mono** (400/700, incl. italics) — monospace labels, tags, and editorial markers (`font-mono`).

Type scales are fluid via `clamp()` (e.g. the hero `text-[clamp(4rem,10vw,12rem)]`), so the layout holds from 375px up to ultra-wide without breakpoint churn.

---

## Images & `next/image`

All raster imagery uses `next/image`.

- **Local assets** live in `public/assets/` and are referenced by root-relative path (e.g. `/assets/abbas.png`). This replaces Vite's `import img from '...'` asset handling.
- **Remote assets** (project covers/galleries) are served from **Unsplash**. `next.config.mjs` whitelists `images.unsplash.com` under `images.remotePatterns`; add any new remote host there or `next/image` will refuse to optimize it.

**Aspect-ratio note (learned the hard way):** the portrait `abbas.png` is a true **2:3** (832×1248). When using `<Image fill>` with `object-cover`, the parent must have a matching aspect box or the image center-crops. In `TextAboutSection`, the mobile wrapper is locked to `aspect-[2/3]` (with `object-top` as a safety net on desktop) so the subject is never clipped. Keep this in mind when adding new `fill` images: give the wrapper a definite, correctly-proportioned box.

---

## SEO & metadata

Handled through the Next.js **Metadata API** (no `next/head`).

- **Global** metadata is exported from `layout.tsx`: `metadataBase`, a title template (`%s — Skaiki Development`), description, Open Graph defaults, and the favicon/apple-touch icon (all pointing at `/assets/logo.png`, which is also the browser tab icon).
- **Per-project** metadata is generated in `works/[slug]/page.tsx` via `generateMetadata()` — each case study sets its own title, description (from the project's `challenge`), and OG image (the project cover). Unknown slugs return a generic "Project not found" title before the page redirects.

> `metadataBase` is currently `https://example.com` — update it to the production origin before deploying so OG/canonical URLs resolve correctly.

---

## Components reference

| Component               | File                       | Type   | Purpose |
| ----------------------- | -------------------------- | ------ | ------- |
| `RootLayout` + metadata | `layout.tsx`               | Server | Site shell, global SEO, favicon. |
| `HomePage`              | `page.tsx`                 | Server | Composes all home sections in order. |
| `Navbar`                | `Navbar.tsx`               | Client | Fixed nav with a per-letter **scramble/decode** hover effect; animated mobile full-screen menu; hash vs. route link handling via `usePathname`. |
| `GridBackground`        | `GridBackground.tsx`       | Server | Faint 100px CSS grid + decorative corner crosshairs (desktop only). |
| `HeroSection`           | `HeroSection.tsx`          | Client | Split "ABBAS / SKAIKI" wordmark with an overlapping framed portrait; entrance motion. |
| `InfoStrip`             | `InfoStrip.tsx`            | Server | Four-cell facts row (location, field, approach, clients) with responsive 2×2 → 4×1 borders. |
| `TextAboutSection`      | `TextAboutSection.tsx`     | Client | Scroll-driven **word-by-word color reveal** of the about paragraph + portrait cell. |
| `DrivenResultsSection`  | `DrivenResultsSection.tsx` | Client | Animated count-up metrics (projects, satisfaction, years, rating). |
| `ExpertiseSection`      | `AboutSection.tsx`         | Client | Infinite draggable **marquee** of expertise cards (auto-scroll, pause on hover/drag). |
| `ServicesSection`       | `ServicesSection.tsx`      | Client | Service list with hover-reveal imagery. |
| `ApproachSection`       | `ApproachSection.tsx`      | Server | Four-phase process breakdown. |
| `SelectedWorksSection`  | `SelectedWorksSection.tsx` | Server | Home teaser — horizontal snap carousel of the first three projects. |
| `TestimonialsSection`   | `TestimonialsSection.tsx`  | Client | Stateful testimonial slider (prev/next). |
| `ContactFooter`         | `ContactFooter.tsx`        | Client | Contact block + form + nav/social footer. |
| `WorksPage`             | `works/page.tsx`           | Client | Full asymmetrical staggered project grid with blueprint crosshairs. |
| `ProjectDetailsPage`    | `works/[slug]/page.tsx`    | Server | Resolves slug, static params, metadata, redirect. |
| `ProjectDetails`        | `works/[slug]/ProjectDetails.tsx` | Client | Case-study presentation (challenge/solution, gallery, next-project CTA). |

> `AboutSection.tsx` exports its component as **`ExpertiseSection`** — the filename and export intentionally differ.

---

## Configuration

- **`tsconfig.json`** — `strict` mode on, path alias `@/*` → `./src/*`, `moduleResolution: bundler`, `jsx: preserve`. `next-env.d.ts` is auto-generated; do not edit it.
- **`next.config.mjs`** — only configures `images.remotePatterns` (Unsplash). Extend here for additional remote image hosts.
- **`postcss.config.mjs`** — registers `@tailwindcss/postcss`.

---

## Contact form

`ContactFooter` contains a working form scaffold, but submissions are **disabled by default**. The `CONTACT_ENDPOINT` constant is an empty string, and `handleSubmit` bails out early when it is unset:

```ts
const CONTACT_ENDPOINT = ''; // set to a Formspree URL or an API route to enable
```

To enable it, point `CONTACT_ENDPOINT` at a real destination (a Formspree URL or a Next.js Route Handler). The handler already `POST`s JSON and resets the form on success — the success/error UI states are marked as TODOs. Contact email/phone are also constants at the top of the file (`skaiki.dev@gmail.com`, `+961 76 937 310`).

---

## Known gaps / TODOs

- **`metadataBase`** is a placeholder (`https://example.com`) — set the real origin before shipping.
- **Contact form** is inert until `CONTACT_ENDPOINT` is configured; success/error toasts are not yet wired.
- **Social links** in the footer point at `#` placeholders.
- **Project data** (`liveUrl`/`githubUrl`) uses `https://example.com` / `https://github.com` placeholders for several entries.
- Testimonial copy references a name ("Elian") that predates the current branding — review before launch.

---

## Deployment

Standard Next.js 14 App Router app — deploys cleanly to **Vercel** with zero extra config. For other hosts, `npm run build` then `npm run start` (Node server), or use a Next-compatible adapter. Remember to:

1. Set `metadataBase` to the production URL.
2. Add any new remote image hosts to `next.config.mjs`.
3. Configure the contact endpoint if the form is going live.

---

## Related packages

This repository also contains sibling directories (not part of this frontend build):

- **`../back`** — a separate Express + Mongoose headless-CMS backend (`portfolio-headless-cms`). The frontend does **not** currently consume it; project data is bundled statically in `src/app/data/projects.ts`. Wiring the two together is a future step.
- **`../front-react`** — the legacy Vite + React Router version this app was migrated from. Kept for reference; not maintained.

Repository: <https://github.com/AbbasSk2004/Abbas_Skaiki_portfolio>
