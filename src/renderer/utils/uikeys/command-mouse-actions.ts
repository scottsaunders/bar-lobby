// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

/**
 * Mouse button actions for commands that activate a cursor mode.
 *
 * These are engine-level behaviors — they cannot be remapped in uikeys.txt.
 * After pressing the bound key the cursor changes; LMB/RMB then execute the
 * action on the clicked target (or dragged area).
 *
 * isDrag = true  → gesture requires click-and-drag, not a single click.
 */

export interface MouseAction {
    label: string;
    isDrag?: boolean;
}

export interface CommandMouseActions {
    mouse1?: MouseAction; // LMB
    mouse2?: MouseAction; // RMB
    mouse3?: MouseAction; // MMB
}

export const COMMAND_MOUSE_ACTIONS: Record<string, CommandMouseActions> = {
    // ── Unit commands ────────────────────────────────────────────────────────
    "attack":            { mouse1: { label: "Attack target" },          mouse2: { label: "Attack (line)", isDrag: true } },
    "areaattack":        { mouse1: { label: "Area attack",  isDrag: true } },
    "fight":             { mouse1: { label: "Fight to point" },         mouse2: { label: "Fight (line)",  isDrag: true } },
    "patrol":            { mouse1: { label: "Set patrol point" },       mouse2: { label: "Patrol (line)", isDrag: true } },
    "guard":             { mouse1: { label: "Guard unit" } },
    "manualfire":        { mouse1: { label: "Fire weapon" } },
    "manuallaunch":      { mouse1: { label: "Launch" } },
    "settarget":         { mouse1: { label: "Set target" } },
    "settargetnoground": { mouse1: { label: "Set target" } },

    // ── Builder commands ─────────────────────────────────────────────────────
    "reclaim":           { mouse1: { label: "Reclaim" },                mouse2: { label: "Reclaim area",    isDrag: true } },
    "repair":            { mouse1: { label: "Repair" },                 mouse2: { label: "Repair area",     isDrag: true } },
    "restore":           { mouse1: { label: "Restore terrain", isDrag: true } },
    "resurrect":         { mouse1: { label: "Resurrect" },              mouse2: { label: "Resurrect area",  isDrag: true } },
    "capture":           { mouse1: { label: "Capture unit" } },
    "loadunits":         { mouse1: { label: "Load units" } },
    "unloadunits":       { mouse1: { label: "Set drop point" } },
};

export function getCommandMouseActions(command: string): CommandMouseActions | undefined {
    return COMMAND_MOUSE_ACTIONS[command];
}
