import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const { data: verifications, error } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const total = verifications.length;
    const verified = verifications.filter(v =>
      v.rating === 'Verified Original' || v.rating === 'Likely Original'
    ).length;
    const aiGenerated = verifications.filter(v =>
      v.rating === 'AI Generated' || v.rating === 'AI Assisted'
    ).length;
    const highRisk = verifications.filter(v =>
      v.rating === 'High Risk' || v.rating === 'Deepfake Suspected'
    ).length;

    return NextResponse.json({
      success: true,
      verifications,
      stats: {
        total,
        verified,
        aiGenerated,
        highRisk,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}