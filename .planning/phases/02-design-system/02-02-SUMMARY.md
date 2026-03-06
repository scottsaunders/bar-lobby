---
phase: 02-design-system
plan: 02
subsystem: ui
tags: [vue, scss, typography, spacing, design-system, migration]

requires:
  - phase: 02-design-system/01
    provides: "Typography and spacing migration patterns established in battle components"
provides:
  - "All 9 view/page files migrated to design system typography classes and spacing utilities"
  - "SCSS @use imports added to files missing spacing map access"
affects: [02-design-system/03, 02-design-system/04, 02-design-system/06]

tech-stack:
  added: []
  patterns:
    - "Off-scale values documented with intentional comments rather than rounding"
    - ":deep() font-size overrides kept with intentional comments (can't add utility classes to inner component elements)"
    - "SCSS map.get($spacing, token) used for compound padding and :deep() spacing overrides"

key-files:
  created: []
  modified:
    - src/renderer/views/play/multiplayerLobby.vue
    - src/renderer/views/play/matchmaking.vue
    - src/renderer/views/play/skirmishVsAi.vue
    - src/renderer/views/play/campaign/[campaignId].vue
    - src/renderer/views/play/campaign/lore.vue
    - src/renderer/views/watch/replays.vue
    - src/renderer/views/library/maps/[id].vue
    - src/renderer/views/library/commands.vue
    - src/renderer/views/profile/[userId].vue

key-decisions:
  - "Off-scale typography values (11px, 13px, 24px/bold, 1.2em) kept with intentional comments"
  - ":deep() font-size overrides kept with intentional comments since utility classes can't target inner component elements"
  - "Off-scale spacing values (1px, 3px, 5px, 10px, 20px) kept with intentional comments when not close to a token"
  - "Dead CSS rules (matchmaking .loading-queues font-size) cleaned up by removing the font-size property"
  - "Added SCSS @use imports to 3 files (maps/[id], commands, profile/[userId]) that were missing spacing map access"

patterns-established:
  - "Consistent intentional-comment format for off-scale values: /* intentional: [value] off-scale, [reason] */"

requirements-completed: [DS-01]

duration: ~15min
completed: 2026-03-04
---

# Phase 2 Plan 02: View Pages Typography + Spacing Migration Summary

**Migrated 9 view/page files to design system typography classes and spacing utilities, eliminating all simple hardcoded font-size and pixel spacing; off-scale and :deep() values documented with intentional comments**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Migrated typography in multiplayerLobby.vue: `caption-1` on player-chip elements, `body-2` on message-text elements
- Converted all on-scale pixel spacing values to `map.get($spacing, ...)` across 9 files
- Added missing SCSS `@use` imports to 3 files that lacked spacing map access
- Removed dead `font-size: 1.2rem` from unused matchmaking CSS rules
- Documented all off-scale and `:deep()` exceptions with intentional comments

## Task Commits

Git was not available in this environment (`git` not in PATH). No atomic commits were created.

1. **Task 1: Migrate typography + spacing in play area views** — 5 files (multiplayerLobby, matchmaking, skirmishVsAi, [campaignId], lore)
2. **Task 2: Migrate typography + spacing in library, watch & profile views** — 4 files (replays, maps/[id], commands, profile/[userId])

## Files Created/Modified
- `src/renderer/views/play/multiplayerLobby.vue` — Added caption-1/body-2 classes to chat elements; converted player-chip padding to map.get; removed 2 font-size declarations
- `src/renderer/views/play/matchmaking.vue` — Removed dead font-size from unused .loading-queues/.queue-error rules
- `src/renderer/views/play/skirmishVsAi.vue` — Converted dev-select :deep() padding to map.get; commented :deep() font-size overrides
- `src/renderer/views/play/campaign/[campaignId].vue` — Converted badge padding to map.get; commented off-scale font-size values (11px, 24px/bold)
- `src/renderer/views/play/campaign/lore.vue` — Converted badge padding to map.get
- `src/renderer/views/watch/replays.vue` — Converted contenders gap to map.get; commented off-scale spacing (5px, 10px, 3px, 1px)
- `src/renderer/views/library/maps/[id].vue` — Added SCSS imports; converted container gap and details margin-bottom to map.get; commented off-scale gap and font-size
- `src/renderer/views/library/commands.vue` — Added SCSS imports; converted command margin-bottom and cmdDescription margin-left to map.get; commented off-scale font-size and spacing
- `src/renderer/views/profile/[userId].vue` — Added SCSS imports; converted profile-header margins to map.get; commented off-scale avatar margin and info gap

## Decisions Made
- **Off-scale font-size kept with comments:** Values like 11px, 13px, 24px/bold, 0.875rem, 1.2em have no exact typography class match. Documented as intentional rather than rounding to nearest class (which would change visual appearance).
- **:deep() font-size kept with comments:** Cannot add utility classes to inner component elements accessed via `:deep()`. Documented font-size/font-weight as intentional overrides.
- **Close spacing values rounded:** 15px → lg (16px), 25px → xl (24px), 5px → xs (4px) for margin/gap where the 1px difference is negligible.
- **Off-scale spacing kept with comments:** 1px, 3px, 5px, 10px, 20px values documented when rounding would visibly change appearance.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing SCSS imports to 3 files**
- **Found during:** Task 2 (library, watch, profile views)
- **Issue:** maps/[id].vue, commands.vue, and profile/[userId].vue lacked `@use "sass:map"` and `@use "@renderer/styles/spacing" as *` imports needed for `map.get($spacing, ...)` usage
- **Fix:** Added SCSS imports at the top of each `<style>` block
- **Files modified:** maps/[id].vue, commands.vue, profile/[userId].vue
- **Verification:** Files use map.get syntax correctly with imports in place

---

**Total deviations:** 1 auto-fixed (blocking — missing SCSS imports)
**Impact on plan:** Necessary to enable spacing token usage. No scope creep.

## Issues Encountered
- Git not available in PATH on this Windows environment. Atomic commits skipped; all changes applied directly. Recommend committing all 9 modified files together.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- View pages migration complete; ready for 02-03 (nav, map, social & notification components)
- Patterns from 02-01 and 02-02 are well-established for remaining migration plans

---
*Phase: 02-design-system*
*Completed: 2026-03-04*
