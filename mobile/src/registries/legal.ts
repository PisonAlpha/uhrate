import type { RegistryConfig } from './types';

// Document types offered by the web form and the AI auto-fill.
const LEGAL_DOCUMENT_TYPES = [
  'Contract/Agreement',
  'Non-Disclosure Agreement (NDA)',
  'Memorandum of Understanding (MOU)',
  'Power of Attorney',
  'Court Filing',
  'Affidavit',
  'Deed/Title',
  'Will/Testament',
  'Partnership Agreement',
  'Employment Contract',
  'Intellectual Property Filing',
  'Other Legal Document',
] as const;

// Legal registry (roadmap D26), matching the web's /legal page and
// app/api/legal/*.
export const legalRegistry: RegistryConfig = {
  key: 'legal',
  title: 'Legal registry',
  registerIntro:
    'Register a contract, deed or other legal document permanently on the blockchain. Add the document to fill in the details automatically, or type them yourself.',
  searchIntro: 'Check that a legal document is registered on UHRATE. Search is free.',
  fileNoun: 'document',
  maxFileMB: 50,
  fields: [
    { name: 'firmName', label: 'Law firm / organization', required: true, autoCapitalize: 'words' },
    { name: 'firmEmail', label: 'Firm email', required: true, kind: 'email', placeholder: 'legal@firm.com' },
    {
      name: 'documentTitle',
      label: 'Document title',
      required: true,
      autoCapitalize: 'sentences',
      placeholder: 'Service Agreement between…',
    },
    { name: 'documentType', label: 'Document type', required: true, kind: 'select', options: LEGAL_DOCUMENT_TYPES },
    { name: 'parties', label: 'Parties involved', required: true, autoCapitalize: 'words', placeholder: 'Party A, Party B' },
    { name: 'executionDate', label: 'Execution date', required: true, kind: 'date' },
    { name: 'jurisdiction', label: 'Jurisdiction', autoCapitalize: 'words', placeholder: 'e.g. New York, USA' },
    { name: 'referenceNumber', label: 'Reference number', autoCapitalize: 'characters', placeholder: 'e.g. REF/2024/001' },
  ],
  summary: (f) => [
    { label: 'Document', value: `${f.documentTitle} (${f.documentType})` },
    { label: 'Parties', value: f.parties },
    { label: 'Executed', value: f.executionDate },
    { label: 'Firm', value: f.firmName },
  ],
  chainRecord: (f, sha256) => ({
    platform: 'UHRATE Legal',
    firm: f.firmName,
    title: f.documentTitle,
    type: f.documentType,
    parties: f.parties,
    date: f.executionDate,
    sha256,
    timestamp: Date.now(),
  }),
  idPrefix: 'ULEG',
  searchFields: [
    { name: 'documentTitle', label: 'Document title', placeholder: 'Service Agreement…' },
    { name: 'firmName', label: 'Firm (optional, with title)', placeholder: 'Firm name' },
    { name: 'sha256Hash', label: 'SHA-256 hash', placeholder: 'Document hash', mono: true },
  ],
  resultNoun: ['document', 'documents'],
};
