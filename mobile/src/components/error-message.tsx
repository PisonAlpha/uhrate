import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

// Red notice box for form and request errors.
export function ErrorMessage({ message }: { message: string }) {
  const colors = useColors();
  return (
    <View style={[styles.box, { backgroundColor: colors.dangerBackground, borderColor: colors.dangerBorder }]}>
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  text: { fontSize: 13 },
});
