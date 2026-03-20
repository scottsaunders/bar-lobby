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

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt"]);

export function useLiveKeyPreview() {
    function syncModifiers(e: KeyboardEvent) {
        const anyMod = e.ctrlKey || e.shiftKey || e.altKey;
        if (anyMod) {
            Object.assign(keybindsStore.activeModifiers, physicalModifierState(e));
        } else {
            Object.assign(keybindsStore.activeModifiers, EMPTY_MODIFIER_STATE);
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (isInputFocused()) return;

        // Sync modifier layer only on first press (not key-repeat) of a modifier key
        if (MODIFIER_KEYS.has(e.key) && !e.repeat) syncModifiers(e);

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

        // Sync modifier layer only when a modifier key itself is released
        if (MODIFIER_KEYS.has(e.key)) syncModifiers(e);
    }

    function onMouseDown(e: MouseEvent) {
        const key = mouseButtonToEngineKey(e.button);
        if (key) keybindsStore.pressedKeys.add(key);
    }

    function onMouseUp(e: MouseEvent) {
        const key = mouseButtonToEngineKey(e.button);
        if (key) keybindsStore.pressedKeys.delete(key);
    }

    let wheelTimer: ReturnType<typeof setTimeout> | null = null;
    function onWheel(e: WheelEvent) {
        const key = e.deltaY < 0 ? "WheelUp" : "WheelDown";
        keybindsStore.pressedKeys.add(key);
        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
            keybindsStore.pressedKeys.delete("WheelUp");
            keybindsStore.pressedKeys.delete("WheelDown");
            wheelTimer = null;
        }, 200);
    }

    // Clear all state if window loses focus so keys don't get stuck
    function onBlur() {
        keybindsStore.pressedKeys.clear();
        Object.assign(keybindsStore.activeModifiers, EMPTY_MODIFIER_STATE);
    }

    onMounted(() => {
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("wheel", onWheel, { passive: true });
        window.addEventListener("blur", onBlur);
    });

    onUnmounted(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("blur", onBlur);
        if (wheelTimer) clearTimeout(wheelTimer);
        keybindsStore.pressedKeys.clear();
    });
}
