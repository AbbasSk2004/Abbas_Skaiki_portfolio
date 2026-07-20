'use client';

// -----------------------------------------------------------------------------
// Shared admin CRUD primitives.
//
// Extracted from the reference Projects page so every model's management screen
// stays lean and visually identical: the same modal backdrop, toast stack, form
// fields, and list/save/delete state machine. Styling is 100% the site palette
// (#050505, white/10 borders, Space Grotesk / mono type, --radius / --destructive
// tokens) so all admin screens read as one product with the public portfolio.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiError } from '@/api/api';
import { cn } from '@/app/lib/cn';

// --- Toasts -------------------------------------------------------------------

export type Toast = { id: number; kind: 'ok' | 'err'; text: string };

// Transient toast stack with an auto-dismiss timer. No dependency.
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return { toasts, push };
}

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto rounded-[var(--radius-md)] border px-4 py-3 font-mono text-xs shadow-lg backdrop-blur',
              t.kind === 'ok'
                ? 'border-white/10 bg-white/[0.06] text-white'
                : 'border-[var(--destructive)]/40 bg-[var(--destructive)]/15 text-white'
            )}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Modal backdrop -----------------------------------------------------------

export function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      {children}
    </motion.div>
  );
}

// A card that stops backdrop click-through — used by both the form and the
// delete confirmation. Callers supply their own <form>/content inside.
export function ModalCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'max-h-[90vh] w-full overflow-y-auto rounded-[var(--radius)] border border-white/10 bg-[#0a0a0a] p-6',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// --- Delete confirmation ------------------------------------------------------

export function ConfirmDelete({
  title,
  body,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: React.ReactNode;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Backdrop onClose={onCancel}>
      <ModalCard className="max-w-sm">
        <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-zinc-400">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[var(--radius-md)] border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-[var(--radius-md)] bg-[var(--destructive)] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </ModalCard>
    </Backdrop>
  );
}

// --- Form primitives ----------------------------------------------------------

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {label}
        {hint && <span className="normal-case tracking-normal text-zinc-600">({hint})</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block font-mono text-[10px] text-[var(--destructive)]">{error}</span>
      )}
    </label>
  );
}

export function Input({
  value,
  onChange,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30"
    />
  );
}

export function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30"
    />
  );
}

// Single-image picker with existing-image preview + remove, used by the
// media-bearing models (Service.serviceImage, Testimonial.avatar).
export function ImagePicker({
  currentUrl,
  file,
  onPickFile,
  onClearCurrent,
  label = 'Image',
}: {
  currentUrl?: string;
  file: File | null;
  onPickFile: (f: File | null) => void;
  onClearCurrent: () => void;
  label?: string;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : currentUrl || '';
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">{label}</p>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              className="h-16 w-16 rounded-[var(--radius-sm)] object-cover"
            />
            {currentUrl && !file && (
              <button
                type="button"
                onClick={onClearCurrent}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--destructive)] text-white"
                aria-label="Remove image"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-sm)] bg-white/5 font-mono text-[10px] text-zinc-600">
            none
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          className="block flex-1 font-mono text-xs text-zinc-400 file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-widest file:text-white hover:file:bg-white/20"
        />
      </div>
    </div>
  );
}

// --- Page header --------------------------------------------------------------

export function AdminPageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">
          {title}
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="rounded-[var(--radius-md)] bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.03] active:scale-95"
      >
        {actionLabel}
      </button>
    </div>
  );
}

// Row action buttons (Edit / Delete) — reveal on row hover.
export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-[var(--radius-sm)] border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-white/30 hover:text-white"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-[var(--radius-sm)] border border-[var(--destructive)]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
      >
        Delete
      </button>
    </div>
  );
}

// --- Table shell --------------------------------------------------------------

// Central table wrapper for every admin list screen. Owns the bordered card,
// the horizontal-scroll behavior, and the column-squish guard so the fix lives
// in ONE place and propagates to all models.
//
// - overflow-x-auto  → the ACTIONS column is reachable on narrow screens via a
//   2-finger trackpad / touch swipe instead of being clipped.
// - scrollbar hidden cross-browser (WebKit + Firefox + old Edge/IE) so the swipe
//   works but no horizontal bar is ever painted.
// - min-w-max + whitespace-nowrap → columns keep their natural width and overflow
//   as a group rather than squishing together unreadably. Cells that SHOULD wrap
//   (e.g. a long message) opt back in locally with `whitespace-normal`.
export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-white/10',
        'overflow-x-auto',
        // Hide the horizontal scrollbar on every engine while keeping scroll.
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
      )}
    >
      <table className="w-full min-w-max border-collapse whitespace-nowrap text-left">
        {children}
      </table>
    </div>
  );
}

// --- CRUD state machine -------------------------------------------------------

// Generic list/create/edit/delete controller shared by every admin page. `T` is
// the API document type (must carry `_id`). Callers pass the service functions;
// this owns loading, the toast feedback, and the open modal / confirm state.
export function useCrud<T extends { _id: string }>(opts: {
  list: () => Promise<T[]>;
  remove: (id: string) => Promise<unknown>;
  labels: { entity: string }; // e.g. { entity: 'Service' }
}) {
  const { list, remove, labels } = opts;
  const { toasts, push } = useToasts();

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await list());
    } catch (err) {
      push('err', err instanceof ApiError ? err.message : `Failed to load ${labels.entity}s`);
    } finally {
      setLoading(false);
    }
  }, [list, push, labels.entity]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item: T) => {
    setEditing(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  // Runs a save (create or update) supplied by the page, then refreshes.
  const submit = async (saver: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await saver();
      push('ok', `${labels.entity} ${editing ? 'updated' : 'created'}`);
      closeModal();
      await refresh();
    } catch (err) {
      push('err', err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirming) return;
    setBusy(true);
    try {
      await remove(confirming._id);
      push('ok', `${labels.entity} deleted`);
      setConfirming(null);
      await refresh();
    } catch (err) {
      push('err', err instanceof ApiError ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return {
    // data
    items,
    loading,
    // modal / editing state
    editing,
    modalOpen,
    openCreate,
    openEdit,
    closeModal,
    submit,
    // delete state
    confirming,
    setConfirming,
    confirmDelete,
    // misc
    busy,
    toasts,
    push,
    refresh,
  };
}

// Comma-separated string ⇄ string[] for tag/stack/technology inputs.
export const toList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
