import * as SecureStore from 'expo-secure-store';

// Single source of truth for reading/writing the auth token. Nothing else
// in the app should call expo-secure-store directly for this key. Callers:
// AuthContext (src/context/AuthContext.tsx) for login/logout, and the API
// client (src/services/api.ts) to attach the token and clear it on a 401.
const TOKEN_KEY = 'uhrate_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore can throw on some devices/states (e.g. no keychain access yet).
    // Treat as "no token" rather than crashing the app.
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  // Never log `token` here or anywhere else in the app.
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
