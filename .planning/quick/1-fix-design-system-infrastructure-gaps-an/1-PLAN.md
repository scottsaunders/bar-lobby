---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/renderer/styles/styles.scss
  - src/renderer/styles/_utils.scss
  - src/renderer/views/styles/new-styles.vue
  - .cursor/rules/design-system-enforcement.mdc
autonomous: true
requirements: [DS-01]

must_haves:
  truths:
    - "Utility classes min-height-0 and flex-shrink-0 actually apply styles (currently no-ops)"
    - "_utils.scss is loaded globally so utility CSS is not duplicated per component"
    - "Styles showcase uses the design system ToggleSwitch, not raw PrimeVue InputSwitch"
    - "Cursor agent checks design system compliance on every .vue file edit"
  artifacts:
    - path: "src/renderer/styles/_utils.scss"
      provides: "min-height-0 and flex-shrink-0 utility classes"
      contains: "min-height-0"
    - path: "src/renderer/styles/styles.scss"
      provides: "Global utils import (uncommented)"
      contains: '@use "utils"'
    - path: "src/renderer/views/styles/new-styles.vue"
      provides: "Showcase using ToggleSwitch component"
      contains: "ToggleSwitch"
    - path: ".cursor/rules/design-system-enforcement.mdc"
      provides: "Active enforcement rule for design system compliance"
  key_links:
    - from: "src/renderer/styles/styles.scss"
      to: "src/renderer/styles/_utils.scss"
      via: '@use "utils"'
      pattern: '@use "utils"'
    - from: "src/renderer/views/styles/new-styles.vue"
      to: "src/renderer/components/controls/ToggleSwitch.vue"
      via: "import ToggleSwitch"
      pattern: "ToggleSwitch"
---

<objective>
Fix design system infrastructure gaps: uncomment the global `_utils.scss` import, add missing utility classes that are used in 20+ template files but have no CSS definitions, replace raw PrimeVue InputSwitch usage in the styles showcase with the design system ToggleSwitch component, and create a Cursor enforcement rule for ongoing compliance.

Purpose: The design system has silent failures (classes with no effect) and its own showcase page violates its own rules. Fixing these + adding enforcement prevents regression.
Output: Working utility classes, correct showcase, enforcement rule.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/renderer/styles/styles.scss
@src/renderer/styles/_utils.scss
@vite.renderer.config.mts
@src/renderer/views/styles/new-styles.vue
@src/renderer/components/controls/ToggleSwitch.vue
@.cursorrules

<interfaces>
From src/renderer/components/controls/ToggleSwitch.vue:
```typescript
defineProps<{
    modelValue: boolean;
}>();

defineEmits<{
    (event: "update:modelValue", value: boolean): void;
}>();
```
Usage: `<ToggleSwitch v-model="booleanRef" />`

From src/renderer/styles/styles.scss (current state):
```scss
// @use "utils";  // <-- line 11, commented out
```

From vite.renderer.config.mts:
```typescript
css: {
    preprocessorOptions: {
        scss: {
            additionalData: `@use "@renderer/styles/_utils.scss";`,
        },
    },
},
```
Note: The Vite `additionalData` injects `_utils.scss` into every component's SCSS compilation. This is needed for SCSS variable/mixin access in `<style>` blocks but duplicates the CSS class output into every component. Uncommenting the global import in `styles.scss` makes the CSS classes available globally once. The `additionalData` should be kept because it provides SCSS `@use` scope (variables, mixins, functions) to component `<style>` blocks — that cannot be replaced by a global CSS import.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix _utils.scss global import and add missing utility classes</name>
  <files>src/renderer/styles/styles.scss, src/renderer/styles/_utils.scss</files>
  <action>
1. In `src/renderer/styles/styles.scss` line 11, uncomment the utils import: change `// @use "utils";` to `@use "utils";`

2. In `src/renderer/styles/_utils.scss`, add the two missing utility classes at the end of the file (before the closing blank line). These classes are used in 12+ and 8+ template files respectively but currently have zero CSS effect:

```scss
.min-height-0 {
    min-height: 0;
}

.flex-shrink-0 {
    flex-shrink: 0;
}
```

Do NOT remove the `additionalData` line in `vite.renderer.config.mts` — it is still needed for SCSS variable/mixin access within component `<style>` blocks. The global import in `styles.scss` just ensures utility CSS classes are emitted once globally rather than duplicated per component.
  </action>
  <verify>
    <automated>npx vite build 2>&1 | head -20</automated>
    Alternatively: run the dev server and confirm no compilation errors. Grep for the classes to confirm they exist in source: `grep -r "min-height-0" src/renderer/styles/_utils.scss` returns a match.
  </verify>
  <done>
    - `@use "utils"` is uncommented in styles.scss
    - `.min-height-0` and `.flex-shrink-0` classes are defined in `_utils.scss`
    - App compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace PrimeVue InputSwitch with design system ToggleSwitch in styles showcase</name>
  <files>src/renderer/views/styles/new-styles.vue</files>
  <action>
1. In the `<script>` section, replace the InputSwitch import:
   - Remove: `import InputSwitch from "primevue/inputswitch";`
   - Add: `import ToggleSwitch from "@renderer/components/controls/ToggleSwitch.vue";`

2. In the template, replace the InputSwitch usage (around line 762):
   - Change: `<InputSwitch v-model="toggleChecked" />`
   - To: `<ToggleSwitch v-model="toggleChecked" />`

3. In the `<style lang="scss">` (unscoped) block, remove the entire `.p-inputswitch` style block (lines 1166-1195). These styles were only needed for the PrimeVue InputSwitch component — the design system ToggleSwitch has its own scoped styles built in.

