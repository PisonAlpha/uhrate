import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ONCHAIN_ENABLED } from '@/constants/config';
import { BrandHeader } from '@/components/brand-header';
import { HubItem, type HubEntry } from '@/components/hub-item';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// Matches the web's four registries. Each fills in as its roadmap item lands:
// Document D24, Education D25, Legal D26, Media D27. Without ONCHAIN_ENABLED
// they are search only, and Documents (which has no search of its own) opens
// Look up on the Verify tab.
const REGISTRIES: HubEntry[] = [
  {
    title: 'Education',
    description: ONCHAIN_ENABLED
      ? 'Register and verify degrees and certificates.'
      : 'Check degrees and certificates.',
    icon: 'school-outline',
    href: '/education',
  },
  {
    title: 'Documents',
    description: ONCHAIN_ENABLED
      ? 'Register any document permanently on-chain.'
      : 'Check a registered document by registry ID, hash or file.',
    icon: 'document-text-outline',
    href: ONCHAIN_ENABLED ? '/documents' : undefined,
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
  const router = useRouter();
  const colors = useColors();

  return (
    <Screen muted scroll>
      <View style={styles.header}>
        <BrandHeader />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Registries</Text>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        {ONCHAIN_ENABLED
          ? 'Record documents, credentials and media permanently on the blockchain, or check a record someone gave you.'
          : 'Check documents, credentials and media recorded on the blockchain with UHRATE.'}
      </Text>

      {REGISTRIES.map((r) => (
        <HubItem
          key={r.title}
          entry={r}
          onPress={
            r.href === undefined && r.title === 'Documents'
              ? () => router.navigate({ pathname: '/verify', params: { mode: 'lookup', t: String(Date.now()) } })
              : undefined
          }
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700' },
  intro: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 20 },
});
