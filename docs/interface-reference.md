---
meta:
  contentType: Reference
---

# Aura interface reference

Use this reference when changing Aura’s private-pilot interface. It records the implemented canvas, controls, and interaction rules; it does not replace the editorial or release checks in [Mirror pilot review evidence](pilot-review.md).

## Canvas and navigation

The product presents a persistent space with floating content and controls. Only the dotted background pans and scales; headings, writing, and controls retain their size and position. On the background, drag or scroll to pan, use Ctrl/Meta-wheel to zoom, and use `+`, `-`, or `0` to zoom or reset when focus is outside an interactive control. The toolbar has no zoom buttons.

The bottom toolbar uses a white stadium surface with Home, Mirror, appearance, and Settings icons. Icons have accessible names and tooltips. The current route and expanded Settings control use a deep mulberry circular highlight. Controls have 44-pixel targets, a 6-pixel gap, and toolbar padding of 12 pixels horizontally and 8 pixels vertically.

Settings opens as a floating native dialog with a short transition and returns focus to its trigger when closed. It preserves the current writing and background position. Direct `/settings` entry opens the same dialog over Home.

The footer retains the original **Built by Serticode** and **Built for Àyà mí** attribution. It has no top divider.

## Color and shape

Use the shared tokens in `src/index.css`:

| Role | Treatment |
| --- | --- |
| Light canvas | Ivory `#faf6f0` |
| Dark canvas | Black `#171717` |
| Primary light-theme accent | Mulberry `#593348` |
| White controls | `--color-clear-surface`, fixed at `#ffffff` in both themes |
| Text on white controls | `--color-surface-ink` and `--color-surface-muted` |
| Active toolbar marker | `--color-surface-active`, deep mulberry |
| Active clear button | White fill with rich red `--color-danger-border` (`#c02030`) border and icon |

Use Fraunces for display headings and Manrope for interface text. Buttons, feeling pills, the response selector, and the toolbar use pill or stadium shapes. Avoid decorative shadows and layered background gradients. Dark mode suppresses decorative glow and shadows. Keep text readable on fixed white surfaces rather than inheriting light text from dark mode.

## Home and shared feelings

The greeting owns **A little room for whatever you’re carrying.** Keep that line close to the greeting. The separate **Choose any feelings that fit** heading explains the pills.

`FeelingPicker` owns the feeling pills and includes `ClearSelectionButton` on the same wrapping row. Both Home and Mirror use these components. Unselected pills are white; selected pills keep the theme’s primary treatment. The circular eraser control is gray and disabled with no selection; it uses a white fill and deep red border and icon when clearing is available.

Home has no Skip action. Continue is disabled until at least one feeling is selected. It changes from a muted surface to the primary treatment, with a small arrow movement when enabled. Selected feelings pass into Mirror in memory and are consumed once.

## Mirror

Mirror shows a readable display title and a writing field with a white fill at rest and on focus. Only the border and focus outline strengthen on focus. Dark text and placeholder colors stay readable on the white surface in either theme.

Feelings are visible directly below the writing area. Do not restore the selected-count disclosure or a separate text-only clear action. The visible writing-privacy footer is removed; Settings retains privacy information, and the field retains its accessible privacy description.

Every expression starts with **Gentle words**. The response-style selector uses two equal segments and one sliding indicator. **Just let me release** is an explicit quiet-release choice. System reduced motion suppresses the transition.

Release is disabled until device preferences are ready and at least one condition is true:

- Writing contains a non-whitespace character.
- At least one feeling is selected.
- **Just let me release** is selected.

Use the same muted-to-primary activation treatment as Home’s Continue button. Clearing the last input disables Release again unless quiet release is selected. Release clears writing from React state; saved words persist only curated response identifiers.

## Settings

Use title-and-description rows with switches for appearance, reduced motion, and future support interests. Platform sounds remains disabled because playback is unavailable. Future interests do not change the pilot’s responses.

Use the shared `Accordion` for **Privacy & device** and **Preferences for future spaces**. Within Privacy & device, show **What stays here** as a heading and body, followed by the persistence explanation. Do not nest another accordion or card around that explanation. Preserve the explicit confirmation for clearing device data.

## Verification

See [Verify the private Mirror pilot](verify-pilot.md) for keyboard, appearance, reduced-motion, privacy, and deployment checks. See [Mirror pilot review evidence](pilot-review.md) for recorded results and outstanding human checks.
