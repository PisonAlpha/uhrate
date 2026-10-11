import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { EducationRegister } from '@/components/education-register';
import { EducationVerify } from '@/components/education-verify';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';

type Mode = 'register' | 'verify';

// Education registry (roadmap D25), opened from the Registry tab. Mobile
// version of the web's /education page.
export default function Education() {
  const [mode, setMode] = useState<Mode>('register');

  return (
    <Screen muted form>
      <PageHeader title="Education registry" />
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
        <EducationRegister />
      </View>
      <View style={mode !== 'verify' && styles.hidden}>
        <EducationVerify />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switch: { marginBottom: 16 },
  hidden: { display: 'none' },
});
