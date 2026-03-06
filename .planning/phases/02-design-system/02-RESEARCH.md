# Phase 2: Design System - Research

**Researched:** 2026-03-04
**Domain:** Vue 3 design system hardening, SCSS utility migration, component consistency
**Confidence:** HIGH

## Summary

Phase 2 is a **remediation and documentation phase**, not a greenfield build. The design system infrastructure already exists: typography classes (`_text.scss`), spacing utilities (`_spacing.scss`), flex/layout utilities (`_flex.scss`, `_utils.scss`), and a component library (`components/common/` + `components/controls/`). The Cursor enforcement rule (`.cursor/rules/design-system-enforcement.mdc`) and the Styles tab showcase (`views/styles/new-styles.vue`) were established in Quick Task 1.

The work is: (1) migrate ~195 hardcoded violations across ~40 files to use existing design system utilities, (2) replace ~10 native element usages with design system components, (3) triage ~60 `!important` usages, and (4) ensure the Styles tab is complete and accurate as the single source of truth.

**Primary recommendation:** Batch files by violation type and severity. Start with typography and spacing migrations (mechanical, low-risk), then component replacements (moderate risk — behavioral changes possible), then `!important` triage (judgment calls). Do NOT introduce a color token system in this phase — the audit noted it as missing but DS-01 doesn't require it and it would be a large scope addition.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DS-01 | Design system is documented and applied consistently; Styles tab is the source of truth for components and tokens | Typography migration removes ~55 hardcoded font-sizes. Spacing migration removes ~70 hardcoded padding/margin/gap values. Component replacement removes ~10 native element usages. Styles tab audit ensures completeness. `.cursorrules` and enforcement rule already document conventions. |
</phase_requirements>

## Standard Stack

### Core (Already In Place)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 | 3.x (via Electron 37) | Component framework | Project standard |
| SCSS (Dart Sass) | ^1.89.2 | Preprocessor for design tokens | Project standard, `@use` module system |
| PrimeVue | 3.23.0 | Underlying component library | Wrapped by design system controls |
| Vite | ^7.1.11 | Build tool | SCSS `additionalData` injects `_utils.scss` for variable scope |

### Supporting (Already In Place)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @iconify/vue | ^5.0.0 | Icon system | All icons in components |
| @vueuse/core | ^13.5.0 | Vue composables | Utility hooks (e.g., `onKeyDown`) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SCSS utility classes | CSS custom properties for spacing/typography | Would require rewriting the entire utility system — not worth it for this phase |
| Manual migration | Automated codemod (e.g., jscodeshift + postcss) | Tempting but risky: the mapping from pixel values to design tokens requires context (a `12px` font-size maps to `.caption-1` but a `12px` gap maps to `gap-md`). Manual review is safer. |
| Color tokens now | Defer to Phase 3 | Color tokens would be valuable but are not required by DS-01 and would significantly expand scope |

**Installation:** No new dependencies required. Everything is already in the project.

## Architecture Patterns

