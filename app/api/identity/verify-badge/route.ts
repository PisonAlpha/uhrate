import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!badgeId && !email) {
      return NextResponse.json(
        { error: 'Provide a badge ID or email' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('identity_badges').select('*');

    if (badgeId) {
      query = query.eq('badge_id', badgeId.trim());
    } else if (email) {
      query = query.eq('user_email', email.trim());
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({
        found: false,
        message: 'No badge found.',
      });
    }

    return NextResponse.json({
      found: true,
      badge: {
        badge_id: data.badge_id,
        full_name: data.full_name,
        badge_type: data.badge_type,
        organization: data.organization,
        website: data.website,
        is_verified: data.is_verified,
        verified_at: data.verified_at,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('Badge verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { badgeId, adminSecret } = body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('identity_badges')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('badge_id', badgeId)
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from('users')
      .update({ verified_badge: true })
      .eq('email', data.user_email);

    return NextResponse.json({
      success: true,
      message: 'Badge verified successfully.',
      badge: data,
    });
  } catch (error) {
    console.error('Badge approve error:', error);
    return NextResponse.json(
      { error: 'Failed to verify badge.' },
      { status: 500 }
    );
  }
}