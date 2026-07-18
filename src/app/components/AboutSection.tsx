'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';
import { Sparkles, Webhook, Smartphone, Layout, Code2, Database, Search } from 'lucide-react';

// Wraps a value into the [min, max) range so the track loops seamlessly
// whether it drifts past the end (auto-scroll) or is dragged past the start (swipe).
const wrapValue = (min: number, max: number, value: number) => {
  const range = max - min;
  if (range <= 0) return value;
  let result = (value - min) % range;
  if (result < 0) result += range;
  return result + min;
};

const expertiseItems = [
  {
    icon: <Code2 size={32} strokeWidth={1.5} />,
    title: "Next.js Ecosystem",
    desc: "Leveraging server-side rendering, static site generation, and the App Router for optimal user experience and blazingly fast load times."
  },
  {
    icon: <Database size={32} strokeWidth={1.5} />,
    title: "MERN Stack",
    desc: "Deep proficiency in MongoDB, Express, React, and Node.js for creating scalable, data-driven backends and dynamic frontends."
  },
  {
    icon: <Search size={32} strokeWidth={1.5} />,
    title: "Technical SEO",
    desc: "Optimizing web architecture, metadata, semantic HTML, and Core Web Vitals to ensure maximum visibility and indexing by search engines."
  },
  {
    icon: <Sparkles size={32} strokeWidth={1.5} />,
    title: "AI Integration",
    desc: "Architecting and deploying LLM-driven features and automated AI workflows to enhance digital product capabilities."
  },
  {
    icon: <Webhook size={32} strokeWidth={1.5} />,
    title: "API Integration",
    desc: "Engineering secure, highly scalable RESTful and GraphQL data pipelines for seamless third-party system connectivity."
  },
  {
    icon: <Smartphone size={32} strokeWidth={1.5} />,
    title: "Mobile Apps",
    desc: "Building fluid, high-performance cross-platform mobile applications with native-like user experiences."
  },
  {
    icon: <Layout size={32} strokeWidth={1.5} />,
    title: "End-to-End Apps",
    desc: "Architecting robust production-ready ecosystems from database schema design to frontend deployment."
  }
];

// Seconds to travel one full copy of the list — matches the original marquee
// (animate x: 0% → -50% over 25s), so speed stays identical across breakpoints.
const SCROLL_DURATION = 25;

export const ExpertiseSection: React.FC = () => {
  // Double the items for seamless infinite scroll
  const marqueeItems = [...expertiseItems, ...expertiseItems];

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
    <section id="expertise" className="relative overflow-hidden bg-[#050505]">
      <div className="max-w-7xl mx-auto border-b border-white/10">

        {/* Header Block */}
        <div className="p-6 md:p-12 border-b border-white/10">
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            • EXPERTISE & STACK
          </div>
        </div>

        {/* Marquee Container */}
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
            {marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] md:w-[400px] flex-shrink-0 p-8 border-r border-white/10 group hover:bg-white/[0.02] transition-colors flex flex-col"
              >
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold mb-3 text-zinc-100">{item.title}</h3>
                <p className="font-['Inter'] text-sm text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
};
