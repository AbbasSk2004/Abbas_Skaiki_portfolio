import { adminFetch } from './client';

// -----------------------------------------------------------------------------
// Admin CallBookings service. READ-ONLY INBOX (same shape as Inquiries): created
// by the public (POST /api/bookings). Admin lists, reads, advances status, and
// deletes.
// -----------------------------------------------------------------------------

export type BookingStatus = 'pending' | 'confirmed' | 'completed';

// Mirrors the CallBooking documents served by the admin backend.
export type ApiBooking = {
  _id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  topic?: string;
  status: BookingStatus;
  createdAt?: string;
};

// GET /api/admin/bookings — all bookings by date (optional ?status=).
export const listBookings = (status?: BookingStatus) =>
  adminFetch<ApiBooking[]>(
    `/api/admin/bookings${status ? `?status=${status}` : ''}`
  );

// PUT /api/admin/bookings/:id — advance status ('pending'|'confirmed'|'completed').
export const updateBookingStatus = (id: string, status: BookingStatus) =>
  adminFetch<ApiBooking>(`/api/admin/bookings/${id}`, {
    method: 'PUT',
    body: { status },
  });

// DELETE /api/admin/bookings/:id — remove a booking.
export const deleteBooking = (id: string) =>
  adminFetch<{ message: string }>(`/api/admin/bookings/${id}`, {
    method: 'DELETE',
  });
