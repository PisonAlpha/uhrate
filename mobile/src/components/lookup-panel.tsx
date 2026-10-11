import { useEffect, useState } from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { lookupCode, lookupFile } from '@/services/lookup';
import { errorMessage } from '@/services/api';
import { parseLookupCode, type LookupCode } from '@/lib/lookup-code';
import type { PickedFile } from '@/lib/file-picker';
import { formatDate, ratingTone, trustTone } from '@/lib/format';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { FilePicker } from '@/components/file-picker';
import { Pill } from '@/components/pill';
import { RecordRow, RegistryCard } from '@/components/record-card';
import { TextField } from '@/components/text-field';
import { monoFont, useColors } from '@/theme';
import type { LookupOutcome, PublicVerification } from '@/types/lookup';

interface LookupPanelProps {
  /** Code handed over by the QR scanner. Looked up as soon as it arrives. */
  scannedCode: LookupCode | null;
}

// Look up (roadmap D23): check a certificate ID, registry ID, hash or file
// against UHRATE's records. Public, so no credits are used.
export function LookupPanel({ scannedCode }: LookupPanelProps) {
  const router = useRouter();
  const colors = useColors();
  const [text, setText] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<LookupOutcome | null>(null);

  const run = async (lookup: () => Promise<LookupOutcome>) => {
    setLoading(true);
    setError(null);
    setOutcome(null);
    try {
      setOutcome(await lookup());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scannedCode) return;
    setText(scannedCode.value);
    setFile(null);
    run(() => lookupCode(scannedCode));
  }, [scannedCode]);

  const handleLookup = () => {
    if (file) {
      run(() => lookupFile(file));
      return;
    }
    const code = parseLookupCode(text);
    if (!code) {
      setError('Enter a certificate ID (UHRATE-…), a registry ID (UREG-, UEDU-, ULEG-, UMED-…) or a SHA-256 hash.');
      return;
    }
    setText(code.value);
    run(() => lookupCode(code));
  };

  const reset = () => {
    setOutcome(null);
    setError(null);
    setText('');
    setFile(null);
  };

  if (outcome) return <LookupResult outcome={outcome} onReset={reset} />;

  return (
    <>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Check whether a file or record is on UHRATE. Enter an ID or hash, choose the file itself, or scan a
        certificate QR code. Lookups are free.
      </Text>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Card style={styles.progress}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.progressText, { color: colors.text }]}>Looking it up...</Text>
        </Card>
      ) : (
        <>
          <TextField
            label="Certificate ID, registry ID or SHA-256 hash"
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (value) setFile(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleLookup}
            placeholder="UHRATE-… or paste a link"
            style={{ fontFamily: monoFont }}
          />

          <Text style={[styles.or, { color: colors.textSubtle }]}>or look up a file</Text>
          <FilePicker
            file={file}
            onChange={(picked) => {
              setFile(picked);
              if (picked) setText('');
            }}
          />

          <Button title="Look up" onPress={handleLookup} disabled={!file && !text.trim()} style={styles.action} />
          <Button
            title="Scan a QR code"
            variant="secondary"
            onPress={() => router.push('/scan')}
            style={styles.secondaryAction}
          />
        </>
      )}
    </>
  );
}

function LookupResult({ outcome, onReset }: { outcome: LookupOutcome; onReset: () => void }) {
  const colors = useColors();

  return (
    <>
      {outcome.records.length === 0 ? (
        <Card style={styles.section}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>No record found</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>{outcome.message}</Text>
          {outcome.hash && (
            <>
              <Text style={[styles.label, { color: colors.textMuted }]}>SHA-256 of this file</Text>
              <Text style={[styles.mono, { color: colors.text }]} selectable>
                {outcome.hash}
              </Text>
            </>
          )}
        </Card>
      ) : (
        outcome.records.map((r, i) =>
          r.type === 'verification' ? (
            <VerificationCard key={i} verification={r.verification} />
          ) : (
            <RegistryCard key={i} record={r.record} style={styles.section} />
          )
        )
      )}
      <Button title="Look up something else" onPress={onReset} />
    </>
  );
}

function VerificationCard({ verification: v }: { verification: PublicVerification }) {
  const colors = useColors();
  const trust = trustTone(v.trust_score);

  return (
    <Card style={styles.section}>
      <Pill label="✓ Verified on UHRATE" tone="success" style={styles.headPill} />
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {v.file_name}
      </Text>
      <Pill label={v.rating} tone={ratingTone(v.rating)} style={styles.ratingPill} />
      <RecordRow label="Certificate ID" value={v.certificate_id} mono />
      <RecordRow
        label="Trust score"
        value={`${v.trust_score}/100`}
        color={trust === 'neutral' ? undefined : colors[trust]}
      />
      <RecordRow label="Verified" value={formatDate(v.verified_at)} />
      {v.blockchain_tx && <RecordRow label={`On-chain${v.blockchain_chain ? ` (${v.blockchain_chain})` : ''}`} value={v.blockchain_tx} mono />}
      <RecordRow label="SHA-256" value={v.sha256_hash} mono />
    </Card>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  progress: { alignItems: 'center', paddingVertical: 32, marginTop: 12 },
  progressText: { fontSize: 15, fontWeight: '600', marginTop: 16, alignSelf: 'stretch', textAlign: 'center' },
  or: { fontSize: 13, marginTop: 20, marginBottom: 10 },
  action: { marginTop: 16 },
  secondaryAction: { marginTop: 12 },
  section: { marginBottom: 16 },
  headPill: { marginTop: 0, marginBottom: 12 },
  ratingPill: { marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  label: { fontSize: 12, marginTop: 4 },
  mono: { fontSize: 13, fontWeight: '600', marginTop: 2, fontFamily: monoFont },
});
