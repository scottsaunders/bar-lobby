// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { KeyBinding, ParsedUikeys } from "./types";

function serializeBinding(b: KeyBinding): string {
    const keyCombo = b.modifiers.length > 0 ? `${b.modifiers.join("+")}+${b.key}` : b.key;
    // Pad for readability: "bind" + padded keyCombo + command
    const padded = keyCombo.padStart(20);
    return `bind ${padded}  ${b.command}`;
}

export function serializeUikeys(parsed: ParsedUikeys): string {
    const lines: string[] = [];

    // Write header lines as-is
    for (const line of parsed.headerLines) {
        lines.push(line);
    }

    // Write normal bindings
    for (const binding of parsed.bindings) {
        lines.push(serializeBinding(binding));
    }

    // Write advanced bindings (chords, etc.) - preserve raw format
    if (parsed.advancedBindings.length > 0) {
        lines.push("");
        lines.push("// Advanced bindings (chord sequences - managed automatically)");
        for (const binding of parsed.advancedBindings) {
            lines.push(binding.raw);
        }
    }

    return lines.join("\n");
}
