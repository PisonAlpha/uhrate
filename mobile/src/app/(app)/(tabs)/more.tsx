import { View, Text, StyleSheet } from 'react-native';
import { BrandHeader } from '@/components/brand-header';
import { HubItem, type HubEntry } from '@/components/hub-item';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// Each fills in as its roadmap item lands: Pricing D31, Enterprise D29,
// Developer API D30, Contact D35, About and legal D36/E41. Identity badges
// (D28) are left out while the web has no badge page.
const ITEMS: HubEntry[] = [
  {
    title: 'Pricing',
    description: 'Free to use. A small fee only when you go on-chain.',
    icon: 'pricetag-outline',
    href: '/pricing',
  },
  {
    title: 'Enterprise',
    description: 'Verify many files at once.',
    icon: 'layers-outline',
  },
  {
    title: 'Developer API',
    description: 'Create and manage API keys.',
    icon: 'code-slash-outline',
    href: '/developer',
  },
  {
    title: 'Contact',
    description: 'Get in touch with the UHRATE team.',
    icon: 'mail-outline',
  },
  {
    title: 'About and legal',
    description: 'Tokenomics, whitepaper, privacy policy and terms.',
    icon: 'information-circle-outline',
  },
];

// More tab: everything that isn't Home, Verify, Registry or Profile.
export default function More() {
  const colors = useColors();

  return (
    <Screen muted scroll>
      <View style={styles.header}>
        <BrandHeader />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>More</Text>

      {ITEMS.map((item) => (
        <HubItem key={item.title} entry={item} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
});
