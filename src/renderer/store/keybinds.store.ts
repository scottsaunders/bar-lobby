// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { reactive, computed } from "vue";
import { parseUikeys } from "@renderer/utils/uikeys/parser";
import { serializeUikeys } from "@renderer/utils/uikeys/serializer";
import type { KeyBinding, ModifierState, ParsedUikeys } from "@renderer/utils/uikeys/types";
import { EMPTY_MODIFIER_STATE } from "@renderer/utils/uikeys/types";
import { getCommandUnitType } from "@renderer/utils/uikeys/commands";
import { PRESET_MAP, type KeybindPreset } from "@renderer/utils/uikeys/presets";

const CUSTOM_PRESETS_KEY = "bar-lobby-keybind-custom-presets";

/** Migrate preset content to keep wheel bindings consistent with current defaults. */
function migratePresetContent(content: string): string {
    return content
        // Plain WheelUp/Down → Any+WheelUp/Down with correct zoom direction
        .replace(/^(\s*bind\s+)WheelUp(\s+)moveup\b/gm,    "$1Any+WheelUp$2movedown")
        .replace(/^(\s*bind\s+)WheelDown(\s+)movedown\b/gm, "$1Any+WheelDown$2moveup")
        .replace(/^(\s*bind\s+)WheelUp(\s+)movedown\b/gm,   "$1Any+WheelUp$2movedown")
        .replace(/^(\s*bind\s+)WheelDown(\s+)moveup\b/gm,   "$1Any+WheelDown$2moveup")
        // Any+Wheel with wrong direction
        .replace(/^(\s*bind\s+Any\+WheelUp)(\s+)moveup\b/gm,    "$1$2movedown")
        .replace(/^(\s*bind\s+Any\+WheelDown)(\s+)movedown\b/gm, "$1$2moveup");
}

function loadCustomPresetsFromStorage(): KeybindPreset[] {
    try {
        const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
        if (!raw) return [];
        const presets = JSON.parse(raw) as KeybindPreset[];
        const migrated = presets.map((p) => ({ ...p, content: migratePresetContent(p.content) }));
        // Persist the migrated version immediately so it's not re-migrated next load
        if (JSON.stringify(migrated) !== JSON.stringify(presets)) {
            localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(migrated));
        }
        return migrated;
    } catch {
        return [];
    }
}

function saveCustomPresetsToStorage(presets: KeybindPreset[]): void {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}

export type SharedKeySeverity =
    | "conflict" // same-context commands on same key — genuinely ambiguous
    | "shared";  // cross-context commands on same key — likely intentional

export interface SharedKey {
    key: string;
    modifiers: string[];
    bindings: KeyBinding[];
    severity: SharedKeySeverity;
}

const MAX_UNDO = 20;

export const keybindsStore = reactive({
    isLoaded: false,
    isSaving: false,
    isDirty: false,        // user edited bindings (shows "Unsaved changes" dot)
    isPresetSwitched: false, // preset loaded but not yet written to disk
    rawContent: "",
    parsed: null as ParsedUikeys | null,
    activeModifiers: { ...EMPTY_MODIFIER_STATE } as ModifierState,
    viewMode: "visual" as "visual" | "list" | "raw",
    searchQuery: "",
    selectedBindingId: null as string | null,
    activeUnitType: "all" as "all" | "builder" | "combat" | "factory",
    sharedKeys: [] as SharedKey[],
    selectedCommand: null as string | null,
    selectedKey: null as string | null,
    activePreset: "custom" as string,
    showAdvanced: false,
    pressedKeys: new Set<string>(),
    undoStack: [] as ParsedUikeys[],
    customPresets: loadCustomPresetsFromStorage() as KeybindPreset[],
});

// ── Indexed lookup maps (O(1) access, lazily recomputed by Vue) ──────────────

