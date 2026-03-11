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

    // Scancode symbols
    "sc_[": "[", "sc_]": "]", "sc_=": "=", "sc_-": "-",
    "sc_.": ".", "sc_,": ",", "sc_;": ";", "sc_'": "'",
    "sc_`": "`", "sc_\\": "\\", "sc_/": "/",

    // Navigation & editing
    esc: "Esc", enter: "Enter", backspace: "BkSp", tab: "Tab",
    space: "Space", delete: "Del", insert: "Ins",
    home: "Home", end: "End", pageup: "PgUp", pagedown: "PgDn",
    up: "↑", down: "↓", left: "←", right: "→",
    pause: "Pause", numlock: "NumLk",

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
