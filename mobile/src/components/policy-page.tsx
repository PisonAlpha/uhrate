import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';
import type { Policy } from '@/content/types';

// A legal text (Privacy Policy, Terms of Service) copied from the website,
// with a way to reach the team at the end.
export function PolicyPage({ policy }: { policy: Policy }) {
  const router = useRouter();
  const colors = useColors();

  return (
    <Screen muted scroll>
      <PageHeader title={policy.title} />
      <Text style={[styles.updated, { color: colors.textMuted }]}>Last updated: {policy.updated}</Text>
      {policy.sections.map((section) => (
        <Card key={section.heading} style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>{section.heading}</Text>
          {section.paragraphs.map((p) => (
            <Text key={p.slice(0, 40)} style={[styles.paragraph, { color: colors.textSecondary }]}>
              {p}
            </Text>
          ))}
        </Card>
      ))}
      <Button title="Contact us" variant="secondary" onPress={() => router.push('/contact')} style={styles.action} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  updated: { fontSize: 13, marginBottom: 12 },
  section: { padding: 20, marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  paragraph: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  action: { marginTop: 12 },
});
