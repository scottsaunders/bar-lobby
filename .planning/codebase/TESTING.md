# Testing Patterns

**Analysis Date:** 2025-03-03

## Test Framework

**Runner:**
- Vitest 3.2
- Config: `vitest.config.mts` (root); reuses Vite resolve aliases: `@main`, `@renderer`, `@preload`, `$`

**Assertion:**
- Vitest built-in `expect` (Jest-compatible API)
- Matchers: `toBe`, `toEqual`, `toThrow`, etc.

**Run commands:**
```bash
npm test              # Run all tests (vitest tests)
npm test -- --watch   # Watch mode
npm test -- path/to/file.spec.ts   # Single file
```

## Test File Organization

**Location:**
- Top-level `tests/` directory (not colocated with `src/`)
- Files: `*.test.ts` or `*.spec.ts`

**Naming:**
- Unit/feature: `subscription-manager.test.ts`, `parse-lua-table.spec.ts`
- E2E: `e2e.spec.ts`

**Current tests:**
- `tests/subscription-manager.test.ts` — subscription manager logic
- `tests/parse-lua-table.spec.ts` — Lua table parsing (main process content)
- `tests/e2e.spec.ts` — End-to-end (likely Electron/Playwright or similar; not inspected in detail)

## Test Structure

**Pattern:**
- `describe` for module or feature
- `it` / `test` for cases
- Arrange/act/assert where applicable

**Coverage:**
- No coverage script in `package.json`; add `vitest --coverage` if needed
- Tests are limited (3 files); more coverage in `src/main` and `src/renderer` would help

## Integration with Codebase

**Main process:**
- Modules under `src/main/` can be tested by importing in Vitest; same Vite/alias config
- Workers (e.g. `parse-replay-worker.ts`, `map-image-worker.ts`) may need special handling (worker context)

**Renderer:**
- Vue components and stores can be unit-tested with Vitest + Vue Test Utils if added as dependency
- Currently no `@vue/test-utils` in package.json; E2E may cover critical UI flows via `e2e.spec.ts`

## Recommendations for New Tests

- Add unit tests alongside or under `tests/` for new services and content parsers
- Use `*.test.ts` or `*.spec.ts` consistently
- For Vue components: add `@vue/test-utils` and mount components when testing UI logic
- Keep E2E for critical user paths; use Vitest for fast feedback on logic and stores

---

*Testing analysis: 2025-03-03*
