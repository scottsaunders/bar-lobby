# Keybind Editor — Porting Guide

This document describes the keybind editor feature end-to-end so that an engineer can transplant it into another branch of the BAR lobby client with minimal archaeology.

---

## What It Does

A full visual keybind editor for Beyond All Reason's `uikeys.txt` config file. Features:

- **Visual keyboard** — click/drag bindings onto keys, modifier layer switching (None / Shift / Ctrl / Alt / Any), live key preview (highlights held keys in real time)
- **Command palette** — searchable/filterable list of all game commands with category, unit-type, and dev-mode filters
- **List view** — table layout for power users who prefer scanning all bindings at once
- **Raw view** — inline textarea to paste/edit `uikeys.txt` content directly
- **Preset system** — built-in Grid Keys and Legacy presets; user can create, name, overwrite, and delete custom presets (persisted in localStorage)
- **Undo** — 20-step undo stack covering all binding mutations
- **Drag-and-drop swap** — drag from key to key swaps bindings, drag from palette to key assigns
- **Conflict/shared key detection** — surfaces keys bound to multiple commands
- **Save dialog** — writes to disk and optionally saves a named custom preset in one step

---

## Files to Copy

Copy these paths wholesale; they have no entanglements with the rest of the repo beyond the common infrastructure listed in the next section.

```
src/renderer/components/keybinds/
    KeybindEditor.vue          — top-level layout, toolbar, dialogs
    VisualKeyboard.vue         — keyboard + mouse + numpad layout
    KeyboardKey.vue            — individual key tile with all CSS states
    CommandPalette.vue         — searchable command list with drag source
    ModifierSelector.vue       — modifier layer toggle buttons
    KeyInspector.vue           — detail panel for a focused key
    ListEditor.vue             — flat list view
    AdvancedBindingsEditor.vue — editor for multi-key sequences
    CommandIcon.vue            — reusable command icon (SVG/GIF/PNG)

src/renderer/utils/uikeys/
    types.ts                   — all shared TS interfaces and unions
    parser.ts                  — parses uikeys.txt text → ParsedUikeys
    serializer.ts              — ParsedUikeys → uikeys.txt text
    keyboard-layout.ts         — key grid definitions for every section
    commands.ts                — master command list with categories/metadata
    command-icons.ts           — command → image asset map
    command-mouse-actions.ts   — static mouse button/scroll label data
    event-to-key.ts            — browser KeyboardEvent → engine key string
    key-formatter.ts           — formats engine key strings for display
    presets.ts                 — built-in preset content (Grid Keys, Legacy)

src/renderer/store/
    keybinds.store.ts          — all reactive state + every store function

src/renderer/composables/
    useLiveKeyPreview.ts       — keydown/keyup/wheel → pressedKeys + modifier override

src/renderer/directives/
    fitText.ts                 — binary-search font-size to fit text in parent (used on binding chips)

src/renderer/assets/images/command-icons/
    *.gif / *.svg / *.png / *.avif / *.webp
                               — command icon assets; only loaded when
                                 COMMAND_ICONS_ENABLED = true in command-icons.ts

src/main/services/
    keybinds.service.ts        — IPC handlers: read/write uikeys.txt on disk
```

---

## Infrastructure Dependencies

These are not keybind-specific files; they exist in the common app shell and the editor depends on them.

| Dependency | Where it comes from | What the editor uses it for |
|---|---|---|
| `Modal.vue` | `src/renderer/components/common/Modal.vue` | Outer wrapper for the editor when opened; needs `backAction` prop (chevron-left button) and `#modal` id |
| `Panel.vue` | `src/renderer/components/common/Panel.vue` | Panels inside the editor; uses `noPadding` prop |
| `v-tooltip` | PrimeVue, globally registered | Command description tooltips in the palette |
| `Icon` component | `@iconify-vue` | All icons in the toolbar and palette |
| `@iconify-icons/mdi/*` | `@iconify-icons/mdi` package | Icon data — imported as ES modules, **not** string API |
| SCSS spacing/color tokens | auto-injected `additionalData` in vite config | Spacing vars (`$sm`, `$md`, etc.) and color mixins used throughout |
| `typed-ipc` / preload bridge | `src/main/typed-ipc.ts` + `src/preload/preload.ts` | `keybindsService.read()` and `keybindsService.write()` called by the store |

### IPC surface (keybinds.service.ts)

The service exposes two handlers via typed IPC:

```ts
keybindsService.read()  → Promise<string>   // reads uikeys.txt, returns raw text
keybindsService.write(content: string) → Promise<void>  // writes uikeys.txt to disk
```

The file path is resolved to:
- Dev: `./state/data/uikeys.txt`
- Windows prod: `%APPDATA%/BeyondAllReason/data/uikeys.txt`

If the target branch has a different IPC mechanism, the two call sites to update are `loadKeybinds()` and `saveKeybinds()` in `keybinds.store.ts`.

