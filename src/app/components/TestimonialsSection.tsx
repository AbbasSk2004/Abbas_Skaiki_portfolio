'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Elian understood the direction instantly. The final result felt refined, balanced, and aligned with exactly how we wanted to present ourselves.",
    author: 'OLIVIA BENNETT',
    title: 'DIRECTOR, AESTHA STUDIO',
    avatar: '',
  },
  {
    id: 2,
    quote:
      "Working together felt effortless. Every detail was considered, and the outcome elevated our brand far beyond what we imagined.",
    author: 'MARCUS REID',
    title: 'FOUNDER, NORTHLINE',
    avatar: '',
  },
  {
    id: 3,
    quote:
      "Precision, taste, and a rare sense of restraint. The work speaks quietly but leaves a lasting impression on everyone who sees it.",
    author: 'SOFIA HARTMANN',
    title: 'HEAD OF DESIGN, KADEN & CO',
    avatar: '',
  },
];

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const active = testimonials[currentIndex];

  return (
    <section id="testimonials" className="bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 border-b border-white/10">
        {/* Center Column */}
        <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 border-x border-white/10 flex flex-col">
          {/* Block A: Header */}
          <div className="border-b border-white/10 px-12 py-20 flex flex-col items-center text-center gap-6">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              • TESTIMONIALS
            </div>
            <h2 className="font-['Space_Grotesk'] font-bold uppercase tracking-tight leading-[0.9] text-[clamp(2.5rem,5vw,4.5rem)] text-zinc-500">
              WORDS THAT
              <span className="text-white block">CARRY WEIGHT</span>
            </h2>
          </div>

          {/* Block B: Quote & Author */}
          <div className="px-12 py-20 flex flex-col items-center text-center gap-8">
            <blockquote className="font-['Inter'] text-xl md:text-2xl leading-relaxed text-zinc-300 max-w-lg mx-auto text-balance">
              &ldquo;{active.quote}&rdquo;
            </blockquote>

            <div className="flex flex-col items-center">
              {active.avatar ? (
                <Image
                  src={active.avatar}
                  alt={active.author}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full bg-zinc-800 object-cover grayscale"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-800" />
              )}
              <div className="font-mono text-xs text-white uppercase tracking-widest mt-4">
                {active.author}
              </div>
              <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                {active.title}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex flex-row gap-2">
              {testimonials.map((t, idx) => (
                <span
                  key={t.id}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Block C: Controls */}
          <div className="grid grid-cols-2 border-t border-white/10">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="border-r border-white/10 py-8 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-colors uppercase tracking-widest"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="py-8 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-colors uppercase tracking-widest"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
