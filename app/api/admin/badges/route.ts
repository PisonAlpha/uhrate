import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('identity_badges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, badges: data });
  } catch (error) {
    console.error('Admin badges error:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { badgeId } = await request.json();
    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('identity_badges')
      .delete()
      .eq('badge_id', badgeId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Badge rejected and removed.' });
  } catch (error) {
    console.error('Admin badge delete error:', error);
    return NextResponse.json({ error: 'Failed to reject badge' }, { status: 500 });
  }
}