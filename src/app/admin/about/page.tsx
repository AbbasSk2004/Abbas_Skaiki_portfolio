'use client';

// -----------------------------------------------------------------------------
// About admin — SINGLETON editor (no table). Loads the one About document and
// upserts it. Media: one image (aboutImage). Reuses the shared form primitives
// (Field/Input/Textarea/ImagePicker/toasts) so it matches every other screen.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { getAbout, updateAbout, type AboutInput } from '@/api/admin/about';
import { ApiError } from '@/api/api';
import {
  Field,
  Input,
  Textarea,
  ImagePicker,
  ToastStack,
  useToasts,
} from '../components/crud';

export default function AboutAdminPage() {
  const { toasts, push } = useToasts();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<AboutInput>({
    bio: '',
    resumeLink: '',
    availabilityStatus: true,
    aboutImage: '',
  });

  useEffect(() => {
    let active = true;
    getAbout()
      .then((doc) => {
        if (active && doc) {
          setForm({
            bio: doc.bio ?? '',
            resumeLink: doc.resumeLink ?? '',
            availabilityStatus: doc.availabilityStatus ?? true,
            aboutImage: doc.aboutImage ?? '',
          });
        }
      })
      .catch((err) => push('err', err instanceof ApiError ? err.message : 'Failed to load About'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [push]);

  const set = <K extends keyof AboutInput>(key: K, value: AboutInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.bio?.trim()) e.bio = 'Bio is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const updated = await updateAbout(form, file);
      setForm({
        bio: updated.bio ?? '',
        resumeLink: updated.resumeLink ?? '',
        availabilityStatus: updated.availabilityStatus ?? true,
        aboutImage: updated.aboutImage ?? '',
      });
      setFile(null);
      push('ok', 'About saved');
    } catch (err) {
      push('err', err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">About</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
          {loading ? 'Loading…' : 'Singleton — edits the one About document'}
        </p>
      </header>

      {loading ? (
        <div className="h-64 animate-pulse rounded-[var(--radius)] border border-white/10 bg-white/[0.02]" />
      ) : (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-[var(--radius)] border border-white/10 bg-white/[0.02] p-6"
        >
          <Field label="Bio" error={errors.bio}>
            <Textarea value={form.bio} onChange={(v) => set('bio', v)} rows={5} />
          </Field>
          <Field label="Resume link">
            <Input value={form.resumeLink ?? ''} onChange={(v) => set('resumeLink', v)} />
          </Field>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!form.availabilityStatus}
              onChange={(e) => set('availabilityStatus', e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
              Available for work
            </span>
          </label>

          <ImagePicker
            label="Portrait"
            currentUrl={form.aboutImage}
            file={file}
            onPickFile={setFile}
            onClearCurrent={() => set('aboutImage', '')}
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
