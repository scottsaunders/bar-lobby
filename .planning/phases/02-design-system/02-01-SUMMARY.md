---
phase: 02-design-system
plan: 01
subsystem: ui
tags: [vue, scss, typography, spacing, design-system, migration]

requires:
  - phase: quick-1
    provides: "Design system infrastructure (spacing utilities, typography classes, enforcement rule)"
provides:
  - "16 battle components migrated to design system typography classes"
  - "16 battle components migrated to design system spacing utilities"
  - "Migration pattern established for remaining component groups"
affects: [02-02, 02-03, 02-04]

tech-stack:
  added: []
  patterns:
    - "Typography: add class to template element, remove font-size/font-weight from scoped CSS"
    - "Spacing (simple): add utility class to template element, remove from scoped CSS"
    - "Spacing (compound): use map.get($spacing, 'token') in SCSS for multi-value properties"
    - "Off-scale values: keep hardcoded with /* Intentional: off-scale... */ comment"
    - "Dead CSS in commented-out templates: keep with comment, note would-be class"

key-files:
  created: []
  modified:
    - src/renderer/components/battle/VotePanel.vue
    - src/renderer/components/battle/BattlePreview.vue
    - src/renderer/components/battle/GameModeComponent.vue
    - src/renderer/components/battle/StickyBattle.vue
    - src/renderer/components/battle/BattleChat.vue
    - src/renderer/components/battle/BattlePreviewParticipant.vue
    - src/renderer/components/battle/MatchmakingProgressWidget.vue
    - src/renderer/components/battle/ReplayPreview.vue
    - src/renderer/components/battle/PlayerParticipant.vue
    - src/renderer/components/battle/TeamParticipant.vue
    - src/renderer/components/battle/SpectatorParticipant.vue
    - src/renderer/components/battle/BattleTitleComponent.vue
    - src/renderer/components/battle/LuaOptionsModal.vue
    - src/renderer/components/battle/AddBotModal.vue
    - src/renderer/components/battle/MatchMakingDrawer.vue
    - src/renderer/components/battle/MapListModal.vue

key-decisions:
  - "Off-scale typography values (27px, 36px, 12px/500w) kept with intentional comments rather than rounding to nearest class"
  - "Off-scale spacing values (1px, 3px, 6px, 96px) kept with intentional comments"
  - "StickyBattle.vue styles migrated via SCSS map.get only (template is fully commented out)"
  - "font-size: smaller (CSS keyword) in GameModeComponent mapped to caption-1 as nearest equivalent"

patterns-established:
  - "Migration pattern: read file → add classes to template → remove CSS properties → verify with grep"
  - "Compound spacing in :deep() selectors or non-template-accessible elements uses SCSS map.get"
  - "Dead CSS rules in scoped styles get comment noting the would-be class for future cleanup"

requirements-completed: [DS-01]

duration: ~25min
completed: 2026-03-04
---

# Phase 2 Plan 01: Battle Components Typography + Spacing Migration Summary

**Migrated all 16 battle components from hardcoded font-size/spacing to design system typography classes and spacing utilities, eliminating ~45 violations**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2/2 completed
- **Files modified:** 16

## Accomplishments
- Eliminated all hardcoded `font-size` declarations from battle component `<style>` blocks (4 intentional exceptions documented)
- Replaced all hardcoded `padding`/`margin`/`gap` pixel values with spacing utility classes or SCSS `map.get()` (5 intentional off-scale exceptions documented)
- Established the migration pattern (template class + CSS removal) that plans 02-02 through 02-04 will follow

## Task Commits

Git was not available in this environment. Changes are uncommitted but complete.

1. **Task 1: Migrate typography + spacing in high-violation battle components** — 8 files (VotePanel, BattlePreview, GameModeComponent, StickyBattle, BattleChat, BattlePreviewParticipant, MatchmakingProgressWidget, ReplayPreview)
2. **Task 2: Migrate typography + spacing in remaining battle components** — 8 files (PlayerParticipant, TeamParticipant, SpectatorParticipant, BattleTitleComponent, LuaOptionsModal, AddBotModal, MatchMakingDrawer, MapListModal)

