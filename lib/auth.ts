import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

const ALGORITHM = 'HS256';
const TOKEN_EXPIRY = '7d';

function getSecretKey(): Uint8Array {
  const secret = process.env.UHRATE_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'UHRATE_AUTH_SECRET environment variable is required to sign or verify authentication tokens.'
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AuthTokenSubject {
  id: string;
  email: string;
}

/**
 * Signs a mobile/API access token for the given user.
 * Throws if UHRATE_AUTH_SECRET is not configured.
 * Callers should allow the error to propagate rather than returning
 * a successful authentication response without a token.
 */
export async function signAuthToken(user: AuthTokenSubject): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secretKey);
}

export type AuthIdentity =
  | { status: 'authenticated'; userId: string; email: string }
  | { status: 'invalid' }
  | { status: 'anonymous' };

/**
 * Resolves the caller's identity from an Authorization: Bearer <token> header.
 *
 * - No Authorization header at all  -> 'anonymous' (callers may fall back to
 *   the existing client-supplied-email behavior, for web compatibility).
 * - Header present but the token is missing/malformed/expired/wrong-algorithm
 *   -> 'invalid' (callers MUST reject with 401 and must NOT fall back to any
 *   client-supplied identity — a bad token is never treated as "no token").
 * - Header present with a valid token -> 'authenticated', and that identity
 *   must take precedence over any client-supplied email/userId.
 */
export async function resolveAuthIdentity(request: NextRequest): Promise<AuthIdentity> {
  const header = request.headers.get('authorization');
  if (!header) {
    return { status: 'anonymous' };
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { status: 'invalid' };
  }

  const token = match[1];

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: [ALGORITHM] });

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      return { status: 'invalid' };
    }

    return { status: 'authenticated', userId: payload.sub, email: payload.email };
  } catch {
    // Signature invalid, expired, wrong algorithm, malformed, or secret missing —
    // all treated identically as 'invalid'. Never log the token itself here.
    return { status: 'invalid' };
  }
}
