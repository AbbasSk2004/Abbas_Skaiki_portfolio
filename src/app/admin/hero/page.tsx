'use client';

// -----------------------------------------------------------------------------
// Hero admin — SINGLETON editor (no table). Loads the one Hero document and
// upserts it. Media: one image (headerImage). Same shape as the About screen.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { getHero, updateHero, type HeroInput } from '@/api/admin/hero';
import { ApiError } from '@/api/api';
import {
  Field,
  Input,
  Textarea,
  ImagePicker,
  ToastStack,
  useToasts,
} from '../components/crud';

export default function HeroAdminPage() {
  const { toasts, push } = useToasts();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<HeroInput>({
    firstName: '',
    lastName: '',
    roleLabel: '',
    intro: '',
    badge: '',
    headerImage: '',
  });

  useEffect(() => {
    let active = true;
    getHero()
      .then((doc) => {
        if (active && doc) {
          setForm({
            firstName: doc.firstName ?? '',
            lastName: doc.lastName ?? '',
            roleLabel: doc.roleLabel ?? '',
            intro: doc.intro ?? '',
            badge: doc.badge ?? '',
            headerImage: doc.headerImage ?? '',
          });
        }
      })
      .catch((err) => push('err', err instanceof ApiError ? err.message : 'Failed to load Hero'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [push]);

  const set = <K extends keyof HeroInput>(key: K, value: HeroInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.firstName?.trim()) e.firstName = 'First name is required';
    if (!form.lastName?.trim()) e.lastName = 'Last name is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const updated = await updateHero(form, file);
      setForm({
        firstName: updated.firstName ?? '',
        lastName: updated.lastName ?? '',
        roleLabel: updated.roleLabel ?? '',
        intro: updated.intro ?? '',
        badge: updated.badge ?? '',
        headerImage: updated.headerImage ?? '',
      });
      setFile(null);
      push('ok', 'Hero saved');
    } catch (err) {
      push('err', err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">Hero</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
          {loading ? 'Loading…' : 'Singleton — edits the landing hero'}
        </p>
      </header>

      {loading ? (
        <div className="h-64 animate-pulse rounded-[var(--radius)] border border-white/10 bg-white/[0.02]" />
      ) : (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-[var(--radius)] border border-white/10 bg-white/[0.02] p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName}>
              <Input value={form.firstName} onChange={(v) => set('firstName', v)} />
            </Field>
            <Field label="Last name" error={errors.lastName}>
              <Input value={form.lastName} onChange={(v) => set('lastName', v)} />
            </Field>
          </div>
          <Field label="Role label" hint="e.g. Creative Developer / Based in the Digital Realm">
            <Input value={form.roleLabel ?? ''} onChange={(v) => set('roleLabel', v)} />
          </Field>
          <Field label="Badge" hint="e.g. EST. 2024 / Portfolio">
            <Input value={form.badge ?? ''} onChange={(v) => set('badge', v)} />
          </Field>
          <Field label="Intro paragraph">
            <Textarea value={form.intro ?? ''} onChange={(v) => set('intro', v)} rows={4} />
          </Field>

          <ImagePicker
            label="Portrait"
            currentUrl={form.headerImage}
            file={file}
            onPickFile={setFile}
            onClearCurrent={() => set('headerImage', '')}
          />

          <div className="flex justify-end border-t border-white/10 pt-5">
            <button
              type="submit"
              disabled={busy}
              className="rounded-[var(--radius-md)] bg-white px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-black transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
