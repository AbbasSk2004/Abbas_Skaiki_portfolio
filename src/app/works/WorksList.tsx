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

const ProjectBlock: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <MotionLink
      href={`/works/${project.slug}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      // Intrinsic height only: `h-fit self-start` keeps the card at its natural
      // image + text height so it never stretches to match a taller neighbour.
      // Structural borders + crosshairs live on the parent cell, not here.
      //
      // `flex flex-col` + `md:max-h-[80vh]` caps the card on desktop so tall
      // portraits stay within one viewport. Only the image wrapper below shrinks
      // to absorb the ceiling (grow-0/shrink-1/basis-auto + min-h-0); the text
      // row is `shrink-0`, so the title and tags are never squeezed or clipped.
      className="group relative flex h-fit w-full flex-col self-start overflow-hidden bg-[#050505] md:max-h-[80vh]"
    >
      {/* The Image Cell — full-bleed within its own cell, hover reveals colour.
          Keeps its aspect ratio as the natural (mobile / un-capped) height, but
          `md:min-h-0` lets it crop instead of squish when the 80vh cap bites. */}
      <div className={`relative w-full overflow-hidden border-b border-white/10 bg-zinc-900 md:min-h-0 ${project.aspect}`}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center opacity-80 grayscale transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors duration-700 group-hover:bg-transparent" />
        {/* Category marker — editorial detail, top-left of the frame */}
        <span className="absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-widest text-white/70 sm:text-xs">
          / {project.category}
        </span>
      </div>

      {/* The Metadata Row — title left, tags right, split by a vertical border.
          `shrink-0` keeps it at its natural height so the 80vh cap only ever
          eats into the image above, never the labels.
          Mobile-first: stacks into a single full-width column (`flex-col`, no
          divider) so the large title can't overflow into the tags; the original
          two-column grid + `border-l` separator is restored at `md:`. */}
      <div className="flex shrink-0 flex-col transition-colors group-hover:bg-white/[0.02] md:grid md:grid-cols-2">
        {/* Left cell: massive uppercase title */}
        <div className="flex items-center p-6 pb-2 md:p-8">
          <h3 className={`font-['Space_Grotesk'] font-bold uppercase leading-none tracking-tight text-zinc-100 ${project.titleSize}`}>
            {project.title}
          </h3>
        </div>
        {/* Right cell: stacked monospace tags — left-aligned when stacked on
            mobile, right-aligned in the two-column layout at `md:`; the vertical
            separator only appears at `md:`. */}
        <div className="flex flex-col items-start justify-center gap-1 border-white/10 p-6 pt-2 text-left md:items-end md:border-l md:p-8 md:pt-8 md:text-right">
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
// crosshairs. Because grid items stretch by default, a half-filled cell keeps
// its full-height borders even when the card inside only takes its natural
// height. `content-start` pins the card to the top so the empty space sits
// below it, framed by the cell walls.
const GridCell: React.FC<{ span: string; children: React.ReactNode }> = ({ span, children }) => (
  <div className={`relative col-span-1 grid content-start border border-white/10 ${span}`}>
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

      {/* The Asymmetrical Staggered Grid — collapses to a single column on
          mobile. Grid lines live on the GridCell wrappers (which stretch to the
          row height) so a short card never inherits dead space; the card inside
          each cell keeps its intrinsic height. */}
      <div className="grid grid-cols-1 items-start gap-x-6 gap-y-16 md:grid-cols-4 md:gap-y-24">
        {projects.map((project, index) => {
          // Prefer the designed per-slug span; otherwise fall back to an
          // index-based wide/narrow alternation so hint-less (DB-added)
          // projects still read as an editorial bento rather than a uniform run.
          const span =
            project.span || (index % 2 === 0 ? 'md:col-span-3' : 'md:col-span-1');
          return (
            <GridCell key={project.slug} span={span}>
              <ProjectBlock project={project} />
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
