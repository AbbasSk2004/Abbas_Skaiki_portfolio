'use client';

// -----------------------------------------------------------------------------
// Services admin — data table + create/edit/delete modal.
//
// Single-image model (serviceImage → Cloudinary). Built on the shared CRUD kit
// (../components/crud) so it mirrors the Projects screen exactly with far less
// code. Styling is the site palette throughout.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listServices,
  createService,
  updateService,
  deleteService,
  type ServiceInput,
} from '@/api/admin/services';
import type { ApiService } from '@/api/public/services';
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
  toList,
} from '../components/crud';

export default function ServicesAdminPage() {
  const crud = useCrud<ApiService>({
    list: listServices,
    remove: deleteService,
    labels: { entity: 'Service' },
  });

  const handleSubmit = (input: ServiceInput, file: File | null) =>
    crud.submit(() =>
      crud.editing
        ? updateService(crud.editing._id, input, file)
        : createService(input, file)
    );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Services"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} total`}
        actionLabel="+ New Service"
        onAction={crud.openCreate}
      />

      {/* Table */}
      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Tags</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Order</th>
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
                  No services yet. Create your first one.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((s) => (
                <tr key={s._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.serviceImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.serviceImage}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)] object-cover"
                        />
                      ) : (
                        <span className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)] bg-white/5" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{s.title}</p>
                        <p className="truncate font-mono text-[10px] text-zinc-600">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(s.tags ?? []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                      {(s.tags?.length ?? 0) === 0 && <span className="text-zinc-600">—</span>}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 sm:table-cell tabular-nums">
                    {s.order ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => crud.openEdit(s)} onDelete={() => crud.setConfirming(s)} />
                  </td>
                </tr>
              ))}
          </tbody>
      </TableShell>

      {/* Create / edit modal */}
      <AnimatePresence>
        {crud.modalOpen && (
          <ServiceModal
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
            title="Delete service?"
            body={
              <>
                <span className="text-white">{crud.confirming.title}</span> and its image will be
                permanently removed. This cannot be undone.
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

function ServiceModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: ApiService | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: ServiceInput, file: File | null) => void;
}) {
  const [form, setForm] = useState<ServiceInput>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    icon: initial?.icon ?? '',
    tags: initial?.tags ?? [],
    serviceImage: initial?.serviceImage ?? '',
    order: initial?.order ?? 0,
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.description?.trim()) e.description = 'Description is required';
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
              {initial ? 'Edit service' : 'New service'}
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
            <Field label="Icon" hint="lucide name, e.g. Code2">
              <Input value={form.icon ?? ''} onChange={(v) => set('icon', v)} />
            </Field>
            <Field label="Tags" hint="comma,separated">
              <Input
                value={(form.tags ?? []).join(', ')}
                onChange={(v) => set('tags', toList(v))}
              />
            </Field>
            <Field label="Order">
              <Input
                type="number"
                value={form.order != null ? String(form.order) : ''}
                onChange={(v) => set('order', v ? Number(v) : 0)}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Description" error={errors.description}>
              <Textarea value={form.description} onChange={(v) => set('description', v)} />
            </Field>
          </div>

          <div className="mt-4">
            <ImagePicker
              label="Service image"
              currentUrl={form.serviceImage}
              file={file}
              onPickFile={setFile}
              onClearCurrent={() => set('serviceImage', '')}
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
              {busy ? 'Saving…' : initial ? 'Save changes' : 'Create service'}
            </button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  );
}
