// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { CommandCategory } from "./types";

export type UnitType = "all" | "builder" | "combat";

export interface CommandCategoryWithMeta extends CommandCategory {
    color: string;
    unitType: UnitType;
}

export const COMMAND_CATEGORIES: CommandCategoryWithMeta[] = [
    {
        id: "unit",
        label: "Unit Commands",
        color: "#ef4444",
        unitType: "combat",
        commands: [
            { command: "attack", label: "Attack", category: "unit" },
            { command: "areaattack", label: "Area Attack", category: "unit" },
            { command: "manualfire", label: "Manual Fire", category: "unit" },
            { command: "manuallaunch", label: "Manual Launch", category: "unit" },
            { command: "fight", label: "Fight", category: "unit" },
            { command: "patrol", label: "Patrol", category: "unit" },
            { command: "guard", label: "Guard", category: "unit" },
            { command: "stop", label: "Stop", category: "unit" },
            { command: "stopproduction", label: "Stop Production", category: "unit" },
            { command: "wait", label: "Wait", category: "unit" },
            { command: "wait queued", label: "Wait (Queued)", category: "unit" },
            { command: "selfd", label: "Self Destruct", category: "unit" },
            { command: "selfd queued", label: "Self Destruct (Queued)", category: "unit" },
            { command: "cloak", label: "Cloak", category: "unit" },
            { command: "wantcloak", label: "Want Cloak", category: "unit" },
            { command: "gatherwait", label: "Gather Wait", category: "unit" },
            { command: "settarget", label: "Set Target", category: "unit" },
            { command: "settargetnoground", label: "Set Target (No Ground)", category: "unit" },
            { command: "canceltarget", label: "Cancel Target", category: "unit" },
            { command: "command_skip_current", label: "Skip Current Command", category: "unit" },
            { command: "command_cancel_last", label: "Cancel Last Command", category: "unit" },
            { command: "unit_stats", label: "Unit Stats", category: "unit" },
        ],
    },
    {
        id: "builder",
        label: "Builder Commands",
        color: "#eab308",
        unitType: "builder",
        commands: [
            { command: "reclaim", label: "Reclaim", category: "builder" },
            { command: "repair", label: "Repair", category: "builder" },
            { command: "restore", label: "Restore", category: "builder" },
            { command: "resurrect", label: "Resurrect", category: "builder" },
            { command: "capture", label: "Capture", category: "builder" },
            { command: "loadunits", label: "Load Units", category: "builder" },
            { command: "unloadunits", label: "Unload Units", category: "builder" },
        ],
    },
    {
        id: "unitstate",
        label: "Unit State",
        color: "#f97316",
        unitType: "all",
        commands: [
            { command: "onoff 0", label: "Turn Off", category: "unitstate" },
            { command: "onoff 1", label: "Turn On", category: "unitstate" },
            { command: "trajectory_toggle 0", label: "Trajectory Off", category: "unitstate" },
            { command: "trajectory_toggle 1", label: "Trajectory Hold", category: "unitstate" },
            { command: "trajectory_toggle 2", label: "Trajectory On", category: "unitstate" },
            { command: "firestate 0", label: "Hold Fire", category: "unitstate" },
            { command: "firestate 1", label: "Return Fire", category: "unitstate" },
            { command: "firestate 2", label: "Fire At Will", category: "unitstate" },
            { command: "movestate 0", label: "Hold Position", category: "unitstate" },
            { command: "movestate 1", label: "Maneuver", category: "unitstate" },
            { command: "movestate 2", label: "Roam", category: "unitstate" },
            { command: "repeat 0", label: "Repeat Off", category: "unitstate" },
            { command: "repeat 1", label: "Repeat On", category: "unitstate" },
        ],
    },
    {
        id: "selection",
        label: "Selection",
        color: "#a855f7",
        unitType: "all",
        commands: [
            { command: "select AllMap++_ClearSelection_SelectNum_0+", label: "Clear Selection", category: "selection" },
            { command: "select AllMap++_ClearSelection_SelectAll+", label: "Select All", category: "selection" },
            { command: "select Visible+_InPrevSel+_ClearSelection_SelectAll+", label: "Select Prev (Visible)", category: "selection" },
            { command: "select PrevSelection++_ClearSelection_SelectPart_50+", label: "Select Half of Prev", category: "selection" },
            { command: "select AllMap+_InPrevSel+_ClearSelection_SelectAll+", label: "Select Prev (All Map)", category: "selection" },
            { command: "select AllMap+_Transport_Idle+_ClearSelection_SelectAll+", label: "Select Idle Transports", category: "selection" },
            { command: "select AllMap+_Builder_Idle+_ClearSelection_SelectOne+", label: "Select Idle Builder", category: "selection" },
            { command: "select Visible+_Waiting+_ClearSelection_SelectAll+", label: "Select Waiting Units", category: "selection" },
            { command: "selectcomm focus", label: "Select Cmdr (Focus)", category: "selection" },
            { command: "selectcomm append", label: "Select Cmdr (Append)", category: "selection" },
            { command: "selectbox_same", label: "Selectbox Same", category: "selection" },
            { command: "selectbox_idle", label: "Selectbox Idle", category: "selection" },
            { command: "selectbox_append", label: "Selectbox Append", category: "selection" },
            { command: "selectbox_any", label: "Selectbox Any", category: "selection" },
            { command: "selectbox_deselect", label: "Selectbox Deselect", category: "selection" },
            { command: "selectbox_mobile", label: "Selectbox Mobile", category: "selection" },
            { command: "selectloop", label: "Select Loop", category: "selection" },
            { command: "selectloop_invert", label: "Select Loop Invert", category: "selection" },
            { command: "selectloop_add", label: "Select Loop Add", category: "selection" },
        ],
    },
    {
        id: "groups",
        label: "Groups",
        color: "#22c55e",
        unitType: "all",
        commands: [
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group focus ${i}`, label: `Focus Group ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group select ${i}`, label: `Select Group ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group set ${i}`, label: `Set Group ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group selectadd ${i}`, label: `Add to Group ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group add ${i}`, label: `Group Add ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group selecttoggle ${i}`, label: `Toggle Group ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `add_to_autogroup ${i}`, label: `Add Autogroup ${i}`, category: "groups" })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `load_autogroup_preset ${i}`, label: `Load Autogroup ${i}`, category: "groups" })),
            { command: "group unset", label: "Unset Group", category: "groups" },
            { command: "remove_from_autogroup", label: "Remove Autogroup", category: "groups" },
        ],
    },
    {
        id: "camera",
        label: "Camera",
        color: "#38bdf8",
        unitType: "all",
        commands: [
            { command: "moveforward", label: "Camera Forward", category: "camera" },
            { command: "moveback", label: "Camera Back", category: "camera" },
            { command: "moveleft", label: "Camera Left", category: "camera" },
            { command: "moveright", label: "Camera Right", category: "camera" },
            { command: "moveup", label: "Camera Up", category: "camera" },
            { command: "movedown", label: "Camera Down", category: "camera" },
            { command: "movefast", label: "Camera Fast Move", category: "camera" },
            { command: "movereset", label: "Camera Reset", category: "camera" },
            { command: "moverotate", label: "Camera Rotate", category: "camera" },
            { command: "movetilt", label: "Camera Tilt", category: "camera" },
            { command: "cameraflip", label: "Camera Flip", category: "camera" },
            { command: "viewta", label: "TA Camera", category: "camera" },
            { command: "viewspring", label: "Spring Camera", category: "camera" },
            { command: "toggleoverview", label: "Toggle Overview", category: "camera" },
            ...Array.from({ length: 4 }, (_, i) => ({ command: `set_camera_anchor ${i + 1}`, label: `Set Anchor ${i + 1}`, category: "camera" })),
            ...Array.from({ length: 4 }, (_, i) => ({ command: `focus_camera_anchor ${i + 1}`, label: `Focus Anchor ${i + 1}`, category: "camera" })),
            { command: "LastMsgPos", label: "Last Message Pos", category: "camera" },
        ],
    },
    {
        id: "build",
        label: "Building",
        color: "#fb923c",
        unitType: "builder",
        commands: [
            { command: "buildfacing inc", label: "Build Facing +", category: "build" },
            { command: "buildfacing dec", label: "Build Facing −", category: "build" },
            { command: "buildspacing inc", label: "Build Spacing +", category: "build" },
            { command: "buildspacing dec", label: "Build Spacing −", category: "build" },
            { command: "buildsplit", label: "Build Split", category: "build" },
            { command: "commandinsert prepend_between", label: "Command Insert", category: "build" },
            { command: "blueprint_place", label: "Blueprint Place", category: "build" },
            { command: "blueprint_create", label: "Blueprint Create", category: "build" },
            { command: "blueprint_delete", label: "Blueprint Delete", category: "build" },
            { command: "blueprint_prev", label: "Blueprint Prev", category: "build" },
            { command: "blueprint_next", label: "Blueprint Next", category: "build" },
            { command: "factoryguard 0", label: "Factory Guard Off", category: "build" },
            { command: "factoryguard 1", label: "Factory Guard On", category: "build" },
            { command: "factoryqueuemode", label: "Factory Queue Mode", category: "build" },
        ],
    },
    {
        id: "gridmenu",
        label: "Grid Menu",
        color: "#0ea5e9",
        unitType: "builder",
        commands: [
            ...Array.from({ length: 4 }, (_, i) => ({ command: `gridmenu_category ${i + 1}`, label: `Grid Category ${i + 1}`, category: "gridmenu" })),
            ...Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => ({ command: `gridmenu_key ${row + 1} ${col + 1}`, label: `Grid Key ${row + 1}-${col + 1}`, category: "gridmenu" }))
            ).flat(),
            { command: "gridmenu_next_page", label: "Grid Next Page", category: "gridmenu" },
            { command: "gridmenu_cycle_builder", label: "Grid Cycle Builder", category: "gridmenu" },
        ],
    },
    {
        id: "spectator",
        label: "Spectator",
        color: "#94a3b8",
        unitType: "all",
        commands: [
            ...Array.from({ length: 9 }, (_, i) => ({ command: `specteam ${i}`, label: `Spectate Team ${i}`, category: "spectator" })),
        ],
    },
    {
        id: "ui",
        label: "UI",
        color: "#e2e8f0",
        unitType: "all",
        commands: [
            { command: "HideInterface", label: "Hide Interface", category: "ui" },
            { command: "togglelos", label: "Toggle LOS", category: "ui" },
            { command: "ShowPathTraversability", label: "Show Path Traversability", category: "ui" },
            { command: "ShowMetalMap", label: "Show Metal Map", category: "ui" },
            { command: "ShowElevation", label: "Show Elevation", category: "ui" },
            { command: "customgameinfo", label: "Custom Game Info", category: "ui" },
            { command: "options", label: "Options", category: "ui" },
            { command: "screenshot png", label: "Screenshot (PNG)", category: "ui" },
            { command: "teamstatus_close", label: "Team Status Close", category: "ui" },
            { command: "customgameinfo_close", label: "Game Info Close", category: "ui" },
            { command: "buildmenu_pregame_deselect", label: "Build Menu Deselect", category: "ui" },
            { command: "drawlabel", label: "Draw Label", category: "ui" },
            { command: "drawinmap", label: "Draw In Map", category: "ui" },
            { command: "fullscreen", label: "Fullscreen", category: "ui" },
            { command: "pause", label: "Pause", category: "ui" },
        ],
    },
    {
        id: "audio",
        label: "Audio",
        color: "#14b8a6",
        unitType: "all",
        commands: [
            { command: "MuteSound", label: "Mute Sound", category: "audio" },
            { command: "snd_volume_increase", label: "Volume +", category: "audio" },
            { command: "snd_volume_decrease", label: "Volume −", category: "audio" },
            { command: "increasespeed", label: "Increase Speed", category: "audio" },
            { command: "decreasespeed", label: "Decrease Speed", category: "audio" },
        ],
    },
    {
        id: "chat",
        label: "Chat",
        color: "#f472b6",
        unitType: "all",
        commands: [
            { command: "chat", label: "Open Chat", category: "chat" },
            { command: "chatswitchally", label: "Chat → Ally", category: "chat" },
            { command: "chatswitchspec", label: "Chat → Spec", category: "chat" },
            { command: "quitmessage", label: "Quit Message", category: "chat" },
            { command: "quitmenu", label: "Quit Menu", category: "chat" },
            { command: "quitforce", label: "Force Quit", category: "chat" },
            { command: "reloadforce", label: "Force Reload", category: "chat" },
            { command: "pastetext", label: "Paste Text", category: "chat" },
        ],
    },
];

// Flat list of all commands
export const ALL_COMMANDS = COMMAND_CATEGORIES.flatMap((cat) => cat.commands);

// Map from command string to CommandDef
export const COMMAND_MAP = new Map(ALL_COMMANDS.map((c) => [c.command, c]));

// Map from command string to category color
export const COMMAND_COLOR_MAP = new Map(
    COMMAND_CATEGORIES.flatMap((cat) => cat.commands.map((c) => [c.command, cat.color]))
);

// Map from command string to category unitType
export const COMMAND_UNIT_TYPE_MAP = new Map(
    COMMAND_CATEGORIES.flatMap((cat) => cat.commands.map((c) => [c.command, cat.unitType]))
);

export function getCommandLabel(command: string): string {
    return COMMAND_MAP.get(command)?.label ?? command;
}

export function getCommandColor(command: string): string {
    return COMMAND_COLOR_MAP.get(command) ?? "#94a3b8";
}

export function getCommandUnitType(command: string): UnitType {
    return COMMAND_UNIT_TYPE_MAP.get(command) ?? "all";
}
