import { api, appendFile, type UploadFile } from '@/services/api';
import { toRecords, type AnyLookupResponse } from '@/services/lookup';
import type { RegistryKey } from '@/registries/types';
import type { RegistryRecord } from '@/types/lookup';

// The routes every registry (education, legal, media) has under /api/<key>/.
// All public: none read the token.

/** A field the AI says doesn't match the uploaded file. */
export interface DetailMismatch {
  field: string;
  submitted: string;
  found: string;
  reason: string;
}

/** Searches /api/<key>/verify. Up to 10 records. */
export async function searchRegistry(
  key: RegistryKey,
  search: Record<string, string>
): Promise<{ records: RegistryRecord[]; message: string | null }> {
  const response = await api.post<AnyLookupResponse>(`/api/${key}/verify`, search);
  const records = toRecords(response).flatMap((r) => (r.type === 'registry' ? [r.record] : []));
  return { records, message: response.found ? null : response.message };
}

/** Reads an image with AI and returns the form fields it found. Images only. */
export async function extractDetails(key: RegistryKey, file: UploadFile): Promise<Record<string, string>> {
  const form = new FormData();
  appendFile(form, 'file', file);
  const response = await api.upload<{ success: true; extracted?: Record<string, string> }>(
    `/api/${key}/extract`,
    form
  );
  return response.extracted ?? {};
}

/**
 * Asks the AI whether the details match the uploaded image. An empty list
 * means they match, or that the check couldn't run (the server lets those
 * through, as the web does).
 */
export async function checkDetailsMatch(
  key: RegistryKey,
  file: UploadFile,
  details: Record<string, string>
): Promise<DetailMismatch[]> {
  const form = new FormData();
  appendFile(form, 'file', file);
  // Each route reads only the fields it compares and ignores the rest.
  for (const [name, value] of Object.entries(details)) form.append(name, value);
  const response = await api.upload<{ success: true; mismatches?: DetailMismatch[] }>(`/api/${key}/verify-match`, form);
  return response.mismatches ?? [];
}

export interface RegisterResponse {
  success: true;
  registry_id: string;
  /** Chain name, e.g. "BNB Chain". */
  chain: string;
  tx_hash: string;
  ipfs_hash?: string;
  ipfs_url?: string;
}

/**
 * Saves a paid registration (/api/<key>/register). `txHash` is the fee
 * payment; `chainId` is the chain's id from constants/chains.ts.
 */
export function registerRecord(
  key: RegistryKey,
  details: Record<string, string>,
  payment: { sha256Hash: string; chainId: string; txHash: string }
) {
  return api.post<RegisterResponse>(`/api/${key}/register`, { ...details, ...payment });
}
