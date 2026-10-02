import * as SecureStore from 'expo-secure-store';

// Single source of truth for reading/writing the auth token. Nothing else
// in the app should call expo-secure-store directly for this key — go
// through AuthContext (src/context/AuthContext.tsx), which is the only
// caller of these functions.
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
