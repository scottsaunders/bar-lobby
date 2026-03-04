# External Integrations

**Analysis Date:** 2025-03-03

## APIs & External Services

**Tachyon (game lobby protocol):**
- Purpose: Real-time game lobby, battles, matchmaking (Beyond All Reason)
- Client: `tachyon-protocol` npm package; WebSocket client in `src/main/tachyon/tachyon-client.ts`
- Usage: `src/main/services/tachyon.service.ts`, `game.service.ts`; battle/lobby state in renderer stores
- Auth: Likely tied to game/account auth (OAuth2 or token); see `src/main/oauth2/`, `auth.service.ts`, `account.service.ts`

**HTTP / REST:**
- Axios for HTTP (e.g. news, content APIs)
- Config: `src/main/config/server.ts`, `content-sources.ts` for base URLs and content sources
- No explicit external REST API docs in repo; endpoints defined in config and services

**RSS / News:**
- `@extractus/feed-extractor` for RSS/feed parsing
- Used by `src/main/services/news.service.ts` for news/devlog feeds
- Sources likely in config or content-sources

## Data Storage

**No remote database:**
- App is desktop; state is local

**Local storage:**
- File-based: JSON and app data under user data dir or project config (e.g. `src/main/json/file-store.ts`)
- IndexedDB: Dexie used in project; likely for renderer-side cache or offline data (exact usage in `src/renderer` not fully traced)
- Settings: `src/main/services/settings.service.ts`, `src/main/json/model/settings.ts`

**Downloads:**
- `node-downloader-helper` for downloading game content (maps, engine, etc.)
- 7z extraction via `7zip-bin` for archives
- Content stored locally (paths from config/content modules)

## Authentication & Identity

**OAuth2:**
- Implementation: `src/main/oauth2/` (oauth2.ts, pkce.ts, redirect-handler.ts)
- Used for game/account login (Beyond All Reason ecosystem)
- Tokens and session likely stored in main process (file or secure storage); not exposed to renderer except via safe API

**Account:**
- `src/main/services/account.service.ts`, `auth.service.ts`
- Models: `src/main/model/user.ts`, `src/main/json/model/account.ts`

## Content CDN / Sources

**Game content:**
- Maps, engine, game files, replays from external URLs (configured in `src/main/config/content-sources.ts`, `default-maps.ts`, `default-versions.ts`)
- Pool CDN referenced in `src/main/content/game/pool-cdn.ts`
- No hardcoded secrets in repo; URLs and options in config

## Build & Distribution

**Electron updater:**
- `electron-updater` in devDependencies; `src/main/content/auto-updater.ts`, `src/main/services/auto-updater.service.ts`
- Used for in-app updates on Windows/Linux (and macOS if configured)

## Monitoring & Logging

**Logging:**
- Pino in main process (`src/main/utils/logger.ts`); structured logs; no external log aggregation in repo
- No Sentry or analytics SDKs present in package.json

**Error reporting:**
- `src/main/utils/error-logger.ts` may forward errors; no external service assumed without inspection

## Security Notes

- No API keys or secrets in repo; config and env for sensitive values
- OAuth2 and auth flows in main process; preload exposes only intended APIs
- DOMPurify used for sanitizing markdown/HTML in renderer
- External content (maps, replays, feeds) from configured sources; validate and sanitize when rendering user or third-party content

---

*Integrations analysis: 2025-03-03*
