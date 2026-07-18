'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-12 overflow-hidden border-b border-white/10 max-w-7xl mx-auto">
      <div className="relative z-10 w-full flex flex-col">
        {/* Name First Part */}
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full text-left md:w-auto font-['Space_Grotesk'] text-[20vw] md:text-[clamp(4rem,10vw,12rem)] font-bold leading-[0.85] tracking-tighter uppercase text-zinc-100 z-10"
        >
          Abbas
        </motion.h1>

        {/* Center Section: Overlapping Image & Name Second Part */}
        <div className="relative flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end w-full gap-8 md:gap-0 mt-12 md:mt-0">

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-[40%] w-[75vw] max-w-[300px] aspect-[3/4] md:w-[320px] md:h-[420px] z-20 grayscale hover:grayscale-0 transition-all duration-700"
          >
            <div className="w-full h-full border border-white/20 p-2 bg-[#050505]">
              {/* Inner relative wrapper so next/image `fill` covers the content
                  box (inside the p-2 frame), preserving the original inset look. */}
              <div className="relative w-full h-full">
                <Image
                  src="/assets/abbas.png"
                  alt="Portrait of Abbas Skaiki"
                  fill
                  sizes="(max-width: 768px) 75vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="absolute top-4 left-[calc(100%-28px)] whitespace-nowrap font-mono text-[10px] text-zinc-500 uppercase rotate-90 origin-top-left z-30">
              EST. 2024 / Portfolio
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full text-right md:w-auto font-['Space_Grotesk'] text-[20vw] md:text-[clamp(4rem,10vw,12rem)] font-bold leading-[0.85] tracking-tighter uppercase text-zinc-100 md:ml-auto z-10"
          >
            Skaiki
          </motion.h1>
        </div>

        {/* Lower Content */}
        <div className="mt-16 md:mt-32 flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="font-mono text-xs uppercase text-zinc-400 max-w-[200px]"
          >
            Creative Developer<br/>
            Based in the Digital Realm
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="font-['Inter'] text-sm md:text-base text-zinc-400 max-w-sm text-left md:text-right"
          >
            Crafting high-end, end-to-end production web applications with a focus on asymmetrical design, technical SEO, and modern architectures.
          </motion.div>
        </div>
      </div>
    </section>
  );
};
