import { api, appendFile, type UploadFile } from '@/services/api';
import type { DocumentRegistryResponse } from '@/types/lookup';

// The Document registry's routes (app/api/registry/*). Unlike education,
// legal and media, there is no AI auto-fill or match check, and register
// takes the file itself. Both routes are public: neither reads the token.

/** The registry ID of a document already registered with this hash, or null. */
export async function findRegisteredDocument(sha256Hash: string): Promise<string | null> {
  const response = await api.post<DocumentRegistryResponse>('/api/registry/lookup', { hash: sha256Hash });
  return response.found ? response.registry.registry_id : null;
}

export interface DocumentRegisterResponse {
  success: true;
  registry_id: string;
  sha256_hash: string;
  /** Chain name, e.g. "BNB Chain". */
  chain: string;
  tx_hash: string;
  ipfs_hash?: string;
  ipfs_url?: string;
  registered_at: string;
}

/**
 * Saves a paid registration (/api/registry/register). The server hashes the
 * file itself. `txHash` is the fee payment; `chainId` is the chain's id from
 * constants/chains.ts.
 */
export function registerDocument(
  file: UploadFile,
  details: { ownerName: string; ownerEmail: string; documentType: string },
  metadata: Record<string, string>,
  payment: { chainId: string; txHash: string }
) {
  const form = new FormData();
  appendFile(form, 'file', file);
  form.append('ownerName', details.ownerName);
  form.append('ownerEmail', details.ownerEmail);
  form.append('documentType', details.documentType);
  form.append('chainId', payment.chainId);
  form.append('txHash', payment.txHash);
  form.append('metadata', JSON.stringify(metadata));
  return api.upload<DocumentRegisterResponse>('/api/registry/register', form);
}