### Existing Project Structure
```
src/renderer/
├── styles/                    # Global SCSS (spacing, text, flex, utils, etc.)
│   ├── styles.scss            # Entry point — @use's all partials
│   ├── _spacing.scss          # Spacing scale ($spacing map + utility classes)
│   ├── _text.scss             # Typography classes + heading defaults
│   ├── _flex.scss             # Flex layout utilities
│   ├── _utils.scss            # General utilities (scroll-container, etc.)
│   ├── _document.scss         # Root/body/scrollbar styles
│   ├── _primevue.scss         # Global PrimeVue overrides
│   ├── _views.scss            # .view layout class
│   ├── _transitions.scss      # Vue transition classes
│   ├── _animations.scss       # Keyframe animations
│   ├── _reset.scss            # CSS reset
│   ├── _tooltip.scss          # Tooltip styles
│   └── _popper.scss           # Popper.js styles
├── components/
│   ├── common/                # Design system layout/feedback components
│   │   ├── Panel.vue          # Primary container (gradient bg, blur, borders)
│   │   ├── Modal.vue          # Dialog overlay (wraps Panel)
│   │   ├── InteractiveTile.vue # Card with hover effects
│   │   ├── Divider.vue        # Section separator
│   │   ├── Badge.vue          # Inline label/tag
│   │   ├── StatusCard.vue     # Semantic key-value display
│   │   ├── Progress.vue       # Progress bar
│   │   ├── Loader.vue         # Spinner
│   │   ├── Accordion.vue      # Wraps PrimeVue AccordionTab
│   │   ├── ScrollingTextPanel.vue  # Scrollable text container
│   │   ├── TabView.vue        # Tab navigation
│   │   ├── ContextMenu.vue    # Right-click menu
│   │   └── DownloadProgress.vue # Download-specific progress
│   └── controls/              # Design system form/input components
│       ├── Button.vue         # Primary button (wraps PrimeVue Button via Control)
│       ├── Control.vue        # Base wrapper (border, hover, disabled state)
│       ├── Textbox.vue        # Text input
│       ├── Textarea.vue       # Multi-line text
│       ├── Number.vue         # Numeric input
│       ├── SearchBox.vue      # Search input with icon
│       ├── Select.vue         # Dropdown (wraps PrimeVue Dropdown)
│       ├── Checkbox.vue       # Checkbox
│       ├── ToggleSwitch.vue   # Toggle (wraps PrimeVue InputSwitch)
│       ├── Options.vue        # Segmented controller
│       ├── Range.vue          # Slider
│       ├── AutoSuggest.vue    # Autocomplete input
│       ├── TriStateCheckbox.vue
│       ├── ToggleButton.vue
│       └── DownloadContentButton.vue
└── views/styles/
    └── new-styles.vue         # Styles tab showcase (THE source of truth)
```

### Pattern 1: Typography Migration
**What:** Replace hardcoded `font-size` in `<style>` blocks with typography class on the template element.
**When to use:** Every hardcoded font-size violation.
**Example:**
```vue
<!-- BEFORE -->
<template>
  <span class="username">{{ name }}</span>
</template>
<style scoped>
.username { font-size: 14px; font-weight: 600; }
</style>

<!-- AFTER -->
<template>
  <span class="username body-2-strong">{{ name }}</span>
</template>
<style scoped>
.username { /* font-size/weight removed — handled by typography class */ }
</style>
```

**Mapping table (pixel → class):**

| Pixel Value | Weight | Typography Class |
|-------------|--------|-----------------|
| 10px | 400 | `.caption-2` |
| 10px | 600 | `.caption-2-strong` |
| 12px | 400 | `.caption-1` |
| 12px | 600 | `.caption-1-strong` |
| 12px | 700 | `.caption-1-stronger` |
| 14px | 400 | `.body-2` |
| 14px | 600 | `.body-2-strong` |
| 14px | 700 | `.body-2-stronger` |
| 16px | 400 | `.body-1` (default — may not need class) |
| 16px | 600 | `.subtitle-2` or `.body-1-strong` |
| 16px | 700 | `.subtitle-2-stronger` |
| 20px | 600 | `.subtitle-1` |
| 24px | 600 | `.title-3` |
| 28px | 600 | `.title-2` |
| 32px | 600 | `.title-1` |
| 36px | 600 | (no exact match — use `.title-1` or custom) |
| 40px | 600 | `.large-title` |
| 68px | 600 | `.display` |

**Edge cases:**
- `rem`/`em` values: Convert to px first (1rem = 16px base), then map. E.g., `0.875rem` = 14px → `.body-2`.
- Values with no exact match (e.g., `8px`, `11px`, `13px`, `15px`, `36px`): Use nearest design token or keep as intentional exception with comment.
- `font-size` on `.p-button` or PrimeVue internals: May need `!important` or `:deep()` — handle case-by-case.

### Pattern 2: Spacing Migration
**What:** Replace hardcoded `padding`, `margin`, `gap` in `<style>` blocks with utility classes in template.
**When to use:** Every hardcoded spacing violation where the value maps to the spacing scale.
**Example:**
```vue
<!-- BEFORE -->
<template>
  <div class="content">...</div>
</template>
<style scoped>
.content { padding: 10px; gap: 5px; }
</style>

<!-- AFTER: map 10px → sm (8px) or md (12px), 5px → xs (4px) -->
<template>
  <div class="content padding-sm gap-xs">...</div>
</template>
<style scoped>
.content { /* padding/gap removed — handled by utility classes */ }
</style>
```

