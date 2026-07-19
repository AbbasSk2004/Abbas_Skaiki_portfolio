'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';
import {
  Sparkles,
  Webhook,
  Smartphone,
  Layout,
  Code2,
  Database,
  Search,
  type LucideIcon,
} from 'lucide-react';

// Icon components can't cross the server→client boundary as data, so the API
// stores an icon NAME (e.g. 'Code2') and we map it to a lucide component here.
// Names mirror the seeded TechStack.icon values (see back/config/seed-extras.js).
const IconMap: Record<string, LucideIcon> = {
  Code2,
  Database,
  Search,
  Sparkles,
  Webhook,
  Smartphone,
  Layout,
};

// A card is the plain, serializable shape passed from the server component.
export type ExpertiseCard = {
  icon: string; // lucide icon name; unknown/empty falls back to Code2
  title: string;
  desc: string;
};

// Wraps a value into the [min, max) range so the track loops seamlessly
// whether it drifts past the end (auto-scroll) or is dragged past the start (swipe).
const wrapValue = (min: number, max: number, value: number) => {
  const range = max - min;
  if (range <= 0) return value;
  let result = (value - min) % range;
  if (result < 0) result += range;
  return result + min;
};

// Seconds to travel one full copy of the list — matches the original marquee
// (animate x: 0% → -50% over 25s), so speed stays identical across breakpoints.
const SCROLL_DURATION = 25;

export const ExpertiseMarquee: React.FC<{ items: ExpertiseCard[] }> = ({ items }) => {
  // Double the items for seamless infinite scroll
  const marqueeItems = [...items, ...items];

  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // The x offset spans exactly one copy of the list (half the doubled track).
  const halfWidthRef = useRef(0);
  // Paused while the pointer hovers (desktop) or is held/dragging (mobile).
  const pausedRef = useRef(false);
  // While dragging we own x directly; skip the auto-advance on those frames.
  const draggingRef = useRef(false);

  // Measure one copy's width so wrapping stays seamless across resizes.
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        halfWidthRef.current = trackRef.current.scrollWidth / 2;
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (pausedRef.current || draggingRef.current || halfWidthRef.current === 0) return;
    // Cover one copy (halfWidth) per SCROLL_DURATION seconds. delta is ms.
    const speed = halfWidthRef.current / SCROLL_DURATION; // px/second
    const next = x.get() - (speed * delta) / 1000;
    x.set(wrapValue(-halfWidthRef.current, 0, next));
  });

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div className="w-full flex overflow-hidden">
      <motion.div
        ref={trackRef}
        className="flex cursor-grab active:cursor-grabbing touch-pan-y select-none"
        style={{ x }}
        // Desktop: pause on hover, resume when the pointer leaves.
        onHoverStart={pause}
        onHoverEnd={resume}
        // Mobile/pointer: hold to pause, release to resume auto-scroll.
        drag="x"
        dragMomentum={false}
        dragElastic={0}
        // No constraints — we wrap x manually so dragging loops infinitely.
        dragConstraints={false}
        onPointerDown={pause}
        onPointerUp={resume}
        onPointerCancel={resume}
        onDragStart={() => { draggingRef.current = true; }}
        onDrag={() => {
          // Keep the dragged offset within one copy so the loop stays seamless.
          if (halfWidthRef.current > 0) {
            x.set(wrapValue(-halfWidthRef.current, 0, x.get()));
          }
        }}
        onDragEnd={() => { draggingRef.current = false; }}
      >
        {marqueeItems.map((item, idx) => {
          const Icon = IconMap[item.icon] ?? Code2;
          return (
            <div
              key={idx}
              className="w-[300px] md:w-[400px] flex-shrink-0 p-8 border-r border-white/10 group hover:bg-white/[0.02] transition-colors flex flex-col"
            >
              <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold mb-3 text-zinc-100">{item.title}</h3>
              <p className="font-['Inter'] text-sm text-zinc-400">
                {item.desc}
              </p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
