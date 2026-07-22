import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProjects } from '@/api/public/projects';
import { mapApiProject, sortByIndex } from '../works/projectLayout';

// The home page teaser shows only featured projects (up to three); the full set
// lives on /works. Data comes from the Express API (1-hour ISR via
// getFeaturedProjects, which requests ?featured=true) and is sorted into the
// same editorial order as the works index.
//
// Async Server Component — no client state, links are next/link.
export const SelectedWorksSection: React.FC = async () => {
  const featured = sortByIndex((await getFeaturedProjects()).map(mapApiProject)).slice(0, 3);

  return (
    <section id="selected-works" className="w-full bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-12 border-b border-white/10">

        {/* The Header Row — title anchored left, directly below the label */}
        <div className="col-span-12 border-b border-white/10 p-6 md:p-12 flex flex-col items-start justify-start gap-4">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            • SELECTED WORKS
          </div>
          <h2 className="font-['Space_Grotesk'] text-[clamp(2.5rem,6vw,5rem)] font-bold uppercase tracking-tight leading-[0.9] text-white text-left max-w-3xl">
            CURATED DIGITAL EXPERIENCES
          </h2>
        </div>

        {/* The Carousel Container — three featured projects, each a link */}
        <div className="col-span-12 flex overflow-x-auto snap-x snap-mandatory border-b border-white/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {featured.map((project) => (
            <Link
              key={project.slug}
              href={`/works/${project.slug}`}
              // The <a> is the flex item, so it stretches to the tallest card in
              // the row. Put the hover glow HERE (not on the inner text row) and
              // add h-full so the glow fills the entire cell — including the
              // empty space below a short card — rather than stopping at the
              // intrinsic content height.
              className="group flex min-w-[90vw] cursor-pointer flex-col border-r border-white/10 snap-start transition-colors last:border-r-0 hover:bg-white/[0.02] md:h-full md:min-w-[33.333%]"
            >
              {/* Top Half (Cover Image) — fixed height, never stretches */}
              <div className="h-[400px] shrink-0 bg-zinc-900 relative overflow-hidden border-b border-white/10">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 33vw"
                  className="object-cover object-center grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700"></div>
              </div>

              {/* Bottom Half (title left, tags right). Transparent — the hover
                  glow lives on the parent <a>, so the empty space beneath a
                  short card glows too instead of leaving a dark gap. */}
              <div className="grid grid-cols-2 p-6 md:p-8">
                <div className="flex items-center">
                  <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight font-['Space_Grotesk']">
                    {project.title}
                  </h3>
                </div>
                <div className="text-xs font-mono text-zinc-400 text-right flex flex-col gap-1 justify-center">
                  {project.tags.map((t) => (
                    <span key={t} className="group-hover:text-white transition-colors">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Footer Row — quote left, explore link right */}
        <div className="col-span-12 grid grid-cols-12 w-full gap-6 p-6 md:p-12 border-t border-white/10">
          <div className="col-span-12 md:col-span-6 flex items-center">
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md font-['Inter']">
              These selected projects reflect my approach to clarity, usability and design. You can explore additional case studies and work examples.
            </p>
          </div>
          <div className="col-span-12 md:col-span-6 flex justify-start md:justify-end items-center">
            <Link href="/works" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-300 hover:text-white transition-colors group">
              EXPLORE ALL WORKS
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
