import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking, StyleSheet, type TextInput } from 'react-native';
import { checkDetailsMatch, extractDetails, registerRecord, type RegisterResponse } from '@/services/registry';
import { ApiError, errorMessage } from '@/services/api';
import { isValidEmail } from '@/lib/validation';
import { sha256OfFile } from '@/lib/file-hash';
import { formatAddress } from '@/lib/format';
import type { PickedFile } from '@/lib/file-picker';
import { CHAINS, DEFAULT_CHAIN, type ChainId } from '@/constants/chains';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { FilePicker } from '@/components/file-picker';
import { RecordRow } from '@/components/record-card';
import { SelectField } from '@/components/select-field';
import { TextField } from '@/components/text-field';
import { useColors } from '@/theme';
import type { RegistryConfig, RegistryField } from '@/registries/types';
import { useWallet, walletErrorMessage } from '@/wallet/use-wallet';

type Form = Record<string, string>;

function emptyForm(config: RegistryConfig): Form {
  return Object.fromEntries(config.fields.map((f) => [f.name, '']));
}

function fieldError(field: RegistryField, value: string): string | undefined {
  if (!value) return field.required ? 'Required' : undefined;
  if (field.kind === 'email' && !isValidEmail(value)) return 'Enter a valid email address';
  if (field.kind === 'year' && !/^\d{4}$/.test(value)) return 'Enter a four-digit year';
  if (field.kind === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Use the format YYYY-MM-DD';
  return undefined;
}

// Register side of a registry (roadmap D25–D27): file upload with AI
// auto-fill, the details form, the AI mismatch check, then paying the fee
// from the user's wallet (C15) and saving the record, as on the web.
export function RegistryRegister({ config }: { config: RegistryConfig }) {
  const colors = useColors();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [form, setForm] = useState<Form>(() => emptyForm(config));
  const [chain, setChain] = useState<ChainId>(DEFAULT_CHAIN);
  const [extracting, setExtracting] = useState(false);
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  // A fee already paid on this chain, kept so a failed save can be retried
  // without paying twice.
  const [paidTx, setPaidTx] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const wallet = useWallet();
  const inputs = useRef<Record<string, TextInput | null>>({});

  // Any change means the details need checking again before payment.
  const update = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((e) => ({ ...e, [name]: undefined }));
    setReady(false);
  };

  const handleFile = async (picked: PickedFile | null) => {
    setFile(picked);
    setReady(false);
    setExtractNote(null);
    if (!picked?.isImage) return;

    setExtracting(true);
    try {
      const extracted = await extractDetails(config.key, picked);
      // Keep what the user already typed where the AI found nothing, as the web does.
      setForm((f) => {
        const next = { ...f };
        for (const [name, value] of Object.entries(extracted)) if (value && name in next) next[name] = String(value);
        return next;
      });
      setExtractNote(
        Object.values(extracted).some(Boolean)
          ? `Filled in from your ${config.fileNoun}. Please check every field.`
          : 'Nothing could be read from this image. Please fill in the details.'
      );
    } catch {
      setExtractNote(`Couldn't read the ${config.fileNoun} automatically. Please fill in the details.`);
    } finally {
      setExtracting(false);
    }
  };

  const handleContinue = async () => {
    setError(null);
    const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    setForm(trimmed);

    const errors = Object.fromEntries(config.fields.map((f) => [f.name, fieldError(f, trimmed[f.name])]));
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }

    // The web only compares images; other files go straight to payment.
    if (file?.isImage) {
      setChecking(true);
      try {
        const mismatches = await checkDetailsMatch(config.key, file, trimmed);
        if (mismatches.length > 0) {
          setFieldErrors(
            Object.fromEntries(mismatches.map((m) => [m.field, `The ${config.fileNoun} shows “${m.found}”. ${m.reason}`]))
          );
          setError(`These details don't match the uploaded ${config.fileNoun}. Please review the highlighted fields.`);
          return;
        }
      } catch (err) {
        setError(errorMessage(err));
        return;
      } finally {
        setChecking(false);
      }
    }
    setReady(true);
  };

  const handlePay = async () => {
    setError(null);
    setPaying(true);
    let txHash = paidTx;
    try {
      // Read the file before the wallet is involved, so a file problem is
      // reported as one and never as a cancelled payment.
      let sha256Hash = '';
      if (file) {
        try {
          sha256Hash = await sha256OfFile(file.uri);
        } catch (err) {
          if (__DEV__) console.warn('File hash failed:', err);
          setError("Couldn't read the file. Please remove it and pick it again.");
          return;
        }
      }
      if (!txHash) {
        txHash = await wallet.payFee(selectedChain, config.chainRecord(form, sha256Hash || null));
        setPaidTx(txHash);
      }
      setResult(await registerRecord(config.key, form, { sha256Hash, chainId: chain, txHash }));
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
    setForm(emptyForm(config));
    setFieldErrors({});
    setExtractNote(null);
    setReady(false);
    setPaidTx(null);
    setResult(null);
    setError(null);
  };

  const busy = extracting || checking || paying;
  const selectedChain = CHAINS.find((c) => c.id === chain)!;
  // Enter moves to the next typed field; pick-lists are skipped.
  const nextTextField = (index: number) =>
    config.fields.slice(index + 1).find((f) => f.kind !== 'select' && f.kind !== 'multiline');

  if (result) {
    return (
      <Card>
        <Text style={[styles.readyTitle, { color: colors.success }]}>✓ Registered</Text>
        <RecordRow label="Registry ID" value={result.registry_id} />
        <RecordRow label="Blockchain" value={result.chain} />
        <RecordRow label="Transaction" value={result.tx_hash} />
        {result.ipfs_hash && <RecordRow label="IPFS" value={result.ipfs_hash} />}
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Anyone can look this up with the registry ID on the Verify tab.
        </Text>
        <Button
          title="View transaction"
          variant="secondary"
          onPress={() => Linking.openURL(`${selectedChain.explorer}/tx/${result.tx_hash}`)}
          style={styles.action}
        />
        <Button title={`Register another ${config.fileNoun}`} onPress={startOver} style={styles.resultAction} />
      </Card>
    );
  }

  return (
    <>
      <Text style={[styles.intro, { color: colors.textMuted }]}>{config.registerIntro}</Text>

      <Text style={[styles.step, { color: colors.text }]}>
        1. {config.fileNoun.charAt(0).toUpperCase() + config.fileNoun.slice(1)} (optional)
      </Text>
      <FilePicker file={file} onChange={handleFile} maxSizeMB={config.maxFileMB} disabled={busy} />
      {extracting && (
        <View style={styles.inline}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.inlineText, { color: colors.textMuted }]}>Reading your {config.fileNoun}…</Text>
        </View>
      )}
      {extractNote && <Text style={[styles.note, { color: colors.textMuted }]}>{extractNote}</Text>}

      <Text style={[styles.step, styles.stepSpaced, { color: colors.text }]}>2. Details</Text>
      {error && !ready && <ErrorMessage message={error} />}

      {config.fields.map((field, index) => {
        const label = field.required ? `${field.label} *` : field.label;
        if (field.kind === 'select') {
          return (
            <SelectField
              key={field.name}
              label={label}
              value={form[field.name]}
              options={field.options ?? []}
              onChange={(v) => update(field.name, v)}
              error={fieldErrors[field.name]}
              disabled={busy}
            />
          );
        }
        const next = nextTextField(index);
        return (
          <TextField
            key={field.name}
            ref={(el) => {
              inputs.current[field.name] = el;
            }}
            label={label}
            value={form[field.name]}
            onChangeText={(v) => update(field.name, v)}
            error={fieldErrors[field.name]}
            placeholder={field.placeholder ?? (field.kind === 'date' ? 'YYYY-MM-DD' : undefined)}
            autoCapitalize={field.kind === 'email' || field.kind === 'date' ? 'none' : (field.autoCapitalize ?? 'sentences')}
            autoCorrect={field.kind === 'text' || field.kind === 'multiline' || field.kind === undefined ? undefined : false}
            keyboardType={
              field.kind === 'email'
                ? 'email-address'
                : field.kind === 'year'
                  ? 'number-pad'
                  : field.kind === 'date'
                    ? 'numbers-and-punctuation'
                    : 'default'
            }
            maxLength={field.kind === 'year' ? 4 : field.kind === 'date' ? 10 : undefined}
            multiline={field.kind === 'multiline'}
            style={field.kind === 'multiline' ? styles.multiline : undefined}
            returnKeyType={field.kind === 'multiline' ? 'default' : next ? 'next' : 'done'}
            submitBehavior={field.kind === 'multiline' ? 'newline' : next ? 'submit' : 'blurAndSubmit'}
            onSubmitEditing={next ? () => inputs.current[next.name]?.focus() : undefined}
            editable={!busy}
          />
        );
      })}

      <Text style={[styles.step, styles.stepSpaced, { color: colors.text }]}>3. Blockchain</Text>
      <View style={styles.chains}>
        {CHAINS.map((c) => {
          const selected = c.id === chain;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setChain(c.id);
                setPaidTx(null);
              }}
              disabled={busy}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chain,
                selected
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.borderStrong },
              ]}
            >
              <Text style={[styles.chainName, { color: selected ? colors.onPrimary : colors.text }]}>{c.name}</Text>
              <Text style={[styles.chainSymbol, { color: selected ? colors.onPrimary : colors.textMuted }]}>
                {c.testnet ? `Testnet · free test ${c.symbol}` : c.symbol}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {ready ? (
        <Card style={styles.ready}>
          <Text style={[styles.readyTitle, { color: colors.success }]}>✓ Details checked</Text>
          {config.summary(form).map((row) => (
            <RecordRow key={row.label} label={row.label} value={row.value} />
          ))}
          <RecordRow label="Blockchain" value={selectedChain.name} />
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
        <Button
          title="Check details"
          onPress={handleContinue}
          loading={checking}
          disabled={extracting}
          style={styles.action}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  step: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  stepSpaced: { marginTop: 24 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  inlineText: { fontSize: 13 },
  note: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  chains: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chain: { flexBasis: '45%', flexGrow: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  chainName: { fontSize: 14, fontWeight: '600' },
  chainSymbol: { fontSize: 12, marginTop: 2 },
  action: { marginTop: 24 },
  resultAction: { marginTop: 12 },
  ready: { marginTop: 24 },
  readyTitle: { fontSize: 16, fontWeight: '700' },
});
