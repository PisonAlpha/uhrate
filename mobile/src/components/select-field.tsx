import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColors } from '@/theme';

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Problem with this field, shown under it in red. */
  error?: string | null;
}

// Labelled field that opens a list to pick one option from, like a web <select>.
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  disabled,
  error,
}: SelectFieldProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        style={[styles.field, { borderColor: error ? colors.danger : colors.borderStrong }]}
      >
        <Text style={[styles.value, { color: value ? colors.text : colors.textSubtle }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12 }]}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
                style={[styles.option, { borderTopColor: colors.border }]}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{item}</Text>
                {item === value && <Ionicons name="checkmark" size={20} color={colors.text} />}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  value: { flex: 1, fontSize: 15 },
  error: { fontSize: 12, marginTop: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 24, marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  optionText: { fontSize: 15, flex: 1 },
});
