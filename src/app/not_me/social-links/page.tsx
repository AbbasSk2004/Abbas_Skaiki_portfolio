'use client';

// -----------------------------------------------------------------------------
// Social Links admin — data table + create/edit/delete modal.
//
// Media-free model (`icon` is a lucide component NAME). Built on the shared CRUD
// kit so it mirrors the other admin screens exactly; every request is plain JSON.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  type SocialLinkInput,
} from '@/api/admin/socialLinks';
import type { ApiSocialLink } from '@/api/public/socialLinks';
import {
  useCrud,
  Backdrop,
  ModalCard,
  ConfirmDelete,
  Field,
  Input,
  TableShell,
  ToastStack,
  AdminPageHeader,
  RowActions,
} from '../components/crud';

export default function SocialLinksAdminPage() {
  const crud = useCrud<ApiSocialLink>({
    list: listSocialLinks,
    remove: deleteSocialLink,
    labels: { entity: 'Social link' },
  });

  const handleSubmit = (input: SocialLinkInput) =>
    crud.submit(() =>
      crud.editing
        ? updateSocialLink(crud.editing._id, input)
        : createSocialLink(input)
    );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Social Links"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} total`}
        actionLabel="+ New Link"
        onAction={crud.openCreate}
      />

      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Icon</th>
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
                  No social links yet. Create your first one.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((s) => (
                <tr key={s._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{s.platform}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-xs truncate font-mono text-[11px] text-zinc-400 underline-offset-2 hover:text-white hover:underline"
                    >
                      {s.url}
                    </a>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-zinc-400 sm:table-cell">
                    {s.icon || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => crud.openEdit(s)} onDelete={() => crud.setConfirming(s)} />
                  </td>
                </tr>
              ))}
          </tbody>
      </TableShell>

      <AnimatePresence>
        {crud.modalOpen && (
          <SocialLinkModal
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
            title="Delete social link?"
            body={
              <>
                <span className="text-white">{crud.confirming.platform}</span> will be permanently
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

function SocialLinkModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: ApiSocialLink | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: SocialLinkInput) => void;
}) {
  const [form, setForm] = useState<SocialLinkInput>({
    platform: initial?.platform ?? '',
    url: initial?.url ?? '',
    icon: initial?.icon ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof SocialLinkInput>(key: K, value: SocialLinkInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.platform?.trim()) e.platform = 'Platform is required';
    if (!form.url?.trim()) e.url = 'URL is required';
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
      <ModalCard className="max-w-lg">
        <form onSubmit={submit}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight text-white">
              {initial ? 'Edit social link' : 'New social link'}
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

          <div className="space-y-4">
            <Field label="Platform" hint="e.g. GitHub, LinkedIn" error={errors.platform}>
              <Input value={form.platform} onChange={(v) => set('platform', v)} />
            </Field>
            <Field label="URL" error={errors.url}>
              <Input value={form.url} onChange={(v) => set('url', v)} />
            </Field>
            <Field label="Icon" hint="lucide icon name, e.g. Github">
              <Input value={form.icon ?? ''} onChange={(v) => set('icon', v)} />
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
              {busy ? 'Saving…' : initial ? 'Save changes' : 'Create link'}
            </button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  );
}
