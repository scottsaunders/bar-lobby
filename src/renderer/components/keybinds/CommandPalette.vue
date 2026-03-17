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
                v-tooltip.right="showUnboundOnly ? 'Show all commands' : 'Show only unbound commands'"
                @click="showUnboundOnly = !showUnboundOnly"
            >
                <span class="unbound-count" :class="{ 'has-unbound': unboundCount > 0 }">{{ unboundCount }}</span>
                Unbound
            </button>
            <div class="palette-filter-row">
                <select v-model="selectedCategory" class="category-select">
                    <option :value="null">All categories</option>
                    <option v-for="cat in COMMAND_CATEGORIES" :key="cat.id" :value="cat.id">
                        {{ cat.label }}
                    </option>
                </select>
                <button
                    class="dev-toggle"
                    :class="{ 'is-active': showDevmode }"
                    v-tooltip.right="'Show dev/debug commands (quit, reload, debug overlays)'"
                    @click="showDevmode = !showDevmode"
                >
                    Dev
                </button>
            </div>
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
                        'is-assigned': cmd.assigned,
                        'is-selected': keybindsStore.selectedCommand === cmd.command,
                    }"
                    draggable="true"
                    v-tooltip.right="{ value: cmd.comment ? `${cmd.description ?? cmd.command}<br><br><em style='opacity:0.65'>${cmd.comment}</em>` : (cmd.description ?? cmd.command), escape: false, disabled: isDragging }"
                    @click="onCommandClick(cmd.command)"
                    @dragstart="onDragStart($event, cmd.command)"
                    @dragend="onDragEnd"
                >
                    <span class="cmd-label" :style="{ color: cat.color }">{{ cmd.label }}</span>
                    <div class="cmd-bindings">
                        <span v-for="b in getBindingsForCommand(cmd.command)" :key="b.id" class="binding-tag">
                            {{ formatBinding(b) }}
                        </span>
                        <span v-if="cmd.userRequirement === 'widget'" class="widget-tag" v-tooltip.top="'Requires a Lua widget to be active'">Widget</span>
                        <span v-if="cmd.userRequirement === 'hardcoded'" class="hardcoded-tag" v-tooltip.top="'This binding is hardcoded and cannot be changed'">Locked</span>
                        <button
                            v-if="cmd.advLabel"
                            class="adv-tag"
                            v-tooltip.top="cmd.advLabel"
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
    const showDevmode = ref(false);
    const selectedCategory = ref<string | null>(null);
    const isDropTarget = ref(false);
    const isDragging = ref(false);

    const unboundCount = computed(() => {
        const unitType = keybindsStore.activeUnitType;
        let count = 0;
        for (const cat of COMMAND_CATEGORIES) {
            if (unitType !== "all" && cat.unitType !== "all" && cat.unitType !== unitType) continue;
            for (const cmd of cat.commands) {
                if (cmd.userRequirement === "deleted") continue;
                if (showDevmode.value ? cmd.userRequirement !== "devmode" : cmd.userRequirement === "devmode") continue;
                if (!isAssigned(cmd.command)) count++;
            }
        }
        return count;
    });

    const filteredCategories = computed(() => {
        const q = search.value.toLowerCase();
        const unitType = keybindsStore.activeUnitType;
        const catFilter = selectedCategory.value;

        return COMMAND_CATEGORIES
            .filter((cat) => catFilter === null || cat.id === catFilter)
            .map((cat) => ({
                ...cat,
                commands: cat.commands
                    .filter((c) => {
                        // Always hide deleted commands
                        if (c.userRequirement === "deleted") return false;
                        // Dev filter: when active show only devmode commands; when inactive hide them
                        if (showDevmode.value ? c.userRequirement !== "devmode" : c.userRequirement === "devmode") return false;
                        // Unit type filter
                        if (unitType !== "all" && cat.unitType !== "all" && cat.unitType !== unitType) return false;
                        // Unbound filter — skip commands that have any binding (regular or advanced)
                        if (showUnboundOnly.value && isAssigned(c.command)) return false;
                        // Search filter
                        if (!q) return true;
                        return c.label.toLowerCase().includes(q) || c.command.toLowerCase().includes(q);
                    })
                    .map((c) => ({
                        ...c,
                        assigned: isAssigned(c.command),
                        advLabel: computeAdvancedLabel(c.command),
                    })),
            }))
            .filter((cat) => cat.commands.length > 0);
    });

    function isAssigned(command: string): boolean {
        return getBindingsForCommand(command).length > 0 || getAdvancedBindingsForCommand(command).length > 0;
    }

    function computeAdvancedLabel(command: string): string | null {
        const adv = getAdvancedBindingsForCommand(command);
        if (!adv.length) return null;
        return formatAdvancedBindingSteps(adv[0].raw).join(" › ");
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
        isDragging.value = true;
    }

    function onDragEnd() {
        isDragging.value = false;
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

    .palette-filter-row {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .category-select {
        flex: 1;
        min-width: 0;
        padding: 4px 22px 4px 7px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.7);
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        outline: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 7px center;

        option { background: #1a1a2e; color: #fff; }

        &:focus { border-color: rgba(37, 99, 235, 0.6); }
    }

    .dev-toggle {
        flex-shrink: 0;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.45);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.1s ease;
        white-space: nowrap;

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

    .widget-tag {
        background: rgba(20, 184, 166, 0.12);
        border: 1px solid rgba(20, 184, 166, 0.35);
        border-radius: 3px;
        padding: 2px 5px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(20, 184, 166, 0.85);
        white-space: nowrap;
        letter-spacing: 0.02em;
    }

    .hardcoded-tag {
        background: rgba(148, 163, 184, 0.1);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 3px;
        padding: 2px 5px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(148, 163, 184, 0.7);
        white-space: nowrap;
        letter-spacing: 0.02em;
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
