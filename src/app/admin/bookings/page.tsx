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
} from '@/api/admin/bookings';
import { ApiError } from '@/api/api';
import { cn } from '@/app/lib/cn';
import {
  useCrud,
  ConfirmDelete,
  TableShell,
  ToastStack,
  AdminPageHeader,
} from '../components/crud';

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed'];

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: 'border-[var(--chart-4)]/40 text-[var(--chart-4)]',
  confirmed: 'border-[var(--chart-2)]/40 text-[var(--chart-2)]',
  completed: 'border-[var(--chart-3)]/40 text-[var(--chart-3)]',
};

export default function BookingsAdminPage() {
  const crud = useCrud<ApiBooking>({
    list: listBookings,
    remove: deleteBooking,
    labels: { entity: 'Booking' },
  });

  const [savingId, setSavingId] = useState<string | null>(null);
  const changeStatus = async (item: ApiBooking, status: BookingStatus) => {
    if (status === item.status) return;
    setSavingId(item._id);
    try {
      await updateBookingStatus(item._id, status);
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
              <th className="hidden px-4 py-3 font-medium md:table-cell">Topic</th>
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
                      {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600">{item.time}</p>
                  </td>
                  <td className="hidden max-w-xs px-4 py-3 md:table-cell">
                    <p className="truncate text-xs text-zinc-400">{item.topic || '—'}</p>
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
