import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchProfile } from '@/services/auth';
import { ApiError } from '@/services/api';
import type { AuthUser } from '@/types/auth';

// Temporary validation screen for Phase 1 — proves the mobile app can reach
// the backend with a verified bearer token. NOT the full dashboard.
export default function Home() {
  const { isLoading: authLoading, isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        // Real authenticated request: Authorization: Bearer <token> -> /api/profile
        const result = await fetchProfile();
        if (!cancelled) setProfile(result.user);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          // Invalid/expired token: log out locally and return to login,
          // per Phase 1 scope (no refresh, no server-side revocation).
          await logout();
          router.replace('/login');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load your profile.');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#000000" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const displayName = profile?.full_name ?? user?.full_name;
  const displayEmail = profile?.email ?? user?.email;

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>UH</Text>
        </View>
        <Text style={styles.brand}>UHRATE</Text>
      </View>

      <View style={styles.card}>
        {loadingProfile ? (
          <ActivityIndicator color="#000000" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{displayName || '—'}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{displayEmail || '—'}</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Authenticated</Text>
            </View>
          </>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 24, paddingTop: 72 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  brand: { fontSize: 18, fontWeight: '700', color: '#111827' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
    marginBottom: 24,
  },
  label: { fontSize: 12, color: '#9ca3af', marginTop: 12 },
  value: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 16,
  },
  statusText: { color: '#15803d', fontSize: 12, fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 13 },
  logoutButton: { borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
