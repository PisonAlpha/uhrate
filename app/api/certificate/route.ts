import { NextRequest, NextResponse } from 'next/server';
import { getVerificationByCertificateId } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('id');

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    const verification = await getVerificationByCertificateId(certificateId);

    if (!verification) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: verification.certificate_id,
        file_name: verification.file_name,
        file_type: verification.file_type,
        file_size: verification.file_size,
        sha256_hash: verification.sha256_hash,
        originality_score: verification.originality_score,
        ai_score: verification.ai_score,
        deepfake_score: verification.deepfake_score,
        manipulation_score: verification.manipulation_score,
        trust_score: verification.trust_score,
        rating: verification.rating,
        blockchain_tx: verification.blockchain_tx,
        blockchain_chain: verification.blockchain_chain,
        issued_at: verification.created_at,
        is_valid: true,
      },
    });
  } catch (error) {
    console.error('Certificate error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}