---
meta:
  contentType: How-to
---

# Verify the private Mirror pilot

Run these checks before sharing a release candidate. The pilot contains Greeting, Mirror, saved words, and Settings. Pulse and Gathering are absent from navigation; their old routes redirect to Mirror. Sound playback and preference-specific interventions remain deferred.

## Run repeatable checks

Use the Node runtime that supports the locked Vite version, then run:

```sh
npm ci
npx playwright install chromium firefox webkit
npm test
npm run lint
npm audit
git diff --check
```

`npm test` builds the production app and starts an isolated preview on port 4185. Keep that port free. The suite creates isolated browser storage, uses synthetic writing, and disables screenshots, traces, and video. Test reports are ignored by Git. Never run checks against a participant’s browser profile or substitute real private writing.

The suite verifies action-button eligibility, Greeting handoff, draft protection, response focus, save/remove/reload, identifier-only storage, legacy migration, reset, unavailable storage, cross-tab settings, background-only canvas movement, Settings focus restoration, appearance persistence, responsive layouts, reduced motion, and automated accessibility checks. Production service-worker tests serve the real bundle from isolated local HTTP servers with the supplied security headers. They exercise offline reload, explicit update acceptance, multi-tab draft preservation, failed updates, and rollback by changing the candidate HTML and precache revision.

These local checks do not verify an actual deployment, installed mobile browsers, or screen-reader announcements.

## Complete manual accessibility checks

1. Use keyboard only to select and clear feelings, continue from Home, enter Mirror from the toolbar, write, release, save, remove, and clear device data.
2. Check both appearance modes. Confirm the dark canvas uses `#171717`, the writing field stays white before and after focus, and its border highlights on focus. Confirm the toolbar and unselected pills stay white with readable text and icons.
3. On Home, confirm Continue is disabled with no feelings and enabled after selection. In Mirror, confirm Release is disabled with empty or whitespace-only writing and no feelings. Confirm writing, selecting a feeling, or choosing **Just let me release** enables it; clearing the last input disables it again unless quiet release is selected.
4. Switch between **Gentle words** and **Just let me release**. Confirm the indicator slides, selection is announced, and reduced motion suppresses the transition.
5. With VoiceOver and Safari, repeat those actions. Confirm that the writing label, mood selection state, response heading, save status, and dialog names are announced once and intelligibly.
6. Open each dialog. Confirm focus stays inside it, cancellation comes first, Escape cancels, and focus returns to the trigger or writing.
7. Use 200% browser zoom and 400% zoom on a desktop viewport. Confirm readable content, visible controls, and no horizontal scrolling at the equivalent 320 CSS-pixel width.
8. Enable reduced motion, reduced transparency, and increased contrast separately. Confirm that every action still provides readable feedback.
9. Repeat core flows on the agreed physical iPhone/iPad, Android device, and intended desktop browsers. Record OS, browser, device, and findings.

Manual screen-reader completion and physical-device checks remain pending until a tester records them.

## Measure performance

Record device model, browser version, network conditions, cold/warm cache, and reduced-motion setting. Measure first usable render, release acknowledgment at the 95th percentile, and animation frame timing. Compare with the product’s proposed 1.2-second cold start, 300-millisecond acknowledgment, and 60-frame-per-second targets. Headless desktop measurements are diagnostic evidence, not proof of physical-phone performance.

## Check privacy and storage

Use a unique synthetic sentence and verify it does not occur in requests, logs, localStorage, sessionStorage, IndexedDB, or telemetry. Inspect stored saved words: each record contains only a curated response identifier. Confirm reset removes saved words and preferences, retains the migration marker, and preserves unrelated browser storage. Browser memory clearing is a visual release metaphor, not a secure erasure guarantee.

## Deploy and recover

The `dist` output includes `_headers` and `_redirects` for a static host that supports those files. For another host, translate the same headers and single-page fallback into its configuration. Vite preview does not apply `_headers`; the PWA test server applies them explicitly.

1. Record the deployed commit, build artifact, host, support owner, incident owner, and last working artifact.
2. Deploy the reviewed artifact to a preview environment. Verify HTTPS, security headers, direct `/mirror` and `/settings` entry, icons, installation, and manifest.
3. Install or load online, close and reopen offline, then write, release, save, and reload offline.
4. Publish a second candidate. Confirm the app offers an update without reloading a writing tab. Accept from Settings and confirm the new version loads.
5. Keep another tab writing during acceptance. Confirm its draft remains and its update remains a deliberate action.
6. Simulate an unavailable update asset. Confirm the existing app and writing remain usable, then restore the asset and retry.
7. Restore the recorded previous artifact. Accept its service-worker update and repeat the core flow. Preserve the working browser cache while rolling back; do not ask participants to clear storage as a routine recovery step.

The current Content Security Policy permits inline styles because the app uses dynamic style properties. Scripts, workers, fonts, connections, and assets remain restricted to the same origin; framing, object embedding, form submission, camera, microphone, and geolocation are disabled.

## Approve release

Obtain the human editorial approval described in [Approve Mirror acknowledgments](content-review.md). Record the manual checks, deployed-host results, performance measurements, responsible owners, known limits, and pilot go/no-go. Build success and automated scans alone do not establish release readiness.
