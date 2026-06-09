import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function saveVerification(data: {
  file_name: string;
  file_type: string;
  file_size: number;
  sha256_hash: string;
  originality_score: number;
  ai_score: number;
  deepfake_score: number;
  manipulation_score: number;
  trust_score: number;
  rating: string;
  certificate_id: string;
  blockchain_tx?: string;
  blockchain_chain?: string;
  ipfs_hash?: string;
}) {
  const { data: result, error } = await supabaseAdmin
    .from('verifications')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getVerificationByCertificateId(certificateId: string) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('certificate_id', certificateId)
    .single();

  if (error) throw error;
  return data;
}

export async function getVerificationByHash(hash: string) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('sha256_hash', hash)
    .single();

  if (error) return null;
  return data;
}

export async function getAllVerifications() {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}