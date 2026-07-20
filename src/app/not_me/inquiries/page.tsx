'use client';

// -----------------------------------------------------------------------------
// Inquiries admin — READ-ONLY INBOX. Inquiries are created by the public site;
// admin only lists them, advances the status ('new'|'read'|'replied'), and
// deletes. No create/edit modal — the only mutation is the inline status select.
// Built on the shared CRUD kit (list/delete/toast/confirm) so it matches every
// other admin screen.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listInquiries,
  updateInquiryStatus,
  deleteInquiry,
  type ApiInquiry,
  type InquiryStatus,
} from '@/api/admin/inquiries';
import { ApiError } from '@/api/api';
import { cn } from '@/app/lib/cn';
import {
  useCrud,
  ConfirmDelete,
  TableShell,
  ToastStack,
  AdminPageHeader,
} from '../components/crud';

const STATUSES: InquiryStatus[] = ['new', 'read', 'replied'];

// Token-colored status pill styles — reuses the brand chart palette by intent.
const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: 'border-[var(--chart-1)]/40 text-[var(--chart-1)]',
  read: 'border-[var(--chart-4)]/40 text-[var(--chart-4)]',
  replied: 'border-[var(--chart-2)]/40 text-[var(--chart-2)]',
};

export default function InquiriesAdminPage() {
  const crud = useCrud<ApiInquiry>({
    list: listInquiries,
    remove: deleteInquiry,
    labels: { entity: 'Inquiry' },
  });

  // Local status mutation — optimistic refresh via the shared kit.
  const [savingId, setSavingId] = useState<string | null>(null);
  const changeStatus = async (item: ApiInquiry, status: InquiryStatus) => {
    if (status === item.status) return;
    setSavingId(item._id);
    try {
      await updateInquiryStatus(item._id, status);
      crud.push('ok', `Marked ${status}`);
      await crud.refresh();
    } catch (err) {
      crud.push('err', err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Inquiries"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} total`}
        actionLabel="Refresh"
        onAction={crud.refresh}
      />

      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">From</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Message</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Received</th>
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
                  No inquiries yet.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((item) => (
                <tr key={item._id} className="group align-top transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="truncate font-mono text-[10px] text-zinc-600">{item.email}</p>
                    {item.subject && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        {item.subject}
                      </p>
                    )}
                  </td>
                  <td className="hidden max-w-md whitespace-normal px-4 py-3 md:table-cell">
                    <p className="line-clamp-3 text-xs text-zinc-400">{item.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      disabled={savingId === item._id}
                      onChange={(e) => changeStatus(item, e.target.value as InquiryStatus)}
                      className={cn(
                        'rounded-full border bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest outline-none disabled:opacity-50',
                        STATUS_STYLE[item.status]
                      )}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#0a0a0a] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[11px] text-zinc-500 sm:table-cell">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => crud.setConfirming(item)}
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

      <AnimatePresence>
        {crud.confirming && (
          <ConfirmDelete
            key="confirm"
            title="Delete inquiry?"
            body={
              <>
                The inquiry from <span className="text-white">{crud.confirming.name}</span> will be
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
