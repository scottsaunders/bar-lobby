# Phase 1: Foundation — Context

**Gathered:** 2025-03-03  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers: (1) correct text in UI (no i18n keys), (2) fast and predictable load behavior, (3) startup and first-load without errors. Scope is fixing the foundation so the client is reliable and responsive — no new features.
</domain>

<decisions>
## Implementation Decisions

### Load performance

- **All blocking load at open.** There should be no load time once the user is "in" the client. Any long loading happens while the client is opening, not after.
- **Progress bar during open.** If there is substantial loading at startup, show a progress bar. When the bar reaches 100%, the user expects everything to be loaded and no further loading to block interaction.
- **View-specific / small assets.** Only small, view-specific assets may lazy load when a view opens. They must appear very quickly ("pop in") — no perceptible delay or unresponsive UI.
- **Buttons always work.** The user must never press a button and get zero feedback. Every button must always do something immediately: navigate, change state, or at least give clear visual feedback (e.g. loading state on the button itself). No dead clicks.

### Startup and first-load experience

- **Current pain (to fix):** Login → spinner → button returns → long wait → home. Then first clicks on nav (e.g. Play, Library) do nothing until the view loads. After everything has loaded once, the client is fast. The fix is to move blocking work to "client open" with a progress bar and/or reduce what blocks so that by the time the user sees the home screen, interaction is immediate.
- **Startup errors.** Identify and fix errors during the startup and first-load path so the experience is clean. Prioritize errors that may cause slowness or freezes; user-visible errors are in scope. Console/logger cleanup can be scoped during planning.

### Internationalization (Phase 1 scope)

- **Goal:** User sees English (or correct locale) text, not localization keys. Prefer proper vue-i18n wiring with English default; hard-coded English acceptable if needed. (Not discussed in detail this session; planner can propose approach.)
</decisions>

<code_context>
## Existing Code Insights

### Reusable assets

- **vue-i18n** — Used across renderer; locale files in `src/renderer/assets/languages/en.json`. Many components use `$t` / i18n; key leakage suggests missing keys or fallback misconfiguration.
- **Vite** — Renderer build uses manual chunks (vue, primevue, iconify, view-*). Route-level code splitting likely contributes to "first click on a view loads slowly."
- **Design system** — Button, Panel, Loader, etc. in `src/renderer/components/`. Buttons should show loading state or immediate feedback where they trigger async work.

### Established patterns

- **File-based routing** — `unplugin-vue-router`; views under `src/renderer/views/`. Lazy-loaded route chunks are a likely cause of "first click does nothing until view loads."
- **Main/renderer IPC** — Login and heavy work may live in main process; renderer waits. Progress reporting (for a startup progress bar) would need IPC from main to renderer.

### Integration points

- **App bootstrap** — `src/renderer/index.ts`, `App.vue`; where i18n and router are initialized. Progress bar would likely be part of initial render or a splash/loading view.
- **Login flow** — Where "Login" button and spinner live; transition to home. Needs immediate feedback and no long freeze.
- **Router / view loading** — Ensure 100% means "all route chunks needed for first navigation are loaded" or reduce lazy loading so first clicks respond instantly.
</code_context>

<specifics>
## Specific Ideas

- **Progress bar at open:** Single, clear progress bar during client open; 100% = user can use the app with no further loading.
- **No dead buttons:** Every button must give immediate feedback (navigation, state change, or visible loading on the button). Never "press and nothing happens."
- **Lazy load only small assets:** If anything lazy loads per view, it must pop in very quickly so the user never feels like they're waiting for the view.
</specifics>

<deferred>
## Deferred Ideas

- **i18n deep-dive** — User chose to discuss startup errors and load performance first. i18n fix remains in Phase 1 scope (no keys in UI); implementation approach left for planning.
</deferred>

---
*Phase: 01-foundation*  
*Context gathered: 2025-03-03*
