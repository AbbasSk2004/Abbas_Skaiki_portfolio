'use client';

// -----------------------------------------------------------------------------
// Contact admin — SINGLETON editor (no table). Loads the one ContactInfo
// document and upserts it. No media. `socialLinks` is a multi-select of the
// existing SocialLink documents (fetched from the admin social-links service),
// stored as an array of ids. Reuses the shared form primitives so it matches
// every other admin screen.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  getContactInfo,
  updateContactInfo,
  type ContactInput,
} from '@/api/admin/contact';
import { listSocialLinks } from '@/api/admin/socialLinks';
import type { ApiSocialLink } from '@/api/public/socialLinks';
import { ApiError } from '@/api/api';
import { cn } from '@/app/lib/cn';
import { Field, Input, Textarea, ToastStack, useToasts } from '../components/crud';

export default function ContactAdminPage() {
  const { toasts, push } = useToasts();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allLinks, setAllLinks] = useState<ApiSocialLink[]>([]);
  const [form, setForm] = useState<ContactInput>({
    email: '',
    phone: '',
    address: '',
    availabilityNote: '',
    socialLinks: [],
  });

  useEffect(() => {
    let active = true;
    Promise.all([getContactInfo(), listSocialLinks()])
      .then(([doc, links]) => {
        if (!active) return;
        setAllLinks(links);
        if (doc) {
          setForm({
            email: doc.email ?? '',
            phone: doc.phone ?? '',
            address: doc.address ?? '',
            availabilityNote: doc.availabilityNote ?? '',
            socialLinks: (doc.socialLinks ?? []).map((l) => l._id),
          });
        }
      })
      .catch((err) => push('err', err instanceof ApiError ? err.message : 'Failed to load Contact'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [push]);

  const set = <K extends keyof ContactInput>(key: K, value: ContactInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleLink = (id: string) =>
    set(
      'socialLinks',
      (form.socialLinks ?? []).includes(id)
        ? (form.socialLinks ?? []).filter((x) => x !== id)
        : [...(form.socialLinks ?? []), id]
    );

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!form.email?.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const updated = await updateContactInfo(form);
      setForm({
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        address: updated.address ?? '',
        availabilityNote: updated.availabilityNote ?? '',
        socialLinks: (updated.socialLinks ?? []).map((l) => l._id),
      });
      push('ok', 'Contact info saved');
    } catch (err) {
      push('err', err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">
          Contact
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
          {loading ? 'Loading…' : 'Singleton — edits the one Contact document'}
        </p>
      </header>

      {loading ? (
        <div className="h-64 animate-pulse rounded-[var(--radius)] border border-white/10 bg-white/[0.02]" />
      ) : (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-[var(--radius)] border border-white/10 bg-white/[0.02] p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <Input value={form.email} onChange={(v) => set('email', v)} type="email" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone ?? ''} onChange={(v) => set('phone', v)} />
            </Field>
          </div>
          <Field label="Address">
            <Input value={form.address ?? ''} onChange={(v) => set('address', v)} />
          </Field>
          <Field label="Availability note">
            <Textarea
              value={form.availabilityNote ?? ''}
              onChange={(v) => set('availabilityNote', v)}
              rows={2}
            />
          </Field>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Social links
            </p>
            {allLinks.length === 0 ? (
              <p className="font-mono text-xs text-zinc-600">
                No social links yet — add some under Social Links first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allLinks.map((link) => {
                  const active = (form.socialLinks ?? []).includes(link._id);
                  return (
                    <button
                      key={link._id}
                      type="button"
                      onClick={() => toggleLink(link._id)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors',
                        active
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                      )}
                    >
                      {link.platform}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
