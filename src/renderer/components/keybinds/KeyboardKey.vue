<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div
        class="keyboard-key"
        :class="{
            'is-modifier': keyDef.isModifier,
            'is-active-modifier': isActiveModifier,
            'has-binding': !!primaryBinding && !staticMouseLabel && !heldCommand,
            'has-any-binding': (!!anyBinding && !primaryBinding) || !!staticMouseLabel,
            'is-drag-over': isDragOver,
            'is-dimmed': isDimmed && !isHighlighted,
            'is-highlighted': isHighlighted || isSelectedKey,
            'is-pressed': isPressed,
        }"
        :style="props.fill
            ? { flex: '1', height: `${props.customHeight ?? KEY_H}px` }
            : { width: `${keyDef.width * KEY_W}px`, height: `${props.customHeight ?? KEY_H}px` }"
        :draggable="!!primaryBinding"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
        @click="onClick"
    >
        <div class="key-inner">
            <!-- Key label top-left -->
            <div class="key-top">
                <span class="key-label">{{ keyDef.label }}</span>
                <!-- Shared key indicators -->
                <span v-if="hasConflict" class="conflict-icon" v-tooltip.top="'Two commands in the same context share this key — one may unexpectedly override the other'">⚠</span>
                <span v-else-if="isShared" class="shared-icon" v-tooltip.top="'This key is shared across different unit types — likely intentional'">·</span>
            </div>

            <!-- Binding chip -->
            <div
                v-if="selectedCommandAction"
                :class="['binding-chip', heldCommand ? 'static-mouse-chip' : 'selected-cmd-chip']"
                v-tooltip.top="selectedCommandAction.isDrag ? `Drag: ${selectedCommandAction.label}` : selectedCommandAction.label"
            >
                <span v-fit-text class="chip-label">{{ selectedCommandAction.label }}</span>
                <span v-if="selectedCommandAction.isDrag" class="drag-indicator">drag</span>
            </div>
            <div
                v-else-if="staticMouseLabel"
                class="binding-chip static-mouse-chip"
            >
                <span v-fit-text class="chip-label">{{ staticMouseLabel }}</span>
            </div>
            <div
                v-else-if="primaryBinding"
                class="binding-chip"
                :style="{ '--chip-color': chipColor }"
                v-tooltip.top="getCommandDescription(primaryBinding.command) ?? getCommandLabel(primaryBinding.command)"
            >
                <CommandIcon v-if="primaryIcon" :src="primaryIcon" :size="20" :playing="isHovered" />
                <span v-fit-text class="chip-label">{{ getCommandLabel(primaryBinding.command) }}</span>
            </div>
            <div
                v-else-if="anyBinding"
                class="binding-chip any-chip"
                v-tooltip.top="getCommandDescription(anyBinding.command) ?? (getCommandLabel(anyBinding.command) + ' (Any+)')"
            >
                <CommandIcon v-if="anyIcon" :src="anyIcon" :size="20" :playing="isHovered" />
                <span v-fit-text class="chip-label">{{ getCommandLabel(anyBinding.command) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref } from "vue";
    import { vFitText } from "@renderer/directives/fitText";
    import type { KeyDef } from "@renderer/utils/uikeys/types";
    import { getCommandLabel, getCommandDescription, getCommandColor, getCommandUnitType } from "@renderer/utils/uikeys/commands";
    import { getCommandIcon, COMMAND_ICONS_ENABLED } from "@renderer/utils/uikeys/command-icons";
    import { getCommandMouseActions, getStaticMouseLabel } from "@renderer/utils/uikeys/command-mouse-actions";
    import type { CommandMouseActions } from "@renderer/utils/uikeys/command-mouse-actions";
    import CommandIcon from "./CommandIcon.vue";
    import { keybindsStore, getExactBinding, getBindingsForCommand, modifierStateToArray, performDrop, anyBindingsByKey, sharedKeysByKeyMod } from "@renderer/store/keybinds.store";

    const KEY_W = 56;
    const KEY_H = 74;

    const props = defineProps<{
        keyDef: KeyDef;
        fill?: boolean;        // grow to fill container width instead of using fixed width
        customHeight?: number; // override default key height in px
    }>();

    const emit = defineEmits<{
        keyClicked: [key: string];
    }>();

    const isDragOver = ref(false);
    const isHovered = ref(false);

    const activeModifiers = computed(() => modifierStateToArray(keybindsStore.activeModifiers));

    // Maps engineKey → which modifier flag it corresponds to
    const MODIFIER_KEY_MAP: Record<string, keyof typeof keybindsStore.activeModifiers> = {
        shift: "shift",
        ctrl: "ctrl",
        alt: "alt",
    };

    const isActiveModifier = computed(() => {
        if (!props.keyDef.isModifier) return false;
        const flag = MODIFIER_KEY_MAP[props.keyDef.engineKey];
        return flag ? !!keybindsStore.activeModifiers[flag] : false;
    });

    const isAnyLayer = computed(() => keybindsStore.activeModifiers.any);

    // In Any layer, primary binding IS the Any+ binding so it's fully editable.
    const primaryBinding = computed(() => {
        if (isAnyLayer.value) {
            return anyBindingsByKey.value.get(props.keyDef.engineKey) ?? null;
        }
        return getExactBinding(props.keyDef.engineKey, activeModifiers.value) ?? null;
    });

    // Only show the "secondary" any-chip when NOT in Any layer.
    const anyBinding = computed(() => {
        if (isAnyLayer.value) return undefined;
        return anyBindingsByKey.value.get(props.keyDef.engineKey);
    });

    // Mouse key → slot name in CommandMouseActions
    const MOUSE_ACTION_SLOT: Partial<Record<string, keyof CommandMouseActions>> = {
        mouse1:    "mouse1",
        mouse2:    "mouse2",
        mouse3:    "mouse3",
        WheelUp:   "wheelUp",
        WheelDown: "wheelDown",
    };

    // When the user physically holds a key whose command has mouse actions,
    // show those actions on the mouse keys as a live preview.
    const heldCommand = computed((): string | null => {
        const mods = activeModifiers.value;
        for (const pressedKey of keybindsStore.pressedKeys) {
            if (["shift", "ctrl", "alt"].includes(pressedKey)) continue;
            const binding = getExactBinding(pressedKey, mods) ?? anyBindingsByKey.value.get(pressedKey);
            if (binding && getCommandMouseActions(binding.command)) return binding.command;
        }
        return null;
    });

    // Show mouse actions when a command is held (live) or selected in the palette.
    // Held key takes priority over palette selection.
    const selectedCommandAction = computed(() => {
        const cmd = heldCommand.value ?? keybindsStore.selectedCommand;
        if (!cmd) return null;
        const slot = MOUSE_ACTION_SLOT[props.keyDef.engineKey];
        if (!slot) return null;
        return getCommandMouseActions(cmd)?.[slot] ?? null;
    });

    // Always-visible engine-level camera / scroll labels for WheelUp, WheelDown,
    // and MMB. Hidden when a command is held or selected (those take priority).
    const staticMouseLabel = computed((): string | null => {
        if (keybindsStore.selectedCommand || heldCommand.value) return null;
        return getStaticMouseLabel(activeModifiers.value, props.keyDef.engineKey);
    });

    const sharedKeyEntry = computed(() => {
        const modStr = activeModifiers.value.map((m) => m.toLowerCase()).sort().join("+");
        return sharedKeysByKeyMod.value.get(`${modStr}|${props.keyDef.engineKey}`);
    });
    const hasConflict = computed(() => sharedKeyEntry.value?.severity === "conflict");
    const isShared = computed(() => sharedKeyEntry.value?.severity === "shared");

    const chipColor = computed(() => {
        const cmd = primaryBinding.value?.command ?? anyBinding.value?.command;
        return cmd ? getCommandColor(cmd) : "#94a3b8";
    });

    const primaryIcon = computed(() => COMMAND_ICONS_ENABLED && primaryBinding.value ? (getCommandIcon(primaryBinding.value.command) ?? null) : null);
    const anyIcon = computed(() => COMMAND_ICONS_ENABLED && anyBinding.value ? (getCommandIcon(anyBinding.value.command) ?? null) : null);

    // Light up when physically pressed
    const isPressed = computed(() => keybindsStore.pressedKeys.has(props.keyDef.engineKey));

    // Highlight key if its bound command is the selected command
    const isSelectedKey = computed(() => keybindsStore.selectedKey === props.keyDef.engineKey);

    const isHighlighted = computed(() => {
        if (!keybindsStore.selectedCommand) return false;
        return getBindingsForCommand(keybindsStore.selectedCommand).some((b) => b.key === props.keyDef.engineKey);
    });

    // Dim key if active unit type filter doesn't match the command's unit type
    const isDimmed = computed(() => {
        if (keybindsStore.activeUnitType === "all") return false;
        const cmd = primaryBinding.value?.command;
        if (!cmd) return false;
        const cmdType = getCommandUnitType(cmd);
        return cmdType !== "all" && cmdType !== keybindsStore.activeUnitType;
    });

    function onDragStart(e: DragEvent) {
        if (!primaryBinding.value) return;
        e.dataTransfer?.setData("application/x-keybind-id", primaryBinding.value.id);
        e.dataTransfer?.setData("application/x-keybind-command", primaryBinding.value.command);
        e.dataTransfer?.setData("application/x-source-key", props.keyDef.engineKey);
        e.dataTransfer?.setData("application/x-source-modifiers", JSON.stringify(activeModifiers.value));
    }

    function onDragEnd() {
        isDragOver.value = false;
    }

    function onDragOver(e: DragEvent) {
        if (props.keyDef.isModifier) return;
        if (e.dataTransfer?.types.includes("application/x-keybind-command") || e.dataTransfer?.types.includes("application/x-command")) {
            isDragOver.value = true;
        }
    }

    function onDragLeave() {
        isDragOver.value = false;
    }

    function onDrop(e: DragEvent) {
        isDragOver.value = false;
        if (props.keyDef.isModifier) return;

        const command = e.dataTransfer?.getData("application/x-keybind-command") || e.dataTransfer?.getData("application/x-command");
        const sourceBindingId = e.dataTransfer?.getData("application/x-keybind-id") || null;
        const sourceKey = e.dataTransfer?.getData("application/x-source-key") || undefined;
        const sourceModifiersRaw = e.dataTransfer?.getData("application/x-source-modifiers");
        const sourceModifiers: string[] = sourceModifiersRaw ? JSON.parse(sourceModifiersRaw) : activeModifiers.value;

        if (!command) return;

        // Single undo snapshot covers the full swap
        performDrop(sourceBindingId, props.keyDef.engineKey, activeModifiers.value, command, sourceKey, sourceModifiers);
    }

    function onClick() {
        emit("keyClicked", props.keyDef.engineKey);
    }
</script>

<style lang="scss" scoped>
    .keyboard-key {
        flex-shrink: 0;
        padding: 2px;
        cursor: pointer;
        user-select: none;
        // opacity is GPU-composited — fine to transition even when many keys change at once
        transition: opacity 0.12s ease;

        &.is-modifier {
            cursor: default;
        }

        &.is-dimmed {
            opacity: 0.3;
        }
    }

    .key-inner {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.09);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        padding: 4px 5px;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
        // Only animate box-shadow by default — it's GPU-composited and doesn't cause paint.
        // background/border-color transitions are intentionally omitted here: when the user
        // switches modifier layers, 40-60+ keys change state simultaneously and animating all
        // of them causes visible jank. Those changes happen instantly; hover gets its own rule.
        transition: box-shadow 0.15s ease;
    }

    // Hover background/border animates smoothly — only ever one key at a time.
    .keyboard-key:hover:not(.is-modifier) .key-inner {
        background: rgba(255, 255, 255, 0.16);
        border-color: rgba(255, 255, 255, 0.35);
        transition: background 0.08s ease, border-color 0.08s ease, box-shadow 0.15s ease;
    }

    .keyboard-key.has-binding .key-inner {
        background: rgba(37, 99, 235, 0.28);
        border-color: rgba(100, 150, 255, 0.35);
    }

    .keyboard-key.has-any-binding .key-inner {
        background: rgba(80, 80, 80, 0.3);
        border-color: rgba(180, 180, 180, 0.3);
    }

    .keyboard-key.is-drag-over .key-inner {
        background: rgba(34, 197, 94, 0.25);
        border-color: rgba(34, 197, 94, 0.7);
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }

    .keyboard-key.is-highlighted .key-inner {
        background: rgba(251, 191, 36, 0.35);
        border-color: rgba(251, 191, 36, 0.9);
        box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
        border-width: 2px;
    }

    .keyboard-key.is-pressed .key-inner {
        background: rgba(255, 255, 255, 0.22);
        border-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
        border-width: 2px;
    }

    .keyboard-key.is-pressed .key-label {
        color: #fff;
        font-weight: 700;
    }

    .is-modifier .key-inner {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.12);
    }

    .keyboard-key.is-active-modifier .key-inner {
        background: rgba(37, 99, 235, 0.5);
        border-color: rgba(37, 99, 235, 0.9);
        border-width: 2px;
    }

    .key-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-shrink: 0;
    }

    .key-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 10px;
        line-height: 1.1;
        font-weight: 600;
    }

    .is-modifier .key-label {
        color: rgba(255, 255, 255, 0.3);
    }

    .keyboard-key.is-active-modifier .key-label {
        color: #fff;
        font-weight: 700;
    }

    .keyboard-key.is-active-modifier .binding-chip {
        color: #fff;
        text-shadow: none;
    }

    .conflict-icon {
        font-size: 9px;
        color: rgba(251, 191, 36, 0.9);
        flex-shrink: 0;
        cursor: help;
    }

    .shared-icon {
        font-size: 14px;
        line-height: 1;
        color: rgba(148, 163, 184, 0.5);
        flex-shrink: 0;
        cursor: help;
    }

    .binding-chip {
        margin-top: 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .chip-label {
        font-size: 9px;
        font-weight: 700;
        color: var(--chip-color, #94a3b8);
        white-space: normal;
        word-break: break-word;
        line-height: 1.2;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        text-align: center;
        width: 100%;

        // When no icon sibling, use normal size
        .binding-chip:not(:has(.cmd-icon-wrap)) & {
            font-size: 11px;
        }
    }

    // Selected-command chip: shown on mouse keys when a command with a cursor
    // mode is selected in the palette. Amber dashed border to match the
    // "is-selected" highlight color used on the bound keyboard keys.
    .selected-cmd-chip {
        opacity: 0.7;
        outline: 1px dashed rgba(251, 191, 36, 0.45);
        outline-offset: 2px;
        border-radius: 2px;
        --chip-color: rgba(251, 191, 36, 0.8);
    }

    .drag-indicator {
        font-size: 7px;
        font-weight: 700;
        color: rgba(251, 191, 36, 0.6);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        line-height: 1;
    }

    .any-chip {
        opacity: 0.75;
    }

    // Static engine-level mouse labels (camera / scroll behaviors).
    // Styled identically to any-chip (muted gray, non-rebindable appearance).
    .static-mouse-chip {
        opacity: 0.75;

        .chip-label {
            white-space: nowrap;
        }
    }
</style>
