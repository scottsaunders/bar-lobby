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
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'visual' }" @click="keybindsStore.viewMode = 'visual'">Visual</button>
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'list' }" @click="keybindsStore.viewMode = 'list'">List</button>
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
                    >{{ ut.label }}</button>
                </div>

                <div class="toolbar-spacer" />

                <button v-if="trueConflicts.length > 0" class="sharedkey-btn is-conflict" :class="{ active: showConflicts }" @click="showConflicts = !showConflicts" title="Two or more commands in the same context share this key — one may override the other unexpectedly">
                    <Icon icon="mdi:alert" />
                    {{ trueConflicts.length }} conflict{{ trueConflicts.length !== 1 ? "s" : "" }}
                    <Icon :icon="showConflicts ? 'mdi:chevron-up' : 'mdi:chevron-down'" style="font-size: 14px; margin-left: 2px" />
                </button>
                <button v-else-if="sharedKeys.length > 0" class="sharedkey-btn is-shared" :class="{ active: showConflicts }" @click="showConflicts = !showConflicts" title="Some keys are shared across unit type contexts — this is usually intentional">
                    <Icon icon="mdi:information-outline" />
                    {{ sharedKeys.length }} shared key{{ sharedKeys.length !== 1 ? "s" : "" }}
                    <Icon :icon="showConflicts ? 'mdi:chevron-up' : 'mdi:chevron-down'" style="font-size: 14px; margin-left: 2px" />
                </button>

                <span v-if="keybindsStore.isDirty" class="dirty-dot">Unsaved changes</span>

                <div class="toolbar-actions">
                    <button class="btn-action" title="Reload from disk" @click="onReload">Reload</button>
                    <button class="btn-action" title="Edit raw text" @click="showRaw = !showRaw">Raw</button>
                    <button class="btn-action btn-revert" :disabled="!keybindsStore.isDirty" @click="onRevert">Revert</button>
                    <button class="btn-action btn-save" :disabled="!keybindsStore.isDirty || keybindsStore.isSaving" @click="onSave">
                        {{ keybindsStore.isSaving ? "Saving…" : "Save" }}
                    </button>
                </div>
            </div>

            <!-- Shared keys panel -->
            <div v-if="showConflicts && keybindsStore.sharedKeys.length > 0" class="conflict-panel">
                <div class="conflict-panel-header">
                    <Icon v-if="trueConflicts.length > 0" icon="mdi:alert" style="color: #fbbf24" />
                    <Icon v-else icon="mdi:information-outline" style="color: rgba(148,163,184,0.8)" />
                    <span class="body-2-strong">Shared Keys</span>
                    <span class="caption-2" style="color: rgba(255,255,255,0.4)">
                        <template v-if="trueConflicts.length > 0">Conflicts may cause one command to unexpectedly override another. Shared keys across unit types are usually fine.</template>
                        <template v-else>These keys are shared across different unit type contexts — this is usually intentional.</template>
                    </span>
                    <div class="toolbar-spacer" />
                    <button class="btn-action" @click="showConflicts = false">Close</button>
                </div>
                <div class="conflict-list">
                    <div
                        v-for="entry in keybindsStore.sharedKeys"
                        :key="entry.key + entry.modifiers.join('+')"
                        class="conflict-group"
                        :class="{ 'is-shared': entry.severity === 'shared' }"
                    >
                        <div class="conflict-key-label caption-1-strong">
                            <span class="key-badge">{{ entry.modifiers.length > 0 ? entry.modifiers.join('+') + '+' : '' }}{{ engineKeyToLabel(entry.key) }}</span>
                            <span v-if="entry.severity === 'shared'" class="shared-label caption-2">shared</span>
                        </div>
                        <div class="conflict-bindings">
                            <div v-for="binding in entry.bindings" :key="binding.id" class="conflict-binding-row">
                                <span class="conflict-cmd">{{ getCommandLabel(binding.command) }}</span>
                                <span class="conflict-unit-type caption-2">{{ getCommandUnitType(binding.command) }}</span>
                                <button v-if="entry.severity === 'conflict'" class="btn-action btn-remove-conflict" @click="removeBinding(binding.id)">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Advanced bindings editor -->
            <AdvancedBindingsEditor v-if="showAdvanced" @close="showAdvanced = false" />

            <!-- Raw editor -->
            <div v-else-if="showRaw" class="raw-editor-container">
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
                    <div class="controls-row">
                        <ModifierSelector />
                        <div class="controls-spacer" />
                        <button
                            v-if="keybindsStore.parsed && keybindsStore.parsed.advancedBindings.length > 0"
                            class="btn-advanced-cta"
                            :title="`${keybindsStore.parsed.advancedBindings.length} chord/sequence binding${keybindsStore.parsed.advancedBindings.length !== 1 ? 's' : ''} not shown in the visual editor — they will still be saved`"
                            @click="showAdvanced = true"
                        >
                            Advanced Key Sequences
                        </button>
                    </div>
                    <div class="keyboard-scroll">
                        <VisualKeyboard @keyClicked="onKeyClicked" />
                    </div>
                    <!-- Key inspector -->
                    <KeyInspector v-if="selectedKey" :engineKey="selectedKey" @close="selectedKey = null" />

                    <!-- Legend -->
                    <div v-else class="legend">
                        <span class="legend-item"><span class="legend-dot" style="background:#fbbf24" />⚠ = same-context conflict</span>
                        <span class="legend-item" style="color: rgba(148,163,184,0.5)">· = shared across unit types</span>
                        <span class="legend-item"><span class="legend-swatch dimmed" />dimmed = not used by selected unit type</span>
                        <span class="legend-item" style="color: rgba(255,255,255,0.2)">click any key to inspect</span>
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
    import { computed, onMounted, ref, watch } from "vue";
    import { Icon } from "@iconify/vue";
    import { keybindsStore, loadKeybinds, saveKeybinds, revertKeybinds, removeBinding } from "@renderer/store/keybinds.store";
    import { engineKeyToLabel } from "@renderer/utils/uikeys/key-formatter";
    import { getCommandLabel, getCommandUnitType } from "@renderer/utils/uikeys/commands";
    import { serializeUikeys } from "@renderer/utils/uikeys/serializer";
    import { parseUikeys } from "@renderer/utils/uikeys/parser";
    import ModifierSelector from "./ModifierSelector.vue";
    import VisualKeyboard from "./VisualKeyboard.vue";
    import CommandPalette from "./CommandPalette.vue";
    import ListEditor from "./ListEditor.vue";
    import AdvancedBindingsEditor from "./AdvancedBindingsEditor.vue";
    import KeyInspector from "./KeyInspector.vue";

    const UNIT_TYPES = [
        { id: "all" as const,     label: "All Units" },
        { id: "combat" as const,  label: "Combat" },
        { id: "builder" as const, label: "Builder" },
    ];

    const showRaw = ref(false);
    const showAdvanced = ref(false);
    const showConflicts = ref(false);
    const rawText = ref("");
    const selectedKey = ref<string | null>(null);

    const trueConflicts = computed(() => keybindsStore.sharedKeys.filter((e) => e.severity === "conflict"));
    const sharedKeys = computed(() => keybindsStore.sharedKeys.filter((e) => e.severity === "shared"));

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

    function onKeyClicked(key: string) {
        selectedKey.value = selectedKey.value === key ? null : key;
    }
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
        padding: 5px 10px;
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

    .sharedkey-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        &.is-conflict {
            background: rgba(251, 191, 36, 0.08);
            border: 1px solid rgba(251, 191, 36, 0.25);
            color: rgba(251, 191, 36, 0.9);
            &:hover { background: rgba(251, 191, 36, 0.15); }
            &.active { background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.5); }
        }

        &.is-shared {
            background: rgba(148, 163, 184, 0.06);
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: rgba(148, 163, 184, 0.7);
            &:hover { background: rgba(148, 163, 184, 0.12); color: rgba(148, 163, 184, 0.9); }
            &.active { background: rgba(148, 163, 184, 0.12); border-color: rgba(148, 163, 184, 0.4); }
        }
    }

    /* ── Shared keys panel ── */
    .conflict-panel {
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.15);
        max-height: 220px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .conflict-panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.7);
    }

    .conflict-list {
        overflow-y: auto;
        padding: 8px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        &::-webkit-scrollbar { width: 5px; }
        &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    }

    .conflict-group {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        &.is-shared { opacity: 0.6; }
    }

    .conflict-key-label {
        flex-shrink: 0;
        padding-top: 2px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        align-items: flex-start;
    }

    .key-badge {
        display: inline-block;
        padding: 2px 6px;
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        font-size: 11px;
        font-family: monospace;
        color: rgba(255,255,255,0.8);
        white-space: nowrap;
    }

    .shared-label {
        color: rgba(148, 163, 184, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .conflict-bindings {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .conflict-binding-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .conflict-cmd {
        flex: 1;
        font-size: 12px;
        color: rgba(255,255,255,0.7);
    }

    .conflict-unit-type {
        color: rgba(255,255,255,0.3);
        font-style: italic;
        flex-shrink: 0;
    }

    .btn-remove-conflict {
        flex-shrink: 0;
        color: rgba(220, 80, 80, 0.8) !important;
        border-color: rgba(220, 80, 80, 0.3) !important;
        &:hover:not(:disabled) { background: rgba(220, 80, 80, 0.2) !important; color: #fff !important; }
    }

    .btn-advanced-cta {
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.7);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
        flex-shrink: 0;

        &:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
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
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-gutter: stable;
        padding: 14px 16px;
        gap: 10px;
        &::-webkit-scrollbar { width: 5px; }
        &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    }

    .controls-row {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 8px;
        overflow: hidden;
    }

    .controls-spacer { flex: 1; }


    .keyboard-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        flex-shrink: 0;
        &::-webkit-scrollbar { height: 5px; }
        &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
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
