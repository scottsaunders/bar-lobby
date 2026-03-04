# Architecture

**Analysis Date:** 2025-03-03

## Pattern Overview

**Overall:** Electron desktop app with main/renderer process separation; Vue 3 SPA in renderer; service layer in main process; Tachyon WebSocket for game lobby protocol.

**Key Characteristics:**
- Single-window Electron app (main window)
- IPC between main and renderer via preload (`contextBridge` + typed API)
- Renderer: Vue 3 + Vue Router + Pinia-like stores (composition + reactive state)
- Main: Services for game, auth, content, downloads; no database (file + IndexedDB where used)
- Real-time: WebSocket (Tachyon) for lobby/battle; optional HTTP for REST/APIs

## Layers

**Renderer (UI):**
- Purpose: User interface, views, components, client-side state
- Contains: Vue components (`src/renderer/components/`), views (`src/renderer/views/`), stores (`src/renderer/store/`), styles, i18n
- Depends on: Preload-exposed API, Vue Router, PrimeVue, design system
- Entry: `src/renderer/index.ts` → `App.vue`; routes via `unplugin-vue-router` (file-based under `views/`)

**Preload:**
- Purpose: Secure bridge between renderer and main; exposes typed IPC API
- Contains: `src/preload/preload.ts` — contextBridge APIs for renderer
- Depends on: Main process IPC handlers
- Used by: Renderer only

**Main (backend):**
- Purpose: Process management, native APIs, game protocol, content, auth, downloads
- Contains: `src/main/main.ts`, `main-window.ts`, services (`src/main/services/`), content loaders (`src/main/content/`), game/tachyon (`src/main/game/`, `src/main/tachyon/`), config, model, utils
- Depends on: Node/Electron APIs, external packages (ws, axios, etc.)
- Used by: Invoked by renderer via IPC

**Content & domain:**
- Purpose: Domain logic for maps, replays, engine versions, game content, downloads
- Contains: `src/main/content/` (maps, replays, engine, game, downloads, auto-updater), `src/main/model/`, `src/main/json/`
- Depends on: Main utils, config, file system
- Used by: Services and main window flow

## Data Flow

**App startup:**
1. Electron main runs `src/main/main.ts`
2. Main window created; preload script injected; renderer loads Vite-built Vue app
3. Renderer mounts `App.vue`, Vue Router resolves route from URL
4. Views/components call preload API → IPC → main services

**User action (e.g. join lobby):**
1. Renderer calls exposed API (e.g. tachyon/lobby)
2. Preload forwards to main via IPC
3. Main service (e.g. `tachyon.service.ts`, `game.service.ts`) handles request
4. Tachyon client (`tachyon-client.ts`) uses WebSocket to game server
5. Events flow back: main → IPC → preload → renderer; stores/UI update

**Content (maps, replays, engine):**
1. Services in main (`maps.service.ts`, `replays.service.ts`, `engine.service.ts`) use content loaders in `src/main/content/`
2. Files read from disk or downloaded via `node-downloader-helper`; 7z extraction where needed
3. Results sent to renderer via IPC or stored (e.g. Dexie in renderer if used for cache)

**State management:**
- Main: Stateless services; persistent state via file (e.g. `src/main/json/file-store.ts`), settings, or env
- Renderer: Component state + store modules (`src/renderer/store/*.store.ts`) for chat, maps, engine, battle

## Key Abstractions

**Service (main):**
- Purpose: Encapsulate domain or system capability
- Examples: `src/main/services/tachyon.service.ts`, `auth.service.ts`, `maps.service.ts`, `engine.service.ts`, `downloads.service.ts`
- Pattern: Modules exporting functions or class instances; called from IPC handlers or main window

**Content loader:**
- Purpose: Fetch/parse/persist a content type (maps, replays, engine, game)
- Examples: `src/main/content/maps/map-content.ts`, `replays/replay-content.ts`, `engine/engine-content.ts`, `game/game-content.ts`
- Pattern: Abstract base or shared helpers; concrete implementations per content type

**Store (renderer):**
- Purpose: Reactive client-side state for a feature
- Examples: `src/renderer/store/chat.store.ts`, `maps.store.ts`, `engine.store.ts`, `battle.store.ts`
- Pattern: Composition API + reactive refs; no Pinia (plain TS modules)

**Design system:**
- Purpose: Reusable UI and layout conventions
- Examples: `src/renderer/components/common/Panel.vue`, `controls/Button.vue`, `InteractiveTile.vue`; `src/renderer/styles/_spacing.scss`, `_utils.scss`
- Pattern: Components and SCSS variables/mixins; documented in `.cursorrules`

## Entry Points

**Main process:**
- Location: `src/main/main.ts`
- Triggers: Electron start
- Responsibilities: Create window, register IPC, init services, handle app lifecycle

**Renderer:**
- Location: `src/renderer/index.ts` → `App.vue`
- Triggers: Main window load
- Responsibilities: Vue app mount, router, global styles

**Preload:**
- Location: `src/preload/preload.ts`
- Triggers: Loaded in renderer before page script
- Responsibilities: Expose safe, typed API to renderer via contextBridge

## Error Handling

**Strategy:** Errors surface from services; main logs (pino); renderer shows user-facing messages where needed.

**Patterns:**
- Main: Try/catch in IPC handlers; errors logged; optional reply to renderer with error payload
- Renderer: Component-level catch; store or UI error state; user feedback via modals/alerts
- No global error boundary pattern explicitly visible; per-feature handling

## Cross-Cutting Concerns

**Logging:** Pino in main (`src/main/utils/logger.ts`); structured logs; dev vs prod config.

**Validation:** TypeScript types; JSON schema / TypeBox where config or API shapes are validated (`@sinclair/typebox`, `ajv`).

**Auth:** OAuth2 flow in main (`src/main/oauth2/`); PKCE, redirect handler; tokens likely stored via main or secure storage.

**i18n:** vue-i18n; locale files under `src/renderer/assets/languages/` (e.g. `en.json`).

---

*Architecture analysis: 2025-03-03*
*Update when major patterns change*
