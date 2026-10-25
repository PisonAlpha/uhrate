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

## Builds (EAS)

Profiles are in `eas.json`. The app ID is `online.uhrate.app` (Android package
and iOS bundle ID; it can never change after the first store upload).

| Profile | What it makes | API |
|---|---|---|
| `development` | APK with the Expo dev client, for testing native features Expo Go can't (app icon, splash, deep links) | whatever Metro serves, from `.env.local` |
| `preview` | installable APK, same as the store build | `https://uhrate.online` |
| `production` | Play Store app bundle, version code increased automatically | `https://uhrate.online` |

Preview and production builds don't read `.env.local`. They set the API
address and turn on-chain payments and testnet off (`EXPO_PUBLIC_ENABLE_ONCHAIN`,
`EXPO_PUBLIC_ENABLE_TESTNET`). The Reown project ID comes from EAS
environment variables, once per environment:

```bash
npm install -g eas-cli
eas login
eas init                      # links the app to the Expo project
eas env:create --name EXPO_PUBLIC_REOWN_PROJECT_ID --value <id> --environment preview --environment production --visibility plaintext
eas build --platform android --profile preview
```

The development profile also needs `npx expo install expo-dev-client`.
Android signing keys are created and kept by EAS on the first build. The
production API must run this branch's server changes (bearer-token auth)
before builds pointed at it can log in.

See `.env.example` for every setting.

## Layout

- `src/app/` — screens (file-based routes)
- `src/context/AuthContext.tsx` — auth state; screens use `useAuth()`
- `src/services/` — typed API client and auth endpoints
- `src/lib/secureStorage.ts` — token storage (expo-secure-store)
- `src/types/` — API response types
