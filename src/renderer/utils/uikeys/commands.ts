// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { CommandCategory, UserRequirement } from "./types";

export type UnitType = "all" | "builder" | "combat" | "factory";

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
            { command: "attack",                 label: "Attack",                  category: "unit",      description: "Simple attack of enemy units." },
            { command: "areaattack",             label: "Area Attack",             category: "unit",      description: "Define a circle in which to spread attack/fire.", comment: "For bombers and select ground artillery units only" },
            { command: "manualfire",             label: "Manual Fire",             category: "unit",      description: "Manually fire a weapon that is otherwise automatic (e.g. artillery, tactical missiles)." },
            { command: "manuallaunch",           label: "Manual Launch",           category: "unit",      description: "Manually launch a projectile such as a nuclear missile." },
            { command: "fight",                  label: "Fight",                   category: "unit",      description: "Attack + Move command. Units will stop moving when they can attack." },
            { command: "patrol",                 label: "Patrol",                  category: "unit",      description: "Make a looping patrol route for selected units." },
            { command: "guard",                  label: "Guard",                   category: "unit",      description: "Guard any unit or building to help fight, repair or construct." },
            { command: "stop",                   label: "Stop",                    category: "unit",      description: "Stop all commands/orders." },
            { command: "wait",                   label: "Wait",                    category: "unit",      description: "Pause command to make a unit wait temporarily." },
            { command: "wait queued",            label: "Wait (Queued)",           category: "unit",      description: "Insert a wait point into the command queue (Shift+click equivalent)." },
            { command: "selfd",                  label: "Self Destruct",           category: "unit",      description: "Initiate self-destruct sequence." },
            { command: "selfd queued",           label: "Self Destruct (Queued)", category: "unit",      description: "Queue a self-destruct as a future order (Shift+click equivalent)." },
            { command: "cloak",                  label: "Cloak",                   category: "unit",      description: "Cloak or Decloak." },
            { command: "wantcloak",              label: "Want Cloak",              category: "unit",      description: "Enable auto-cloak: unit will re-cloak automatically after firing." },
            { command: "gatherwait",             label: "Gather Wait",             category: "unit",      description: "All selected units will wait for the group to finish their previous command." },
            { command: "settarget",              label: "Set Target",              category: "unit",      description: "Set a preferred target to attack, even while moving." },
            { command: "settargetnoground",      label: "Set Target (No Ground)", category: "unit",      description: "Set a preferred target while preventing units from targeting the ground." },
            { command: "canceltarget",           label: "Cancel Target",           category: "unit",      description: "Cancel selected preferred target." },
            { command: "command_skip_current",   label: "Skip Current Command",    category: "unit",      description: "Force a unit to skip to the next order in its queue." },
            { command: "command_cancel_last",    label: "Cancel Last Command",     category: "unit",      description: "Remove the most recently added command from the queue." },
            { command: "unit_stats",             label: "Unit Stats",              category: "unit",      description: "Toggle a display of detailed stats for the selected unit." },
        ],
    },
    {
        id: "builder",
        label: "Builder Commands",
        color: "#eab308",
        unitType: "builder",
        commands: [
            { command: "reclaim",     label: "Reclaim",      category: "builder", description: "Reclaim metal or energy from... well... anything." },
            { command: "repair",      label: "Repair",       category: "builder", description: "Repair damaged units or unfinished constructions." },
            { command: "restore",     label: "Restore",      category: "builder", description: "Order builders to restore terraformed terrain back to the original map height." },
            { command: "resurrect",   label: "Resurrect",    category: "builder", description: "Rez-bots: revive fallen units or buildings." },
            { command: "capture",     label: "Capture",      category: "builder", description: "Capture an enemy unit and convert it to your team." },
            { command: "loadunits",   label: "Load Units",   category: "builder", description: "Load one or more units into a transport." },
            { command: "unloadunits", label: "Unload Units", category: "builder", description: "Unload transport cargo." },
        ],
    },
    {
        id: "unitstate",
        label: "Unit State",
        color: "#f97316",
        unitType: "all",
        commands: [
            { command: "onoff 0",             label: "Turn Off",          category: "unitstate", description: "Turn a unit or building off." },
            { command: "onoff 1",             label: "Turn On",           category: "unitstate", description: "Turn a unit or building on." },
            { command: "trajectory_toggle 0", label: "Trajectory Off",    category: "unitstate", description: "Set projectile trajectory to flat/direct-fire mode." },
            { command: "trajectory_toggle 1", label: "Trajectory Hold",   category: "unitstate", description: "Set projectile trajectory to the default (auto) mode." },
            { command: "trajectory_toggle 2", label: "Trajectory On",     category: "unitstate", description: "Set projectile trajectory to high-arc mode for firing over obstacles." },
            { command: "firestate 0",         label: "Hold Fire",         category: "unitstate", description: "Units will not fire unless explicitly ordered to attack." },
            { command: "firestate 1",         label: "Return Fire",       category: "unitstate", description: "Units will only fire back if they are attacked." },
            { command: "firestate 2",         label: "Fire At Will",      category: "unitstate", description: "Units automatically attack any enemy that comes within range." },
            { command: "movestate 0",         label: "Hold Position",     category: "unitstate", description: "Units will not move from their current location." },
            { command: "movestate 1",         label: "Maneuver",          category: "unitstate", description: "Units may reposition slightly to improve their firing angles." },
            { command: "movestate 2",         label: "Roam",              category: "unitstate", description: "Units move freely, wandering and chasing enemies." },
            { command: "priority 0",          label: "Builder Priority: Low",  category: "unitstate", description: "Set selected builders to low priority — they will yield to high-priority builders." },
            { command: "priority 1",          label: "Builder Priority: High", category: "unitstate", description: "Set selected builders to high priority — they build faster relative to low-priority builders." },
            { command: "idlemode 0",          label: "Aircraft: Fly When Idle",  category: "unitstate", description: "Aircraft will continue flying when they have no orders." },
            { command: "idlemode 1",          label: "Aircraft: Land When Idle", category: "unitstate", description: "Aircraft will land automatically when they have no orders." },
        ],
    },
    {
        id: "selection",
        label: "Selection",
        color: "#a855f7",
        unitType: "all",
        commands: [
            { command: "select AllMap++_ClearSelection_SelectNum_0+",                label: "Clear Selection",          category: "selection", description: "Deselect all currently selected units." },
            { command: "select AllMap++_ClearSelection_SelectAll+",                  label: "Select All",               category: "selection", description: "Select every unit on the map." },
            { command: "select Visible+_InPrevSel+_ClearSelection_SelectAll+",      label: "Select Prev (Visible)",    category: "selection", description: "Selects all units on screen, matching your current selection." },
            { command: "select PrevSelection++_ClearSelection_SelectPart_50+",      label: "Select Half of Prev",      category: "selection", description: "Select 50% of the current selection." },
            { command: "select AllMap+_InPrevSel+_ClearSelection_SelectAll+",       label: "Select Prev (All Map)",    category: "selection", description: "Selects all units on the map, matching your current selection." },
            { command: "select AllMap+_Transport_Idle+_ClearSelection_SelectAll+",  label: "Select Idle Transports",   category: "selection", description: "Select all idle transport units anywhere on the map." },
            { command: "select AllMap+_Builder_Idle+_ClearSelection_SelectOne+",    label: "Select Idle Builder",      category: "selection", description: "Select next idle builder / construction unit." },
            { command: "select Visible+_Waiting+_ClearSelection_SelectAll+",        label: "Select Waiting Units",     category: "selection", description: "Select all units currently in a wait state on screen." },
            { command: "selectcomm focus",   label: "Select Cmdr (Focus)",   category: "selection", description: "Select your Commander and move the camera to it." },
            { command: "selectcomm append",  label: "Select Cmdr (Append)",  category: "selection", description: "Add your Commander to the current selection without clearing it." },
            { command: "selectbox_same",     label: "Selectbox Same",        category: "selection", description: "While drag-selecting, restrict to the same unit type as the one under the cursor." },
            { command: "selectbox_idle",     label: "Selectbox Idle",        category: "selection", description: "While drag-selecting, restrict to idle units only." },
            { command: "selectbox_append",   label: "Selectbox Append",      category: "selection", description: "While drag-selecting, add matched units to the existing selection instead of replacing it." },
            { command: "selectbox_any",      label: "Selectbox Any",         category: "selection", description: "While drag-selecting, include all unit types (the default behavior)." },
            { command: "selectbox_deselect", label: "Selectbox Deselect",    category: "selection", description: "While drag-selecting, remove matched units from the current selection." },
            { command: "selectbox_mobile",   label: "Selectbox Mobile",      category: "selection", description: "While drag-selecting, restrict to mobile units only." },
            { command: "selectloop",         label: "Select Loop",           category: "selection", description: "Cycle through individual units of the same type from the current selection, selecting one at a time." },
            { command: "selectloop_invert",  label: "Select Loop Invert",    category: "selection", description: "Cycle backwards through units of the same type." },
            { command: "selectloop_add",     label: "Select Loop Add",       category: "selection", description: "Add the next unit of the same type to the selection while cycling." },
        ],
    },
    {
        id: "groups",
        label: "Groups",
        color: "#22c55e",
        unitType: "all",
        commands: [
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group focus ${i}`,          label: `Focus Group ${i}`,    category: "groups", description: `Move the camera to group ${i} and select it.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group select ${i}`,         label: `Select Group ${i}`,   category: "groups", description: `Select group ${i} without moving the camera.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group set ${i}`,            label: `Set Group ${i}`,      category: "groups", description: `Add all selected units to group ${i}.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group selectadd ${i}`,      label: `Add to Group ${i}`,   category: "groups", description: `Add group ${i}'s units to the current selection.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group add ${i}`,            label: `Group Add ${i}`,      category: "groups", description: `Add selected units to group ${i} without removing existing members.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `group selecttoggle ${i}`,   label: `Toggle Group ${i}`,   category: "groups", description: `Toggle selection of group ${i}: add if not selected, remove if already selected.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `add_to_autogroup ${i}`,     label: `Add Autogroup ${i}`,  category: "groups", description: `Set unit-type as auto-group ${i}. Newly built units will be auto-assigned.` })),
            ...Array.from({ length: 10 }, (_, i) => ({ command: `load_autogroup_preset ${i}`,label: `Load Autogroup ${i}`, category: "groups", description: `Load and select autogroup preset ${i}.` })),
            { command: "group unset",            label: "Unset Group",      category: "groups", description: "Remove selected units from their assigned control group." },
            { command: "remove_from_autogroup",  label: "Remove Autogroup", category: "groups", description: "Remove selected unit-type from its autogroup(s)." },
        ],
    },
    {
        id: "camera",
        label: "Camera",
        color: "#38bdf8",
        unitType: "all",
        commands: [
            { command: "move",         label: "Move",              category: "camera", description: "Hold and drag to pan the camera." },
            { command: "moveforward",  label: "Camera Forward",    category: "camera", description: "Scroll the camera forward (toward the top of the map)." },
            { command: "moveback",     label: "Camera Back",       category: "camera", description: "Scroll the camera backward (toward the bottom of the map)." },
            { command: "moveleft",     label: "Camera Left",       category: "camera", description: "Scroll the camera to the left." },
            { command: "moveright",    label: "Camera Right",      category: "camera", description: "Scroll the camera to the right." },
            { command: "moveup",       label: "Zoom Out",          category: "camera", description: "Zoom the camera out." },
            { command: "movedown",     label: "Zoom In",           category: "camera", description: "Zoom the camera in." },
            { command: "movefast",     label: "Camera Fast Move",  category: "camera", description: "Hold to move the camera at increased speed." },
            { command: "movereset",    label: "Camera Reset",      category: "camera", description: "Reset the camera to its default position and zoom level." },
            { command: "moverotate",   label: "Camera Rotate",     category: "camera", description: "Hold to rotate the camera view horizontally." },
            { command: "movetilt",     label: "Camera Tilt",       category: "camera", description: "Hold to tilt the camera angle (pitch up or down)." },
            { command: "cameraflip",   label: "Camera Flip",       category: "camera", description: "Flips camera North-South." },
            { command: "viewta",       label: "TA Camera",         category: "camera", description: "Switch to fixed top-down camera mode." },
            { command: "viewspring",   label: "Spring Camera",     category: "camera", description: "Switch to (rotatable) top-down camera mode." },
            { command: "toggleoverview", label: "Toggle Overview", category: "camera", description: "Switch between 3D cam and map overview." },
            ...Array.from({ length: 4 }, (_, i) => ({ command: `set_camera_anchor ${i + 1}`,   label: `Set Anchor ${i + 1}`,   category: "camera", description: `Save the current camera position to anchor slot ${i + 1}.` })),
            ...Array.from({ length: 4 }, (_, i) => ({ command: `focus_camera_anchor ${i + 1}`, label: `Focus Anchor ${i + 1}`, category: "camera", description: `Jump the camera to saved anchor position ${i + 1}.` })),
            { command: "LastMsgPos",   label: "Last Message Pos",      category: "camera", description: "Go to the last sent ping or notification." },
            { command: "track",        label: "Track Unit",            category: "camera", description: "Lock the camera to follow the selected unit(s)." },
            { command: "trackmode",    label: "Track Mode",            category: "camera", description: "Cycle between camera tracking modes (affects how groups of units are tracked)." },
        ],
    },
    {
        id: "construction",
        label: "Construction",
        color: "#fb923c",
        unitType: "builder",
        commands: [
            { command: "buildfacing inc",              label: "Build Facing +",      category: "construction", description: "Rotate the buildings you build in 90 degree turns (clockwise)." },
            { command: "buildfacing dec",              label: "Build Facing −",      category: "construction", description: "Rotate the buildings you build in 90 degree turns (counter-clockwise)." },
            { command: "buildspacing inc",             label: "Build Spacing +",     category: "construction", description: "Increase the gap between structures when drag-building a line or grid." },
            { command: "buildspacing dec",             label: "Build Spacing −",     category: "construction", description: "Decrease the gap between structures when drag-building a line or grid." },
            { command: "buildsplit",                   label: "Build Split",          category: "construction", description: "Split a build queue across multiple constructors." },
            { command: "commandinsert prepend_between",label: "Command Insert",       category: "construction", description: "Add a command or build order in front of the existing queue." },
            { command: "blueprint_place",              label: "Blueprint Place",      category: "construction", description: "Place a saved blueprint onto the map at the cursor position." },
            { command: "blueprint_create",             label: "Blueprint Create",     category: "construction", description: "Save the current build queue layout as a reusable blueprint." },
            { command: "blueprint_delete",             label: "Blueprint Delete",     category: "construction", description: "Delete the currently selected blueprint." },
            { command: "blueprint_prev",               label: "Blueprint Prev",       category: "construction", description: "Switch to the previous saved blueprint." },
            { command: "blueprint_next",               label: "Blueprint Next",       category: "construction", description: "Switch to the next saved blueprint." },
            ...Array.from({ length: 4 }, (_, i) => ({ command: `gridmenu_category ${i + 1}`, label: `Grid Category ${i + 1}`, category: "construction", description: `Switch the build grid to category tab ${i + 1}.` })),
            ...Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => ({ command: `gridmenu_key ${row + 1} ${col + 1}`, label: `Grid Key ${row + 1}-${col + 1}`, category: "construction", description: `Activate the build grid button at row ${row + 1}, column ${col + 1}.` }))
            ).flat(),
            { command: "gridmenu_next_page",     label: "Grid Next Page",     category: "construction", description: "Go to the next page of the build grid menu." },
            { command: "gridmenu_cycle_builder", label: "Grid Cycle Builder", category: "construction", description: "Cycle through multiple factories." },
        ],
    },
    {
        id: "factory",
        label: "Factory",
        color: "#f59e0b",
        unitType: "factory",
        commands: [
            { command: "stopproduction",   label: "Stop Production",    category: "factory", description: "Stop the current build order in a factory." },
            { command: "repeat 0",         label: "Repeat Off",         category: "factory", description: "Set the factory to stop repeating its build queue." },
            { command: "repeat 1",         label: "Repeat On",          category: "factory", description: "Set the factory to repeat its build queue continuously." },
            { command: "factoryguard 0",   label: "Factory Guard Off",  category: "factory", description: "Disable factory guard: newly built units will not automatically assist the factory." },
            { command: "factoryguard 1",   label: "Factory Guard On",   category: "factory", description: "Enable factory guard: newly built units will automatically assist (guard) the factory." },
            { command: "factoryqueuemode", label: "Factory Queue Mode", category: "factory", description: "Toggle between repeat and one-shot factory queue mode." },
        ],
    },
    {
        id: "ui",
        label: "UI",
        color: "#e2e8f0",
        unitType: "all",
        commands: [
            { command: "HideInterface",            label: "Hide Interface",          category: "ui", description: "Toggle the UI and on-top unit icons.", comment: "Intentionally unbound in Grid Keys — toggling the UI off is rarely useful mid-game" },
            { command: "togglelos",                label: "Toggle LOS",              category: "ui", description: "Cycle through LOS visualization modes: normal, line-of-sight overlay, radar overlay." },
            { command: "ShowPathTraversability",   label: "Show Path Traversability", category: "ui", description: "Select a unit and press the shortcut to show pathing. Purple color = not traversable." },
            { command: "ShowMetalMap",             label: "Show Metal Map",          category: "ui", description: "Highlight metal spots on the map." },
            { command: "ShowElevation",            label: "Show Elevation",          category: "ui", description: "Toggle a color-coded elevation/height map overlay." },
            { command: "customgameinfo",           label: "Custom Game Info",        category: "ui", description: "Open the custom game info panel showing game mode details and rules." },
            { command: "options",                  label: "Options",                 category: "ui", description: "Open the options menu." },
            { command: "screenshot png",           label: "Screenshot (PNG)",        category: "ui", description: "Make a screenshot. Found in install dir/data/screenshots/." },
            { command: "teamstatus_close",         label: "Team Status Close",       category: "ui", description: "Close the team status panel." },
            { command: "customgameinfo_close",     label: "Game Info Close",         category: "ui", description: "Close the custom game info panel." },
            { command: "buildmenu_pregame_deselect", label: "Build Menu Deselect",   category: "ui", description: "Deselect the current item in the pre-game build menu." },
            { command: "drawlabel",                label: "Draw Label",              category: "ui", description: "Add a ping to the map for your allies." },
            { command: "drawinmap",                label: "Draw In Map",             category: "ui", description: "Draw on the map for strategic planning." },
            { command: "fullscreen",               label: "Fullscreen",              category: "ui", description: "Toggle fullscreen mode." },
            { command: "pause",                    label: "Pause",                   category: "ui", description: "Pause the game, or type /pause in game chat." },
            { command: "attack_range_inc",         label: "Attack Range Display +",  category: "ui", description: "Cycle to the next attack range display configuration for the unit type under the cursor." },
            { command: "attack_range_dec",         label: "Attack Range Display −",  category: "ui", description: "Cycle to the previous attack range display configuration for the unit type under the cursor." },
            { command: "cursor_range_toggle",      label: "Cursor Range Toggle",     category: "ui", description: "Toggle display of the attack range of the unit currently under the mouse cursor." },
            { command: "MuteSound",                label: "Mute Sound",              category: "ui", description: "Mute / enable sounds." },
            { command: "snd_volume_increase",      label: "Volume +",                category: "ui", description: "Increase the master volume." },
            { command: "snd_volume_decrease",      label: "Volume −",                category: "ui", description: "Decrease the master volume." },
            { command: "increasespeed",            label: "Increase Speed",          category: "ui", description: "Increase game speed. Only available to the host or in singleplayer." },
            { command: "decreasespeed",            label: "Decrease Speed",          category: "ui", description: "Decrease game speed. Only available to the host or in singleplayer." },
            ...Array.from({ length: 9 }, (_, i) => ({ command: `specteam ${i}`, label: `Spectate Team ${i}`, category: "ui", description: `While spectating, switch the view to follow team ${i}.` })),
        ],
    },
    {
        id: "chat",
        label: "Chat",
        color: "#f472b6",
        unitType: "all",
        commands: [
            { command: "chat",            label: "Open Chat",      category: "chat", description: "Open chat. Use Shift+Enter to switch between player and spectator chat." },
            { command: "chatswitchally", label: "Chat → Ally",    category: "chat", description: "Switch chat target to allies only." },
            { command: "chatswitchspec", label: "Chat → Spec",    category: "chat", description: "Switch chat target to spectators only." },
            { command: "quitmessage",    label: "Quit Message",   category: "chat", description: "Send a predefined resignation message and leave the game.",  userRequirement: "deleted" },
            { command: "quitmenu",       label: "Quit Menu",      category: "chat", description: "Open the resign / quit confirmation menu.",                    userRequirement: "devmode" },
            { command: "quitforce",      label: "Force Quit",     category: "chat", description: "Immediately exit the game without a confirmation prompt.",     userRequirement: "devmode" },
            { command: "reloadforce",    label: "Force Reload",   category: "chat", description: "Force-reload and restart the current game session.",           userRequirement: "devmode" },
            { command: "pastetext",      label: "Paste Text",     category: "chat", description: "Paste clipboard text into the active chat input box.",         comment: "Typically handled at OS level" },
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
    edit_prev_word: "Edit: Prev Word",
    edit_next_word: "Edit: Next Word",
    pastetext:      "Paste Text",
    sharedialog:    "Share Dialog",
    viewfps:        "FPS Camera",
    viewta:         "TA Camera",
    viewspring:     "Spring Camera",
    viewrot:        "Rotating Camera",
    onoff:          "Toggle On/Off",
};

export function getCommandLabel(command: string): string {
    return COMMAND_MAP.get(command)?.label ?? COMMAND_LABEL_OVERRIDES[command] ?? parseSelectLabel(command) ?? formatRawCommand(command) ?? command;
}

/** Generate a short human-readable label for unrecognised `select ...` commands. */
function parseSelectLabel(command: string): string | null {
    if (!command.startsWith("select ")) return null;
    const filter = command.slice(7);

    const isCycle = /_SelectOne\b|_SelectClosestToCursor/.test(filter);
    const verb = isCycle ? "Cycle" : "Select";

    // Source scope
    let source = "";
    if (/^AllMap/.test(filter))              source = " (All)";
    else if (/^Visible/.test(filter))        source = " (Vis)";
    else if (/^FromMouse_\d+/.test(filter))  source = " (Near)";
    else if (/^PrevSelection/.test(filter))  source = " (Prev)";

    // Numeric / string filters — extract values for display
    const relHealthMatch = filter.match(/_(?:Not_)?RelativeHealth_(\d+)/);
    const notRelHealth   = filter.includes("_Not_RelativeHealth_");
    const absHealthMatch = filter.match(/_AbsoluteHealth_(\d+)/);
    const rangeMatch     = filter.match(/_WeaponRange_(\d+)/);
    const notRangeMatch  = filter.match(/_Not_WeaponRange_(\d+)/);
    const nameMatch      = filter.match(/_NameContain_(\w+)/);
    const idCount        = (filter.match(/_IdMatches_/g) ?? []).length;

    // Unit-type tokens in priority order — first match wins
    const TOKEN_LABELS: [RegExp, string][] = [
        [/_ManualFireUnit/,      "Manual Fire"],
        [/_Builder_Not_Building/,"Idle Builder"],
        [/_Builder_Idle/,        "Idle Builder"],
        [/_Builder/,             "Builder"],
        [/_Transport_Idle/,      "Idle Transport"],
        [/_Transport/,           "Transport"],
        [/_Waiting/,             "Waiting"],
        [/_Commander/,           "Commander"],
        [/_Aircraft_Weapons/,    "Fighter/Bomber"],
        [/_Aircraft/,            "Aircraft"],
        [/_SelectPart_50/,       "Half of Prev"],
        [/_InPrevSel/,           "Prev Sel"],
        [/_InHotkeyGroup/,       "Hotkey Group"],
        [/_InGroup_\d+/,         "Group"],
    ];

    for (const [re, lbl] of TOKEN_LABELS) {
        if (re.test(filter)) return `${verb}: ${lbl}${source}`;
    }

    // Numeric / string fallback labels
    if (relHealthMatch) {
        return `${verb}: HP ${notRelHealth ? "<" : ">"}${relHealthMatch[1]}%${source}`;
    }
    if (absHealthMatch) {
        return `${verb}: HP >${absHealthMatch[1]}${source}`;
    }
    if (rangeMatch && notRangeMatch) {
        return `${verb}: Range ${rangeMatch[1]}–${notRangeMatch[1]}${source}`;
    }
    if (rangeMatch) {
        return `${verb}: Range >${rangeMatch[1]}${source}`;
    }
    if (nameMatch) {
        return `${verb}: "${nameMatch[1]}"${source}`;
    }
    if (idCount === 1) return `${verb}: Unit Type${source}`;
    if (idCount > 1)  return `${verb}: ${idCount} Types${source}`;

    return `${verb}: Custom${source}`;
}

/** Generate a short human-readable label for any unrecognised command string. */
function formatRawCommand(command: string): string | null {
    // chain force/once step1 | step2 | …
    const chainMatch = command.match(/^chain\s+(?:force|once)\s+([\s\S]+)$/);
    if (chainMatch) {
        const steps = chainMatch[1].split("|").map((s) => s.trim()).filter(Boolean);
        const firstLabel = getCommandLabel(steps[0]);
        return steps.length > 1 ? `Chain: ${firstLabel} +${steps.length - 1}` : `Chain: ${firstLabel}`;
    }

    // group add/set/select/focus/unset [N]
    const groupMatch = command.match(/^group\s+(\w+)(?:\s+(\d+))?/);
    if (groupMatch) {
        const [, action, num] = groupMatch;
        const ACTION_LABELS: Record<string, string> = {
            add: "Add to", set: "Set", select: "Select", focus: "Focus", unset: "Clear",
        };
        const lbl = ACTION_LABELS[action] ?? toTitleWords(action);
        return num !== undefined ? `${lbl} Group ${num}` : `Group: ${lbl}`;
    }

    // toggle <command>
    if (command.startsWith("toggle ")) {
        return `Toggle: ${getCommandLabel(command.slice(7))}`;
    }

    // firestate 0/1/2
    if (command === "firestate 0") return "Fire: Hold";
    if (command === "firestate 1") return "Fire: Return";
    if (command === "firestate 2") return "Fire: Free";

    // movestate 0/1/2
    if (command === "movestate 0") return "Move: Hold";
    if (command === "movestate 1") return "Move: Maneuver";
    if (command === "movestate 2") return "Move: Roam";

    // trajectory_toggle 0/1/2
    if (command === "trajectory_toggle 0") return "Traj: Low";
    if (command === "trajectory_toggle 1") return "Traj: High";
    if (command === "trajectory_toggle 2") return "Traj: Toggle";

    // priority 0/1
    if (command === "priority 0") return "Priority: Low";
    if (command === "priority 1") return "Priority: High";

    // idlemode 0/1
    if (command === "idlemode 0") return "Aircraft: Fly";
    if (command === "idlemode 1") return "Aircraft: Land";

    // squadwait / timewait / deathwait
    const squadMatch = command.match(/^squadwait\s+(\d+)/);
    if (squadMatch) return `Squad Wait (${squadMatch[1]})`;
    const timeMatch = command.match(/^timewait\s+(\d+)/);
    if (timeMatch) return `Time Wait (${timeMatch[1]}s)`;
    if (command === "deathwait") return "Death Wait";

    // showpathtype <type>
    const pathMatch = command.match(/^showpathtype\s+(\S+)/);
    if (pathMatch) return `Path: ${pathMatch[1]}`;

    // set_camera_anchor / focus_camera_anchor
    const setAnchorMatch = command.match(/^set_camera_anchor\s+(\d+)/);
    if (setAnchorMatch) return `Set Anchor ${setAnchorMatch[1]}`;
    const focusAnchorMatch = command.match(/^focus_camera_anchor\s+(\d+)/);
    if (focusAnchorMatch) return `Go Anchor ${focusAnchorMatch[1]}`;

    // selectcycle
    if (command === "selectcycle restore") return "Cycle Sel ↩";
    if (command.startsWith("selectcycle"))  return "Cycle Sel";

    // closest_group_*
    if (command.startsWith("closest_group_select append")) return "Find Group (Add)";
    if (command.startsWith("closest_group_select"))        return "Find Group";
    if (command.startsWith("closest_group_transfer"))      return "Transfer Group";

    // commandinsert
    if (command.startsWith("commandinsert")) return "Insert Cmd";

    // selectbox_<filter> / selectbox <filter>
    if (command.startsWith("selectbox_")) return toTitleWords(command.slice(10).split(" ")[0]);
    if (command.startsWith("selectbox ")) return "Select Box";

    // Underscore-separated unknown commands — better than raw code
    const baseWord = command.split(" ")[0];
    if (baseWord.includes("_")) return toTitleWords(baseWord);

    return null;
}

function toTitleWords(s: string): string {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
