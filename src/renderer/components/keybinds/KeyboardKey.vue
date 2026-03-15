<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div
        class="keyboard-key"
        :class="{
            'is-modifier': keyDef.isModifier,
            'is-active-modifier': isActiveModifier,
            'has-binding': !!primaryBinding,
            'has-any-binding': !!anyBinding && !primaryBinding,
            'is-drag-over': isDragOver,
            'is-dimmed': isDimmed,
        }"
        :style="{ width: `${keyDef.width * KEY_W}px`, height: `${KEY_H}px` }"
        :draggable="!!primaryBinding"
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
                <!-- Conflict warning icon -->
                <span v-if="hasConflict" class="conflict-icon" title="Multiple commands share this key+modifier — check your bindings">⚠</span>
            </div>

            <!-- Binding chip -->
            <div
                v-if="primaryBinding"
                class="binding-chip"
                :style="{ '--chip-color': chipColor }"
                :title="getCommandDescription(primaryBinding.command) ?? getCommandLabel(primaryBinding.command)"
            >
                {{ getCommandLabel(primaryBinding.command) }}
            </div>
            <div
                v-else-if="anyBinding"
                class="binding-chip any-chip"
                :title="getCommandDescription(anyBinding.command) ?? (getCommandLabel(anyBinding.command) + ' (Any+)')"
            >
                {{ getCommandLabel(anyBinding.command) }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref } from "vue";
    import type { KeyDef } from "@renderer/utils/uikeys/types";
    import { getCommandLabel, getCommandDescription, getCommandColor, getCommandUnitType } from "@renderer/utils/uikeys/commands";
    import { keybindsStore, getExactBinding, modifierStateToArray, assignBinding, removeBinding } from "@renderer/store/keybinds.store";

    const KEY_W = 56;
    const KEY_H = 76;

    const props = defineProps<{
        keyDef: KeyDef;
    }>();

    const emit = defineEmits<{
        keyClicked: [key: string];
    }>();

    const isDragOver = ref(false);

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

    const primaryBinding = computed(() => getExactBinding(props.keyDef.engineKey, activeModifiers.value));

    const anyBinding = computed(() => {
        if (!keybindsStore.parsed) return undefined;
        return keybindsStore.parsed.bindings.find((b) => b.key === props.keyDef.engineKey && b.modifiers.includes("Any"));
    });

    const hasConflict = computed(() =>
        keybindsStore.conflicts.some(
            (c) =>
                c.key === props.keyDef.engineKey &&
                c.modifiers
                    .map((m) => m.toLowerCase())
                    .sort()
                    .join("+") ===
                    activeModifiers.value
                        .map((m) => m.toLowerCase())
                        .sort()
                        .join("+")
        )
    );

    const chipColor = computed(() => {
        const cmd = primaryBinding.value?.command ?? anyBinding.value?.command;
        return cmd ? getCommandColor(cmd) : "#94a3b8";
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
        const sourceBindingId = e.dataTransfer?.getData("application/x-keybind-id");

        if (!command) return;

        if (sourceBindingId) {
            removeBinding(sourceBindingId);
        }

        assignBinding(props.keyDef.engineKey, activeModifiers.value, command);
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
        transition: opacity 0.15s ease;

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
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        padding: 4px 5px;
        position: relative;
        overflow: hidden;
        transition: background 0.12s ease, border-color 0.12s ease;
        box-sizing: border-box;
    }

    .keyboard-key:hover:not(.is-modifier) .key-inner {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
    }

    .keyboard-key.has-binding .key-inner {
        background: rgba(30, 50, 100, 0.35);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .keyboard-key.has-any-binding .key-inner {
        background: rgba(80, 80, 80, 0.2);
        border-color: rgba(180, 180, 180, 0.2);
    }

    .keyboard-key.is-drag-over .key-inner {
        background: rgba(34, 197, 94, 0.25);
        border-color: rgba(34, 197, 94, 0.7);
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }

    .is-modifier .key-inner {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.07);
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
        color: rgba(255, 255, 255, 0.55);
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

    .binding-chip {
        margin-top: 3px;
        font-size: 11px;
        font-weight: 700;
        color: var(--chip-color, #94a3b8);
        white-space: normal;
        word-break: break-word;
        line-height: 1.25;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        flex: 1;
        min-height: 0;
    }

    .any-chip {
        opacity: 0.75;
    }
</style>
