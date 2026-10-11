import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, type TextInput } from 'react-native';
import { checkDetailsMatch, extractDetails } from '@/services/registry';
import { errorMessage } from '@/services/api';
import { isValidEmail } from '@/lib/validation';
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
// auto-fill, the details form and the AI mismatch check, as on the web. The
// last step, paying the fee on-chain, needs wallet support (C15).
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

  const busy = extracting || checking;
  const selectedChain = CHAINS.find((c) => c.id === chain)!;
  // Enter moves to the next typed field; pick-lists are skipped.
  const nextTextField = (index: number) =>
    config.fields.slice(index + 1).find((f) => f.kind !== 'select' && f.kind !== 'multiline');

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
      {error && <ErrorMessage message={error} />}

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
              onPress={() => setChain(c.id)}
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
                {c.symbol}
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
          <RecordRow label="Fee" value={`$0.20 platform fee + network gas, paid in ${selectedChain.symbol}`} />
          <Button title="Pay & register" onPress={() => {}} disabled style={styles.action} />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Paying with a crypto wallet is coming soon. Your details stay here until then.
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
  ready: { marginTop: 24 },
  readyTitle: { fontSize: 16, fontWeight: '700' },
});
