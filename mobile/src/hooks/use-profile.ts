import { useCallback, useEffect, useState } from 'react';
import { fetchProfile } from '@/services/auth';
import { ApiError } from '@/services/api';
import type { AuthUser } from '@/types/auth';

/**
 * Loads the signed-in user's profile from /api/profile on mount.
 * `reload` resolves to the fresh profile, or null if the request failed.
 */
export function useProfile() {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const result = await fetchProfile();
      setProfile(result.user);
      setError(null);
      return result.user;
    } catch (err) {
      // A 401 has already ended the session in services/api.ts, and the
      // route guards are taking the user back to the auth flow.
      if (!(err instanceof ApiError && err.status === 401)) {
        setError(err instanceof ApiError ? err.message : 'Failed to load your profile.');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  return { profile, loading, error, reload };
}
