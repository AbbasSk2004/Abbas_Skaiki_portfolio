'use client';

// -----------------------------------------------------------------------------
// Approach admin — SINGLETON editor (no table). Loads the one Approach section
// document and upserts it. The section carries ONE image (approachImage) plus an
// ordered array of text-only steps. Same singleton pattern as about/hero pages;
// the ImagePicker is decoupled from the dynamic steps list per the schema.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import {
  getApproach,
  updateApproach,
  type ApproachInput,
  type ApproachStep,
} from '@/api/admin/approach';
import { ApiError } from '@/api/api';
import {
  Field,
  Input,
  Textarea,
  ImagePicker,
  ToastStack,
  useToasts,
} from '../components/crud';

// A blank step appended when the admin adds a row. stepNumber defaults to the
// next position so the public sort stays stable without manual entry.
const blankStep = (nextNumber: number): ApproachStep => ({
  stepNumber: nextNumber,
  title: '',
  description: '',
});

export default function ApproachAdminPage() {
  const { toasts, push } = useToasts();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ApproachInput>({
    approachImage: '',
    steps: [],
  });

  useEffect(() => {
    let active = true;
    getApproach()
      .then((doc) => {
        if (active && doc) {
          setForm({
            approachImage: doc.approachImage ?? '',
            steps: (doc.steps ?? []).map((s) => ({
              stepNumber: s.stepNumber,
              title: s.title,
              description: s.description,
            })),
          });
        }
      })
      .catch((err) =>
        push('err', err instanceof ApiError ? err.message : 'Failed to load Approach')
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [push]);

  const setImage = (url: string) => setForm((f) => ({ ...f, approachImage: url }));

  const setStep = <K extends keyof ApproachStep>(
    index: number,
    key: K,
    value: ApproachStep[K]
  ) =>
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    }));

  const addStep = () =>
    setForm((f) => ({ ...f, steps: [...f.steps, blankStep(f.steps.length + 1)] }));

  const removeStep = (index: number) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    form.steps.forEach((s, i) => {
      if (!s.title.trim()) e[`title-${i}`] = 'Title is required';
      if (!s.description.trim()) e[`desc-${i}`] = 'Description is required';
      if (!Number.isFinite(s.stepNumber)) e[`num-${i}`] = 'Number is required';
    });
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      const updated = await updateApproach(form, file);
      setForm({
        approachImage: updated.approachImage ?? '',
        steps: (updated.steps ?? []).map((s) => ({
          stepNumber: s.stepNumber,
          title: s.title,
          description: s.description,
        })),
      });
      setFile(null);
      push('ok', 'Approach saved');
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
          Approach
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
          {loading ? 'Loading…' : 'Singleton — one section image + ordered steps'}
        </p>
      </header>

      {loading ? (
        <div className="h-64 animate-pulse rounded-[var(--radius)] border border-white/10 bg-white/[0.02]" />
      ) : (
        <form
          onSubmit={submit}
          className="space-y-6 rounded-[var(--radius)] border border-white/10 bg-white/[0.02] p-6"
        >
          {/* One section-level image, decoupled from the steps. */}
          <ImagePicker
            label="Section image"
            currentUrl={form.approachImage}
            file={file}
            onPickFile={setFile}
            onClearCurrent={() => setImage('')}
          />

          {/* Dynamic text-only steps list. */}
          <div className="space-y-4 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                Steps ({form.steps.length})
              </p>
              <button
                type="button"
                onClick={addStep}
                className="rounded-[var(--radius-md)] border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
              >
                + Add step
              </button>
            </div>

            {form.steps.length === 0 && (
              <p className="font-mono text-[11px] text-zinc-600">
                No steps yet. Add the first phase of your process.
              </p>
            )}

            {form.steps.map((step, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    Step {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="font-mono text-[10px] uppercase tracking-widest text-[var(--destructive)] hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[100px_1fr]">
                  <Field label="Number" error={errors[`num-${i}`]}>
                    <Input
                      type="number"
                      value={Number.isFinite(step.stepNumber) ? String(step.stepNumber) : ''}
                      onChange={(v) => setStep(i, 'stepNumber', v ? Number(v) : NaN)}
                    />
                  </Field>
                  <Field label="Title" error={errors[`title-${i}`]}>
                    <Input value={step.title} onChange={(v) => setStep(i, 'title', v)} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Description" error={errors[`desc-${i}`]}>
                    <Textarea
                      value={step.description}
                      onChange={(v) => setStep(i, 'description', v)}
                    />
                  </Field>
                </div>
              </div>
            ))}
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
