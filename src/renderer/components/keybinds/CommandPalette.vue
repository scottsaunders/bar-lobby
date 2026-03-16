<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div
        class="command-palette"
        :class="{ 'is-drop-target': isDropTarget }"
        @dragover.prevent="onPaletteDragOver"
        @dragleave="onPaletteDragLeave"
        @drop.prevent="onPaletteDrop"
    >
        <div class="palette-header">
            <span class="body-2-strong">Commands</span>
            <span v-if="isDropTarget" class="drop-hint caption-1">Drop to unassign</span>
            <span v-else class="caption-1" style="color: rgba(255,255,255,0.4)">Drag to assign</span>
        </div>

        <div class="palette-controls">
            <input
                v-model="search"
                class="search-input"
                placeholder="Search commands..."
            />
            <button
                class="unbound-toggle"
                :class="{ 'is-active': showUnboundOnly }"
                :title="showUnboundOnly ? 'Show all commands' : 'Show only unbound commands'"
                @click="showUnboundOnly = !showUnboundOnly"
            >
                <span class="unbound-count" :class="{ 'has-unbound': unboundCount > 0 }">{{ unboundCount }}</span>
                Unbound
            </button>
        </div>

        <div class="palette-scroll">
            <template v-for="cat in filteredCategories" :key="cat.id">
                <div class="category-header" :style="{ '--cat-color': cat.color }">
                    {{ cat.label }}
                </div>
                <div
                    v-for="cmd in cat.commands"
                    :key="cmd.command"
                    class="command-item"
                    :class="{
                        'is-assigned': isAssigned(cmd.command),
                        'is-selected': keybindsStore.selectedCommand === cmd.command,
                    }"
                    draggable="true"
                    :title="cmd.description ?? cmd.command"
                    @click="onCommandClick(cmd.command)"
                    @dragstart="onDragStart($event, cmd.command)"
                >
                    <span class="cmd-label" :style="{ color: cat.color }">{{ cmd.label }}</span>
                    <div class="cmd-bindings">
                        <span v-for="b in getBindingsForCommand(cmd.command)" :key="b.id" class="binding-tag">
                            {{ formatBinding(b) }}
                        </span>
                        <button
                            v-if="advancedLabel(cmd.command)"
                            class="adv-tag"
                            :title="advancedLabel(cmd.command) ?? ''"
                            @click.stop="openAdvanced"
                        >Adv.</button>
                    </div>
                </div>
            </template>

            <div v-if="filteredCategories.length === 0" class="empty-state caption-1">
                No commands found
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref } from "vue";
    import { COMMAND_CATEGORIES } from "@renderer/utils/uikeys/commands";
    import { getBindingsForCommand, getAdvancedBindingsForCommand, removeBinding, keybindsStore, selectCommand } from "@renderer/store/keybinds.store";
    import { formatAdvancedBindingSteps } from "@renderer/utils/uikeys/key-formatter";
    import { formatBindingLabel } from "@renderer/utils/uikeys/key-formatter";
    import type { KeyBinding } from "@renderer/utils/uikeys/types";

    const search = ref("");
    const showUnboundOnly = ref(false);
    const isDropTarget = ref(false);

    const unboundCount = computed(() => {
        const unitType = keybindsStore.activeUnitType;
        let count = 0;
        for (const cat of COMMAND_CATEGORIES) {
            if (unitType !== "all" && cat.unitType !== "all" && cat.unitType !== unitType) continue;
            for (const cmd of cat.commands) {
                if (!isAssigned(cmd.command)) count++;
            }
        }
        return count;
    });

    const filteredCategories = computed(() => {
        const q = search.value.toLowerCase();
        const unitType = keybindsStore.activeUnitType;

        return COMMAND_CATEGORIES.map((cat) => ({
            ...cat,
            commands: cat.commands.filter((c) => {
                // Unit type filter
                if (unitType !== "all" && cat.unitType !== "all" && cat.unitType !== unitType) return false;
                // Unbound filter — skip commands that have any binding (regular or advanced)
                if (showUnboundOnly.value && isAssigned(c.command)) return false;
                // Search filter
                if (!q) return true;
                return c.label.toLowerCase().includes(q) || c.command.toLowerCase().includes(q);
            }),
        })).filter((cat) => cat.commands.length > 0);
    });

    function isAssigned(command: string): boolean {
        return getBindingsForCommand(command).length > 0 || getAdvancedBindingsForCommand(command).length > 0;
    }

    function advancedLabel(command: string): string | null {
        const adv = getAdvancedBindingsForCommand(command);
        if (!adv.length) return null;
        // Show the first sequence as a preview
        const steps = formatAdvancedBindingSteps(adv[0].raw);
        return steps.join(" › ");
    }

    function openAdvanced() {
        keybindsStore.viewMode = "visual";
        keybindsStore.showAdvanced = true;
    }

    function onCommandClick(command: string) {
        selectCommand(command);
    }

    function onDragStart(e: DragEvent, command: string) {
        e.dataTransfer?.setData("application/x-command", command);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
    }

    function isBindingDrag(e: DragEvent): boolean {
        return !!e.dataTransfer?.types.includes("application/x-keybind-id");
    }

    function onPaletteDragOver(e: DragEvent) {
        if (!isBindingDrag(e)) return;
        isDropTarget.value = true;
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    }

    function onPaletteDragLeave(e: DragEvent) {
        // Only clear if leaving the palette entirely (not just crossing child elements)
        if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
            isDropTarget.value = false;
        }
    }

    function onPaletteDrop(e: DragEvent) {
        isDropTarget.value = false;
        const id = e.dataTransfer?.getData("application/x-keybind-id");
        if (id) removeBinding(id);
    }

    function formatBinding(b: KeyBinding): string {
        return formatBindingLabel(b.modifiers, b.key);
    }
