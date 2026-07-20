import { adminGet, adminPost } from './client';

// Admin session shape returned by the backend auth controller.
export interface AdminUser {
  id: string;
  username: string;
}

// POST /api/auth/login — sets the HttpOnly cookie server-side; returns the admin.
export const login = (username: string, password: string) =>
  adminPost<AdminUser>('/api/auth/login', { username, password });

// POST /api/auth/logout — clears the cookie server-side.
export const logout = () => adminPost<{ message?: string }>('/api/auth/logout');

// GET /api/auth/me — resolves the current session, or throws ApiError(401).
// Used by the admin layout as a route guard on mount.
export const getMe = () => adminGet<AdminUser>('/api/auth/me');
