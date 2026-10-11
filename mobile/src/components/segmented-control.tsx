import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/theme';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

// Switch between a few views of one screen, e.g. Verify | Look up.
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const colors = useColors();

  return (
    <View style={[styles.track, { backgroundColor: colors.neutralBackground }]} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && { backgroundColor: colors.card }]}
          >
            <Text style={[styles.label, { color: selected ? colors.text : colors.textMuted }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  // Full width so Android doesn't clip the bold label (see Button).
  label: { fontSize: 14, fontWeight: '600', alignSelf: 'stretch', textAlign: 'center' },
});
