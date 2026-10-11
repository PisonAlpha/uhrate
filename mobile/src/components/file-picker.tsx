import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { fileSizeError, formatFileSize, pickDocument, pickFromLibrary, type PickedFile } from '@/lib/file-picker';
import { ErrorMessage } from '@/components/error-message';
import { useColors } from '@/theme';

interface FilePickerProps {
  file: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  /** Largest file accepted, in MB. Matches the web page for the same feature. */
  maxSizeMB?: number;
  disabled?: boolean;
}

// Mobile replacement for the web's drag-and-drop uploader: choose one file
// from the gallery or the file browser, then see what was picked.
export function FilePicker({ file, onChange, maxSizeMB = 50, disabled = false }: FilePickerProps) {
  const colors = useColors();
  const [error, setError] = useState<string | null>(null);

  const choose = async (pick: () => Promise<PickedFile | null>) => {
    setError(null);
    try {
      const picked = await pick();
      if (!picked) return;
      const sizeError = fileSizeError(picked, maxSizeMB);
      if (sizeError) {
        setError(sizeError);
        return;
      }
      onChange(picked);
    } catch {
      setError("Couldn't open that file. Please try another one.");
    }
  };

  return (
    <View>
      {error && <ErrorMessage message={error} />}

      {file ? (
        <View style={[styles.selected, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {file.isImage ? (
            <Image source={{ uri: file.uri }} style={[styles.thumb, { backgroundColor: colors.neutralBackground }]} />
          ) : (
            <View style={[styles.thumb, styles.iconThumb, { backgroundColor: colors.neutralBackground }]}>
              <Ionicons name={fileIcon(file.type)} size={26} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
              {file.name}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
              {[file.size !== null ? formatFileSize(file.size) : null, file.type].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <Pressable
            onPress={() => onChange(null)}
            disabled={disabled}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Remove file"
          >
            <Ionicons name="close-circle" size={24} color={colors.textSubtle} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.options}>
          <Option icon="images-outline" label="Photos & videos" onPress={() => choose(pickFromLibrary)} disabled={disabled} />
          <Option icon="folder-open-outline" label="Files" onPress={() => choose(pickDocument)} disabled={disabled} />
        </View>
      )}

      <Text style={[styles.hint, { color: colors.textSubtle }]}>One file, any type, up to {maxSizeMB} MB.</Text>
    </View>
  );
}

function Option({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.option,
        { borderColor: colors.borderStrong, backgroundColor: colors.card },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Ionicons name={icon} size={26} color={colors.text} />
      <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function fileIcon(mimeType: string): ComponentProps<typeof Ionicons>['name'] {
  if (mimeType.startsWith('video/')) return 'videocam-outline';
  if (mimeType.startsWith('audio/')) return 'musical-notes-outline';
  if (mimeType === 'application/pdf') return 'document-text-outline';
  return 'document-outline';
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  // Full width so Android doesn't clip the bold label (see Button).
  optionLabel: { fontSize: 13, fontWeight: '600', alignSelf: 'stretch', textAlign: 'center' },
  dimmed: { opacity: 0.7 },
  selected: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12 },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  iconThumb: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  hint: { fontSize: 12, marginTop: 10 },
});
