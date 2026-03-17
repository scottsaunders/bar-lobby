<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="advanced-editor">
        <div class="advanced-header">
            <div class="header-info">
                <span class="body-2-strong">Advanced Bindings</span>
                <span class="caption-2" style="color: rgba(255,255,255,0.4)">
                    Chord sequences (multi-key combos) that can't be shown on the visual keyboard.
                </span>
            </div>
            <div class="toolbar-spacer" />
            <button class="btn-action" @click="emit('close')">Close</button>
        </div>

        <div class="binding-list">
            <div v-if="keybindsStore.parsed && keybindsStore.parsed.advancedBindings.length === 0" class="empty-state caption-1">
                No advanced bindings.
            </div>

            <div
                v-for="binding in keybindsStore.parsed?.advancedBindings ?? []"
                :key="binding.id"
                class="binding-row"
            >
                <!-- Key sequence chips -->
                <div class="key-sequence">
                    <template v-for="(step, i) in formatSteps(binding)" :key="i">
                        <span class="key-chip">{{ step }}</span>
                        <span v-if="i < formatSteps(binding).length - 1" class="step-sep">then</span>
                    </template>
                </div>

                <!-- Arrow -->
                <span class="row-arrow">→</span>

                <!-- Command label -->
                <span class="command-label body-2" v-tooltip.top="binding.command">
                    {{ getCommandLabel(binding.command) }}
                </span>

                <!-- Delete -->
                <button class="btn-remove" v-tooltip.left="'Remove this binding'" @click="onRemove(binding.id)">×</button>
            </div>
        </div>

        <!-- Add custom binding -->
        <div class="add-section">
            <div v-if="!showAdd" class="add-trigger">
                <button class="btn-add" @click="showAdd = true">+ Add custom binding</button>
            </div>
            <div v-else class="add-form">
                <div class="add-form-hint caption-2">
                    Enter the full key combo and command, e.g. <code>Ctrl+sc_g,Ctrl+sc_g  guard</code>
                    <br />You can omit the leading <code>bind</code> — it's added automatically.
                </div>
                <div class="add-form-row">
                    <input
                        v-model="addInput"
                        class="add-input"
                        placeholder="Ctrl+sc_g,Ctrl+sc_g  guard"
                        spellcheck="false"
                        @keydown.enter="onAddConfirm"
                        @keydown.escape="showAdd = false"
                        ref="addInputRef"
                    />
                    <button class="btn-confirm" :disabled="!addInput.trim()" @click="onAddConfirm">Add</button>
                    <button class="btn-cancel" @click="showAdd = false">Cancel</button>
                </div>
                <div v-if="addError" class="add-error caption-2">{{ addError }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { nextTick, ref } from "vue";
    import { keybindsStore, removeAdvancedBinding, addAdvancedBinding } from "@renderer/store/keybinds.store";
    import { formatAdvancedBindingSteps } from "@renderer/utils/uikeys/key-formatter";
    import { COMMAND_CATEGORIES } from "@renderer/utils/uikeys/commands";
    import type { KeyBinding } from "@renderer/utils/uikeys/types";

    const emit = defineEmits<{ (e: "close"): void }>();

    const showAdd = ref(false);
    const addInput = ref("");
    const addError = ref("");
    const addInputRef = ref<HTMLInputElement | null>(null);

    const allCommands = COMMAND_CATEGORIES.flatMap((c) => c.commands);

    function getCommandLabel(command: string): string {
        return allCommands.find((c) => c.command === command)?.label ?? command;
    }

    function formatSteps(binding: KeyBinding): string[] {
        return formatAdvancedBindingSteps(binding.raw);
    }

    function onRemove(id: string) {
        removeAdvancedBinding(id);
    }

    async function onAddConfirm() {
        addError.value = "";
        const ok = addAdvancedBinding(addInput.value);
        if (!ok) {
            addError.value = "Could not parse that binding — check the syntax and try again.";
            return;
        }
        addInput.value = "";
        showAdd.value = false;
    }

    async function openAdd() {
        showAdd.value = true;
        await nextTick();
        addInputRef.value?.focus();
    }

    defineExpose({ openAdd });
</script>

<style lang="scss" scoped>
    .advanced-editor {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 12px 16px;
        gap: 10px;
    }

    .advanced-header {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    .header-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .toolbar-spacer { flex: 1; }

    .binding-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-right: 4px;

        &::-webkit-scrollbar { width: 5px; }
        &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    }

    .empty-state {
        color: rgba(255,255,255,0.3);
        font-style: italic;
        padding: 12px 0;
    }

    .binding-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 5px;
        min-height: 36px;

        &:hover {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.12);
        }
    }

    .key-sequence {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }

    .key-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background: rgba(37, 99, 235, 0.2);
        border: 1px solid rgba(37, 99, 235, 0.4);
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        color: rgba(150, 200, 255, 0.9);
        white-space: nowrap;
    }

    .step-sep {
        font-size: 10px;
        color: rgba(255,255,255,0.3);
        font-style: italic;
    }

    .row-arrow {
        color: rgba(255,255,255,0.25);
        font-size: 14px;
        flex-shrink: 0;
    }

    .command-label {
        flex: 1;
        color: rgba(255,255,255,0.75);
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .btn-remove {
        flex-shrink: 0;
        background: none;
        border: none;
        color: rgba(220, 80, 80, 0.5);
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        padding: 0 4px;
        border-radius: 3px;
        transition: all 0.1s;

        &:hover { color: rgb(220, 80, 80); background: rgba(220, 80, 80, 0.1); }
    }

    /* ── Add section ── */
    .add-section {
        flex-shrink: 0;
        border-top: 1px solid rgba(255,255,255,0.06);
        padding-top: 10px;
    }

    .btn-add {
        padding: 5px 12px;
        background: rgba(255,255,255,0.06);
        border: 1px dashed rgba(255,255,255,0.2);
        border-radius: 4px;
        color: rgba(255,255,255,0.5);
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.12s;

        &:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); border-style: solid; }
    }

    .add-form {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .add-form-hint {
        color: rgba(255,255,255,0.35);
        code {
            background: rgba(255,255,255,0.08);
            padding: 1px 4px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 10px;
        }
    }

    .add-form-row {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .add-input {
        flex: 1;
        padding: 6px 10px;
        background: rgba(0,0,0,0.4);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 4px;
        color: rgba(200,220,255,0.9);
        font-family: monospace;
        font-size: 12px;
        outline: none;

        &:focus { border-color: rgba(37,99,235,0.6); }
        &::placeholder { color: rgba(255,255,255,0.2); }
    }

    .add-error {
        color: rgba(220, 80, 80, 0.8);
    }

    .btn-action {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 4px;
        color: rgba(255,255,255,0.7);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.12s;
        &:hover { background: rgba(255,255,255,0.15); color: #fff; }
    }

    .btn-confirm {
        padding: 5px 12px;
        background: rgba(34,197,94,0.3);
        border: 1px solid rgba(34,197,94,0.5);
        border-radius: 4px;
        color: rgba(150,255,180,0.9);
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        &:hover:not(:disabled) { background: rgba(34,197,94,0.5); color: #fff; }
        &:disabled { opacity: 0.35; cursor: not-allowed; }
    }

    .btn-cancel {
        padding: 5px 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        color: rgba(255,255,255,0.5);
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        &:hover { background: rgba(220,50,50,0.2); border-color: rgba(220,50,50,0.4); color: #fff; }
    }
</style>
