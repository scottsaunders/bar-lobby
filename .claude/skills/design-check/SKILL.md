---
description: Audit a component or view for design system compliance. Use after completing a component, or when asked if something looks right visually or structurally.
allowed-tools: Read Grep
---

Audit the file(s) at $ARGUMENTS (or the most recently edited file if none given) for design system compliance.

## Step 1 — Load the design system reference

Read these files to understand what tokens and components are available before auditing:
- `src/renderer/styles/_spacing.scss` — spacing tokens
- `src/renderer/styles/_text.scss` — typography tokens
- `src/renderer/views/styles/new-styles.vue` — design system documentation and constants

## Step 2 — Read the shared component libraries

Scan what's available so you can flag reinvented wheels:
- `src/renderer/components/controls/` — Button, Checkbox, Select, Textbox, ToggleSwitch, Range, Number, etc.
- `src/renderer/components/common/` — Panel, Modal, Badge, Accordion, Loader, TabView, etc.

## Step 3 — Audit the target file

Check for:

**Token usage**
- Are spacing tokens used instead of hardcoded px values in padding/margin/gap?
- Are typography classes/tokens used instead of raw font-size/font-weight declarations?
- Flag raw values that have a token equivalent.

**Shared components**
- Is the component reinventing something that already exists in controls/ or common/?
- Flag cases where a custom button, input, or panel is built instead of using the shared one.

**Font family**
- Flag any `font-family: Rajdhani` — it was removed from the project.
- Flag redundant `font-family: Montserrat` — it's the global default, no need to re-declare.
- ⚠️ Exception: do NOT flag font-size values inside compact navbar widget files (PartyWidget, MatchmakingNavIndicator, anything living in the 64px top navbar row). Those use intentional off-scale sizes for visual balance. Only apply font-size checks to content views and full panels.

**Known code bugs (not in design system docs — check these explicitly)**

1. Iconify icons — flag any `<Icon icon="mdi:name" />` (string API, silently renders blank). Must be:
   ```ts
   import iconName from "@iconify-icons/mdi/name"
   // template: <Icon :icon="iconName" />
   ```

2. `useRoute()` outside RouterView — flag any `useRoute()` call in components that live outside the RouterView tree (NavBar, PartyWidget, App.vue-level). Must use `useRouter().currentRoute.value` instead.

3. Static JSON imports in stores — flag any top-level `import` of large JSON files (e.g. `en.json`) inside `*.store.ts` files. Must use dynamic `await import()` inside async functions.

## Output format

For each violation:
```
[VIOLATION] <rule>
  Line X: <quoted code>
  Fix: <concrete replacement>
```

If clean: `No design system violations found.`
