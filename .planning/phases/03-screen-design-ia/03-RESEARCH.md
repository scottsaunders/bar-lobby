# Phase 3: Screen Design & IA - Research

**Researched:** 2026-03-04
**Domain:** Screen layout, information architecture, consistent view design
**Confidence:** HIGH

## Summary

Phase 3 builds on the completed design system (Phase 2) to ensure **all client screens have consistent layout and information architecture**. The codebase already has a view shell pattern (`view` + `view-container` + `view-title`) used by most screens, but implementation varies: padding overrides, missing titles, different content structures, and layout patterns that diverge. The work is **standardization and documentation**, not greenfield design — define a canonical layout/IA spec and align screens to it. Faked data is acceptable until UX is locked.

**Primary recommendation:** Document a canonical view shell and layout patterns; audit all major screens against the spec; fix inconsistencies in waves by area (Play, Library, Watch, News). Do NOT introduce new layout libraries — use existing design system components and `_views.scss`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-01 | All client screens are designed with consistent layout and information architecture; faked data is acceptable until UX is locked | Canonical view shell (view + view-container + view-title) exists in _views.scss and is used by ~15 screens. Inconsistencies: menu.vue lacks view-title; news/overview lacks view-title; padding varies; Breadcrumbs exists but unused. Standardizing layout patterns and documenting IA will satisfy UX-01. |
</phase_requirements>

## Standard Stack

### Core (Already In Place)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | 3.x (via Electron) | Component framework | Project standard |
| unplugin-vue-router | File-based | Routing | Views under `views/` with `<route>` meta |
| _views.scss | Project | View shell, layout | `.view`, `.view-title` base styles |
| Panel, InteractiveTile, Button | Design system | Layout containers | Phase 2 complete |

### Supporting (Already In Place)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| PrimeVue DataTable | Tables (replays, lobbies, maps) | List + detail layouts |
| PrimeVue TabView | Tabbed content | Replay detail, multi-section views |
| Breadcrumbs.vue | Hierarchy navigation | Exists but unused — consider for deep routes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom view shell per screen | Shared ViewLayout component | Current pattern (view + view-container) is sufficient; a wrapper component would add abstraction without clear benefit for this phase |
| New layout library (Vuestic, etc.) | Existing design system | Would conflict with Phase 2; design system is the source of truth |
| Breadcrumbs everywhere | Secondary nav only | Breadcrumbs exist but aren't used; deep routes (campaign/[id], maps/[id]) could benefit — planner discretion |

**Installation:** No new dependencies required. Use existing design system and `_views.scss`.

## Architecture Patterns

### Existing View Shell (from _views.scss)
```scss
.view {
    height: 100%;
    width: 100%;
    padding-top: map.get($spacing, "xxl");
    padding-bottom: map.get($spacing, "xxl");
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: map.get($spacing, "sm");
    overflow: hidden;
    position: relative;
    contain: layout style paint;
}

.view-title {
    margin-bottom: map.get($spacing, "xl");
    h1 { filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8)); }
    p { filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8)); }
}
```

### Pattern 1: Standard View Structure
**What:** Root `div.view` → `div.view-container` → `div.view-title` (h1 + p) → content area.
**When to use:** All major screens except index (login/splash) and menu (special layout).
**Example:**
```vue
<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.matchmaking.title") }}</h1>
                <p>{{ t("lobby.views.play.matchmaking.description") }}</p>
            </div>
            <div class="content-layout flex-row gap-xl flex-grow">
                <!-- Panels, etc. -->
            </div>
        </div>
    </div>
</template>
```

**Current usage:** matchmaking, replays, library/maps, customLobbies, skirmishVsAi, campaign, scenarios, tournaments, multiplayerLobby, campaign/[campaignId], campaign/mission, campaign/lore, campaign/tutorial, library/commands.

### Pattern 2: Two-Panel Layout (List + Detail)
**What:** Left panel (list/filters) + right panel (detail). Used for replays, maps, customLobbies.
**When to use:** Screens with selectable items and detail view.
**Example:** `watch/replays.vue` — left: DataTable + filters; right: TabView (Map, Details).

### Pattern 3: Grid of Tiles
**What:** InteractiveTile grid for mode selection. Used in menu, campaign index.
**When to use:** Entry points with multiple options (game modes, campaigns).
**Example:** `play/menu.vue` — grid of game mode cards.

### Pattern 4: Special Layouts
**What:** index.vue (login) uses `meta: { empty: true, blurBg: true }` — no NavBar, centered content. menu.vue uses `view-adjust-bottom`, `move-left`, custom grid — no view-title.
**When to use:** Intentional exceptions; document in IA spec.