**Spacing mapping (pixel → token):**

| Pixel Value | Nearest Token | Exact Match? |
|-------------|--------------|--------------|
| 2px | `xxs` | YES |
| 3px | `xxs` (2px) | NO — round up to `xs` (4px) or keep with comment |
| 4px | `xs` | YES |
| 5px | `xs` (4px) | NO — use `xs` and accept 1px difference |
| 6px | `xs` (4px) or `sm` (8px) | NO — judgment call |
| 8px | `sm` | YES |
| 10px | `sm` (8px) or `md` (12px) | NO — use `sm` in most cases |
| 12px | `md` | YES |
| 15px | `md` (12px) or `lg` (16px) | NO — use `lg` in most cases |
| 16px | `lg` | YES |
| 20px | `lg` (16px) or `xl` (24px) | NO — use `xl` in most cases |
| 24px | `xl` | YES |
| 25px | `xl` (24px) | NO — use `xl` |
| 32px | `xxl` | YES |
| 40px | `xxl` (32px) or `xxxl` (48px) | NO — use `xxxl` or `xxl` |
| 48px | `xxxl` | YES |
| 50px | `xxxl` (48px) | NO — use `xxxl` |
| 56px | `xxxxl` | YES |

**Compound values** (`padding: 10px 25px 5px 50px`): These need to be decomposed into directional utilities or kept as SCSS using `map.get($spacing, ...)`.

**SCSS fallback pattern:** When utility classes can't express a compound value, use `map.get` in the style block:
```scss
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.element {
    padding: map.get($spacing, "sm") map.get($spacing, "xl");
}
```

### Pattern 3: Component Replacement
**What:** Replace native `<button>`, `<input>`, `<select>` with design system equivalents.
**When to use:** Every component violation.
**Risk level:** MODERATE — behavioral changes possible (click handlers, form submission, styling).
**Example:**
```vue
<!-- BEFORE -->
<button class="login-button" @click="login">Login</button>

<!-- AFTER -->
<Button class="green" @click="login">Login</Button>
```

**Key considerations:**
- Native `<button>` → `<Button>`: The design system Button wraps PrimeVue's Button inside a `Control` wrapper. Click handlers work the same. Custom styling (fonts, padding) should be replaced by Button's built-in variants (`slim`, `large`, color classes).
- Native `<input>` → `<Textbox>`: Uses `v-model` the same way. Check if `placeholder`, `disabled`, `type` attributes are supported by the wrapper.
- Close buttons (`div.close @click`) → Keep as-is or use a dedicated close button pattern. The Modal component already has a standard close button pattern.
- Some native buttons serve as invisible overlays (e.g., download button `__clickable`) — these are exceptions, not violations.

### Pattern 4: !important Triage
**What:** Review each `!important` usage and either (a) remove by fixing specificity, (b) keep with documenting comment, or (c) leave alone (PrimeVue overrides).
**When to use:** Every `!important` violation.

**Categories:**
1. **PrimeVue overrides** (e.g., `_primevue.scss`, `MapOptionsModal.vue`): Often necessary because PrimeVue uses inline styles or high-specificity selectors. Keep with comment.
2. **Disabled state overrides** (e.g., `Button.vue`): Necessary to override color-variant styles. Keep with comment.
3. **Cursor styles** (`_document.scss`): Game-specific custom cursors need `!important` to override PrimeVue. Keep with comment.
4. **Transition/animation overrides** (`_transitions.scss`): `height: 0 !important` for list-leave-to animation. Keep with comment.
5. **Lazy specificity** (avoidable): Can be fixed by increasing selector specificity or restructuring CSS.

