import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    if (!walletAddress) return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    const nonce = crypto.randomBytes(16).toString('hex');
    const address = walletAddress.toLowerCase();
    await supabaseAdmin.from('wallet_nonces').upsert({ wallet_address: address, nonce, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() }, { onConflict: 'wallet_address' });
    return NextResponse.json({ success: true, nonce });
  } catch (error) {
    console.error('Wallet nonce error:', error);
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
}
