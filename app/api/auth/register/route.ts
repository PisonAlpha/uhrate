import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        full_name,
        password_hash: hashedPassword,
        role: 'individual',
        credits: 10,
        email_verified: false,
        verification_token: token,
        token_expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await sendVerificationEmail(email, full_name, token);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      message: 'Account created. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        credits: user.credits,
        email_verified: false,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}