---
meta:
  contentType: Reference
---

# Mirror pilot review evidence

This record describes the private pilot on `feat/mirror_pilot`, including the interface revision of 23 October 2026. It distinguishes automated local evidence from human approval and deployed-device checks. It does not authorize a public launch.

## Scope and changes

Home passes selected feelings into Mirror using temporary React state. Continue requires at least one selection. The toolbar also provides direct Mirror entry without selecting a feeling. Reload and repeat expression do not reuse stale choices. The unused weight slider remains removed for the private pilot because it had no defined effect. Frozen specifications remain unchanged; this scope decision belongs in the Obsidian build plan.

Home and Mirror share `FeelingPicker` and `ClearSelectionButton`. Mirror shows feelings directly, without a selected-count disclosure. Its writing field stays white, with a stronger border on focus. Release remains disabled until writing, a selected feeling, or an explicit quiet-release choice makes it eligible. Whitespace alone does not enable it. Gentle words is the default for every expression, including when legacy preferences contain a quiet choice. The response-style indicator slides between the two choices.

The persistent canvas has an icon-only pill toolbar for Home, Mirror, appearance, and Settings. The dotted background moves and scales independently of the content. Zoom controls are removed from the toolbar; gestures and keyboard shortcuts remain available. Settings opens in a floating dialog over the scene, preserves writing, and restores trigger focus on close. Light and dark appearance are stored on the device.

Settings uses labeled switches with descriptions. Privacy & device and future preferences use the shared accordion; privacy explanations are plain subheadings within it. Future support choices record interest without changing Mirror responses. Sound playback remains unavailable. One root preference session preserves temporary choices across routes when IndexedDB fails; working storage still synchronizes across tabs. Saved words remain identifier-only records.

Legacy social routes redirect to Mirror. Pulse and Gathering source components remain outside pilot navigation.

Explicit service-worker updates use native controller-change handling. The integration overrides the registration library’s reload callback so another tab’s update cannot force a writing tab to reload. Activated workers claim clients so an accepted update also works on the first app visit. Rollback and failed-update recovery use the production bundle in isolated browser tests.

## Security review

Assessment: no critical or high finding identified in the reviewed private-client scope. This app has no backend routes, authentication, runtime model, or community writes. Backend-specific OWASP checks are outside this candidate’s attack surface.

Source review found no Mirror request endpoint, raw-writing persistence, telemetry, input logging, or HTML injection sink. Tests inspect synthetic writing against observed requests, both IndexedDB tables, browser storage, and history state. Saved records contain only identifiers. Reset failure tests exercise transaction rollback and preservation of unrelated storage.

Static-host configuration restricts scripts, connections, assets, fonts, and workers to the same origin. It disables framing, object embedding, form submission, camera, microphone, and geolocation. Inline styles remain permitted for dynamic visual properties. The local PWA server applies these headers; actual deployed headers still need verification.

## Technical review

Assessment: the private flow has one shared preference owner and no new server or analytics dependency. Browser checks and their configuration are included in TypeScript build checking. Playwright and axe are development dependencies only. Input remains React text, and response selection uses moods and response mode without analyzing writing.

The browser suite covers all seven mood rules and mixed moods, legacy migration, reset rollback, draft protection, saved words, unavailable storage, cross-tab preferences, privacy, offline use, update acceptance, update failure, and rollback. Test fixtures are isolated from participant profiles. Screenshots, video, and traces are disabled; generated reports are Git-ignored.

## Design and Apple design review

The interface uses rose-berry accents, deep mulberry, an ivory light canvas, a `#171717` dark canvas, Fraunces display type, and Manrope UI type. White toolbar, unselected feeling pills, and writing-field surfaces retain dark text in both appearance modes. Selected pills retain the primary treatment. Shadows are absent from the toolbar and Settings panel, and dark mode suppresses decorative shadows and glow.

The toolbar has a stadium outline, circular active icons, spaced controls, and tooltips. The footer retains the original Serticode credit and Àyà mí dedication without a divider. Mirror has a larger title; its visible writing-privacy footer and selected-count disclosure are removed. Privacy information remains in Settings and the writing field’s accessible description.

See [Aura interface reference](interface-reference.md) for the implementation rules. Responsive reflow is checked at 320, 375, 768, 1024, and 1440 CSS pixels. Automated WCAG A/AA scans and reduced-motion checks are included. Full VoiceOver use and physical-device verification remain unperformed.

## Desktop diagnostic measurements

A run on macOS with Node.js 26.10.0 and headless Chromium 156.0.8078.4 used localhost, an unthrottled connection, and a fresh browser context. Twenty synthetic releases produced a 14.7-millisecond 95th-percentile visual acknowledgment. First contentful paint was 112 milliseconds; navigation duration was 72.6 milliseconds. The 95th-percentile requestAnimationFrame interval was 16.7 milliseconds.

These are diagnostic desktop results under concurrent automated test load. Frame intervals measure browser scheduling, not proof of smooth animation on a phone. Reference-device performance and real-network cold-start targets remain open.

## Automated verification result

### Interface revision: 23 October 2026

Production build, TypeScript checking, lint, and whitespace checks pass for the interface revision. The targeted Chromium run passes all 15 checks in `mirror.spec.ts`, `canvas.spec.ts`, and `accessibility.spec.ts`. An additional focused run passes the expanded Release eligibility checks for empty writing, whitespace, feeling selection, clearing, and written input.

This evidence covers local browser behavior and automated accessibility. The full cross-browser, privacy, PWA, dependency-audit, and performance suite has not been rerun for this interface revision. The earlier full-suite evidence is retained separately.

### Earlier full-suite baseline: 21 October 2026

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
