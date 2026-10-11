import { useState } from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { searchRegistry } from '@/services/registry';
import { errorMessage } from '@/services/api';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { RegistryCard } from '@/components/record-card';
import { TextField } from '@/components/text-field';
import { monoFont, useColors } from '@/theme';
import type { RegistryConfig } from '@/registries/types';
import type { RegistryRecord } from '@/types/lookup';

// Search side of a registry: find records by registry ID, or by the
// registry's other fields (name, title, hash…). Free and public.
export function RegistrySearch({ config }: { config: RegistryConfig }) {
  const colors = useColors();
  const [registryId, setRegistryId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ records: RegistryRecord[]; message: string | null } | null>(null);

  const handleSearch = async () => {
    // A registry ID is exact, so it's searched on its own.
    const search: Record<string, string> = registryId.trim()
      ? { registryId: registryId.trim().toUpperCase() }
      : Object.fromEntries(
          Object.entries(values)
            .map(([k, v]) => [k, v.trim()])
            .filter(([, v]) => v)
        );
    if (Object.keys(search).length === 0) {
      setError('Enter a registry ID, or fill in at least one of the other fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await searchRegistry(config.key, search));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    const [one, many] = config.resultNoun;
    return (
      <>
        {results.records.length === 0 ? (
          <Card style={styles.section}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>No {many} found</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>{results.message}</Text>
          </Card>
        ) : (
          <>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {results.records.length === 1 ? `1 ${one} found` : `${results.records.length} ${many} found`}
            </Text>
            {results.records.map((r) => (
              <RegistryCard key={r.registryId} record={r} style={styles.section} />
            ))}
          </>
        )}
        <Button title="New search" onPress={() => setResults(null)} />
      </>
    );
  }

  return (
    <>
      <Text style={[styles.intro, { color: colors.textMuted }]}>{config.searchIntro}</Text>

      {error && <ErrorMessage message={error} />}

      <TextField
        label="Registry ID"
        value={registryId}
        onChangeText={setRegistryId}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder={`${config.idPrefix}-…`}
        style={{ fontFamily: monoFont }}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        editable={!loading}
      />

      <Text style={[styles.or, { color: colors.textSubtle }]}>or search by</Text>
      {config.searchFields.map((field) => (
        <TextField
          key={field.name}
          label={field.label}
          value={values[field.name] ?? ''}
          onChangeText={(v) => setValues((s) => ({ ...s, [field.name]: v }))}
          autoCapitalize={field.mono ? 'none' : 'words'}
          autoCorrect={field.mono ? false : undefined}
          placeholder={field.placeholder}
          style={field.mono ? { fontFamily: monoFont } : undefined}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          editable={!loading && !registryId}
        />
      ))}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : (
        <Button title="Search" onPress={handleSearch} style={styles.action} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  or: { fontSize: 13, marginTop: 20 },
  action: { marginTop: 20 },
  loading: { marginTop: 24 },
  section: { marginBottom: 16 },
  count: { fontSize: 13, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 },
});
