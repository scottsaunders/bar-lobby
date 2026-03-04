# Codebase Concerns

**Analysis Date:** 2025-03-03

## Tech Debt

**Test coverage:**
- Only a few tests in `tests/` (subscription-manager, parse-lua-table, e2e); most of `src/main` and `src/renderer` untested
- Impact: Refactors and regressions harder to catch
- Fix: Add unit tests for services, content parsers, and critical store logic; consider Vue component tests for design system and key flows

**Worker usage:**
- Main process uses workers (e.g. `parse-replay-worker.ts`, `map-image-worker.ts`) for heavy parsing; ensure worker lifecycle and error handling are robust and tests or E2E cover failure paths
- Impact: Crashes or hangs in workers can affect UX
- Fix: Document worker contract; add integration tests or E2E that trigger worker code paths

**State management in renderer:**
- Custom store modules (e.g. `chat.store.ts`, `battle.store.ts`) instead of Pinia; consistency and devtools support may vary
- Impact: Harder to debug and standardize patterns as app grows
- Fix: Either standardize on a single pattern (e.g. Pinia) or document store conventions and consider devtools integration

## Known Bugs

- No explicit known-bugs list in repo; check issue tracker and `errors.txt` (if present) for current issues
- When adding features, run `npm run checks` (typecheck, lint, format) and tests to avoid regressions

## Security Considerations

**Preload surface:**
- Preload must expose only what renderer needs; avoid exposing powerful or sensitive APIs
- Recommendation: Audit `preload.ts` and IPC handlers for least privilege; keep typed-ipc contract minimal

**External content:**
- Maps, replays, news feeds, and markdown come from external or user sources
- DOMPurify and safe rendering already in use; keep sanitization for any new user-generated or third-party HTML
- Recommendation: Centralize sanitization and validate content sources in config

**Secrets:**
- No secrets in repo; use env or secure storage for tokens and API keys
- Recommendation: Document required env vars and secure storage usage for auth

## Performance Bottlenecks

**Heavy parsing:**
- Lua parsing, replay parsing, map image generation run in main or workers; large files or many items could block UI
- Recommendation: Keep heavy work in workers; consider chunking or lazy loading for large lists (e.g. maps, replays)

**Bundle size:**
- Vite manual chunks (vue, primevue, iconify, view-*) help; monitor renderer bundle size as dependencies grow
- Recommendation: Audit new dependencies and lazy-load routes where appropriate

## Fragile Areas

**Content loaders and parsers:**
- Map/replay/engine content depend on external format and CDN structure; changes upstream can break parsing or downloads
- Safe modification: Keep parsing behind clear interfaces; add tests for sample data; version or feature-flag format changes

**Tachyon protocol:**
- Game lobby and battle logic depend on `tachyon-protocol` and server behavior; protocol or server changes can break client
- Safe modification: Encapsulate protocol usage in services; document message shapes and flows; consider compatibility tests if protocol is versioned

**Electron and native deps:**
- Electron, node-abi, 7zip-bin, and platform-specific builds can be sensitive to Node/Electron version
- Safe modification: Bump versions in a separate branch; run full build and E2E on all target platforms

## Recommendations Summary

1. Increase test coverage for main services and renderer stores; add Vue component tests for critical UI
2. Document worker contracts and error handling; add tests or E2E for worker paths
3. Standardize or document renderer state pattern; consider Pinia if team grows
4. Audit preload/IPC surface and content sanitization periodically
5. Keep content and protocol integration behind clear boundaries and config for easier upgrades and debugging

---

*Concerns analysis: 2025-03-03*
