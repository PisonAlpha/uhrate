import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { UploadFile } from '@/services/api';

/** A file the user picked, ready to upload with appendFile (services/api.ts). */
export interface PickedFile extends UploadFile {
  /** Size in bytes, when the picker reports it. */
  size: number | null;
  /** Images get a thumbnail preview. */
  isImage: boolean;
}

// The web uploaders accept any type, one file at a time, so these do too.
// Screens set their own size limit (see fileSizeError).

/** Photos and videos from the device's gallery. Resolves to null if cancelled. */
export async function pickFromLibrary(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    // Upload the original: verification looks at the real file, so it
    // must not be recompressed or cropped.
    quality: 1,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const type = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
  return {
    uri: asset.uri,
    name: asset.fileName ?? nameFromUri(asset.uri),
    type,
    size: asset.fileSize ?? null,
    isImage: type.startsWith('image/'),
  };
}

/** Any file from the device's file browser. Resolves to null if cancelled. */
export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    // Copy into the app's cache so the upload can read it with a file:// URI.
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const type = asset.mimeType ?? 'application/octet-stream';
  return {
    uri: asset.uri,
    name: asset.name || nameFromUri(asset.uri),
    type,
    size: asset.size ?? null,
    isImage: type.startsWith('image/'),
  };
}

/** Error message if the file is over the limit, or null if it's fine (or its size is unknown). */
export function fileSizeError(file: PickedFile, maxMB: number): string | null {
  if (file.size === null || file.size <= maxMB * 1024 * 1024) return null;
  return `This file is ${formatFileSize(file.size)}. The limit is ${maxMB} MB.`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function nameFromUri(uri: string): string {
  return decodeURIComponent(uri.split('/').pop() || 'file');
}
