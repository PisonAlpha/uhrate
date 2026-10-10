import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useColors } from '@/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
}

// Labelled text input. Any TextInput prop passes through.
export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  const colors = useColors();

  return (
    <View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSubtle}
        {...inputProps}
        style={[styles.input, { borderColor: colors.borderStrong, color: colors.text }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15 },
});
