---
phase: 02-design-system
plan: 03
subsystem: ui
tags: [vue, scss, typography, spacing, design-system, migration]

requires:
  - phase: 02-design-system (plans 01-02)
    provides: typography/spacing migration patterns and precedent decisions
provides:
  - Typography and spacing migration for navbar, map, social, notification, and prompt components (12 files)
  - Consistent "Intentional:" comment pattern for all off-scale and :deep() exceptions
affects: [02-04, 02-05, 02-06]

tech-stack:
  added: []
  patterns:
    - "Off-scale values kept with '// Intentional:' comments explaining why"
    - ":deep() font-size overrides documented with '// Intentional: :deep() override' pattern"
    - "SCSS @use imports added to files needing map.get($spacing, ...) for compound values"

key-files:
  created: []
  modified:
    - src/renderer/components/navbar/Messages.vue
    - src/renderer/components/navbar/NavBar.vue
    - src/renderer/components/navbar/ServerStatus.vue
    - src/renderer/components/navbar/Breadcrumbs.vue
    - src/renderer/components/maps/ReplayPreviewMap.vue
    - src/renderer/components/maps/MapOverviewCard.vue
    - src/renderer/components/maps/MapBattlePreviewStartBox.vue
    - src/renderer/components/maps/MapBattlePreview.vue
    - src/renderer/components/social/ChatComponent.vue
    - src/renderer/components/notifications/Event.vue
    - src/renderer/components/notifications/Notifications.vue
    - src/renderer/components/prompts/PromptContainer.vue

key-decisions:
  - "Off-scale values (3px, 5px, 6px, 10px, 13px, 18px, 20px, 8px dots) kept with intentional comments rather than rounding"
  - ":deep() overrides in NavBar.vue (20px/400 primary, 14px/400 secondary) kept with intentional comments"
  - "Decorative dot indicators (font-size: 8px/12px on ⬤ symbols) kept as-is — not text typography"
  - "ChatComponent.vue SCSS @use imports added for map.get($spacing, ...) on compound values"
  - "MapOverviewCard.vue .attributes migrated to body-1-strong (16px/600 exact match)"

patterns-established:
  - "Decorative unicode characters use font-size to control visual size — exempt from typography migration"
  - ":deep() overrides always get '// Intentional: :deep() override' comment pattern"

requirements-completed: [DS-01]

duration: 15min
completed: 2026-03-04
---

# Phase 2 Plan 3: Nav, Map, Social & Notification Components Summary

**Typography and spacing migration across 12 cross-cutting components — navbar, maps, chat, notifications, and prompts — with all violations either migrated to design system utilities or documented as intentional exceptions**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2/2
- **Files modified:** 12

## Accomplishments
- Migrated all eligible font-size declarations to typography classes (body-1, body-2, body-1-strong, caption-1)
- Migrated all eligible spacing to utility classes (padding-sm, gap-xxs, margin-right-xs, etc.) or map.get()
- Documented all off-scale and :deep() exceptions with consistent "Intentional:" comment pattern
- Added SCSS @use imports to ChatComponent.vue for spacing map access

## Task Commits

Git not available in PATH — commits skipped.

1. **Task 1: Migrate typography + spacing in navbar and map components** — 8 files
2. **Task 2: Migrate typography + spacing in social, notification & prompt components** — 4 files

## Files Created/Modified
- `src/renderer/components/navbar/Messages.vue` — Removed font-size: 14px from .sidebar-item and .input-field; added body-2 classes; documented off-scale 13px and 8px dot
- `src/renderer/components/navbar/NavBar.vue` — Documented :deep() font-size overrides (20px primary, 14px secondary) with intentional comments
- `src/renderer/components/navbar/ServerStatus.vue` — Migrated margin-right: 4px to margin-right-xs class; documented decorative dot font-size
- `src/renderer/components/navbar/Breadcrumbs.vue` — Migrated font-size: 16px to body-1 class; documented off-scale spacing (5px, 10px, 3px)
- `src/renderer/components/maps/ReplayPreviewMap.vue` — Migrated font-size: 12px to caption-1 class on .start-pos-tooltip
- `src/renderer/components/maps/MapOverviewCard.vue` — Migrated .attributes font-size/weight to body-1-strong class; updated off-scale comments to Intentional pattern
- `src/renderer/components/maps/MapBattlePreviewStartBox.vue` — Documented off-scale font-size: 1.5rem (24px/regular) on box label
- `src/renderer/components/maps/MapBattlePreview.vue` — Migrated font-size: 12px to caption-1 class on .start-pos-tooltip
- `src/renderer/components/social/ChatComponent.vue` — Heaviest file: migrated .tabs font-size to body-2, .tab padding to utility classes, .chat-messages padding/gap to utilities; converted spacing to map.get(); added SCSS imports; documented 6 off-scale exceptions
- `src/renderer/components/notifications/Event.vue` — Documented off-scale font-size: 18px and spacing (6px, 10px, 20px, 5px)
- `src/renderer/components/notifications/Notifications.vue` — Documented off-scale gap: 3px
- `src/renderer/components/prompts/PromptContainer.vue` — Documented off-scale padding: 5px 10px

## Decisions Made
- Off-scale values kept with comments (consistent with 02-01 and 02-02 precedent)
- :deep() overrides in NavBar.vue kept with comments (can't add utility classes to inner component elements)
- Decorative dot indicators (⬤) exempt from typography migration — font-size controls visual dot size, not text readability
- ChatComponent.vue compound spacing values (padding: 4px 8px, padding: 0 8px) converted to map.get() syntax

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- Git not in PATH on this Windows environment — all commits skipped per execution notes

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- 3 of 6 plans complete for Phase 2
- Next: 02-04 (common, controls & misc components — 13 files)
- All patterns established; remaining plans follow same migration approach

---
*Phase: 02-design-system*
*Completed: 2026-03-04*
