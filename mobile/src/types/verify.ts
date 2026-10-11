// Mirrors the response of POST /api/verify (app/api/verify/route.ts).
// Only the fields the app uses are typed.

export interface VerificationRecord {
  id: string;
  certificate_id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  sha256_hash: string;
  originality_score: number;
  ai_score: number;
  deepfake_score: number;
  manipulation_score: number;
  trust_score: number;
  rating: string;
  created_at: string;
}

export interface VerifyResponse {
  success: true;
  /** True when this exact file was verified before; `data` is that earlier result and there is no `analysis`. */
  cached: boolean;
  data: VerificationRecord;
  analysis?: {
    summary?: string;
    detected_issues?: string[];
  };
}
