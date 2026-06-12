import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { certificateId, txHash } = await request.json();

    if (!certificateId || !txHash) {
      return NextResponse.json({ error: 'Certificate ID and tx hash required' }, { status: 400 });
    }

    await supabaseAdmin
      .from('verifications')
      .update({ nft_tx: txHash })
      .eq('certificate_id', certificateId);

    return NextResponse.json({
      success: true,
      txHash,
      explorerUrl: 'https://testnet.bscscan.com/tx/' + txHash,
    });
  } catch (error) {
    console.error('NFT save error:', error);
    return NextResponse.json({ error: 'Failed to save NFT record' }, { status: 500 });
  }
}