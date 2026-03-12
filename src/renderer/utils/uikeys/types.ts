// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export interface KeyBinding {
    id: string;
    modifiers: string[]; // e.g. ['Ctrl', 'Shift']
    key: string; // e.g. 'sc_a', 'esc', 'F5', 'numpad+'
    command: string; // full command string e.g. 'group focus 0'
    isChord: boolean; // key contains comma sequences like 'sc_b,sc_b'
    isAdvanced: boolean; // cannot be fully represented in visual editor
    raw: string; // original parsed line
}

export interface ParsedUikeys {
    headerLines: string[]; // lines before first bind (comments, unbindall, fakemeta, unbind)
    bindings: KeyBinding[];
    advancedBindings: KeyBinding[]; // chord bindings and other complex entries
}

export interface ModifierState {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    space: boolean; // fakemeta - space acts as modifier
    any: boolean; // Any+ prefix
}

export const EMPTY_MODIFIER_STATE: ModifierState = {
    ctrl: false,
    shift: false,
    alt: false,
    space: false,
    any: false,
};

export interface KeyDef {
    id: string; // unique key identifier, matches engine key name
    label: string; // display label (top line)
    label2?: string; // second line label for keys like Enter
    width: number; // relative width in units (1 = normal key)
    engineKey: string; // engine key name e.g. 'sc_a', 'esc', 'F1', '1'
    isModifier?: boolean; // is this a modifier key itself
    isSpacer?: boolean; // render as invisible gap between key groups, not interactive
}

export interface KeyboardRow {
    keys: KeyDef[];
    indent?: number; // left indent in units
}

export interface CommandCategory {
    id: string;
    label: string;
    commands: CommandDef[];
}

export interface CommandDef {
    command: string; // full command string
    label: string; // human readable label
    category: string; // category id
    description?: string;
}
