import { useRef, useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet, type TextInput } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { findRegisteredDocument, registerDocument, type DocumentRegisterResponse } from '@/services/documents';
import { ApiError, errorMessage } from '@/services/api';
import { isValidEmail } from '@/lib/validation';
import { sha256OfFile } from '@/lib/file-hash';
import { formatAddress } from '@/lib/format';
import { shareJson } from '@/lib/share-file';
import type { PickedFile } from '@/lib/file-picker';
import { ONCHAIN_ENABLED } from '@/constants/config';
import { CHAINS, DEFAULT_CHAIN, type ChainId } from '@/constants/chains';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ChainPicker } from '@/components/chain-picker';
import { ErrorMessage } from '@/components/error-message';
import { FilePicker } from '@/components/file-picker';
import { PageHeader } from '@/components/page-header';
import { RecordRow } from '@/components/record-card';
import { Screen } from '@/components/screen';
import { SelectField } from '@/components/select-field';
import { ShareFileButton } from '@/components/share-file-button';
import { TextField } from '@/components/text-field';
import { useColors } from '@/theme';
import { PLATFORM_FEE_USD } from '@/wallet/fee';
import { useWallet, walletErrorMessage } from '@/wallet/use-wallet';

// Labels shown in the picker, and the value the server stores for each.
const DOCUMENT_TYPES: Record<string, string> = {
  'Educational Certificate': 'educational',
  'Legal Document': 'legal',
  'Media/Journalism': 'media',
  'Identity Document': 'identity',
  'Contract/Agreement': 'contract',
  'Research Paper': 'research',
  'Creative Work': 'creative',
  'Financial Document': 'financial',
  'Medical Record': 'medical',
  'Other Document': 'other',
};

// Same limit as the web page.
const MAX_FILE_MB = 50;

type FieldName = 'file' | 'ownerName' | 'ownerEmail' | 'documentType';

