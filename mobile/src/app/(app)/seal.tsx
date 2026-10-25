import { useEffect, useState } from 'react';
import { Text, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { verifyFile } from '@/services/verify';
import { ApiError, errorMessage } from '@/services/api';
import type { PickedFile } from '@/lib/file-picker';
import { formatAddress, ratingTone } from '@/lib/format';
import { shareJson } from '@/lib/share-file';
import { ONCHAIN_ENABLED } from '@/constants/config';
import { CHAINS, DEFAULT_CHAIN, type ChainId } from '@/constants/chains';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ChainPicker } from '@/components/chain-picker';
import { ErrorMessage } from '@/components/error-message';
import { FilePicker } from '@/components/file-picker';
import { PageHeader } from '@/components/page-header';
import { Pill } from '@/components/pill';
import { RecordRow } from '@/components/record-card';
import { ShareFileButton } from '@/components/share-file-button';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';
import type { VerifyResponse } from '@/types/verify';
import { useWallet, walletErrorMessage } from '@/wallet/use-wallet';

// Shown in turn while the server works, as on the web's Seal page.
const PROGRESS_STEPS = ['Extracting Digital DNA...', 'Running AI analysis...', 'Generating certificate...'];
const PROGRESS_INTERVAL_MS = 2500;

interface Seal {
  txHash: string;
  chainId: ChainId;
  sealedAt: string;
}

