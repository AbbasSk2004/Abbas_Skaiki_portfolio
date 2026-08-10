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
  DetailModal,
  DetailRow,
  formatDate,
} from '../components/crud';

const STATUSES: InquiryStatus[] = ['new', 'read', 'replied'];

// Token-colored status pill styles — reuses the brand chart palette by intent.
const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: 'border-[var(--chart-1)]/40 text-[var(--chart-1)]',
  read: 'border-[var(--chart-4)]/40 text-[var(--chart-4)]',
  replied: 'border-[var(--chart-2)]/40 text-[var(--chart-2)]',
};

// Historical fallback: before `phone` existed on the Inquiry model, ContactFooter
// appended the number to the message body as "\n\nPhone: <number>". New records
// carry a real `phone` field, so this only rescues rows written before that
// change — delete it once those have aged out.
const LEGACY_PHONE_SUFFIX = /\n\nPhone:\s*(.+)\s*$/;

const getPhone = (item: ApiInquiry) =>
  item.phone?.trim() || LEGACY_PHONE_SUFFIX.exec(item.message)?.[1]?.trim() || null;

// Strips the legacy appended line so the details modal doesn't repeat the phone
// number that already has its own row. A no-op for new records.
const getMessage = (item: ApiInquiry) => item.message.replace(LEGACY_PHONE_SUFFIX, '').trim();

export default function InquiriesAdminPage() {
  const crud = useCrud<ApiInquiry>({
    list: listInquiries,
    remove: deleteInquiry,
    labels: { entity: 'Inquiry' },
  });

  // Local status mutation — optimistic refresh via the shared kit.
  const [savingId, setSavingId] = useState<string | null>(null);
  // The inquiry currently open in the read-only details modal.
  const [viewing, setViewing] = useState<ApiInquiry | null>(null);

  const changeStatus = async (item: ApiInquiry, status: InquiryStatus) => {
    if (status === item.status) return;
    setSavingId(item._id);
    try {
      await updateInquiryStatus(item._id, status);
      crud.push('ok', `Marked ${status}`);
      // Keep the open modal in sync with what was just saved.
      setViewing((current) =>
        current && current._id === item._id ? { ...current, status } : current
      );
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
              <th className="hidden px-4 py-3 font-medium md:table-cell">Phone</th>
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
              crud.items.map((item) => {
                const phone = getPhone(item);
                return (
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
                  <td className="hidden px-4 py-3 md:table-cell">
                    {/* Parsed out of the message body — see extractPhone. Linked
                        as tel: so it's callable straight from the inbox. */}
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                        className="font-mono text-xs text-zinc-300 tabular-nums hover:text-white"
                      >
                        {phone}
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-zinc-600">—</span>
                    )}
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
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => setViewing(item)}
                        className="rounded-[var(--radius-sm)] border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-white/30 hover:text-white"
                      >
                        View
                      </button>
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
                );
              })}
          </tbody>
      </TableShell>

      <AnimatePresence>
        {viewing && (
          <DetailModal
            key="detail"
            title={viewing.name}
            subtitle={viewing.email}
            onClose={() => setViewing(null)}
            footer={
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => {
                  const isCurrent = viewing.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={isCurrent || savingId === viewing._id}
                      onClick={() => changeStatus(viewing, status)}
                      className="rounded-[var(--radius-sm)] border border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-zinc-300"
                    >
                      {isCurrent ? `✓ ${status}` : `Mark ${status}`}
                    </button>
                  );
                })}
              </div>
            }
          >
            {viewing.subject && <DetailRow label="Subject">{viewing.subject}</DetailRow>}
            <DetailRow label="Email">
              <a href={`mailto:${viewing.email}`} className="font-mono text-xs hover:text-white">
                {viewing.email}
              </a>
            </DetailRow>
            <DetailRow label="Phone">
              {getPhone(viewing) ? (
                <a
                  href={`tel:${getPhone(viewing)!.replace(/[^\d+]/g, '')}`}
                  className="font-mono text-xs tabular-nums hover:text-white"
                >
                  {getPhone(viewing)}
                </a>
              ) : (
                '—'
              )}
            </DetailRow>
            <DetailRow label="Status">
              <span className="font-mono uppercase">{viewing.status}</span>
            </DetailRow>
            <DetailRow label="Message">
              {/* Legacy "Phone:" suffix stripped — it has its own row above. */}
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {getMessage(viewing) || '—'}
              </p>
            </DetailRow>
            <DetailRow label="Received">{formatDate(viewing.createdAt)}</DetailRow>
          </DetailModal>
        )}
      </AnimatePresence>

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
