// Education registry (roadmap D25). Field names match the request bodies of
// app/api/education/{extract,verify-match,register}/route.ts.

/** Degree options offered by the web form and the AI auto-fill. */
export const DEGREE_TYPES = [
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

export interface CredentialForm {
  institutionName: string;
  institutionEmail: string;
  studentName: string;
  studentEmail: string;
  degreeType: string;
  fieldOfStudy: string;
  graduationYear: string;
  certificateNumber: string;
}

/** The fields the AI can read off a certificate image. */
export type ExtractedCredential = Pick<
  CredentialForm,
  'institutionName' | 'studentName' | 'degreeType' | 'fieldOfStudy' | 'graduationYear' | 'certificateNumber'
>;

export interface CredentialMismatch {
  field: keyof ExtractedCredential;
  submitted: string;
  found: string;
  reason: string;
}
