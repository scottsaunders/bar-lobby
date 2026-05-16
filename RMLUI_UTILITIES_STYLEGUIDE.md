# RmlUi base utilities (BAR Lobby style guide translation)

This file translates the current lobby style guide (see `src/renderer/views/styles/new-styles.vue` and `src/renderer/styles/*`) into **RmlUi-friendly “base utilities”** you can copy/paste into your game UI RCSS.

The goal is to preserve your existing mental model and class names:
- Spacing tokens: `xxs/xs/sm/md/lg/xl/xxl/xxxl/xxxxl`
- Layout utilities: `flex-row`, `flex-col`, alignment helpers
- Typography scale: `display`, `title-*`, `body-*`, `caption-*`

---

## 1) Design tokens (reference)

These are the tokens shown in the “New Styles” view:

- **Spacing**
  - `xxs=2px`, `xs=4px`, `sm=8px`, `md=12px`, `lg=16px`, `xl=24px`, `xxl=32px`, `xxxl=48px`, `xxxxl=56px`
- **Typography**
  - `.display` = 68px semibold (Montserrat)
  - `.large-title` = 40px semibold
  - `.title-1` = 32px semibold
  - `.title-2` = 28px semibold
  - `.title-3` = 24px semibold
  - `.subtitle-1` = 20px semibold
  - `.subtitle-2` = 16px semibold
  - `.subtitle-2-stronger` = 16px bold
  - `.body-1` = 16px regular (default)
  - `.body-1-strong` = 16px semibold
  - `.body-2` = 14px regular
  - `.body-2-strong` = 14px semibold
  - `.body-2-stronger` = 14px bold
  - `.caption-1` = 12px regular
  - `.caption-1-strong` = 12px semibold
  - `.caption-1-stronger` = 12px bold
  - `.caption-2` = 10px regular
  - `.caption-2-strong` = 10px semibold

---

## 2) Copy/paste: `utilities.rcss` (layout + spacing + helpers)

Paste into a new RmlUi stylesheet (e.g. `utilities.rcss`) and include it in your UI.

