import { api } from '@/services/api';

// Developer API keys (app/api/developer/*). All read the user from the token.

export interface ApiKey {
  id: string;
  key_name: string;
  /** Masked by the server: the first 12 and last 4 characters. */
  api_key: string;
  calls_used: number;
  calls_limit: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

/** Every key the user has made, newest first, revoked ones included. */
export async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await api.get<{ success: true; keys: ApiKey[] }>('/api/developer/keys', { auth: true });
  return response.keys;
}

/** Makes a key. The full key is in the response only; save it then. */
export function generateApiKey(keyName: string) {
  return api.post<{ success: true; api_key: string; key_name: string; calls_limit: number }>(
    '/api/developer/generate-key',
    { keyName },
    { auth: true }
  );
}

/** Revokes a key. It stays in the list as inactive. */
export async function revokeApiKey(id: string): Promise<void> {
  await api.delete(`/api/developer/keys?id=${encodeURIComponent(id)}`, { auth: true });
}
