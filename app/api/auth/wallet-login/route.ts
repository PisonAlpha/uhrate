import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json();
    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const address = walletAddress.toLowerCase();
    const { data: nonceData } = await supabaseAdmin.from('wallet_nonces').select('*').eq('wallet_address', address).single();
    if (!nonceData) return NextResponse.json({ error: 'Invalid nonce' }, { status: 400 });
    if (new Date(nonceData.expires_at) < new Date()) return NextResponse.json({ error: 'Nonce expired' }, { status: 400 });
    const recovered = ethers.verifyMessage(message, signature).toLowerCase();
    if (recovered !== address) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    await supabaseAdmin.from('wallet_nonces').delete().eq('wallet_address', address);
    let { data: user } = await supabaseAdmin.from('users').select('*').eq('wallet_address', address).single();
    if (!user) {
      const { data: newUser, error: insertError } = await supabaseAdmin.from('users').insert({
        wallet_address: address,
        full_name: address.slice(0,6) + '...' + address.slice(-4),
        email: address.slice(0,8) + '@wallet.uhrate',
        email_verified: true,
        role: 'free',
      }).select().single();
      if (insertError) throw insertError;
      user = newUser;
    }
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, wallet_address: user.wallet_address } });
  } catch (error) {
    console.error('Wallet login error:', error);
    return NextResponse.json({ error: 'Wallet login failed' }, { status: 500 });
  }
}