/** command → regular bindings */
export const bindingsByCommand = computed((): Map<string, KeyBinding[]> => {
    const map = new Map<string, KeyBinding[]>();
    if (!keybindsStore.parsed) return map;
    for (const b of keybindsStore.parsed.bindings) {
        const arr = map.get(b.command);
        if (arr) arr.push(b);
        else map.set(b.command, [b]);
    }
    return map;
});

/** command → advanced (chord) bindings */
export const advancedByCommand = computed((): Map<string, KeyBinding[]> => {
    const map = new Map<string, KeyBinding[]>();
    if (!keybindsStore.parsed) return map;
    for (const b of keybindsStore.parsed.advancedBindings) {
        const arr = map.get(b.command);
        if (arr) arr.push(b);
        else map.set(b.command, [b]);
    }
    return map;
});

/** "modStr|key" → exact (non-Any) binding */
export const bindingsByKeyMod = computed((): Map<string, KeyBinding> => {
    const map = new Map<string, KeyBinding>();
    if (!keybindsStore.parsed) return map;
    for (const b of keybindsStore.parsed.bindings) {
        if (b.modifiers.includes("Any")) continue;
        const k = `${b.modifiers.map((m) => m.toLowerCase()).sort().join("+")}|${b.key}`;
        map.set(k, b);
    }
    return map;
});

/** key → Any+ binding (single — last write wins) */
export const anyBindingsByKey = computed((): Map<string, KeyBinding> => {
    const map = new Map<string, KeyBinding>();
    if (!keybindsStore.parsed) return map;
    for (const b of keybindsStore.parsed.bindings) {
        if (b.modifiers.length === 1 && b.modifiers[0].toLowerCase() === "any") {
            map.set(b.key, b);
        }
    }
    return map;
});

/** key → all Any+ bindings (preserves all when a modifier key has multiple) */
export const anyBindingsByKeyMulti = computed((): Map<string, KeyBinding[]> => {
    const map = new Map<string, KeyBinding[]>();
    if (!keybindsStore.parsed) return map;
    for (const b of keybindsStore.parsed.bindings) {
        if (b.modifiers.length === 1 && b.modifiers[0].toLowerCase() === "any") {
            const arr = map.get(b.key);
            if (arr) arr.push(b);
            else map.set(b.key, [b]);
        }
    }
    return map;
});

/** key → all bindings (any modifier) */
export const bindingsByKey = computed((): Map<string, KeyBinding[]> => {
    const map = new Map<string, KeyBinding[]>();
    if (!keybindsStore.parsed) return map;
    for (const b of keybindsStore.parsed.bindings) {
        const arr = map.get(b.key);
        if (arr) arr.push(b);
        else map.set(b.key, [b]);
    }
    return map;
});

/** "modStr|key" → SharedKey entry */
export const sharedKeysByKeyMod = computed((): Map<string, SharedKey> => {
    const map = new Map<string, SharedKey>();
    for (const s of keybindsStore.sharedKeys) {
        const modStr = s.modifiers.map((m) => m.toLowerCase()).sort().join("+");
        map.set(`${modStr}|${s.key}`, s);
    }
    return map;
});

// ─────────────────────────────────────────────────────────────────────────────

function pushUndo(): void {
    if (!keybindsStore.parsed) return;
    keybindsStore.undoStack.push(JSON.parse(JSON.stringify(keybindsStore.parsed)) as ParsedUikeys);
    if (keybindsStore.undoStack.length > MAX_UNDO) keybindsStore.undoStack.shift();
}

export function undo(): void {
    const snapshot = keybindsStore.undoStack.pop();
    if (!snapshot) return;
    keybindsStore.parsed = snapshot;
    keybindsStore.isDirty = true;
    detectConflicts();
}

export async function loadKeybinds(): Promise<void> {
    const content = await window.keybinds.read();
    keybindsStore.rawContent = content;
    keybindsStore.parsed = parseUikeys(content);
    keybindsStore.isDirty = false;
    keybindsStore.isPresetSwitched = false;
    keybindsStore.isLoaded = true;
    keybindsStore.undoStack = [];
    detectConflicts();
    detectActivePreset();
}

