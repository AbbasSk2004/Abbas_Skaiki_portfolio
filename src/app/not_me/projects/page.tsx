'use client';

// -----------------------------------------------------------------------------
// Projects admin — data table + create/edit/delete modal.
//
// This is the reference CRUD screen. Every other model's admin page mirrors its
// shape: fetch list → render table → open modal for create/edit → submit via the
// admin service (multipart when files are attached) → optimistic refresh.
//
// Styling is 100% the site palette: #050505, white/10 borders, Space Grotesk /
// mono type, --radius / --destructive tokens — so it reads as one product with
// the public portfolio.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  type ProjectInput,
} from '@/api/admin/projects';
import type { ApiProject } from '@/api/public/projects';
import { ApiError } from '@/api/api';
import { cn } from '@/app/lib/cn';
import { TableShell } from '../components/crud';

// Small transient toast — no dependency, matches the dark palette.
type Toast = { id: number; kind: 'ok' | 'err'; text: string };

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiProject | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<ApiProject | null>(null);
  const [busy, setBusy] = useState(false);

  const pushToast = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      pushToast('err', err instanceof ApiError ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: ApiProject) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSubmit = async (input: ProjectInput, files: File[]) => {
    setBusy(true);
    try {
      if (editing) {
        await updateProject(editing._id, input, files);
        pushToast('ok', 'Project updated');
      } else {
        await createProject(input, files);
        pushToast('ok', 'Project created');
      }
      setModalOpen(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      pushToast('err', err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteProject(confirmDelete._id);
      pushToast('ok', 'Project deleted');
      setConfirmDelete(null);
      await refresh();
    } catch (err) {
      pushToast('err', err instanceof ApiError ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">
            Projects
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
            {loading ? 'Loading…' : `${projects.length} total`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-[var(--radius-md)] bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.03] active:scale-95"
        >
          + New Project
        </button>
      </div>

      {/* Table */}
      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Year</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Images</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={6}>
                    <span className="inline-block h-4 w-full max-w-sm animate-pulse rounded bg-white/10" />
                  </td>
                </tr>
              ))}

            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-zinc-500">
                  No projects yet. Create your first one.
                </td>
              </tr>
            )}

            {!loading &&
              projects.map((p) => (
                <tr key={p._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)] object-cover"
                        />
                      ) : (
                        <span className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)] bg-white/5" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{p.title}</p>
                        <p className="truncate font-mono text-[10px] text-zinc-600">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {p.isPublished ? (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                          Draft
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {p.category ? (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                        {p.category}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 md:table-cell tabular-nums">
                    {p.year ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 md:table-cell tabular-nums">
                    {p.images?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="rounded-[var(--radius-sm)] border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-white/30 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p)}
                        className="rounded-[var(--radius-sm)] border border-[var(--destructive)]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
      </TableShell>

      {/* Create / Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProjectModal
            key="modal"
            initial={editing}
            busy={busy}
            onClose={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <Backdrop key="confirm" onClose={() => setConfirmDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[var(--radius)] border border-white/10 bg-[#0a0a0a] p-6"
            >
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                Delete project?
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                <span className="text-white">{confirmDelete.title}</span> and its uploaded images
                will be permanently removed. This cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-[var(--radius-md)] border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleDelete}
                  className="rounded-[var(--radius-md)] bg-[var(--destructive)] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white disabled:opacity-50"
                >
                  {busy ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* Toasts */}
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
    </div>
  );
}

// --- Shared modal backdrop ----------------------------------------------------

function Backdrop({
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

// --- Create / Edit form modal -------------------------------------------------

// Comma-separated string ⇄ string[] for the tags / stack inputs.
const toList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

function ProjectModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: ApiProject | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: ProjectInput, files: File[]) => void;
}) {
  const [form, setForm] = useState<ProjectInput>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    category: initial?.category ?? '',
    tags: initial?.tags ?? [],
    client: initial?.client ?? '',
    role: initial?.role ?? '',
    year: initial?.year,
    challenge: initial?.challenge ?? '',
    solution: initial?.solution ?? '',
    stack: initial?.stack ?? [],
    liveUrl: initial?.liveUrl ?? '',
    githubUrl: initial?.githubUrl ?? '',
    images: initial?.images ?? [],
    isPublished: initial?.isPublished ?? false,
    isFeatured: initial?.isFeatured ?? false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Drop a kept Cloudinary image from the set (the PUT will destroy it server-side).
  const removeExistingImage = (url: string) =>
    set('images', (form.images ?? []).filter((u) => u !== url));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.slug?.trim()) e.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Lowercase letters, numbers, hyphens only';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form, files);
  };

  return (
    <Backdrop onClose={onClose}>
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius)] border border-white/10 bg-[#0a0a0a] p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-white">
            {initial ? 'Edit project' : 'New project'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 transition-colors hover:text-white"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" error={errors.title}>
            <Input value={form.title} onChange={(v) => set('title', v)} />
          </Field>
          <Field label="Slug" error={errors.slug} hint="lowercase-with-hyphens">
            <Input value={form.slug} onChange={(v) => set('slug', v)} />
          </Field>
          <Field label="Category">
            <Input value={form.category ?? ''} onChange={(v) => set('category', v)} />
          </Field>
          <Field label="Year">
            <Input
              type="number"
              value={form.year != null ? String(form.year) : ''}
              onChange={(v) => set('year', v ? Number(v) : undefined)}
            />
          </Field>
          <Field label="Client">
            <Input value={form.client ?? ''} onChange={(v) => set('client', v)} />
          </Field>
          <Field label="Role">
            <Input value={form.role ?? ''} onChange={(v) => set('role', v)} />
          </Field>
          <Field label="Tags" hint="comma,separated">
            <Input
              value={(form.tags ?? []).join(', ')}
              onChange={(v) => set('tags', toList(v))}
            />
          </Field>
          <Field label="Stack" hint="comma,separated">
            <Input
              value={(form.stack ?? []).join(', ')}
              onChange={(v) => set('stack', toList(v))}
            />
          </Field>
          <Field label="Live URL">
            <Input value={form.liveUrl ?? ''} onChange={(v) => set('liveUrl', v)} />
          </Field>
          <Field label="GitHub URL">
            <Input value={form.githubUrl ?? ''} onChange={(v) => set('githubUrl', v)} />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="Challenge">
            <Textarea value={form.challenge ?? ''} onChange={(v) => set('challenge', v)} />
          </Field>
          <Field label="Solution">
            <Textarea value={form.solution ?? ''} onChange={(v) => set('solution', v)} />
          </Field>
        </div>

        {/* Visibility controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Toggle
            label="Status"
            description={form.isPublished ? 'Published — live on the site' : 'Draft — hidden from the public'}
            checked={!!form.isPublished}
            onChange={(v) => set('isPublished', v)}
          />
          <Toggle
            label="Homepage visibility"
            description={form.isFeatured ? 'Featured in Selected Works' : 'Not featured on the homepage'}
            checked={!!form.isFeatured}
            onChange={(v) => set('isFeatured', v)}
          />
        </div>

        {/* Existing images (kept unless removed) */}
        {(form.images ?? []).length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Current images
            </p>
            <div className="flex flex-wrap gap-2">
              {(form.images ?? []).map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-16 w-16 rounded-[var(--radius-sm)] object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--destructive)] text-white"
                    aria-label="Remove image"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New uploads */}
        <div className="mt-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Add images
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full font-mono text-xs text-zinc-400 file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-widest file:text-white hover:file:bg-white/20"
          />
          {files.length > 0 && (
            <p className="mt-2 font-mono text-[11px] text-zinc-500">
              {files.length} file{files.length > 1 ? 's' : ''} ready to upload
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-[var(--radius-md)] bg-white px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            {busy ? 'Saving…' : initial ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </motion.form>
    </Backdrop>
  );
}

// --- Tiny form primitives (match theme tokens) --------------------------------

function Field({
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
      {error && <span className="mt-1 block font-mono text-[10px] text-[var(--destructive)]">{error}</span>}
    </label>
  );
}

function Input({
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

function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full resize-y rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30"
    />
  );
}

// Labeled on/off switch styled to the theme tokens. Used for the Draft/Published
// and Featured visibility controls.
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:border-white/20"
    >
      <span className="min-w-0">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-zinc-400">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block truncate text-xs text-zinc-500">{description}</span>
        )}
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-white' : 'bg-white/15'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full transition-transform',
            checked ? 'left-0.5 translate-x-4 bg-black' : 'left-0.5 bg-white'
          )}
        />
      </span>
    </button>
  );
}
