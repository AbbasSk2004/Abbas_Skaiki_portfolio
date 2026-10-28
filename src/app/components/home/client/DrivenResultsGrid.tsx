'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, useReducedMotion, animate } from 'motion/react';

// Client presentation for the driven-results metric grid. The data (fetched
// from /api/driven-results with 1-hour ISR) is resolved in the server component
// DrivenResultsSection.tsx and arrives as the `metrics` prop; all the animated
// count-up interactivity stays here.
export type Metric = {
  num: number;
  prefix: string;
  suffix: string;
  label: string;
  desc: string;
};

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

const AnimatedCounter: React.FC<{ value: number; prefix: string; suffix: string }> = ({
  value,
  prefix,
  suffix,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(false);
  const count = useMotionValue(value);
  const [coefficient, exponent = '0'] = value.toString().split('e');
  const precision = Math.min(100, Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent)));
  const rounded = useTransform(count, (latest) => Number(latest.toFixed(precision)));
  const finalValue = `${prefix}${value}${suffix}`;

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      setIsAnimating(false);
      return;
    }

    count.set(0);
    setIsAnimating(true);
    const controls = animate(count, value, {
      duration: 2.5,
      ease: 'easeOut',
      onComplete: () => setIsAnimating(false),
    });
    return () => controls.stop();
  }, [isInView, shouldReduceMotion, count, value]);

  return (
    <span ref={ref} className="relative inline-flex items-center">
      {/* The final value is always present in HTML and accessible. Opacity
          preserves its layout and semantics while the visual overlay counts. */}
      <span className={isAnimating ? 'opacity-0' : undefined}>{finalValue}</span>
      {isAnimating && (
        <span aria-hidden="true" className="absolute inset-0 flex items-center">
          {prefix && <span>{prefix}</span>}
          <motion.span>{rounded}</motion.span>
          <span>{suffix}</span>
        </span>
      )}
    </span>
  );
};

export const DrivenResultsGrid: React.FC<{ metrics: Metric[] }> = ({ metrics }) => {
  return (
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
                <AnimatedCounter value={metric.num} prefix={metric.prefix} suffix={metric.suffix} />
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
  );
};
