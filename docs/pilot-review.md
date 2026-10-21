---
meta:
  contentType: Reference
---

# Mirror pilot review evidence

The development work is ready for review on `feat/mirror_pilot`. This record distinguishes automated local evidence from human approval and deployed-device checks. It does not authorize a public launch.

## Scope and changes

Greeting now passes moods into Mirror using temporary React state. Continue consumes the handoff; Skip, reload, direct entry, and repeat expression do not reuse stale choices. The unused weight slider is removed for the private pilot because it had no defined effect. Frozen specifications remain unchanged; this scope decision belongs in the Obsidian build plan.

Settings labels future support choices and disables unavailable sound playback. Quiet mode changes Mirror’s default. One root preference session preserves temporary choices across routes when IndexedDB fails; working storage still synchronizes across tabs. Saved words remain identifier-only records.

The pilot navigation contains Mirror and Settings. Legacy social routes redirect to Mirror. Pulse and Gathering source components remain untouched for future work.

Explicit service-worker updates use native controller-change handling. The integration overrides the registration library’s reload callback so another tab’s update cannot force a writing tab to reload. Activated workers claim clients so an accepted update also works on the first app visit. Rollback and failed-update recovery use the production bundle in isolated browser tests.

## Security review

Assessment: no critical or high finding identified in the reviewed private-client scope. This app has no backend routes, authentication, runtime model, or community writes. Backend-specific OWASP checks are outside this candidate’s attack surface.

Source review found no Mirror request endpoint, raw-writing persistence, telemetry, input logging, or HTML injection sink. Tests inspect synthetic writing against observed requests, both IndexedDB tables, browser storage, and history state. Saved records contain only identifiers. Reset failure tests exercise transaction rollback and preservation of unrelated storage.

Static-host configuration restricts scripts, connections, assets, fonts, and workers to the same origin. It disables framing, object embedding, form submission, camera, microphone, and geolocation. Inline styles remain permitted for dynamic visual properties. The local PWA server applies these headers; actual deployed headers still need verification.

## Technical review

Assessment: the private flow has one shared preference owner and no new server or analytics dependency. Browser checks and their configuration are included in TypeScript build checking. Playwright and axe are development dependencies only. Input remains React text, and response selection uses moods and response mode without analyzing writing.

The browser suite covers all seven mood rules and mixed moods, legacy migration, reset rollback, draft protection, saved words, unavailable storage, cross-tab preferences, privacy, offline use, update acceptance, update failure, and rollback. Test fixtures are isolated from participant profiles. Screenshots, video, and traces are disabled; generated reports are Git-ignored.

## Design and Apple design review

Assessment: rose-berry accents, mulberry anchors, ivory surfaces, Fraunces display, and Manrope UI are retained. Screenshots were inspected at desktop and 320-pixel width using synthetic or empty input. Responsive reflow is checked at 320, 375, 768, 1024, and 1440 CSS pixels.

Accessibility fixes include readable dedication and active-navigation text, explicit focus restoration after cancelling device reset, a circular static orb, and solid surfaces for reduced-transparency or increased-contrast preferences. Automated WCAG A/AA scans and reduced-motion checks are included. Full VoiceOver use and physical-device verification remain unperformed.

## Desktop diagnostic measurements

A run on macOS with Node.js 26.10.0 and headless Chromium 156.0.8078.4 used localhost, an unthrottled connection, and a fresh browser context. Twenty synthetic releases produced a 14.7-millisecond 95th-percentile visual acknowledgment. First contentful paint was 112 milliseconds; navigation duration was 72.6 milliseconds. The 95th-percentile requestAnimationFrame interval was 16.7 milliseconds.

These are diagnostic desktop results under concurrent automated test load. Frame intervals measure browser scheduling, not proof of smooth animation on a phone. Reference-device performance and real-network cold-start targets remain open.

## Automated verification result

On 21 October 2026, the full production suite passed 46 checks across Chromium, Firefox, and WebKit. Two performance-test entries were intentionally skipped because the desktop diagnostic runs only in Chromium. Production build, app/configuration/test type checking, lint, dependency audit, and diff whitespace checks passed. The audit reported zero known vulnerabilities.

The checks passed with production security headers in the isolated PWA fixture. Vite preview does not itself enforce those header files. No deployed-host or physical-device success is inferred from these results.

## Human and deployment gates

The following checks remain pending:

- Human approval of each acknowledgment, with approver and approval date.
- Manual VoiceOver completion, browser zoom checks, and reduced-transparency inspection.
- Core flows in installed browsers on agreed physical devices.
- Reference-device loading, acknowledgment, and animation measurements.
- Live HTTPS hosting, header and install verification, and rollback rehearsal on that host.
- Recorded support/incident ownership and a pilot go/no-go decision.

Use [Verify the private Mirror pilot](verify-pilot.md) for the procedure and [Approve Mirror acknowledgments](content-review.md) for the content decision. These checks cannot be marked complete from source review or local headless tests.
