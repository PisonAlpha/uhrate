import type { RegistryConfig } from './types';

// Content types offered by the web form and the AI auto-fill.
const CONTENT_TYPES = [
  'Photograph',
  'Video Recording',
  'Audio Recording',
  'Written Article',
  'Document/Report',
  'Screenshot/Screen Recording',
  'Satellite/Aerial Image',
  'Social Media Post',
  'Interview Recording',
  'Other Media',
] as const;

// Media registry (roadmap D27), matching the web's /media page and
// app/api/media/*.
export const mediaRegistry: RegistryConfig = {
  key: 'media',
  title: 'Media registry',
  registerIntro:
    'Register a photo, video, recording or article permanently on the blockchain, so its origin can be proven later. Add the file to fill in the details automatically, or type them yourself.',
  searchIntro: 'Check that a piece of media is registered on UHRATE.',
  fileNoun: 'file',
  maxFileMB: 100,
  fields: [
    { name: 'journalistName', label: 'Journalist name', required: true, autoCapitalize: 'words', placeholder: 'Full name' },
    { name: 'journalistEmail', label: 'Email', required: true, kind: 'email', placeholder: 'journalist@media.com' },
    { name: 'mediaOrganization', label: 'Media organization', autoCapitalize: 'words', placeholder: 'CNN, Reuters, etc.' },
    { name: 'contentTitle', label: 'Content title', required: true, autoCapitalize: 'sentences', placeholder: 'Descriptive title' },
    { name: 'contentType', label: 'Content type', required: true, kind: 'select', options: CONTENT_TYPES },
    { name: 'captureDate', label: 'Capture / creation date', required: true, kind: 'date' },
    { name: 'location', label: 'Location', autoCapitalize: 'words', placeholder: 'Where was this captured?' },
    { name: 'description', label: 'Description', kind: 'multiline', placeholder: 'Brief description' },
  ],
  summary: (f) => [
    { label: 'Content', value: `${f.contentTitle} (${f.contentType})` },
    { label: 'Captured', value: f.location ? `${f.captureDate}, ${f.location}` : f.captureDate },
    { label: 'Journalist', value: f.mediaOrganization ? `${f.journalistName}, ${f.mediaOrganization}` : f.journalistName },
  ],
  chainRecord: (f, sha256) => ({
    platform: 'UHRATE Media',
    journalist: f.journalistName,
    org: f.mediaOrganization,
    title: f.contentTitle,
    type: f.contentType,
    date: f.captureDate,
    location: f.location,
    sha256,
    timestamp: Date.now(),
  }),
  idPrefix: 'UMED',
  // The server uses one of these, preferring the hash, then the title.
  searchFields: [
    { name: 'contentTitle', label: 'Content title', placeholder: 'Content title' },
    { name: 'journalistName', label: 'Journalist name', placeholder: 'Journalist name' },
    { name: 'sha256Hash', label: 'SHA-256 hash', placeholder: 'File hash', mono: true },
  ],
  resultNoun: ['media record', 'media records'],
};
