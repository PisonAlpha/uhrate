import { useCallback, useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchApiKeys, generateApiKey, revokeApiKey, type ApiKey } from '@/services/developer';
import { ApiError, errorMessage } from '@/services/api';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { PageHeader } from '@/components/page-header';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { monoFont, useColors } from '@/theme';

type Tab = 'docs' | 'keys';

// The web's documentation, as on its /api-marketplace page.
const BASE_URL = 'https://uhrate.online';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/verify',
    description: 'Verify a file for authenticity',
    body: 'multipart/form-data with file field',
    response: '{ success, data: { certificate_id, rating, trust_score, ... }, analysis }',
  },
  {
    method: 'GET',
    path: '/api/certificate?id=CERT_ID',
    description: 'Look up a certificate by ID',
    body: 'None',
    response: '{ success, certificate: { id, rating, scores, blockchain_tx, ... } }',
  },
  {
    method: 'POST',
    path: '/api/verify-public',
    description: 'Public verification by hash or certificate ID',
    body: '{ certificateId } or { hash }',
    response: '{ found, verification: { ... } }',
  },
  {
    method: 'POST',
    path: '/api/enterprise/bulk-verify',
    description: 'Verify up to 20 files at once',
    body: 'multipart/form-data with files[] field',
    response: '{ success, total, successful, failed, results: [...] }',
  },
];

const EXAMPLE = `const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://uhrate.online/api/verify', {
  method: 'POST',
  headers: { 'x-api-key': 'uhr_your_key' },
  body: formData,
});

const result = await response.json();
console.log(result.data.rating);
// "Verified Original"`;

function CodeBlock({ code }: { code: string }) {
  const colors = useColors();
  return (
    <View style={[styles.code, { backgroundColor: colors.neutralBackground }]}>
      <Text selectable style={[styles.codeText, { color: colors.text, fontFamily: monoFont }]}>
        {code}
      </Text>
    </View>
  );
}

function Documentation() {
  const colors = useColors();
  return (
    <>
      <Card style={styles.section}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Base URL</Text>
        <CodeBlock code={BASE_URL} />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Authentication</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>Include your API key in the request header:</Text>
        <CodeBlock code="x-api-key: uhr_your_api_key_here" />
      </Card>

      <Text style={[styles.heading, { color: colors.text }]}>Endpoints</Text>
      {ENDPOINTS.map((e) => (
        <Card key={e.path} style={styles.section}>
          <View style={styles.endpointRow}>
            <Pill label={e.method} tone={e.method === 'GET' ? 'neutral' : 'success'} style={styles.method} />
            <Text selectable style={[styles.path, { color: colors.text, fontFamily: monoFont }]}>
              {e.path}
            </Text>
          </View>
          <Text style={[styles.body, { color: colors.textMuted }]}>{e.description}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Request body</Text>
          <CodeBlock code={e.body} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Response</Text>
          <CodeBlock code={e.response} />
        </Card>
      ))}

      <Card style={styles.section}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Example — Verify a file</Text>
        <CodeBlock code={EXAMPLE} />
      </Card>
    </>
  );
}

