// Mirrors the response of GET /api/dashboard (app/api/dashboard/route.ts).
// Only the fields the app uses are typed.

export interface Verification {
  id: string;
  file_name: string;
  file_type: string;
  rating: string | null;
  trust_score: number | null;
  certificate_id: string | null;
  blockchain_tx: string | null;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  verified: number;
  aiGenerated: number;
  highRisk: number;
  mixed: number;
  avgTrustScore: number;
  nftMinted: number;
  totalSpent: number;
  deploymentsCount: number;
}

export interface DashboardResponse {
  success: true;
  /** Newest first, at most 100. */
  verifications: Verification[];
  stats: DashboardStats;
  fileTypeBreakdown: { type: string; count: number }[];
  ratingBreakdown: { rating: string; count: number }[];
  registryEntries: { id: string; document_type: string; created_at: string; chain_name: string | null }[];
}
