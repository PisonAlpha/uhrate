import type { Ref } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useColors } from '@/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  /** Lets a form move focus to this field from the previous one. */
  ref?: Ref<TextInput>;
  /** Problem with this field, shown under it in red. */
  error?: string | null;
}

// Labelled text input. Any TextInput prop passes through.
export function TextField({ label, style, ref, error, ...inputProps }: TextFieldProps) {
  const colors = useColors();

  return (
    <View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textSubtle}
        {...inputProps}
        style={[styles.input, { borderColor: error ? colors.danger : colors.borderStrong, color: colors.text }, style]}
      />
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15 },
  error: { fontSize: 12, marginTop: 6 },
});
