// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { KeyDef, KeyboardRow } from "./types";

export const KEYBOARD_ROWS: KeyboardRow[] = [
    // Function row — 3 group spacers (36px each) align right edge with Backspace
    {
        keys: [
            { id: "esc", label: "Esc", width: 1, engineKey: "esc" },
            { id: "fn-sp-1", label: "", width: 36 / 56, engineKey: "", isSpacer: true },
            { id: "F1", label: "F1", width: 1, engineKey: "F1" },
            { id: "F2", label: "F2", width: 1, engineKey: "F2" },
            { id: "F3", label: "F3", width: 1, engineKey: "F3" },
            { id: "F4", label: "F4", width: 1, engineKey: "F4" },
            { id: "fn-sp-2", label: "", width: 36 / 56, engineKey: "", isSpacer: true },
            { id: "F5", label: "F5", width: 1, engineKey: "F5" },
            { id: "F6", label: "F6", width: 1, engineKey: "F6" },
            { id: "F7", label: "F7", width: 1, engineKey: "F7" },
            { id: "F8", label: "F8", width: 1, engineKey: "F8" },
            { id: "fn-sp-3", label: "", width: 36 / 56, engineKey: "", isSpacer: true },
            { id: "F9", label: "F9", width: 1, engineKey: "F9" },
            { id: "F10", label: "F10", width: 1, engineKey: "F10" },
            { id: "F11", label: "F11", width: 1, engineKey: "F11" },
            { id: "F12", label: "F12", width: 1, engineKey: "F12" },
        ],
    },
    // Number row
    {
        keys: [
            { id: "sc_`", label: "`", label2: "~", width: 1, engineKey: "sc_`" },
            { id: "1", label: "1", label2: "!", width: 1, engineKey: "1" },
            { id: "2", label: "2", label2: "@", width: 1, engineKey: "2" },
            { id: "3", label: "3", label2: "#", width: 1, engineKey: "3" },
            { id: "4", label: "4", label2: "$", width: 1, engineKey: "4" },
            { id: "5", label: "5", label2: "%", width: 1, engineKey: "5" },
            { id: "6", label: "6", label2: "^", width: 1, engineKey: "6" },
            { id: "7", label: "7", label2: "&", width: 1, engineKey: "7" },
            { id: "8", label: "8", label2: "*", width: 1, engineKey: "8" },
            { id: "9", label: "9", label2: "(", width: 1, engineKey: "9" },
            { id: "0", label: "0", label2: ")", width: 1, engineKey: "0" },
            { id: "sc_-", label: "-", label2: "_", width: 1, engineKey: "sc_-" },
            { id: "sc_=", label: "=", label2: "+", width: 1, engineKey: "sc_=" },
            { id: "backspace", label: "⌫", width: 2, engineKey: "backspace" },
        ],
    },
    // Tab row
    {
        keys: [
            { id: "tab", label: "Tab", width: 1.5, engineKey: "tab" },
            { id: "sc_q", label: "Q", width: 1, engineKey: "sc_q" },
            { id: "sc_w", label: "W", width: 1, engineKey: "sc_w" },
            { id: "sc_e", label: "E", width: 1, engineKey: "sc_e" },
            { id: "sc_r", label: "R", width: 1, engineKey: "sc_r" },
            { id: "sc_t", label: "T", width: 1, engineKey: "sc_t" },
            { id: "sc_y", label: "Y", width: 1, engineKey: "sc_y" },
            { id: "sc_u", label: "U", width: 1, engineKey: "sc_u" },
            { id: "sc_i", label: "I", width: 1, engineKey: "sc_i" },
            { id: "sc_o", label: "O", width: 1, engineKey: "sc_o" },
            { id: "sc_p", label: "P", width: 1, engineKey: "sc_p" },
            { id: "sc_[", label: "[", label2: "{", width: 1, engineKey: "sc_[" },
            { id: "sc_]", label: "]", label2: "}", width: 1, engineKey: "sc_]" },
            { id: "sc_\\", label: "\\", label2: "|", width: 1.5, engineKey: "sc_\\" },
        ],
    },
    // Caps row
    {
        keys: [
            { id: "capslock", label: "Caps", width: 1.75, engineKey: "capslock", isModifier: true },
            { id: "sc_a", label: "A", width: 1, engineKey: "sc_a" },
            { id: "sc_s", label: "S", width: 1, engineKey: "sc_s" },
            { id: "sc_d", label: "D", width: 1, engineKey: "sc_d" },
            { id: "sc_f", label: "F", width: 1, engineKey: "sc_f" },
            { id: "sc_g", label: "G", width: 1, engineKey: "sc_g" },
            { id: "sc_h", label: "H", width: 1, engineKey: "sc_h" },
            { id: "sc_j", label: "J", width: 1, engineKey: "sc_j" },
            { id: "sc_k", label: "K", width: 1, engineKey: "sc_k" },
            { id: "sc_l", label: "L", width: 1, engineKey: "sc_l" },
            { id: "sc_;", label: ";", label2: ":", width: 1, engineKey: "sc_;" },
            { id: "sc_'", label: "'", label2: '"', width: 1, engineKey: "sc_'" },
            { id: "enter", label: "Enter", width: 2.25, engineKey: "enter" },
        ],
    },
    // Shift row
    {
        keys: [
            { id: "shift_l", label: "Shift", width: 2.25, engineKey: "shift", isModifier: true },
            { id: "sc_z", label: "Z", width: 1, engineKey: "sc_z" },
            { id: "sc_x", label: "X", width: 1, engineKey: "sc_x" },
            { id: "sc_c", label: "C", width: 1, engineKey: "sc_c" },
            { id: "sc_v", label: "V", width: 1, engineKey: "sc_v" },
            { id: "sc_b", label: "B", width: 1, engineKey: "sc_b" },
            { id: "sc_n", label: "N", width: 1, engineKey: "sc_n" },
            { id: "sc_m", label: "M", width: 1, engineKey: "sc_m" },
            { id: "sc_,", label: ",", label2: "<", width: 1, engineKey: "sc_," },
            { id: "sc_.", label: ".", label2: ">", width: 1, engineKey: "sc_." },
            { id: "sc_/", label: "/", label2: "?", width: 1, engineKey: "sc_/" },
            { id: "shift_r", label: "Shift", width: 2.75, engineKey: "shift", isModifier: true },
        ],
    },
    // Bottom row
    {
        keys: [
            { id: "ctrl_l", label: "Ctrl", width: 1.25, engineKey: "ctrl", isModifier: true },
            { id: "alt_l", label: "Alt", width: 1.25, engineKey: "alt", isModifier: true },
            { id: "space", label: "Space", width: 10.25, engineKey: "space" },
            { id: "alt_r", label: "Alt", width: 1.25, engineKey: "alt", isModifier: true },
            { id: "ctrl_r", label: "Ctrl", width: 1.25, engineKey: "ctrl", isModifier: true },
        ],
    },
];