---

## Entry Point

The editor is **not** a standalone route. It lives inside the Settings modal in `src/renderer/components/navbar/Settings.vue`.

The Settings component manages:
- `activePanel: Ref<'settings' | 'keybinds'>` — switches between panels with a slide transition
- When `activePanel === 'keybinds'`, the Modal is resized to near-fullscreen: `style="width: calc(100vw - 64px); height: calc(100vh - 64px)"` and given `class="keybinds-mode"`
- Non-scoped CSS in Settings.vue removes modal padding and overflow: `#modal.keybinds-mode .content { padding: 0; overflow: hidden }`
- Modal's `backAction` prop is set to a function that resets `activePanel` to `'settings'`, which puts a `‹` chevron button in the modal title bar

To open the editor from a different entry point, reproduce this pattern: toggle a boolean, conditionally render `<KeybindEditor />`, and resize whatever container wraps it to be large.

---

## Store Architecture

`keybinds.store.ts` is a Vue `reactive()` singleton (no Pinia). Import it directly:

```ts
import { keybindsStore, loadKeybinds, saveKeybinds, assignBinding, ... } from '@renderer/store/keybinds.store'
```

Key state fields:

| Field | Type | Purpose |
|---|---|---|
| `parsed` | `ParsedUikeys \| null` | The live in-memory binding state |
| `activeModifiers` | `ModifierState` | Which modifier layer the keyboard is showing |
| `viewMode` | `'visual' \| 'list' \| 'raw'` | Active view |
| `activeUnitType` | `'all' \| 'combat' \| 'builder' \| 'factory'` | Unit type filter |
| `selectedCommand` | `string \| null` | Highlighted command; drives amber glow on keyboard keys |
| `selectedKey` | `string \| null` | Focused key (engine key string) |
| `pressedKeys` | `Set<string>` | Physically held keys (from live preview composable) |
| `undoStack` | `ParsedUikeys[]` | Up to 20 snapshots |
| `customPresets` | `KeybindPreset[]` | User presets, persisted to localStorage under `bar-lobby-keybind-custom-presets` |
| `isDirty` | `boolean` | Binding edits since last save |
| `isPresetSwitched` | `boolean` | Preset loaded but not yet saved to disk |

Six computed lookup maps (`bindingsByCommand`, `bindingsByKey`, `anyBindingsByKey`, etc.) provide O(1) access patterns — always use the exported query functions rather than scanning `parsed` directly in components.

---

## Data Flow

```
uikeys.txt on disk
    ↓  keybinds.service.ts (IPC)
    ↓  loadKeybinds() in store
    ↓  parser.ts → ParsedUikeys
    ↓  keybinds.store reactive state
    ↓  components render from computed maps
    ↓  user interaction → assignBinding / removeBinding / etc.
    ↓  pushUndo() + mutation + detectConflicts()
    ↓  saveKeybinds() → serializer.ts → keybinds.service.ts (IPC)
    ↓  uikeys.txt on disk
```

Raw view bypasses the computed maps: `onOpenRaw()` serializes `parsed` → textarea; `onApplyRaw()` parses textarea content back into `parsed`.

---

## Undo System

Every public mutation (assign, remove, update) calls `pushUndo()` before mutating. `pushUndo()` deep-clones `parsed` and pushes to `undoStack` (max 20). `undo()` pops and restores. The internal variants (`assignBindingInternal`, `removeBindingInternal`) skip undo so compound operations like drag-swap can call `pushUndo()` once for the whole operation.

---

## Preset System

`presets.ts` exports `KEYBIND_PRESETS` (array) and `PRESET_MAP` (keyed by id: `'grid'` and `'legacy'`). Both contain the full `uikeys.txt` text for that preset.

Custom presets are `KeybindPreset` objects `{ id: string, name: string, content: string }` stored in `keybindsStore.customPresets` and serialized to `localStorage`. IDs are `custom_<timestamp>`. The dropdown shows them with a `★` prefix.

`detectActivePreset()` compares the current serialized state against built-in presets first, then custom presets. If nothing matches, `activePreset` is `'custom'`.

---

## Command Icons

Icons are currently **disabled** (`COMMAND_ICONS_ENABLED = false` in `command-icons.ts`) because animated GIF assets caused performance issues. All the wiring is intact — flip that flag to `true` when the assets have been replaced with static PNGs. Icons are looked up via `getCommandIcon(command)` which returns an asset URL or `undefined`.

---

## Known Incomplete Items

- `is-selected-key` CSS state in `KeyboardKey.vue` — the store field `selectedKey` exists and is set by `selectCommand()`, but the computed `isSelectedKey` + class binding + CSS rule have not been added to `KeyboardKey.vue` yet.
- Wheel key labels in `keyboard-layout.ts` — `WheelUp` should display as "Zoom Out" and `WheelDown` as "Zoom In" but the label fields haven't been updated.
