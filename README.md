# Aura

Aura is a private expression prototype for adults. The Mirror pilot lets you write, choose optional feelings, release privately, and save curated words. The acknowledgment bank remains draft content pending human editorial approval.

## Pilot scope

- Greeting passes optional moods into Mirror through memory.
- Mirror writing stays in memory and has no server, AI, telemetry, or history path.
- Saved words store curated response identifiers only.
- Settings opens over the current scene, saves device preferences, supports reduced motion, and clears local Aura data.
- Canvas tools move and scale only the dotted background; content stays fixed. Light and dark appearance are saved on this device.
- Offline Mirror works after the first successful online load. App updates require an explicit action in Settings.

Pulse and Gathering remain future work and are hidden from pilot navigation. Sound playback is unavailable. Mirror starts each expression with Gentle words. Quiet release is an explicit choice in Mirror; Settings support choices record interest in future features.

## Develop

The verified runtime is Node.js 26.10.0. The app uses Vite, React, strict TypeScript, Tailwind CSS v4, Dexie, and vite-plugin-pwa.

```sh
npm ci
npm run dev
```

## Verify

Install browser binaries before the first test run:

```sh
npx playwright install chromium firefox webkit
npm test
npm run lint
npm audit
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check app, configuration, and tests; build production assets |
| `npm test` | Build and run browser regression, accessibility, PWA, and desktop diagnostic checks |
| `npm run lint` | Run OXLint |
| `npm run preview` | Serve the production build locally |

The tests need port 4185 and isolated browser storage. Screenshots, traces, and video are disabled; generated reports are ignored by Git. Use synthetic writing only.

## Prepare a pilot release

Follow [Verify the private Mirror pilot](docs/verify-pilot.md) for privacy checks, manual accessibility work, host configuration, update recovery, and release evidence. Use [Approve Mirror acknowledgments](docs/content-review.md) to record human content approval.

Automated checks do not replace VoiceOver testing, physical-device measurements, installed-browser verification, or live-host checks. No production deployment is recorded by this repository change.
