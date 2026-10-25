import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/theme';

// "By <doing this>, you agree to the Terms of Service and Privacy Policy",
// with both linked. Shown where an account can be created (E41): Register,
// and Login, whose wallet sign-in also creates accounts.
export function LegalNotice({ action }: { action: string }) {
  const router = useRouter();
  const colors = useColors();
  const link = [styles.link, { color: colors.text }];

  return (
    <Text style={[styles.text, { color: colors.textMuted }]}>
      By {action}, you agree to our{' '}
      <Text style={link} onPress={() => router.push('/terms')} accessibilityRole="link">
        Terms of Service
      </Text>{' '}
      and{' '}
      <Text style={link} onPress={() => router.push('/privacy')} accessibilityRole="link">
        Privacy Policy
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 24 },
  link: { fontWeight: '600', textDecorationLine: 'underline' },
});
