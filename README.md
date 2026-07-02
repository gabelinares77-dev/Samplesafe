# SampleSafe

A mobile app for music producers to catalog their sample library and keep track of
clearance / licensing status, so nothing uncleared slips into a release.

Built with [Expo](https://expo.dev) (React Native + TypeScript).

## Features

- **Sample library** — every sample with its title, original source, BPM, key, and tags
- **Clearance tracking** — mark each sample Uncleared, Pending, Cleared, or Royalty-free,
  with color-coded badges throughout the app
- **Search & filter** — find samples by title, source, or tag, and filter by clearance status
- **Notes** — keep clearance contacts, deadlines, and usage details with each sample
- **Offline-first** — everything is stored on-device with AsyncStorage; no account needed

## Getting started

```bash
npm install
npm start
```

Then scan the QR code with the [Expo Go](https://expo.dev/go) app on your phone
(or press `i` / `a` for an iOS/Android simulator).

## Scripts

| Command          | What it does                    |
| ---------------- | ------------------------------- |
| `npm start`      | Start the Expo dev server       |
| `npm run ios`    | Start on the iOS simulator      |
| `npm run android`| Start on an Android emulator    |
| `npm run web`    | Run in the browser              |
| `npm run typecheck` | TypeScript type check        |

## Project structure

```
App.tsx                 Root component: navigation + state + persistence
src/
  types.ts              Sample model and clearance statuses
  theme.ts              Colors, spacing, radii
  storage.ts            AsyncStorage load/save
  seed.ts               First-launch example data
  components/           StatusBadge, TagChip, SampleCard
  screens/              Library, SampleDetail, EditSample
```
