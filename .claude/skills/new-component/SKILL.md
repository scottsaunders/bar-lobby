---
description: Scaffold a new Vue component with correct project boilerplate. Use when creating a new component file.
arguments: [component-name, destination-path]
allowed-tools: Read Write
---

Create a new Vue component named $ARGUMENTS.

Before scaffolding, read these to confirm current boilerplate patterns:
- `src/renderer/components/common/Panel.vue` — reference for panel/slot patterns
- `src/renderer/styles/_spacing.scss` — available spacing tokens

Then create the component at the destination path with:

```vue
<template>
  <!-- component markup here -->
</template>

<script lang="ts" setup>
// imports here
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

// styles here
</style>
```

Rules to follow:
- SCSS: always include the two `@use` lines above before any styles
- No `font-family: Rajdhani` — removed from project
- No redundant `font-family: Montserrat` — it's the global default
- Use spacing tokens (from `_spacing.scss`) for padding/margin/gap, not raw px
- Iconify icons: import directly — `import iconName from "@iconify-icons/mdi/icon-name"` and bind with `:icon="iconName"`, never `icon="mdi:name"`
- Prefer existing controls (`src/renderer/components/controls/`) and common components over custom implementations

After creating the file, remind the user to run `/design-check` once the component has real content.
