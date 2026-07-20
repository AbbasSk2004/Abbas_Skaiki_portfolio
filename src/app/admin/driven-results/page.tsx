'use client';

// -----------------------------------------------------------------------------
// Driven Results admin — data table + create/edit/delete modal.
//
// Media-free model (pure numeric metric data). Built on the shared CRUD kit so
// it mirrors the other admin screens exactly; every request is plain JSON.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listDrivenResults,
  createDrivenResult,
  updateDrivenResult,
  deleteDrivenResult,
  type DrivenResultInput,
} from '@/api/admin/drivenResults';
import type { ApiDrivenResult } from '@/api/public/drivenResults';
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
} from '../components/crud';

export default function DrivenResultsAdminPage() {
  const crud = useCrud<ApiDrivenResult>({
    list: listDrivenResults,
    remove: deleteDrivenResult,
    labels: { entity: 'Result' },
  });

  const handleSubmit = (input: DrivenResultInput) =>
    crud.submit(() =>
      crud.editing
        ? updateDrivenResult(crud.editing._id, input)
        : createDrivenResult(input)
    );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Driven Results"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} metrics`}
        actionLabel="+ New Metric"
        onAction={crud.openCreate}
      />

      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Description</th>
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
                  No metrics yet. Create your first one.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((r) => (
                <tr key={r._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="font-['Space_Grotesk'] text-lg font-bold text-white tabular-nums">
                      {r.prefix}
                      {r.value}
                      {r.suffix}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate text-sm text-white">{r.label}</p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="max-w-md truncate font-mono text-[11px] text-zinc-500">
                      {r.description || '—'}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 sm:table-cell tabular-nums">
                    {r.order ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => crud.openEdit(r)} onDelete={() => crud.setConfirming(r)} />
                  </td>
                </tr>
              ))}
          </tbody>
      </TableShell>

      <AnimatePresence>
        {crud.modalOpen && (
          <DrivenResultModal
            key="modal"
            initial={crud.editing}
            busy={crud.busy}
            onClose={crud.closeModal}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {crud.confirming && (
          <ConfirmDelete
            key="confirm"
            title="Delete metric?"
            body={
              <>
                <span className="text-white">{crud.confirming.label}</span> will be permanently
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

function DrivenResultModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: ApiDrivenResult | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: DrivenResultInput) => void;
}) {
  const [form, setForm] = useState<DrivenResultInput>({
    value: initial?.value ?? 0,
    prefix: initial?.prefix ?? '',
    suffix: initial?.suffix ?? '',
    label: initial?.label ?? '',
    description: initial?.description ?? '',
    order: initial?.order ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof DrivenResultInput>(key: K, value: DrivenResultInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.value == null || Number.isNaN(form.value)) e.value = 'Value is required';
    if (!form.label?.trim()) e.label = 'Label is required';
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
              {initial ? 'Edit metric' : 'New metric'}
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Prefix" hint="e.g. $">
              <Input value={form.prefix ?? ''} onChange={(v) => set('prefix', v)} />
            </Field>
            <Field label="Value" error={errors.value}>
              <Input
                type="number"
                value={String(form.value ?? '')}
                onChange={(v) => set('value', v ? Number(v) : 0)}
              />
            </Field>
            <Field label="Suffix" hint="e.g. +, %">
              <Input value={form.suffix ?? ''} onChange={(v) => set('suffix', v)} />
            </Field>
            <Field label="Order">
              <Input
                type="number"
                value={String(form.order ?? 0)}
                onChange={(v) => set('order', v ? Number(v) : 0)}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Label" hint="e.g. PROJECTS DELIVERED" error={errors.label}>
              <Input value={form.label} onChange={(v) => set('label', v)} />
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
              {busy ? 'Saving…' : initial ? 'Save changes' : 'Create metric'}
            </button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  );
}
