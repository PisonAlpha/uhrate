import { View, Text, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ONCHAIN_ENABLED } from '@/constants/config';
import { CHAINS } from '@/constants/chains';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PageHeader } from '@/components/page-header';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';
import { PLATFORM_FEE_USD } from '@/wallet/fee';

const FEE = `$${PLATFORM_FEE_USD.toFixed(2)}`;

const FREE_FEATURES = [
  'AI document verification',
  'Originality & deepfake scoring',
  'Digital DNA fingerprinting',
  'Document Registry access',
  'Education credential registry',
  'Legal document registry',
  'Media & IP registry',
  'Identity badge application',
  'Certificate download',
  'Share verification results',
  'Developer API access',
  'Dashboard & history',
];

const ON_CHAIN_FEATURES = [
  'Everything in Standard (free)',
  'Permanent on-chain document identity',
  'Immutable blockchain timestamp',
  'NFT certificate minting',
  'Multi-chain deployment (ETH, BNB, Base, Polygon)',
  'IPFS decentralized storage',
  'Blockchain transaction proof',
  'Verifiable by anyone forever',
  `${FEE} platform fee + gas fees`,
];

const FAQ = [
  {
    q: 'Why is UHRATE free?',
    a: `Our goal is to build the largest database of verified authentic documents on the blockchain. We want as many users as possible using the platform. The ${FEE} fee only applies when you deploy to blockchain — all AI verification, scoring, and certificates are completely free.`,
  },
  {
    q: `What is the ${FEE} platform fee for?`,
    a: `The ${FEE} is a one-time platform fee collected when you deploy a document to the blockchain for permanent identity. This is separate from gas fees which go directly to the network validators. The platform fee covers our infrastructure, IPFS storage, and NFT certificate generation.`,
  },
  {
    q: 'Do I have to deploy to blockchain?',
    a: "No. You can use UHRATE's AI verification, scoring, and certificates completely free without ever deploying to blockchain. Blockchain deployment is optional — it gives your document a permanent, immutable on-chain identity that anyone can verify forever.",
  },
  {
    q: 'Which blockchain should I choose?',
    a: `For lowest fees, use Base or Polygon (under $0.05 in gas). For maximum security and recognition, use Ethereum. BNB Chain offers a good balance of low fees and wide adoption. The ${FEE} platform fee is the same regardless of which chain you choose.`,
  },
  {
    q: 'Can anyone verify my document?',
    a: "Yes. Once deployed on-chain, anyone can verify your document's authenticity using the transaction hash or certificate ID — without needing an account or paying any fee.",
  },
  {
    q: 'Will there ever be subscription plans?',
    a: `No. UHRATE is committed to remaining free for all users. The only charge is the ${FEE} blockchain deployment fee, which only applies when you choose to give a document permanent on-chain identity.`,
  },
];

function FeatureList({ items }: { items: string[] }) {
  const colors = useColors();
  return (
    <View style={styles.features}>
      {items.map((f) => (
        <View key={f} style={styles.feature}>
          <Ionicons name="checkmark" size={16} color={colors.success} />
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

// Pricing (roadmap D31), opened from More. Information only, as on the
// web's /pricing page: nothing is sold here. The fee itself is paid in
// Seal and the registries. Store rules (E38) are why there is no UHR or
// other purchase on this screen.
function PricingScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <Screen muted scroll>
      <PageHeader title="Pricing" />

      <Pill label="✓ Free to use — only pay when you go on-chain" tone="success" style={styles.badge} />
      <Text style={[styles.headline, { color: colors.text }]}>Simple, honest pricing.</Text>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        UHRATE is completely free. The only fee is a small <Text style={{ color: colors.text, fontWeight: '700' }}>{FEE} platform fee</Text>{' '}
        when you deploy a document to the blockchain for permanent on-chain identity.
      </Text>

      <Card style={styles.plan}>
        <Text style={[styles.planLabel, { color: colors.textMuted }]}>STANDARD</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>$0</Text>
          <Text style={[styles.per, { color: colors.textSubtle }]}>forever</Text>
        </View>
        <Text style={[styles.planBody, { color: colors.textMuted }]}>
          Full access to everything UHRATE offers. No credit card required.
        </Text>
        <FeatureList items={FREE_FEATURES} />
      </Card>

      <Card style={[styles.plan, styles.featured, { borderColor: colors.text }]}>
        <Text style={[styles.planLabel, { color: colors.textMuted }]}>ON-CHAIN DEPLOYMENT</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>{FEE}</Text>
          <Text style={[styles.per, { color: colors.textSubtle }]}>per document</Text>
        </View>
        <Text style={[styles.planBody, { color: colors.textMuted }]}>
          One-time platform fee included when deploying your document to the blockchain. Gas fees are separate and paid
          by your wallet.
        </Text>
        <FeatureList items={ON_CHAIN_FEATURES} />
      </Card>

      <Text style={[styles.section, { color: colors.text }]}>Supported networks</Text>
      <Text style={[styles.sectionIntro, { color: colors.textMuted }]}>
        Choose any EVM-compatible network for your document deployment.
      </Text>
      <View style={styles.chains}>
        {CHAINS.map((chain) => (
          <Card key={chain.id} style={styles.chain}>
            <Text style={[styles.chainName, { color: colors.text }]}>{chain.name}</Text>
            <Text style={[styles.chainSymbol, { color: colors.textSubtle }]}>{chain.symbol}</Text>
            <Pill label={`Gas ${chain.gasEstimate}`} tone="success" style={styles.gas} />
          </Card>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Frequently asked questions</Text>
      {FAQ.map(({ q, a }) => (
        <Card key={q} style={styles.faq}>
          <Text style={[styles.question, { color: colors.text }]}>{q}</Text>
          <Text style={[styles.answer, { color: colors.textMuted }]}>{a}</Text>
        </Card>
      ))}

      <View style={styles.actions}>
        <Button title="Seal a file on the blockchain" onPress={() => router.push('/seal')} />
        <Button title="Verify a file for free" variant="secondary" onPress={() => router.navigate('/verify')} />
      </View>
    </Screen>
  );
}

// Pricing describes the on-chain fee, so it only exists with ONCHAIN_ENABLED.
export default function PricingRoute() {
  return ONCHAIN_ENABLED ? <PricingScreen /> : <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  badge: { marginTop: 0 },
  headline: { fontSize: 28, fontWeight: '800', marginTop: 12 },
  intro: { fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 20 },
  plan: { marginBottom: 16 },
  featured: { borderWidth: 2 },
  planLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
  price: { fontSize: 40, fontWeight: '800' },
  per: { fontSize: 14, marginBottom: 8 },
  planBody: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  features: { marginTop: 16, gap: 10 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureText: { flex: 1, fontSize: 14, lineHeight: 20 },
  section: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  sectionIntro: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 12 },
  chains: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  chain: { flexBasis: '47%', flexGrow: 1, padding: 16 },
  chainName: { fontSize: 15, fontWeight: '700' },
  chainSymbol: { fontSize: 12, marginTop: 2 },
  gas: { marginTop: 10 },
  faq: { padding: 20, marginTop: 12 },
  question: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  answer: { fontSize: 14, lineHeight: 20 },
  actions: { gap: 12, marginTop: 24 },
});
