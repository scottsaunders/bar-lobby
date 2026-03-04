# Technology Stack

**Analysis Date:** 2025-03-03

## Languages

**Primary:**
- TypeScript 5.8 — All application code (main, preload, renderer)

**Secondary:**
- Vue SFC (`.vue`) — Single-file components in renderer
- SCSS — Styles with design-system variables (`src/renderer/styles/`)

## Runtime

**Environment:**
- Node.js 22.16.0 (locked in `package.json` engines)
- Electron 37.3.1 — Desktop app (main process = Node; renderer = Chromium)

**Package Manager:**
- npm (lockfile: `package-lock.json`)

## Frameworks

**Core:**
- Electron Forge 7.8 — Build and packaging (Vite plugin)
- Vue 3 — UI framework (Composition API, script setup)
- Vue Router 4 — Routing (unplugin-vue-router for file-based routes)
- PrimeVue 3.23 — UI component library

**Testing:**
- Vitest 3.2 — Unit and integration tests
- Tests live in `tests/` (e.g. `subscription-manager.test.ts`, `parse-lua-table.spec.ts`, `e2e.spec.ts`)

**Build/Dev:**
- Vite 7.1 — Bundling (separate configs: main, preload, renderer)
- TypeScript 5.8 — Compilation
- vue-tsc — Vue type checking
- unplugin-vue-router — File-based routing

## Key Dependencies

**Critical:**
- `tachyon-protocol` ^1.15.1 — Game lobby protocol (Beyond All Reason)
- `ws` ^8.18 — WebSocket client
- `axios` ^1.12 — HTTP client
- `dexie` ^4.0 — IndexedDB wrapper (local storage)
- `vue-i18n` ^11.1 — Internationalization
- `pino` ^9.7 / `pino-pretty` — Logging

**Content & Game:**
- `node-downloader-helper` — Download manager
- `7zip-bin` — Archive extraction for game content
- `luaparse` — Lua parsing (game options)
- `@extractus/feed-extractor` — RSS/feed parsing (news)
- `marked` — Markdown rendering
- `dompurify` — Sanitization
- `howler` — Audio

**UI:**
- `@iconify/vue`, `@iconify/json`, `@iconify-icons/mdi` — Icons
- `flag-icons` — Country flags
- `date-fns` — Date formatting
- `@vueuse/core` — Composition utilities

## Configuration

**Environment:**
- No `.env` in repo; app config in `src/main/config/` (e.g. `server.ts`, `app.ts`, `content-sources.ts`)

**Build:**
- `forge.config.cjs` — Electron Forge (Vite plugin, main/preload/renderer entries)
- `vite.main.config.mts`, `vite.preload.config.mts`, `vite.renderer.config.mts` — Vite targets
- `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json`, `tsconfig.shared.json` — TypeScript
- `electron-builder.config.ts` — Installer/packaging

## Platform Requirements

**Development:**
- Node 22.16.x (or use `.nvmrc` / `mise.toml`)
- Windows, Linux, or macOS

**Production:**
- Packaged as Electron app (Windows installer, Linux packages, or macOS via electron-builder)
- `npm run build:win` / `build:linux` for platform-specific builds

---

*Stack analysis: 2025-03-03*
*Update after major dependency changes*
