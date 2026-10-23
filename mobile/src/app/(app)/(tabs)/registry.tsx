import { View, Text, StyleSheet } from 'react-native';
import { BrandHeader } from '@/components/brand-header';
import { HubItem, type HubEntry } from '@/components/hub-item';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// Matches the web's four registries. Each fills in as its roadmap item lands:
// Document D24, Education D25, Legal D26, Media D27.
const REGISTRIES: HubEntry[] = [
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
    href: '/legal',
  },
  {
    title: 'Media',
    description: 'Photos, videos and recordings from journalists and creators.',
    icon: 'camera-outline',
    href: '/media',
  },
];

// Registry tab: the hub for UHRATE's on-chain registries.
export default function Registry() {
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

      {REGISTRIES.map((r) => (
        <HubItem key={r.title} entry={r} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700' },
  intro: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 20 },
});
