import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Outline icon normally, filled icon for the active tab.
function tabIcon(outline: IconName, filled: IconName) {
  return function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
  };
}

// Authenticated area. Reachable only while signed in — see the
// Stack.Protected guards in the root layout (src/app/_layout.tsx).
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e5e7eb' },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen
        name="verify"
        options={{ title: 'Verify', tabBarIcon: tabIcon('shield-checkmark-outline', 'shield-checkmark') }}
      />
      <Tabs.Screen name="registry" options={{ title: 'Registry', tabBarIcon: tabIcon('library-outline', 'library') }} />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person-circle-outline', 'person-circle') }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: tabIcon('ellipsis-horizontal-circle-outline', 'ellipsis-horizontal-circle') }}
      />
    </Tabs>
  );
}
