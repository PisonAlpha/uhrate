import { NextRequest, NextResponse } from 'next/server';
import { mintNFTCertificate } from '@/lib/nft';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      certificateId,
      recipientAddress,
    } = await request.json();

    if (!certificateId || !recipientAddress) {
      return NextResponse.json(
        { error: 'Certificate ID and wallet address are required' },
        { status: 400 }
      );
    }

    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'NFT contract not deployed yet' },
        { status: 500 }
      );
    }

    const { data: verification, error } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    if (error || !verification) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    const result = await mintNFTCertificate(
      recipientAddress,
      certificateId,
      verification.sha256_hash,
      verification.file_name,
      verification.rating,
      verification.trust_score,
      contractAddress
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Minting failed' },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from('verifications')
      .update({ nft_tx: result.txHash, nft_token_id: result.tokenId })
      .eq('certificate_id', certificateId);

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      tokenId: result.tokenId,
      explorerUrl: result.explorerUrl,
    });
  } catch (error) {
    console.error('NFT mint route error:', error);
    return NextResponse.json(
      { error: 'Minting failed. Please try again.' },
      { status: 500 }
    );
  }
}