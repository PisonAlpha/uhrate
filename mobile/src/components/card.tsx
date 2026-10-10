import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useColors } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 24 },
});
