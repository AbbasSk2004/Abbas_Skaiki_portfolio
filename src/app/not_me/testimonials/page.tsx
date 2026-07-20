'use client';

// -----------------------------------------------------------------------------
// Testimonials admin — data table + create/edit/delete modal.
//
// Single-image model (avatar → Cloudinary). Built on the shared CRUD kit
// (../components/crud) so it mirrors the Projects/Services screens exactly with
// far less code. Styling is the site palette throughout.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type TestimonialInput,
} from '@/api/admin/testimonials';
import type { ApiTestimonial } from '@/api/public/testimonials';
import {
  useCrud,
  Backdrop,
  ModalCard,
  ConfirmDelete,
  Field,
  Input,
  Textarea,
  ImagePicker,
  TableShell,
  ToastStack,
  AdminPageHeader,
  RowActions,
} from '../components/crud';

export default function TestimonialsAdminPage() {
  const crud = useCrud<ApiTestimonial>({
    list: listTestimonials,
    remove: deleteTestimonial,
    labels: { entity: 'Testimonial' },
  });

  const handleSubmit = (input: TestimonialInput, file: File | null) =>
    crud.submit(() =>
      crud.editing
        ? updateTestimonial(crud.editing._id, input, file)
        : createTestimonial(input, file)
    );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Testimonials"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} total`}
        actionLabel="+ New Testimonial"
        onAction={crud.openCreate}
      />

      {/* Table */}
      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Company</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Feedback</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {crud.loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={4}>
                    <span className="inline-block h-4 w-full max-w-sm animate-pulse rounded bg-white/10" />
                  </td>
                </tr>
              ))}

            {!crud.loading && crud.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center font-mono text-xs text-zinc-500">
                  No testimonials yet. Create your first one.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((t) => (
                <tr key={t._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.avatar}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 font-mono text-[11px] text-zinc-500">
                          {t.clientName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{t.clientName}</p>
                        <p className="truncate font-mono text-[10px] text-zinc-600">
                          {t.role || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-zinc-400 md:table-cell">
                    {t.company || '—'}
                  </td>
                  <td className="hidden max-w-md px-4 py-3 lg:table-cell">
                    <p className="truncate text-sm text-zinc-500">{t.feedback}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => crud.openEdit(t)} onDelete={() => crud.setConfirming(t)} />
                  </td>
                </tr>
              ))}
          </tbody>
      </TableShell>

      {/* Create / edit modal */}
      <AnimatePresence>
        {crud.modalOpen && (
          <TestimonialModal
            key="modal"
            initial={crud.editing}
            busy={crud.busy}
            onClose={crud.closeModal}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {crud.confirming && (
          <ConfirmDelete
            key="confirm"
            title="Delete testimonial?"
            body={
              <>
                <span className="text-white">{crud.confirming.clientName}</span>&apos;s testimonial and
                avatar will be permanently removed. This cannot be undone.
              </>
            }
            busy={crud.busy}
            onCancel={() => crud.setConfirming(null)}
            onConfirm={crud.confirmDelete}
          />
        )}
      </AnimatePresence>

      <ToastStack toasts={crud.toasts} />
    </div>
  );
}

// --- Create / edit form -------------------------------------------------------

function TestimonialModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: ApiTestimonial | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: TestimonialInput, file: File | null) => void;
}) {
  const [form, setForm] = useState<TestimonialInput>({
    clientName: initial?.clientName ?? '',
    role: initial?.role ?? '',
    company: initial?.company ?? '',
    feedback: initial?.feedback ?? '',
    avatar: initial?.avatar ?? '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof TestimonialInput>(key: K, value: TestimonialInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientName?.trim()) e.clientName = 'Client name is required';
    if (!form.feedback?.trim()) e.feedback = 'Feedback is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form, file);
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalCard className="max-w-2xl">
        <form onSubmit={submit}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-white">
              {initial ? 'Edit testimonial' : 'New testimonial'}
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
            <Field label="Client name" error={errors.clientName}>
              <Input value={form.clientName} onChange={(v) => set('clientName', v)} />
            </Field>
            <Field label="Role">
              <Input value={form.role ?? ''} onChange={(v) => set('role', v)} />
            </Field>
            <Field label="Company">
              <Input value={form.company ?? ''} onChange={(v) => set('company', v)} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Feedback" error={errors.feedback}>
              <Textarea value={form.feedback} onChange={(v) => set('feedback', v)} rows={4} />
            </Field>
          </div>

          <div className="mt-4">
            <ImagePicker
              label="Avatar"
              currentUrl={form.avatar}
              file={file}
              onPickFile={setFile}
              onClearCurrent={() => set('avatar', '')}
            />
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
              {busy ? 'Saving…' : initial ? 'Save changes' : 'Create testimonial'}
            </button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  );
}