### Anti-Patterns to Avoid
- **Inline styles on view root:** `skirmishVsAi.vue` has `style="position: relative"` — move to class or remove if redundant.
- **Overriding view-container padding inconsistently:** Some screens use `padding: 0 xxl sm xxl`, others `padding: md xl` — standardize.
- **Missing view-title:** news/overview has no view-title; menu intentionally omits it — document which screens get titles.
- **Creating new layout primitives:** Use `flex-row`, `flex-col`, `gap-*`, `fullheight`, `min-height-0` from design system.

## Screen Inventory (Major Screens)

| Area | Screen | Route | Layout Pattern | view-title? | Notes |
|------|--------|-------|----------------|-------------|-------|
| Auth | index | / | Centered, empty | N/A | meta.empty, blurBg |
| Play | menu | /play/menu | Grid, left-aligned | No (intentional) | Game mode tiles |
| Play | scenarios | /play/scenarios | view-container | Yes | |
| Play | skirmishVsAi | /play/skirmishVsAi | 3-panel + bottom bar | Yes | Inline style on view |
| Play | campaign | /play/campaign | Grid of campaign cards | Yes | Custom campaign-card, no Panel |
| Play | campaign/[id] | /play/campaign/:id | Nested layout | Yes | |
| Play | matchmaking | /play/matchmaking | 2-panel (queue + details) | Yes | |
| Play | customLobbies | /play/customLobbies | 2-panel (list + preview) | Yes | |
| Play | tournaments | /play/tournaments | view-container | Yes | |
| Watch | replays | /watch/replays | 2-panel (list + detail) | Yes | |
| Library | maps/maps | /library/maps/maps | 2-panel (filters + list) | Yes | |
| Library | maps/[id] | /library/maps/:id | Detail (hide from nav) | Yes | |
| News | overview | /news/overview | 2-column (news + devlog) | **No** | |
| Styles | new-styles | /styles/new-styles | Showcase | Yes | Design system demo |

**Debug screens** (devOnly): debug/controls, debug/test, etc. — lower priority for Phase 3.

## Information Architecture

### Navigation Hierarchy
- **Primary nav (NavBar):** Play, Watch, News, Library, Styles
- **Secondary nav (context):** When in /play, shows Scenarios, Skirmish, Campaign, Matchmaking, Custom Lobbies, Tournaments. When in /watch, shows Replays. When in /library, shows Maps, Commands, Guides, Units. When in /news, shows Overview.
- **Breadcrumbs:** Component exists (`Breadcrumbs.vue`) but is **not used** anywhere. Consider for deep routes (campaign/[id], maps/[id]) — planner discretion.

### Route Meta Conventions
- `title`: Shown in secondary nav; used for breadcrumbs if Breadcrumbs adopted
- `order`: Sort order in nav
- `hide`: true = not in secondary nav (e.g. menu, campaign/[id], profile)
- `empty`: true = no NavBar (index/login)
- `blurBg`: Background blur
- `transition`: Vue transition (slide-left, fade)
- `onlineOnly`, `devOnly`: Visibility conditions

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| View container with padding | Custom wrapper | `.view` + `.view-container` from _views.scss | Consistency, single source of truth |
| Panel layout | Custom div with bg/border | `<Panel>` with `no-padding` | Design system component |
| List + detail layout | Custom split | flex-row + Panel + design system gap/padding | Existing pattern in replays, maps |
| Breadcrumb navigation | Custom back/links | Breadcrumbs.vue (if adopted) | Component exists; just needs integration |
| Grid of options | Custom cards | InteractiveTile in grid | Design system |

**Key insight:** Phase 2 established the design system. Phase 3 applies it consistently across screens — no new primitives, just alignment to a documented spec.

## Common Pitfalls

### Pitfall 1: Padding Inconsistency
**What goes wrong:** view-container padding varies: `0 xxl sm xxl`, `md xl`, or inherited from .view. Content alignment differs across screens.
**Why it happens:** Screens were built at different times; no single spec.
**How to avoid:** Document canonical view-container padding in _views.scss or a layout doc; migrate screens to use it. Prefer `map.get($spacing, ...)` for any overrides.
**Warning signs:** Different horizontal padding when switching between Play → Watch → Library.

### Pitfall 2: Missing or Inconsistent view-title
**What goes wrong:** Some screens have h1 + p, others have neither (news/overview) or only h1. Hierarchy feels uneven.
**Why it happens:** news/overview was designed without a title; menu intentionally omits it.
**How to avoid:** Define rule: all content screens get view-title (h1 + optional p) except menu and index. Add view-title to news/overview or document exception.
**Warning signs:** User doesn't know which section they're in.

