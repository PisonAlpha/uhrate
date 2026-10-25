import type { RegistryConfig } from './types';

// Degree options offered by the web form and the AI auto-fill.
const DEGREE_TYPES = [
  'Bachelor of Science (B.Sc)',
  'Bachelor of Arts (B.A)',
  'Bachelor of Engineering (B.Eng)',
  'Master of Science (M.Sc)',
  'Master of Arts (M.A)',
  'Master of Business Administration (MBA)',
  'Doctor of Philosophy (PhD)',
  'Associate Degree',
  'Higher National Diploma (HND)',
  'Professional Certificate',
  'Diploma',
  'Other',
] as const;

// Education registry (roadmap D25), matching the web's /education page and
// app/api/education/*.
export const educationRegistry: RegistryConfig = {
  key: 'education',
  title: 'Education registry',
  registerIntro:
    'Register a degree or certificate permanently on the blockchain. Add the certificate to fill in the details automatically, or type them yourself.',
  searchIntro: 'Check that a degree or certificate is registered on UHRATE.',
  fileNoun: 'certificate',
  maxFileMB: 20,
  fields: [
    { name: 'institutionName', label: 'Institution name', required: true, autoCapitalize: 'words' },
    { name: 'institutionEmail', label: 'Institution email', required: true, kind: 'email' },
    { name: 'studentName', label: 'Student name', required: true, autoCapitalize: 'words' },
    { name: 'studentEmail', label: 'Student email', required: true, kind: 'email' },
    { name: 'degreeType', label: 'Degree type', required: true, kind: 'select', options: DEGREE_TYPES },
    { name: 'fieldOfStudy', label: 'Field of study', required: true, autoCapitalize: 'words' },
    { name: 'graduationYear', label: 'Graduation year', required: true, kind: 'year', placeholder: '2024' },
    { name: 'certificateNumber', label: 'Certificate number', autoCapitalize: 'characters' },
  ],
  summary: (f) => [
    { label: 'Student', value: f.studentName },
    { label: 'Credential', value: `${f.degreeType}, ${f.fieldOfStudy} (${f.graduationYear})` },
    { label: 'Institution', value: f.institutionName },
  ],
  chainRecord: (f) => ({
    platform: 'UHRATE Education',
    institution: f.institutionName,
    student: f.studentName,
    degree: f.degreeType,
    field: f.fieldOfStudy,
    year: f.graduationYear,
    timestamp: Date.now(),
  }),
  idPrefix: 'UEDU',
  searchFields: [
    { name: 'studentName', label: 'Student name', placeholder: 'Jane Doe' },
    { name: 'institutionName', label: 'Institution (optional, with name)', placeholder: 'University of …' },
  ],
  resultNoun: ['credential', 'credentials'],
};
