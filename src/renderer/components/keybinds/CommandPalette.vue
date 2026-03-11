<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="command-palette">
        <div class="palette-header">
            <span class="body-2-strong">Commands</span>
            <span class="caption-1" style="color: rgba(255,255,255,0.4)">Drag to assign</span>
        </div>

        <input
            v-model="search"
            class="search-input"
            placeholder="Search commands..."
        />

        <div class="palette-scroll">
            <template v-for="cat in filteredCategories" :key="cat.id">
                <div class="category-header" :style="{ '--cat-color': cat.color }">
                    {{ cat.label }}
                </div>
                <div
                    v-for="cmd in cat.commands"
                    :key="cmd.command"
                    class="command-item"
                    :class="{ 'is-assigned': isAssigned(cmd.command) }"
                    draggable="true"
                    :title="cmd.command"
                    @dragstart="onDragStart($event, cmd.command)"
                >
                    <span class="cmd-label" :style="{ color: cat.color }">{{ cmd.label }}</span>
                    <div class="cmd-bindings">
                        <span v-for="b in getBindingsForCommand(cmd.command)" :key="b.id" class="binding-tag">
                            {{ formatBinding(b) }}
                        </span>
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
    import { getBindingsForCommand, keybindsStore } from "@renderer/store/keybinds.store";
    import { formatBindingLabel } from "@renderer/utils/uikeys/key-formatter";
    import type { KeyBinding } from "@renderer/utils/uikeys/types";

    const search = ref("");

    const filteredCategories = computed(() => {
        const q = search.value.toLowerCase();
        const unitType = keybindsStore.activeUnitType;

        return COMMAND_CATEGORIES.map((cat) => ({
            ...cat,
            commands: cat.commands.filter((c) => {
                // Unit type filter
                if (unitType !== "all" && cat.unitType !== "all" && cat.unitType !== unitType) return false;
                // Search filter
                if (!q) return true;
                return c.label.toLowerCase().includes(q) || c.command.toLowerCase().includes(q);
            }),
        })).filter((cat) => cat.commands.length > 0);
    });

    function isAssigned(command: string): boolean {
        return getBindingsForCommand(command).length > 0;
    }

    function onDragStart(e: DragEvent, command: string) {
        e.dataTransfer?.setData("application/x-command", command);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
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
    }

    .palette-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
    }

    .search-input {
        margin: 8px;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: #fff;
        font-family: inherit;
        font-size: 13px;
        outline: none;
        flex-shrink: 0;

        &::placeholder { color: rgba(255, 255, 255, 0.3); }
        &:focus { border-color: rgba(37, 99, 235, 0.6); }
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

    .empty-state {
        text-align: center;
        padding: 24px;
        color: rgba(255, 255, 255, 0.3);
    }
</style>
