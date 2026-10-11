import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/button';
import { ComingSoon } from '@/components/coming-soon';
import { FilePicker } from '@/components/file-picker';
import type { PickedFile } from '@/lib/file-picker';

// Verifying arrives with roadmap D20. File picking (C13) and QR scanning
// (C14) already work, so they are shown here to be tried out.
export default function Verify() {
  const router = useRouter();
  const [file, setFile] = useState<PickedFile | null>(null);

  return (
    <ComingSoon
      title="Verify"
      description="Check any image, video or document for AI generation, deepfakes and manipulation, and get a Digital DNA certificate."
    >
      <FilePicker file={file} onChange={setFile} />
      <Button title="Scan a QR code" variant="secondary" onPress={() => router.push('/scan')} style={styles.scan} />
    </ComingSoon>
  );
}

const styles = StyleSheet.create({
  scan: { marginTop: 16 },
});
