import { View, Text, StyleSheet } from 'react-native';

// Branded placeholder for tabs whose features are not built yet.
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>UH</Text>
        </View>
        <Text style={styles.brand}>UHRATE</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming soon</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 24, paddingTop: 72 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMarkText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  brand: { fontSize: 18, fontWeight: '700', color: '#111827' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
  },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 16,
  },
  badgeText: { color: '#374151', fontSize: 12, fontWeight: '600' },
});
