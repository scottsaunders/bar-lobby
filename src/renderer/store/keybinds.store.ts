// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { reactive } from "vue";
import { parseUikeys } from "@renderer/utils/uikeys/parser";
import { serializeUikeys } from "@renderer/utils/uikeys/serializer";
import type { KeyBinding, ModifierState, ParsedUikeys } from "@renderer/utils/uikeys/types";
import { EMPTY_MODIFIER_STATE } from "@renderer/utils/uikeys/types";
import { getCommandUnitType } from "@renderer/utils/uikeys/commands";
import { PRESET_MAP } from "@renderer/utils/uikeys/presets";

export type SharedKeySeverity =
    | "conflict" // same-context commands on same key — genuinely ambiguous
    | "shared";  // cross-context commands on same key — likely intentional

export interface SharedKey {
    key: string;
    modifiers: string[];
    bindings: KeyBinding[];
    severity: SharedKeySeverity;
}

export const keybindsStore = reactive({
    isLoaded: false,
    isSaving: false,
    isDirty: false,
    rawContent: "",
    parsed: null as ParsedUikeys | null,
    activeModifiers: { ...EMPTY_MODIFIER_STATE } as ModifierState,
    viewMode: "visual" as "visual" | "list",
    searchQuery: "",
    selectedBindingId: null as string | null,
    activeUnitType: "all" as "all" | "builder" | "combat",
    sharedKeys: [] as SharedKey[],
    selectedCommand: null as string | null,
    activePreset: "custom" as string,
    showAdvanced: false,
    pressedKeys: new Set<string>(),
});

export async function loadKeybinds(): Promise<void> {
    const content = await window.keybinds.read();
    keybindsStore.rawContent = content;
    keybindsStore.parsed = parseUikeys(content);
    keybindsStore.isDirty = false;
    keybindsStore.isLoaded = true;
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
    } finally {
        keybindsStore.isSaving = false;
    }
}

export function revertKeybinds(): void {
    if (keybindsStore.rawContent) {
        keybindsStore.parsed = parseUikeys(keybindsStore.rawContent);
        keybindsStore.isDirty = false;
        detectConflicts();
    }
}

export function loadPreset(presetId: string): void {
    const preset = PRESET_MAP.get(presetId);
    if (!preset) return;
    keybindsStore.parsed = parseUikeys(preset.content);
    keybindsStore.isDirty = true;
    keybindsStore.activePreset = presetId;
    detectConflicts();
}

function detectActivePreset(): void {
    const raw = keybindsStore.rawContent.trim();
    for (const [id, preset] of PRESET_MAP.entries()) {
        if (raw === preset.content.trim()) {
            keybindsStore.activePreset = id;
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
    if (!keybindsStore.parsed) return [];
    const modSet = new Set(modifiers.map((m) => m.toLowerCase()));

    return keybindsStore.parsed.bindings.filter((b) => {
        const bModSet = new Set(b.modifiers.map((m) => m.toLowerCase()));
        // Exact match
        if (bModSet.size === modSet.size && [...bModSet].every((m) => modSet.has(m))) return true;
        // Any+ matches all states
        if (b.modifiers.length === 1 && b.modifiers[0].toLowerCase() === "any") return true;
        return false;
    });
}

/**
 * Get the binding for an exact key+modifier combo (not Any+).
 */
export function getExactBinding(key: string, modifiers: string[]): KeyBinding | undefined {
    if (!keybindsStore.parsed) return undefined;
    const modStr = modifiers
        .map((m) => m.toLowerCase())
        .sort()
        .join("+");
    return keybindsStore.parsed.bindings.find((b) => {
        const bModStr = b.modifiers
            .map((m) => m.toLowerCase())
            .sort()
            .join("+");
        return b.key === key && bModStr === modStr;
    });
}

/**
 * Returns all bindings for a given key across all modifier states.
 */
export function getBindingsForKey(key: string): KeyBinding[] {
    if (!keybindsStore.parsed) return [];
    return keybindsStore.parsed.bindings.filter((b) => b.key === key);
}

/**
 * Returns all bindings for a given command string.
 */
export function getBindingsForCommand(command: string): KeyBinding[] {
    if (!keybindsStore.parsed) return [];
    return keybindsStore.parsed.bindings.filter((b) => b.command === command);
}

/**
 * Returns all advanced (chord/sequence) bindings for a given command string.
 */
export function getAdvancedBindingsForCommand(command: string): KeyBinding[] {
    if (!keybindsStore.parsed) return [];
    return keybindsStore.parsed.advancedBindings.filter((b) => b.command === command);
}

/**
 * Assign a command to a key with current modifiers.
 * If a binding already exists at that slot, it is removed (returned to sandbox).
 * Returns the displaced binding if any.
 */
export function assignBinding(key: string, modifiers: string[], command: string): KeyBinding | null {
    if (!keybindsStore.parsed) return null;

    const existing = getExactBinding(key, modifiers);
    if (existing) {
        removeBinding(existing.id);
    }

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

    keybindsStore.parsed.bindings.push(newBinding);
    keybindsStore.isDirty = true;
    detectConflicts();
    return existing ?? null;
}

export function removeBinding(id: string): void {
    if (!keybindsStore.parsed) return;
    const idx = keybindsStore.parsed.bindings.findIndex((b) => b.id === id);
    if (idx >= 0) {
        keybindsStore.parsed.bindings.splice(idx, 1);
        keybindsStore.isDirty = true;
        detectConflicts();
    }
}

export function removeAdvancedBinding(id: string): void {
    if (!keybindsStore.parsed) return;
    const idx = keybindsStore.parsed.advancedBindings.findIndex((b) => b.id === id);
    if (idx >= 0) {
        keybindsStore.parsed.advancedBindings.splice(idx, 1);
        keybindsStore.isDirty = true;
    }
}

export function addAdvancedBinding(rawLine: string): boolean {
    if (!keybindsStore.parsed) return false;
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
