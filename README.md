# MatchUp

Find, organise and manage football friendlies and tournaments. MatchUp is an
adult coach and club-administrator app for iOS and Android.

This repository has been converted from the original Next.js web application to
a **React Native (Expo) + TypeScript + NativeWind + Supabase** mobile app, per
`docs/ARCHITECTURE.md`.

## Stack

- Expo (SDK 58) + Expo Router
- React Native + TypeScript
- NativeWind (Tailwind) for styling
- Supabase (Auth, Postgres, Storage, Realtime) — existing remote project
- TanStack Query, React Hook Form, Zod

## Project layout

```text
app/            Expo Router routes and navigation only
src/
  features/     Feature modules (components, services, schemas)
  components/ui/  Accessible reusable primitives
  lib/          Supabase client, config, query client
  theme/        Colour/radius/spacing tokens
assets/         Logos and images
supabase/       Database assets (deferred; existing project reused)
legacy/         Previous Next.js implementation (reference only, excluded)
```

## Environment

Copy `.env.example` to `.env` and provide the Supabase project values:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
GEOAPIFY_API_KEY=...   # server-side only (Edge Function), never shipped in the app
```

## Scripts

```bash
npm start          # start the Expo dev server
npm run ios        # start on iOS simulator
npm run android    # start on Android emulator
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npm test           # jest
```

## Status

Conversion is in progress. See the phase plan in the task history:
foundation → authentication → clubs/teams → friendlies/matches → tournaments →
chat/activity/profile → hardening.
