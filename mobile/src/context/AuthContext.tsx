import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredToken, setStoredToken, clearStoredToken } from '@/lib/secureStorage';
import { loginRequest, registerRequest } from '@/services/auth';
import type { AuthUser } from '@/types/auth';

/**
 * Centralized mobile authentication state. Screens must use `useAuth()`
 * rather than reading SecureStore directly, so the storage/refresh/
 * revocation strategy can change later (token refresh, server-side
 * revocation, etc.) without touching every screen.
 *
 * Phase 1 scope: stateless JWT only. There is no server-side session to
 * check on startup — a token found in SecureStore is treated as "possibly
 * still valid," and the first authenticated request that actually uses it
 * (see the Home screen) is what confirms or invalidates it via a 401.
 */

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ requiresVerification?: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getStoredToken();
      setHasToken(!!stored);
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    if (result.token) {
      await setStoredToken(result.token);
      setHasToken(true);
    }
    setUser(result.user);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const result = await registerRequest(email, password, fullName);
    if (result.token) {
      await setStoredToken(result.token);
      setHasToken(true);
    }
    setUser(result.user);
    return { requiresVerification: result.requiresVerification, message: result.message };
  }, []);

  const logout = useCallback(async () => {
    // Phase 1 is a stateless JWT: this only removes the token from the
    // device. It does NOT revoke the token server-side — the token remains
    // technically valid until it expires naturally. See Phase 0 design doc.
    await clearStoredToken();
    setHasToken(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: hasToken, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
