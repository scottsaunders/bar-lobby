// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

const ENGINE_KEY_LABELS: Record<string, string> = {
    // Scancodes → plain letters
    sc_a: "A", sc_b: "B", sc_c: "C", sc_d: "D", sc_e: "E",
    sc_f: "F", sc_g: "G", sc_h: "H", sc_i: "I", sc_j: "J",
    sc_k: "K", sc_l: "L", sc_m: "M", sc_n: "N", sc_o: "O",
    sc_p: "P", sc_q: "Q", sc_r: "R", sc_s: "S", sc_t: "T",
    sc_u: "U", sc_v: "V", sc_w: "W", sc_x: "X", sc_y: "Y",
    sc_z: "Z",

    // Scancode digits
    sc_0: "0", sc_1: "1", sc_2: "2", sc_3: "3", sc_4: "4",
    sc_5: "5", sc_6: "6", sc_7: "7", sc_8: "8", sc_9: "9",

    // Scancode symbols
    "sc_[": "[", "sc_]": "]", "sc_=": "=", "sc_-": "-",
    "sc_.": ".", "sc_,": ",", "sc_;": ";", "sc_'": "'",
    "sc_`": "`", "sc_\\": "\\", "sc_/": "/",

    // Navigation & editing
    esc: "Esc", escape: "Esc", enter: "Enter", backspace: "BkSp", tab: "Tab",
    space: "Space", delete: "Del", insert: "Ins",
    home: "Home", end: "End", pageup: "PgUp", pagedown: "PgDn",
    up: "↑", down: "↓", left: "←", right: "→",
    pause: "Pause", numlock: "NumLk", capslock: "Caps",

    // Modifier keys used as bound keys (e.g. Any+shift)
    shift: "Shift", ctrl: "Ctrl", alt: "Alt",

    // Lowercase function key variants as they appear in uikeys.txt
    f1: "F1", f2: "F2", f3: "F3", f4: "F4",
    f5: "F5", f6: "F6", f7: "F7", f8: "F8",
    f9: "F9", f10: "F10", f11: "F11", f12: "F12",

    // Numpad
    "numpad+": "Num+", "numpad-": "Num−", "numpad*": "Num×",
    "numpad/": "Num÷", "numpad.": "Num.",
    numpad0: "Num0", numpad1: "Num1", numpad2: "Num2",
    numpad3: "Num3", numpad4: "Num4", numpad5: "Num5",
    numpad6: "Num6", numpad7: "Num7", numpad8: "Num8",
    numpad9: "Num9",
};

export function engineKeyToLabel(key: string): string {
    return ENGINE_KEY_LABELS[key] ?? key.toUpperCase();
}

export function formatBindingLabel(modifiers: string[], key: string): string {
    return [...modifiers, engineKeyToLabel(key)].join("+");
}

/**
 * Format a single chord step like "Shift+sc_b" → "Shift+B".
 * Parts that are modifier names (Ctrl, Shift, Alt, Any) are kept as-is.
 */
export function formatChordStep(step: string): string {
    return step
        .split("+")
        .map((part) => ENGINE_KEY_LABELS[part] ?? part)
        .join("+");
}

/**
 * Given a KeyBinding's raw line (e.g. "bind Shift+sc_b,Shift+sc_b somecommand"),
 * extract the key combo token(s) as human-readable steps.
 * Returns an array — one element for simple, multiple for chord sequences.
 */
export function formatAdvancedBindingSteps(raw: string): string[] {
    // Strip leading "bind " and take first whitespace-token as the combo
    const withoutBind = raw.startsWith("bind ") ? raw.slice(5).trimStart() : raw;
    const comboToken = withoutBind.split(/\s+/)[0];
    return comboToken.split(",").map(formatChordStep);
}
