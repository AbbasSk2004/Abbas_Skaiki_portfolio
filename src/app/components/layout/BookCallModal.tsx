'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '@/api/api';

// -----------------------------------------------------------------------------
// Native booking modal — replaces the third-party embed we evaluated earlier.
//
// Posts to the existing PUBLIC endpoint (back/routes/callBookingRoutes.js →
// createCallBooking), which persists a CallBooking with status 'pending' and
// emails the admin via Resend. The submit path mirrors ContactFooter's inquiry
// form on purpose: same inline fetch + same { success, message } envelope
// handling, since the public API layer (src/api/public/*) is GET-only.
// -----------------------------------------------------------------------------

// Submission lifecycle, mirroring ContactFooter's SubmitState.
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

// Selector for every natively focusable node, used to bound the focus trap.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Meeting platforms, mirroring the CallBooking model's `platform` enum. The
// values are the stored slugs; the labels are what the visitor sees.
const PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google-meet', label: 'Google Meet' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

// Local YYYY-MM-DD for the date input's `min`, so past days can't be picked.
// toISOString() would shift by the UTC offset and can offer "yesterday" to
// users west of UTC, so the parts are read in local time instead.
const todayLocal = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

export const BookCallModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [feedback, setFeedback] = useState('');
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // The element focused before opening, so focus can be restored on close.
  const restoreRef = useRef<HTMLElement | null>(null);

  const isSubmitting = submitState === 'submitting';

  // Portals need a DOM target, which doesn't exist during SSR.
  useEffect(() => setMounted(true), []);

  // Escape to dismiss + Tab focus trap. Bound to the document so the key works
  // regardless of which child currently holds focus.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes?.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      // Wrap in both directions so focus never escapes the dialog.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Lock background scroll while open, and move focus into the dialog. Focus is
  // returned to the trigger on close so keyboard users don't land back at the
  // top of the document.
  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Defer a frame so the panel is painted before we reach into it.
    const raf = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  // Each fresh open starts from a clean slate rather than showing the previous
  // submission's success/error banner.
  useEffect(() => {
    if (open) {
      setSubmitState('idle');
      setFeedback('');
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      const form = e.currentTarget;
      const data = new FormData(form);
      const name = String(data.get('name') ?? '').trim();
      const email = String(data.get('email') ?? '').trim();
      const phone = String(data.get('phone') ?? '').trim();
      const date = String(data.get('date') ?? '').trim();
      const time = String(data.get('time') ?? '').trim();
      const topic = String(data.get('topic') ?? '').trim();
      // Defaulted by the radio group's `defaultChecked`, so this is always set.
      const platform = String(data.get('platform') ?? 'zoom');

      // Client-side guard mirrors CallBooking's required fields, so we don't
      // fire a request the backend will only reject with a 400.
      if (!name || !email || !date || !time) {
        setSubmitState('error');
        setFeedback('Please fill in your name, email, and preferred date and time.');
        return;
      }

      setSubmitState('submitting');
      setFeedback('');

      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name, email, phone, date, time, topic, platform }),
        });
        const body = await res.json().catch(() => null);

        if (!res.ok || !body?.success) {
          throw new Error(body?.message ?? `Request failed: ${res.status}`);
        }

        form.reset();
        setSubmitState('success');
        setFeedback(body.message ?? 'Your call request has been submitted.');
      } catch (err) {
        console.error('Call booking submission failed:', err);
        setSubmitState('error');
        setFeedback(
          err instanceof Error && err.message
            ? err.message
            : 'Something went wrong. Please try again or email me directly.'
        );
      }
    },
    [isSubmitting]
  );

  if (!mounted || !open) return null;

  // Rendered in a portal so the fixed overlay escapes the Navbar's stacking
  // context — inside it, the sticky nav's z-50 would clip the backdrop.
  return createPortal(
    <div
      // Centered "classic" dialog: the overlay is a fixed flex container and the
      // PANEL owns the scrolling (see below), so the modal never runs edge-to-edge
      // on mobile. `overscroll-contain` stops scroll chaining to the page behind.
      className="fixed inset-0 z-[100] flex items-center justify-center overscroll-contain bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      // Backdrop dismiss. The guard keeps clicks that merely *end* on the
      // backdrop (e.g. a drag that began inside a text field) from closing.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-call-title"
        // max-h + flex column: the header stays put and only the form body
        // scrolls. dvh (not vh) so the cap tracks the mobile browser's dynamic
        // viewport — with plain vh the panel is sized against the LARGEST
        // viewport and its bottom hides under the address bar / keyboard.
        className="relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border border-white/10 bg-[#050505]"
      >
        {/* Header — mirrors the ContactFooter section header treatment. shrink-0
            keeps it pinned while the form body below scrolls. */}
        <div className="flex shrink-0 items-start justify-between p-6 md:p-8 border-b border-white/10">
          <div>
            <div className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 mb-3">
              • BOOK A CALL
            </div>
            <h2
              id="book-call-title"
              className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold leading-[0.95] tracking-tighter uppercase text-white"
            >
              Let&rsquo;s talk
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="shrink-0 -mr-2 -mt-2 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto overscroll-contain">
          {/* NAME */}
          <div className="flex flex-col justify-center border-b border-white/10 p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
            <label htmlFor="bc-name" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
              Name
            </label>
            <input
              id="bc-name"
              type="text"
              name="name"
              required
              disabled={isSubmitting}
              placeholder="John Doe"
              className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 disabled:opacity-50"
            />
          </div>

          {/* EMAIL / PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-white/10">
            <div className="flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-white/10 p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
              <label htmlFor="bc-email" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                Email
              </label>
              <input
                id="bc-email"
                type="email"
                name="email"
                required
                disabled={isSubmitting}
                placeholder="john@example.com"
                className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
              <label htmlFor="bc-phone" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                Phone
              </label>
              <input
                id="bc-phone"
                type="tel"
                name="phone"
                disabled={isSubmitting}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 disabled:opacity-50"
              />
            </div>
          </div>

          {/* DATE / TIME — the model stores these as separate `date` + `time` fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-white/10">
            <div className="flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-white/10 p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
              <label htmlFor="bc-date" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                Preferred Date
              </label>
              <input
                id="bc-date"
                type="date"
                name="date"
                required
                min={todayLocal()}
                disabled={isSubmitting}
                className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 disabled:opacity-50 [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
              <label htmlFor="bc-time" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                Preferred Time
              </label>
              <input
                id="bc-time"
                type="time"
                name="time"
                required
                disabled={isSubmitting}
                className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 disabled:opacity-50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* PLATFORM — a radio group (not a select) so all three options are
              visible at once. Deliberately a div[role=radiogroup] + span rather
              than fieldset/legend: a <legend> is rendered at the fieldset's
              BORDER-BOX top edge, outside the padding box, so it ignored this
              row's p-6/p-8 and sat tight against the divider while every other
              row's label cleared it. This structure matches the rows above, so
              the labels align. role+aria-labelledby keeps the grouping semantics
              the fieldset provided. */}
          <div
            role="radiogroup"
            aria-labelledby="bc-platform-label"
            className="flex flex-col justify-center border-b border-white/10 p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors"
          >
            <span
              id="bc-platform-label"
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3"
            >
              Preferred Platform
            </span>
            {/* 3-up grid rather than flex-wrap: at ~390px the three fixed-width
                pills overflow and WhatsApp drops to a ragged second row.
                items-stretch + h-full makes every cell adopt the tallest row
                height, so "Google Meet" wrapping to two lines no longer leaves
                Zoom and WhatsApp shorter than it. */}
            <div className="grid grid-cols-3 items-stretch gap-2 sm:gap-3">
              {PLATFORMS.map((option, i) => (
                <label
                  key={option.value}
                  className="group relative cursor-pointer font-mono text-[10px] sm:text-xs uppercase tracking-widest"
                >
                  <input
                    type="radio"
                    name="platform"
                    value={option.value}
                    defaultChecked={i === 0}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <span className="flex h-full min-h-[3.25rem] items-center justify-center border border-white/10 px-2 sm:px-4 py-3 text-center text-zinc-400 transition-colors hover:text-white peer-checked:border-white peer-checked:bg-white peer-checked:text-black peer-focus-visible:ring-1 peer-focus-visible:ring-white peer-disabled:opacity-50">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* TOPIC */}
          <div className="flex flex-col border-b border-white/10 p-6 md:p-8 hover:bg-white/[0.02] focus-within:bg-white/[0.02] transition-colors">
            <label htmlFor="bc-topic" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
              Topic &amp; Details
            </label>
            <textarea
              id="bc-topic"
              name="topic"
              disabled={isSubmitting}
              placeholder="What would you like to discuss?"
              className="w-full bg-transparent focus:outline-none font-['Inter'] text-lg text-white placeholder:text-zinc-700 resize-none h-24 disabled:opacity-50"
            />
          </div>

          {/* Feedback row — aria-live so the result is announced asynchronously. */}
          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`px-6 md:px-8 py-4 border-b border-white/10 font-mono text-xs tracking-wide ${
                submitState === 'error' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-6 md:p-8 text-left font-['Space_Grotesk'] text-2xl md:text-3xl font-bold uppercase tracking-tight text-white hover:bg-white hover:text-black transition-colors flex justify-between items-center group disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Sending…' : 'Request Call'}</span>
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
    </div>,
    document.body
  );
};
