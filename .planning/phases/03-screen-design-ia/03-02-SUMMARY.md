---
phase: 03-screen-design-ia
plan: 02
subsystem: ui
tags: [vue, scss, view-container, layout, design-system]

# Dependency graph
requires:
  - phase: 03-01
    provides: Canonical view shell (_views.scss) with view-container padding 0 xxl sm xxl
provides:
  - Play screens aligned to canonical view shell
  - No inline styles on view root
  - Consistent view-container padding across Play flow
affects: [03-03, 03-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [canonical view shell, view-container base from _views.scss]

key-files:
  created: []
  modified:
    - src/renderer/views/play/skirmishVsAi.vue
    - src/renderer/views/play/multiplayerLobby.vue
    - src/renderer/views/play/matchmaking.vue
    - src/renderer/views/play/customLobbies.vue
    - src/renderer/views/play/scenarios.vue
    - src/renderer/views/play/tournaments.vue
    - src/renderer/views/play/campaign/index.vue
    - src/renderer/views/play/campaign/[campaignId].vue
    - src/renderer/views/play/campaign/mission.vue
    - src/renderer/views/play/campaign/lore.vue
    - src/renderer/views/play/campaign/tutorial.vue

key-decisions:
  - "skirmishVsAi and multiplayerLobby keep overflow: visible, width: 100%, position: relative for panel shadows and layout"
  - "multiplayerLobby keeps .view-title .icon { flex-shrink: 0 } for back button"
  - "Remaining Play screens rely on base _views.scss .view-container — removed duplicate scoped blocks"

patterns-established:
  - "Play screens use div.view → div.view-container → div.view-title (h1 + optional p) → content"
  - "Screen-specific view-container overrides only when needed (e.g. overflow: visible for shadows)"

requirements-completed: [UX-01]

# Metrics
duration: ~8min
completed: 2026-03-04
---

# Phase 03 Plan 02: Play View Shell Alignment Summary

**Align all Play screens to canonical view shell; remove inline styles and redundant view-container overrides**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Removed redundant `style="position: relative"` from skirmishVsAi and multiplayerLobby (base .view already has it)
- Trimmed scoped .view-container in skirmishVsAi and multiplayerLobby to only screen-specific overrides (overflow: visible, width, position, .icon flex-shrink)
- Removed duplicate .view-container blocks from matchmaking, customLobbies, scenarios, tournaments, and all campaign/* views — they now inherit canonical padding from _views.scss
- Removed unused @use imports from customLobbies.vue

## Task Commits

1. **Task 1: Remove inline styles and redundant view-container overrides** — (feat)
2. **Task 2: Standardize view-container across remaining Play screens** — (feat)

**Plan metadata:** (docs: complete plan)

## Files Created/Modified

- `src/renderer/views/play/skirmishVsAi.vue` — Removed inline style, kept overflow:visible/width/position overrides
- `src/renderer/views/play/multiplayerLobby.vue` — Same + .view-title .icon flex-shrink
- `src/renderer/views/play/matchmaking.vue` — Removed duplicate .view-container block
- `src/renderer/views/play/customLobbies.vue` — Removed duplicate block and unused @use imports
- `src/renderer/views/play/scenarios.vue` — Removed duplicate block
- `src/renderer/views/play/tournaments.vue` — Removed duplicate block
- `src/renderer/views/play/campaign/index.vue` — Removed duplicate block
- `src/renderer/views/play/campaign/[campaignId].vue` — Removed duplicate block
- `src/renderer/views/play/campaign/mission.vue` — Removed duplicate block
- `src/renderer/views/play/campaign/lore.vue` — Removed duplicate block
- `src/renderer/views/play/campaign/tutorial.vue` — Removed duplicate block

## Decisions Made

- menu.vue unchanged per plan (intentional exception)
- Skirmish and multiplayer lobby retain overflow: visible for panel shadow visibility
- All other Play screens use base _views.scss .view-container without scoped overrides

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None

## Next Phase Readiness

- Play flow (skirmish, campaign, matchmaking, customLobbies, tournaments) has consistent layout
- Ready for 03-03 (next plan in phase)

## Self-Check

- [x] SUMMARY.md created
- [x] All Play views have view + view-container + view-title
- [x] No inline style="position: relative" on any Play view root
- [x] menu.vue unchanged

---
*Phase: 03-screen-design-ia*
*Completed: 2026-03-04*
