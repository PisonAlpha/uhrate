// Recognizes the UHRATE identifiers the web lookup pages accept, in text
// read from a QR code. The ID may be on its own or inside a link, so codes
// that encode a lookup URL work too.

export type LookupCode =
  /** Verification certificate (verify, seal): UHRATE-<time>-<8 hex>. Looked up via verify-public. */
  | { kind: 'certificate'; value: string }
  /** Registry entry: UREG, UEDU, ULEG or UMED prefix. Looked up via registry/lookup. */
  | { kind: 'registry'; value: string }
  /** SHA-256 of a file (64 hex characters). */
  | { kind: 'hash'; value: string };

// Same shape as generateCertificateId() in lib/hasher.ts on the backend; the
// registries swap the UHRATE prefix for their own.
const ID_PATTERN = /\b(UHRATE|UREG|UEDU|ULEG|UMED)-[A-Z0-9]+-[A-F0-9]{8}\b/i;
const HASH_PATTERN = /\b[a-f0-9]{64}\b/i;

export function parseLookupCode(text: string): LookupCode | null {
  const decoded = safeDecode(text.trim());

  const id = decoded.match(ID_PATTERN);
  if (id) {
    const value = id[0].toUpperCase();
    return id[1].toUpperCase() === 'UHRATE' ? { kind: 'certificate', value } : { kind: 'registry', value };
  }

  const hash = decoded.match(HASH_PATTERN);
  if (hash) return { kind: 'hash', value: hash[0].toLowerCase() };

  return null;
}

export function lookupCodeLabel(code: LookupCode): string {
  switch (code.kind) {
    case 'certificate':
      return 'Certificate ID';
    case 'registry':
      return 'Registry ID';
    case 'hash':
      return 'File fingerprint (SHA-256)';
  }
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
