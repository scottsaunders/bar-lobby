# Coding Conventions

**Analysis Date:** 2025-03-03

## Naming Patterns

**Files:**
- Vue components: PascalCase (e.g. `Button.vue`, `MapDetailModal.vue`, `TeamParticipant.vue`)
- TypeScript modules: kebab-case or camelCase (e.g. `tachyon-client.ts`, `map-content.ts`, `file-store.ts`)
- Test files: `*.test.ts` or `*.spec.ts` in `tests/`
- SCSS partials: `_kebab-case.scss` (e.g. `_utils.scss`, `_spacing.scss`, `_views.scss`)

**Functions:**
- camelCase for functions and methods
- Async: no special prefix; use `async` where needed
- Handlers: `handle*` for event handlers where convention is used (e.g. in Vue)

**Variables:**
- camelCase for variables and reactive refs
- Constants: UPPER_SNAKE_CASE where appropriate (e.g. config)
- No `_` prefix for private members in TS; use `private` or module scope

**Types:**
- Interfaces and types: PascalCase (no `I` prefix)
- Enums: PascalCase for enum name; values UPPER_SNAKE_CASE or PascalCase as appropriate

## Code Style

**Formatting:**
- Prettier (config: `prettier.config.mjs`); run `npm run format` / `npm run format:check`
- Project uses semicolons and consistent quote style per Prettier

**Linting:**
- ESLint flat config in `eslint.config.mjs`
- Plugins: typescript-eslint, eslint-plugin-vue; ESLint cache enabled
- Run: `npm run lint`
- Vue multi-word-component-names off; unused vars warn; unused imports plugin in use

## Import Organization

**Aliases:**
- `@main` → `src/main`
- `@renderer` → `src/renderer`
- `@preload` → `src/preload`
- `$` → `vendor`

**Order:**
- External packages first
- Then internal aliases (`@main`, `@renderer`, etc.)
- Then relative imports
- Type-only imports with `import type` where applicable

## Error Handling

**Patterns:**
- Main process: try/catch in IPC handlers and service entry points; errors logged via pino (`src/main/utils/logger.ts`)
- Renderer: component or store-level handling; user-facing errors via UI (modals, alerts)
- No global error boundary documented; failures handled at call site

**Logging:**
- Main: Pino (structured); `src/main/utils/logger.ts`; avoid console in production main
- Renderer: console acceptable for dev; consider user-facing messaging for errors

## Design System (enforced in .cursorrules)

**Components:**
- Prefer design system components: `Button`, `Panel`, `InteractiveTile`, `Loader`, `Modal`, `Select`, `Checkbox`, `ToggleSwitch`, `Textbox`, `Number`, `SearchBox`, etc. from `@renderer/components/`
- Button classes: `green`, `red`, `blue`, `black`, `grey`, `slim`, `large`, `fullwidth`
- Panel: use `no-padding` prop when needed

**Spacing:**
- Use spacing utilities (`gap-*`, `padding-*`, `margin-*`) from design system (e.g. `gap-lg`, `padding-xl`); avoid hard-coded pixel values

**Typography:**
- Use typography classes (`.title-1`, `.body-1`, `.caption-1`, etc.); avoid inline font-size/font-weight

**Avoid:**
- `!important` unless documented
- One-off components that duplicate design system; extend or use design system first

## Vue Conventions

- Composition API with `<script setup>` preferred
- File-based routing via unplugin-vue-router (files under `src/renderer/views/`)
- Stores: plain TS modules with reactive refs/computed in `src/renderer/store/`
- SCSS: `@use "@renderer/styles/_utils.scss"` injected via Vite for variables/mixins

## TypeScript

- Strict mode enabled via tsconfig
- Separate configs: `tsconfig.node.json` (main/preload), `tsconfig.web.json` (renderer)
- Run typecheck: `npm run typecheck` (concurrently node + web)
- Typed IPC: `src/main/typed-ipc.ts` for main–renderer contract

---

*Conventions analysis: 2025-03-03*
