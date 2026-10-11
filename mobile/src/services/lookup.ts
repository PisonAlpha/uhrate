import { api, appendFile, type UploadFile } from '@/services/api';
import type { LookupCode } from '@/lib/lookup-code';
import type {
  DocumentRegistryResponse,
  EducationVerifyResponse,
  LegalVerifyResponse,
  LookupOutcome,
  LookupRecord,
  MediaVerifyResponse,
  RegistryRecord,
  VerifyPublicResponse,
} from '@/types/lookup';

// Public lookups (roadmap D23), combining the web's /lookup (verifications)
// and /registry/lookup (document registry). Education, legal and media IDs
// go to their own registries' verify routes.

/** Looks up a certificate ID, registry ID or SHA-256 hash. */
export async function lookupCode(code: LookupCode): Promise<LookupOutcome> {
  switch (code.kind) {
    case 'certificate':
      return combine([api.post<VerifyPublicResponse>('/api/verify-public', { certificateId: code.value })]);
    case 'hash': {
      const outcome = await combine([
        api.post<VerifyPublicResponse>('/api/verify-public', { hash: code.value }),
        api.post<DocumentRegistryResponse>('/api/registry/lookup', { hash: code.value }),
      ]);
      // The server echoes the typed hash back; `hash` is only for file lookups.
      return { ...outcome, hash: null };
    }
    case 'registry':
      return lookupRegistryId(code.value);
  }
}

/** Looks up a file by its contents in the verifications and the document registry. */
export function lookupFile(file: UploadFile): Promise<LookupOutcome> {
  return combine([
    api.upload<VerifyPublicResponse>('/api/verify-public', fileForm(file)),
    api.upload<DocumentRegistryResponse>('/api/registry/lookup', fileForm(file)),
  ]);
}

function lookupRegistryId(registryId: string): Promise<LookupOutcome> {
  const prefix = registryId.split('-')[0];
  const body = { registryId };
  switch (prefix) {
    case 'UEDU':
      return combine([api.post<EducationVerifyResponse>('/api/education/verify', body)]);
    case 'ULEG':
      return combine([api.post<LegalVerifyResponse>('/api/legal/verify', body)]);
    case 'UMED':
      return combine([api.post<MediaVerifyResponse>('/api/media/verify', body)]);
    default:
      return combine([api.post<DocumentRegistryResponse>('/api/registry/lookup', body)]);
  }
}

export type AnyLookupResponse =
  | VerifyPublicResponse
  | DocumentRegistryResponse
  | EducationVerifyResponse
  | LegalVerifyResponse
  | MediaVerifyResponse;

// Runs the lookups together and merges what they found. If every lookup
// fails, the first error is thrown; if only some fail, the rest still count.
async function combine(requests: Promise<AnyLookupResponse>[]): Promise<LookupOutcome> {
  const settled = await Promise.allSettled(requests);
  const responses = settled.flatMap((s) => (s.status === 'fulfilled' ? [s.value] : []));
  if (responses.length === 0) throw (settled[0] as PromiseRejectedResult).reason;

  const records = responses.flatMap(toRecords);
  const notFound = responses.filter((r) => !r.found) as { message: string; hash?: string }[];
  return {
    records,
    message: records.length === 0 ? (notFound[0]?.message ?? 'No record found.') : null,
    hash: notFound.find((r) => r.hash)?.hash ?? null,
  };
}

/** Turns any lookup route's response into the records the screens show. */
export function toRecords(response: AnyLookupResponse): LookupRecord[] {
  if (!response.found) return [];
  if ('verification' in response) return [{ type: 'verification', verification: response.verification }];
  if ('registry' in response) {
    const r = response.registry;
    return [
      registry({
        title: 'Registered document',
        registryId: r.registry_id,
        fields: fields([
          ['File', r.file_name],
          ['Document type', r.document_type],
          ['Owner', r.owner_name],
          ['Original', r.is_original == null ? null : r.is_original ? 'Yes' : 'No'],
        ]),
        chain: r.chain_name,
        tx: r.tx_hash,
        registeredAt: r.registered_at,
        valid: null,
      }),
    ];
  }
  if ('credentials' in response) {
    return response.credentials.map((c) =>
      registry({
        title: 'Education credential',
        registryId: c.registry_id,
        fields: fields([
          ['Student', c.student_name],
          ['Institution', c.institution_name],
          ['Degree', c.degree_type],
          ['Field of study', c.field_of_study],
          ['Graduation year', c.graduation_year],
          ['Certificate number', c.certificate_number],
        ]),
        chain: c.chain_name,
        tx: c.tx_hash,
        registeredAt: c.issued_at,
        valid: c.is_valid,
      })
    );
  }
  if ('documents' in response) {
    return response.documents.map((d) =>
      registry({
        title: 'Legal document',
        registryId: d.registry_id,
        fields: fields([
          ['Title', d.document_title],
          ['Firm', d.firm_name],
          ['Document type', d.document_type],
          ['Parties', d.parties],
          ['Execution date', d.execution_date],
          ['Jurisdiction', d.jurisdiction],
          ['Reference number', d.reference_number],
        ]),
        chain: d.chain_name,
        tx: d.tx_hash,
        registeredAt: d.registered_at,
        valid: d.is_valid,
      })
    );
  }
  return response.media.map((m) =>
    registry({
      title: 'Media record',
      registryId: m.registry_id,
      fields: fields([
        ['Title', m.content_title],
        ['Journalist', m.journalist_name],
        ['Organization', m.media_organization],
        ['Content type', m.content_type],
        ['Captured', m.capture_date],
        ['Location', m.location],
      ]),
      chain: m.chain_name,
      tx: m.tx_hash,
      registeredAt: m.registered_at,
      valid: m.is_verified,
    })
  );
}

function registry(record: RegistryRecord): LookupRecord {
  return { type: 'registry', record };
}

// Drops empty values so the screen only lists what the record actually has.
function fields(pairs: [string, string | number | null | undefined][]) {
  return pairs.flatMap(([label, value]) =>
    value === null || value === undefined || value === '' ? [] : [{ label, value: String(value) }]
  );
}

function fileForm(file: UploadFile) {
  const form = new FormData();
  appendFile(form, 'file', file);
  return form;
}
