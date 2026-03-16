// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

/**
 * Convert a browser KeyboardEvent to a BAR engine key name.
 * Returns null for modifier-only presses (Ctrl, Shift, Alt, etc.).
 */
export function eventToEngineKey(e: KeyboardEvent): string | null {
    if (["Control", "Shift", "Alt", "Meta", "CapsLock", "NumLock"].includes(e.key)) return null;

    const code = e.code;

    if (/^Key[A-Z]$/.test(code)) return `sc_${e.key.toLowerCase()}`;
    if (/^Digit[0-9]$/.test(code)) return code.replace("Digit", "");
    if (/^F\d+$/.test(e.key)) return e.key;

    if (code === "NumpadAdd") return "numpad+";
    if (code === "NumpadSubtract") return "numpad-";
    if (code === "NumpadMultiply") return "numpad*";
    if (code === "NumpadDivide") return "numpad/";
    if (code === "NumpadDecimal") return "numpad.";
    if (/^Numpad\d$/.test(code)) return `numpad${code.replace("Numpad", "")}`;

    const nav: Record<string, string> = {
        Escape: "esc", Enter: "enter", Backspace: "backspace", Tab: "tab",
        Delete: "delete", Home: "home", End: "end",
        PageUp: "pageup", PageDown: "pagedown",
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        Insert: "insert", Pause: "pause", Space: "space", " ": "space",
    };
    if (nav[e.key]) return nav[e.key];

    const symbolMap: Record<string, string> = {
        BracketLeft: "sc_[", BracketRight: "sc_]", Semicolon: "sc_;",
        Quote: "sc_'", Backquote: "sc_`", Backslash: "sc_\\",
        Comma: "sc_,", Period: "sc_.", Slash: "sc_/",
        Minus: "sc_-", Equal: "sc_=",
    };
    if (symbolMap[code]) return symbolMap[code];

    return e.key.toLowerCase();
}

/** Map browser MouseEvent.button index to BAR engine mouse key name. */
export function mouseButtonToEngineKey(button: number): string | null {
    const map: Record<number, string> = {
        0: "mouse1", // left
        1: "mouse3", // middle
        2: "mouse2", // right
        3: "mouse4", // back
        4: "mouse5", // forward
    };
    return map[button] ?? null;
}

/** Extract the active modifier keys from a keyboard or mouse event. */
export function eventModifiers(e: KeyboardEvent | MouseEvent): string[] {
    const mods: string[] = [];
    if (e.ctrlKey) mods.push("Ctrl");
    if (e.shiftKey) mods.push("Shift");
    if (e.altKey) mods.push("Alt");
    return mods;
}
