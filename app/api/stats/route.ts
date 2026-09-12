import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('verifications')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      totalVerifications: count || 0,
    });
  } catch (error) {
    return NextResponse.json({ success: false, totalVerifications: 0 });
  }
}