```css
/* -------------------------------------------------------------------------- */
/* Root defaults                                                               */
/* -------------------------------------------------------------------------- */

body {
  background-color: #000;
  color: #fff;
  font-family: Montserrat, sans-serif;
  font-size: 16px;
  /* Approximates lobby text shadow: 1px 1px 0 rgba(0,0,0,0.6) */
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.6);
}

/* -------------------------------------------------------------------------- */
/* Layout utilities                                                            */
/* -------------------------------------------------------------------------- */

.flex-row { display: flex; flex-direction: row; }
.flex-col { display: flex; flex-direction: column; }

.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.flex-grow { flex-grow: 1; }
.flex-shrink { flex-shrink: 1; }
.flex-none { flex-grow: 0; flex-shrink: 0; }

.flex-center { justify-content: center; align-items: center; }
.flex-center-items { align-items: center; }
.flex-center-content { justify-content: center; }
.flex-center-self { align-self: center; }

.flex-space-between { justify-content: space-between; }
.flex-space-around { justify-content: space-around; }
.flex-justify-start { justify-content: flex-start; }
.flex-justify-end { justify-content: flex-end; }
.flex-align-start { align-items: flex-start; }
.flex-align-end { align-items: flex-end; }

/* “Push” helpers (match web utility semantics) */
.flex-left { margin-right: auto; }
.flex-right { margin-left: auto; }
.flex-top { margin-bottom: auto; }
.flex-bottom { margin-top: auto; }

.relative { position: relative; }
.hide-overflow { overflow: hidden; }

/* Size utilities */
.fullwidth { width: 100%; }
.fullheight { height: 100%; }

/* NOTE: In web, `.fullsize` also sets absolute positioning.
   In RmlUi, only use this if your document flow expects it. */
.fullsize { position: absolute; left: 0; top: 0; right: 0; bottom: 0; }

.min-height-0 { min-height: 0; }
.flex-shrink-0 { flex-shrink: 0; }

/* -------------------------------------------------------------------------- */
/* Spacing utilities                                                           */
/* -------------------------------------------------------------------------- */

/* GAP
   RmlUi support for `gap` may vary by version/renderer. If `gap` doesn't work,
   use the “stack” / “cluster” fallbacks in section (3). */

.gap-xxs { gap: 2px; }
.gap-xs  { gap: 4px; }
.gap-sm  { gap: 8px; }
.gap-md  { gap: 12px; }
.gap-lg  { gap: 16px; }
.gap-xl  { gap: 24px; }
.gap-xxl { gap: 32px; }
.gap-xxxl { gap: 48px; }
.gap-xxxxl { gap: 56px; }

/* Padding */
.padding-xxs { padding: 2px; }
.padding-xs  { padding: 4px; }
.padding-sm  { padding: 8px; }
.padding-md  { padding: 12px; }
.padding-lg  { padding: 16px; }
.padding-xl  { padding: 24px; }
.padding-xxl { padding: 32px; }
.padding-xxxl { padding: 48px; }
.padding-xxxxl { padding: 56px; }

.padding-top-xxs { padding-top: 2px; }
.padding-top-xs  { padding-top: 4px; }
.padding-top-sm  { padding-top: 8px; }
.padding-top-md  { padding-top: 12px; }
.padding-top-lg  { padding-top: 16px; }
.padding-top-xl  { padding-top: 24px; }
.padding-top-xxl { padding-top: 32px; }

.padding-right-xxs { padding-right: 2px; }
.padding-right-xs  { padding-right: 4px; }
.padding-right-sm  { padding-right: 8px; }
.padding-right-md  { padding-right: 12px; }
.padding-right-lg  { padding-right: 16px; }
.padding-right-xl  { padding-right: 24px; }
.padding-right-xxl { padding-right: 32px; }

.padding-bottom-xxs { padding-bottom: 2px; }
.padding-bottom-xs  { padding-bottom: 4px; }
.padding-bottom-sm  { padding-bottom: 8px; }
.padding-bottom-md  { padding-bottom: 12px; }
.padding-bottom-lg  { padding-bottom: 16px; }
.padding-bottom-xl  { padding-bottom: 24px; }
.padding-bottom-xxl { padding-bottom: 32px; }

.padding-left-xxs { padding-left: 2px; }
.padding-left-xs  { padding-left: 4px; }
.padding-left-sm  { padding-left: 8px; }
.padding-left-md  { padding-left: 12px; }
.padding-left-lg  { padding-left: 16px; }
.padding-left-xl  { padding-left: 24px; }
.padding-left-xxl { padding-left: 32px; }

/* Margin */
.margin-xxs { margin: 2px; }
.margin-xs  { margin: 4px; }
.margin-sm  { margin: 8px; }
.margin-md  { margin: 12px; }
.margin-lg  { margin: 16px; }
.margin-xl  { margin: 24px; }
.margin-xxl { margin: 32px; }
.margin-xxxl { margin: 48px; }
.margin-xxxxl { margin: 56px; }

.margin-top-xxs { margin-top: 2px; }
.margin-top-xs  { margin-top: 4px; }
.margin-top-sm  { margin-top: 8px; }
.margin-top-md  { margin-top: 12px; }
.margin-top-lg  { margin-top: 16px; }
.margin-top-xl  { margin-top: 24px; }
.margin-top-xxl { margin-top: 32px; }

.margin-right-xxs { margin-right: 2px; }
.margin-right-xs  { margin-right: 4px; }
.margin-right-sm  { margin-right: 8px; }
.margin-right-md  { margin-right: 12px; }
.margin-right-lg  { margin-right: 16px; }
.margin-right-xl  { margin-right: 24px; }
.margin-right-xxl { margin-right: 32px; }

.margin-bottom-xxs { margin-bottom: 2px; }
.margin-bottom-xs  { margin-bottom: 4px; }
.margin-bottom-sm  { margin-bottom: 8px; }
.margin-bottom-md  { margin-bottom: 12px; }
.margin-bottom-lg  { margin-bottom: 16px; }
.margin-bottom-xl  { margin-bottom: 24px; }
.margin-bottom-xxl { margin-bottom: 32px; }

.margin-left-xxs { margin-left: 2px; }
.margin-left-xs  { margin-left: 4px; }
.margin-left-sm  { margin-left: 8px; }
.margin-left-md  { margin-left: 12px; }
.margin-left-lg  { margin-left: 16px; }
.margin-left-xl  { margin-left: 24px; }
.margin-left-xxl { margin-left: 32px; }

/* -------------------------------------------------------------------------- */
/* Color utilities (minimal set used across UI)                                */
/* -------------------------------------------------------------------------- */

.txt-error { color: rgb(255, 100, 100); }
```

---

## 3) If `gap` isn’t supported: stack/cluster fallbacks

If your RmlUi build doesn’t support `gap`, prefer **“stack”** (vertical spacing) and **“cluster”** (horizontal spacing) utilities.

