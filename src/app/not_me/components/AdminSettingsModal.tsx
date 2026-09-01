'use client';

// -----------------------------------------------------------------------------
// Admin account settings modal.
//
// Opened from the settings gear in the admin sidebar / mobile drawer. Lets the
// authenticated admin change their username and/or password — both gated behind
// a re-authentication with the current password (the backend enforces the same
// contract on PUT /api/admin/settings).
//
// Reuses the shared CRUD primitives (Backdrop / ModalCard / Field / Input) so
// the modal is visually identical to every other admin dialog: #0a0a0a card,
// white/10 borders, mono labels, dvh height cap for mobile keyboards.
//
// Success handling: after a save the backend re-issues the session cookie when
// the password rotated, so the session survives — we show a confirmation block
// and auto-close. The parent is notified via onUpdated so its admin state never
// drifts from the server's view of the username.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { updateAdminSettings } from '@/api/admin/settings';
import { ApiError } from '@/api/api';
import { Backdrop, ModalCard, Field, Input } from './crud';

export function AdminSettingsModal({
  currentUsername,
  onClose,
  onUpdated,
}: {
  currentUsername: string;
  onClose: () => void;
  onUpdated: (username: string) => void;
}) {
  const [username, setUsername] = useState(currentUsername);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Close on Escape — matches the backdrop-click affordance for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || success) return;

    setError(null);

    // Client-side gate: mirror the backend contract so obvious mistakes never
    // cost a round-trip.
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      const updated = await updateAdminSettings({
        username: trimmed,
        currentPassword,
        newPassword: newPassword || undefined,
      });
      onUpdated(updated.username);
      setSuccess(
        newPassword
          ? 'Account updated. Password rotated — other sessions were signed out.'
          : 'Account updated.'
      );
      // Brief confirmation, then close.
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not save settings. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalCard className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight">
              Account Settings
            </h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Update your username or password
            </p>
          </div>

          <Field label="Username">
            <Input
              value={username}
              onChange={setUsername}
              type="text"
              autoComplete="username"
            />
          </Field>

          <Field label="Current Password" hint="required">
            <Input
              value={currentPassword}
              onChange={setCurrentPassword}
              type="password"
              autoComplete="current-password"
            />
          </Field>

          <Field label="New Password" hint="optional">
            <Input
              value={newPassword}
              onChange={setNewPassword}
              type="password"
              autoComplete="new-password"
            />
          </Field>

          {error && (
            <p className="rounded-[var(--radius-md)] border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-3 py-2 font-mono text-[11px] text-[#ff6b81]">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-[11px] text-white">
              {success}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-[var(--radius-md)] border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !!success}
              className="rounded-[var(--radius-md)] bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </ModalCard>
    </Backdrop>
  );
}
