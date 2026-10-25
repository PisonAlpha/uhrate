import { useEffect, useState } from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchTotalVerifications } from '@/services/stats';
import { API_BASE_URL, ONCHAIN_ENABLED } from '@/constants/config';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { HubItem } from '@/components/hub-item';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// The rest of the web home page's content. Presale, investment and token
// sale sections are left out on purpose (E38 store rules; presale is over).
// Without ONCHAIN_ENABLED, Seal and its how-it-works steps are left out too,
// since sealing then happens on the website only.
const TOOLS = [
  {
    title: 'Seal',
    desc:
      'Give any file a permanent, immutable identity on the blockchain. Proof of existence, ownership, and authenticity — forever.',
  },
  {
    title: 'Verify',
    desc:
      'AI-powered analysis for deepfakes, manipulation, AI generation. Get a detailed trust report with scores across 6 AI models.',
  },
  {
    title: 'Lookup',
    desc:
      'Check if any file has been sealed on UHRATE. Upload the file, enter a certificate ID, or paste a SHA-256 hash.',
  },
];

const USE_CASES = [
  {
    title: 'Journalists & Media',
    problem: 'Fake images and videos spread as real news',
    solution: 'Timestamp original footage on-chain before publishing. Prove it was captured when and where you say.',
  },
  {
    title: 'Universities',
    problem: 'Fake degrees sold online for $200',
    solution: 'Issue tamper-proof blockchain certificates. Any employer verifies in 3 seconds — impossible to forge.',
  },
  {
    title: 'Creators & Artists',
    problem: 'Work stolen and claimed by others',
    solution: 'Timestamp your work before publishing. Own permanent, irrefutable proof of creation forever.',
  },
  {
    title: 'Law Firms',
    problem: 'Contracts altered after signing',
    solution: 'Hash contracts on-chain. Any alteration creates a detectable mismatch — dispute-proof forever.',
  },
  {
    title: 'Banks & Finance',
    problem: 'Forged documents cost billions annually',
    solution: 'Require blockchain identity on all submitted documents. Fraud becomes cryptographically impossible.',
  },
  {
    title: 'Enterprise',
    problem: 'No reliable way to verify supplier documents',
    solution:
      'Build document verification into your workflow via UHRATE API. Scale to thousands of files instantly.',
  },
];

const STEPS = [
  { title: 'Upload File', desc: 'Any file type. Any size up to 50MB.' },
  { title: 'DNA Fingerprint', desc: "Unique SHA-256 hash generated — your file's permanent fingerprint." },
  { title: 'AI Analysis', desc: 'Deepfake, manipulation and AI detection scores generated.' },
  { title: 'On-Chain Record', desc: 'Hash deployed to your chosen blockchain. Permanent. Immutable.' },
  { title: 'Identity Issued', desc: 'Download certificate. Share proof. Verifiable forever.' },
];

// About and legal (roadmap D36), opened from More: what UHRATE is, from the
// web home page, plus the whitepaper, privacy policy and terms (E41).
export default function AboutScreen() {
  const router = useRouter();
  const colors = useColors();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    // The count is a nice-to-have; the page reads fine without it.
    fetchTotalVerifications()
      .then(setTotal)
      .catch(() => {});
  }, []);

  const tools = ONCHAIN_ENABLED ? TOOLS : TOOLS.filter((t) => t.title !== 'Seal');
  const stats = [
    { value: total !== null ? `${total.toLocaleString()}+` : '…', label: 'Files identified' },
    { value: '4', label: 'Blockchains' },
    { value: '6', label: 'AI models' },
    { value: '∞', label: 'Years of proof' },
  ];

  return (
    <Screen muted scroll>
      <PageHeader title="About and legal" />

      <Text style={[styles.headline, { color: colors.text }]}>Every document deserves a permanent identity.</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        {ONCHAIN_ENABLED
          ? 'UHRATE is the decentralized notary for the digital world. Give any file — document, image, video, audio — a permanent, immutable blockchain identity that proves its existence, ownership, and authenticity forever.'
          : 'UHRATE is the decentralized notary for the digital world. Check whether any file — document, image, video, audio — is original, AI-generated or manipulated, and look up documents, credentials and media recorded on the blockchain.'}
      </Text>

      <View style={styles.stats}>
        {stats.map((s) => (
          <Card key={s.label} style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>
        {ONCHAIN_ENABLED ? 'Three tools. One platform.' : 'Two tools. One app.'}
      </Text>
      {tools.map((t) => (
        <Card key={t.title} style={styles.item}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{t.title}</Text>
          <Text style={[styles.itemBody, { color: colors.textMuted }]}>{t.desc}</Text>
        </Card>
      ))}
      <View style={styles.actions}>
        {ONCHAIN_ENABLED && <Button title="Seal a file" onPress={() => router.push('/seal')} />}
        <Button
          title="Verify or look up a file"
          variant={ONCHAIN_ENABLED ? 'secondary' : 'primary'}
          onPress={() => router.navigate('/verify')}
        />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Why every file needs a permanent identity</Text>
      {USE_CASES.map((u) => (
        <Card key={u.title} style={styles.item}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{u.title}</Text>
          <Text style={[styles.problem, { color: colors.danger }]}>{u.problem}</Text>
          <Text style={[styles.itemBody, { color: colors.textMuted }]}>{u.solution}</Text>
        </Card>
      ))}

      {ONCHAIN_ENABLED && (
        <>
          <Text style={[styles.section, { color: colors.text }]}>How digital identity works</Text>
          {STEPS.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.background }]}>{i + 1}</Text>
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{s.title}</Text>
                <Text style={[styles.itemBody, { color: colors.textMuted }]}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      <Text style={[styles.section, { color: colors.text }]}>Documents</Text>
      <HubItem
        entry={{
          title: 'Whitepaper',
          description: 'Token, technology and tokenomics. Opens the PDF in your browser.',
          icon: 'document-text-outline',
        }}
        onPress={() => Linking.openURL(`${API_BASE_URL}/uhrate-whitepaper.pdf`)}
      />
      <HubItem
        entry={{
          title: 'Privacy Policy',
          description: 'What we collect and how we use it.',
          icon: 'lock-closed-outline',
          href: '/privacy',
        }}
      />
      <HubItem
        entry={{
          title: 'Terms of Service',
          description: 'The rules for using UHRATE.',
          icon: 'reader-outline',
          href: '/terms',
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  body: { fontSize: 15, lineHeight: 22, marginTop: 10 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  stat: { flexBasis: '47%', flexGrow: 1, padding: 16 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { fontSize: 20, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  item: { padding: 18, marginBottom: 10 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemBody: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  problem: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  actions: { gap: 12, marginTop: 6 },
  step: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  stepNumber: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: 14, fontWeight: '700' },
  stepText: { flex: 1 },
});
