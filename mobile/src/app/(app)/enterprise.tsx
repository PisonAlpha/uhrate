import { useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { verifyFile } from '@/services/verify';
import { ApiError, errorMessage } from '@/services/api';
import { useProfile } from '@/hooks/use-profile';
import {
  CameraPermissionError,
  fileSizeError,
  formatFileSize,
  pickManyDocuments,
  pickManyFromLibrary,
  takePhoto,
  type PickedFile,
} from '@/lib/file-picker';
import { creditsLabel, ratingTone } from '@/lib/format';
import { shareCsv } from '@/lib/share-file';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { PageHeader } from '@/components/page-header';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { ShareFileButton } from '@/components/share-file-button';
import { monoFont, useColors } from '@/theme';

// Same limit per file as the web page.
const MAX_FILE_MB = 50;

type Result =
  | { fileName: string; ok: true; rating: string; trustScore: number; certificateId: string }
  | { fileName: string; ok: false; error: string };

const ORIGINAL = ['Verified Original', 'Likely Original'];
const HIGH_RISK = ['High Risk', 'Deepfake Suspected', 'AI Generated'];

// Enterprise bulk verify (roadmap D29), opened from More. Like the web's
// /enterprise page, each file goes through /api/verify in turn (not
// /api/enterprise/bulk-verify), so each uses one credit and lands in the
// user's history. Unlike the web, the run stops when credits run out.
export default function EnterpriseScreen() {
  const colors = useColors();
  const { profile, reload } = useProfile();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [pickError, setPickError] = useState<string | null>(null);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<Result[]>([]);

  const add = async (pick: () => Promise<PickedFile[]>) => {
    setPickError(null);
    setCameraBlocked(false);
    try {
      const picked = await pick();
      const tooBig = picked.filter((f) => fileSizeError(f, MAX_FILE_MB));
      if (tooBig.length > 0) {
        setPickError(
          `${tooBig.map((f) => f.name).join(', ')} ${tooBig.length === 1 ? 'is' : 'are'} over ${MAX_FILE_MB} MB and ${
            tooBig.length === 1 ? 'was' : 'were'
          } left out.`
        );
      }
      const fits = picked.filter((f) => !fileSizeError(f, MAX_FILE_MB));
      setFiles((prev) => [...prev, ...fits.filter((f) => !prev.some((p) => p.uri === f.uri))]);
      if (fits.length > 0) setResults([]);
    } catch (err) {
      if (err instanceof CameraPermissionError) {
        setCameraBlocked(true);
        setPickError('Camera access is turned off for this app. Allow it in Settings to take a photo.');
        return;
      }
      setPickError("Couldn't open those files. Please try again.");
    }
  };

  const run = async () => {
    setRunning(true);
    setResults([]);
    const done: Result[] = [];
    for (let i = 0; i < files.length; i++) {
      setCurrent(i);
      const file = files[i];
      try {
        const { data } = await verifyFile(file);
        done.push({
          fileName: file.name,
          ok: true,
          rating: data.rating,
          trustScore: data.trust_score,
          certificateId: data.certificate_id,
        });
      } catch (err) {
        // A 401 has already ended the session in services/api.ts.
        if (err instanceof ApiError && err.status === 401) break;
        done.push({ fileName: file.name, ok: false, error: errorMessage(err, 'Verification failed') });
        // Out of credits: every file after this would fail the same way.
        if (err instanceof ApiError && err.status === 403) {
          for (const rest of files.slice(i + 1)) {
            done.push({ fileName: rest.name, ok: false, error: 'Not verified: no credits left.' });
          }
          setResults([...done]);
          break;
        }
      }
      setResults([...done]);
    }
    setRunning(false);
    reload();
  };

  const verifiedCount = results.filter((r) => r.ok).length;
  const originalCount = results.filter((r) => r.ok && ORIGINAL.includes(r.rating)).length;
  const riskCount = results.filter((r) => r.ok && HIGH_RISK.includes(r.rating)).length;
  const progress = files.length > 0 ? Math.round((current / files.length) * 100) : 0;

  return (
    <Screen muted scroll>
      <PageHeader title="Bulk verification" />
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Add several files and verify them all at once. Each file uses one verification credit.
      </Text>
      {profile && (
        <Text style={[styles.credits, { color: colors.textSecondary }]}>Credits: {creditsLabel(profile)}</Text>
      )}

      <Card style={styles.section}>
        {pickError && <ErrorMessage message={pickError} />}
        {cameraBlocked && (
          <Pressable onPress={() => Linking.openSettings()} style={styles.settingsLink}>
            <Text style={[styles.settingsText, { color: colors.text }]}>Open Settings</Text>
          </Pressable>
        )}
        <View style={styles.pickRow}>
          <Button
            title="Photos & videos"
            variant="secondary"
            onPress={() => add(pickManyFromLibrary)}
            disabled={running}
            style={styles.pickButton}
          />
          <Button
            title="Files"
            variant="secondary"
            onPress={() => add(pickManyDocuments)}
            disabled={running}
            style={styles.pickButton}
          />
        </View>
        <Button
          title="Camera"
          variant="secondary"
          onPress={() =>
            add(async () => {
              const photo = await takePhoto();
              return photo ? [photo] : [];
            })
          }
          disabled={running}
          style={styles.camera}
        />
        <Text style={[styles.note, { color: colors.textMuted }]}>All file types, up to {MAX_FILE_MB} MB each.</Text>

        {files.length > 0 && (
          <>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: colors.text }]}>
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </Text>
              <Pressable onPress={() => setFiles([])} disabled={running} hitSlop={10} accessibilityRole="button">
                <Text style={[styles.clear, { color: colors.danger }]}>Clear all</Text>
              </Pressable>
            </View>
            {files.map((file) => (
              <View key={file.uri} style={[styles.fileRow, { backgroundColor: colors.neutralBackground }]}>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                    {file.name}
                  </Text>
                  {file.size !== null && (
                    <Text style={[styles.fileMeta, { color: colors.textMuted }]}>{formatFileSize(file.size)}</Text>
                  )}
                </View>
                <Pressable
                  onPress={() => setFiles((prev) => prev.filter((f) => f.uri !== file.uri))}
                  disabled={running}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${file.name}`}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
            <Button
              title={
                running
                  ? `Verifying ${current + 1} of ${files.length}…`
                  : `Verify ${files.length} file${files.length > 1 ? 's' : ''}`
              }
              onPress={run}
              loading={running}
              style={styles.action}
            />
          </>
        )}
      </Card>

      {running && (
        <Card style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={[styles.listTitle, { color: colors.text }]}>Processing files…</Text>
            <Text style={[styles.listTitle, { color: colors.text }]}>{progress}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.neutralBackground }]}>
            <View style={[styles.fill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>
            Verifying: {files[current]?.name}
          </Text>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <Text style={[styles.heading, { color: colors.text }]}>Results</Text>
          <Text style={[styles.summary, { color: colors.textMuted }]}>
            ✓ {verifiedCount} verified · <Text style={{ color: colors.success }}>{originalCount} original</Text> ·{' '}
            <Text style={{ color: colors.danger }}>{riskCount} high risk</Text>
          </Text>
          {results.map((r, i) => (
            <Card key={`${i}-${r.fileName}`} style={styles.result}>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                {r.fileName}
              </Text>
              {r.ok ? (
                <>
                  <View style={styles.resultRow}>
                    <Pill label={r.rating} tone={ratingTone(r.rating)} style={styles.resultPill} />
                    <Text style={[styles.score, { color: colors.text }]}>{r.trustScore}/100</Text>
                  </View>
                  <Text selectable style={[styles.certificate, { color: colors.textMuted, fontFamily: monoFont }]}>
                    {r.certificateId}
                  </Text>
                </>
              ) : (
                <Text style={[styles.failed, { color: colors.danger }]}>✗ {r.error}</Text>
              )}
            </Card>
          ))}
          {!running && (
            <>
              <ShareFileButton
                title="Save or share CSV"
                variant="primary"
                // Same columns and file name as the web's "Download CSV".
                onShare={() =>
                  shareCsv(
                    'uhrate-bulk-verification.csv',
                    [
                      ['File Name', 'Rating', 'Trust Score', 'Certificate ID', 'Status'],
                      ...results.map((r) =>
                        r.ok
                          ? [r.fileName, r.rating, String(r.trustScore), r.certificateId, 'success']
                          : [r.fileName, '—', '0', '—', 'error']
                      ),
                    ],
                    'Bulk verification results'
                  )
                }
                style={styles.action}
              />
              <Text style={[styles.note, { color: colors.textMuted }]}>
                Verified files are also in your history on Home.
              </Text>
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20 },
  credits: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 16 },
  section: { padding: 20, marginBottom: 12 },
  settingsLink: { marginTop: 8 },
  settingsText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  pickRow: { flexDirection: 'row', gap: 12 },
  pickButton: { flex: 1 },
  camera: { marginTop: 12 },
  note: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  listTitle: { fontSize: 14, fontWeight: '700' },
  clear: { fontSize: 13, fontWeight: '600' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginTop: 8 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '600' },
  fileMeta: { fontSize: 12, marginTop: 2 },
  action: { marginTop: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  summary: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  result: { padding: 16, marginBottom: 10 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  resultPill: { marginTop: 0 },
  score: { fontSize: 15, fontWeight: '700' },
  certificate: { fontSize: 12, marginTop: 8 },
  failed: { fontSize: 13, marginTop: 6 },
});