### Anti-Patterns to Avoid
- **Changing visual appearance during migration:** The goal is to replace HOW styles are expressed, not WHAT they look like. If `font-size: 13px` becomes `.body-2` (14px), that's a 1px visual change — document it but accept it.
- **Mass find-and-replace without context:** A `12px` font-size maps to `.caption-1`, but a `12px` padding maps to `padding-md`. The property name matters.
- **Creating new spacing/typography tokens:** The existing scale is sufficient. If a value doesn't map exactly, use the nearest token. Don't add `xxxs: 1px` or `tiny: 3px`.
- **Migrating dynamic/computed styles:** `:style="{ fontSize: computed + 'px' }"` is an allowed exception per the enforcement rule. Don't try to make these use utility classes.
- **Touching the Styles showcase page for violations:** The showcase page in `views/styles/new-styles.vue` is intentionally using hardcoded styles for demo purposes — it's an allowed exception.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Button with hover/active states | Custom `<button>` with CSS | `<Button>` component with color class | Button has sound effects, route handling, disabled states, PrimeVue integration |
| Text input with styling | Native `<input>` with CSS | `<Textbox>` component | Textbox wraps Control for consistent borders, hover, disabled, label support |
| Dropdown/select | Native `<select>` | `<Select>` component | Wraps PrimeVue Dropdown with project styling |
| Toggle on/off | Custom checkbox CSS | `<ToggleSwitch>` | Wraps PrimeVue InputSwitch |
| Modal dialog | Custom overlay + div | `<Modal>` component | Handles teleport, escape key, form submission, Panel integration |
| Container with glass effect | Custom div with backdrop-filter | `<Panel>` component | Panel has gradient, blur, border, box-shadow, squares overlay |

**Key insight:** The design system components embed game-specific visual treatment (custom cursors, audio hover effects, backdrop blur, squares overlay texture). Native HTML elements will never match this aesthetic. Always use the design system wrapper.

## Common Pitfalls

### Pitfall 1: Specificity Wars with Scoped Styles
**What goes wrong:** Adding a utility class in the template doesn't override a scoped `<style>` rule because scoped selectors have the `[data-v-xxx]` attribute selector which increases specificity.
**Why it happens:** `.padding-sm` (global, specificity 0,1,0) loses to `.content[data-v-abc123]` (scoped, specificity 0,2,0) which has `padding: 10px`.
**How to avoid:** When migrating, REMOVE the hardcoded property from the scoped style block in addition to adding the utility class. Don't just add the class and hope it wins.
**Warning signs:** The visual appearance doesn't change after adding a utility class.

### Pitfall 2: Compound Spacing Values
**What goes wrong:** `padding: 5px 10px 5px 50px` can't be expressed as a single utility class.
**Why it happens:** The utility system generates `padding-{size}` (all sides) and `padding-{direction}-{size}` (one side), but not compound shorthands.
**How to avoid:** Decompose into `padding-top-xs padding-right-sm padding-bottom-xs padding-left-xxxl` or use `map.get($spacing, ...)` in SCSS for compound values.
**Warning signs:** Multiple directional padding/margin classes on one element become unwieldy.

### Pitfall 3: Typography on Nested Elements
**What goes wrong:** A typography class on a parent doesn't propagate to children that have their own font-size rules (e.g., PrimeVue internal elements, or children with scoped font-size).
**Why it happens:** CSS inheritance is blocked by more specific rules on child elements.
**How to avoid:** Apply typography classes directly to the text-bearing element, not a wrapper. If the text is inside a PrimeVue component, you may need `:deep()` to target internal elements.
**Warning signs:** Text size doesn't change despite adding a typography class.

### Pitfall 4: Breaking PrimeVue Component Styles
**What goes wrong:** Removing `!important` from a PrimeVue override causes the PrimeVue default style to show through.
**Why it happens:** PrimeVue 3.23.0 uses inline styles and high-specificity selectors internally.
**How to avoid:** For PrimeVue overrides, keep `!important` and add a comment: `/* Override PrimeVue default — no other way to change this */`. Don't treat all `!important` as violations.
**Warning signs:** PrimeVue components suddenly look wrong (default blue theme, wrong sizes, etc.).

### Pitfall 5: Visual Regressions from Approximate Token Mapping
**What goes wrong:** Replacing `padding: 10px` with `padding-sm` (8px) causes a noticeable visual difference in tight layouts.
**Why it happens:** The spacing scale has gaps (8px, 12px — no 10px).
**How to avoid:** For values that don't have exact token matches, prefer the CLOSEST token. For `10px`: use `sm` (8px) in most cases; use `md` (12px) if extra space looks better. Document the choice. If the visual difference is unacceptable, keep the hardcoded value with a comment explaining it's an intentional off-scale value.
**Warning signs:** Layouts shift noticeably, text feels cramped or floaty.

