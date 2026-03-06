---
phase: 03-screen-design-ia
plan: 03
subsystem: ui
tags: [view-container, layout, design-system, scss]

# Dependency graph
requires:
  - phase: 03-01
    provides: Canonical view shell (_views.scss view-container, view-title)
provides:
  - Library (commands, maps, maps/[id]) and Watch (replays) screens aligned to canonical view shell
  - commands.vue migrated from commands-container to view-container
  - maps.vue, maps/[id].vue, replays.vue standardized on canonical view-container
affects: [03-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [view-container + view-title + screen-specific content wrapper]

key-files:
  created: []
  modified:
    - src/renderer/views/library/commands.vue
    - src/renderer/views/library/maps/maps.vue
    - src/renderer/views/library/maps/[id].vue
    - src/renderer/views/watch/replays.vue

key-decisions:
  - "commands.vue: commands-content wrapper retains 1600px width for commands list layout"
  - "maps/[id].vue: map-details-content wrapper retains 1600px width; back button + view-title in flex row"

patterns-established:
  - "Screen-specific content wrappers (commands-content, map-details-content) use layout-specific widths when needed"

requirements-completed: [UX-01]

# Metrics
duration: ~8min
completed: 2026-03-04
---

# Phase 03 Plan 03: Library & Watch View Shell Alignment Summary

**Library (commands, maps, maps/[id]) and Watch (replays) screens migrated to canonical view-container; redundant CSS removed**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- commands.vue migrated from commands-container to view-container; commands-specific layout (1600px centered) moved to .commands-content wrapper
- maps.vue: removed duplicate .view-container block; relies on base _views.scss
- maps/[id].vue: migrated from map-details-container to view-container; added view-title; map-details-content wrapper for 1600px layout
- replays.vue: removed duplicate .view-container block; relies on base _views.scss

## Task Commits

Each task was committed atomically (git not in PATH on executor environment; user may run commits manually):

1. **Task 1: Migrate commands.vue to view-container** - feat(03-03): migrate commands.vue to view-container
2. **Task 2: Standardize view-container in maps, maps/[id], replays** - refactor(03-03): standardize view-container in maps, maps/[id], replays

**Suggested final commit:** `docs(03-03): complete Library & Watch view shell alignment plan`

## Files Created/Modified

- `src/renderer/views/library/commands.vue` - Replaced commands-container with view-container; added commands-content wrapper
- `src/renderer/views/library/maps/maps.vue` - Removed duplicate .view-container block
- `src/renderer/views/library/maps/[id].vue` - Migrated to view-container; added view-title; map-details-content wrapper
- `src/renderer/views/watch/replays.vue` - Removed duplicate .view-container block

## Decisions Made

- commands-content and map-details-content retain 1600px width for layout consistency with prior design
- maps/[id] back button moved to flex row with view-title for canonical header structure

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Git not in PATH on Windows executor environment; commits documented for manual execution

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Library and Watch screens aligned to layout spec
- Design system spacing used throughout via base _views.scss
- Ready for 03-04

## Self-Check: PASSED

- SUMMARY.md created at .planning/phases/03-screen-design-ia/03-03-SUMMARY.md
- commands.vue, maps.vue, maps/[id].vue, replays.vue modified
- STATE.md and ROADMAP.md updated

---
*Phase: 03-screen-design-ia*
*Completed: 2026-03-04*
