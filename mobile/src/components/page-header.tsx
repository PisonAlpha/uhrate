import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColors } from '@/theme';

// Back button and title for pages opened above the tabs (e.g. Education).
export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 24, fontWeight: '700' },
});
