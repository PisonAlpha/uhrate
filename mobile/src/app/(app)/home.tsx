import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile } from '@/services/auth';
import { ApiError } from '@/services/api';
import { BrandHeader } from '@/components/brand-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        // Real authenticated request: Authorization: Bearer <token> -> /api/profile
        const result = await fetchProfile();
        if (!cancelled) setProfile(result.user);
      } catch (err) {
        // A 401 has already ended the session in services/api.ts, and the
        // route guards are taking the user back to the auth flow.
        if (cancelled || (err instanceof ApiError && err.status === 401)) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load your profile.');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Clearing the session is enough: the route guards return the user to the
  // auth flow.
  const handleLogout = () => logout();

  const displayName = profile?.full_name ?? user?.full_name;
  const displayEmail = profile?.email ?? user?.email;

  return (
    <Screen muted>
      <View style={styles.header}>
        <BrandHeader />
      </View>

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
