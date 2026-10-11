import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useColors, type ThemeColors } from '@/theme';

export type PillTone = 'neutral' | 'success' | 'warning' | 'danger';

function toneColors(tone: PillTone, colors: ThemeColors) {
  switch (tone) {
    case 'success':
      return { background: colors.successBackground, text: colors.success };
    case 'warning':
      return { background: colors.warningBackground, text: colors.warning };
    case 'danger':
      return { background: colors.dangerBackground, text: colors.danger };
    default:
      return { background: colors.neutralBackground, text: colors.textSecondary };
  }
}

// Small rounded status label, e.g. "Authenticated" or "Coming soon".
export function Pill({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: PillTone;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const { background, text } = toneColors(tone, colors);

  return (
    <View style={[styles.pill, { backgroundColor: background }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, marginTop: 16 },
  text: { fontSize: 12, fontWeight: '600' },
});