```css
/* Vertical spacing between children (column stack) */
.stack-xxs > * { margin-bottom: 2px; }
.stack-xs  > * { margin-bottom: 4px; }
.stack-sm  > * { margin-bottom: 8px; }
.stack-md  > * { margin-bottom: 12px; }
.stack-lg  > * { margin-bottom: 16px; }
.stack-xl  > * { margin-bottom: 24px; }
.stack-xxl > * { margin-bottom: 32px; }
.stack-xxxl > * { margin-bottom: 48px; }
.stack-xxxxl > * { margin-bottom: 56px; }
.stack-xxs > *:last-child,
.stack-xs  > *:last-child,
.stack-sm  > *:last-child,
.stack-md  > *:last-child,
.stack-lg  > *:last-child,
.stack-xl  > *:last-child,
.stack-xxl > *:last-child,
.stack-xxxl > *:last-child,
.stack-xxxxl > *:last-child { margin-bottom: 0; }

/* Horizontal spacing between children (row cluster) */
.cluster-xxs > * { margin-right: 2px; }
.cluster-xs  > * { margin-right: 4px; }
.cluster-sm  > * { margin-right: 8px; }
.cluster-md  > * { margin-right: 12px; }
.cluster-lg  > * { margin-right: 16px; }
.cluster-xl  > * { margin-right: 24px; }
.cluster-xxl > * { margin-right: 32px; }
.cluster-xxs > *:last-child,
.cluster-xs  > *:last-child,
.cluster-sm  > *:last-child,
.cluster-md  > *:last-child,
.cluster-lg  > *:last-child,
.cluster-xl  > *:last-child,
.cluster-xxl > *:last-child { margin-right: 0; }
```

Usage patterns:
- Replace `class="flex-col gap-md"` with `class="flex-col stack-md"`
- Replace `class="flex-row gap-sm"` with `class="flex-row cluster-sm"`

---

## 4) Copy/paste: `typography.rcss` (your typography scale)

```css
/* Typography scale mirroring `new-styles.vue` */

.display {
  font-size: 68px;
  font-weight: 600;
  font-family: Montserrat, sans-serif;
}

.large-title {
  font-size: 40px;
  font-weight: 600;
  font-family: Montserrat, sans-serif;
}

.title-1 { font-size: 32px; font-weight: 600; font-family: Montserrat, sans-serif; }
.title-2 { font-size: 28px; font-weight: 600; font-family: Montserrat, sans-serif; }
.title-3 { font-size: 24px; font-weight: 600; font-family: Montserrat, sans-serif; }

.subtitle-1 { font-size: 20px; font-weight: 600; font-family: Montserrat, sans-serif; }
.subtitle-2 { font-size: 16px; font-weight: 600; font-family: Montserrat, sans-serif; }
.subtitle-2-stronger { font-size: 16px; font-weight: 700; font-family: Montserrat, sans-serif; }

.body-1 { font-size: 16px; font-weight: 400; font-family: Montserrat, sans-serif; }
.body-1-strong { font-size: 16px; font-weight: 600; font-family: Montserrat, sans-serif; }

.body-2 { font-size: 14px; font-weight: 400; font-family: Montserrat, sans-serif; }
.body-2-strong { font-size: 14px; font-weight: 600; font-family: Montserrat, sans-serif; }
.body-2-stronger { font-size: 14px; font-weight: 700; font-family: Montserrat, sans-serif; }

.caption-1 { font-size: 12px; font-weight: 400; font-family: Montserrat, sans-serif; }
.caption-1-strong { font-size: 12px; font-weight: 600; font-family: Montserrat, sans-serif; }
.caption-1-stronger { font-size: 12px; font-weight: 700; font-family: Montserrat, sans-serif; }

.caption-2 { font-size: 10px; font-weight: 400; font-family: Montserrat, sans-serif; }
.caption-2-strong { font-size: 10px; font-weight: 600; font-family: Montserrat, sans-serif; }
```

---

## 5) Copy/paste: “base component skins” (panels, dividers, badges)

This is intentionally small — just enough to get the in-game UI off the ground with familiar visuals.

```css
/* Divider */
.divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Panel baseline (maps to “Panel Defaults” section in the style view)
   If gradients are not supported in your renderer, replace with solid rgba. */
.panel {
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 1px solid rgba(124, 124, 124, 0.3);
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.5);
}

.panel--no-padding { padding: 0; }

/* “Scrolling text panel” look (approx)
   Note: scrollbars and masking are renderer-dependent. */
.scrolling-text-panel {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 12px;
  overflow: auto;
}

/* Badge baseline */
.badge {
  padding: 2px 6px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.badge--primary { background-color: rgba(37, 99, 235, 0.35); }
.badge--success { background-color: rgba(34, 197, 94, 0.35); }
.badge--warning { background-color: rgba(243, 213, 79, 0.35); }
.badge--error { background-color: rgba(165, 30, 30, 0.35); }
```

---

## 6) Notes / known “web → RmlUi” mismatches

- **`gap`**: may not work; use `stack-*` / `cluster-*` fallbacks.
- **`backdrop-filter`, CSS masks, complex gradients**: may not be available depending on renderer. Prefer solid rgba fills first, then enhance.
- **Deep selectors (`:deep`)**: RmlUi doesn’t have component-scoped CSS; use explicit class names on elements you control.

