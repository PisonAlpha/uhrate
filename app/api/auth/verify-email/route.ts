import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid verification link`
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Invalid or expired verification link`
      );
    }

    if (new Date(user.token_expires_at) < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Verification link has expired`
      );
    }

    await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        token_expires_at: null,
      })
      .eq('id', user.id);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?success=Email verified successfully. You can now log in.`
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Verification failed. Please try again.`
    );
  }
}