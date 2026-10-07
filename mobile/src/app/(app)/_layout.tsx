import { Stack } from 'expo-router';

// Authenticated area. Reachable only while signed in — see the
// Stack.Protected guards in the root layout (src/app/_layout.tsx).
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
