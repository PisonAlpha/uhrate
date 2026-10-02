import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// Welcome / landing screen — UHRATE-branded entry point, Login / Register only.
export default function Welcome() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>UH</Text>
          </View>
          <Text style={styles.brand}>UHRATE</Text>
        </View>
        <Text style={styles.tagline}>Decentralized Authenticity Network</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/register')}>
          <Text style={styles.secondaryButtonText}>Sign up free</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  brandBlock: { alignItems: 'center', marginBottom: 56 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  brand: { fontSize: 26, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  tagline: { color: '#6b7280', fontSize: 14 },
  actions: { width: '100%', gap: 12 },
  primaryButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#374151', fontWeight: '600', fontSize: 15 },
});
