'use client';

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Project } from '../types';

// Client presentation for a resolved project. All interactivity (motion
// scroll-reveals) lives here; slug resolution, redirects, static params and
// metadata are handled by the Server Component in page.tsx. The project is
// passed in as a prop so this component never touches the data module directly.
export function ProjectDetails({
  project,
  nextProject,
}: {
  project: Project;
  nextProject: Project;
}) {
  return (
    <main className="w-full">
      {/* --- Top Action Bar ---------------------------------------------- */}
      <div className="mx-auto flex w-full max-w-7xl items-stretch justify-between border-b border-white/10">
        <Link
          href="/works"
          className="group flex items-center gap-2 px-6 py-5 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:text-white md:px-8"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          BACK TO WORKS
        </Link>

        <div className="flex items-stretch">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 border-l border-white/10 px-6 py-5 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/[0.03] hover:text-white md:px-8"
            >
              LIVE DEMO
              <ArrowUpRight size={14} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 border-l border-white/10 px-6 py-5 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/[0.03] hover:text-white md:px-8"
            >
              GITHUB
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>

      {/* --- Hero Header (grid based) ------------------------------------ */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 border-b border-white/10 md:grid-cols-12">
        {/* Left: title container (8 of 12 cols) — widens the title cell so long
            project names have room to breathe, and halves the header height so
            the dead space above the title collapses. min-w-0 lets the column
            shrink below its content's intrinsic width (prevents grid blow-out),
            and break-words keeps a single long word from overflowing. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-w-0 flex-col justify-end border-b border-white/10 p-6 py-16 md:col-span-8 md:border-b-0 md:border-r md:p-12 md:py-16 lg:p-16"
        >
          <span className="mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-500 md:text-xs">
            / {project.category}
          </span>
          <h1 className="break-words font-['Space_Grotesk'] text-5xl font-bold uppercase leading-[0.85] tracking-tighter text-zinc-100 md:text-7xl lg:text-8xl">
            {project.title}
          </h1>
        </motion.div>

        {/* Right: asymmetric metadata split (4 of 12 cols). ROLE / YEAR sit as a
            1×2 row on mobile (no dead vertical space), then stack into a 50/50
            flex column on desktop; TECH STACK runs full-height alongside. With
            the 12-col outer grid this gives Role ~2/12 and Tech Stack ~2/12. */}
        <div className="grid grid-cols-1 md:col-span-4 md:grid-cols-2">
          {/* ROLE & YEAR — grid row on mobile, flex column on desktop */}
          <div className="grid grid-cols-2 border-white/10 md:flex md:flex-col md:border-r">
            {/* ROLE */}
            <div className="flex min-h-[120px] flex-1 flex-col justify-between border-b border-r border-white/10 p-6 md:min-h-[140px] md:border-r-0 md:p-8">
              <span className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Role</span>
              <span className="font-['Inter'] text-sm font-medium leading-snug text-zinc-100 md:text-base lg:text-lg">
                {project.role}
              </span>
            </div>
            {/* YEAR */}
            <div className="flex min-h-[120px] flex-1 flex-col justify-between border-b border-white/10 p-6 md:min-h-[140px] md:border-b-0 md:p-8">
              <span className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Year</span>
              <span className="font-['Inter'] text-sm font-medium text-zinc-100 md:text-base lg:text-lg">{project.year}</span>
            </div>
          </div>

          {/* Right column: TECH STACK, full height */}
          <div className="flex h-full min-h-[140px] flex-col p-6 md:min-h-[280px] md:p-8">
            <span className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Tech Stack</span>
            <ul className="flex flex-col gap-1">
              {project.stack.map((tech) => (
                <li key={tech} className="font-['Inter'] text-sm font-medium text-zinc-300 lg:text-base">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* --- Content Split: sticky sidebar + media gallery --------------- */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-12">
        {/* Sticky sidebar */}
        <aside className="border-b border-white/10 md:col-span-4 md:border-b-0 md:border-r">
          <div className="sticky top-20 flex flex-col gap-10 p-6 md:p-12">
            <div className="flex flex-col gap-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                • The Challenge
              </h2>
              <p className="font-['Inter'] text-sm leading-relaxed text-zinc-400">
                {project.challenge}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                • The Solution
              </h2>
              <p className="font-['Inter'] text-sm leading-relaxed text-zinc-400">
                {project.solution}
              </p>
            </div>
          </div>
        </aside>

        {/* Media gallery — massive, edge-to-edge, each framed by a bottom border */}
        <div className="flex flex-col md:col-span-8">
          {project.gallery.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-zinc-900 last:border-b-0"
            >
              <Image
                src={src}
                alt={`${project.title} — view ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Next Project CTA -------------------------------------------- */}
      <Link
        href={`/works/${nextProject.slug}`}
        className="group relative flex w-full flex-col gap-4 border-t border-white/10 bg-[#050505] px-6 py-16 transition-colors duration-300 hover:bg-white hover:text-black md:px-12 md:py-24"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-black/60">
            Next Project
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
          </span>
          <span className="font-['Space_Grotesk'] text-5xl font-bold uppercase leading-[0.85] tracking-tighter md:text-8xl">
            {nextProject.title}
          </span>
        </div>
      </Link>
    </main>
  );
}
