import { View, Text, StyleSheet } from 'react-native';
import { BrandHeader } from '@/components/brand-header';
import { Card } from '@/components/card';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// Branded placeholder for tabs whose features are not built yet.
export function ComingSoon({ title, description }: { title: string; description: string }) {
  const colors = useColors();

  return (
    <Screen muted style={styles.container}>
      <View style={styles.header}>
        <BrandHeader />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Card>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        <Pill label="Coming soon" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 72 },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  description: { fontSize: 14, lineHeight: 20 },
});
