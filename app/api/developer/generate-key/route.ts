import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { resolveAuthIdentity } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const identity = await resolveAuthIdentity(request);
    if (identity.status === 'invalid') {
      return NextResponse.json({ error: 'Invalid or expired authentication token' }, { status: 401 });
    }

    const body = await request.json();
    const { keyName } = body;
    const email = identity.status === 'authenticated' ? identity.email : body.email;

    if (!email || !keyName) {
      return NextResponse.json(
        { error: 'Email and key name are required' },
        { status: 400 }
      );
    }

    const { data: existingKeys } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('user_email', email)
      .eq('is_active', true);

    if (existingKeys && existingKeys.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 API keys per account' },
        { status: 400 }
      );
    }

    const apiKey = 'uhr_' + crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_email: email,
        key_name: keyName,
        api_key: apiKey,
        calls_limit: 1000,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      api_key: apiKey,
      key_name: keyName,
      calls_limit: 1000,
      message: 'Save this key — it will not be shown again.',
    });
  } catch (error) {
    console.error('Generate key error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}