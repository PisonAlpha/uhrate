import { View, ScrollView, KeyboardAvoidingView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/theme';

const PADDING = 24;

interface ScreenProps {
  children: ReactNode;
  /** Grey background used in the signed-in area, so cards stand out. */
  muted?: boolean;
  /**
   * For screens with text inputs: content scrolls, moves up out of the
   * keyboard's way, and tapping outside an input closes the keyboard.
   */
  form?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Themed full-screen container. Padding includes the safe-area insets, so
// content clears the notch, status bar and gesture bar.
export function Screen({ children, muted = false, form = false, style }: ScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const backgroundColor = muted ? colors.backgroundMuted : colors.background;
  const padding = {
    paddingTop: insets.top + PADDING,
    paddingBottom: insets.bottom + PADDING,
    paddingLeft: insets.left + PADDING,
    paddingRight: insets.right + PADDING,
  };

  if (!form) {
    return <View style={[styles.fill, { backgroundColor }, padding, style]}>{children}</View>;
  }

  // 'padding' only adds space where the keyboard actually covers the view,
  // so it is also correct on Android, where the window may already resize.
  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.fill, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={[styles.grow, padding, style]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});
