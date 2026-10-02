import { API_BASE_URL } from '@/constants/config';
import { getStoredToken } from '@/lib/secureStorage';

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

  if (auth) {
    const token = await getStoredToken();
    if (token) {
      // Never log the token — only ever placed in this header.
      headers['Authorization'] = `Bearer ${token}`;
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
