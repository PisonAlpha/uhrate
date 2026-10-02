/**
 * Base URL for the existing UHRATE Next.js API.
 *
 * Set EXPO_PUBLIC_API_URL in mobile/.env.local (git-ignored) to point the app
 * at a different backend without editing code, e.g.:
 *
 *   EXPO_PUBLIC_API_URL=https://your-tunnel.trycloudflare.com
 *
 * Restart `expo start` after changing it — the value is inlined at bundle time.
 * EXPO_PUBLIC_* values are embedded in the app and readable by anyone, so never
 * put secrets here.
 *
 * Falls back to http://localhost:3000 when unset:
 * - iOS simulator: localhost works as-is (simulator shares the host network).
 * - Android emulator: use http://10.0.2.2:3000 instead — "localhost" on the emulator
 *   refers to the emulator itself, not your dev machine.
 * - Physical device: use your dev machine's LAN IP (e.g. http://192.168.1.23:3000)
 *   or a tunnel URL.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
