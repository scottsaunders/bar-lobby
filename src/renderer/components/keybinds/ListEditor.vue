<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="list-editor">
        <div class="list-toolbar flex-row gap-sm">
            <input v-model="search" class="search-input" placeholder="Search commands..." />
            <select v-model="filterCategory" class="category-filter">
                <option value="">All Categories</option>
                <option v-for="cat in COMMAND_CATEGORIES" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
            </select>
        </div>

        <div class="list-scroll">
            <table class="bindings-table">
                <thead>
                    <tr>
                        <th class="col-category caption-1-strong">Category</th>
                        <th class="col-command caption-1-strong">Command</th>
                        <th class="col-bindings caption-1-strong">Bindings</th>
                        <th class="col-actions caption-1-strong">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="cat in filteredCategories" :key="cat.id">
                        <tr
                            v-for="cmd in cat.commands"
                            :key="cmd.command"
                            class="binding-row"
                            :class="{
                                'is-rebinding': rebindingCommand === cmd.command,
                                'is-selected': keybindsStore.selectedCommand === cmd.command,
                            }"
                            @click.self="selectCommand(cmd.command)"
                        >
                            <td class="col-category">
                                <span class="caption-2" style="color: rgba(255,255,255,0.4)">{{ cat.label }}</span>
                            </td>
                            <td class="col-command" v-tooltip.right="getCommandDescription(cmd.command) ?? cmd.command">
                                <span class="body-2">{{ cmd.label }}</span>
                                <span class="cmd-raw caption-2">{{ cmd.command }}</span>
                            </td>
                            <td class="col-bindings">
                                <div class="bindings-list">
                                    <span
                                        v-for="b in getBindingsForCommand(cmd.command)"
                                        :key="b.id"
                                        class="binding-tag"
                                    >
                                        {{ formatBinding(b) }}
                                        <button class="remove-btn" v-tooltip.top="'Remove binding'" @click="removeBinding(b.id)">×</button>
                                    </span>
                                    <span v-if="getBindingsForCommand(cmd.command).length === 0" class="unbound-label caption-2">
                                        Unbound
                                    </span>
                                </div>
                            </td>
                            <td class="col-actions">
                                <div v-if="rebindingCommand === cmd.command" class="rebind-capture" @keydown.prevent="onCaptureKey">
                                    <span class="capture-hint caption-1">Press key combo...</span>
                                    <span v-if="capturedCombo" class="captured-combo body-2-strong">{{ capturedCombo }}</span>
                                    <div class="capture-actions flex-row gap-xs">
                                        <button class="btn-confirm" :disabled="!capturedCombo" @click="confirmRebind(cmd.command)">Assign</button>
                                        <button class="btn-cancel" @click="cancelRebind">Cancel</button>
                                    </div>
                                </div>
                                <button v-else class="btn-rebind" @click="startRebind(cmd.command)">
                                    + Add Binding
                                </button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <div v-if="filteredCategories.length === 0" class="empty-state caption-1">
                No commands match your search
            </div>
        </div>

        <!-- Global keydown capture overlay when rebinding -->
        <div v-if="rebindingCommand" class="capture-overlay" tabindex="0" @keydown.prevent="onCaptureKey" ref="captureOverlayRef" />
    </div>
</template>

<script lang="ts" setup>
    import { computed, nextTick, ref } from "vue";
    import { COMMAND_CATEGORIES, getCommandDescription } from "@renderer/utils/uikeys/commands";
    import { getBindingsForCommand, removeBinding, assignBinding, keybindsStore, selectCommand } from "@renderer/store/keybinds.store";
    import { engineKeyToLabel, formatBindingLabel } from "@renderer/utils/uikeys/key-formatter";
    import { eventToEngineKey } from "@renderer/utils/uikeys/event-to-key";
    import type { KeyBinding } from "@renderer/utils/uikeys/types";

    const search = ref("");
    const filterCategory = ref("");
    const rebindingCommand = ref<string | null>(null);
    const capturedCombo = ref<string | null>(null);
    const capturedKey = ref<string | null>(null);
    const capturedModifiers = ref<string[]>([]);
    const captureOverlayRef = ref<HTMLElement | null>(null);

    const filteredCategories = computed(() => {
        const q = search.value.toLowerCase();
        const catFilter = filterCategory.value;
        return COMMAND_CATEGORIES.map((cat) => ({
            ...cat,
            commands: cat.commands.filter((c) => {
                if (catFilter && cat.id !== catFilter) return false;
                if (!q) return true;
                return c.label.toLowerCase().includes(q) || c.command.toLowerCase().includes(q);
            }),
        })).filter((cat) => cat.commands.length > 0);
    });

    function formatBinding(b: KeyBinding): string {
        return formatBindingLabel(b.modifiers, b.key);
    }

    async function startRebind(command: string) {
        rebindingCommand.value = command;
        capturedCombo.value = null;
        capturedKey.value = null;
        capturedModifiers.value = [];
        await nextTick();
        captureOverlayRef.value?.focus();
    }

    function cancelRebind() {
        rebindingCommand.value = null;
        capturedCombo.value = null;
        capturedKey.value = null;
        capturedModifiers.value = [];
    }

    function confirmRebind(command: string) {
        if (!capturedKey.value) return;
        assignBinding(capturedKey.value, capturedModifiers.value, command);
        cancelRebind();
    }

    function onCaptureKey(e: KeyboardEvent) {
        const key = eventToEngineKey(e);
        if (!key) return;

        const mods: string[] = [];
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.shiftKey) mods.push("Shift");
        if (e.altKey) mods.push("Alt");

        capturedKey.value = key;
        capturedModifiers.value = mods;
        capturedCombo.value = formatBindingLabel(mods, key);
    }
