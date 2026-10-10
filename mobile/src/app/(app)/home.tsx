import { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, AppState, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile } from '@/services/auth';
import { ApiError } from '@/services/api';
import { BrandHeader } from '@/components/brand-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { VerifyEmailCard } from '@/components/verify-email-card';
import { useColors } from '@/theme';
import type { AuthUser } from '@/types/auth';

// Temporary validation screen for Phase 1 — proves the mobile app can reach
// the backend with a verified bearer token. NOT the full dashboard.
export default function Home() {
  const { user, logout } = useAuth();
  const colors = useColors();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Returns the loaded profile, or null if the request failed.
  const loadProfile = useCallback(async (): Promise<AuthUser | null> => {
    try {
      // Real authenticated request: Authorization: Bearer <token> -> /api/profile
      const result = await fetchProfile();
      setProfile(result.user);
      setError(null);
      return result.user;
    } catch (err) {
      // A 401 has already ended the session in services/api.ts, and the
      // route guards are taking the user back to the auth flow.
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(err instanceof ApiError ? err.message : 'Failed to load your profile.');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    loadProfile().finally(() => setLoadingProfile(false));
  }, [loadProfile]);

  // Right after sign-up the profile hasn't loaded yet, so fall back to the
  // user returned by register (email_verified: false). Login's response
  // doesn't include the flag, so the card waits for the profile there.
  const needsVerification = (profile?.email_verified ?? user?.email_verified) === false;

  // The verification link opens in the browser. When the user comes back to
  // the app, check again so the reminder disappears without a manual refresh.
  useEffect(() => {
    if (!needsVerification) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadProfile();
    });
    return () => subscription.remove();
  }, [needsVerification, loadProfile]);

  // Clearing the session is enough: the route guards return the user to the
  // auth flow.
  const handleLogout = () => logout();

  const displayName = profile?.full_name ?? user?.full_name;
  const displayEmail = profile?.email ?? user?.email;

  return (
    <Screen muted scroll>
      <View style={styles.header}>
        <BrandHeader />
      </View>

      {needsVerification && displayEmail && (
        <View style={styles.card}>
          <VerifyEmailCard
            email={displayEmail}
            onCheckAgain={async () => {
              const loaded = await loadProfile();
              return loaded ? loaded.email_verified === true : null;
            }}
          />
        </View>
      )}

      <Card style={styles.card}>
        {loadingProfile ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.textSubtle }]}>Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{displayName || '—'}</Text>

            <Text style={[styles.label, { color: colors.textSubtle }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{displayEmail || '—'}</Text>

            <Pill label="✓ Authenticated" tone="success" />
          </>
        )}
      </Card>

      <Button title="Logout" variant="danger" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32 },
  card: { marginBottom: 24 },
  label: { fontSize: 12, marginTop: 12 },
  value: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  errorText: { fontSize: 13 },
});
