import { supabaseAdmin } from './supabase';

export const POINT_ACTIONS = {
  SEAL: { points: 50, label: 'Sealed a document' },
  VERIFY: { points: 10, label: 'Verified a document' },
  LOOKUP: { points: 5, label: 'Looked up a document' },
  REGISTER: { points: 100, label: 'Early registration bonus' },
  REFERRAL: { points: 25, label: 'Referred a new user' },
} as const;

export type PointAction = keyof typeof POINT_ACTIONS;

export async function getCampaignUser(email: string) {
  const { data } = await supabaseAdmin
    .from('campaign_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  return data;
}

export async function registerCampaignUser(email: string, walletAddress: string, referralCode?: string) {
  const existing = await getCampaignUser(email);
  if (existing) return { user: existing, isNew: false };

  // Generate unique referral code
  const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: user, error } = await supabaseAdmin
    .from('campaign_users')
    .insert({
      email: email.toLowerCase(),
      wallet_address: walletAddress.toLowerCase(),
      referral_code: myReferralCode,
      referred_by: referralCode || null,
      total_points: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Award registration bonus
  await awardPoints(user.id, 'REGISTER', 'Early registration bonus');

  // Award referrer if valid referral code
  if (referralCode) {
    const { data: referrer } = await supabaseAdmin
      .from('campaign_users')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (referrer) {
      await awardPoints(referrer.id, 'REFERRAL', `Referred ${email}`);
    }
  }

  return { user, isNew: true };
}

export async function awardPoints(userId: string, action: PointAction, description?: string) {
  const { points, label } = POINT_ACTIONS[action];

  const { error } = await supabaseAdmin
    .from('campaign_points')
    .insert({
      user_id: userId,
      action,
      points,
      description: description || label,
    });

  if (error) throw error;

  // Update total_points on the user record
  const { data: totals } = await supabaseAdmin
    .from('campaign_points')
    .select('points')
    .eq('user_id', userId);

  const total = (totals || []).reduce((sum, r) => sum + r.points, 0);

  await supabaseAdmin
    .from('campaign_users')
    .update({ total_points: total })
    .eq('id', userId);

  return { points, total };
}

export async function awardPointsByEmail(email: string, action: PointAction, description?: string) {
  const user = await getCampaignUser(email);
  if (!user) return null;
  return awardPoints(user.id, action, description);
}

export async function getLeaderboard(limit = 20) {
  const { data } = await supabaseAdmin
    .from('campaign_users')
    .select('email, wallet_address, total_points, referral_code, created_at')
    .order('total_points', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getUserPointsHistory(userId: string) {
  const { data } = await supabaseAdmin
    .from('campaign_points')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

