import { adminFetch } from './client';
import type { ApiApproach } from '../public/approach';

// -----------------------------------------------------------------------------
// Admin Approach service. SINGLETON: the Approach section is ONE document — a
// single section image plus an ordered array of text-only steps. No list/create/
// delete; the admin only reads the one doc and upserts it (get + put), same
// shape as the About / Hero singletons.
//
// Media: ONE section image (approachImage). `steps` is a nested array, which
// FormData cannot carry natively, so it is JSON.stringify'd into the multipart
// body — the admin controller's parseSteps() reverses this. Reuses the public
// ApiApproach type so the admin form and the public site share one source of truth.
// -----------------------------------------------------------------------------

// One process phase — text only; the section image lives at the top level.
export type ApproachStep = {
  stepNumber: number;
  title: string;
  description: string;
};

// Fields the admin form edits. approachImage holds an already-hosted Cloudinary
// URL the admin chose to keep (or ''); a brand-new file is sent separately.
export type ApproachInput = {
  approachImage?: string;
  steps: ApproachStep[];
};

// Build a multipart body when a file is attached. `steps` is JSON-encoded so the
// nested array survives FormData; the controller JSON.parses it back.
function toFormData(input: ApproachInput, file: File): FormData {
  const fd = new FormData();
  if (input.approachImage !== undefined) fd.append('approachImage', input.approachImage);
  fd.append('steps', JSON.stringify(input.steps));
  fd.append('image', file);
  return fd;
}

// GET /api/admin/approaches — the singleton (data may be null before first save).
export const getApproach = () =>
  adminFetch<ApiApproach | null>('/api/admin/approaches');

// PUT /api/admin/approaches — upsert. Multipart when a new file is attached,
// otherwise plain JSON (steps sent as a real array).
export const updateApproach = (input: ApproachInput, file?: File | null) => {
  if (file) {
    return adminFetch<ApiApproach>('/api/admin/approaches', {
      method: 'PUT',
      body: toFormData(input, file),
    });
  }
  return adminFetch<ApiApproach>('/api/admin/approaches', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
};
