import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PageHeader } from '@/components/page-header';
import { RegistryRegister } from '@/components/registry-register';
import { RegistrySearch } from '@/components/registry-search';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import type { RegistryConfig } from '@/registries/types';

type Mode = 'register' | 'verify';

// A registry's page, opened from the Registry tab: Register | Verify, as on
// the web's /education, /legal and /media pages.
export function RegistryPage({ config }: { config: RegistryConfig }) {
  const [mode, setMode] = useState<Mode>('register');

  return (
    <Screen muted form>
      <PageHeader title={config.title} />
      <View style={styles.switch}>
        <SegmentedControl
          options={[
            { value: 'register', label: 'Register' },
            { value: 'verify', label: 'Verify' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </View>

      {/* Both stay mounted, so switching keeps a half-filled form. */}
      <View style={mode !== 'register' && styles.hidden}>
        <RegistryRegister config={config} />
      </View>
      <View style={mode !== 'verify' && styles.hidden}>
        <RegistrySearch config={config} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switch: { marginBottom: 16 },
  hidden: { display: 'none' },
});