### Pitfall 6: Forgetting to Remove Old CSS After Adding Utility Class
**What goes wrong:** Both the utility class AND the scoped CSS property apply. If they conflict, the scoped CSS wins (higher specificity). If they agree, there's dead code.
**Why it happens:** Easy to forget the second step (removing the CSS property) when focused on adding the class.
**How to avoid:** For each migration: (1) add class to template, (2) remove property from style block, (3) verify visually. Remove empty CSS rules entirely.
**Warning signs:** CSS properties with no effect, duplicate styling.

## Code Examples

### Example 1: Typography Migration (ChatComponent.vue pattern)
```vue
<!-- BEFORE: hardcoded font-size in multiple places -->
<style scoped>
.message-author { font-size: 14px; font-weight: 600; }
.message-text { font-size: 14px; }
.timestamp { font-size: 12px; color: rgba(255,255,255,0.5); }
</style>

<!-- AFTER: typography classes, CSS cleaned up -->
<template>
  <span class="message-author body-2-strong">{{ author }}</span>
  <span class="message-text body-2">{{ text }}</span>
  <span class="timestamp caption-1">{{ time }}</span>
</template>
<style scoped>
.timestamp { color: rgba(255,255,255,0.5); }
/* font-size/weight properties removed — using typography classes */
</style>
```

### Example 2: Spacing Migration with map.get Fallback
```scss
// BEFORE
.sidebar { padding: 10px 25px 5px 50px; gap: 10px; }

// AFTER — using map.get for compound padding, utility class for gap
// Template: <div class="sidebar gap-sm">
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.sidebar {
    padding: map.get($spacing, "sm") map.get($spacing, "xl") map.get($spacing, "xs") map.get($spacing, "xxxl");
}
```

### Example 3: Button Component Replacement
```vue
<!-- BEFORE: native button -->
<button class="login-button" @click="login">
  {{ t("lobby.views.index.login") }}
</button>

<!-- AFTER: design system Button -->
<Button class="green large" @click="login">
  {{ t("lobby.views.index.login") }}
</Button>
```

### Example 4: !important Triage Comment
```scss
// KEPT: PrimeVue paginator uses inline display — only way to override
.p-paginator {
    display: inline-flex !important; /* Override PrimeVue inline style */
}

// REMOVED: was just lazy specificity — fixed with proper selector
// BEFORE: .content { padding: 10px !important; }
// AFTER:  .context-menu .content { padding: map.get($spacing, "sm"); }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.text-xs`, `.text-sm`, `.txt-md` classes | `.caption-1`, `.body-2`, `.body-1` semantic classes | Quick Task 1 (2026-03-04) | Old aliases kept for backward compat but deprecated |
| PrimeVue InputSwitch direct import | `<ToggleSwitch>` design system wrapper | Quick Task 1 (2026-03-04) | Showcase updated, rule enforces wrapper use |
| No enforcement | `.cursor/rules/design-system-enforcement.mdc` | Quick Task 1 (2026-03-04) | Auto-triggers on `.vue` file edits |
| `@use "utils"` commented out | Uncommented in `styles.scss` | Quick Task 1 (2026-03-04) | `.min-height-0`, `.flex-shrink-0` now globally available |

**Deprecated/outdated:**
- `.text-xs`, `.text-sm`, `.text-base`, `.text-lg` through `.text-9xl` classes: Still defined in `_text.scss` for backward compat. New code should use semantic typography classes.
- `.txt-xs`, `.txt-sm`, `.txt-md`, `.txt-lg`, `.txt-xl` classes: Same — backward compat aliases.

## Open Questions

1. **Off-scale values: round or keep?**
   - What we know: Values like 3px, 5px, 6px, 10px, 15px, 20px, 25px, 50px don't have exact spacing tokens.
   - What's unclear: Whether a 1-2px visual difference is acceptable across the board.
   - Recommendation: Round to nearest token for most cases. Keep hardcoded (with comment) only if rounding creates a visibly broken layout. Err on the side of consistency.

