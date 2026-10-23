import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CHAINS, type ChainId } from '@/constants/chains';
import { useColors } from '@/theme';

// Network chips for an on-chain payment (registries, Seal).
export function ChainPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: ChainId;
  onChange: (id: ChainId) => void;
  disabled?: boolean;
}) {
  const colors = useColors();

  return (
    <View style={styles.chains}>
      {CHAINS.map((c) => {
        const selected = c.id === value;
        return (
          <Pressable
            key={c.id}
            onPress={() => onChange(c.id)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.chain,
              selected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.borderStrong },
            ]}
          >
            <Text style={[styles.chainName, { color: selected ? colors.onPrimary : colors.text }]}>{c.name}</Text>
            <Text style={[styles.chainSymbol, { color: selected ? colors.onPrimary : colors.textMuted }]}>
              {c.testnet ? `Testnet · free test ${c.symbol}` : c.symbol}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chains: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chain: { flexBasis: '45%', flexGrow: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  chainName: { fontSize: 14, fontWeight: '600' },
  chainSymbol: { fontSize: 12, marginTop: 2 },
});
