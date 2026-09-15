import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, usdtAmount, uhrAmount, txHash } = await request.json();

    if (!walletAddress || !usdtAmount || !uhrAmount || !txHash) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('presale_purchases')
      .insert({
        wallet_address: walletAddress,
        usdt_amount: usdtAmount,
        uhr_amount: uhrAmount,
        tx_hash: txHash,
        status: 'distributed',
        distributed_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presale record error:', error);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }
}