'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react';

const metrics = [
  {
    num: 22,
    suffix: "+",
    label: "PROJECTS",
    desc: "Websites engineered and deployed for startups, applications, and brands globally."
  },
  {
    num: 98,
    suffix: "%",
    label: "CLIENT SATISFACTION",
    desc: "Built on long-term partnerships, architectural reliability, and clear delivery timelines."
  },
  {
    num: 4,
    suffix: "+",
    label: "YEARS EXPERIENCE",
    desc: "Refining full-stack production pipelines, system performance, and automated logic."
  },
  {
    num: 5,
    suffix: "+",
    label: "AVG RATING",
    desc: "Trusted by founders and tech teams to deliver exceptionally polished product architectures."
  }
];

// Four-dot progress indicator: `active` dots take the accent color in order,
// the rest stay muted. Box 1 colors 1 dot, box 2 colors 2, and so on —
// mirroring the Approach section.
const ProgressDots: React.FC<{ active: number }> = ({ active }) => (
  <div className="flex flex-row items-center gap-1.5">
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${
          i < active ? 'bg-red-500' : 'bg-zinc-700'
        }`}
      />
    ))}
  </div>
);

const AnimatedCounter: React.FC<{ value: number; suffix: string }> = ({ value, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 2.5, ease: "easeOut" });
    }
  }, [isInView, count, value]);

  return (
    <span ref={ref} className="flex items-center">
      <motion.span>{rounded}</motion.span>
      <span>{suffix}</span>
    </span>
  );
};

export const DrivenResultsSection: React.FC = () => {
  return (
    <section id="results" className="w-full bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto border-b border-white/10">

        {/* Top Block (The Headline Row) */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Pane */}
          <div className="col-span-1 md:col-span-4 border-b md:border-b-0 md:border-r border-white/10 p-6 md:p-12 flex flex-col">
            <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
              • DRIVEN RESULTS
            </div>
            {/* The rest is intentionally clean and negative-space driven */}
          </div>

          {/* Right Pane */}
          <div className="col-span-1 md:col-span-8 p-6 md:p-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.1] font-['Space_Grotesk'] text-white">
              THE WORK DOESN'T JUST LOOK GOOD — IT PERFORMS. HERE'S THE IMPACT BEHIND THE DESIGN.
            </h2>
          </div>
        </div>

        {/* Bottom Block (The Metric Grid): 2x2 on mobile, 4x1 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 w-full border-t border-white/10">
          {metrics.map((metric, idx) => {
            // 2x2 on mobile: right border on the left column (even index),
            // bottom border on the top row (first two items).
            // 4x1 on desktop: right border on the first three, none on the last,
            // and no bottom borders (single edge-to-edge row).
            const mobileRight = idx % 2 === 0 ? 'border-r' : '';
            const mobileBottom = idx < 2 ? 'border-b' : '';
            const desktopRight = idx < metrics.length - 1 ? 'md:border-r' : 'md:border-r-0';

            return (
            <div
              key={idx}
              className={`border-white/10 ${mobileRight} ${mobileBottom} ${desktopRight} md:border-b-0 p-8 flex flex-col justify-between min-h-[280px] group hover:bg-white/[0.02] transition-colors`}
            >
              <div>
                <div className="mb-4">
                  <ProgressDots active={idx + 1} />
                </div>
                <div className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter my-2 font-['Space_Grotesk']">
                  <AnimatedCounter value={metric.num} suffix={metric.suffix} />
                </div>
                <div className="text-xs font-mono tracking-widest uppercase text-white mb-2 mt-6">
                  {metric.label}
                </div>
              </div>
              <div className="text-zinc-500 text-sm leading-relaxed max-w-[220px] font-['Inter']">
                {metric.desc}
              </div>
            </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
