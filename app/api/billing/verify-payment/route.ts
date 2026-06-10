import { NextRequest, NextResponse } from 'next/server';
import { verifyBNBPayment, verifyUSDTPayment } from '@/lib/billing';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { txHash, plan, paymentMethod, userEmail } = await request.json();

    if (!txHash || !plan || !paymentMethod || !userEmail) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const paymentWallet = process.env.PAYMENT_WALLET!;
    const usdtAmount = plan === 'pro' ? 10 : 50;

    let verification;

    if (paymentMethod === 'BNB') {
      verification = await verifyBNBPayment(txHash, usdtAmount, paymentWallet);
    } else if (paymentMethod === 'USDT') {
      verification = await verifyUSDTPayment(txHash, usdtAmount, paymentWallet);
    } else {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Payment not verified. Please check your transaction hash.' },
        { status: 400 }
      );
    }

    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'This transaction has already been used.' },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabaseAdmin.from('payments').insert({
      tx_hash: txHash,
      plan,
      payment_method: paymentMethod,
      amount: verification.amount,
      user_email: userEmail,
      from_address: verification.from,
      expires_at: expiresAt.toISOString(),
      verified: true,
    });

    await supabaseAdmin
      .from('users')
      .update({
        role: plan,
        plan_expires_at: expiresAt.toISOString(),
        credits: plan === 'pro' ? 999999 : 999999,
      })
      .eq('email', userEmail);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and plan activated.',
      plan,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed.' },
      { status: 500 }
    );
  }
}