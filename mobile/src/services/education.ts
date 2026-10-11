import { api, appendFile, type UploadFile } from '@/services/api';
import { toRecords } from '@/services/lookup';
import type { CredentialForm, CredentialMismatch, ExtractedCredential } from '@/types/education';
import type { EducationVerifyResponse, RegistryRecord } from '@/types/lookup';

// Education registry routes. All public: none read the token.

export interface CredentialSearch {
  registryId?: string;
  studentName?: string;
  institutionName?: string;
}

/** Finds credentials by registry ID, or by student name (optionally with institution). Up to 10. */
export async function searchCredentials(
  search: CredentialSearch
): Promise<{ records: RegistryRecord[]; message: string | null }> {
  const response = await api.post<EducationVerifyResponse>('/api/education/verify', search);
  const records = toRecords(response).flatMap((r) => (r.type === 'registry' ? [r.record] : []));
  return { records, message: response.found ? null : response.message };
}

/** Reads a certificate image with AI and returns the fields it found. Images only. */
export async function extractCredential(file: UploadFile): Promise<Partial<ExtractedCredential>> {
  const form = new FormData();
  appendFile(form, 'file', file);
  const response = await api.upload<{ success: true; extracted: Partial<ExtractedCredential> }>(
    '/api/education/extract',
    form
  );
  return response.extracted ?? {};
}

/**
 * Asks the AI whether the form matches the certificate image. An empty list
 * means it matches, or that the check couldn't run (the server lets those
 * through, as the web does).
 */
export async function checkCredentialMatch(file: UploadFile, details: CredentialForm): Promise<CredentialMismatch[]> {
  const form = new FormData();
  appendFile(form, 'file', file);
  form.append('institutionName', details.institutionName);
  form.append('studentName', details.studentName);
  form.append('degreeType', details.degreeType);
  form.append('fieldOfStudy', details.fieldOfStudy);
  form.append('graduationYear', details.graduationYear);
  form.append('certificateNumber', details.certificateNumber);
  const response = await api.upload<{ success: true; mismatches?: CredentialMismatch[] }>(
    '/api/education/verify-match',
    form
  );
  return response.mismatches ?? [];
}