</script>

<style lang="scss" scoped>
    .list-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
    }

    .list-toolbar {
        display: flex;
        flex-shrink: 0;
        padding: 12px 12px 8px;
        gap: 8px;
    }

    .search-input,
    .category-filter {
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: #fff;
        font-family: inherit;
        font-size: 13px;
        outline: none;

        &::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        &:focus {
            border-color: rgba(37, 99, 235, 0.6);
        }

        option {
            background: #1a1a2e;
            color: #fff;
        }
    }

    .search-input {
        flex: 1;
    }

    .list-scroll {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 0 12px 12px;

        &::-webkit-scrollbar {
            width: 5px;
        }
        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }
    }

    .bindings-table {
        width: 100%;
        border-collapse: collapse;

        th {
            text-align: left;
            padding: 6px 10px;
            color: rgba(255, 255, 255, 0.4);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            position: sticky;
            top: 0;
            background: rgba(10, 10, 20, 0.9);
            backdrop-filter: blur(4px);
        }
    }

    .binding-row {
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        transition: background 0.1s;
        cursor: pointer;

        &:hover {
            background: rgba(255, 255, 255, 0.04);
        }

        &.is-rebinding {
            background: rgba(37, 99, 235, 0.1);
        }

        &.is-selected {
            background: rgba(251, 191, 36, 0.08);
            outline: 1px solid rgba(251, 191, 36, 0.25);
        }

        td {
            padding: 7px 10px;
            vertical-align: middle;
        }
    }

    .col-category {
        width: 110px;
    }

    .col-command {
        width: 200px;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .cmd-raw {
        color: rgba(255, 255, 255, 0.25);
        font-family: monospace;
        font-size: 9px;
        display: block;
    }

    .bindings-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
    }

    .binding-tag {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        background: rgba(37, 99, 235, 0.25);
        border: 1px solid rgba(37, 99, 235, 0.4);
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 11px;
        font-family: monospace;
        color: rgba(150, 200, 255, 0.9);
    }

    .remove-btn {
        background: none;
        border: none;
        color: rgba(255, 80, 80, 0.7);
        cursor: pointer;
        padding: 0 1px;
        font-size: 13px;
        line-height: 1;

        &:hover {
            color: rgb(255, 80, 80);
        }
    }

    .unbound-label {
        color: rgba(255, 255, 255, 0.2);
        font-style: italic;
    }

    .btn-rebind {
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.6);
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.1s;

        &:hover {
            background: rgba(37, 99, 235, 0.3);
            border-color: rgba(37, 99, 235, 0.5);
            color: #fff;
        }
    }

    .rebind-capture {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .capture-hint {
        color: rgba(255, 220, 100, 0.8);
        font-size: 11px;
        animation: pulse 1.2s ease-in-out infinite;
    }

    .captured-combo {
        font-family: monospace;
        font-size: 13px;
        color: rgb(100, 200, 255);
        padding: 2px 6px;
        background: rgba(37, 99, 235, 0.2);
        border-radius: 3px;
        border: 1px solid rgba(37, 99, 235, 0.4);
    }

    .capture-actions {
        display: flex;
        gap: 4px;
    }

    .btn-confirm {
        padding: 3px 10px;
        background: rgba(34, 197, 94, 0.4);
        border: 1px solid rgba(34, 197, 94, 0.6);
        border-radius: 4px;
        color: #fff;
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        &:not(:disabled):hover {
            background: rgba(34, 197, 94, 0.6);
        }
    }

    .btn-cancel {
        padding: 3px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.6);
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;

        &:hover {
            background: rgba(220, 50, 50, 0.3);
            border-color: rgba(220, 50, 50, 0.5);
            color: #fff;
        }
    }

    .capture-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
    }

    .empty-state {
        text-align: center;
        padding: 32px;
        color: rgba(255, 255, 255, 0.3);
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
</style>
