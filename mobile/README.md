# UHRATE Mobile

Expo (expo-router) app for UHRATE. It talks to the existing Next.js API in the
repo root using bearer-token auth.

## Setup

```bash
npm install
```

Point the app at a backend by creating `mobile/.env.local` (git-ignored):

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
```

If unset, it falls back to `http://localhost:3000`. See `src/constants/config.ts`
for emulator/device notes. The backend must have `UHRATE_AUTH_SECRET` set so it
can sign tokens.

## Run

```bash
npm start        # Expo dev server
npm run android
npm run ios
```

## Layout

- `src/app/` — screens (file-based routes)
- `src/context/AuthContext.tsx` — auth state; screens use `useAuth()`
- `src/services/` — typed API client and auth endpoints
- `src/lib/secureStorage.ts` — token storage (expo-secure-store)
- `src/types/` — API response types
