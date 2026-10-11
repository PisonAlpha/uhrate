import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/card';
import { Pill } from '@/components/pill';
import { monoFont, useColors } from '@/theme';
import type { RegistryRecord } from '@/types/lookup';

// A registry entry (document, education, legal or media) as found by a lookup.
export function RegistryCard({ record, style }: { record: RegistryRecord; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();

  return (
    <Card style={style}>
      <Pill
        label={record.valid === false ? 'Marked invalid' : '✓ Registered on UHRATE'}
        tone={record.valid === false ? 'danger' : 'success'}
        style={styles.headPill}
      />
      <Text style={[styles.cardTitle, { color: colors.text }]}>{record.title}</Text>
      <RecordRow label="Registry ID" value={record.registryId} mono />
      {record.fields.map((f) => (
        <RecordRow key={f.label} label={f.label} value={f.value} />
      ))}
      <RecordRow label="Registered" value={formatDate(record.registeredAt)} />
      {record.tx && <RecordRow label={`On-chain${record.chain ? ` (${record.chain})` : ''}`} value={record.tx} mono />}
    </Card>
  );
}

// Label above value, separated from the row before by a line. `mono` is for
// IDs and hashes, which can also be selected and copied.
export function RecordRow({
  label,
  value,
  mono = false,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderTopColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[mono ? styles.mono : styles.value, { color: color ?? colors.text }]} selectable={mono}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headPill: { marginTop: 0, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  row: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  label: { fontSize: 12, marginTop: 4 },
  value: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  mono: { fontSize: 13, fontWeight: '600', marginTop: 2, fontFamily: monoFont },
});
