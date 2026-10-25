import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { verifyFile } from '@/services/verify';
import { ApiError, errorMessage } from '@/services/api';
import { formatFileSize, type PickedFile } from '@/lib/file-picker';
import { parseLookupCode, type LookupCode } from '@/lib/lookup-code';
import { ratingTone, trustTone } from '@/lib/format';
import { shareJson } from '@/lib/share-file';
import { BrandHeader } from '@/components/brand-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { FilePicker } from '@/components/file-picker';
import { LookupPanel } from '@/components/lookup-panel';
import { Pill } from '@/components/pill';
import { ScoreBar } from '@/components/score-bar';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ShareFileButton } from '@/components/share-file-button';
import { monoFont, useColors } from '@/theme';
import type { VerifyResponse } from '@/types/verify';

// Shown in turn while the server works, so a long analysis doesn't look stuck.
const PROGRESS_STEPS = [
  'Uploading your file...',
  'Extracting Digital DNA...',
  'Running AI deepfake analysis...',
  'Computing trust score...',
];
const PROGRESS_INTERVAL_MS = 2500;

const CHECKS: { icon: ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { icon: 'hardware-chip-outline', label: 'AI generation' },
  { icon: 'eye-outline', label: 'Deepfake' },
  { icon: 'cut-outline', label: 'Manipulation' },
  { icon: 'analytics-outline', label: 'Trust score' },
];

type Mode = 'verify' | 'lookup';

