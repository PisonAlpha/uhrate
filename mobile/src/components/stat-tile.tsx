import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useColors } from '@/theme';

interface StatTileProps {
  label: string;
  value: string | number;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Color of the value and icon. Defaults to the main text color. */
  color?: string;
}

// One number in the dashboard stats grid. Two tiles fit per row.
export function StatTile({ label, value, icon, color }: StatTileProps) {
  const colors = useColors();
  const tint = color ?? colors.text;

  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={tint} />
      <Text style={[styles.value, { color: tint }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flexBasis: '45%', flexGrow: 1, borderRadius: 16, borderWidth: 1, padding: 16 },
  value: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  label: { fontSize: 12, marginTop: 2 },
});