export async function saveKeybinds(): Promise<void> {
    if (!keybindsStore.parsed) return;
    keybindsStore.isSaving = true;
    try {
        const content = serializeUikeys(keybindsStore.parsed);
        await window.keybinds.write(content);
        keybindsStore.rawContent = content;
        keybindsStore.isDirty = false;
        keybindsStore.isPresetSwitched = false;
    } finally {
        keybindsStore.isSaving = false;
    }
}

export function revertKeybinds(): void {
    if (keybindsStore.rawContent) {
        keybindsStore.parsed = parseUikeys(keybindsStore.rawContent);
        keybindsStore.isDirty = false;
        keybindsStore.isPresetSwitched = false;
        detectConflicts();
    }
}

export function loadPreset(presetId: string): void {
    const preset = PRESET_MAP.get(presetId) ?? keybindsStore.customPresets.find((p) => p.id === presetId);
    if (!preset) return;
    keybindsStore.parsed = parseUikeys(preset.content);
    keybindsStore.isDirty = false;
    keybindsStore.isPresetSwitched = true;
    keybindsStore.activePreset = presetId;
    keybindsStore.undoStack = [];
    detectConflicts();
}

export function saveCustomPreset(name: string, content: string): string {
    const id = `custom_${Date.now()}`;
    const preset: KeybindPreset = { id, label: name, description: "Custom preset", content };
    keybindsStore.customPresets.push(preset);
    saveCustomPresetsToStorage(keybindsStore.customPresets);
    keybindsStore.activePreset = id;
    return id;
}

export function updateCustomPreset(id: string, content: string): void {
    const preset = keybindsStore.customPresets.find((p) => p.id === id);
    if (!preset) return;
    preset.content = content;
    saveCustomPresetsToStorage(keybindsStore.customPresets);
}

export function deleteCustomPreset(id: string): void {
    const idx = keybindsStore.customPresets.findIndex((p) => p.id === id);
    if (idx >= 0) {
        keybindsStore.customPresets.splice(idx, 1);
        saveCustomPresetsToStorage(keybindsStore.customPresets);
        if (keybindsStore.activePreset === id) keybindsStore.activePreset = "custom";
    }
}

function detectActivePreset(): void {
    const raw = keybindsStore.rawContent.trim();
    for (const [id, preset] of PRESET_MAP.entries()) {
        if (raw === preset.content.trim()) {
            keybindsStore.activePreset = id;
            return;
        }
    }
    for (const preset of keybindsStore.customPresets) {
        if (raw === preset.content.trim()) {
            keybindsStore.activePreset = preset.id;
            return;
        }
    }
    keybindsStore.activePreset = "custom";
}

/**
 * Get all bindings visible for the current modifier state.
 * Includes exact modifier matches and Any+ bindings.
 */
export function getBindingsForModifiers(modifiers: string[]): KeyBinding[] {
    const modStr = modifiers.map((m) => m.toLowerCase()).sort().join("+");
    const result: KeyBinding[] = [];
    const byKeyMod = bindingsByKeyMod.value;
    const anyMap = anyBindingsByKey.value;
    // Collect exact-match bindings for this modifier state
    for (const [k, b] of byKeyMod) {
        if (k.startsWith(`${modStr}|`)) result.push(b);
    }
    // Add Any+ bindings
    for (const b of anyMap.values()) result.push(b);
    return result;
}

/**
 * Get the binding for an exact key+modifier combo (not Any+).
 */
export function getExactBinding(key: string, modifiers: string[]): KeyBinding | undefined {
    const modStr = modifiers.map((m) => m.toLowerCase()).sort().join("+");
    return bindingsByKeyMod.value.get(`${modStr}|${key}`);
}

/**
 * Returns all bindings for a given key across all modifier states.
 */
export function getBindingsForKey(key: string): KeyBinding[] {
    return bindingsByKey.value.get(key) ?? [];
}

/**
 * Returns all bindings for a given command string.
 */
export function getBindingsForCommand(command: string): KeyBinding[] {
    return bindingsByCommand.value.get(command) ?? [];
}