### Pitfall 3: Overflow and Scroll Containers
**What goes wrong:** Content overflows or scrolls incorrectly when view height is constrained.
**Why it happens:** Missing `min-height: 0` on flex children, or scroll-container on wrong element.
**How to avoid:** Use `fullheight`, `min-height-0` on flex-grow areas; wrap scrollable content in `scroll-container` (from _utils.scss).
**Warning signs:** Cut-off content, double scrollbars.

### Pitfall 4: Breaking the View Shell
**What goes wrong:** Adding wrapper divs that break the flex hierarchy (e.g. extra div between view and view-container with different display).
**Why it happens:** Incremental changes without checking parent structure.
**How to avoid:** Keep structure: view (flex column) → view-container (flex 1, overflow hidden) → view-title → content (flex-grow).
**Warning signs:** Layout collapses, content doesn't fill space.

## Code Examples

### Standard View with Two-Panel Layout
```vue
<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.watch.replays.title") }}</h1>
                <p>{{ t("lobby.views.watch.replays.description") }}</p>
            </div>
            <div class="replays-layout flex-row flex-grow gap-xl">
                <Panel class="flex-grow replays-list-panel">
                    <!-- filters + DataTable -->
                </Panel>
                <Panel class="replay-side-panel flex-grow" no-padding>
                    <!-- detail content -->
                </Panel>
            </div>
        </div>
    </div>
</template>
```

### View Container Padding Override (when needed)
```scss
.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    padding: 0 map.get($spacing, "xxl") map.get($spacing, "sm") map.get($spacing, "xxl");
    overflow: hidden;
    .view-title { padding-left: 0; }
}
```
Source: library/maps/maps.vue, watch/replays.vue — use same pattern for consistency.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Per-screen custom layout | view + view-container + view-title | Most screens use it; standardize the rest |
| No view-title on some screens | view-title with h1 + p | Add to news/overview or document exception |
| Breadcrumbs unused | Consider for deep routes | Optional Phase 3 task |
| Inline styles on view | Use classes | Remove from skirmishVsAi |

**Deprecated/outdated:**
- None specific to layout — Phase 2 already migrated typography/spacing.

## Open Questions

1. **Breadcrumbs: adopt or defer?**
   - What we know: Breadcrumbs.vue exists, supports back + route segments.
   - What's unclear: Whether deep routes (campaign/[id], maps/[id]) need breadcrumbs for UX.
   - Recommendation: Planner discretion. If adopted, add to view shell for routes with `meta.hide` children.

2. **news/overview view-title: add or exception?**
   - What we know: Overview has no view-title; goes straight to two-column layout.
   - What's unclear: Whether "News" in secondary nav is sufficient context.
   - Recommendation: Add minimal view-title (h1: "News" or "Overview") for consistency, or document as intentional exception.

3. **menu.vue layout: standardize or keep special?**
   - What we know: menu uses view-adjust-bottom, move-left, game-menu-container — no view-title.
   - What's unclear: Whether this is intentional "hero" layout.
   - Recommendation: Keep as intentional exception; document in IA spec.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 |
| Config file | `vitest.config.mts` |
| Quick run command | `npx vitest run --reporter verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 (layout) | Major screens use view + view-container | grep/lint | `rg "class=\"view\"" --glob "*.vue" -A 1` | N/A |
| UX-01 (IA) | view-title present where specified | manual/grep | Audit view files for view-title | N/A |
| UX-01 (design system) | No new layout primitives; design system used | manual | Code review | N/A |

### Sampling Rate
- **Per task commit:** Visual check of modified screen
- **Per wave merge:** Grep audit for view structure across views/
- **Phase gate:** All major screens conform to layout spec; navigation consistent

### Wave 0 Gaps
None — UX-01 validation is structural (grep) and manual (visual consistency). No new test files required. Vitest exists for unit tests; screen layout is not unit-tested.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection:** `_views.scss`, `App.vue`, NavBar.vue, 15+ view files (matchmaking, replays, maps, campaign, skirmishVsAi, customLobbies, news/overview, menu, index)
- **Phase 2 research:** 02-RESEARCH.md — design system patterns
- **ROADMAP.md, REQUIREMENTS.md:** Phase 3 scope and UX-01

### Secondary (MEDIUM confidence)
- **WebSearch:** Vue 3 layout architecture — confirms composition-based approach, no new libraries needed
- **CONVENTIONS.md, STRUCTURE.md:** Project conventions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; existing patterns sufficient
- Architecture: HIGH — view shell and layout patterns derived from codebase
- Pitfalls: HIGH — based on observed inconsistencies in views

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable — layout patterns unlikely to change before Phase 3 execution)
