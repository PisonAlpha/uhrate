import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, AppState, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ONCHAIN_ENABLED } from '@/constants/config';
import { useProfile } from '@/hooks/use-profile';
import { fetchDashboard } from '@/services/dashboard';
import { ApiError, errorMessage } from '@/services/api';
import { creditsLabel, formatDate, planLabel, ratingTone, trustTone } from '@/lib/format';
import { BarRow } from '@/components/bar-row';
import { BrandHeader } from '@/components/brand-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { StatTile } from '@/components/stat-tile';
import { VerifyEmailCard } from '@/components/verify-email-card';
import { useColors, type ThemeColors } from '@/theme';
import type { DashboardResponse, Verification } from '@/types/dashboard';

const RECENT_COUNT = 5;

// Bar color for a rating, following the web dashboard's rating breakdown.
function ratingBarColor(rating: string, colors: ThemeColors) {
  if (rating.includes('Original')) return colors.success;
  if (rating.includes('AI')) return colors.warning;
  if (rating.includes('Risk') || rating.includes('Deepfake')) return colors.danger;
  return colors.info;
}

// Dashboard (roadmap D18): credits, stats and verification history from
// /api/dashboard, plus the email verification reminder.
export default function Home() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const { profile, reload: reloadProfile } = useProfile();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setDashboard(await fetchDashboard());
      setError(null);
    } catch (err) {
      // A 401 has already ended the session in services/api.ts.
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(errorMessage(err, 'Failed to load your dashboard.'));
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false));
  }, [loadDashboard]);

  // Reload quietly when returning to this tab (e.g. after verifying a file),
  // so credits and history are current. The first focus is the mount above.
  const focusedBefore = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!focusedBefore.current) {
        focusedBefore.current = true;
        return;
      }
      loadDashboard();
      reloadProfile();
    }, [loadDashboard, reloadProfile])
  );

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), reloadProfile()]);
    setRefreshing(false);
  };

  // Right after sign-up the profile hasn't loaded yet, so fall back to the
  // user returned by register (email_verified: false). Login's response
  // doesn't include the flag, so the card waits for the profile there.
  const needsVerification = (profile?.email_verified ?? user?.email_verified) === false;

  // The verification link opens in the browser. When the user comes back to
  // the app, check again so the reminder disappears without a manual refresh.
  useEffect(() => {
    if (!needsVerification) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reloadProfile();
    });
    return () => subscription.remove();
  }, [needsVerification, reloadProfile]);

  const displayEmail = profile?.email ?? user?.email;
  const stats = dashboard?.stats;
  const verifications = dashboard?.verifications ?? [];
  const shown = showAll ? verifications : verifications.slice(0, RECENT_COUNT);

  return (
    <Screen
      muted
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.textMuted}
          colors={[colors.primary]}
          progressBackgroundColor={colors.card}
        />
      }
    >
      <View style={styles.header}>
        <BrandHeader />
      </View>

      {needsVerification && displayEmail && (
        <View style={styles.section}>
          <VerifyEmailCard
            email={displayEmail}
            onCheckAgain={async () => {
              const loaded = await reloadProfile();
              return loaded ? loaded.email_verified === true : null;
            }}
          />
        </View>
      )}

      <Text style={[styles.title, { color: colors.text }]}>My Dashboard</Text>
      {displayEmail && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{displayEmail}</Text>}

      {profile && (
        <Card style={styles.section}>
          <View style={styles.creditsRow}>
            <View>
              <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Credits remaining</Text>
              <Text style={[styles.credits, { color: colors.text }]}>{creditsLabel(profile)}</Text>
            </View>
            <Pill label={planLabel(profile.role)} style={styles.inlinePill} />
          </View>
          <Button title="Verify a file" onPress={() => router.push('/verify')} style={styles.cardButton} />
          {ONCHAIN_ENABLED && (
            <Button
              title="Seal a file on the blockchain"
              variant="secondary"
              onPress={() => router.push('/seal')}
              style={styles.secondButton}
            />
          )}
        </Card>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : dashboard && stats ? (
        <>
          <View style={[styles.grid, styles.section]}>
            <StatTile label="Total verifications" value={stats.total} icon="search" />
            <StatTile label="Verified original" value={stats.verified} icon="checkmark-circle" color={colors.success} />
            <StatTile label="Avg trust score" value={`${stats.avgTrustScore}/100`} icon="analytics" color={colors.info} />
            <StatTile label="NFTs minted" value={stats.nftMinted} icon="trophy" color={colors.accent} />
            <StatTile label="AI detected" value={stats.aiGenerated} icon="hardware-chip" color={colors.warning} />
            <StatTile label="High risk caught" value={stats.highRisk} icon="shield" color={colors.danger} />
            <StatTile label="On-chain protected" value={stats.deploymentsCount} icon="link" color={colors.accent} />
            <StatTile
              label="Registry entries"
              value={dashboard.registryEntries.length}
              icon="document-text"
              color={colors.accent}
            />
          </View>

          <Card style={styles.section}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recent verifications</Text>
            {verifications.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>No verifications yet.</Text>
            ) : (
              shown.map((v) => <VerificationRow key={v.id} verification={v} />)
            )}
            {verifications.length > RECENT_COUNT && (
              <Pressable onPress={() => setShowAll((s) => !s)} style={styles.showAll}>
                <Text style={[styles.showAllText, { color: colors.text }]}>
                  {showAll ? 'Show fewer' : `Show all ${verifications.length}`}
                </Text>
              </Pressable>
            )}
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Rating breakdown</Text>
            {dashboard.ratingBreakdown.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>No data yet.</Text>
            ) : (
              dashboard.ratingBreakdown.map((r) => (
                <BarRow
                  key={r.rating}
                  label={r.rating}
                  value={r.count}
                  max={stats.total}
                  color={ratingBarColor(r.rating, colors)}
                />
              ))
            )}
          </Card>

          <Card>
            <Text style={[styles.cardTitle, { color: colors.text }]}>File types</Text>
            {dashboard.fileTypeBreakdown.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>No data yet.</Text>
            ) : (
              dashboard.fileTypeBreakdown.map((f) => (
                <BarRow key={f.type} label={f.type} value={f.count} max={stats.total} color={colors.info} />
              ))
            )}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function VerificationRow({ verification: v }: { verification: Verification }) {
  const colors = useColors();
  const score = v.trust_score ?? 0;
  const tone = trustTone(score);
  const scoreColor = tone === 'neutral' ? colors.text : colors[tone];

  return (
    <View style={[styles.row, { borderTopColor: colors.border }]}>
      <View style={styles.rowMain}>
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
          {v.file_name}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
          {formatDate(v.created_at)} · Trust <Text style={{ color: scoreColor }}>{score}/100</Text>
          {v.blockchain_tx ? ' · NFT' : ''}
        </Text>
      </View>
      {v.rating && <Pill label={v.rating} tone={ratingTone(v.rating)} style={styles.inlinePill} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  section: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2, marginBottom: 16 },
  creditsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallLabel: { fontSize: 12 },
  credits: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  inlinePill: { marginTop: 0 },
  cardButton: { marginTop: 16 },
  secondButton: { marginTop: 12 },
  loading: { marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  empty: { fontSize: 14, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, borderTopWidth: 1, marginTop: 12 },
  rowMain: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '600' },
  rowMeta: { fontSize: 12, marginTop: 2 },
  showAll: { paddingTop: 16, alignItems: 'center' },
  showAllText: { fontSize: 13, fontWeight: '600' },
});