/**
 * Returns all advanced (chord/sequence) bindings for a given command string.
 */
export function getAdvancedBindingsForCommand(command: string): KeyBinding[] {
    return advancedByCommand.value.get(command) ?? [];
}

/**
 * Assign a command to a key — internal, no undo push or conflict detection.
 * Handles Any+ bindings correctly.
 * Returns the displaced binding if one was removed.
 *
 * NOTE: Uses direct array searches instead of the computed Maps so that we
 * don't force an O(n) Map rebuild mid-mutation (the Maps were just invalidated
 * by a prior removeBindingInternal call). The Maps will be rebuilt lazily once
 * after all mutations are done.
 */
function assignBindingInternal(key: string, modifiers: string[], command: string): KeyBinding | null {
    // Find existing binding at this slot (Any+ handled separately)
    let existing: KeyBinding | undefined;
    if (modifiers.length === 1 && modifiers[0].toLowerCase() === "any") {
        existing = keybindsStore.parsed!.bindings.find(
            (b) => b.modifiers.length === 1 && b.modifiers[0].toLowerCase() === "any" && b.key === key,
        );
    } else {
        const modStr = modifiers.map((m) => m.toLowerCase()).sort().join("+");
        existing = keybindsStore.parsed!.bindings.find(
            (b) =>
                !b.modifiers.includes("Any") &&
                b.key === key &&
                b.modifiers.map((m) => m.toLowerCase()).sort().join("+") === modStr,
        );
    }
    if (existing) removeBindingInternal(existing.id);

    const newBinding: KeyBinding = {
        id: `kb_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        modifiers: [...modifiers],
        key,
        command,
        isChord: false,
        isAdvanced: false,
        raw: "",
    };
    newBinding.raw = `bind ${modifiers.length > 0 ? modifiers.join("+") + "+" : ""}${key}  ${command}`;

    keybindsStore.parsed!.bindings.push(newBinding);
    keybindsStore.isDirty = true;
    return existing ?? null;
}

/**
 * Assign a command to a key with current modifiers.
 * If a binding already exists at that slot, it is removed (returned to sandbox).
 * Returns the displaced binding if any.
 */
export function assignBinding(key: string, modifiers: string[], command: string): KeyBinding | null {
    if (!keybindsStore.parsed) return null;
    pushUndo();
    const displaced = assignBindingInternal(key, modifiers, command);
    detectConflicts();
    return displaced;
}

/**
 * Atomic drop operation — single undo snapshot for the full swap.
 * Removes the source binding, assigns the command to the destination, and
 * optionally swaps the displaced binding back to the source key.
 */
export function performDrop(
    sourceBindingId: string | null,
    destKey: string,
    destModifiers: string[],
    command: string,
    sourceKey?: string,
    sourceModifiers?: string[],
): void {
    if (!keybindsStore.parsed) return;
    pushUndo();
    if (sourceBindingId) removeBindingInternal(sourceBindingId);
    const displaced = assignBindingInternal(destKey, destModifiers, command);
    if (displaced && sourceKey && sourceModifiers) {
        assignBindingInternal(sourceKey, sourceModifiers, displaced.command);
    }
    detectConflicts();
}

function removeBindingInternal(id: string): void {
    if (!keybindsStore.parsed) return;
    const idx = keybindsStore.parsed.bindings.findIndex((b) => b.id === id);
    if (idx >= 0) {
        keybindsStore.parsed.bindings.splice(idx, 1);
        keybindsStore.isDirty = true;
        // detectConflicts is called by the public callers after all mutations are done
    }
}

export function removeBinding(id: string): void {
    pushUndo();
    removeBindingInternal(id);
}

export function removeAdvancedBinding(id: string): void {
    if (!keybindsStore.parsed) return;
    pushUndo();
    const idx = keybindsStore.parsed.advancedBindings.findIndex((b) => b.id === id);
    if (idx >= 0) {
        keybindsStore.parsed.advancedBindings.splice(idx, 1);
        keybindsStore.isDirty = true;
    }
}

export function addAdvancedBinding(rawLine: string): boolean {
    if (!keybindsStore.parsed) return false;
    pushUndo();
    // Accept with or without the "bind " prefix
    const normalized = rawLine.trim().startsWith("bind ") ? rawLine.trim() : `bind ${rawLine.trim()}`;
    const parsed = parseUikeys(normalized);
    const binding = [...parsed.bindings, ...parsed.advancedBindings][0];
    if (!binding) return false;
    keybindsStore.parsed.advancedBindings.push(binding);
    keybindsStore.isDirty = true;
    return true;
}

export function updateBinding(id: string, key: string, modifiers: string[]): void {
    if (!keybindsStore.parsed) return;
    pushUndo();
    const binding = keybindsStore.parsed.bindings.find((b) => b.id === id);
    if (!binding) return;
    binding.key = key;
    binding.modifiers = [...modifiers];
    binding.raw = `bind ${modifiers.length > 0 ? modifiers.join("+") + "+" : ""}${key}  ${binding.command}`;
    keybindsStore.isDirty = true;
    detectConflicts();
}

/**
 * Select a command and automatically switch to the modifier layer
 * that contains its first (simplest) binding so it lights up on the keyboard.
 * Calling with the already-selected command deselects it.
 */
export function selectCommand(command: string | null): void {
    if (command === null || keybindsStore.selectedCommand === command) {
        keybindsStore.selectedCommand = null;
        return;
    }
    keybindsStore.selectedCommand = command;

    // Find the binding with the fewest real modifiers (prefer base layer).
    // Skip Any+ bindings — they have no single matching layer.
    const bindings = getBindingsForCommand(command).filter((b) => !b.modifiers.includes("Any"));
    if (!bindings.length) return;

    const best = bindings.reduce((a, b) => (a.modifiers.length <= b.modifiers.length ? a : b));
    keybindsStore.activeModifiers = modifiersArrayToState(best.modifiers);
}

function modifiersArrayToState(modifiers: string[]): ModifierState {
    const state = { ...EMPTY_MODIFIER_STATE };
    for (const m of modifiers) {
        const ml = m.toLowerCase();
        if (ml === "ctrl") state.ctrl = true;
        else if (ml === "shift") state.shift = true;
        else if (ml === "alt") state.alt = true;
        else if (ml === "any") state.any = true;
    }
    return state;
}

export function modifierStateToArray(state: ModifierState): string[] {
    const mods: string[] = [];
    if (state.any) return ["Any"];
    if (state.ctrl) mods.push("Ctrl");
    if (state.shift) mods.push("Shift");
    if (state.alt) mods.push("Alt");
    return mods;
}

function detectConflicts() {
    if (!keybindsStore.parsed) return;
    const map = new Map<string, KeyBinding[]>();

    for (const b of keybindsStore.parsed.bindings) {
        if (b.modifiers.includes("Any")) continue; // Any+ is intentionally multi-match
        const mapKey = `${b.modifiers.join("+").toLowerCase()}|${b.key}`;
        const existing = map.get(mapKey) ?? [];
        existing.push(b);
        map.set(mapKey, existing);
    }

    keybindsStore.sharedKeys = [];
    for (const [, bindings] of map.entries()) {
        if (bindings.length < 2) continue;
        const unitTypes = bindings.map((b) => getCommandUnitType(b.command));
        const uniqueTypes = new Set(unitTypes);

        // Cross-context: all types are different and none are "all" — almost certainly intentional
        // Same-context: any two bindings share a unit type (or either is "all") — genuinely ambiguous
        const isConflict =
            uniqueTypes.has("all") ||
            unitTypes.some((t, i) => unitTypes.findIndex((u, j) => j !== i && u === t) !== -1);

        keybindsStore.sharedKeys.push({
            key: bindings[0].key,
            modifiers: bindings[0].modifiers,
            bindings,
            severity: isConflict ? "conflict" : "shared",
        });
    }
}
