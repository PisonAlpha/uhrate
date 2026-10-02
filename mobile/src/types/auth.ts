// Mirrors the existing UHRATE API's user/response shapes exactly.
// See app/api/auth/{login,register,wallet-login}/route.ts on the backend —
// these types are additive documentation of what already exists there, not
// a new contract.

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  credits?: number;
  email_verified?: boolean;
  verified_badge?: boolean;
  wallet_address?: string;
}

export interface AuthSuccessResponse {
  success: true;
  user: AuthUser;
  /** Present only when the backend could sign a token (UHRATE_AUTH_SECRET configured). */
  token?: string;
  requiresVerification?: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
}
