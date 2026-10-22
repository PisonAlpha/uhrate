// Describes one of the web's registries (education, legal, media) so the
// shared Register and Search screens can serve all of them. Each registry
// has the same four routes under /api/<key>/: extract, verify-match,
// register and verify.

export type RegistryKey = 'education' | 'legal' | 'media';

export interface RegistryField {
  /** Request body key, as the register route expects it. */
  name: string;
  label: string;
  required?: boolean;
  /** text by default. year: 4 digits; date: YYYY-MM-DD; select: one of `options`. */
  kind?: 'text' | 'email' | 'year' | 'date' | 'select' | 'multiline';
  options?: readonly string[];
  placeholder?: string;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
}

export interface RegistrySearchField {
  /** Request body key for /api/<key>/verify. */
  name: string;
  label: string;
  placeholder?: string;
  /** IDs and hashes: monospace, no auto-capitalisation. */
  mono?: boolean;
}

export interface RegistryConfig {
  key: RegistryKey;
  /** Page title, e.g. "Education registry". */
  title: string;
  registerIntro: string;
  searchIntro: string;
  /** What the uploaded file is, e.g. "certificate". */
  fileNoun: string;
  /** Same limit as the web page. */
  maxFileMB: number;
  fields: RegistryField[];
  /** Lines of the "Details checked" summary. */
  summary: (form: Record<string, string>) => { label: string; value: string }[];
  /**
   * What goes into the payment transaction's data field, as JSON. Same keys
   * as the web page writes on-chain. `sha256` is null without a file.
   */
  chainRecord: (form: Record<string, string>, sha256: string | null) => Record<string, unknown>;
  /** e.g. "UEDU" — registry IDs start with this. */
  idPrefix: string;
  /** Ways to search besides the registry ID. */
  searchFields: RegistrySearchField[];
  /** Plural noun for search results, e.g. ["credential", "credentials"]. */
  resultNoun: [string, string];
}
