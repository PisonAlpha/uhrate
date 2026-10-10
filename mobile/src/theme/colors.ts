// Color tokens for light and dark mode. Screens and components read these
// through useColors() instead of hard-coding hex values.
export const lightColors = {
  background: '#ffffff',
  backgroundMuted: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  primary: '#000000',
  onPrimary: '#ffffff',
  danger: '#dc2626',
  dangerBackground: '#fef2f2',
  dangerBorder: '#fecaca',
  success: '#15803d',
  successBackground: '#dcfce7',
  neutralBackground: '#f3f4f6',
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  background: '#0a0a0a',
  backgroundMuted: '#0a0a0a',
  card: '#171717',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textSubtle: '#6b7280',
  border: '#262626',
  borderStrong: '#404040',
  primary: '#ffffff',
  onPrimary: '#000000',
  danger: '#f87171',
  dangerBackground: '#2a1215',
  dangerBorder: '#7f1d1d',
  success: '#4ade80',
  successBackground: '#052e16',
  neutralBackground: '#262626',
};