## Files Modified

- `VotePanel.vue` — 3 typography (title-3, subtitle-1, body-2) + 3 spacing migrations
- `BattlePreview.vue` — 2 typography (title-2, body-2-strong) + 5 spacing migrations
- `GameModeComponent.vue` — 1 typography (caption-1) + 4 spacing migrations
- `StickyBattle.vue` — 2 typography exceptions + 3 spacing migrations (SCSS only, template commented out)
- `BattleChat.vue` — 4 spacing migrations (gap-sm, padding-xs, padding-sm, gap-xs)
- `BattlePreviewParticipant.vue` — 1 typography (body-2) + 2 spacing migrations
- `MatchmakingProgressWidget.vue` — 1 typography (caption-1-stronger) + 1 spacing exception
- `ReplayPreview.vue` — 5 spacing migrations + 2 spacing exceptions
- `PlayerParticipant.vue` — 1 typography (caption-1-strong) + 1 spacing migration + 1 dead CSS exception
- `SpectatorParticipant.vue` — 1 typography (caption-1-strong) + 1 spacing migration
- `TeamParticipant.vue` — 1 typography (body-1), removed font-size and font-weight
- `BattleTitleComponent.vue` — 1 typography exception (36px off-scale)
- `LuaOptionsModal.vue` — 3 spacing migrations (padding-sm, gap-sm, padding-bottom-xl)
- `AddBotModal.vue` — 1 spacing migration (padding-lg)
- `MatchMakingDrawer.vue` — 1 spacing migration + 1 spacing exception (96px layout constraint)
- `MapListModal.vue` — 2 spacing migrations (gap-xl)

## Decisions Made

- **Off-scale typography kept as-is:** Values like 27px, 36px, and 12px/500w don't map cleanly to any typography class. Kept with `/* Intentional */` comments rather than silently rounding.
- **Off-scale spacing kept as-is:** Values like 1px, 3px, 6px, and 96px are genuinely unique. Documented with comments.
- **StickyBattle dead code:** Template is fully commented out. Migrated spacing via SCSS `map.get()` only; typography kept with comments since no template elements exist to receive classes.
- **`font-size: smaller` → `caption-1`:** CSS keyword `smaller` ≈ 13.3px (83.3% of 16px parent). Mapped to `caption-1` (12px) as the nearest design system class.

## Deviations from Plan

None — plan executed exactly as written.

## Intentional Exceptions (grep audit)

### Typography (`font-size:` remaining)
| File | Value | Reason |
|------|-------|--------|
| StickyBattle.vue | 27px | Off-scale (nearest title-2 is 28px), template commented out |
| StickyBattle.vue | 12px/500w | Weight 500 has no exact class, template commented out |
| BattleTitleComponent.vue | 36px | Off-scale (between title-1 at 32px and large-title at 40px) |
| PlayerParticipant.vue | 12px | Dead CSS rule (no template element uses `.ready` class) |

### Spacing (hardcoded px remaining)
| File | Property | Value | Reason |
|------|----------|-------|--------|
| BattlePreview.vue | margin-bottom | 3px | Off-scale (between xxs=2px and xs=4px) |
| BattlePreview.vue | margin-bottom | 1px | Off-scale (below xxs=2px) |
| ReplayPreview.vue | margin-bottom | 3px | Off-scale |
| ReplayPreview.vue | margin-bottom | 1px | Off-scale |
| MatchmakingProgressWidget.vue | gap | 3px | Off-scale |
| MatchMakingDrawer.vue | padding-top | 96px | Layout constraint, no token |
| BattlePreviewParticipant.vue | padding (6px) | 6px | Off-scale, compound value |

## Issues Encountered
- Git not available in environment — commits skipped. All changes are in working tree.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Migration pattern fully established and verified
- Plans 02-02 through 02-04 can follow identical approach for views, nav/map/social, and common/controls components
- Plan 02-05 (native element replacement) and 02-06 (!important triage) are independent work streams

## Self-Check: PASSED

All 16 files modified and verified via grep audit. Zero violations remain except documented intentional exceptions.

---
*Phase: 02-design-system*
*Completed: 2026-03-04*
