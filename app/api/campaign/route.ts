import { NextRequest, NextResponse } from 'next/server';
import {
  registerCampaignUser,
  getCampaignUser,
  getLeaderboard,
  getUserPointsHistory,
  awardPointsByEmail,
  POINT_ACTIONS,
} from '@/lib/points';

// POST /api/campaign — register or look up a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // ── Register ───────────────────────────────────────────────────────────
    if (action === 'register') {
      const { email, walletAddress, referralCode } = body;
      if (!email || !walletAddress) {
        return NextResponse.json({ error: 'Email and wallet address are required.' }, { status: 400 });
      }
      if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
        return NextResponse.json({ error: 'Invalid wallet address format.' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
      }

      const { user, isNew } = await registerCampaignUser(email, walletAddress, referralCode);
      const history = await getUserPointsHistory(user.id);

      return NextResponse.json({
        success: true,
        isNew,
        user: {
          email: user.email,
          walletAddress: user.wallet_address,
          totalPoints: user.total_points,
          referralCode: user.referral_code,
          createdAt: user.created_at,
        },
        history,
        message: isNew
          ? `Welcome! You earned ${POINT_ACTIONS.REGISTER.points} points for registering early.`
          : 'Welcome back! Here are your current points.',
      });
    }

    // ── Award points (called internally from seal/verify/lookup) ──────────
    if (action === 'award') {
      const { email, pointAction, description } = body;
      // Simple internal secret to prevent public abuse
      const secret = request.headers.get('x-internal-secret');
      if (secret !== process.env.INTERNAL_API_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!email || !pointAction) {
        return NextResponse.json({ error: 'email and pointAction required.' }, { status: 400 });
      }
      const result = await awardPointsByEmail(email, pointAction, description);
      if (!result) {
        return NextResponse.json({ error: 'User not found in campaign.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    console.error('Campaign API error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// GET /api/campaign?email=...&leaderboard=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const leaderboard = searchParams.get('leaderboard');

    if (leaderboard === 'true') {
      const board = await getLeaderboard(20);
      // Mask email and wallet for public leaderboard
      const masked = board.map((u, i) => ({
        rank: i + 1,
        email: u.email.replace(/(.{2}).+(@.+)/, '$1***$2'),
        wallet: u.wallet_address.slice(0, 6) + '...' + u.wallet_address.slice(-4),
        totalPoints: u.total_points,
        joinedAt: u.created_at,
      }));
      return NextResponse.json({ leaderboard: masked });
    }

    if (email) {
      const user = await getCampaignUser(email);
      if (!user) {
        return NextResponse.json({ found: false });
      }
      const history = await getUserPointsHistory(user.id);
      return NextResponse.json({
        found: true,
        user: {
          email: user.email,
          walletAddress: user.wallet_address,
          totalPoints: user.total_points,
          referralCode: user.referral_code,
          createdAt: user.created_at,
        },
        history,
      });
    }

    return NextResponse.json({ error: 'Provide email or leaderboard=true' }, { status: 400 });
  } catch (error) {
    console.error('Campaign GET error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

