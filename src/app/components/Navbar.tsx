'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Glyphs cycled through while a character is "decoding". Uppercase letters keep
// the shuffle reading as letters (the copy is uppercase), with a few symbols for texture.
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*<>/';

// Runs a per-letter scramble reveal: each character starts settling at a random
// frame and locks onto its final glyph at a random later frame, so the word
// resolves left-to-right-ish rather than all at once. Calling scramble() again
// (e.g. on mouse leave) simply replays the same settle back to the original text.
function useScrambleText(text: string) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);

  // Cancel any in-flight animation when the component unmounts.
  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const scramble = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const chars = text.split('');
    const queue = chars.map(() => ({
      start: Math.floor(Math.random() * 10),
      end: Math.floor(Math.random() * 10) + 10,
    }));

    let frame = 0;
    const tick = () => {
      let settled = 0;
      const output = chars
        .map((char, i) => {
          if (char === ' ') {
            settled += 1;
            return ' ';
          }
          const { start, end } = queue[i];
          if (frame >= end) {
            settled += 1;
            return char;
          }
          if (frame >= start) {
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          return char;
        })
        .join('');

      setDisplay(output);

      if (settled === chars.length) {
        rafRef.current = null;
        return;
      }
      frame += 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [text]);

  return { display, scramble };
}

// Self-contained scramble label for the center nav links: manages its own
// hover trigger. Color transitions are left to the parent's CSS so the word
// both shuffles and shifts to its new color on hover.
const ScrambleText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const { display, scramble } = useScrambleText(text);
  return (
    <span className={className} onMouseEnter={scramble} onMouseLeave={scramble}>
      {display}
    </span>
  );
};

export const Navbar: React.FC = () => {
  // react-router's useLocation → Next's usePathname. Same value we need
  // (the current path) to flag the active route and rewrite hash targets.
  const pathname = usePathname();
  const isWorksPage = pathname === '/works';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scramble driver for the CTA — triggered from the whole button area, not just the text.
  const cta = useScrambleText('BOOK A CALL');

  const closeMenu = () => setIsMenuOpen(false);

  // Section anchors work in-page on the home route; from /works they need to
  // route home first (`/#about`) so the hash has a target to scroll to.
  const aboutHref = isWorksPage ? '/#about' : '#about';
  const contactHref = isWorksPage ? '/#contact' : '#contact';

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full sticky top-0 z-50 bg-[#050505]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 h-20 md:h-24 border-b border-white/10">
          {/* Left Column — Logo + stacked brand name (+ mobile hamburger) */}
          <div className="md:col-span-3 flex items-center justify-between md:justify-start px-6 md:px-8 md:border-r border-white/10">
            <Link href="/" className="group flex items-center" onClick={closeMenu}>
              <motion.img
                src="https://res.cloudinary.com/duacqzjyv/image/upload/v1784727313/logo_ueoy5u.png"
                alt="Abbas Skaiki logo"
                className="h-9 w-9 object-contain"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
              <div className="ml-4 flex flex-col font-['Space_Grotesk'] font-bold text-white uppercase leading-[1.1] tracking-wide text-sm md:text-base">
                <span>ABBAS</span>
                <span>SKAIKI</span>
              </div>
            </Link>

            {/* Mobile hamburger — far right of the single mobile column */}
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden text-zinc-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Center Column — primary navigation */}
          <div className="hidden md:col-span-6 md:flex items-center justify-center gap-8 md:border-r border-white/10">
            <Link
              href="/"
              className={`font-mono text-xs md:text-sm font-medium hover:text-white transition-colors tracking-widest uppercase ${!isWorksPage ? 'text-white' : 'text-zinc-400'}`}
            >
              <ScrambleText text="HOME" />
            </Link>
            <a
              href={aboutHref}
              className="font-mono text-xs md:text-sm font-medium text-zinc-400 hover:text-white transition-colors tracking-widest uppercase"
            >
              <ScrambleText text="ABOUT" />
            </a>
            <Link
              href="/works"
              className={`font-mono text-xs md:text-sm font-medium hover:text-white transition-colors tracking-widest uppercase ${isWorksPage ? 'text-white' : 'text-zinc-400'}`}
            >
              <ScrambleText text="WORKS" />
            </Link>
            <a
              href={contactHref}
              className="font-mono text-xs md:text-sm font-medium text-zinc-400 hover:text-white transition-colors tracking-widest uppercase"
            >
              <ScrambleText text="CONTACT" />
            </a>
          </div>

          {/* Right Column — CTA */}
          <a
            href={contactHref}
            onMouseEnter={cta.scramble}
            onMouseLeave={cta.scramble}
            className="hidden md:col-span-3 md:flex items-center justify-between px-6 md:px-8 group cursor-pointer"
          >
            <span className="font-mono text-xs md:text-sm font-medium text-white group-hover:text-red-500 transition-colors duration-300 tracking-widest uppercase">
              {cta.display}
            </span>
            <span className="text-white group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-300">&rarr;</span>
          </a>
        </div>
      </motion.nav>

      {/* Full-screen mobile menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-40 md:hidden bg-black flex flex-col"
          >
            <div className="flex flex-col mt-24 border-t border-white/10">
              {[
                { label: 'Home', to: '/', kind: 'route' as const },
                { label: 'About', to: aboutHref, kind: 'hash' as const },
                { label: 'Works', to: '/works', kind: 'route' as const },
                { label: 'Contact', to: contactHref, kind: 'hash' as const },
                { label: 'Book a Call', to: contactHref, kind: 'hash' as const },
              ].map((item) =>
                item.kind === 'route' ? (
                  <Link
                    key={item.label}
                    href={item.to}
                    onClick={closeMenu}
                    className="px-6 py-6 border-b border-white/10 font-['Space_Grotesk'] text-3xl font-bold uppercase tracking-tight text-zinc-100 hover:bg-white/[0.02] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.to}
                    onClick={closeMenu}
                    className="px-6 py-6 border-b border-white/10 font-['Space_Grotesk'] text-3xl font-bold uppercase tracking-tight text-zinc-100 hover:bg-white/[0.02] transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