// The Verify tab holds two tools: Verify (D20, also covering D21) and Look up
// (D23). The QR scanner returns here with `code` (and `t`, so the same code
// can be scanned twice) to open Look up and run it; `mode=lookup` just opens
// Look up.
export default function VerifyTab() {
  const colors = useColors();
  const { code, t, mode: modeParam } = useLocalSearchParams<{ code?: string; t?: string; mode?: string }>();
  const [mode, setMode] = useState<Mode>('verify');
  const [scanned, setScanned] = useState<LookupCode | null>(null);

  useEffect(() => {
    if (modeParam === 'lookup') setMode('lookup');
    const parsed = code ? parseLookupCode(code) : null;
    if (!parsed) return;
    setMode('lookup');
    setScanned(parsed);
  }, [code, t, modeParam]);

  return (
    <Screen muted form>
      <View style={styles.header}>
        <BrandHeader />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{mode === 'verify' ? 'Verify' : 'Look up'}</Text>
      <View style={styles.switch}>
        <SegmentedControl
          options={[
            { value: 'verify', label: 'Verify file' },
            { value: 'lookup', label: 'Look up' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </View>

      {/* Both stay mounted, so switching back and forth keeps each one's progress. */}
      <View style={mode !== 'verify' && styles.hidden}>
        <VerifyPanel />
      </View>
      <View style={mode !== 'lookup' && styles.hidden}>
        <LookupPanel scannedCode={scanned} />
      </View>
    </Screen>
  );
}

// Verify (roadmap D20): pick a file, run /api/verify, show the trust report.
// Mobile version of the web's /scan page, which /verify redirects to.
function VerifyPanel() {
  const colors = useColors();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);

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

  const reset = () => {
    setResult(null);
    setFile(null);
    setError(null);
  };

  return (
    <>
      {result ? (
        <VerifyResult result={result} onReset={reset} />
      ) : (
        <>
          <Text style={[styles.intro, { color: colors.textMuted }]}>
            Check any image, video, audio file or document for AI generation, deepfakes and manipulation, and get a
            trust report. Each check uses one credit on the free plan.
          </Text>

          <View style={styles.checks}>
            {CHECKS.map((c) => (
              <View key={c.label} style={[styles.check, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name={c.icon} size={20} color={colors.text} />
                <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>{c.label}</Text>
              </View>
            ))}
          </View>

          {error && <ErrorMessage message={error} />}

          {verifying ? (
            <Card style={styles.progress}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.progressStep, { color: colors.text }]}>{PROGRESS_STEPS[step]}</Text>
              <Text style={[styles.progressNote, { color: colors.textMuted }]}>
                Analysing your file with 6 AI models. This can take a minute.
              </Text>
            </Card>
          ) : (
            <>
              <FilePicker file={file} onChange={setFile} />
              <Button title="Verify file" onPress={handleVerify} disabled={!file} style={styles.action} />
            </>
          )}
        </>
      )}
    </>
  );
}

function VerifyResult({ result, onReset }: { result: VerifyResponse; onReset: () => void }) {
  const colors = useColors();
  const { data, analysis, cached } = result;
  const trust = trustTone(data.trust_score);
  const trustColor = trust === 'neutral' ? colors.text : colors[trust];
  const issues = analysis?.detected_issues ?? [];

  return (
    <>
      {cached && (
        <Card style={styles.section}>
          <Text style={[styles.note, { color: colors.textMuted }]}>
            This exact file has been verified on UHRATE before, so this is the earlier result.
          </Text>
        </Card>
      )}

      <Card style={styles.section}>
        <View style={styles.fileRow}>
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
              {data.file_name}
            </Text>
            <Text style={[styles.fileMeta, { color: colors.textMuted }]} numberOfLines={1}>
              {[data.file_type, data.file_size != null ? formatFileSize(data.file_size) : null]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>
        <Pill label={data.rating} tone={ratingTone(data.rating)} style={styles.ratingPill} />

        <View style={[styles.trustRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.trustLabel, { color: colors.textSecondary }]}>Overall trust score</Text>
          <Text style={[styles.trustValue, { color: trustColor }]}>{data.trust_score}/100</Text>
        </View>

        <ScoreBar label="Originality" value={data.originality_score} color={colors.success} />
        <ScoreBar label="AI generation probability" value={data.ai_score} color={colors.warning} />
        <ScoreBar label="Deepfake risk" value={data.deepfake_score} color={colors.danger} />
        <ScoreBar label="Manipulation" value={data.manipulation_score} color={colors.info} />
      </Card>

      {analysis?.summary && (
        <Card style={styles.section}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>AI analysis</Text>
          <Text style={[styles.summary, { color: colors.textSecondary }]}>{analysis.summary}</Text>
          {issues.map((issue, i) => (
            <View key={i} style={styles.issue}>
              <Ionicons name="warning-outline" size={16} color={colors.warning} />
              <Text style={[styles.issueText, { color: colors.textSecondary }]}>{issue}</Text>
            </View>
          ))}
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={[styles.refLabel, { color: colors.textMuted }]}>Scan reference</Text>
        <Text style={[styles.ref, { color: colors.text }]} selectable>
          {data.certificate_id}
        </Text>
      </Card>

      <ShareFileButton
        title="Save or share report"
        // Same file the web's "Download Report" saves.
        onShare={() =>
          shareJson(
            `uhrate_scan_${data.certificate_id}.json`,
            {
              scan_id: data.certificate_id,
              file_name: data.file_name,
              file_type: data.file_type,
              sha256_hash: data.sha256_hash,
              originality_score: data.originality_score,
              ai_score: data.ai_score,
              deepfake_score: data.deepfake_score,
              manipulation_score: data.manipulation_score,
              trust_score: data.trust_score,
              rating: data.rating,
              analysis: analysis?.summary,
              detected_issues: analysis?.detected_issues,
              scanned_at: data.created_at,
              platform: 'UHRATE Verify',
            },
            'Verification report'
          )
        }
        style={styles.section}
      />
      <Button title="Verify another file" onPress={onReset} />
    </>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 12 },
  switch: { marginBottom: 16 },
  hidden: { display: 'none' },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  checks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  check: {
    flexBasis: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  checkLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  progress: { alignItems: 'center', paddingVertical: 32 },
  progressStep: { fontSize: 15, fontWeight: '600', marginTop: 16, alignSelf: 'stretch', textAlign: 'center' },
  progressNote: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  action: { marginTop: 16 },
  section: { marginBottom: 16 },
  note: { fontSize: 13, lineHeight: 19 },
  fileRow: { flexDirection: 'row' },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, fontWeight: '700' },
  fileMeta: { fontSize: 12, marginTop: 2 },
  ratingPill: { marginTop: 12 },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  trustLabel: { fontSize: 14, fontWeight: '600' },
  trustValue: { fontSize: 28, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  summary: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  issue: { flexDirection: 'row', gap: 8, marginTop: 10 },
  issueText: { flex: 1, fontSize: 13, lineHeight: 19 },
  refLabel: { fontSize: 12 },
  ref: { fontSize: 14, fontWeight: '600', marginTop: 4, fontFamily: monoFont },
});
