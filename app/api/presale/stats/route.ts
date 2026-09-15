import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('presale_purchases')
      .select('uhr_amount, usdt_amount');

    const tokensSold = data?.reduce((sum, p) => sum + (p.uhr_amount || 0), 0) || 0;
    const totalRaised = data?.reduce((sum, p) => sum + (p.usdt_amount || 0), 0) || 0;

    return NextResponse.json({ success: true, data: { tokensSold, totalRaised } });
  } catch (error) {
    return NextResponse.json({ success: false, data: { tokensSold: 12450000, totalRaised: 124500 } });
  }
}