import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'uhrate_admin_2024';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-secret');
    if (authHeader !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: verifications } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: apiKeys } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    const totalVerifications = verifications?.length || 0;
    const totalUsers = users?.length || 0;
    const totalPayments = payments?.length || 0;
    const totalApiKeys = apiKeys?.length || 0;

    const verifiedOriginal = verifications?.filter(v =>
      v.rating === 'Verified Original' || v.rating === 'Likely Original'
    ).length || 0;

    const highRisk = verifications?.filter(v =>
      v.rating === 'High Risk' || v.rating === 'Deepfake Suspected'
    ).length || 0;

    const aiGenerated = verifications?.filter(v =>
      v.rating === 'AI Generated' || v.rating === 'AI Assisted'
    ).length || 0;

    const proUsers = users?.filter(u => u.role === 'pro').length || 0;
    const enterpriseUsers = users?.filter(u => u.role === 'enterprise').length || 0;

    const totalRevenue = payments?.reduce((sum, p) => {
      return sum + parseFloat(p.amount || '0');
    }, 0) || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalVerifications,
        totalUsers,
        totalPayments,
        totalApiKeys,
        verifiedOriginal,
        highRisk,
        aiGenerated,
        proUsers,
        enterpriseUsers,
        totalRevenue: totalRevenue.toFixed(4),
      },
      recentVerifications: verifications?.slice(0, 10),
      recentUsers: users?.slice(0, 10),
      recentPayments: payments?.slice(0, 10),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}