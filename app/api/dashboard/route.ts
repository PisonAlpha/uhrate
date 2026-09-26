import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

        if (!email && !userId) {
      return NextResponse.json({ 
        success: true,
        verifications: [],
        stats: { total: 0, verified: 0, aiGenerated: 0, highRisk: 0, mixed: 0, avgTrustScore: 0, nftMinted: 0, totalSpent: 0, deploymentsCount: 0 },
        activityByDay: [],
        fileTypeBreakdown: [],
        ratingBreakdown: [],
        recentActivity: [],
        registryEntries: [],
        deployments: [],
      });
    }

    // Fetch verifications — search by email OR wallet address format
    let verifications: any[] = [];
    
    if (email) {
      // Try exact email match first
      const { data: byEmail } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(100);
      
      verifications = byEmail || [];
      
      // If no results and email looks like wallet format, also try wallet prefix
      if (verifications.length === 0 && email.includes('@wallet.uhrate')) {
        const walletPrefix = email.split('@')[0];
        const { data: byWallet } = await supabaseAdmin
          .from('verifications')
          .select('*')
          .ilike('user_email', walletPrefix + '%')
          .order('created_at', { ascending: false })
          .limit(100);
        verifications = byWallet || [];
      }

      // Also try wallet_address column if it exists
      if (verifications.length === 0) {
        const { data: byWalletCol } = await supabaseAdmin
          .from('verifications')
          .select('*')
          .eq('wallet_address', email.split('@')[0])
          .order('created_at', { ascending: false })
          .limit(100);
        if (byWalletCol && byWalletCol.length > 0) {
          verifications = byWalletCol;
        }
      }
    } else if (userId) {
      const { data: byId } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      verifications = byId || [];
    }
    
    const error = null;
    if (error) throw error;

    const v = verifications || [];

    // Basic stats
    const total = v.length;
    const verified = v.filter(x => x.rating === 'Verified Original' || x.rating === 'Likely Original').length;
    const aiGenerated = v.filter(x => x.rating === 'AI Generated' || x.rating === 'AI Assisted').length;
    const highRisk = v.filter(x => x.rating === 'High Risk' || x.rating === 'Deepfake Suspected').length;
    const mixed = v.filter(x => x.rating === 'Mixed Content').length;

    // Average trust score
    const avgTrustScore = total > 0
      ? Math.round(v.reduce((sum, x) => sum + (x.trust_score || 0), 0) / total)
      : 0;

    // NFT minted count
    const nftMinted = v.filter(x => x.blockchain_tx).length;

    // Activity by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activityMap: Record<string, number> = {};
    v.forEach(x => {
      const date = new Date(x.created_at);
      if (date >= thirtyDaysAgo) {
        const key = date.toISOString().split('T')[0];
        activityMap[key] = (activityMap[key] || 0) + 1;
      }
    });
    const activityByDay = Object.entries(activityMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // File type breakdown
    const fileTypes: Record<string, number> = {};
    v.forEach(x => {
      if (x.file_type) {
        const type = x.file_type.split('/')[1]?.toUpperCase() || x.file_type.toUpperCase();
        fileTypes[type] = (fileTypes[type] || 0) + 1;
      }
    });
    const fileTypeBreakdown = Object.entries(fileTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    // Rating breakdown
    const ratingBreakdown = [
      { rating: 'Verified Original', count: v.filter(x => x.rating === 'Verified Original').length },
      { rating: 'Likely Original', count: v.filter(x => x.rating === 'Likely Original').length },
      { rating: 'AI Assisted', count: v.filter(x => x.rating === 'AI Assisted').length },
      { rating: 'AI Generated', count: v.filter(x => x.rating === 'AI Generated').length },
      { rating: 'Mixed Content', count: v.filter(x => x.rating === 'Mixed Content').length },
      { rating: 'Deepfake Suspected', count: v.filter(x => x.rating === 'Deepfake Suspected').length },
      { rating: 'High Risk', count: v.filter(x => x.rating === 'High Risk').length },
    ].filter(x => x.count > 0);

    // Blockchain deployments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_email', email || '')
      .order('created_at', { ascending: false });

    const deployments = payments || [];
    const totalSpent = deployments.length * 0.50;

    // Registry entries
    const { data: registryEntries } = await supabaseAdmin
      .from('document_registry')
      .select('id, document_type, created_at, chain_name')
      .eq('owner_email', email || '')
      .order('created_at', { ascending: false })
      .limit(10);

    // Recent activity (last 5)
    const recentActivity = v.slice(0, 5).map(x => ({
      id: x.id,
      file_name: x.file_name,
      rating: x.rating,
      trust_score: x.trust_score,
      created_at: x.created_at,
      has_nft: !!x.blockchain_tx,
    }));

    return NextResponse.json({
      success: true,
      verifications: v,
      stats: {
        total,
        verified,
        aiGenerated,
        highRisk,
        mixed,
        avgTrustScore,
        nftMinted,
        totalSpent,
        deploymentsCount: deployments.length,
      },
      activityByDay,
      fileTypeBreakdown,
      ratingBreakdown,
      recentActivity,
      registryEntries: registryEntries || [],
      deployments: deployments.slice(0, 5),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}