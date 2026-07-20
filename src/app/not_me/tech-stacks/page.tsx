'use client';

// -----------------------------------------------------------------------------
// Tech Stacks admin — data table + create/edit/delete modal.
//
// Media-free model (icon is a lucide component NAME, not an uploaded asset), so
// there is no ImagePicker and every request is plain JSON. Built on the shared
// CRUD kit (../components/crud) so it mirrors the other admin screens exactly.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listTechStacks,
  createTechStack,
  updateTechStack,
  deleteTechStack,
  type TechStackInput,
} from '@/api/admin/techStack';
import type { ApiTechStack } from '@/api/public/techStack';
import {
  useCrud,
  Backdrop,
  ModalCard,
  ConfirmDelete,
  Field,
  Input,
  Textarea,
  TableShell,
  ToastStack,
  AdminPageHeader,
  RowActions,
  toList,
} from '../components/crud';

export default function TechStacksAdminPage() {
  const crud = useCrud<ApiTechStack>({
    list: listTechStacks,
    remove: deleteTechStack,
    labels: { entity: 'Tech stack' },
  });

  const handleSubmit = (input: TechStackInput) =>
    crud.submit(() =>
      crud.editing
        ? updateTechStack(crud.editing._id, input)
        : createTechStack(input)
    );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Tech Stacks"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} total`}
        actionLabel="+ New Card"
        onAction={crud.openCreate}
      />

      {/* Table */}
      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Technologies</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Icon</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Order</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {crud.loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={5}>
                    <span className="inline-block h-4 w-full max-w-sm animate-pulse rounded bg-white/10" />
                  </td>
                </tr>
              ))}

            {!crud.loading && crud.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-mono text-xs text-zinc-500">
                  No tech stacks yet. Create your first one.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((t) => (
                <tr key={t._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{t.category}</p>
                      {t.description && (
                        <p className="truncate font-mono text-[10px] text-zinc-600">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(t.technologies ?? []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400"
                        >
                          {tech}
                        </span>
                      ))}
                      {(t.technologies?.length ?? 0) === 0 && (
                        <span className="text-zinc-600">—</span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 sm:table-cell">
                    {t.icon || '—'}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 sm:table-cell tabular-nums">
                    {t.order ?? 0}
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
          <TechStackModal
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
            title="Delete tech stack?"
            body={
              <>
                <span className="text-white">{crud.confirming.category}</span> will be permanently
                removed. This cannot be undone.
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

function TechStackModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: ApiTechStack | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: TechStackInput) => void;
}) {
  const [form, setForm] = useState<TechStackInput>({
    category: initial?.category ?? '',
    technologies: initial?.technologies ?? [],
    description: initial?.description ?? '',
    icon: initial?.icon ?? '',
    order: initial?.order ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof TechStackInput>(key: K, value: TechStackInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.category?.trim()) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalCard className="max-w-xl">
        <form onSubmit={submit}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-white">
              {initial ? 'Edit tech stack' : 'New tech stack'}
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
            <Field label="Category" error={errors.category}>
              <Input value={form.category} onChange={(v) => set('category', v)} />
            </Field>
            <Field label="Icon" hint="lucide name, e.g. Code2">
              <Input value={form.icon ?? ''} onChange={(v) => set('icon', v)} />
            </Field>
            <Field label="Order">
              <Input
                type="number"
                value={form.order != null ? String(form.order) : ''}
                onChange={(v) => set('order', v ? Number(v) : 0)}
              />
            </Field>
            <Field label="Technologies" hint="comma,separated">
              <Input
                value={(form.technologies ?? []).join(', ')}
                onChange={(v) => set('technologies', toList(v))}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Description">
              <Textarea value={form.description ?? ''} onChange={(v) => set('description', v)} />
            </Field>
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
              {busy ? 'Saving…' : initial ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  );
}