The design system ToggleSwitch component accepts `v-model` (boolean) with the same API pattern, so no other changes are needed.
  </action>
  <verify>
    <automated>grep -c "InputSwitch" src/renderer/views/styles/new-styles.vue</automated>
    Should return 0 (no remaining InputSwitch references). Also: `grep -c "ToggleSwitch" src/renderer/views/styles/new-styles.vue` should return 2+ (import + template usage).
  </verify>
  <done>
    - No `InputSwitch` or `primevue/inputswitch` references remain in new-styles.vue
    - ToggleSwitch is imported from the design system and used in the template
    - The `.p-inputswitch` unscoped styles block is removed
    - Toggle switch in the styles showcase renders and functions correctly
  </done>
</task>

<task type="auto">
  <name>Task 3: Create design system enforcement Cursor rule</name>
  <files>.cursor/rules/design-system-enforcement.mdc</files>
  <action>
Create `.cursor/rules/design-system-enforcement.mdc` with frontmatter and content that makes the Cursor agent actively check design system compliance on every `.vue` file edit.

The rule should be applied when editing `.vue` files (use glob: `**/*.vue` in frontmatter). It should contain:

**Frontmatter:**
```
---
description: Enforce design system compliance when editing Vue components
globs: **/*.vue
---
```

**Content should include:**

1. **Post-edit checklist** — after every `.vue` file edit, verify:
   - No hardcoded `font-size` in `<style>` blocks → use typography classes instead
   - No hardcoded `padding`, `margin`, or `gap` values in `<style>` blocks → use spacing utilities or `map.get($spacing, "key")` in SCSS
   - No native `<button>` elements → use `<Button>` from `@renderer/components/controls/Button.vue`
   - No native `<input>` or `<select>` elements → use design system controls (`Textbox`, `Select`, `Checkbox`, `ToggleSwitch`, `Number`, `SearchBox`, `Range`, `Options`)
   - No raw PrimeVue component imports when a design system wrapper exists (e.g., `primevue/inputswitch` → `ToggleSwitch`, `primevue/dropdown` → `Select`)
   - No `!important` without a comment explaining why

2. **Typography scale reference** (so the agent can suggest replacements):
   - 68px Semibold → `.display`
   - 40px Semibold → `.large-title`
   - 32px Semibold → `.title-1`
   - 28px Semibold → `.title-2`
   - 24px Semibold → `.title-3`
   - 20px Semibold → `.subtitle-1`
   - 16px Semibold → `.subtitle-2`
   - 16px Bold → `.subtitle-2-stronger`
   - 16px Regular → `.body-1` (default)
   - 16px Semibold → `.body-1-strong`
   - 14px Regular → `.body-2`
   - 14px Semibold → `.body-2-strong`
   - 14px Bold → `.body-2-stronger`
   - 12px Regular → `.caption-1`
   - 12px Semibold → `.caption-1-strong`
   - 12px Bold → `.caption-1-stronger`
   - 10px Regular → `.caption-2`
   - 10px Semibold → `.caption-2-strong`

3. **Spacing scale reference** (so the agent can suggest replacements):
   - 2px → `xxs`, 4px → `xs`, 8px → `sm`, 12px → `md`, 16px → `lg`, 24px → `xl`, 32px → `xxl`, 48px → `xxxl`, 56px → `xxxxl`
   - Class patterns: `gap-{size}`, `padding-{size}`, `padding-{direction}-{size}`, `margin-{size}`, `margin-{direction}-{size}`
   - SCSS usage: `map.get($spacing, "size")`

4. **Design system component registry** — quick lookup of what exists:
   - Layout: `Panel`, `Divider`, `InteractiveTile`, `ScrollingTextPanel`, `Modal`
   - Controls: `Button`, `Textbox`, `Number`, `SearchBox`, `Textarea`, `Select`, `Checkbox`, `ToggleSwitch`, `Options`, `Range`
   - Feedback: `Loader`, `Progress`, `StatusCard`, `Badge`
   - Container: `Accordion` (wraps PrimeVue AccordionTab)

5. **Allowed exceptions** — document that these are OK:
   - Dynamic inline styles computed from JS (e.g., `:style="{ width: computedWidth + 'px' }"`)
   - One-off showcase/demo styles in `src/renderer/views/styles/`
   - Genuinely unique values not in the spacing scale (document why in a comment)
   - `!important` with a comment explaining the specificity issue
  </action>
  <verify>
    <automated>test -f .cursor/rules/design-system-enforcement.mdc && echo "exists" || echo "missing"</automated>
    File exists and contains frontmatter with `globs: **/*.vue`.
  </verify>
  <done>
    - `.cursor/rules/design-system-enforcement.mdc` exists with correct frontmatter
    - Rule contains post-edit checklist, typography scale, spacing scale, component registry, and allowed exceptions
    - Rule triggers automatically when any `.vue` file is edited
  </done>
</task>

</tasks>

<verification>
1. App compiles without errors after utils changes
2. `grep -r "min-height-0" src/renderer/styles/` returns a match in `_utils.scss`
3. `grep -r "flex-shrink-0" src/renderer/styles/` returns a match in `_utils.scss`
4. `grep -c "InputSwitch" src/renderer/views/styles/new-styles.vue` returns 0
5. `grep -c "ToggleSwitch" src/renderer/views/styles/new-styles.vue` returns 2+
6. `.cursor/rules/design-system-enforcement.mdc` exists with `globs: **/*.vue`
</verification>

<success_criteria>
- All three infrastructure gaps fixed (utils import, missing classes, showcase InputSwitch)
- Enforcement rule in place for ongoing compliance
- No regressions — app compiles and styles page renders correctly
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-design-system-infrastructure-gaps-an/1-SUMMARY.md`
</output>
