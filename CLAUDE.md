# BAR Lobby — Claude Instructions

## Workflow rules

These rules are mandatory. Follow them without being asked.

### Before starting any new feature
Always invoke `/plan-feature <feature description>` before writing any code. Do not begin implementation until the plan has been reviewed and approved.

### When creating a new component
Invoke `/new-component <name> <path>` to scaffold it with correct boilerplate.

### When creating a new view
Invoke `/new-view <path>` to scaffold it with the route metadata block and correct boilerplate.

### When adding a new IPC channel
Invoke `/new-ipc <channel-name>` to ensure all three required files are updated together.

### After completing a component or view
Invoke `/design-check <file-path>` to audit it against the design system before considering it done.

### After a component passes design-check
Invoke `/promote-to-ds <file-path>` to evaluate whether it belongs in the shared component library. The skill will assess reusability and, if appropriate, move it to `controls/` or `common/` and document it in the styles view. This step is mandatory — every new component must be explicitly assessed.

## Project stack

Electron + Vue 3 + TypeScript + SCSS + PrimeVue.

- State: Vue `reactive()` singletons in `src/renderer/store/` (not Pinia)
- Routing: file-based via `unplugin-vue-router`, views in `src/renderer/views/`
- IPC: `src/main/typed-ipc.ts` → `src/preload/preload.ts` → `src/preload/interface.d.ts`
- Path aliases: `@renderer`, `@main`, `@preload`
- SCSS: global utils auto-injected; always add `@use "sass:map"` and `@use "@renderer/styles/spacing" as *;` at the top of component `<style>` blocks

## Design system

- Source of truth: `src/renderer/styles/`, `src/renderer/components/controls/`, `src/renderer/components/common/`
- Design system reference view: `src/renderer/views/styles/new-styles.vue`
- Always prefer existing shared components over custom implementations

## Known gotchas

- **Iconify icons**: use direct imports (`@iconify-icons/mdi/name`), never the string API (`icon="mdi:name"`)
- **Route reactivity**: `useRoute()` is not reactive outside `<RouterView>`. Use `useRouter().currentRoute.value` in NavBar and any component outside the RouterView tree.
- **JSON in stores**: never statically import large JSON at the top level of a `*.store.ts` file — use `await import()` inside async functions
- **Compact navbar widgets**: font-size values in PartyWidget, MatchmakingNavIndicator, and similar 64px-row components are intentionally off-scale — do not snap them to the design system scale
