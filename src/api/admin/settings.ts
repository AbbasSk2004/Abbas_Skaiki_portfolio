import { adminPut } from './client';
import type { AdminUser } from './auth';

// -----------------------------------------------------------------------------
// Admin settings service. Mirrors back/routes/admin/settingsRoutes.js: a single
// PUT for the authenticated admin's username and/or password. Reuses the
// AdminUser shape from ./auth since the backend returns the same sanitized
// payload ({ id, username }).
//
// Session note: when newPassword is provided the backend rotates the password,
// which revokes every outstanding JWT — but it also re-issues the HttpOnly
// cookie in the same response, so THIS device stays signed in. Callers never
// need to redirect to login on success.
// -----------------------------------------------------------------------------

export type AdminSettingsInput = {
  username: string;
  currentPassword: string;
  newPassword?: string;
};

// PUT /api/admin/settings — update username and/or password. Throws
// ApiError(400/401/409) on validation/re-auth/uniqueness failures.
export const updateAdminSettings = (input: AdminSettingsInput) =>
  adminPut<AdminUser>('/api/admin/settings', input as Record<string, unknown>);
