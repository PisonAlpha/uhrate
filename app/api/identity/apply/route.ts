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
    const {
      userEmail: suppliedEmail,
      fullName,
      badgeType,
      organization,
      website,
      verificationMethod,
      verificationData,
    } = body;
    // A valid token always wins over a client-supplied email.
    const userEmail = identity.status === 'authenticated' ? identity.email : suppliedEmail;

    if (!userEmail || !fullName || !badgeType || !verificationMethod) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from('identity_badges')
      .select('id, is_verified')
      .eq('user_email', userEmail)
      .single();

    if (existing) {
      return NextResponse.json({
        error: existing.is_verified
          ? 'You already have a verified badge'
          : 'Your badge application is pending review',
      }, { status: 400 });
    }

    const badgeId = 'UBADGE-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const { data, error } = await supabaseAdmin
      .from('identity_badges')
      .insert({
        user_email: userEmail,
        full_name: fullName,
        badge_type: badgeType,
        organization: organization || null,
        website: website || null,
        verification_method: verificationMethod,
        verification_data: verificationData || null,
        is_verified: false,
        badge_id: badgeId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      badge_id: badgeId,
      message: 'Badge application submitted. You will be notified once verified.',
      status: 'pending',
    });
  } catch (error) {
    console.error('Badge apply error:', error);
    return NextResponse.json(
      { error: 'Application failed. Please try again.' },
      { status: 500 }
    );
  }
}