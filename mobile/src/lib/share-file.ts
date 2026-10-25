import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Mobile replacement for the web's "Download" buttons, which save a JSON or
// CSV file in the browser. Here the file is written to the app's cache and
// handed to the share sheet, where the user can save it to Files or Drive,
// email it, or send it to another app.

/** Thrown when the phone has no share sheet (shouldn't happen on a real device). */
export class SharingUnavailableError extends Error {}

async function shareFile(name: string, content: string, mimeType: string, uti: string, title: string) {
  if (!(await Sharing.isAvailableAsync())) throw new SharingUnavailableError();
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType, UTI: uti, dialogTitle: title });
}

/** Shares `data` as a pretty-printed .json file, as the web downloads it. */
export function shareJson(name: string, data: unknown, title: string) {
  return shareFile(name, JSON.stringify(data, null, 2), 'application/json', 'public.json', title);
}

/** Shares rows as a .csv file. Every cell is quoted, as on the web. */
export function shareCsv(name: string, rows: string[][], title: string) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  return shareFile(name, csv, 'text/csv', 'public.comma-separated-values-text', title);
}

/** Message for a failed share. Closing the share sheet is not an error. */
export function shareErrorMessage(err: unknown): string {
  if (__DEV__) console.warn('Share failed:', err);
  return err instanceof SharingUnavailableError
    ? "Sharing isn't available on this device."
    : "Couldn't create the file. Please try again.";
}
