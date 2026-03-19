// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

/**
 * Set to true to re-enable command icons in the keyboard and palette.
 * Replace GIF/SVG assets with static PNGs first for best performance.
 */
export const COMMAND_ICONS_ENABLED = false;

// Cursor GIFs — animated cursors shown during a command
import cursorAttack from "@renderer/assets/images/command-icons/cursor_attack.gif";
import cursorAreaAttack from "@renderer/assets/images/command-icons/cursor_areaattack.gif";
import cursorFight from "@renderer/assets/images/command-icons/cursor_fight.gif";
import cursorPatrol from "@renderer/assets/images/command-icons/cursor_patrol.gif";
import cursorGuard from "@renderer/assets/images/command-icons/cursor_guard.gif";
import cursorWait from "@renderer/assets/images/command-icons/cursor_wait.gif";
import cursorGatherWait from "@renderer/assets/images/command-icons/cursor_gatherwait.gif";
import cursorSelfD from "@renderer/assets/images/command-icons/cursor_selfd.gif";
import cursorCloak from "@renderer/assets/images/command-icons/cursor_cloak.gif";
import cursorSetTarget from "@renderer/assets/images/command-icons/cursor_settarget.gif";
import cursorReclaim from "@renderer/assets/images/command-icons/cursor_reclaim.gif";
import cursorRepair from "@renderer/assets/images/command-icons/cursor_repair.gif";
import cursorResurrect from "@renderer/assets/images/command-icons/cursor_resurrect.gif";
import cursorCapture from "@renderer/assets/images/command-icons/cursor_capture.gif";
import cursorLoadTransport from "@renderer/assets/images/command-icons/cursor_loadtransport.gif";
import cursorUnloadTransport from "@renderer/assets/images/command-icons/cursor_unloadtransport.gif";
import cursorIdleBuilder from "@renderer/assets/images/command-icons/cursor_idlebuilder.gif";

// Icons — static/animated icons for the command palette
import iconStop from "@renderer/assets/images/command-icons/icon_stop.png";
import iconRepeat from "@renderer/assets/images/command-icons/icon_repeat.avif";
import iconCamera from "@renderer/assets/images/command-icons/icon_camera.webp";
import iconSelectGroup from "@renderer/assets/images/command-icons/icon_selectgroup.svg";
import iconSelectComm from "@renderer/assets/images/command-icons/icon_selectcomm.avif";
import iconBuildFacing from "@renderer/assets/images/command-icons/icon_buildfacing.svg";
import iconBuildSpacing from "@renderer/assets/images/command-icons/icon_buildspacing.svg";
import iconBuildSplit from "@renderer/assets/images/command-icons/icon_buildsplit.svg";
import iconCommandInsert from "@renderer/assets/images/command-icons/icon_commandinsert.svg";
import iconCommandQueueNext from "@renderer/assets/images/command-icons/icon_commandqueuenext.svg";
import iconFactoryGuard from "@renderer/assets/images/command-icons/icon_factoryguard.avif";
import iconFactoryCycle from "@renderer/assets/images/command-icons/icon_factorycycle.avif";
import iconGridKeys from "@renderer/assets/images/command-icons/icon_gridkeys.avif";
import priorityHigh from "@renderer/assets/images/command-icons/priority-high.png";
import priorityLow from "@renderer/assets/images/command-icons/priority-low.png";
import unitstats from "@renderer/assets/images/command-icons/unitstats.svg";
import canceltarget from "@renderer/assets/images/command-icons/canceltarget.png";

export const COMMAND_ICONS: Record<string, string> = {
    // Unit commands
    "attack":                  cursorAttack,
    "areaattack":              cursorAreaAttack,
    "manualfire":              cursorSetTarget,
    "manuallaunch":            cursorSetTarget,
    "fight":                   cursorFight,
    "patrol":                  cursorPatrol,
    "guard":                   cursorGuard,
    "stop":                    iconStop,
    "stopproduction":          iconStop,
    "wait":                    cursorWait,
    "wait queued":             cursorWait,
    "selfd":                   cursorSelfD,
    "selfd queued":            cursorSelfD,
    "cloak":                   cursorCloak,
    "wantcloak":               cursorCloak,
    "gatherwait":              cursorGatherWait,
    "settarget":               cursorSetTarget,
    "settargetnoground":       cursorSetTarget,
    "canceltarget":            canceltarget,
    "unit_stats":              unitstats,
    "command_skip_current":    iconCommandQueueNext,
    "command_cancel_last":     iconCommandQueueNext,

    // Builder commands
    "reclaim":                 cursorReclaim,
    "repair":                  cursorRepair,
    "resurrect":               cursorResurrect,
    "capture":                 cursorCapture,
    "loadunits":               cursorLoadTransport,
    "unloadunits":             cursorUnloadTransport,

    // Unit state
    "repeat 0":                iconRepeat,
    "repeat 1":                iconRepeat,
    "priority 1":              priorityHigh,
    "priority 0":              priorityLow,

    // Selection
    "selectcomm focus":        iconSelectComm,
    "selectcomm append":       iconSelectComm,
    "select AllMap+_Builder_Idle+_ClearSelection_SelectOne+": cursorIdleBuilder,
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`group focus ${i}`,        iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`group select ${i}`,        iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`group set ${i}`,           iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`group add ${i}`,           iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`group selectadd ${i}`,     iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`group selecttoggle ${i}`,  iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`add_to_autogroup ${i}`,    iconSelectGroup])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`load_autogroup_preset ${i}`, iconSelectGroup])),
    "group unset":             iconSelectGroup,
    "remove_from_autogroup":   iconSelectGroup,

    // Camera
    "moveforward":             iconCamera,
    "moveback":                iconCamera,
    "moveleft":                iconCamera,
    "moveright":               iconCamera,
    "moveup":                  iconCamera,
    "movedown":                iconCamera,

    // Building
    "buildfacing inc":         iconBuildFacing,
    "buildfacing dec":         iconBuildFacing,
    "buildspacing inc":        iconBuildSpacing,
    "buildspacing dec":        iconBuildSpacing,
    "buildsplit":              iconBuildSplit,
    "commandinsert prepend_between": iconCommandInsert,
    "factoryguard 1":          iconFactoryGuard,
    "factoryguard 0":          iconFactoryGuard,
    "factoryqueuemode":        iconFactoryCycle,

    // Grid menu
    ...Object.fromEntries(Array.from({ length: 4 }, (_, i) => [`gridmenu_category ${i + 1}`, iconGridKeys])),
    ...Object.fromEntries(
        Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => [`gridmenu_key ${row + 1} ${col + 1}`, iconGridKeys])
        ).flat()
    ),
};

export function getCommandIcon(command: string): string | undefined {
    return COMMAND_ICONS[command];
}