</script>

<style lang="scss" scoped>
    .command-palette {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        transition: background 0.15s ease, border-color 0.15s ease;

        &.is-drop-target {
            background: rgba(220, 50, 50, 0.08);
            outline: 2px dashed rgba(220, 80, 80, 0.5);
            outline-offset: -2px;
        }
    }

    .palette-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
    }

    .drop-hint {
        color: rgba(220, 80, 80, 0.9);
        font-weight: 600;
    }

    .palette-controls {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 8px 4px;
        flex-shrink: 0;
    }

    .search-input {
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: #fff;
        font-family: inherit;
        font-size: 13px;
        outline: none;
        width: 100%;
        box-sizing: border-box;

        &::placeholder { color: rgba(255, 255, 255, 0.3); }
        &:focus { border-color: rgba(37, 99, 235, 0.6); }
    }

    .unbound-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.5);
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.1s ease;
        width: 100%;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.8);
        }

        &.is-active {
            background: rgba(251, 191, 36, 0.12);
            border-color: rgba(251, 191, 36, 0.4);
            color: rgba(251, 191, 36, 0.9);
        }
    }

    .unbound-count {
        font-size: 11px;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 1px 6px;
        min-width: 20px;
        text-align: center;

        .unbound-toggle.is-active & {
            background: rgba(251, 191, 36, 0.2);
        }

        &.has-unbound {
            color: rgba(251, 191, 36, 0.9);
            background: rgba(251, 191, 36, 0.15);
        }
    }

    .palette-scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 0 6px 8px;

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-track { background: transparent; }
        &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
    }

    .category-header {
        padding: 8px 6px 4px;
        color: var(--cat-color, rgba(255,255,255,0.4));
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 10px;
        font-weight: 700;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 2px;
        opacity: 0.8;
    }

    .command-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 8px;
        border-radius: 4px;
        cursor: grab;
        transition: background 0.1s ease;
        gap: 6px;

        &:hover { background: rgba(255, 255, 255, 0.08); }
        &:active { cursor: grabbing; }

        &.is-selected {
            background: rgba(251, 191, 36, 0.12);
            outline: 1px solid rgba(251, 191, 36, 0.35);
        }
    }

    .cmd-label {
        font-size: 14px;
        flex-shrink: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.75;

        .command-item.is-assigned & { opacity: 1; }
    }

    .cmd-bindings {
        display: flex;
        gap: 3px;
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
        max-width: 100px;
    }

    .binding-tag {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 3px;
        padding: 2px 5px;
        font-size: 11px;
        color: rgba(200, 220, 255, 0.9);
        white-space: nowrap;
        font-family: monospace;
    }

    .adv-tag {
        background: rgba(167, 139, 250, 0.12);
        border: 1px solid rgba(167, 139, 250, 0.35);
        border-radius: 3px;
        padding: 2px 5px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(167, 139, 250, 0.85);
        white-space: nowrap;
        cursor: pointer;
        font-family: inherit;
        letter-spacing: 0.02em;
        transition: all 0.1s ease;

        &:hover {
            background: rgba(167, 139, 250, 0.25);
            border-color: rgba(167, 139, 250, 0.6);
            color: rgba(200, 180, 255, 1);
        }
    }

    .empty-state {
        text-align: center;
        padding: 24px;
        color: rgba(255, 255, 255, 0.3);
    }
</style>
