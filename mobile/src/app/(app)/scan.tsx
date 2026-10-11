import { useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { lookupCodeLabel, parseLookupCode, type LookupCode } from '@/lib/lookup-code';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { monoFont, useColors } from '@/theme';

type ScanResult = { code: LookupCode } | { unrecognized: string };

// Full-screen QR scanner for UHRATE certificate and registry codes (roadmap
// C14). "Look up" returns to the Verify tab's Look up panel (D23) with the code.
export default function Scan() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);

  const lookUp = (code: LookupCode) => {
    // `t` makes each hand-over distinct, so scanning the same code twice still runs it.
    router.dismissTo({ pathname: '/verify', params: { code: code.value, t: String(Date.now()) } });
  };

  const handleScanned = ({ data }: BarcodeScanningResult) => {
    const code = parseLookupCode(data);
    setResult(code ? { code } : { unrecognized: data });
  };

  // Permission state is still loading.
  if (!permission) return <View style={[styles.fill, { backgroundColor: colors.background }]} />;

  if (!permission.granted) {
    return (
      <Screen style={styles.centered}>
        <Ionicons name="camera-outline" size={40} color={colors.textMuted} />
        <Text style={[styles.title, { color: colors.text }]}>Camera access needed</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          UHRATE uses the camera to scan certificate QR codes. Nothing is recorded.
        </Text>
        <View style={styles.actions}>
          {permission.canAskAgain ? (
            <Button title="Allow camera" onPress={requestPermission} />
          ) : (
            <Button title="Open Settings" onPress={() => Linking.openSettings()} />
          )}
          <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={[styles.fill, styles.cameraBackground]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        // Stop reading codes while a result is on screen.
        onBarcodeScanned={result ? undefined : handleScanned}
      />

      <View style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
          style={styles.close}
        >
          <Ionicons name="close" size={28} color="#ffffff" />
        </Pressable>

        <View style={styles.frame} />

        {result ? (
          <Card style={styles.result}>
            {'code' in result ? (
              <>
                <Text style={[styles.resultLabel, { color: colors.textMuted }]}>{lookupCodeLabel(result.code)}</Text>
                <Text style={[styles.code, { color: colors.text }]} selectable>
                  {result.code.value}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Not a UHRATE code</Text>
                <Text style={[styles.body, styles.note, { color: colors.textMuted }]} numberOfLines={3}>
                  This QR code doesn't contain a UHRATE certificate ID, registry ID or file fingerprint.
                </Text>
              </>
            )}
            <View style={styles.actions}>
              {'code' in result ? (
                <>
                  <Button title="Look up" onPress={() => lookUp(result.code)} />
                  <Button title="Scan again" variant="secondary" onPress={() => setResult(null)} />
                </>
              ) : (
                <>
                  <Button title="Scan again" onPress={() => setResult(null)} />
                  <Button title="Done" variant="secondary" onPress={() => router.back()} />
                </>
              )}
            </View>
          </Card>
        ) : (
          <Text style={styles.hint}>Point the camera at a UHRATE certificate QR code</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // The camera view is always dark, whatever the app theme.
  cameraBackground: { backgroundColor: '#000000' },
  overlay: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', alignItems: 'center' },
  close: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: '#ffffff', borderRadius: 24 },
  hint: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  result: { alignSelf: 'stretch' },
  resultLabel: { fontSize: 12 },
  resultTitle: { fontSize: 16, fontWeight: '700' },
  code: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: monoFont,
  },
  note: { marginTop: 8 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 16, textAlign: 'center', alignSelf: 'stretch' },
  body: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: 12, marginTop: 20 },
});
