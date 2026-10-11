import { View, Text, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { BrandHeader } from '@/components/brand-header';
import { Card } from '@/components/card';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { useColors } from '@/theme';

// Branded placeholder for tabs whose features are not built yet. `children`
// render below the card, for parts that already work.
export function ComingSoon({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  const colors = useColors();

  return (
    <Screen muted scroll>
      <View style={styles.header}>
        <BrandHeader />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Card>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        <Pill label="Coming soon" />
      </Card>
      {children && <View style={styles.extra}>{children}</View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  description: { fontSize: 14, lineHeight: 20 },
  extra: { marginTop: 16 },
});
