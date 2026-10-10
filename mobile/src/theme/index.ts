import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { darkColors, lightColors, type ThemeColors } from './colors';

export type { ThemeColors };

/** Colors for the device's current light/dark setting (app.json: automatic). */
export function useColors(): ThemeColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

/** Navigator theme, so screen backgrounds and transitions match the app colors. */
export function useNavigationTheme(): Theme {
  const isDark = useColorScheme() === 'dark';
  const base = isDark ? DarkTheme : DefaultTheme;
  const colors = isDark ? darkColors : lightColors;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };
}
