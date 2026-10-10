import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

const SIZES = {
  sm: { mark: 32, radius: 8, markText: 12, brand: 18 },
  lg: { mark: 40, radius: 10, markText: 14, brand: 26 },
};

// UHRATE logo mark and wordmark.
export function BrandHeader({ size = 'sm' }: { size?: keyof typeof SIZES }) {
  const colors = useColors();
  const s = SIZES[size];

  return (
    <View style={styles.row}>
      <View
        style={[styles.mark, { width: s.mark, height: s.mark, borderRadius: s.radius, backgroundColor: colors.primary }]}
      >
        <Text style={[styles.markText, { fontSize: s.markText, color: colors.onPrimary }]}>UH</Text>
      </View>
      <Text style={[styles.brand, { fontSize: s.brand, color: colors.text }, size === 'lg' && styles.brandLg]}>
        UHRATE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { justifyContent: 'center', alignItems: 'center' },
  markText: { fontWeight: '700' },
  brand: { fontWeight: '700' },
  brandLg: { letterSpacing: -0.5 },
});
