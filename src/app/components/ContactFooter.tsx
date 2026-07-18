'use client';

import React from 'react';

// --- Design tokens / data ---------------------------------------------------
// Swap these out with real info as needed.
const CONTACT_EMAIL = 'skaiki.dev@gmail.com';
const CONTACT_PHONE = '+961 76 937 310';

// Endpoint the contact form POSTs to (e.g. a Formspree URL or an API route).
// TODO: replace with your live endpoint. Until set, submissions bail out early.
const CONTACT_ENDPOINT = '';

const NAV_LINKS = [
  { label: 'HOME', href: '/#' },
  { label: 'ABOUT', href: '/#about' },
  { label: 'WORKS', href: '/works' },
  { label: 'CONTACT', href: '/#contact' },
];

const SOCIAL_LINKS = [
  { label: 'TWITTER(X)', href: '#' },
  { label: 'INSTAGRAM', href: '#' },
  { label: 'LINKEDIN', href: '#' },
  { label: 'GITHUB', href: '#' },
];

// Reused arrow glyph so every CTA points the same way.
const Arrow: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ContactFooter: React.FC = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: point CONTACT_ENDPOINT at a real destination to enable submissions.
    if (!CONTACT_ENDPOINT) return;

    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      form.reset();
      // TODO: surface a success state (e.g. sonner toast).
    } catch (err) {
      console.error('Contact form submission failed:', err);
      // TODO: surface an error state.
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col">
      {/* ================= PART 1 — CONTACT ================= */}
      <section
        id="contact"
        className="grid grid-cols-1 md:grid-cols-4 w-full border-t border-white/10"
      >
        {/* Col 1 & 2 — Left side */}
        <div className="md:col-span-2 flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10">
          <div>
            <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 mb-10">
              • CONTACT
            </div>
            <h2 className="font-['Space_Grotesk'] text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter uppercase text-white">
              Have a
              <br />
              project
              <br />
              in mind?
            </h2>
          </div>

          {/* Introductory statement */}
          <p className="font-['Inter'] text-zinc-400 text-lg md:text-xl max-w-sm mt-4">
            I'm always open to collaborations and creative challenges.
          </p>

          {/* Bottom contact details */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:gap-8 gap-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-mono text-xs uppercase tracking-widest text-zinc-300 hover:text-white transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, '')}`}
              className="font-mono text-xs uppercase tracking-widest text-zinc-300 hover:text-white transition-colors"
            >
              {CONTACT_PHONE}
            </a>
          </div>
        </div>

        {/* Col 3 & 4 — Right side (form) */}
        <div className="md:col-span-2 flex flex-col">
          <form className="flex flex-col h-full" onSubmit={handleSubmit}>
            {/* Row 1 — NAME */}
            <div className="flex flex-col justify-center border-b border-white/10 p-6 md:p-8 min-h-[120px] hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
              <label
                htmlFor="cf-name"
                className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3"
              >
                Name
              </label>
              <input
                id="cf-name"
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700"
              />
            </div>

            {/* Row 2 — EMAIL / PHONE (2-col grid inside) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-white/10">
              <div className="flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-white/10 p-6 md:p-8 min-h-[120px] hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
                <label
                  htmlFor="cf-email"
                  className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3"
                >
                  Email
                </label>
                <input
                  id="cf-email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8 min-h-[120px] hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
                <label
                  htmlFor="cf-phone"
                  className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3"
                >
                  Phone
                </label>
                <input
                  id="cf-phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Row 3 — BUDGET & DETAILS */}
            <div className="flex flex-col border-b border-white/10 p-6 md:p-8 flex-grow hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
              <label
                htmlFor="cf-details"
                className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3"
              >
                Budget &amp; Details
              </label>
              <textarea
                id="cf-details"
                name="details"
                placeholder="Tell me about your project..."
                className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 resize-none h-32"
              />
            </div>

            {/* Submit CTA — spans full width */}
            <button
              type="submit"
              className="w-full p-6 md:p-8 text-left font-['Space_Grotesk'] text-2xl md:text-3xl font-bold uppercase tracking-tight text-white hover:bg-white hover:text-black transition-colors flex justify-between items-center group"
            >
              <span>Submit Request</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transform group-hover:translate-x-2 transition-transform"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* ================= PART 2 — FOOTER ================= */}
      <footer className="grid grid-cols-1 md:grid-cols-4 w-full border-t border-white/10">
        {/* Col 1 — Brand */}
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/10">
          <div className="p-8 flex-grow flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="skaiki.dev logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-['Space_Grotesk'] text-xl font-bold lowercase tracking-tight text-white">
                skaiki.dev
              </span>
            </div>
            <p className="font-['Inter'] text-sm text-zinc-400 max-w-[220px]">
              Crafting premium digital experiences through minimal, grid-based architectures.
            </p>
          </div>
          <a
            href="#contact"
            className="p-8 border-t border-white/10 flex justify-between items-center group hover:bg-white/[0.02] transition-colors"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
              Book a Call
            </span>
            <Arrow className="text-zinc-500 group-hover:text-white transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Col 2 & 3 — wrapped in grid-cols-2 (mobile trick) so they sit side by side.
            w-full border-b enforces a clean full-width divider on mobile; md:border-b-0
            drops it on desktop where the row divider comes from the cells' md:border-r. */}
        <div className="grid grid-cols-2 md:col-span-2 w-full border-b md:border-b-0 border-white/10">
          {/* Col 2 — Navigation */}
          <div className="flex flex-col border-r border-white/10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex-1 min-h-[60px] p-6 border-b border-white/10 last:border-b-0 flex justify-between items-center group hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                  {link.label}
                </span>
                <Arrow className="text-zinc-600 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
              </a>
            ))}
          </div>

          {/* Col 3 — Socials */}
          <div className="flex flex-col md:border-r border-white/10">
            <div className="p-6 border-b border-white/10 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Follow On
            </div>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[60px] p-6 border-b border-white/10 last:border-b-0 flex justify-start items-center group hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Col 4 — Closing */}
        <div className="flex flex-col">
          <div className="p-8 flex-grow">
            <p className="font-['Inter'] text-sm text-zinc-400 leading-relaxed">
              Committed to building asymmetrical, high-end web applications that perform as well as
              they look.
            </p>
          </div>
          <div className="p-8 border-t border-white/10 flex flex-col gap-1 items-start text-left">
            <span className="uppercase font-mono text-[10px] sm:text-xs text-zinc-500 tracking-wider">
              © 2026 All Rights Reserved
            </span>
            <span className="uppercase font-mono text-[10px] sm:text-xs text-white tracking-wider">
              Powered by Skaiki.dev
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
