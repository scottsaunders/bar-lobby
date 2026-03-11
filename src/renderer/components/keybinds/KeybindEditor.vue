<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="keybind-editor" :class="{ loading: !keybindsStore.isLoaded }">
        <div v-if="!keybindsStore.isLoaded" class="loading-state">
            <span class="body-1">Loading keybinds...</span>
        </div>

        <template v-else>
            <!-- Toolbar -->
            <div class="editor-toolbar">
                <div class="mode-tabs">
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'visual' }" @click="keybindsStore.viewMode = 'visual'">
                        <Icon icon="mdi:keyboard" /> Visual
                    </button>
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'list' }" @click="keybindsStore.viewMode = 'list'">
                        <Icon icon="mdi:format-list-bulleted" /> List
                    </button>
                </div>

                <div class="divider" />

                <!-- Unit type filter -->
                <div class="unit-type-tabs" title="Filter commands by unit type">
                    <button
                        v-for="ut in UNIT_TYPES"
                        :key="ut.id"
                        class="unit-tab"
                        :class="{ active: keybindsStore.activeUnitType === ut.id }"
                        @click="keybindsStore.activeUnitType = ut.id"
                    >
                        <Icon :icon="ut.icon" />
                        {{ ut.label }}
                    </button>
                </div>

                <div class="toolbar-spacer" />

                <div v-if="keybindsStore.conflicts.length > 0" class="conflict-warning" title="Multiple commands share the same key+modifier">
                    <Icon icon="mdi:alert" />
                    {{ keybindsStore.conflicts.length }} conflict{{ keybindsStore.conflicts.length !== 1 ? "s" : "" }}
                </div>

                <span v-if="keybindsStore.isDirty" class="dirty-dot">Unsaved changes</span>

                <div class="toolbar-actions">
                    <button class="btn-action" title="Reload from disk" @click="onReload">
                        <Icon icon="mdi:refresh" /> Reload
                    </button>
                    <button class="btn-action" title="Edit raw text" @click="showRaw = !showRaw">
                        <Icon icon="mdi:code-braces" /> Raw
                    </button>
                    <button class="btn-action btn-revert" :disabled="!keybindsStore.isDirty" @click="onRevert">
                        <Icon icon="mdi:undo" /> Revert
                    </button>
                    <button class="btn-action btn-save" :disabled="!keybindsStore.isDirty || keybindsStore.isSaving" @click="onSave">
                        <Icon icon="mdi:content-save" />
                        {{ keybindsStore.isSaving ? "Saving…" : "Save" }}
                    </button>
                </div>
            </div>

            <!-- Raw editor -->
            <div v-if="showRaw" class="raw-editor-container">
                <div class="raw-header">
                    <span class="body-2-strong">Raw uikeys.txt</span>
                    <div class="toolbar-spacer" />
                    <button class="btn-action" @click="onApplyRaw">Apply</button>
                    <button class="btn-action" @click="showRaw = false">Close</button>
                </div>
                <textarea v-model="rawText" class="raw-textarea" spellcheck="false" />
                <div class="raw-footer caption-2">Advanced bindings (chord sequences) are preserved automatically.</div>
            </div>

            <!-- Visual mode: palette LEFT, keyboard RIGHT -->
            <div v-else-if="keybindsStore.viewMode === 'visual'" class="visual-layout">
                <div class="palette-section">
                    <CommandPalette />
                </div>

                <div class="keyboard-section">
                    <ModifierSelector class="modifier-row" />
                    <div class="keyboard-scroll">
                        <VisualKeyboard @keyClicked="onKeyClicked" />
                    </div>
                    <div v-if="keybindsStore.parsed && keybindsStore.parsed.advancedBindings.length > 0" class="advanced-notice caption-2">
                        <Icon icon="mdi:information-outline" />
                        {{ keybindsStore.parsed.advancedBindings.length }} advanced bindings (chord sequences) preserved but not shown.
                    </div>
                    <!-- Legend -->
                    <div class="legend">
                        <span class="legend-item"><span class="legend-dot" style="background:#fbbf24" />⚠ = key conflict</span>
                        <span class="legend-item"><span class="legend-swatch dimmed" />dimmed = not used by selected unit type</span>
                    </div>
                </div>
            </div>

            <!-- List mode -->
            <div v-else class="list-layout">
                <ListEditor />
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
    import { onMounted, ref, watch } from "vue";
    import { Icon } from "@iconify/vue";
    import { keybindsStore, loadKeybinds, saveKeybinds, revertKeybinds } from "@renderer/store/keybinds.store";
    import { serializeUikeys } from "@renderer/utils/uikeys/serializer";
    import { parseUikeys } from "@renderer/utils/uikeys/parser";
    import ModifierSelector from "./ModifierSelector.vue";
    import VisualKeyboard from "./VisualKeyboard.vue";
    import CommandPalette from "./CommandPalette.vue";
    import ListEditor from "./ListEditor.vue";

    const UNIT_TYPES = [
        { id: "all" as const,     label: "All Units",  icon: "mdi:account-group" },
        { id: "combat" as const,  label: "Combat",     icon: "mdi:sword" },
        { id: "builder" as const, label: "Builder",    icon: "mdi:wrench" },
    ];

    const showRaw = ref(false);
    const rawText = ref("");

    onMounted(async () => { await loadKeybinds(); });

    watch(showRaw, (open) => {
        if (open && keybindsStore.parsed) rawText.value = serializeUikeys(keybindsStore.parsed);
    });

    async function onSave() { await saveKeybinds(); }
    function onRevert() { revertKeybinds(); }
    async function onReload() { await loadKeybinds(); }

    function onApplyRaw() {
        keybindsStore.parsed = parseUikeys(rawText.value);
        keybindsStore.isDirty = true;
        showRaw.value = false;
    }

    function onKeyClicked(_key: string) {}
