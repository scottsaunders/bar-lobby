---
phase: 02-design-system
plan: 04
subsystem: ui
tags: [vue, scss, typography, spacing, design-system, primevue]

requires:
  - phase: 02-design-system (plans 01-03)
    provides: typography/spacing infrastructure, SCSS maps, utility classes
provides:
  - Migrated common components (Progress, Loader, ContextMenu, Accordion)
  - Migrated control components (Button, DownloadContentButton, Options, AutoSuggest)
  - Migrated misc components (SplashScreen, Markdown, LogInConfirmationModal, ScenarioTile)
  - SearchBox already compliant — no changes needed
affects: [02-design-system remaining plans, any future component work]

tech-stack:
  added: []
  patterns: [map.get($spacing) in design system internals, typography classes on template elements, intentional off-scale comments]

key-files:
  created: []
  modified:
    - src/renderer/components/common/Progress.vue
    - src/renderer/components/common/Loader.vue
    - src/renderer/components/common/ContextMenu.vue
    - src/renderer/components/common/Accordion.vue
    - src/renderer/components/controls/Button.vue
    - src/renderer/components/controls/DownloadContentButton.vue
    - src/renderer/components/controls/Options.vue
    - src/renderer/components/controls/AutoSuggest.vue
    - src/renderer/components/misc/SplashScreen.vue
    - src/renderer/components/misc/Markdown.vue
    - src/renderer/components/misc/LogInConfirmationModal.vue
    - src/renderer/components/misc/ScenarioTile.vue

key-decisions:
  - "Removed duplicate typography class CSS from Button.vue — global classes from _text.scss apply via template class binding"
  - "Off-scale values (1px, 6px, 15px, 1.4rem, 0.75-0.9em) kept with intentional comments rather than rounding"
  - "PrimeVue internal font-size overrides kept with equivalent-class comments (can't add utility classes to PrimeVue internals)"
  - "SearchBox.vue already fully compliant — no changes needed"

patterns-established:
  - "Design system internal components use map.get($spacing, ...) in SCSS for spacing tokens"
  - "PrimeVue wrapper components use map.get() for :deep() and unscoped styles targeting PrimeVue internals"
  - "Off-scale values always documented with /* off-scale — reason */ comment"

requirements-completed: [DS-01]

duration: ~12min
completed: 2026-03-04
---

# Phase 2 Plan 4: Common, Controls & Misc Typography + Spacing Migration Summary

**Migrated 12 Vue components (common/controls/misc) from hardcoded font-size and spacing values to design system tokens using map.get() and typography utility classes**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Migrated all 4 common components (Progress, Loader, ContextMenu, Accordion) to use design system tokens
- Migrated 4 control components (Button, DownloadContentButton, Options, AutoSuggest) using map.get() for PrimeVue internals
- Migrated 4 misc components (SplashScreen, Markdown, LogInConfirmationModal, ScenarioTile) with typography classes and spacing tokens
- Removed redundant typography class CSS duplicates from Button.vue (global _text.scss classes now control typography)
- All remaining hardcoded values documented with intentional exception comments

## Task Commits

Git not available in this environment — commits skipped.

1. **Task 1: Migrate typography + spacing in common and controls components** - 9 files (Progress, Loader, ContextMenu, Accordion, Button, DownloadContentButton, SearchBox [no changes needed], Options, AutoSuggest)
2. **Task 2: Migrate typography + spacing in misc components** - 4 files (SplashScreen, Markdown, LogInConfirmationModal, ScenarioTile)

## Files Created/Modified
- `src/renderer/components/common/Progress.vue` - Added body-2 class to text element, removed hardcoded font-size
- `src/renderer/components/common/Loader.vue` - Added intentional comment to font-size: 0 layout technique
- `src/renderer/components/common/ContextMenu.vue` - Added SCSS imports, migrated padding/gap to map.get(), commented PrimeVue font-size
- `src/renderer/components/common/Accordion.vue` - Added SCSS imports, migrated all 3 gap values to map.get()
- `src/renderer/components/controls/Button.vue` - Added SCSS imports, migrated 4 spacing values to map.get(), removed duplicate typography class CSS
- `src/renderer/components/controls/DownloadContentButton.vue` - Added SCSS imports, migrated 3 spacing values to map.get(), commented relative em font-sizes
- `src/renderer/components/controls/Options.vue` - Added SCSS imports, migrated padding to map.get(), commented 1px off-scale gap
- `src/renderer/components/controls/AutoSuggest.vue` - Added SCSS imports, migrated padding, added caption-1 class, commented off-scale 15px font-size
- `src/renderer/components/misc/SplashScreen.vue` - Added SCSS imports, migrated 2 gap values to map.get()
- `src/renderer/components/misc/Markdown.vue` - Added intentional comment to 1px off-scale code padding
- `src/renderer/components/misc/LogInConfirmationModal.vue` - Added SCSS imports, changed gap-lg to gap-xl, migrated button padding, commented off-scale font-size
- `src/renderer/components/misc/ScenarioTile.vue` - Added SCSS imports and title-3 class, migrated padding, commented off-scale padding-bottom

## Decisions Made
- Removed Button.vue's scoped `.subtitle-1`, `.body-1-strong`, `.body-2-strong` CSS blocks — these were redundant duplicates of global _text.scss classes already applied via `buttonTextClass` in the template
- SearchBox.vue was already compliant (uses map.get() and @extend) — no changes needed
- Off-scale values (font-size: 0, 1px padding, 6px padding-bottom, 15px font-size, 1.4rem, relative em values) preserved with intentional comments
- ContextMenu.vue `!important` on padding preserved — needed to override PrimeVue inline styles
- ScenarioTile.vue title uses title-3 class (24px/600) but keeps font-weight: 500 override for visual consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Git not available in PATH on this Windows environment — commits skipped as noted in execution context

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Common, controls, and misc components all migrated
- Zero unexplained hardcoded font-size or spacing values in these directories
- Ready for remaining plans in phase 02

## Self-Check: PASSED

All 12 modified files verified to exist. All remaining font-size and spacing declarations have justification comments.

---
*Phase: 02-design-system*
*Completed: 2026-03-04*
