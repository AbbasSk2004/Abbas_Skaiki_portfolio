import React from 'react';
import Image from 'next/image';

interface Phase {
  index: string;
  title: string;
  desc: string;
  active: number;
}

const phases: Phase[] = [
  {
    index: '01/',
    title: 'DISCOVERY & INSIGHT',
    desc: 'I start by understanding your world – your audience, your goals, and the challenges behind them.',
    active: 1,
  },
  {
    index: '02/',
    title: 'STRUCTURE & STRATEGY',
    desc: 'User flows, content direction, and the overall framework. This is where ideas take shape.',
    active: 2,
  },
  {
    index: '03/',
    title: 'DESIGN & BUILD',
    desc: 'I explore visuals and layouts that elevate your brand while staying aligned with your goals.',
    active: 3,
  },
  {
    index: '04/',
    title: 'REFINE & FINALIZE',
    desc: 'This final phase ensures everything feels cohesive, intuitive, and ready for real-world use.',
    active: 4,
  },
];

// Four-dot progress indicator: `active` dots highlighted, the rest muted.
const ProgressDots: React.FC<{ active: number }> = ({ active }) => (
  <div className="flex flex-row items-center gap-1.5">
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          i < active ? 'bg-red-500' : 'bg-zinc-600'
        }`}
      />
    ))}
  </div>
);

// Faint structural accent placed at grid-line intersections.
const GridPlus: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute z-10 text-zinc-600 font-light text-sm leading-none pointer-events-none select-none -translate-x-1/2 -translate-y-1/2 ${className}`}
  >
    +
  </span>
);

// Static layout (data-driven, no hooks/events) → Server Component.
export const ApproachSection: React.FC = () => {
  return (
    <section id="approach" className="bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto border-b border-white/10 relative">
        {/* Block 1: Header Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/10">
          {/* Left Side */}
          <div className="md:col-span-8 px-8 py-16">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-4">
              • APPROACH
            </div>
            <h2 className="font-['Space_Grotesk'] font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] uppercase tracking-tight">
              <span className="text-zinc-500">CREATIVE</span>
              <span className="text-white block">APPROACH</span>
            </h2>
          </div>

          {/* Right Side */}
          <div className="md:col-span-4 px-8 py-16 flex items-end border-t md:border-t-0 md:border-l border-white/10">
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider leading-relaxed">
              "EVERY PROJECT IS DIFFERENT, BUT THE PATH TO GREAT WORK STAYS THE
              SAME – A BALANCE OF RESEARCH, CLARITY, CREATIVITY, AND
              REFINEMENT."
            </p>
          </div>
        </div>

        {/* Block 2: Main Layout Row */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Image */}
          <div className="md:col-span-6 border-b md:border-b-0 md:border-r border-white/10 relative min-h-[300px] md:min-h-full md:h-auto">
            <Image
              src="/assets/approach.png"
              alt="Creative approach visual"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right Column: 2x2 Phase Grid */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2">
            {/* Box 1 */}
            <div className="border-b sm:border-r border-white/10 p-8 flex flex-col justify-between min-h-[250px] group hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-row items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">
                  {phases[0].index}
                </span>
                <ProgressDots active={phases[0].active} />
              </div>
              <div>
                <h3 className="font-mono text-sm text-white uppercase tracking-wider mb-2">
                  {phases[0].title}
                </h3>
                <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-normal leading-relaxed">
                  {phases[0].desc}
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="border-b border-white/10 p-8 flex flex-col justify-between min-h-[250px] group hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-row items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">
                  {phases[1].index}
                </span>
                <ProgressDots active={phases[1].active} />
              </div>
              <div>
                <h3 className="font-mono text-sm text-white uppercase tracking-wider mb-2">
                  {phases[1].title}
                </h3>
                <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-normal leading-relaxed">
                  {phases[1].desc}
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="border-b sm:border-b-0 sm:border-r border-white/10 p-8 flex flex-col justify-between min-h-[250px] group hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-row items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">
                  {phases[2].index}
                </span>
                <ProgressDots active={phases[2].active} />
              </div>
              <div>
                <h3 className="font-mono text-sm text-white uppercase tracking-wider mb-2">
                  {phases[2].title}
                </h3>
                <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-normal leading-relaxed">
                  {phases[2].desc}
                </p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="p-8 flex flex-col justify-between min-h-[250px] group hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-row items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">
                  {phases[3].index}
                </span>
                <ProgressDots active={phases[3].active} />
              </div>
              <div>
                <h3 className="font-mono text-sm text-white uppercase tracking-wider mb-2">
                  {phases[3].title}
                </h3>
                <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-normal leading-relaxed">
                  {phases[3].desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Accent Pluses – positioned at grid-line intersections.
            Hidden on stacked mobile where the 12-col grid collapses. */}
        <div className="hidden md:block">
          {/* Header row: junction of left/right split and the row below it */}
          <GridPlus className="left-[66.666%] top-0" />
          <GridPlus className="left-[66.666%] top-[var(--approach-header-bottom,auto)] bottom-0" />
          {/* Vertical seam between image column and the 2x2 phase grid */}
          <GridPlus className="left-1/2 top-1/2" />
          {/* Center intersection of the 2x2 phase sub-grid (right half) */}
          <GridPlus className="left-3/4 top-1/2" />
        </div>
      </div>
    </section>
  );
};