</script>

<style lang="scss" scoped>
    .keybind-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        overflow: hidden;
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        color: rgba(255, 255, 255, 0.4);
    }

    /* ── Toolbar ── */
    .editor-toolbar {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        padding: 8px 14px;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        gap: 8px;
        flex-wrap: wrap;
    }

    .toolbar-spacer { flex: 1; }

    .divider {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.12);
        flex-shrink: 0;
    }

    .mode-tabs, .unit-type-tabs {
        display: flex;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 5px;
        overflow: hidden;
    }

    .mode-tab, .unit-tab {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: none;
        color: rgba(255, 255, 255, 0.5);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;

        &:hover { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9); }
        &.active { background: rgba(37, 99, 235, 0.4); color: #fff; }
        + .mode-tab, + .unit-tab { border-left: 1px solid rgba(255, 255, 255, 0.12); }
    }

    .toolbar-actions { display: flex; gap: 5px; }

    .btn-action {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.7);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.12s ease;

        &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.15); color: #fff; }
        &:disabled { opacity: 0.35; cursor: not-allowed; }

        &.btn-save {
            background: rgba(34, 197, 94, 0.3);
            border-color: rgba(34, 197, 94, 0.5);
            color: rgba(150, 255, 180, 0.9);
            &:hover:not(:disabled) { background: rgba(34, 197, 94, 0.5); color: #fff; }
        }
        &.btn-revert:hover:not(:disabled) {
            background: rgba(220, 50, 50, 0.3);
            border-color: rgba(220, 50, 50, 0.5);
            color: #fff;
        }
    }

    .conflict-warning {
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgba(251, 191, 36, 0.9);
        font-size: 12px;
    }

    .dirty-dot {
        color: rgba(251, 191, 36, 0.8);
        font-size: 11px;
        &::before { content: "●"; margin-right: 4px; }
    }

    /* ── Visual layout ── */
    .visual-layout {
        display: flex;
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .palette-section {
        width: 260px;
        flex-shrink: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }

    .keyboard-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
        padding: 14px 16px;
        gap: 10px;
    }

    .modifier-row { flex-shrink: 0; }

    .keyboard-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        flex-shrink: 0;
        &::-webkit-scrollbar { height: 5px; }
        &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
    }

    .advanced-notice {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        background: rgba(255, 200, 50, 0.08);
        border: 1px solid rgba(255, 200, 50, 0.2);
        border-radius: 4px;
        color: rgba(255, 200, 50, 0.7);
        font-size: 11px;
        flex-shrink: 0;
    }

    .legend {
        display: flex;
        gap: 16px;
        flex-shrink: 0;
        flex-wrap: wrap;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: rgba(255,255,255,0.35);
    }

    .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .legend-swatch {
        width: 24px;
        height: 14px;
        border-radius: 3px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        opacity: 0.3;
        flex-shrink: 0;
    }

    /* ── List layout ── */
    .list-layout {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    /* ── Raw editor ── */
    .raw-editor-container {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 12px 16px;
        gap: 8px;
    }

    .raw-header {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 8px;
    }

    .raw-textarea {
        flex: 1;
        min-height: 0;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: rgba(200, 220, 255, 0.9);
        font-family: "Courier New", monospace;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px 12px;
        resize: none;
        outline: none;
        &:focus { border-color: rgba(37, 99, 235, 0.6); }
    }

    .raw-footer { color: rgba(255,255,255,0.3); flex-shrink: 0; }
</style>