function ApiKeys() {
  const colors = useColors();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setKeys(await fetchApiKeys());
      setLoadError(null);
    } catch (err) {
      // A 401 has already ended the session in services/api.ts.
      if (!(err instanceof ApiError && err.status === 401)) setLoadError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    const name = keyName.trim();
    setKeyName(name);
    if (!name) {
      setError('Give the key a name, e.g. My App Production.');
      return;
    }
    setGenerating(true);
    setError(null);
    setNewKey(null);
    try {
      const result = await generateApiKey(name);
      setNewKey(result.api_key);
      setKeyName('');
      await load();
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) setError(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const revoke = async (key: ApiKey) => {
    setRevoking(key.id);
    setError(null);
    try {
      await revokeApiKey(key.id);
      await load();
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) setError(errorMessage(err));
    } finally {
      setRevoking(null);
    }
  };

  const confirmRevoke = (key: ApiKey) =>
    Alert.alert('Revoke this key?', `Apps using “${key.key_name}” will stop working. This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => revoke(key) },
    ]);

  return (
    <>
      <Card style={styles.section}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Generate API key</Text>
        {newKey && (
          <View style={[styles.newKey, { backgroundColor: colors.successBackground }]}>
            <Text style={[styles.newKeyTitle, { color: colors.success }]}>
              Your new API key — save it now, it won't be shown again. Press and hold to copy it.
            </Text>
            <Text selectable style={[styles.codeText, { color: colors.text, fontFamily: monoFont }]}>
              {newKey}
            </Text>
          </View>
        )}
        {error && <ErrorMessage message={error} />}
        <TextField
          label="Key name"
          value={keyName}
          onChangeText={setKeyName}
          placeholder="e.g. My App Production"
          returnKeyType="done"
          onSubmitEditing={handleGenerate}
          editable={!generating}
        />
        <Button title="Generate API key" onPress={handleGenerate} loading={generating} style={styles.action} />
        <Text style={[styles.note, { color: colors.textMuted }]}>Up to 5 active keys, 1,000 calls each.</Text>
      </Card>

      <Text style={[styles.heading, { color: colors.text }]}>Your API keys</Text>
      {loadError && <ErrorMessage message={loadError} />}
      {keys === null && !loadError && <ActivityIndicator color={colors.primary} style={styles.loading} />}
      {keys?.length === 0 && <Text style={[styles.body, { color: colors.textMuted }]}>You have no API keys yet.</Text>}
      {keys?.map((key) => (
        <Card key={key.id} style={styles.section}>
          <View style={styles.keyRow}>
            <Text style={[styles.keyName, { color: colors.text }]}>{key.key_name}</Text>
            <Pill
              label={key.is_active ? 'Active' : 'Inactive'}
              tone={key.is_active ? 'success' : 'neutral'}
              style={styles.status}
            />
          </View>
          <Text selectable style={[styles.maskedKey, { color: colors.textMuted, fontFamily: monoFont }]}>
            {key.api_key}
          </Text>
          <Text style={[styles.note, { color: colors.textMuted }]}>
            {key.calls_used}/{key.calls_limit} calls used · Created {formatDate(key.created_at)}
            {key.last_used_at ? ` · Last used ${formatDate(key.last_used_at)}` : ''}
          </Text>
          {key.is_active && (
            <Button
              title="Revoke"
              variant="danger"
              onPress={() => confirmRevoke(key)}
              loading={revoking === key.id}
              disabled={revoking !== null}
              style={styles.action}
            />
          )}
        </Card>
      ))}
    </>
  );
}

// Developer API (roadmap D30), opened from More. Matches the web's
// /api-marketplace page: Documentation | API keys.
export default function DeveloperScreen() {
  const [tab, setTab] = useState<Tab>('docs');

  return (
    <Screen muted form>
      <PageHeader title="Developer API" />
      <View style={styles.switch}>
        <SegmentedControl
          options={[
            { value: 'docs', label: 'Documentation' },
            { value: 'keys', label: 'API keys' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {/* Both stay mounted, so switching keeps a new key on screen. */}
      <View style={tab !== 'docs' && styles.hidden}>
        <Documentation />
      </View>
      <View style={tab !== 'keys' && styles.hidden}>
        <ApiKeys />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switch: { marginBottom: 16 },
  hidden: { display: 'none' },
  section: { padding: 20, marginBottom: 12 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 12 },
  note: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  code: { borderRadius: 10, padding: 12, marginTop: 8 },
  codeText: { fontSize: 12, lineHeight: 18 },
  endpointRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  method: { marginTop: 0 },
  path: { flexShrink: 1, fontSize: 13 },
  newKey: { borderRadius: 12, padding: 14, marginBottom: 4 },
  newKeyTitle: { fontSize: 13, fontWeight: '600', lineHeight: 19, marginBottom: 8 },
  action: { marginTop: 16 },
  loading: { marginVertical: 16 },
  keyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  keyName: { flex: 1, fontSize: 15, fontWeight: '700' },
  status: { marginTop: 0 },
  maskedKey: { fontSize: 12, marginTop: 6 },
});
