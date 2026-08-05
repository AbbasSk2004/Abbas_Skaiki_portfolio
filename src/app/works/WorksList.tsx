'use client';

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { type Project } from './types';

// Client presentation for the works index. All interactivity (framer-motion
// scroll-reveals) lives here; the data fetch + API→layout merge happens in the
// server component (page.tsx) and arrives as a plain `projects` prop.

// A single blueprint crosshair. Positioned by the parent via `className`, it
// sits centred on a block corner so intersecting blocks read as a grid plan.
const Crosshair: React.FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden
    className={`pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 select-none font-mono text-xs leading-none text-zinc-500 md:block ${className ?? ''}`}
  >
    +
  </span>
);

// A motion-enabled Link so the entire cell is one clickable target that also
// participates in the scroll-reveal animation.
const MotionLink = motion.create(Link);

const ProjectBlock: React.FC<{
  project: Project;
  /** Extra image-cell classes from the macro layout, e.g. an md: aspect override. */
  aspectOverride?: string;
  /** Uniform title scale for the 2-up cards, since 7xl reads too large at half-width. */
  titleSizeOverride?: string;
  /** next/image `sizes` — the hero spans the full container, the rest are half. */
  sizes: string;
}> = ({ project, aspectOverride, titleSizeOverride, sizes }) => {
  return (
    <MotionLink
      href={`/works/${project.slug}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      // THE FIX: The card now stretches to fill the grid cell (`h-full`), and
      // the content box below gets `flex-1` so it expands to match its neighbour.
      // Grid rows stretch to the tallest item, so when one card's content box is
      // taller, `flex-1` on the others pushes their bottom borders down to align.
      //
      // Image height: the desktop `aspectOverride` is now applied via an inline
      // min-height calculation rather than an aspect-ratio class, so every 2-up
      // card gets a uniform 320px image slot regardless of its authored mobile
      // aspect. Mobile stays untouched (no md: prefix on the calculation).
      //
      // The 80vh cap is removed — it was designed for a staggered bento where
      // tall portraits needed clipping; a balanced 2-up grid with uniform image
      // heights never reaches 80vh naturally, so the cap is dead code.
      className="group relative flex h-full w-full flex-col overflow-hidden bg-[#050505]"
    >
      {/* The Image Cell — `shrink-0` pins it to its aspect ratio so the card's
          stretch (h-full) is absorbed entirely by the content box below, never
          by distorting the image. The md: aspect override gives every card in a
          row the same image height; the authored mobile aspect is untouched. */}
      <div className={`relative w-full shrink-0 overflow-hidden border-b border-white/10 bg-zinc-900 ${project.aspect} ${aspectOverride ?? ''}`}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={sizes}
          className="object-cover object-center opacity-80 grayscale transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors duration-700 group-hover:bg-transparent" />
        {/* Category marker — editorial detail, top-left of the frame */}
        <span className="absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-widest text-white/70 sm:text-xs">
          / {project.category}
        </span>
      </div>

      {/* The Metadata Row — title left, tags right, split by a vertical border.
          Equal heights: `flex-1` makes this box absorb all the card's leftover
          height. Since the grid stretches every card in a row to the tallest one,
          and the image above is `shrink-0`, this box is the only thing that
          grows — so the bottom borders line up across the row.

          Split ratio: 3fr/2fr (60/40), NOT 50/50. Titles are long uppercase
          words ("ARCHITECTURE") while tags are short mono labels, so an even
          split starves the side that needs the room. This pushes the divider
          right, giving the title enough width to fit without breaking mid-word.

          Mobile-first: stacks into a single full-width column (`flex-col`, no
          divider); the two-column split + `border-l` separator start at `md:`. */}
      <div className="flex flex-1 flex-col transition-colors group-hover:bg-white/[0.02] md:grid md:grid-cols-[3fr_2fr] md:items-stretch">
        {/* Left cell: massive uppercase title.
            `min-w-0` is mandatory — without it a grid child's min-width defaults
            to `auto` (its intrinsic content width), so a long word expands the
            column and bursts through the padding into the divider. `md:pr-8`
            holds a hard gutter, and `break-words` is the last-resort safety net
            for a word longer than the column can ever fit. */}
        <div className="flex min-w-0 items-center p-6 pb-2 md:p-8 md:pr-8">
          <h3 className={`font-['Space_Grotesk'] break-words font-bold uppercase leading-[0.95] tracking-tight text-zinc-100 ${titleSizeOverride ?? project.titleSize}`}>
            {project.title}
          </h3>
        </div>
        {/* Right cell: stacked monospace tags — left-aligned when stacked on
            mobile, right-aligned in the two-column layout at `md:`; the vertical
            separator only appears at `md:`. `min-w-0` here too so a long tag
            ("NODE.JS/EXPRESS") can't push back against the title's column. */}
        <div className="flex min-w-0 flex-col items-start justify-center gap-1 border-white/10 p-6 pt-2 text-left md:items-end md:border-l md:p-8 md:pt-8 md:text-right">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-zinc-300 sm:text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </MotionLink>
  );
};

// A structural grid cell. This — NOT the card — is the direct grid item, so it
// carries the span, the architectural border walls, and the blueprint
// crosshairs. Grid items stretch to the row height by default, and the card
// inside is `h-full`, so it fills the cell completely — that's what makes the
// bottom borders align across a row. (Previously `content-start` pinned the card
// to the top of the cell, which is what left the ragged bottom edges.)
const GridCell: React.FC<{ span: string; children: React.ReactNode }> = ({ span, children }) => (
  <div className={`relative col-span-1 grid border border-white/10 ${span}`}>
    {/* Blueprint crosshairs at every corner of the cell */}
    <Crosshair className="left-0 top-0" />
    <Crosshair className="right-0 top-0" />
    <Crosshair className="bottom-0 left-0" />
    <Crosshair className="bottom-0 right-0" />
    {children}
  </div>
);

// Receives the already-fetched, already-merged projects from the server page.
export function WorksList({ projects }: { projects: Project[] }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-16">
      {/* Works Hero */}
      <div className="mb-16 flex flex-col justify-between border-b border-white/10 pb-12 md:mb-24 md:flex-row md:items-end">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            • SELECTED WORKS
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl font-['Space_Grotesk'] text-[clamp(3rem,8vw,8rem)] font-bold uppercase leading-[0.85] tracking-tighter text-zinc-100"
          >
            BUILT TO<br />STAND OUT
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-sm text-left font-['Inter'] text-sm text-zinc-400 md:mt-0 md:text-right"
        >
          A curated selection of my latest work. Showcasing precision execution,
          technical depth, and a commitment to high-end digital aesthetics.
        </motion.p>
      </div>

      {/* Macro grid: full-width hero row, then a balanced 2-up run beneath it.
          `grid-cols-1` keeps mobile a single stacked column — the md: spans only
          engage at the breakpoint. Grid lines live on the GridCell wrappers
          (which stretch to the row height) so a short card never inherits dead
          space; the card inside each cell keeps its intrinsic height. */}
      <div className="grid grid-cols-1 items-stretch gap-x-6 gap-y-16 md:grid-cols-4 md:gap-y-24">
        {projects.map((project, index) => {
          // Positional layout: the first project is the full-width banner, every
          // subsequent one takes half the 4-column macro grid, giving a balanced
          // 2-up run beneath it. Derived from `index` rather than the per-slug
          // `span` hint so the pattern holds for any project count — including
          // rows added later via the admin panel, which carry no hint.
          const span = index === 0 ? 'md:col-span-4' : 'md:col-span-2';
          // The hero is a wide banner; the 2-up rows below are near-square cells.
          // Applied as an md:-only override so every mobile aspect stays exactly
          // as authored in LAYOUT_HINTS.
          const aspectOverride =
            index === 0 ? 'md:aspect-[21/9]' : 'md:aspect-[4/3]';
          const sizes =
            index === 0
              ? '(max-width: 768px) 100vw, 1280px'
              : '(max-width: 768px) 100vw, 50vw';
          // The per-slug titleSize was authored for the old staggered widths
          // (7xl for a 4-col hero, 3xl for a 1-col card). At a uniform half-width
          // those clash — 7xl overflows, 3xl looks undersized. The hero keeps its
          // authored scale; the 2-up cards share one sized to the 3fr title
          // column: at text-4xl the longest real title ("ARCHITECTURE", ~264px)
          // clears the ~298px of usable width, so it never breaks mid-word.
          const titleSizeOverride = index === 0 ? undefined : 'text-2xl md:text-4xl';
          return (
            <GridCell key={project.slug} span={span}>
              <ProjectBlock
                project={project}
                aspectOverride={aspectOverride}
                titleSizeOverride={titleSizeOverride}
                sizes={sizes}
              />
            </GridCell>
          );
        })}
      </div>

      {/* Footer marker */}
      <div className="mt-24 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          [ END OF INDEX ]
        </span>
        <a
          href="#contact"
          className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:text-white"
        >
          START A PROJECT
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      </div>
    </main>
  );
}
