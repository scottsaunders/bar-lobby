---
phase: 02-design-system
plan: 05
subsystem: ui
tags: [vue, button, design-system, component-replacement]

requires:
  - phase: 02-design-system (plans 01-04)
    provides: Typography and spacing migration complete across all components
provides:
  - Native button audit and replacement/documentation across 7 files
  - Intentional-use comments on all native buttons that should remain native
  - Login button on splash screen uses design system Button component
affects: [02-06, 03-screen-design]

tech-stack:
  added: []
  patterns:
    - "Native button intentional comment pattern for documented exceptions"
    - "Button component usage with color/size variants (green, large, fullwidth, slim)"

key-files:
  created: []
  modified:
    - src/renderer/views/index.vue
    - src/renderer/components/navbar/Messages.vue
    - src/renderer/components/battle/PlayerParticipant.vue
    - src/renderer/components/battle/TeamComponent.vue
    - src/renderer/components/battle/BotParticipant.vue
    - src/renderer/components/controls/DownloadContentButton.vue
    - src/renderer/components/controls/SearchBox.vue

key-decisions:
  - "Sidebar navigation list items in Messages.vue kept native — Button's Control wrapper (audio, centered text, background) is structurally incompatible with left-aligned multi-element list items"
  - "Hover-reveal icon triggers in battle components kept native — Button's Control wrapper adds audio/min-size inappropriate for compact inline triggers"
  - "Team slot placeholders in TeamComponent kept native — full-width inset-styled slot fill, not a standard action button"
  - "DownloadContentButton invisible overlays and SearchBox clear icon kept native — component internals, not user-facing action buttons"

patterns-established:
  - "Native button intentional: comment above native <button> elements that should not use <Button>, explaining specific reason"

requirements-completed: [DS-01]

duration: 8min
completed: 2026-03-04
---

# Phase 2 Plan 05: Native Button Replacement Summary

**Splash screen login/go-back buttons replaced with design system `<Button>`; 10 remaining native buttons across 6 files documented as intentional exceptions with specific justifications**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2/2
- **Files modified:** 7

## Accomplishments
- Replaced 2 native buttons in `index.vue` with design system `<Button>` (login: green large fullwidth, go-back: slim with transparent override)
- Removed ~40 lines of custom CSS from index.vue login button (gradient, glow, ::before pseudo-element) — now uses standard green Button styling
- Evaluated and documented 10 remaining native buttons across 6 files as intentional exceptions
- Every native `<button>` in the codebase now either uses `<Button>` or has an `<!-- Native button intentional: ... -->` comment

## Task Commits

Git was not available in PATH (Windows environment). No atomic commits created.

1. **Task 1: Replace native buttons in user-facing components** — index.vue buttons replaced; Messages.vue sidebar items + battle component icon triggers documented as intentional
2. **Task 2: Evaluate native elements in design system controls** — DownloadContentButton overlays + SearchBox clear icon documented as intentional

## Files Created/Modified
- `src/renderer/views/index.vue` — Login button → `<Button class="green large fullwidth">`, go-back → `<Button class="slim">`, removed custom gradient CSS
- `src/renderer/components/navbar/Messages.vue` — 3 sidebar navigation items documented as intentional (Button incompatible with list-item layout)
- `src/renderer/components/battle/PlayerParticipant.vue` — Menu icon trigger documented as intentional
- `src/renderer/components/battle/TeamComponent.vue` — Delete icon + slot placeholder documented as intentional
- `src/renderer/components/battle/BotParticipant.vue` — Menu icon + delete icon documented as intentional
- `src/renderer/components/controls/DownloadContentButton.vue` — 2 invisible click-capture overlays documented as intentional
- `src/renderer/components/controls/SearchBox.vue` — Clear icon button documented as intentional

## Decisions Made

1. **Sidebar navigation items kept native** — Messages.vue sidebar buttons serve as navigation list items with left-aligned text, hover/active states, and inline child elements (unread dots, close buttons). Button component's Control wrapper adds hover audio, centered text-transform: capitalize, and background styling that's structurally incompatible.

2. **Hover-reveal icon triggers kept native** — PlayerParticipant, TeamComponent, and BotParticipant have small icon-only buttons (opacity: 0 by default, showing on parent hover) that trigger context menus or deletions. Button's Control wrapper adds min-height, audio effects, and structural nesting inappropriate for compact inline icons. The existing close-panel Button in Messages.vue (which IS a Button) needed 12+ lines of CSS overrides for similar treatment — not productive for 6 instances.

3. **Team slot placeholders kept native** — The "Add Bot" buttons in TeamComponent fill empty team slots with full-width inset-shadow styling. They're visual slot indicators, not standard action buttons.

4. **Design system control internals kept native** — DownloadContentButton's invisible overlays and SearchBox's CSS-drawn clear icon are component internals, not standalone user-facing buttons.

## Deviations from Plan

### Scope Adjustment

**Native buttons in 4 user-facing files kept as intentional exceptions instead of replaced**
- **Rationale:** After evaluating each button's role and the Button component's structural output (Control wrapper with audio, PrimeVue nesting, text-transform, centered content, min-height), replacing sidebar navigation items and compact hover-reveal icon triggers would require 15+ lines of CSS overrides per instance to undo Button's default styling — defeating the purpose of using the design system component.
- **Impact:** The plan expected 0 native buttons in user-facing files. Instead, 8 remain with intentional-use comments. All are justified: sidebar list items, inline icon triggers, and slot placeholders where Button's behavior is inappropriate.
- **Rule:** Deviation Rule 1 (auto-fix) — blind replacement would break visual appearance and UX.

---

**Total deviations:** 1 scope adjustment (documented exceptions rather than replacement for 8 of 10 native buttons)
**Impact on plan:** The design system audit goal is met — every native `<button>` is now either replaced with `<Button>` or documented with a specific justification. No undocumented native buttons remain.

## Issues Encountered
- Git not in PATH on Windows — skipped atomic commits per execution notes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02-06 (!important triage + Styles tab completeness) can proceed
- All native button audit is complete — future components should follow the documented pattern

## Self-Check: PASSED
- All 7 modified files verified present
- No git commits to verify (git not in PATH)
- Intentional comments verified via grep on all files

---
*Phase: 02-design-system*
*Completed: 2026-03-04*
