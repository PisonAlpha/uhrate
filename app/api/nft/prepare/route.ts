import { NextRequest, NextResponse } from 'next/server';
import { generateTokenURI } from '@/lib/nft';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { certificateId } = await request.json();

    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    if (!contractAddress) {
      return NextResponse.json({ error: 'NFT contract not configured' }, { status: 500 });
    }

    const { data: verification, error } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    if (error || !verification) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const tokenURI = generateTokenURI(
      certificateId,
      verification.file_name,
      verification.sha256_hash,
      verification.rating,
      verification.trust_score
    );

    return NextResponse.json({
      success: true,
      contractAddress,
      certificateId,
      fileHash: verification.sha256_hash,
      fileName: verification.file_name,
      rating: verification.rating,
      tokenURI,
    });
  } catch (error) {
    console.error('NFT prepare error:', error);
    return NextResponse.json({ error: 'Failed to prepare mint data' }, { status: 500 });
  }
}