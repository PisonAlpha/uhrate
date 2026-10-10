import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useNavigationTheme } from '@/theme';

// Keep the splash screen up until the stored token has been read, so neither
// the signed-in nor the signed-out area flashes on launch.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemeProvider value={useNavigationTheme()}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
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
