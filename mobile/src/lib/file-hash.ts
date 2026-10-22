import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';

/**
 * SHA-256 of a local file as lowercase hex, the same fingerprint the web
 * computes with crypto.subtle before registering a document.
 */
export async function sha256OfFile(uri: string): Promise<string> {
  const bytes = await new File(uri).bytes();
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
  return toHex(new Uint8Array(digest));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** UTF-8 text as 0x-prefixed hex, for transaction data and personal_sign. */
export function utf8ToHex(text: string): string {
  return '0x' + toHex(new TextEncoder().encode(text));
}
