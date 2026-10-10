import { Pressable, Text, ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useColors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Full-width button. primary: filled; secondary: outlined; danger: outlined
// with red text, for actions like logout.
export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }: ButtonProps) {
  const colors = useColors();
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { borderWidth: 1, borderColor: variant === 'danger' ? colors.border : colors.borderStrong },
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  text: { fontWeight: '600', fontSize: 15 },
  dimmed: { opacity: 0.7 },
});
