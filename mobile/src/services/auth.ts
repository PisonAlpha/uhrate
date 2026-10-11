import { api } from '@/services/api';
import type { AuthSuccessResponse, AuthUser } from '@/types/auth';

// Thin wrappers around the existing, unmodified request contracts.
// Do not change these payload shapes — they must match
// app/api/auth/register/route.ts and app/api/auth/login/route.ts exactly.

export function loginRequest(email: string, password: string) {
  return api.post<AuthSuccessResponse>('/api/auth/login', { email, password });
}

export function registerRequest(email: string, password: string, full_name: string) {
  return api.post<AuthSuccessResponse>('/api/auth/register', { email, password, full_name });
}

export interface ProfileResponse {
  success: true;
  user: AuthUser;
}

/**
 * Fetches the authenticated user's profile using the stored bearer token.
 * No email needs to be supplied — the backend derives identity from the
 * verified token (see resolveAuthIdentity in lib/auth.ts on the backend).
 */
export function fetchProfile() {
  return api.get<ProfileResponse>('/api/profile', { auth: true });
}

/**
 * Emails a new verification link. The endpoint identifies the account by the
 * email in the body; it does not read the token.
 */
export function sendVerificationEmail(email: string) {
  return api.post<{ success: true; message: string }>('/api/auth/send-verification', { email });
}

/** Changes the signed-in user's password. Identity comes from the token. */
export function changePassword(currentPassword: string, newPassword: string) {
  return api.post<{ success: true; message: string }>(
    '/api/profile/change-password',
    { currentPassword, newPassword },
    { auth: true }
  );
}
