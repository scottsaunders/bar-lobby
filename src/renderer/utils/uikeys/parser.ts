// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { KeyBinding, ParsedUikeys } from "./types";

let idCounter = 0;
function nextId(): string {
    return `kb_${++idCounter}`;
}

function isChordKey(key: string): boolean {
    return key.includes(",");
}

function isAdvancedBinding(modifiers: string[], key: string): boolean {
    // Chord sequences are advanced
    if (isChordKey(key)) return true;
    // Any+ with specific modifier combos can be advanced
    if (modifiers.includes("Any") && modifiers.length > 1) return true;
    return false;
}

/**
 * Parse a bind line like:
 *   "bind          Ctrl+Shift+esc  quitmenu"
 * into modifiers, key, command.
 */
function parseBindLine(line: string): KeyBinding | null {
    // Strip inline comments
    const commentIdx = line.indexOf("//");
    const cleaned = (commentIdx >= 0 ? line.slice(0, commentIdx) : line).trim();

    const parts = cleaned.split(/\s+/);
    if (parts.length < 3 || parts[0] !== "bind") return null;

    const keyCombo = parts[1]; // e.g. "Ctrl+Shift+esc" or "esc" or "Any+sc_z"
    const command = parts.slice(2).join(" "); // rest is the command

    // Chord sequences contain commas anywhere in the combo (e.g. "Shift+sc_b,Shift+sc_b")
    // Detect this before splitting so we don't corrupt the modifier list
    const isChord = keyCombo.includes(",");

    // Split the key combo by '+' but handle keys whose name ends with '+' (e.g. "numpad+").
    // When the last segment is empty the key itself contains a trailing '+', so reconstruct it.
    const segments = keyCombo.split("+");
    let key: string;
    let modifiers: string[];
    if (segments[segments.length - 1] === "" && segments.length >= 2) {
        key = segments[segments.length - 2] + "+";
        modifiers = segments.slice(0, -2).filter((m) => m.length > 0);
    } else {
        key = segments[segments.length - 1];
        modifiers = segments.slice(0, -1).filter((m) => m.length > 0);
    }

    const advanced = isChord || isAdvancedBinding(modifiers, key);

    return {
        id: nextId(),
        modifiers,
        key,
        command,
        isChord,
        isAdvanced: advanced,
        raw: cleaned,
    };
}

export function parseUikeys(content: string): ParsedUikeys {
    idCounter = 0;
    const lines = content.split(/\r?\n/);
    const headerLines: string[] = [];
    const bindings: KeyBinding[] = [];
    const advancedBindings: KeyBinding[] = [];
    let foundFirstBind = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!foundFirstBind) {
            // Collect everything before the first bind as header
            if (trimmed.startsWith("bind ")) {
                foundFirstBind = true;
            } else {
                headerLines.push(line);
                continue;
            }
        }

        if (trimmed === "" || trimmed.startsWith("//")) {
            // Skip blank lines and comments in binding section
            continue;
        }

        if (trimmed.startsWith("bind ")) {
            const binding = parseBindLine(trimmed);
            if (binding) {
                if (binding.isAdvanced) {
                    advancedBindings.push(binding);
                } else {
                    bindings.push(binding);
                }
            }
        }
        // unbind lines within the binding section are ignored (we handled unbindall in header)
    }

    return { headerLines, bindings, advancedBindings };
}

export function modifierStateToString(modifiers: string[]): string {
    if (modifiers.length === 0) return "";
    return modifiers.join("+") + "+";
}

export function modifiersToKey(modifiers: string[], key: string): string {
    return modifiers.length > 0 ? `${modifiers.join("+")}+${key}` : key;
}
