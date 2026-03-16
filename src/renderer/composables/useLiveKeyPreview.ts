// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { onMounted, onUnmounted } from "vue";
import { keybindsStore } from "@renderer/store/keybinds.store";
import { EMPTY_MODIFIER_STATE } from "@renderer/utils/uikeys/types";
import { eventToEngineKey, mouseButtonToEngineKey } from "@renderer/utils/uikeys/event-to-key";
import type { ModifierState } from "@renderer/utils/uikeys/types";

function isInputFocused(): boolean {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}

function physicalModifierState(e: KeyboardEvent | MouseEvent): ModifierState {
    return {
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        space: false,
        any: false,
    };
}

export function useLiveKeyPreview() {
    // Saved modifier state to restore when all physical modifiers are released
    let savedModifiers: ModifierState | null = null;

    function syncModifiers(e: KeyboardEvent | MouseEvent) {
        const anyMod = e.ctrlKey || e.shiftKey || e.altKey;
        if (anyMod) {
            if (!savedModifiers) savedModifiers = { ...keybindsStore.activeModifiers };
            Object.assign(keybindsStore.activeModifiers, physicalModifierState(e));
        } else if (savedModifiers) {
            Object.assign(keybindsStore.activeModifiers, savedModifiers);
            savedModifiers = null;
        } else {
            Object.assign(keybindsStore.activeModifiers, EMPTY_MODIFIER_STATE);
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (isInputFocused()) return;

        // Sync modifier layer
        syncModifiers(e);

        // Track the pressed non-modifier key
        const key = eventToEngineKey(e);
        if (key) keybindsStore.pressedKeys.add(key);

        // Also light up the physical modifier keys themselves
        if (e.shiftKey) keybindsStore.pressedKeys.add("shift");
        if (e.ctrlKey) keybindsStore.pressedKeys.add("ctrl");
        if (e.altKey) keybindsStore.pressedKeys.add("alt");
    }

    function onKeyUp(e: KeyboardEvent) {
        if (isInputFocused()) return;

        const key = eventToEngineKey(e);
        if (key) keybindsStore.pressedKeys.delete(key);

        if (!e.shiftKey) keybindsStore.pressedKeys.delete("shift");
        if (!e.ctrlKey) keybindsStore.pressedKeys.delete("ctrl");
        if (!e.altKey) keybindsStore.pressedKeys.delete("alt");

        syncModifiers(e);
    }

    function onMouseDown(e: MouseEvent) {
        const key = mouseButtonToEngineKey(e.button);
        if (key) keybindsStore.pressedKeys.add(key);
    }

    function onMouseUp(e: MouseEvent) {
        const key = mouseButtonToEngineKey(e.button);
        if (key) keybindsStore.pressedKeys.delete(key);
    }

    // Clear all state if window loses focus so keys don't get stuck
    function onBlur() {
        keybindsStore.pressedKeys.clear();
        if (savedModifiers) {
            Object.assign(keybindsStore.activeModifiers, savedModifiers);
            savedModifiers = null;
        }
    }

    onMounted(() => {
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("blur", onBlur);
    });

    onUnmounted(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("blur", onBlur);
        keybindsStore.pressedKeys.clear();
    });
}
