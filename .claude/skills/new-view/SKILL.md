---
description: Scaffold a new route view with correct project boilerplate including route metadata block.
arguments: [view-path]
allowed-tools: Read Write
---

Create a new route view at $ARGUMENTS.

Before scaffolding, confirm the route metadata pattern by checking one existing view, e.g. `src/renderer/views/home.vue`.

Then create the view with:

```vue
<route lang="json5">
{
  meta: {
    title: "View Title",
    order: 0, // adjust as needed
  }
}
</route>

<template>
  <!-- view markup here -->
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

Rules:
- Always include the `<route lang="json5">` block — this is how routes are registered (file-based via `unplugin-vue-router`)
- SCSS: always include the two `@use` lines
- No `font-family: Rajdhani`
- Use spacing tokens, not raw px for padding/margin/gap
- Iconify icons: direct import only, never string API

After creating the file, remind the user to run `/design-check` once the view has real content.
