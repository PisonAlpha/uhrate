import { API_BASE_URL } from '@/constants/config';
import { getStoredToken, clearStoredToken } from '@/lib/secureStorage';

/**
 * Small typed API client for the existing UHRATE Next.js backend.
 * Centralizes: base URL, JSON headers, Bearer-token attachment (read from
 * SecureStore, never duplicated per-screen), and error normalization.
 *
 * multipart/form-data support (needed later for verify/upload screens) is a
 * deliberately deferred extension point — not implemented in Phase 1, which
 * only needs JSON auth endpoints.
 */

export class ApiError extends Error {
  /** HTTP status, or 0 for a network-level failure (no response received). */
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registered by AuthContext. Called after a 401 on an authenticated request
 * has cleared the stored token, so the app can end the session in one place.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

async function handleUnauthorized(sentToken: string) {
  // A late 401 for a token from an earlier session must not end a newer one.
  if ((await getStoredToken()) !== sentToken) return;
  await clearStoredToken();
  unauthorizedHandler?.();
}

interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** Attach `Authorization: Bearer <token>` from SecureStore, if one exists. */
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let sentToken: string | null = null;
  if (auth) {
    sentToken = await getStoredToken();
    if (sentToken) {
      // Never log the token — only ever placed in this header.
      headers['Authorization'] = `Bearer ${sentToken}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Network request failed. Check your connection and try again.');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON or empty body; leave data as null.
  }

  // The backend rejected our token (expired, revoked secret, malformed):
  // end the session centrally. Screens only see the ApiError below.
  if (response.status === 401 && sentToken) {
    await handleUnauthorized(sentToken);
  }

  if (!response.ok) {
    const errorBody = data as { error?: string } | null;
    const message = errorBody?.error || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'GET', auth: opts?.auth }),
  post: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'POST', body, auth: opts?.auth }),
  put: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'PUT', body, auth: opts?.auth }),
  delete: <T>(path: string, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'DELETE', auth: opts?.auth }),
};
