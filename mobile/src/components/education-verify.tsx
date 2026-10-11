import { useState } from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { searchCredentials, type CredentialSearch } from '@/services/education';
import { errorMessage } from '@/services/api';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { RegistryCard } from '@/components/record-card';
import { TextField } from '@/components/text-field';
import { monoFont, useColors } from '@/theme';
import type { RegistryRecord } from '@/types/lookup';

// Education > Verify: find registered credentials by registry ID, or by
// student name (optionally narrowed by institution). Free and public.
export function EducationVerify() {
  const colors = useColors();
  const [registryId, setRegistryId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ records: RegistryRecord[]; message: string | null } | null>(null);

  const handleSearch = async () => {
    const search: CredentialSearch = registryId.trim()
      ? { registryId: registryId.trim().toUpperCase() }
      : { studentName: studentName.trim(), institutionName: institutionName.trim() || undefined };
    if (!search.registryId && !search.studentName) {
      setError('Enter a registry ID, or the student’s name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await searchCredentials(search));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <>
        {results.records.length === 0 ? (
          <Card style={styles.section}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>No credentials found</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>{results.message}</Text>
          </Card>
        ) : (
          <>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {results.records.length === 1 ? '1 credential found' : `${results.records.length} credentials found`}
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
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Check that a degree or certificate is registered on UHRATE. Search is free.
      </Text>

      {error && <ErrorMessage message={error} />}

      <TextField
        label="Registry ID"
        value={registryId}
        onChangeText={setRegistryId}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="UEDU-…"
        style={{ fontFamily: monoFont }}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        editable={!loading}
      />

      <Text style={[styles.or, { color: colors.textSubtle }]}>or search by name</Text>
      <TextField
        label="Student name"
        value={studentName}
        onChangeText={setStudentName}
        autoCapitalize="words"
        placeholder="Jane Doe"
        editable={!loading && !registryId}
      />
      <TextField
        label="Institution (optional)"
        value={institutionName}
        onChangeText={setInstitutionName}
        autoCapitalize="words"
        placeholder="University of …"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        editable={!loading && !registryId}
      />

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
