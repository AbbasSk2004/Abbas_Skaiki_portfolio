import { adminFetch } from './client';

// -----------------------------------------------------------------------------
// Admin Inquiries service. READ-ONLY INBOX: inquiries are created by the public
// (POST /api/inquiries). Admin only lists, reads, advances the status through its
// lifecycle, and deletes — there is no create/edit here.
// -----------------------------------------------------------------------------

export type InquiryStatus = 'new' | 'read' | 'replied';

// Mirrors the Inquiry documents served by the admin backend.
export type ApiInquiry = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: InquiryStatus;
  createdAt?: string;
};

// GET /api/admin/inquiries — all inquiries, newest first (optional ?status=).
export const listInquiries = (status?: InquiryStatus) =>
  adminFetch<ApiInquiry[]>(
    `/api/admin/inquiries${status ? `?status=${status}` : ''}`
  );

// PUT /api/admin/inquiries/:id — advance the status ('new'|'read'|'replied').
export const updateInquiryStatus = (id: string, status: InquiryStatus) =>
  adminFetch<ApiInquiry>(`/api/admin/inquiries/${id}`, {
    method: 'PUT',
    body: { status },
  });

// DELETE /api/admin/inquiries/:id — remove an inquiry.
export const deleteInquiry = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/inquiries/${id}`, {
    method: 'DELETE',
  });
