# BAR Lobby

## What This Is

BAR Lobby is the desktop client for the real-time strategy game Beyond All Reason. It lets players navigate game modes (single-player skirmish and campaign, multiplayer lobbies and matchmaking), manage settings, view past games (replays), and read about game mechanics. The current focus is UX/UI: designing all screens with a reusable design system, while fixing internationalization and load performance so the client is reliable and fast.

## Core Value

Users see a clear, consistent, and fast client: every screen is designed with the design system, text shows in English (not i18n keys), and the app loads quickly without startup errors.

## Requirements

### Validated

- ✓ Electron + Vue 3 client with main/renderer/preload — existing
- ✓ Game modes: play (menu, skirmish, campaign, multiplayer lobby, matchmaking, custom lobbies, tournaments, scenarios) — existing
- ✓ Settings, profile, friends, downloads, news — existing
- ✓ Library: maps, replays; watch: replays — existing
- ✓ Design system started (Styles tab): components, spacing, typography — existing
- ✓ vue-i18n and locale assets — existing (needs fix)
- ✓ Tachyon protocol, content loading (maps, engine, game), OAuth2 — existing

### Active

- [ ] Design system: Harden and document reusable components and tokens (Styles tab as source of truth); apply consistently across all screens
- [ ] Screen design and IA: Design all client screens; iterate on layouts and information architecture; use faked data where needed until UX is locked
- [ ] Internationalization: Fix i18n so users see English (or correct locale) instead of localization keys in the UI; prefer proper vue-i18n wiring with English default; hard-coded English acceptable if needed
- [ ] Performance: Client loads quickly; reduce or eliminate long load times
- [ ] Stability: Initial setup and loading run without errors; fix startup error paths
- [ ] Selective functionality: Build only enough real behavior so designed flows work (e.g. navigation, real data where it serves design)

### Out of Scope

- Full backend/server integration for every screen — faked data is intentional until UX is nailed
- New game modes or protocol features — focus is UX/UI of existing flows
- Localization to additional languages (until i18n pipeline is fixed and English is reliable)

## Context

- UX director–led: primary goal is to design all screens; implementation supports design iteration
- Multiplayer lobby and related screens currently use faked data by design to iterate on UX without server dependency
- Codebase: Electron, Vue 3, PrimeVue, Vite; design system in `.cursorrules` and `src/renderer/components/` and `styles/`
- Known pain: i18n keys visible in UI; very slow load; errors during initial setup

## Constraints

- **Tech stack:** Must work within existing Electron + Vue 3 + PrimeVue + design system — no full rewrite
- **Performance:** Load time and startup stability are non-negotiable; fixes are in scope
- **i18n:** Either fix vue-i18n so keys don’t leak and English displays, or use hard-coded English
- **Design-first:** New functionality is added to support screen design, not the other way around

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design all screens with reusable design system | UX director priority; consistency and speed of iteration | — Pending |
| Use faked data for multiplayer/lobby until UX locked | Avoid blocking on server work while designing | — Pending |
| Fix i18n (keys → English) or fallback to hard-coded EN | Users must see readable text, not key names | — Pending |
| Prioritize load performance and startup stability | Client is currently extremely slow and error-prone | — Pending |

---
*Last updated: 2025-03-03 after GSD new-project initialization*
