import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { BrandHeader } from '@/components/brand-header';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

interface RegistryEntry {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Unset while the registry isn't built yet. */
  href?: Href;
}

// Matches the web's four registries. Each fills in as its roadmap item lands:
// Document D24, Education D25, Legal D26, Media D27.
const REGISTRIES: RegistryEntry[] = [
  {
    title: 'Education',
    description: 'Register and verify degrees and certificates.',
    icon: 'school-outline',
    href: '/education',
  },
  {
    title: 'Documents',
    description: 'Register any document permanently on-chain.',
    icon: 'document-text-outline',
  },
  {
    title: 'Legal',
    description: 'Contracts, deeds and other legal documents.',
    icon: 'briefcase-outline',
  },
  {
    title: 'Media',
    description: 'Photos, videos and recordings from journalists and creators.',
    icon: 'camera-outline',
  },
];

// Registry tab: the hub for UHRATE's on-chain registries.
export default function Registry() {
  const router = useRouter();
  const colors = useColors();

  return (
    <Screen muted scroll>
      <View style={styles.header}>
        <BrandHeader />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Registries</Text>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Record documents, credentials and media permanently on the blockchain, or check a record someone gave you.
      </Text>

      {REGISTRIES.map((r) => {
        const available = r.href !== undefined;
        return (
          <Pressable
            key={r.title}
            onPress={() => r.href && router.push(r.href)}
            disabled={!available}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.icon, { backgroundColor: colors.neutralBackground }]}>
              <Ionicons name={r.icon} size={22} color={available ? colors.text : colors.textSubtle} />
            </View>
            <View style={styles.text}>
              <Text style={[styles.itemTitle, { color: available ? colors.text : colors.textMuted }]}>{r.title}</Text>
              <Text style={[styles.itemBody, { color: colors.textMuted }]}>{r.description}</Text>
              {!available && <Pill label="Coming soon" style={styles.pill} />}
            </View>
            {available && <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700' },
  intro: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 20 },
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
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  pill: { marginTop: 8 },
});
