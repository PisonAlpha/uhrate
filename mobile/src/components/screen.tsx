import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useColors } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Grey background used in the signed-in area, so cards stand out. */
  muted?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Themed full-screen container with the standard padding.
export function Screen({ children, muted = false, style }: ScreenProps) {
  const colors = useColors();
  return (
    <View style={[styles.screen, { backgroundColor: muted ? colors.backgroundMuted : colors.background }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24 },
});
