'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimationFrame, type MotionValue } from 'motion/react';
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

type MarqueeLayout = {
  width: number;
  viewportWidth: number;
  cards: { left: number; width: number }[];
  canLoop: boolean;
};

const wrapValue = (min: number, max: number, value: number) => {
  const range = max - min;
  if (range <= 0) return value;
  return ((value - min) % range + range) % range + min;
};

const constrainOffset = (value: number, layout: MarqueeLayout) => {
  if (layout.width <= 0) return 0;
  if (layout.canLoop) return wrapValue(-layout.width, 0, value);
  return Math.max(Math.min(0, layout.viewportWidth - layout.width), Math.min(0, value));
};

const SCROLL_DURATION = 25;
const WHEEL_LINE_HEIGHT = 16;

const MarqueeCard = ({ item, index, offset, layout }: {
  item: ExpertiseCard;
  index: number;
  offset: MotionValue<number>;
  layout: MotionValue<MarqueeLayout>;
}) => {
  const x = useTransform(() => {
    const measurement = layout.get();
    const position = offset.get();
    const card = measurement.cards[index];
    if (!card || !measurement.canLoop) return position;

    // Reposition the original card only after it is fully outside the viewport.
    return wrapValue(-card.width, measurement.width - card.width, card.left + position) - card.left;
  });
  const Icon = IconMap[item.icon] ?? Code2;

  return (
    <motion.li
      style={{ x }}
      className="w-[300px] md:w-[400px] flex-shrink-0 p-8 border-r border-white/10 group hover:bg-white/[0.02] transition-colors flex flex-col"
    >
      <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon aria-hidden="true" size={32} strokeWidth={1.5} />
      </div>
      <h3 className="font-['Space_Grotesk'] text-xl font-bold mb-3 text-zinc-100">{item.title}</h3>
      <p className="font-['Inter'] text-sm text-zinc-400">{item.desc}</p>
    </motion.li>
  );
};

export const ExpertiseMarquee: React.FC<{ items: ExpertiseCard[] }> = ({ items }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pointerRef = useRef<{ id: number; x: number } | null>(null);
  const offset = useMotionValue(0);
  const layout = useMotionValue<MarqueeLayout>({
    width: 0,
    viewportWidth: 0,
    cards: [],
    canLoop: false,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!viewport || !list) return;

    const measure = () => {
      const cards = Array.from(list.children, (element) => {
        const card = element as HTMLLIElement;
        return { left: card.offsetLeft, width: card.getBoundingClientRect().width };
      });
      const width = list.getBoundingClientRect().width;
      const viewportWidth = viewport.getBoundingClientRect().width;
      const maxCardWidth = Math.max(0, ...cards.map((card) => card.width));
      const measurement = {
        width,
        viewportWidth,
        cards,
        // A spare card-width lets each card wrap entirely offscreen. Short
        // lists remain draggable within their bounds without rendering copies.
        canLoop: cards.length > 1 && width >= viewportWidth + maxCardWidth,
      };
      layout.set(measurement);
      offset.set(constrainOffset(offset.get(), measurement));
    };

    const releasePointer = () => {
      const pointer = pointerRef.current;
      pointerRef.current = null;
      if (pointer && viewport.hasPointerCapture(pointer.id)) {
        viewport.releasePointerCapture(pointer.id);
      }
    };

    const onWheel = (event: WheelEvent) => {
      const measurement = layout.get();
      if (event.ctrlKey || pointerRef.current || measurement.width <= 0) return;

      // Horizontal trackpad gestures and Shift+wheel move the cards. Ordinary
      // vertical scrolling and pinch-to-zoom retain their browser behavior.
      const delta = event.shiftKey
        ? event.deltaX || event.deltaY
        : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
      if (!delta) return;

      const unit = event.deltaMode === 1
        ? WHEEL_LINE_HEIGHT
        : event.deltaMode === 2 ? measurement.viewportWidth : 1;
      event.preventDefault();
      offset.set(constrainOffset(offset.get() - delta * unit, measurement));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(viewport);
    viewport.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('blur', releasePointer);
    measure();

    return () => {
      observer.disconnect();
      viewport.removeEventListener('wheel', onWheel);
      window.removeEventListener('blur', releasePointer);
      releasePointer();
    };
  }, [items.length, layout, offset]);

  useAnimationFrame((_, delta) => {
    const measurement = layout.get();
    if (pointerRef.current || !measurement.canLoop) return;
    const distance = (measurement.width * delta) / (SCROLL_DURATION * 1000);
    offset.set(constrainOffset(offset.get() - distance, measurement));
  });

  const startPointer: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointerRef.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePointer: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const delta = event.clientX - pointer.x;
    pointer.x = event.clientX;
    offset.set(constrainOffset(offset.get() + delta, layout.get()));
  };

  const endPointer: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerRef.current?.id !== event.pointerId) return;
    pointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={viewportRef}
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y select-none"
      onPointerDown={startPointer}
      onPointerMove={movePointer}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onLostPointerCapture={endPointer}
    >
      <ul ref={listRef} aria-label="Expertise and technology stack" className="relative flex w-max">
        {items.map((item, index) => (
          <MarqueeCard key={`${item.title}-${index}`} item={item} index={index} offset={offset} layout={layout} />
        ))}
      </ul>
    </div>
  );
};
