# Codebase Structure

**Analysis Date:** 2025-03-03

## Directory Layout

```
bar-lobby/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload script (IPC bridge)
│   └── renderer/       # Vue app (UI)
├── tests/              # Vitest tests
├── tools/              # Build/i18n scripts
├── vendor/             # Third-party assets (path alias $)
├── .planning/          # GSD / planning artifacts
├── .claude/             # GSD commands and agents
├── index.html           # Renderer entry HTML
├── forge.config.cjs     # Electron Forge config
├── vite.*.config.mts   # Vite configs (main, preload, renderer)
├── tsconfig.*.json      # TypeScript configs
├── package.json
└── electron-builder.config.ts
```

## Directory Purposes

**`src/main/`:**
- Purpose: Electron main process; backend logic, IPC, native APIs
- Contains: `main.ts`, `main-window.ts`, `services/`, `content/`, `game/`, `tachyon/`, `oauth2/`, `config/`, `model/`, `json/`, `utils/`
- Key files: `main.ts`, `main-window.ts`, `typed-ipc.ts`, `services/*.ts`, `content/**/*.ts`, `tachyon/tachyon-client.ts`
- Subdirectories: `services`, `content` (maps, replays, engine, game, downloads), `game`, `tachyon`, `oauth2`, `config`, `model`, `json`, `utils`

**`src/preload/`:**
- Purpose: Preload script; exposes safe API to renderer via contextBridge
- Contains: `preload.ts` (and any preload-specific modules)
- Key files: `preload.ts`

**`src/renderer/`:**
- Purpose: Vue 3 SPA; all UI and client-side state
- Contains: `App.vue`, `index.ts`, `views/`, `components/`, `store/`, `styles/`, `assets/`, `composables/`, `utils/`
- Key files: `App.vue`, `index.ts`; route views under `views/` (file-based routing)
- Subdirectories: `views` (play, news, library, watch, styles), `components` (navbar, battle, maps, controls, common, misc, primevue), `store`, `styles`, `assets/languages`

**`src/renderer/views/`:**
- Purpose: Route-level pages (unplugin-vue-router)
- Contains: `index.vue`, `play/` (menu, multiplayerLobby, matchmaking, customLobbies, skirmishVsAi, campaign, etc.), `news/`, `library/`, `watch/`, `styles.vue`
- Naming: kebab or PascalCase `.vue` files; dynamic routes e.g. `[campaignId].vue`

**`src/renderer/components/`:**
- Purpose: Reusable UI and feature components
- Contains: `common/` (Panel, InteractiveTile, etc.), `controls/` (Button, Select, Textbox, etc.), `navbar/`, `battle/`, `maps/`, `misc/`, `primevue/`
- Design system components live under `common/` and `controls/`; see `.cursorrules`

**`src/renderer/store/`:**
- Purpose: Reactive state modules (no Pinia)
- Contains: `*.store.ts` (e.g. `chat.store.ts`, `maps.store.ts`, `engine.store.ts`, `battle.store.ts`)

**`src/main/content/`:**
- Purpose: Domain content loaders and parsers (maps, replays, engine, game, downloads)
- Contains: `maps/`, `replays/`, `engine/`, `game/`, `downloads.ts`, `abstract-content.ts`, `auto-updater.ts`
- Key files: `map-content.ts`, `replay-content.ts`, `engine-content.ts`, `game-content.ts`; workers where used (e.g. `map-image-worker.ts`, `parse-replay-worker.ts`)

**`src/main/services/`:**
- Purpose: Main-process services called from IPC or main window
- Contains: `tachyon.service.ts`, `game.service.ts`, `engine.service.ts`, `maps.service.ts`, `replays.service.ts`, `auth.service.ts`, `account.service.ts`, `downloads.service.ts`, `news.service.ts`, `settings.service.ts`, etc.

**`tests/`:**
- Purpose: Vitest tests
- Contains: `subscription-manager.test.ts`, `parse-lua-table.spec.ts`, `e2e.spec.ts`
- Run: `npm test` or `vitest tests`

**`tools/`:**
- Purpose: Build and dev scripts
- Contains: e.g. `generate-i18n-asset-files.ts` (i18n codegen)

## Key File Locations

**Entry points:**
- `src/main/main.ts` — Main process entry
- `src/renderer/index.ts` — Renderer entry
- `src/preload/preload.ts` — Preload bridge
- `index.html` — HTML shell for renderer

**Configuration:**
- `forge.config.cjs` — Forge + Vite plugin entries
- `vite.main.config.mts`, `vite.preload.config.mts`, `vite.renderer.config.mts` — Vite
- `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json`, `tsconfig.shared.json`
- `electron-builder.config.ts` — Packaging
- `src/main/config/` — App/server/content config

**Core logic:**
- `src/main/services/*.ts` — Backend services
- `src/main/content/**/*.ts` — Content loading and parsing
- `src/main/tachyon/tachyon-client.ts` — Game protocol client
- `src/renderer/store/*.store.ts` — Frontend state

**Design system:**
- `src/renderer/components/common/`, `src/renderer/components/controls/`
- `src/renderer/styles/_utils.scss`, `_spacing.scss`, `_*.scss`

**Testing:**
- `tests/*.test.ts`, `tests/*.spec.ts`
- `vitest.config.mts`

## Naming Conventions

**Files:**
- TypeScript: `kebab-case.ts` or `camelCase.ts` for modules
- Vue: `PascalCase.vue` for components (e.g. `Button.vue`, `MapDetailModal.vue`)
- Tests: `*.test.ts` or `*.spec.ts` in `tests/`
- Styles: `_kebab-case.scss` for partials in `styles/`

**Directories:**
- `kebab-case` for feature dirs (e.g. `map-content`, `replay-content`)
- Plural where it’s a collection (e.g. `views`, `components`, `services`)

**Path aliases (Vite/TS):**
- `@main` → `src/main`
- `@renderer` → `src/renderer`
- `@preload` → `src/preload`
- `$` → `vendor`

---

*Structure analysis: 2025-03-03*
