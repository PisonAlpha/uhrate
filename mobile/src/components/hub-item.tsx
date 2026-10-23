import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pill } from '@/components/pill';
import { useColors } from '@/theme';

export interface HubEntry {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Unset while the page isn't built yet; shows "Coming soon". */
  href?: Href;
}

// One row in a hub tab (Registry, More): icon, title and description,
// opening its page, or greyed out with "Coming soon".
export function HubItem({ entry }: { entry: HubEntry }) {
  const router = useRouter();
  const colors = useColors();
  const available = entry.href !== undefined;

  return (
    <Pressable
      onPress={() => entry.href && router.push(entry.href)}
      disabled={!available}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.neutralBackground }]}>
        <Ionicons name={entry.icon} size={22} color={available ? colors.text : colors.textSubtle} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: available ? colors.text : colors.textMuted }]}>{entry.title}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{entry.description}</Text>
        {!available && <Pill label="Coming soon" style={styles.pill} />}
      </View>
      {available && <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pressed: { opacity: 0.7 },
  icon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  pill: { marginTop: 8 },
});
