import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

interface BarRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

// Label, horizontal bar filled to value/max, and the count. Mobile version of
// the web dashboard's MiniBar rows.
export function BarRow({ label, value, max, color }: BarRowProps) {
  const colors = useColors();
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.neutralBackground }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.count, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  label: { width: 120, fontSize: 13 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  count: { width: 28, textAlign: 'right', fontSize: 13, fontWeight: '600' },
});
