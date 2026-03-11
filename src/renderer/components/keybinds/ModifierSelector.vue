<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="modifier-selector">
        <div class="modifier-label caption-1-strong">Active Layer</div>
        <div class="modifier-buttons flex-row gap-xs flex-wrap">
            <button
                v-for="combo in MODIFIER_COMBOS"
                :key="combo.id"
                class="mod-btn"
                :class="{ active: isActiveCombo(combo) }"
                @click="setCombo(combo)"
            >
                <span v-if="combo.modifiers.length === 0">Base</span>
                <span v-else>{{ combo.label }}</span>
            </button>
        </div>
        <div class="active-display" :class="{ 'has-mods': activeLabel !== 'Base' }">
            <span class="caption-1">Layer: </span>
            <span class="active-label body-2-strong">{{ activeLabel }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from "vue";
    import { keybindsStore, modifierStateToArray } from "@renderer/store/keybinds.store";
    import type { ModifierState } from "@renderer/utils/uikeys/types";

    interface ModifierCombo {
        id: string;
        label: string;
        modifiers: string[];
        state: Partial<ModifierState>;
    }

    const MODIFIER_COMBOS: ModifierCombo[] = [
        { id: "none", label: "Base", modifiers: [], state: { ctrl: false, shift: false, alt: false, space: false, any: false } },
        { id: "shift", label: "Shift", modifiers: ["Shift"], state: { ctrl: false, shift: true, alt: false, space: false, any: false } },
        { id: "ctrl", label: "Ctrl", modifiers: ["Ctrl"], state: { ctrl: true, shift: false, alt: false, space: false, any: false } },
        { id: "alt", label: "Alt", modifiers: ["Alt"], state: { ctrl: false, shift: false, alt: true, space: false, any: false } },
        { id: "ctrl_shift", label: "Ctrl+Shift", modifiers: ["Ctrl", "Shift"], state: { ctrl: true, shift: true, alt: false, space: false, any: false } },
        { id: "ctrl_alt", label: "Ctrl+Alt", modifiers: ["Ctrl", "Alt"], state: { ctrl: true, shift: false, alt: true, space: false, any: false } },
        { id: "alt_shift", label: "Alt+Shift", modifiers: ["Alt", "Shift"], state: { ctrl: false, shift: true, alt: true, space: false, any: false } },
        { id: "ctrl_alt_shift", label: "Ctrl+Alt+Shift", modifiers: ["Ctrl", "Alt", "Shift"], state: { ctrl: true, shift: true, alt: true, space: false, any: false } },
        { id: "any", label: "Any+", modifiers: ["Any"], state: { ctrl: false, shift: false, alt: false, space: false, any: true } },
    ];

    function isActiveCombo(combo: ModifierCombo): boolean {
        const s = keybindsStore.activeModifiers;
        return (
            !!s.ctrl === !!combo.state.ctrl &&
            !!s.shift === !!combo.state.shift &&
            !!s.alt === !!combo.state.alt &&
            !!s.any === !!combo.state.any
        );
    }

    function setCombo(combo: ModifierCombo) {
        keybindsStore.activeModifiers.ctrl = !!combo.state.ctrl;
        keybindsStore.activeModifiers.shift = !!combo.state.shift;
        keybindsStore.activeModifiers.alt = !!combo.state.alt;
        keybindsStore.activeModifiers.space = !!combo.state.space;
        keybindsStore.activeModifiers.any = !!combo.state.any;
    }

    const activeLabel = computed(() => {
        const mods = modifierStateToArray(keybindsStore.activeModifiers);
        return mods.length === 0 ? "Base" : mods.join("+");
    });
</script>

<style lang="scss" scoped>
    .modifier-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .modifier-label {
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .modifier-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .mod-btn {
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

        &:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
        }

        &.active {
            background: rgba(37, 99, 235, 0.5);
            border-color: rgba(37, 99, 235, 0.8);
            color: #fff;
            box-shadow: 0 0 8px rgba(37, 99, 235, 0.4);
        }
    }

    .active-display {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);

        .active-label {
            color: rgba(255, 255, 255, 0.6);
        }

        &.has-mods .active-label {
            color: rgb(96, 165, 250);
        }
    }
</style>