// Document registry (roadmap D24), opened from the Registry tab. Matches the
// web's /registry page: the document, owner, type and optional extra details,
// then the fee from the user's wallet (C15) and the record saved. Checking a
// document is Look up on the Verify tab (D23), as the web has it on a
// separate /registry/lookup page.
function DocumentsScreen() {
  const router = useRouter();
  const colors = useColors();
  const wallet = useWallet();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [chain, setChain] = useState<ChainId>(DEFAULT_CHAIN);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  // The file's hash once the details are checked; null means not checked.
  const [sha256, setSha256] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  // A fee already paid on this chain, kept so a failed save can be retried
  // without paying twice.
  const [paidTx, setPaidTx] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentRegisterResponse | null>(null);
  const emailInput = useRef<TextInput>(null);
  const valueInput = useRef<TextInput>(null);

  // Any change means the details need checking again before payment.
  const changed = (field?: FieldName) => {
    if (field) setFieldErrors((e) => ({ ...e, [field]: undefined }));
    setSha256(null);
  };

  const addMetadata = () => {
    const key = metaKey.trim();
    const value = metaValue.trim();
    if (!key || !value) return;
    setMetadata((m) => ({ ...m, [key]: value }));
    setMetaKey('');
    setMetaValue('');
    changed();
  };

  const removeMetadata = (key: string) => {
    setMetadata((m) => {
      const next = { ...m };
      delete next[key];
      return next;
    });
    changed();
  };

  const handleCheck = async () => {
    setError(null);
    const name = ownerName.trim();
    const email = ownerEmail.trim();
    setOwnerName(name);
    setOwnerEmail(email);

    const errors: Partial<Record<FieldName, string>> = {
      file: file ? undefined : 'Add the document to register',
      ownerName: name ? undefined : 'Required',
      ownerEmail: !email ? 'Required' : isValidEmail(email) ? undefined : 'Enter a valid email address',
      documentType: documentType ? undefined : 'Required',
    };
    setFieldErrors(errors);
    if (!file || Object.values(errors).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setChecking(true);
    try {
      let hash: string;
      try {
        hash = await sha256OfFile(file.uri);
      } catch (err) {
        if (__DEV__) console.warn('File hash failed:', err);
        setError("Couldn't read the file. Please remove it and pick it again.");
        return;
      }
      // The server only refuses a duplicate after the fee is paid, so check first.
      const existing = await findRegisteredDocument(hash);
      if (existing) {
        setError(`This document is already registered (${existing}). Look it up on the Verify tab.`);
        return;
      }
      setSha256(hash);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const handlePay = async () => {
    if (!file || !sha256) return;
    setError(null);
    setPaying(true);
    let txHash = paidTx;
    try {
      if (!txHash) {
        // Same record the web page writes on-chain.
        txHash = await wallet.payFee(selectedChain, {
          platform: 'UHRATE',
          sha256,
          file: file.name,
          type: DOCUMENT_TYPES[documentType],
          owner: ownerName,
          timestamp: Date.now(),
        });
        setPaidTx(txHash);
      }
      setResult(
        await registerDocument(file, { ownerName, ownerEmail, documentType: DOCUMENT_TYPES[documentType] }, metadata, {
          chainId: chain,
          txHash,
        })
      );
    } catch (err) {
      if (txHash) {
        setError(
          `Your payment went through, but the record couldn't be saved: ${errorMessage(err)} ` +
            'Tap Retry to save it without paying again.'
        );
      } else if (err instanceof ApiError) {
        setError(errorMessage(err));
      } else {
        setError(walletErrorMessage(err));
      }
    } finally {
      setPaying(false);
    }
  };

  const startOver = () => {
    setFile(null);
    setOwnerName('');
    setOwnerEmail('');
    setDocumentType('');
    setMetadata({});
    setMetaKey('');
    setMetaValue('');
    setFieldErrors({});
    setSha256(null);
    setPaidTx(null);
    setResult(null);
    setError(null);
  };

  const busy = checking || paying;
  const selectedChain = CHAINS.find((c) => c.id === chain)!;
  const ready = sha256 !== null;

  if (result) {
    return (
      <Screen muted scroll>
        <PageHeader title="Document registry" />
        <Card>
          <Text style={[styles.cardTitle, { color: colors.success }]}>✓ Document registered</Text>
          <RecordRow label="Registry ID" value={result.registry_id} mono />
          <RecordRow label="Blockchain" value={result.chain} />
          <RecordRow label="SHA-256 hash" value={result.sha256_hash} mono />
          <RecordRow label="Transaction" value={result.tx_hash} mono />
          {result.ipfs_hash && <RecordRow label="IPFS" value={result.ipfs_hash} mono />}
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Keep the registry ID safe. Anyone can use it to check this document with Look up on the Verify tab.
          </Text>
          <Button
            title="View transaction"
            variant="secondary"
            onPress={() => Linking.openURL(`${selectedChain.explorer}/tx/${result.tx_hash}`)}
            style={styles.action}
          />
          <ShareFileButton
            title="Save or share registry certificate"
            // Same file the web's "Download Registry Certificate" saves.
            onShare={() =>
              shareJson(`uhrate_registry_${result.registry_id}.json`, result, 'Registry certificate')
            }
            style={styles.secondAction}
          />
          <Button title="Register another document" onPress={startOver} style={styles.secondAction} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen muted form>
      <PageHeader title="Document registry" />
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Give your original document a permanent blockchain identity. Anyone who tries to counterfeit it can be detected
        instantly.
      </Text>

      <Text style={[styles.step, { color: colors.text }]}>1. Document *</Text>
      <FilePicker
        file={file}
        onChange={(picked) => {
          setFile(picked);
          changed('file');
        }}
        maxSizeMB={MAX_FILE_MB}
        disabled={busy}
      />
      {fieldErrors.file && <Text style={[styles.fieldError, { color: colors.danger }]}>{fieldErrors.file}</Text>}

      <Text style={[styles.step, styles.stepSpaced, { color: colors.text }]}>2. Details</Text>
      {error && !ready && <ErrorMessage message={error} />}
      <TextField
        label="Owner name *"
        value={ownerName}
        onChangeText={(v) => {
          setOwnerName(v);
          changed('ownerName');
        }}
        error={fieldErrors.ownerName}
        placeholder="Full name or organization"
        autoCapitalize="words"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailInput.current?.focus()}
        editable={!busy}
      />
      <TextField
        ref={emailInput}
        label="Owner email *"
        value={ownerEmail}
        onChangeText={(v) => {
          setOwnerEmail(v);
          changed('ownerEmail');
        }}
        error={fieldErrors.ownerEmail}
        placeholder="your@email.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="done"
        editable={!busy}
      />
      <SelectField
        label="Document type *"
        value={documentType}
        options={Object.keys(DOCUMENT_TYPES)}
        onChange={(v) => {
          setDocumentType(v);
          changed('documentType');
        }}
        error={fieldErrors.documentType}
        disabled={busy}
      />

      <Text style={[styles.step, styles.stepSpaced, { color: colors.text }]}>3. Extra details (optional)</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Anything else worth recording, e.g. Institution: University of Lagos.
      </Text>
      <View style={styles.metaRow}>
        <View style={styles.metaField}>
          <TextField
            label="Name"
            value={metaKey}
            onChangeText={setMetaKey}
            placeholder="Institution"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => valueInput.current?.focus()}
            editable={!busy}
          />
        </View>
        <View style={styles.metaField}>
          <TextField
            ref={valueInput}
            label="Value"
            value={metaValue}
            onChangeText={setMetaValue}
            returnKeyType="done"
            onSubmitEditing={addMetadata}
            editable={!busy}
          />
        </View>
      </View>
      <Button
        title="Add"
        variant="secondary"
        onPress={addMetadata}
        disabled={busy || !metaKey.trim() || !metaValue.trim()}
        style={styles.secondAction}
      />
      {Object.entries(metadata).map(([key, value]) => (
        <View key={key} style={[styles.metaItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.metaText, { color: colors.text }]}>
            <Text style={styles.metaKey}>{key}:</Text> {value}
          </Text>
          <Pressable
            onPress={() => removeMetadata(key)}
            disabled={busy}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${key}`}
          >
            <Ionicons name="close" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      <Text style={[styles.step, styles.stepSpaced, { color: colors.text }]}>4. Blockchain</Text>
      <ChainPicker
        value={chain}
        onChange={(id) => {
          setChain(id);
          setPaidTx(null);
        }}
        disabled={busy}
      />

      {ready && file ? (
        <Card style={styles.ready}>
          <Text style={[styles.cardTitle, { color: colors.success }]}>✓ Details checked</Text>
          <RecordRow label="Document" value={file.name} />
          <RecordRow label="Owner" value={`${ownerName} (${ownerEmail})`} />
          <RecordRow label="Type" value={documentType} />
          {Object.keys(metadata).length > 0 && (
            <RecordRow
              label="Extra details"
              value={Object.entries(metadata)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}
            />
          )}
          <RecordRow label="SHA-256 hash" value={sha256} mono />
          <RecordRow label="Blockchain" value={selectedChain.name} />
          <RecordRow
            label="Fee"
            value={
              selectedChain.testnet
                ? `Paid in free test ${selectedChain.symbol} (testnet, no real money)`
                : `$${PLATFORM_FEE_USD.toFixed(2)} platform fee + network gas, paid in ${selectedChain.symbol}`
            }
          />
          {wallet.address && <RecordRow label="Wallet" value={formatAddress(wallet.address)} />}
          {error && <ErrorMessage message={error} />}
          <Button
            title={paidTx ? 'Retry' : wallet.isConnected ? 'Pay & register' : 'Connect wallet & pay'}
            onPress={handlePay}
            loading={paying}
            style={styles.action}
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            {paying
              ? 'Confirm the payment in your wallet app, then come back here.'
              : 'Your wallet will ask you to approve the payment.'}
          </Text>
        </Card>
      ) : (
        <Button title="Check details" onPress={handleCheck} loading={checking} style={styles.action} />
      )}

      <Card style={styles.lookup}>
        <Text style={[styles.lookupTitle, { color: colors.text }]}>Checking a document?</Text>
        <Text style={[styles.note, { color: colors.textMuted }]}>
          On the Verify tab, tap Look up and enter a registry ID or hash, or pick the file. It's free.
        </Text>
        <Button
          title="Go to the Verify tab"
          variant="secondary"
          onPress={() => router.navigate('/verify')}
          disabled={busy}
          style={styles.secondAction}
        />
      </Card>
    </Screen>
  );
}

// The Document registry charges the on-chain fee, so it only exists with ONCHAIN_ENABLED.
export default function DocumentsRoute() {
  return ONCHAIN_ENABLED ? <DocumentsScreen /> : <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  step: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  stepSpaced: { marginTop: 24 },
  hint: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  fieldError: { fontSize: 13, marginTop: 8 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaField: { flex: 1 },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  metaText: { flex: 1, fontSize: 14 },
  metaKey: { fontWeight: '700' },
  note: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  action: { marginTop: 24 },
  secondAction: { marginTop: 12 },
  ready: { marginTop: 24 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  lookup: { marginTop: 32 },
  lookupTitle: { fontSize: 16, fontWeight: '700' },
});
