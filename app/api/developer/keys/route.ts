import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, key_name, api_key, calls_used, calls_limit, is_active, created_at, last_used_at')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const maskedKeys = data.map(key => ({
      ...key,
      api_key: key.api_key.substring(0, 12) + '...' + key.api_key.slice(-4),
    }));

    return NextResponse.json({
      success: true,
      keys: maskedKeys,
    });
  } catch (error) {
    console.error('Get keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!keyId || !email) {
      return NextResponse.json(
        { error: 'Key ID and email are required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_email', email);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete key error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}