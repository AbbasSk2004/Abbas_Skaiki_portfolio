'use client';

// -----------------------------------------------------------------------------
// Bookings admin — READ-ONLY INBOX. Call bookings are created by the public site;
// admin lists them, advances the status ('pending'|'confirmed'|'completed'), and
// deletes. Same shape as the Inquiries screen, with booking-specific columns
// (date / time / topic). Built on the shared CRUD kit.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  listBookings,
  updateBookingStatus,
  deleteBooking,
  type ApiBooking,
  type BookingStatus,
  type BookingPlatform,
} from '@/api/admin/bookings';
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
  formatTime12h,
  formatDate,
} from '../components/crud';

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed'];

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: 'border-[var(--chart-4)]/40 text-[var(--chart-4)]',
  confirmed: 'border-[var(--chart-2)]/40 text-[var(--chart-2)]',
  completed: 'border-[var(--chart-3)]/40 text-[var(--chart-3)]',
};

// Status mutations offered in the details modal footer. 'pending' is included
// so a booking can be moved back if it was advanced by mistake.
const STATUS_ACTIONS: { status: BookingStatus; label: string }[] = [
  { status: 'pending', label: 'Mark Pending' },
  { status: 'confirmed', label: 'Mark Confirmed' },
  { status: 'completed', label: 'Mark Completed' },
];

// Display labels for the platform enum; bookings predating the field fall back
// to an em dash rather than rendering "undefined".
const PLATFORM_LABELS: Record<BookingPlatform, string> = {
  zoom: 'Zoom',
  'google-meet': 'Google Meet',
  whatsapp: 'WhatsApp',
};

export default function BookingsAdminPage() {
  const crud = useCrud<ApiBooking>({
    list: listBookings,
    remove: deleteBooking,
    labels: { entity: 'Booking' },
  });

  // The booking currently open in the read-only details modal.
  const [viewing, setViewing] = useState<ApiBooking | null>(null);

  const [savingId, setSavingId] = useState<string | null>(null);
  const changeStatus = async (item: ApiBooking, status: BookingStatus) => {
    if (status === item.status) return;
    setSavingId(item._id);
    try {
      await updateBookingStatus(item._id, status);
      crud.push('ok', `Marked ${status}`);
      // Keep the open modal in sync with what was just saved, so its footer
      // buttons reflect the new status without a reopen.
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
        title="Bookings"
        subtitle={crud.loading ? 'Loading…' : `${crud.items.length} total`}
        actionLabel="Refresh"
        onAction={crud.refresh}
      />

      <TableShell>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">Requester</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">When</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Platform</th>
              <th className="px-4 py-3 font-medium">Status</th>
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
                  No bookings yet.
                </td>
              </tr>
            )}

            {!crud.loading &&
              crud.items.map((item) => (
                <tr key={item._id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="truncate font-mono text-[10px] text-zinc-600">{item.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="font-mono text-xs text-zinc-300 tabular-nums">
                      {formatDate(item.date)}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600 tabular-nums">
                      {formatTime12h(item.time)}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="font-mono text-xs text-zinc-300">
                      {item.platform ? PLATFORM_LABELS[item.platform] ?? item.platform : '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      disabled={savingId === item._id}
                      onChange={(e) => changeStatus(item, e.target.value as BookingStatus)}
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
              ))}
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
                {STATUS_ACTIONS.map(({ status, label }) => {
                  const isCurrent = viewing.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={isCurrent || savingId === viewing._id}
                      onClick={() => changeStatus(viewing, status)}
                      className="rounded-[var(--radius-sm)] border border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-zinc-300"
                    >
                      {isCurrent ? `✓ ${label}` : label}
                    </button>
                  );
                })}
              </div>
            }
          >
            <DetailRow label="Phone">
              {viewing.phone ? (
                <a
                  href={`tel:${viewing.phone.replace(/[^\d+]/g, '')}`}
                  className="font-mono text-xs tabular-nums hover:text-white"
                >
                  {viewing.phone}
                </a>
              ) : (
                '—'
              )}
            </DetailRow>
            <DetailRow label="When">
              <span className="font-mono tabular-nums">
                {formatDate(viewing.date)} · {formatTime12h(viewing.time)}
              </span>
            </DetailRow>
            <DetailRow label="Preferred Platform">
              {viewing.platform ? PLATFORM_LABELS[viewing.platform] ?? viewing.platform : '—'}
            </DetailRow>
            <DetailRow label="Status">
              <span className="font-mono uppercase">{viewing.status}</span>
            </DetailRow>
            <DetailRow label="Topic &amp; Details">
              {/* whitespace-pre-wrap so the client's line breaks survive. */}
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {viewing.topic || '—'}
              </p>
            </DetailRow>
            <DetailRow label="Requested">{formatDate(viewing.createdAt)}</DetailRow>
          </DetailModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {crud.confirming && (
          <ConfirmDelete
            key="confirm"
            title="Delete booking?"
            body={
              <>
                The booking from <span className="text-white">{crud.confirming.name}</span> will be
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
