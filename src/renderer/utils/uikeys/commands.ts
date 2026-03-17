// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { CommandCategory, UserRequirement } from "./types";

export type UnitType = "all" | "builder" | "combat";

export interface CommandCategoryWithMeta extends CommandCategory {
    color: string;
    unitType: UnitType;
}

export { UserRequirement };

export const COMMAND_CATEGORIES: CommandCategoryWithMeta[] = [
    {
        id: "unit",
        label: "Unit Commands",
        color: "#ef4444",
        unitType: "combat",
        commands: [
            { command: "attack",                 label: "Attack",                  category: "unit",      description: "Order selected units to attack a target. -High" },
            { command: "areaattack",             label: "Area Attack",             category: "unit",      description: "Order selected units to attack all enemies in a dragged area. -High", comment: "For bombers and select ground artillery units only" },
            { command: "manualfire",             label: "Manual Fire",             category: "unit",      description: "Manually fire a weapon that is otherwise automatic (e.g. artillery, tactical missiles). -High" },
            { command: "manuallaunch",           label: "Manual Launch",           category: "unit",      description: "Manually launch a projectile such as a nuclear missile. -High" },
            { command: "fight",                  label: "Fight",                   category: "unit",      description: "Move to a destination while attacking any enemies encountered along the way. -High" },
            { command: "patrol",                 label: "Patrol",                  category: "unit",      description: "Patrol back and forth between waypoints, attacking enemies in range. -High" },
            { command: "guard",                  label: "Guard",                   category: "unit",      description: "Follow and protect a target unit, assisting with repairs or construction. -High" },
            { command: "stop",                   label: "Stop",                    category: "unit",      description: "Cancel all current orders and stop moving immediately. -High" },
            { command: "stopproduction",         label: "Stop Production",         category: "unit",      description: "Stop the current build order in a factory. -High" },
            { command: "wait",                   label: "Wait",                    category: "unit",      description: "Pause execution of the command queue until this wait is cancelled. -High" },
            { command: "wait queued",            label: "Wait (Queued)",           category: "unit",      description: "Insert a wait point into the command queue (Shift+click equivalent). -High" },
            { command: "selfd",                  label: "Self Destruct",           category: "unit",      description: "Order selected units to self-destruct. -High" },
            { command: "selfd queued",           label: "Self Destruct (Queued)", category: "unit",      description: "Queue a self-destruct as a future order (Shift+click equivalent). -High" },
            { command: "cloak",                  label: "Cloak",                   category: "unit",      description: "Toggle the cloak state of selected units on or off. -High" },
            { command: "wantcloak",              label: "Want Cloak",              category: "unit",      description: "Enable auto-cloak: unit will re-cloak automatically after firing. -Medium" },
            { command: "gatherwait",             label: "Gather Wait",             category: "unit",      description: "Insert a wait that holds until all units in the selection have arrived at the same point before continuing. -Medium" },
            { command: "settarget",              label: "Set Target",              category: "unit",      description: "Manually designate a priority attack target for selected units. -High" },
            { command: "settargetnoground",      label: "Set Target (No Ground)", category: "unit",      description: "Set a priority attack target while preventing units from targeting the ground. -Medium" },
            { command: "canceltarget",           label: "Cancel Target",           category: "unit",      description: "Clear the manually designated priority target. -High" },
            { command: "command_skip_current",   label: "Skip Current Command",    category: "unit",      description: "Skip the current command in the queue and move to the next one. -Medium" },
            { command: "command_cancel_last",    label: "Cancel Last Command",     category: "unit",      description: "Remove the most recently added command from the queue. -Medium" },
            { command: "unit_stats",             label: "Unit Stats",              category: "unit",      description: "Toggle a display of detailed stats for the selected unit. -Medium" },
        ],
    },
    {
        id: "builder",
        label: "Builder Commands",
        color: "#eab308",
        unitType: "builder",
        commands: [
            { command: "reclaim",     label: "Reclaim",      category: "builder", description: "Order builders to reclaim units, wrecks, or features to recover metal and energy. -High" },
            { command: "repair",      label: "Repair",       category: "builder", description: "Order builders to repair friendly units or structures. -High" },
            { command: "restore",     label: "Restore",      category: "builder", description: "Order builders to restore terraformed terrain back to the original map height. -Medium" },
            { command: "resurrect",   label: "Resurrect",    category: "builder", description: "Order builders to resurrect a wreck and convert it back into a living unit. -High" },
            { command: "capture",     label: "Capture",      category: "builder", description: "Order builders to capture an enemy unit and convert it to your side. -High" },
            { command: "loadunits",   label: "Load Units",   category: "builder", description: "Order a transport to load nearby units onto itself. -Medium" },
            { command: "unloadunits", label: "Unload Units", category: "builder", description: "Order a transport to unload its carried units at the target location. -Medium" },
        ],
    },
    {
        id: "unitstate",
        label: "Unit State",
        color: "#f97316",
        unitType: "all",
        commands: [
            { command: "onoff 0",             label: "Turn Off",          category: "unitstate", description: "Turn off the selected unit, disabling its weapons and movement. -High" },
            { command: "onoff 1",             label: "Turn On",           category: "unitstate", description: "Turn on the selected unit, re-enabling weapons and movement. -High" },
            { command: "trajectory_toggle 0", label: "Trajectory Off",    category: "unitstate", description: "Set projectile trajectory to flat/direct-fire mode. -Medium" },
            { command: "trajectory_toggle 1", label: "Trajectory Hold",   category: "unitstate", description: "Set projectile trajectory to the default (hold) mode. -Medium" },
            { command: "trajectory_toggle 2", label: "Trajectory On",     category: "unitstate", description: "Set projectile trajectory to high-arc mode for firing over obstacles. -Medium" },
            { command: "firestate 0",         label: "Hold Fire",         category: "unitstate", description: "Units will not fire unless explicitly ordered to attack. -High" },
            { command: "firestate 1",         label: "Return Fire",       category: "unitstate", description: "Units will only fire back if they are attacked. -High" },
            { command: "firestate 2",         label: "Fire At Will",      category: "unitstate", description: "Units automatically attack any enemy that comes within range. -High" },
            { command: "movestate 0",         label: "Hold Position",     category: "unitstate", description: "Units will not move from their current location. -High" },
            { command: "movestate 1",         label: "Maneuver",          category: "unitstate", description: "Units may reposition slightly to improve their firing angles. -High" },
            { command: "movestate 2",         label: "Roam",              category: "unitstate", description: "Units move freely, wandering and chasing enemies. -High" },
            { command: "repeat 0",            label: "Repeat Off",        category: "unitstate", description: "Factory stops producing after completing its build queue once. -High" },
            { command: "repeat 1",            label: "Repeat On",         category: "unitstate", description: "Factory loops its build queue continuously. -High" },
            { command: "priority 0",          label: "Builder Priority: Low",  category: "unitstate", description: "Set selected builders to low priority — they will yield to high-priority builders. -Medium" },
            { command: "priority 1",          label: "Builder Priority: High", category: "unitstate", description: "Set selected builders to high priority — they build faster relative to low-priority builders. -Medium" },
            { command: "idlemode 0",          label: "Aircraft: Fly When Idle",  category: "unitstate", description: "Aircraft will continue flying when they have no orders. -Medium" },
            { command: "idlemode 1",          label: "Aircraft: Land When Idle", category: "unitstate", description: "Aircraft will land automatically when they have no orders. -Medium" },
        ],
    },
    {
        id: "selection",
        label: "Selection",
        color: "#a855f7",
        unitType: "all",
        commands: [
            { command: "select AllMap++_ClearSelection_SelectNum_0+",                label: "Clear Selection",          category: "selection", description: "Deselect all currently selected units. -High" },
            { command: "select AllMap++_ClearSelection_SelectAll+",                  label: "Select All",               category: "selection", description: "Select every unit on the entire map. -High" },
            { command: "select Visible+_InPrevSel+_ClearSelection_SelectAll+",      label: "Select Prev (Visible)",    category: "selection", description: "Re-select your previous selection, limited to units currently visible on screen. -Medium" },
            { command: "select PrevSelection++_ClearSelection_SelectPart_50+",      label: "Select Half of Prev",      category: "selection", description: "Randomly select 50% of your previous selection. -Medium" },
            { command: "select AllMap+_InPrevSel+_ClearSelection_SelectAll+",       label: "Select Prev (All Map)",    category: "selection", description: "Re-select your previous selection across the entire map. -Medium" },
            { command: "select AllMap+_Transport_Idle+_ClearSelection_SelectAll+",  label: "Select Idle Transports",   category: "selection", description: "Select all idle transport units anywhere on the map. -Medium" },
            { command: "select AllMap+_Builder_Idle+_ClearSelection_SelectOne+",    label: "Select Idle Builder",      category: "selection", description: "Select one idle builder and jump the camera to it. -Medium" },
            { command: "select Visible+_Waiting+_ClearSelection_SelectAll+",        label: "Select Waiting Units",     category: "selection", description: "Select all units currently in a wait state on screen. -Medium" },
            { command: "selectcomm focus",   label: "Select Cmdr (Focus)",   category: "selection", description: "Select your commander and move the camera to its location. -High" },
            { command: "selectcomm append",  label: "Select Cmdr (Append)",  category: "selection", description: "Add your commander to the current selection without clearing it. -Medium" },
            { command: "selectbox_same",     label: "Selectbox Same",        category: "selection", description: "While drag-selecting, restrict to the same unit type as the one under the cursor. -Medium" },
            { command: "selectbox_idle",     label: "Selectbox Idle",        category: "selection", description: "While drag-selecting, restrict to idle units only. -Medium" },
            { command: "selectbox_append",   label: "Selectbox Append",      category: "selection", description: "While drag-selecting, add matched units to the existing selection instead of replacing it. -Medium" },
            { command: "selectbox_any",      label: "Selectbox Any",         category: "selection", description: "While drag-selecting, include all unit types (the default behavior). -Medium" },
            { command: "selectbox_deselect", label: "Selectbox Deselect",    category: "selection", description: "While drag-selecting, remove matched units from the current selection. -Medium" },
            { command: "selectbox_mobile",   label: "Selectbox Mobile",      category: "selection", description: "While drag-selecting, restrict to mobile units only. -Medium" },
            { command: "selectloop",         label: "Select Loop",           category: "selection", description: "Cycle through individual units of the same type from the current selection, selecting one at a time. -Medium" },
            { command: "selectloop_invert",  label: "Select Loop Invert",    category: "selection", description: "Cycle backwards through units of the same type. -Medium" },
            { command: "selectloop_add",     label: "Select Loop Add",       category: "selection", description: "Add the next unit of the same type to the selection while cycling. -Medium" },
        ],
    },
    {
        id: "groups",
        label: "Groups",
        color: "#22c55e",
        unitType: "all",
        commands: [
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group focus ${i}`,          label: `Focus Group ${i}`,    category: "groups", description: `Move the camera to group ${i} and select it. -High` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group select ${i}`,         label: `Select Group ${i}`,   category: "groups", description: `Select group ${i} without moving the camera. -High` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group set ${i}`,            label: `Set Group ${i}`,      category: "groups", description: `Assign selected units to group ${i}, replacing any previous members. -High` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group selectadd ${i}`,      label: `Add to Group ${i}`,   category: "groups", description: `Add group ${i}'s units to the current selection. -Medium` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group add ${i}`,            label: `Group Add ${i}`,      category: "groups", description: `Add selected units to group ${i} without removing existing members. -Medium` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group selecttoggle ${i}`,   label: `Toggle Group ${i}`,   category: "groups", description: `Toggle selection of group ${i}: add if not selected, remove if already selected. -Medium` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `add_to_autogroup ${i}`,     label: `Add Autogroup ${i}`,  category: "groups", description: `Add selected units to autogroup slot ${i}. Autogroups automatically collect units of matching types. -Low` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `load_autogroup_preset ${i}`,label: `Load Autogroup ${i}`, category: "groups", description: `Load and select autogroup preset ${i}. -Low` })),
            { command: "group unset",            label: "Unset Group",      category: "groups", description: "Remove selected units from their assigned control group. -Medium" },
            { command: "remove_from_autogroup",  label: "Remove Autogroup", category: "groups", description: "Remove selected units from their autogroup assignment. -Low" },
        ],
    },
    {
        id: "camera",
        label: "Camera",
        color: "#38bdf8",
        unitType: "all",
        commands: [
            { command: "moveforward",  label: "Camera Forward",    category: "camera", description: "Scroll the camera forward (toward the top of the map). -High" },
            { command: "moveback",     label: "Camera Back",       category: "camera", description: "Scroll the camera backward (toward the bottom of the map). -High" },
            { command: "moveleft",     label: "Camera Left",       category: "camera", description: "Scroll the camera to the left. -High" },
            { command: "moveright",    label: "Camera Right",      category: "camera", description: "Scroll the camera to the right. -High" },
            { command: "moveup",       label: "Camera Up",         category: "camera", description: "Zoom the camera out. -High" },
            { command: "movedown",     label: "Camera Down",       category: "camera", description: "Zoom the camera in. -High" },
            { command: "movefast",     label: "Camera Fast Move",  category: "camera", description: "Hold to move the camera at increased speed. -High" },
            { command: "movereset",    label: "Camera Reset",      category: "camera", description: "Reset the camera to its default position and zoom level. -Medium" },
            { command: "moverotate",   label: "Camera Rotate",     category: "camera", description: "Hold to rotate the camera view horizontally. -Medium" },
            { command: "movetilt",     label: "Camera Tilt",       category: "camera", description: "Hold to tilt the camera angle (pitch up or down). -Medium" },
            { command: "cameraflip",   label: "Camera Flip",       category: "camera", description: "Flip the camera orientation 180 degrees. -Medium" },
            { command: "viewta",       label: "TA Camera",         category: "camera", description: "Switch to the Total Annihilation-style overhead fixed camera mode. -Medium" },
            { command: "viewspring",   label: "Spring Camera",     category: "camera", description: "Switch to the Spring free-look rotating camera mode. -Medium" },
            { command: "toggleoverview", label: "Toggle Overview", category: "camera", description: "Toggle the minimap overview or full-screen minimap display. -Medium" },
            ...Array.from({ length: 4 }, (_, i) => ({ command: `set_camera_anchor ${i + 1}`,   label: `Set Anchor ${i + 1}`,   category: "camera", description: `Save the current camera position to anchor slot ${i + 1}. -Medium` })),
            ...Array.from({ length: 4 }, (_, i) => ({ command: `focus_camera_anchor ${i + 1}`, label: `Focus Anchor ${i + 1}`, category: "camera", description: `Jump the camera to saved anchor position ${i + 1}. -Medium` })),
            { command: "LastMsgPos",   label: "Last Message Pos",      category: "camera", description: "Jump the camera to the location of the last received alert or chat message. -High" },
            { command: "track",        label: "Track Unit",            category: "camera", description: "Lock the camera to follow the selected unit(s). -Medium" },
            { command: "trackmode",    label: "Track Mode",            category: "camera", description: "Cycle between camera tracking modes (affects how groups of units are tracked). -Medium" },
        ],
    },
    {
        id: "build",
        label: "Building",
        color: "#fb923c",
        unitType: "builder",
        commands: [
            { command: "buildfacing inc",              label: "Build Facing +",      category: "build", description: "Rotate the build placement preview clockwise. -High" },
            { command: "buildfacing dec",              label: "Build Facing −",      category: "build", description: "Rotate the build placement preview counter-clockwise. -High" },
            { command: "buildspacing inc",             label: "Build Spacing +",     category: "build", description: "Increase the gap between structures when drag-building a row. -Medium" },
            { command: "buildspacing dec",             label: "Build Spacing −",     category: "build", description: "Decrease the gap between structures when drag-building a row. -Medium" },
            { command: "buildsplit",                   label: "Build Split",          category: "build", description: "Split a drag-build queue evenly among all selected builders. -Medium" },
            { command: "commandinsert prepend_between",label: "Command Insert",       category: "build", description: "Insert a new command at the front of the queue or between existing commands. -Medium" },
            { command: "blueprint_place",              label: "Blueprint Place",      category: "build", description: "Place a saved blueprint onto the map at the cursor position. -Low" },
            { command: "blueprint_create",             label: "Blueprint Create",     category: "build", description: "Save the current build queue layout as a reusable blueprint. -Low" },
            { command: "blueprint_delete",             label: "Blueprint Delete",     category: "build", description: "Delete the currently selected blueprint. -Low" },
            { command: "blueprint_prev",               label: "Blueprint Prev",       category: "build", description: "Switch to the previous saved blueprint. -Low" },
            { command: "blueprint_next",               label: "Blueprint Next",       category: "build", description: "Switch to the next saved blueprint. -Low" },
            { command: "factoryguard 0",               label: "Factory Guard Off",    category: "build", description: "Disable factory guard: newly built units will not automatically assist the factory. -Medium" },
            { command: "factoryguard 1",               label: "Factory Guard On",     category: "build", description: "Enable factory guard: newly built units will automatically assist (guard) the factory. -Medium" },
            { command: "factoryqueuemode",             label: "Factory Queue Mode",   category: "build", description: "Toggle between repeat and one-shot factory queue mode. -Medium" },
        ],
    },
    {
        id: "gridmenu",
        label: "Grid Menu",
        color: "#0ea5e9",
        unitType: "builder",
        commands: [
            ...Array.from({ length: 4 }, (_, i) => ({ command: `gridmenu_category ${i + 1}`, label: `Grid Category ${i + 1}`, category: "gridmenu", description: `Switch the build grid to category tab ${i + 1}. -Medium` })),
            ...Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => ({ command: `gridmenu_key ${row + 1} ${col + 1}`, label: `Grid Key ${row + 1}-${col + 1}`, category: "gridmenu", description: `Activate the build grid button at row ${row + 1}, column ${col + 1}. -Medium` }))
            ).flat(),
            { command: "gridmenu_next_page",      label: "Grid Next Page",      category: "gridmenu", description: "Go to the next page of the build grid menu. -Medium" },
            { command: "gridmenu_cycle_builder",  label: "Grid Cycle Builder",  category: "gridmenu", description: "Cycle through selected builders one at a time for individual build commands. -Medium" },
        ],
    },
    {
        id: "spectator",
        label: "Spectator",
        color: "#94a3b8",
        unitType: "all",
        commands: [
            ...Array.from({ length: 9 }, (_, i) => ({ command: `specteam ${i}`, label: `Spectate Team ${i}`, category: "spectator", description: `While spectating, switch the view to follow team ${i}. -Medium` })),
        ],
    },
    {
        id: "ui",
        label: "UI",
        color: "#e2e8f0",
        unitType: "all",
        commands: [
            { command: "HideInterface",            label: "Hide Interface",        category: "ui", description: "Toggle visibility of all UI elements (widgets, panels, minimap). -High", comment: "Intentionally unbound in Grid Keys — toggling the UI off is rarely useful mid-game" },
            { command: "togglelos",                label: "Toggle LOS",            category: "ui", description: "Cycle through LOS visualization modes: normal, line-of-sight overlay, radar overlay. -High" },
            { command: "ShowPathTraversability",   label: "Show Path Traversability", category: "ui", description: "Toggle an overlay showing which terrain is passable for ground units. -Medium" },
            { command: "ShowMetalMap",             label: "Show Metal Map",        category: "ui", description: "Toggle a metal deposit overlay showing where metal can be extracted on the map. -High" },
            { command: "ShowElevation",            label: "Show Elevation",        category: "ui", description: "Toggle a color-coded elevation/height map overlay. -Medium" },
            { command: "customgameinfo",           label: "Custom Game Info",      category: "ui", description: "Open the custom game info panel showing game mode details and rules. -Medium" },
            { command: "options",                  label: "Options",               category: "ui", description: "Open the in-game options and settings menu. -High" },
            { command: "screenshot png",           label: "Screenshot (PNG)",      category: "ui", description: "Save a PNG screenshot of the current view to your screenshots folder. -High" },
            { command: "teamstatus_close",         label: "Team Status Close",     category: "ui", description: "Close the team status panel. -Medium" },
            { command: "customgameinfo_close",     label: "Game Info Close",       category: "ui", description: "Close the custom game info panel. -Medium" },
            { command: "buildmenu_pregame_deselect", label: "Build Menu Deselect", category: "ui", description: "Deselect the current item in the pre-game build menu. -Low" },
            { command: "drawlabel",                label: "Draw Label",            category: "ui", description: "Place a text label on the map visible to allies. -High" },
            { command: "drawinmap",                label: "Draw In Map",           category: "ui", description: "Toggle map drawing mode to draw lines and arrows on the map for allies. -High" },
            { command: "fullscreen",               label: "Fullscreen",            category: "ui", description: "Toggle fullscreen mode. -High" },
            { command: "pause",                    label: "Pause",                 category: "ui", description: "Pause or unpause the game (only available if the host allows it). -High" },
            { command: "attack_range_inc",         label: "Attack Range Display +", category: "ui", description: "Cycle to the next attack range display configuration for the unit type under the cursor. -Low" },
            { command: "attack_range_dec",         label: "Attack Range Display −", category: "ui", description: "Cycle to the previous attack range display configuration for the unit type under the cursor. -Low" },
            { command: "cursor_range_toggle",      label: "Cursor Range Toggle",   category: "ui", description: "Toggle display of the attack range of the unit currently under the mouse cursor. -Low" },
        ],
    },
    {
        id: "audio",
        label: "Audio",
        color: "#14b8a6",
        unitType: "all",
        commands: [
            { command: "MuteSound",           label: "Mute Sound",    category: "audio", description: "Toggle all game audio on or off. -High" },
            { command: "snd_volume_increase", label: "Volume +",      category: "audio", description: "Increase the master volume. -High" },
            { command: "snd_volume_decrease", label: "Volume −",      category: "audio", description: "Decrease the master volume. -High" },
            { command: "increasespeed",       label: "Increase Speed", category: "audio", description: "Increase game simulation speed. Only available to the host or in singleplayer. -Medium" },
            { command: "decreasespeed",       label: "Decrease Speed", category: "audio", description: "Decrease game simulation speed. Only available to the host or in singleplayer. -Medium" },
        ],
    },
    {
        id: "chat",
        label: "Chat",
        color: "#f472b6",
        unitType: "all",
        commands: [
            { command: "chat",            label: "Open Chat",      category: "chat", description: "Open the chat input box to send a message. -High" },
            { command: "chatswitchally", label: "Chat → Ally",    category: "chat", description: "Switch chat target to allies only. -High" },
            { command: "chatswitchspec", label: "Chat → Spec",    category: "chat", description: "Switch chat target to spectators only. -High" },
            { command: "quitmessage",    label: "Quit Message",   category: "chat", description: "Send a predefined resignation message and leave the game. -Medium",  userRequirement: "deleted" },
            { command: "quitmenu",       label: "Quit Menu",      category: "chat", description: "Open the resign / quit confirmation menu. -High",                    userRequirement: "devmode" },
            { command: "quitforce",      label: "Force Quit",     category: "chat", description: "Immediately exit the game without a confirmation prompt. -High",     userRequirement: "devmode" },
            { command: "reloadforce",    label: "Force Reload",   category: "chat", description: "Force-reload and restart the current game session. -Medium",         userRequirement: "devmode" },
            { command: "pastetext",      label: "Paste Text",     category: "chat", description: "Paste clipboard text into the active chat input box. -High",         comment: "Typically handled at OS level" },
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

// Labels for system commands that appear in uikeys but are not in the palette
const COMMAND_LABEL_OVERRIDES: Record<string, string> = {
    edit_home:      "Edit: Home",
    edit_end:       "Edit: End",
    edit_prev_line: "Edit: Previous Line",
    edit_next_line: "Edit: Next Line",
    edit_next_char: "Edit: Next Character",
    edit_prev_char: "Edit: Previous Character",
    edit_complete:  "Edit: Complete",
    edit_backspace: "Edit: Backspace",
    edit_delete:    "Edit: Delete",
    edit_return:    "Edit: Return",
    edit_escape:    "Edit: Escape",
    pastetext:      "Paste Text",
    sharedialog:    "Share Dialog",
    viewfps:        "FPS Camera",
    viewta:         "TA Camera",
    viewspring:     "Spring Camera",
    viewrot:        "Rotating Camera",
    move:           "Move",
    onoff:          "Toggle On/Off",
};

export function getCommandLabel(command: string): string {
    return COMMAND_MAP.get(command)?.label ?? COMMAND_LABEL_OVERRIDES[command] ?? command;
}

export function getCommandDescription(command: string): string | undefined {
    return COMMAND_MAP.get(command)?.description;
}

export function getCommandColor(command: string): string {
    return COMMAND_COLOR_MAP.get(command) ?? "#94a3b8";
}

export function getCommandUnitType(command: string): UnitType {
    return COMMAND_UNIT_TYPE_MAP.get(command) ?? "all";
}

export function getCommandUserRequirement(command: string): UserRequirement | undefined {
    return COMMAND_MAP.get(command)?.userRequirement;
}

export function getCommandComment(command: string): string | undefined {
    return COMMAND_MAP.get(command)?.comment;
}
