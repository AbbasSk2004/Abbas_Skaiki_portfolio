'use client';

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { projects, type Project } from '../data/projects';

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

// The reusable project block: a strictly-separated image cell stacked above a
// metadata row. Text is NEVER overlaid on the image — the title lives in its
// own cell, divided from the tags cell by a vertical border.
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
      className={`group relative col-span-1 block border border-white/10 bg-[#050505] ${project.span}`}
    >
      {/* Blueprint crosshairs at every corner of the block */}
      <Crosshair className="left-0 top-0" />
      <Crosshair className="right-0 top-0" />
      <Crosshair className="bottom-0 left-0" />
      <Crosshair className="bottom-0 right-0" />

      {/* The Image Cell — full-bleed within its own cell, hover reveals colour */}
      <div className={`relative w-full overflow-hidden border-b border-white/10 bg-zinc-900 ${project.aspect}`}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-80 grayscale transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors duration-700 group-hover:bg-transparent" />
        {/* Index marker — editorial detail, top-left of the frame */}
        <span className="absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-widest text-white/70 sm:text-xs">
          {project.index} / {project.category}
        </span>
      </div>

      {/* The Metadata Row — title left, tags right, split by a vertical border */}
      <div className="grid grid-cols-2 transition-colors group-hover:bg-white/[0.02]">
        {/* Left cell: massive uppercase title */}
        <div className="flex items-center p-6 md:p-8">
          <h3 className={`font-['Space_Grotesk'] font-bold uppercase leading-none tracking-tight text-zinc-100 ${project.titleSize}`}>
            {project.title}
          </h3>
        </div>
        {/* Right cell: stacked monospace tags */}
        <div className="flex flex-col items-end justify-center gap-1 border-l border-white/10 p-6 text-right md:p-8">
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

// Works content only. Navbar and the site-wide ContactFooter come from the
// shared layout (layout.tsx), so every page stays consistent.
export default function WorksPage() {
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

      {/* The Asymmetrical Staggered Grid — collapses to a single column on mobile */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-4 md:gap-y-24">
        {projects.map((project) => (
          <ProjectBlock key={project.slug} project={project} />
        ))}
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
