// Responses of the public lookup routes. Only the fields the app uses are
// typed. None of these routes need a token.

/** POST /api/verify-public (app/api/verify-public/route.ts) */
export interface PublicVerification {
  certificate_id: string;
  file_name: string;
  file_type: string;
  sha256_hash: string;
  trust_score: number;
  rating: string;
  blockchain_tx: string | null;
  blockchain_chain: string | null;
  verified_at: string;
}

export type VerifyPublicResponse =
  | { found: true; verification: PublicVerification }
  | { found: false; message: string; hash?: string };

/** POST /api/registry/lookup (app/api/registry/lookup/route.ts) */
export type DocumentRegistryResponse =
  | {
      found: true;
      registry: {
        registry_id: string;
        file_name: string | null;
        document_type: string | null;
        owner_name: string | null;
        chain_name: string | null;
        tx_hash: string | null;
        sha256_hash: string | null;
        is_original: boolean | null;
        registered_at: string;
      };
    }
  | { found: false; message: string; hash?: string };

/** POST /api/education/verify */
export type EducationVerifyResponse =
  | {
      found: true;
      credentials: {
        registry_id: string;
        institution_name: string | null;
        student_name: string | null;
        degree_type: string | null;
        field_of_study: string | null;
        graduation_year: string | number | null;
        certificate_number: string | null;
        chain_name: string | null;
        tx_hash: string | null;
        is_valid: boolean | null;
        issued_at: string;
      }[];
    }
  | { found: false; message: string };

/** POST /api/legal/verify */
export type LegalVerifyResponse =
  | {
      found: true;
      documents: {
        registry_id: string;
        firm_name: string | null;
        document_title: string | null;
        document_type: string | null;
        parties: string | null;
        execution_date: string | null;
        jurisdiction: string | null;
        reference_number: string | null;
        chain_name: string | null;
        tx_hash: string | null;
        is_valid: boolean | null;
        registered_at: string;
      }[];
    }
  | { found: false; message: string };

/** POST /api/media/verify */
export type MediaVerifyResponse =
  | {
      found: true;
      media: {
        registry_id: string;
        journalist_name: string | null;
        media_organization: string | null;
        content_title: string | null;
        content_type: string | null;
        capture_date: string | null;
        location: string | null;
        chain_name: string | null;
        tx_hash: string | null;
        is_verified: boolean | null;
        registered_at: string;
      }[];
    }
  | { found: false; message: string };

/** A registry entry of any kind, reduced to what the lookup screen shows. */
export interface RegistryRecord {
  title: string;
  registryId: string;
  fields: { label: string; value: string }[];
  chain: string | null;
  tx: string | null;
  registeredAt: string;
  /** null when the registry doesn't track validity. */
  valid: boolean | null;
}

export type LookupRecord =
  | { type: 'verification'; verification: PublicVerification }
  | { type: 'registry'; record: RegistryRecord };

export interface LookupOutcome {
  records: LookupRecord[];
  /** When nothing was found: the server's explanation. */
  message: string | null;
  /** SHA-256 of the file looked up, when the server computed it. */
  hash: string | null;
}
