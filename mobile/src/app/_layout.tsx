// Polyfills WalletConnect needs (crypto, TextEncoder, URL, Buffer). Must be
// the first import in the app.
import '@walletconnect/react-native-compat';
import { useEffect } from 'react';
import { LogBox, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { AppKit, AppKitProvider, useAppKitTheme } from '@reown/appkit-react-native';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useNavigationTheme } from '@/theme';
import { appKit } from '@/wallet/appkit';

// Keep the splash screen up until the stored token has been read, so neither
// the signed-in nor the signed-out area flashes on launch.
SplashScreen.preventAutoHideAsync();

// AppKit still passes WalletConnect the old requiredNamespaces option, which
// WalletConnect converts itself. Harmless, but it warns on every connect.
LogBox.ignoreLogs(['requiredNamespaces are deprecated']);

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemeProvider value={useNavigationTheme()}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppKitProvider instance={appKit}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
        <WalletModal dark={isDark} />
      </AppKitProvider>
    </ThemeProvider>
  );
}

// The wallet picker, drawn above every screen. The full-size wrapper is
// Reown's fix for the modal not opening under Expo Router on Android.
function WalletModal({ dark }: { dark: boolean }) {
  const { setThemeMode } = useAppKitTheme();
  useEffect(() => setThemeMode(dark ? 'dark' : 'light'), [dark, setThemeMode]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <AppKit />
    </View>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  // Single auth boundary for the app. When isAuthenticated changes (login,
  // logout, or a 401 handled in services/api.ts), the router moves the user
  // to the first screen they are allowed to see — screens never redirect
  // themselves.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}
