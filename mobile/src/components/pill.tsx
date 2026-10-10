import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

// Small rounded status label, e.g. "Authenticated" or "Coming soon".
export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' }) {
  const colors = useColors();
  const success = tone === 'success';

  return (
    <View style={[styles.pill, { backgroundColor: success ? colors.successBackground : colors.neutralBackground }]}>
      <Text style={[styles.text, { color: success ? colors.success : colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, marginTop: 16 },
  text: { fontSize: 12, fontWeight: '600' },
});
