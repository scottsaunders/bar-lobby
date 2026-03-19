<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="keybind-editor" :class="{ loading: !keybindsStore.isLoaded }" @keydown.esc.stop="closeAllDialogs">
        <div v-if="!keybindsStore.isLoaded" class="loading-state">
            <span class="body-1">Loading keybinds...</span>
        </div>

        <template v-else>
            <!-- Toolbar -->
            <div class="editor-toolbar">
                <div class="mode-tabs">
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'visual' }" @click="keybindsStore.viewMode = 'visual'">Visual</button>
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'list' }" @click="keybindsStore.viewMode = 'list'">List</button>
                    <button class="mode-tab" :class="{ active: keybindsStore.viewMode === 'raw' }" @click="onOpenRaw">Raw</button>
                </div>

                <div class="divider" />

                <!-- Unit type filter -->
                <div class="unit-type-tabs" v-tooltip.bottom="'Filter commands by unit type'">
                    <button
                        v-for="ut in UNIT_TYPES"
                        :key="ut.id"
                        class="unit-tab"
                        :class="{ active: keybindsStore.activeUnitType === ut.id }"
                        @click="keybindsStore.activeUnitType = ut.id"
                    >{{ ut.label }}</button>
                </div>

                <div class="divider" />

                <!-- Preset selector -->
                <div class="preset-selector">
                    <span class="preset-label caption-2">Preset:</span>
                    <select class="preset-select" :value="keybindsStore.activePreset" @change="onPresetChange">
                        <option v-for="p in KEYBIND_PRESETS" :key="p.id" :value="p.id">{{ p.label }}</option>
                        <option v-for="p in keybindsStore.customPresets" :key="p.id" :value="p.id">★ {{ p.label }}</option>
                        <option value="custom" disabled style="color: rgba(255,255,255,0.3)">— Unsaved —</option>
                    </select>
                </div>

                <div class="toolbar-spacer" />

                <button v-if="trueConflicts.length > 0" class="sharedkey-btn is-conflict" :class="{ active: showConflicts }" @click="showConflicts = !showConflicts" v-tooltip.bottom="'Two or more commands in the same context share this key — one may override the other unexpectedly'">
                    <Icon :icon="alertIcon" />
                    {{ trueConflicts.length }} conflict{{ trueConflicts.length !== 1 ? "s" : "" }}
                    <Icon :icon="showConflicts ? chevronUpIcon : chevronDownIcon" style="font-size: 14px; margin-left: 2px" />
                </button>
                <button v-else-if="sharedKeys.length > 0" class="sharedkey-btn is-shared" :class="{ active: showConflicts }" @click="showConflicts = !showConflicts" v-tooltip.bottom="'Some keys are shared across unit type contexts — this is usually intentional'">
                    <Icon :icon="infoIcon" />
                    {{ sharedKeys.length }} shared key{{ sharedKeys.length !== 1 ? "s" : "" }}
                    <Icon :icon="showConflicts ? chevronUpIcon : chevronDownIcon" style="font-size: 14px; margin-left: 2px" />
                </button>

                <span v-if="keybindsStore.isDirty" class="dirty-dot">Unsaved changes</span>

                <div class="toolbar-actions">
                    <button class="btn-action" :disabled="keybindsStore.undoStack.length === 0" v-tooltip.bottom="`Undo (${keybindsStore.undoStack.length} step${keybindsStore.undoStack.length !== 1 ? 's' : ''} available)`" @click="undo()"><Icon :icon="undoIcon" />Undo</button>
                    <button class="btn-action btn-revert" :disabled="!keybindsStore.isDirty" @click="onRevert">Revert</button>
                    <button class="btn-action" @click="showRestoreDialog = true">Restore Defaults</button>
                    <button class="btn-action btn-save" :disabled="(!keybindsStore.isDirty && !keybindsStore.isPresetSwitched) || keybindsStore.isSaving" @click="showSaveDialog = true">
                        {{ keybindsStore.isSaving ? "Saving…" : "Save" }}
                    </button>
                </div>
            </div>

            <!-- Shared keys panel -->
            <div v-if="showConflicts && keybindsStore.sharedKeys.length > 0" class="conflict-panel">
                <div class="conflict-panel-header">
                    <Icon v-if="trueConflicts.length > 0" :icon="alertIcon" style="color: #fbbf24" />
                    <Icon v-else :icon="infoIcon" style="color: rgba(148,163,184,0.8)" />
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

            <!-- Raw editor -->
            <div v-if="keybindsStore.viewMode === 'raw'" class="raw-editor-container">
                <div class="raw-header">
                    <span class="body-2-strong">Raw uikeys.txt</span>
                    <div class="toolbar-spacer" />
                    <button class="btn-action" @click="onApplyRaw">Apply</button>
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
                    <!-- Advanced bindings panel (replaces keyboard when open) -->
                    <AdvancedBindingsEditor v-if="keybindsStore.showAdvanced" @close="keybindsStore.showAdvanced = false" />

                    <!-- Normal keyboard view -->
                    <template v-else>
                        <div class="controls-row">
                            <ModifierSelector />
                            <div class="controls-spacer" />
                            <button
                                v-if="keybindsStore.parsed && keybindsStore.parsed.advancedBindings.length > 0"
                                class="btn-advanced-cta"
                                v-tooltip.bottom="`${keybindsStore.parsed.advancedBindings.length} chord/sequence binding${keybindsStore.parsed.advancedBindings.length !== 1 ? 's' : ''} not shown on the keyboard`"
                                @click="keybindsStore.showAdvanced = true"
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
                    </template>
                </div>
            </div>

            <!-- List mode -->
            <div v-else class="list-layout">
                <ListEditor />
            </div>
        </template>

        <!-- Restore defaults dialog -->
        <div v-if="showRestoreDialog" class="dialog-backdrop" @click.self="showRestoreDialog = false">
            <div class="dialog-panel">
                <div class="dialog-title body-2-strong">Restore Default Layout</div>
                <div class="dialog-body caption-1">
                    This will replace your current keybinds with the <strong>{{ restoreTargetPreset.label }}</strong> default layout. Any unsaved changes will be lost.
                </div>
                <div class="dialog-actions">
                    <button class="btn-action" @click="showRestoreDialog = false">Cancel</button>
                    <button class="btn-action btn-danger" @click="onConfirmRestore">Restore</button>
                </div>
            </div>
        </div>

        <!-- Preset switch confirmation dialog -->
        <div v-if="showPresetConfirm" class="dialog-backdrop" @click.self="cancelPresetSwitch">
            <div class="dialog-panel">
                <div class="dialog-title body-2-strong">Load Preset</div>
                <div class="dialog-body caption-1">
                    Load <strong>{{ pendingPreset?.label }}</strong>? Your unsaved changes will be lost.
                </div>
                <div class="dialog-actions">
                    <button class="btn-action" @click="cancelPresetSwitch">Cancel</button>
                    <button class="btn-action btn-danger" @click="confirmPresetSwitch">Load Preset</button>
                </div>
            </div>
        </div>

        <!-- Save dialog -->
        <div v-if="showSaveDialog" class="dialog-backdrop" @click.self="showSaveDialog = false">
            <div class="dialog-panel">
                <div class="dialog-title body-2-strong">Save Keybinds</div>
                <div class="dialog-body caption-1">
                    Writes your changes to <code>uikeys.txt</code>.
                    <template v-if="keybindsStore.activePreset.startsWith('custom_')">
                        Leave the name blank to update <strong>{{ keybindsStore.customPresets.find(p => p.id === keybindsStore.activePreset)?.label }}</strong> in place, or enter a new name to save a separate copy.
                    </template>
                    <template v-else>
                        Optionally enter a name to save a copy to the preset list for quick recall.
                    </template>
                </div>
                <div class="dialog-field">
                    <label class="dialog-field-label caption-2">Save as preset (optional)</label>
                    <input
                        ref="presetNameInput"
                        v-model="presetName"
                        class="dialog-input"
                        placeholder="e.g. My layout"
                        maxlength="48"
                        @keydown.enter="onConfirmSave"
                    />
                </div>
                <div class="dialog-actions">
                    <button class="btn-action" @click="showSaveDialog = false">Cancel</button>
                    <button class="btn-action btn-save" @click="onConfirmSave">
                        {{ presetName.trim() ? "Save &amp; Add Preset" : "Save" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, nextTick, onMounted, ref, watch } from "vue";
    import { Icon } from "@iconify/vue";
    import undoIcon from "@iconify-icons/mdi/undo";
    import alertIcon from "@iconify-icons/mdi/alert";
    import infoIcon from "@iconify-icons/mdi/information-outline";
    import chevronUpIcon from "@iconify-icons/mdi/chevron-up";
    import chevronDownIcon from "@iconify-icons/mdi/chevron-down";
    import { keybindsStore, loadKeybinds, saveKeybinds, revertKeybinds, removeBinding, loadPreset, saveCustomPreset, updateCustomPreset, undo } from "@renderer/store/keybinds.store";
    import { engineKeyToLabel } from "@renderer/utils/uikeys/key-formatter";
    import { getCommandLabel, getCommandUnitType } from "@renderer/utils/uikeys/commands";
    import { serializeUikeys } from "@renderer/utils/uikeys/serializer";
    import { parseUikeys } from "@renderer/utils/uikeys/parser";
    import { KEYBIND_PRESETS, type KeybindPreset } from "@renderer/utils/uikeys/presets";
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

    const showConflicts = ref(false);
    const rawText = ref("");
    const selectedKey = ref<string | null>(null);

    // Restore defaults dialog
    const showRestoreDialog = ref(false);
    const restoreTargetPreset = computed(() =>
        KEYBIND_PRESETS.find((p) => p.id === keybindsStore.activePreset) ?? KEYBIND_PRESETS[0]
    );

    function onConfirmRestore() {
        loadPreset(restoreTargetPreset.value.id);
        showRestoreDialog.value = false;
    }

    // Preset switch confirmation
    const showPresetConfirm = ref(false);
    const pendingPreset = ref<KeybindPreset | null>(null);
    const pendingPresetSelectEl = ref<HTMLSelectElement | null>(null);

    // Save dialog
    const showSaveDialog = ref(false);
    const presetName = ref("");
    const presetNameInput = ref<HTMLInputElement | null>(null);

    const trueConflicts = computed(() => keybindsStore.sharedKeys.filter((e) => e.severity === "conflict"));
    const sharedKeys = computed(() => keybindsStore.sharedKeys.filter((e) => e.severity === "shared"));

    onMounted(async () => { await loadKeybinds(); });

    function onRevert() { revertKeybinds(); }

    function onOpenRaw() {
        if (keybindsStore.parsed) rawText.value = serializeUikeys(keybindsStore.parsed);
        keybindsStore.viewMode = "raw";
    }

    function onApplyRaw() {
        keybindsStore.parsed = parseUikeys(rawText.value);
        keybindsStore.isDirty = true;
        keybindsStore.viewMode = "visual";
    }

    function onKeyClicked(key: string) {
        selectedKey.value = selectedKey.value === key ? null : key;
    }

    function closeAllDialogs() {
        if (showPresetConfirm.value) cancelPresetSwitch();
        if (showSaveDialog.value) showSaveDialog.value = false;
        if (showRestoreDialog.value) showRestoreDialog.value = false;
    }

    function onPresetChange(e: Event) {
        const id = (e.target as HTMLSelectElement).value;
        if (id === "custom") return;
        const allPresets = [...KEYBIND_PRESETS, ...keybindsStore.customPresets];
        const preset = allPresets.find((p) => p.id === id);
        if (!preset) return;
        if (keybindsStore.isDirty) {
            pendingPreset.value = preset;
            pendingPresetSelectEl.value = e.target as HTMLSelectElement;
            showPresetConfirm.value = true;
            // Reset the select visually while the dialog is open
            (e.target as HTMLSelectElement).value = keybindsStore.activePreset;
            return;
        }
        loadPreset(id);
    }

    function cancelPresetSwitch() {
        showPresetConfirm.value = false;
        pendingPreset.value = null;
        pendingPresetSelectEl.value = null;
    }

    function confirmPresetSwitch() {
        if (!pendingPreset.value) return;
        loadPreset(pendingPreset.value.id);
        showPresetConfirm.value = false;
        pendingPreset.value = null;
        pendingPresetSelectEl.value = null;
    }

    async function onConfirmSave() {
        await saveKeybinds();
        const name = presetName.value.trim();
        const content = serializeUikeys(keybindsStore.parsed!);
        if (name) {
            saveCustomPreset(name, content);
        } else if (keybindsStore.activePreset.startsWith("custom_")) {
            // No new name given — overwrite the existing custom preset's stored content
            updateCustomPreset(keybindsStore.activePreset, content);
        }
        showSaveDialog.value = false;
        presetName.value = "";
    }

    // Focus the name input when save dialog opens
    watch(showSaveDialog, (open) => {
        if (open) nextTick(() => presetNameInput.value?.focus());
    });
</script>

<style lang="scss" scoped>
    .keybind-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        position: relative;
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

    .preset-selector {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .preset-label {
        color: rgba(255, 255, 255, 0.4);
        white-space: nowrap;
    }

    .preset-select {
        padding: 4px 24px 4px 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.8);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        outline: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.5)'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;

        &:focus { border-color: rgba(37, 99, 235, 0.6); }

        option {
            background: #1a1a2e;
            color: #fff;
        }
    }

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

    /* ── In-client dialogs ── */
    .dialog-backdrop {
        position: absolute;
        inset: 0;
        z-index: 20;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dialog-panel {
        background: rgba(15, 20, 35, 0.97);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        padding: 20px 24px;
        width: 360px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }

    .dialog-title {
        color: rgba(255, 255, 255, 0.9);
    }

    .dialog-body {
        color: rgba(255, 255, 255, 0.55);
        line-height: 1.5;

        strong { color: rgba(255, 255, 255, 0.85); font-weight: 600; }
        code {
            font-family: monospace;
            font-size: 11px;
            background: rgba(255, 255, 255, 0.08);
            padding: 1px 5px;
            border-radius: 3px;
            color: rgba(200, 220, 255, 0.8);
        }
    }

    .dialog-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .dialog-field-label {
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .dialog-input {
        padding: 7px 10px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: #fff;
        font-family: inherit;
        font-size: 13px;
        outline: none;

        &::placeholder { color: rgba(255, 255, 255, 0.25); }
        &:focus { border-color: rgba(37, 99, 235, 0.6); }
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        padding-top: 4px;
    }

    .btn-danger {
        background: rgba(220, 50, 50, 0.25) !important;
        border-color: rgba(220, 50, 50, 0.45) !important;
        color: rgba(255, 160, 160, 0.9) !important;
        &:hover:not(:disabled) { background: rgba(220, 50, 50, 0.45) !important; color: #fff !important; }
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
