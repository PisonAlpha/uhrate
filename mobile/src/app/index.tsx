import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '@/components/brand-header';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// Welcome / landing screen — UHRATE-branded entry point, Login / Register only.
// Only reachable while signed out (see the guards in _layout.tsx).
export default function Welcome() {
  const router = useRouter();
  const colors = useColors();

  return (
    <Screen style={styles.container}>
      <View style={styles.brandBlock}>
        <BrandHeader size="lg" />
        <Text style={[styles.tagline, { color: colors.textMuted }]}>Decentralized Authenticity Network</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Login" onPress={() => router.push('/login')} />
        <Button title="Sign up free" variant="secondary" onPress={() => router.push('/register')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  brandBlock: { alignItems: 'center', marginBottom: 56 },
  tagline: { fontSize: 14, marginTop: 10 },
  actions: { width: '100%', gap: 12 },
});
