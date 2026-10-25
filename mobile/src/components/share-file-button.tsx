import { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { shareErrorMessage } from '@/lib/share-file';
import { Button } from '@/components/button';
import { ErrorMessage } from '@/components/error-message';

// Button that builds a file (shareJson / shareCsv in lib/share-file.ts) and
// opens the share sheet, showing its own error if that fails.
export function ShareFileButton({
  title,
  onShare,
  variant = 'secondary',
  style,
}: {
  title: string;
  onShare: () => Promise<void>;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setSharing(true);
    setError(null);
    try {
      await onShare();
    } catch (err) {
      setError(shareErrorMessage(err));
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={style}>
      {error && <ErrorMessage message={error} />}
      <Button title={title} variant={variant} onPress={handlePress} loading={sharing} />
    </View>
  );
}
