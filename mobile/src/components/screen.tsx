import { View, ScrollView, KeyboardAvoidingView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactElement, ReactNode } from 'react';
import type { RefreshControlProps } from 'react-native';
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
  /** Content scrolls when taller than the screen. Implied by `form`. */
  scroll?: boolean;
  /** Pull-to-refresh, for scrolling screens. */
  refreshControl?: ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
}

// Themed full-screen container. Padding includes the safe-area insets, so
// content clears the notch, status bar and gesture bar.
export function Screen({ children, muted = false, form = false, scroll = false, refreshControl, style }: ScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const backgroundColor = muted ? colors.backgroundMuted : colors.background;
  const padding = {
    paddingTop: insets.top + PADDING,
    paddingBottom: insets.bottom + PADDING,
    paddingLeft: insets.left + PADDING,
    paddingRight: insets.right + PADDING,
  };

  if (!form && !scroll) {
    return <View style={[styles.fill, { backgroundColor }, padding, style]}>{children}</View>;
  }

  const scrollView = (
    <ScrollView
      style={[styles.fill, { backgroundColor }]}
      contentContainerStyle={[styles.grow, padding, style]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
  if (!form) return scrollView;

  // 'padding' only adds space where the keyboard actually covers the view,
  // so it is also correct on Android, where the window may already resize.
  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.fill, { backgroundColor }]}>
      {scrollView}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});
