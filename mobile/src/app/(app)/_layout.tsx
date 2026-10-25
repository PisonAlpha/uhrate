import { Stack } from 'expo-router';

// Authenticated area. Reachable only while signed in — see the
// Stack.Protected guards in the root layout (src/app/_layout.tsx).
// The tabs are the base screen; full-screen pages open above them.
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="education" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="media" />
      <Stack.Screen name="seal" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="developer" />
      <Stack.Screen name="enterprise" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
