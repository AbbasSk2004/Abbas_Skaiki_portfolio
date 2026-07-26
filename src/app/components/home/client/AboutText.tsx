'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import Image from 'next/image';

// Client presentation for the About section. The copy (bio) and portrait URL
// come from /api/about (1-hour ISR) and are resolved in the server component
// TextAboutSection.tsx; the scroll-linked word-reveal animation stays here.

// Muted base and bright reveal colors — kept in sync with the design's zinc palette.
const DIM_COLOR = '#52525b'; // zinc-600
const BRIGHT_COLOR = '#f4f4f5'; // zinc-100

// One word whose color is driven by a slice of the section's scroll progress.
// Each word owns a small [start, end] window, so words brighten in reading order
// (left-to-right, then down) rather than as a single horizontal wipe.
const Word: React.FC<{ children: string; progress: MotionValue<number>; range: [number, number] }> = ({
  children,
  progress,
  range,
}) => {
  const color = useTransform(progress, range, [DIM_COLOR, BRIGHT_COLOR]);
  return (
    <motion.span style={{ color }} className="inline-block whitespace-pre">
      {children}
    </motion.span>
  );
};

export const AboutText: React.FC<{ bio: string; portrait: string }> = ({ bio, portrait }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 50%'],
  });

  const words = bio.split(' ');

  return (
    <section id="about" className="relative border-b border-white/10 max-w-7xl mx-auto flex flex-col md:flex-row">
      {/* Left Cell: Typography */}
      <div className="relative w-full md:w-[70%] p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-12">
          • ABOUT
        </div>

        {/* Word-by-word scroll reveal: each word brightens in reading order,
            so color travels left-to-right across a line then down the block —
            matching the diagonal reading flow rather than a flat horizontal wipe. */}
        <p
          ref={containerRef}
          className="relative font-['Space_Grotesk'] text-[clamp(1.5rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight uppercase flex flex-wrap"
        >
          {words.map((word, i) => {
            // Give each word a slightly overlapping window across scroll progress
            // for a smooth trailing edge instead of hard, one-word-at-a-time jumps.
            const start = i / words.length;
            const end = (i + 1) / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word + (i < words.length - 1 ? ' ' : '')}
              </Word>
            );
          })}
        </p>
      </div>

      {/* Right Cell: Portrait */}
      <div className="w-full md:w-[30%] bg-[#0a0a0a] relative overflow-hidden group">
        {/* Mobile: lock the wrapper to the portrait's true 2:3 ratio (832x1248)
            so `fill` + object-cover has a matching box and never crops the head —
            this replicates the Vite <img> natural-height behavior. Desktop keeps
            h-full so the 30% cell stretches to the text column, where object-top
            protects the head from the center-crop. */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative w-full aspect-[2/3] md:aspect-auto md:h-full md:min-h-[400px]"
        >
          <Image
            src={portrait}
            alt="Abbas Skaiki Portrait"
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 border-[16px] border-[#050505] pointer-events-none mix-blend-overlay"></div>
        </motion.div>
      </div>
    </section>
  );
};
