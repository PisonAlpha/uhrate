import { api, appendFile, type UploadFile } from '@/services/api';
import type { VerifyResponse } from '@/types/verify';

/**
 * Runs the AI authenticity check on a file. With the token, the server
 * charges the signed-in user's credits and saves the result to their history.
 */
export function verifyFile(file: UploadFile) {
  const form = new FormData();
  appendFile(form, 'file', file);
  return api.upload<VerifyResponse>('/api/verify', form, { auth: true });
}