2. **Deprecated typography aliases: remove or keep?**
   - What we know: `.text-xs` through `.text-9xl` and `.txt-*` aliases exist in `_text.scss`. They're not used in the audit violations but may be used elsewhere.
   - What's unclear: How many files reference these deprecated classes.
   - Recommendation: Keep deprecated aliases for now (Phase 2 scope is migration, not removal). Add a TODO to remove in a future pass.

3. **Color tokens: when?**
   - What we know: Colors are hardcoded everywhere (rgba values in style blocks). The audit flagged this as missing from the design system.
   - What's unclear: Whether DS-01 requires color tokens.
   - Recommendation: OUT OF SCOPE for Phase 2. DS-01 says "documented and applied consistently" — the current color usage is consistent (same rgba patterns), it's just not tokenized. Color tokens would be a Phase 3+ concern.

4. **Styles tab completeness: what's missing?**
   - What we know: The Styles tab (`new-styles.vue`) shows typography, buttons, interactive tiles, status cards, badges, scrolling text panels, inputs, selection controls, panels, progress, loader, accordion.
   - What's unclear: Whether it needs to show all color swatches, all layout utilities, or deprecated class mappings.
   - Recommendation: Add a "Layout Utilities" section (flex-row, flex-col, gap-*, scroll-container, etc.) and ensure all spacing/typography tokens are shown (they currently are). Don't add color tokens (out of scope).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 |
| Config file | `vitest.config.mts` |
| Quick run command | `npx vitest run --reporter verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DS-01 (typography) | No hardcoded font-size in migrated files | lint/grep | `rg "font-size:" --glob "*.vue" --glob "!**/styles/**" --glob "!**/new-styles.vue"` | N/A — grep-based |
| DS-01 (spacing) | No hardcoded padding/margin/gap in migrated files | lint/grep | `rg "(padding|margin|gap):\s*\d+px" --glob "*.vue" --glob "!**/styles/**" --glob "!**/new-styles.vue"` | N/A — grep-based |
| DS-01 (components) | No native `<button>` in migrated files | lint/grep | `rg "<button" --glob "*.vue" --glob "!**/new-styles.vue" --glob "!**/Button.vue"` | N/A — grep-based |
| DS-01 (showcase) | Styles tab renders without errors | manual | Load app → navigate to Styles tab | manual-only |
| DS-01 (docs) | `.cursorrules` documents all design system conventions | manual | Review `.cursorrules` content | manual-only |

### Sampling Rate
- **Per task commit:** `rg "font-size:|padding:\s*\d|margin:\s*\d|gap:\s*\d" --glob "*.vue"` on modified files
- **Per wave merge:** Full grep audit across all `.vue` files
- **Phase gate:** Full grep audit shows zero violations in migrated files + Styles tab loads correctly

### Wave 0 Gaps
None — existing test infrastructure (Vitest + grep-based validation) covers all phase requirements. No new test files needed since DS-01 validation is structural/static analysis, not runtime behavior.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection:** Direct reading of `_spacing.scss`, `_text.scss`, `_flex.scss`, `_utils.scss`, `Button.vue`, `Control.vue`, `Panel.vue`, `Modal.vue`, `new-styles.vue`, `.cursorrules`, `.cursor/rules/design-system-enforcement.mdc`
- **Audit data:** Violation counts and file lists from prior quick task audit
- **Quick Task 1 summary:** `.planning/quick/1-fix-design-system-infrastructure-gaps-an/1-SUMMARY.md`

### Secondary (MEDIUM confidence)
- **Spacing/typography mapping tables:** Derived from inspecting `_spacing.scss` and `_text.scss` — exact pixel values confirmed in source

### Tertiary (LOW confidence)
- None — all findings are from direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — direct codebase inspection, no external dependencies to verify
- Architecture: HIGH — patterns derived from existing code, not theoretical recommendations
- Pitfalls: HIGH — based on concrete SCSS specificity rules and real violation patterns in the codebase

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable — design system infrastructure unlikely to change before Phase 2 execution)
