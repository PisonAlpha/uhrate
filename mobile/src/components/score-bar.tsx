import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

// A 0–100 score with its label above a filled bar, as on the web Verify page.
export function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useColors();
  const percent = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}/100</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.neutralBackground }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 14 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '600' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