// Navigation cluster (rendered separately to the right)
export const NAV_CLUSTER_ROWS: KeyboardRow[] = [
    {
        keys: [
            { id: "insert", label: "Ins", width: 1, engineKey: "insert" },
            { id: "home", label: "Home", width: 1, engineKey: "home" },
            { id: "pageup", label: "PgUp", width: 1, engineKey: "pageup" },
        ],
    },
    {
        keys: [
            { id: "delete", label: "Del", width: 1, engineKey: "delete" },
            { id: "end", label: "End", width: 1, engineKey: "end" },
            { id: "pagedown", label: "PgDn", width: 1, engineKey: "pagedown" },
        ],
    },
    { keys: [] }, // spacer row
    {
        keys: [
            { id: "up", label: "↑", width: 1, engineKey: "up" },
        ],
        indent: 1,
    },
    {
        keys: [
            { id: "left", label: "←", width: 1, engineKey: "left" },
            { id: "down", label: "↓", width: 1, engineKey: "down" },
            { id: "right", label: "→", width: 1, engineKey: "right" },
        ],
    },
];

// Numpad (rendered separately, further right)
export const NUMPAD_ROWS: KeyboardRow[] = [
    {
        keys: [
            { id: "numlock", label: "Num", width: 1, engineKey: "numlock" },
            { id: "numpad/", label: "/", width: 1, engineKey: "numpad/" },
            { id: "numpad*", label: "*", width: 1, engineKey: "numpad*" },
            { id: "numpad-", label: "-", width: 1, engineKey: "numpad-" },
        ],
    },
    {
        keys: [
            { id: "numpad7", label: "7", width: 1, engineKey: "numpad7" },
            { id: "numpad8", label: "8", width: 1, engineKey: "numpad8" },
            { id: "numpad9", label: "9", width: 1, engineKey: "numpad9" },
            { id: "numpad+", label: "+", width: 1, engineKey: "numpad+" },
        ],
    },
    {
        keys: [
            { id: "numpad4", label: "4", width: 1, engineKey: "numpad4" },
            { id: "numpad5", label: "5", width: 1, engineKey: "numpad5" },
            { id: "numpad6", label: "6", width: 1, engineKey: "numpad6" },
        ],
    },
    {
        keys: [
            { id: "numpad1", label: "1", width: 1, engineKey: "numpad1" },
            { id: "numpad2", label: "2", width: 1, engineKey: "numpad2" },
            { id: "numpad3", label: "3", width: 1, engineKey: "numpad3" },
        ],
    },
    {
        keys: [
            { id: "numpad0", label: "0", width: 2, engineKey: "numpad0" },
            { id: "numpad.", label: ".", width: 1, engineKey: "numpad." },
        ],
    },
];

// Mouse buttons cluster
export const MOUSE_ROWS: KeyboardRow[] = [
    {
        keys: [
            { id: "mouse1", label: "LMB", width: 1, engineKey: "mouse1" },
            { id: "mouse2", label: "RMB", width: 1, engineKey: "mouse2" },
            { id: "mouse3", label: "MMB", width: 1, engineKey: "mouse3" },
        ],
    },
    {
        keys: [
            { id: "mouse4", label: "M4", width: 1, engineKey: "mouse4" },
            { id: "mouse5", label: "M5", width: 1, engineKey: "mouse5" },
        ],
        indent: 0,
    },
];

// Flat map of all keys by engineKey for quick lookup
export const ALL_KEYS: Record<string, KeyDef> = {};
for (const row of [...KEYBOARD_ROWS, ...NAV_CLUSTER_ROWS, ...NUMPAD_ROWS, ...MOUSE_ROWS]) {
    for (const key of row.keys) {
        if (key.isSpacer || !key.engineKey) continue;
        if (!ALL_KEYS[key.engineKey]) {
            ALL_KEYS[key.engineKey] = key;
        }
    }
}
