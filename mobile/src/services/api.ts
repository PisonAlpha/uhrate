import { API_BASE_URL } from '@/constants/config';
import { getStoredToken, clearStoredToken } from '@/lib/secureStorage';

/**
 * Small typed API client for the existing UHRATE Next.js backend.
 * Centralizes: base URL, JSON headers, Bearer-token attachment (read from
 * SecureStore, never duplicated per-screen), and error normalization.
 * Sends JSON bodies, or multipart/form-data when the body is a FormData
 * (file uploads; see api.upload and appendFile).
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

/** User-facing message for an error thrown by a request. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(err instanceof ApiError)) return fallback;
  return err.status === 0 ? 'Network error. Check your connection and try again.' : err.message;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** A local file to upload, e.g. from the image or document picker. */
export interface UploadFile {
  /** Local URI, e.g. file:///... or content://... */
  uri: string;
  name: string;
  /** MIME type, e.g. image/jpeg or application/pdf. */
  type: string;
}

/**
 * Adds a local file to a FormData under `field`. React Native uploads a
 * { uri, name, type } object as a file part; TypeScript's DOM types only
 * allow string or Blob, hence the cast.
 */
export function appendFile(form: FormData, field: string, file: UploadFile) {
  form.append(field, file as unknown as Blob);
}

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

  // FormData is sent as multipart/form-data. Its Content-Type is left to
  // fetch, which adds the boundary the server needs to split the parts.
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isForm) {
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
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
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
    const message =
      errorBody?.error ||
      (response.status === 413
        ? 'The file is too large to upload.'
        : `Request failed with status ${response.status}`);
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
  /** POST multipart/form-data. Build the form with appendFile and form.append. */
  upload: <T>(path: string, form: FormData, opts?: { auth?: boolean }) =>
    request<T>(path, { method: 'POST', body: form, auth: opts?.auth }),
};