// Seal (roadmap D22), opened from Home: verify a file (/api/verify, one
// credit), then pay the platform fee with the certificate as the
// transaction data, as the web's /seal page does. Like the web, nothing
// else is saved: the transaction itself is the seal.
function SealScreen() {
  const router = useRouter();
  const colors = useColors();
  const wallet = useWallet();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [chain, setChain] = useState<ChainId>(DEFAULT_CHAIN);
  const [paying, setPaying] = useState(false);
  const [seal, setSeal] = useState<Seal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verifying) return;
    setStep(0);
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1)),
      PROGRESS_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, [verifying]);

  const handleVerify = async () => {
    if (!file) return;
    setVerifying(true);
    setError(null);
    try {
      setResult(await verifyFile(file));
    } catch (err) {
      // A 401 has already ended the session in services/api.ts.
      if (!(err instanceof ApiError && err.status === 401)) setError(errorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleSeal = async () => {
    if (!result) return;
    setError(null);
    setPaying(true);
    try {
      const { data } = result;
      const sealedAt = new Date().toISOString();
      const txHash = await wallet.payFee(selectedChain, {
        platform: 'UHRATE',
        certificate_id: data.certificate_id,
        sha256_hash: data.sha256_hash,
        file_name: data.file_name,
        rating: data.rating,
        trust_score: data.trust_score,
        sealed_at: sealedAt,
      });
      setSeal({ txHash, chainId: chain, sealedAt });
    } catch (err) {
      setError(walletErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const startOver = () => {
    setFile(null);
    setResult(null);
    setSeal(null);
    setError(null);
  };

  const selectedChain = CHAINS.find((c) => c.id === chain)!;

  if (result && seal) {
    const sealChain = CHAINS.find((c) => c.id === seal.chainId)!;
    return (
      <Screen muted scroll>
        <PageHeader title="Seal" />
        <Card style={styles.section}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>✓ File sealed</Text>
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Your file now has a permanent record on {sealChain.name}, verifiable by anyone.
          </Text>
          <RecordRow label="Certificate ID" value={result.data.certificate_id} mono />
          <RecordRow label="SHA-256" value={result.data.sha256_hash} mono />
          <RecordRow label="Sealed on" value={sealChain.name} />
          <RecordRow label="Transaction" value={seal.txHash} mono />
          <RecordRow label="Sealed at" value={new Date(seal.sealedAt).toLocaleString()} />
          <Button
            title="View transaction"
            variant="secondary"
            onPress={() => Linking.openURL(`${sealChain.explorer}/tx/${seal.txHash}`)}
            style={styles.action}
          />
          <Button
            title="Look up certificate"
            variant="secondary"
            onPress={() =>
              router.dismissTo({
                pathname: '/verify',
                params: { code: result.data.certificate_id, t: String(Date.now()) },
              })
            }
            style={styles.secondAction}
          />
          <ShareFileButton
            title="Save or share certificate"
            // Same file the web's "Download Seal Certificate" saves.
            onShare={() =>
              shareJson(
                `uhrate_seal_${result.data.certificate_id}.json`,
                {
                  certificate_id: result.data.certificate_id,
                  file_name: result.data.file_name,
                  file_type: result.data.file_type,
                  sha256_hash: result.data.sha256_hash,
                  trust_score: result.data.trust_score,
                  rating: result.data.rating,
                  sealed_on: sealChain.name,
                  tx_hash: seal.txHash,
                  sealed_at: seal.sealedAt,
                  platform: 'UHRATE — The decentralized notary for the digital world',
                },
                'Seal certificate'
              )
            }
            style={styles.secondAction}
          />
        </Card>
        <Button title="Seal another file" onPress={startOver} />
      </Screen>
    );
  }

  return (
    <Screen muted scroll>
      <PageHeader title="Seal" />

      {result ? (
        <>
          <Card style={styles.section}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {result.data.file_name}
            </Text>
            <Pill label={result.data.rating} tone={ratingTone(result.data.rating)} style={styles.pill} />
            <RecordRow label="Trust score" value={`${result.data.trust_score}/100`} />
            <RecordRow label="Digital DNA (SHA-256)" value={result.data.sha256_hash} mono />
          </Card>

          <Text style={[styles.step, { color: colors.text }]}>Blockchain</Text>
          <ChainPicker value={chain} onChange={setChain} disabled={paying} />

          <Card style={styles.pay}>
            <RecordRow label="Network" value={selectedChain.name} />
            <RecordRow
              label="Fee"
              value={
                selectedChain.testnet
                  ? `Paid in free test ${selectedChain.symbol} (testnet, no real money)`
                  : `$0.20 platform fee + network gas, paid in ${selectedChain.symbol}`
              }
            />
            {wallet.address && <RecordRow label="Wallet" value={formatAddress(wallet.address)} />}
            {error && <ErrorMessage message={error} />}
            <Button
              title={wallet.isConnected ? `Seal on ${selectedChain.name}` : 'Connect wallet & seal'}
              onPress={handleSeal}
              loading={paying}
              style={styles.action}
            />
            <Text style={[styles.note, { color: colors.textMuted }]}>
              {paying
                ? 'Confirm the payment in your wallet app, then come back here.'
                : 'Your wallet will ask you to approve the payment. The certificate is written into the transaction.'}
            </Text>
          </Card>

          <Button title="Choose another file" variant="secondary" onPress={startOver} disabled={paying} />
        </>
      ) : (
        <>
          <Text style={[styles.intro, { color: colors.textMuted }]}>
            Give any file a permanent, timestamped record on the blockchain: proof of existence and authenticity
            that anyone can check. The file is analysed first, which uses one credit on the free plan.
          </Text>

          {error && <ErrorMessage message={error} />}

          {verifying ? (
            <Card style={styles.progress}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.progressStep, { color: colors.text }]}>{PROGRESS_STEPS[step]}</Text>
              <Text style={[styles.note, styles.center, { color: colors.textMuted }]}>This can take a minute.</Text>
            </Card>
          ) : (
            <>
              <FilePicker file={file} onChange={setFile} />
              <Button title="Analyse file" onPress={handleVerify} disabled={!file} style={styles.action} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

// Seal charges the on-chain fee, so it only exists with ONCHAIN_ENABLED.
export default function SealRoute() {
  return ONCHAIN_ENABLED ? <SealScreen /> : <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  section: { marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  pill: { marginTop: 12 },
  step: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  pay: { marginTop: 16, marginBottom: 16 },
  note: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  center: { textAlign: 'center' },
  action: { marginTop: 24 },
  secondAction: { marginTop: 12 },
  progress: { alignItems: 'center', paddingVertical: 32 },
  progressStep: { fontSize: 15, fontWeight: '600', marginTop: 16, alignSelf: 'stretch', textAlign: 'center' },
});
