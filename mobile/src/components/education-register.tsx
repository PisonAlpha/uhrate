import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, type TextInput } from 'react-native';
import { checkCredentialMatch, extractCredential } from '@/services/education';
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
import { DEGREE_TYPES, type CredentialForm, type ExtractedCredential } from '@/types/education';

const EMPTY_FORM: CredentialForm = {
  institutionName: '',
  institutionEmail: '',
  studentName: '',
  studentEmail: '',
  degreeType: '',
  fieldOfStudy: '',
  graduationYear: '',
  certificateNumber: '',
};

type FieldErrors = Partial<Record<keyof CredentialForm, string>>;

/** Same limit as the web Education page. */
const MAX_FILE_MB = 20;

// Education > Register (roadmap D25): certificate upload with AI auto-fill,
// the credential form and the AI mismatch check, as on the web. The last
// step, paying the fee on-chain, needs wallet support (C15).
export function EducationRegister() {
  const colors = useColors();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [form, setForm] = useState<CredentialForm>(EMPTY_FORM);
  const [chain, setChain] = useState<ChainId>(DEFAULT_CHAIN);
  const [extracting, setExtracting] = useState(false);
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [ready, setReady] = useState(false);

  const refs = {
    institutionEmail: useRef<TextInput>(null),
    studentName: useRef<TextInput>(null),
    studentEmail: useRef<TextInput>(null),
    fieldOfStudy: useRef<TextInput>(null),
    graduationYear: useRef<TextInput>(null),
    certificateNumber: useRef<TextInput>(null),
  };

  // Any change means the details need checking again before payment.
  const update = (field: keyof CredentialForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
    setReady(false);
  };

  const handleFile = async (picked: PickedFile | null) => {
    setFile(picked);
    setReady(false);
    setExtractNote(null);
    if (!picked?.isImage) return;

    setExtracting(true);
    try {
      const extracted = await extractCredential(picked);
      // Keep what the user already typed where the AI found nothing, as the web does.
      setForm((f) => {
        const next = { ...f };
        for (const [key, value] of Object.entries(extracted) as [keyof ExtractedCredential, string][]) {
          if (value) next[key] = String(value);
        }
        return next;
      });
      setExtractNote(
        Object.values(extracted).some(Boolean)
          ? 'Filled in from your certificate. Please check every field.'
          : 'Nothing could be read from this image. Please fill in the details.'
      );
    } catch {
      setExtractNote("Couldn't read the certificate automatically. Please fill in the details.");
    } finally {
      setExtracting(false);
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const required: (keyof CredentialForm)[] = [
      'institutionName',
      'institutionEmail',
      'studentName',
      'studentEmail',
      'degreeType',
      'fieldOfStudy',
      'graduationYear',
    ];
    for (const field of required) if (!form[field].trim()) errors[field] = 'Required';
    if (form.institutionEmail.trim() && !isValidEmail(form.institutionEmail.trim()))
      errors.institutionEmail = 'Enter a valid email address';
    if (form.studentEmail.trim() && !isValidEmail(form.studentEmail.trim()))
      errors.studentEmail = 'Enter a valid email address';
    if (form.graduationYear.trim() && !/^\d{4}$/.test(form.graduationYear.trim()))
      errors.graduationYear = 'Enter a four-digit year';
    return errors;
  };

  const handleContinue = async () => {
    setError(null);
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()])
    ) as unknown as CredentialForm;
    setForm(trimmed);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields.');
      return;
    }

    // The web only compares images; other files go straight to payment.
    if (file?.isImage) {
      setChecking(true);
      try {
        const mismatches = await checkCredentialMatch(file, trimmed);
        if (mismatches.length > 0) {
          setFieldErrors(
            Object.fromEntries(
              mismatches.map((m) => [m.field, `Certificate shows “${m.found}”. ${m.reason}`])
            ) as FieldErrors
          );
          setError("These details don't match the uploaded certificate. Please review the highlighted fields.");
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

  return (
    <>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Register a degree or certificate permanently on the blockchain. Add the certificate to fill in the details
        automatically, or type them yourself.
      </Text>

      <Text style={[styles.step, { color: colors.text }]}>1. Certificate (optional)</Text>
      <FilePicker file={file} onChange={handleFile} maxSizeMB={MAX_FILE_MB} disabled={busy} />
      {extracting && (
        <View style={styles.inline}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.inlineText, { color: colors.textMuted }]}>Reading your certificate…</Text>
        </View>
      )}
      {extractNote && <Text style={[styles.note, { color: colors.textMuted }]}>{extractNote}</Text>}

      <Text style={[styles.step, styles.stepSpaced, { color: colors.text }]}>2. Credential details</Text>
      {error && <ErrorMessage message={error} />}

      <TextField
        label="Institution name *"
        value={form.institutionName}
        onChangeText={(v) => update('institutionName', v)}
        error={fieldErrors.institutionName}
        autoCapitalize="words"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => refs.institutionEmail.current?.focus()}
        editable={!busy}
      />
      <TextField
        ref={refs.institutionEmail}
        label="Institution email *"
        value={form.institutionEmail}
        onChangeText={(v) => update('institutionEmail', v)}
        error={fieldErrors.institutionEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => refs.studentName.current?.focus()}
        editable={!busy}
      />
      <TextField
        ref={refs.studentName}
        label="Student name *"
        value={form.studentName}
        onChangeText={(v) => update('studentName', v)}
        error={fieldErrors.studentName}
        autoCapitalize="words"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => refs.studentEmail.current?.focus()}
        editable={!busy}
      />
      <TextField
        ref={refs.studentEmail}
        label="Student email *"
        value={form.studentEmail}
        onChangeText={(v) => update('studentEmail', v)}
        error={fieldErrors.studentEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!busy}
      />
      <SelectField
        label="Degree type *"
        value={form.degreeType}
        options={DEGREE_TYPES}
        onChange={(v) => update('degreeType', v)}
        error={fieldErrors.degreeType}
        disabled={busy}
      />
      <TextField
        ref={refs.fieldOfStudy}
        label="Field of study *"
        value={form.fieldOfStudy}
        onChangeText={(v) => update('fieldOfStudy', v)}
        error={fieldErrors.fieldOfStudy}
        autoCapitalize="words"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => refs.graduationYear.current?.focus()}
        editable={!busy}
      />
      <TextField
        ref={refs.graduationYear}
        label="Graduation year *"
        value={form.graduationYear}
        onChangeText={(v) => update('graduationYear', v)}
        error={fieldErrors.graduationYear}
        keyboardType="number-pad"
        maxLength={4}
        placeholder="2024"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => refs.certificateNumber.current?.focus()}
        editable={!busy}
      />
      <TextField
        ref={refs.certificateNumber}
        label="Certificate number"
        value={form.certificateNumber}
        onChangeText={(v) => update('certificateNumber', v)}
        error={fieldErrors.certificateNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!busy}
      />

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
          <RecordRow label="Student" value={form.studentName} />
          <RecordRow label="Credential" value={`${form.degreeType}, ${form.fieldOfStudy} (${form.graduationYear})`} />
          <RecordRow label="Institution" value={form.institutionName} />
          <RecordRow label="Blockchain" value={selectedChain.name} />
          <RecordRow label="Fee" value={`$0.20 platform fee + network gas, paid in ${selectedChain.symbol}`} />
          <Button title="Pay & register" onPress={() => {}} disabled style={styles.action} />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Paying with a crypto wallet is coming soon. Your details stay here until then.
          </Text>
        </Card>
      ) : (
        <Button title="Check details" onPress={handleContinue} loading={checking} disabled={extracting} style={styles.action} />
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
  chains: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chain: { flexBasis: '45%', flexGrow: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  chainName: { fontSize: 14, fontWeight: '600' },
  chainSymbol: { fontSize: 12, marginTop: 2 },
  action: { marginTop: 24 },
  ready: { marginTop: 24 },
  readyTitle: { fontSize: 16, fontWeight: '700' },
});
