---
description: Evaluate a completed component for promotion into the shared design system, and if appropriate, add it to the component library and document it in the styles view.
disable-model-invocation: true
allowed-tools: Read Write Edit Glob
---

Evaluate the component at $ARGUMENTS for promotion into the BAR Lobby shared design system.

## Step 1 — Read the component

Read the component file and understand:
- What it renders
- What props/slots/emits it has
- How tightly coupled it is to its current feature context (store references, hardcoded strings, feature-specific logic)

## Step 2 — Read the current design system

Read `src/renderer/views/styles/new-styles.vue` to understand what's already documented. Check whether something equivalent already exists before proceeding.

## Step 3 — Assess reusability

Answer these questions:

1. **Is it visually generic?** Could it appear in at least 2-3 different places in the app without looking out of place?
2. **Is it logically generic?** Does it rely on feature-specific stores, hardcoded data, or business logic that would need to be stripped out?
3. **Does it have clear slot/prop boundaries?** Can a consumer control its content and behavior through props/slots, or is everything internal?
4. **Does something equivalent already exist** in `src/renderer/components/controls/` or `src/renderer/components/common/`?

**If it fails the assessment:** Report why the component is intentionally one-off and stop. Do not promote it.

## Step 4 — Determine destination

- `src/renderer/components/controls/` — interactive controls (inputs, buttons, toggles, selectors)
- `src/renderer/components/common/` — display and layout components (panels, badges, cards, loaders, containers)

## Step 5 — Generalize if needed

If the component has feature-specific logic that must be removed before it can be shared:
- Strip hardcoded store references — replace with props or slots
- Replace hardcoded strings with props
- Ensure all variants are exposed via props, not internal state

Ask for confirmation before making any changes to the component file itself.

## Step 6 — Copy to the shared library

Move or copy the component to its destination in `controls/` or `common/`. Do not delete the original until confirmed by the user.

## Step 7 — Document in the styles view

Add a new section to `src/renderer/views/styles/new-styles.vue` following the exact pattern used by existing sections:

```vue
<Divider />

<div class="flex-col gap-md">
    <h2>Component Name</h2>
    <p class="body-1">Use for: [one sentence describing when to reach for this component and what problem it solves]</p>
    <div class="flex-col gap-md" style="max-width: 600px;">
        <!-- Demo variants, same style as surrounding sections -->
        <div class="flex-col gap-sm">
            <h3>Variant Name</h3>
            <p class="body-1">[optional: brief note about this variant]</p>
            <!-- live demo using the actual component -->
        </div>
    </div>
</div>
```

Rules for the documentation section:
- "Use for:" must be a concrete, scannable description — not "displays data" but "use when showing status conditions with color-coded severity"
- Show all meaningful variants with live demos, not just one
- If the component accepts slots, add a "With Slots" subsection showing custom content
- Add the import to the `<script setup>` block at the bottom of the styles view
- Place the new section in a logical position relative to existing sections (controls near controls, layout near layout, etc.)
- Insert a `<Divider />` before the new section

## Step 8 — Summary

Report:
- Where the component was placed
- What changes were made to generalize it (if any)
- The section added to the styles view
- Any follow-up work needed (e.g., update existing usages to import from the new shared location)
