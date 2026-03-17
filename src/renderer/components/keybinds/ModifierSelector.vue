<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="modifier-selector">
        <div class="modifier-label caption-1-strong">Active Layer</div>
        <div class="modifier-buttons">
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

            <div class="divider" />

            <button
                class="mod-btn any-btn"
                :class="{ active: isAnyActive }"
                v-tooltip.bottom="'Bindings that fire on keydown of a modifier key — active on every layer'"
                @click="toggleAny"
            >
                Modifier Keys
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from "vue";
    import { keybindsStore } from "@renderer/store/keybinds.store";
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
    ];

    const isAnyActive = computed(() => !!keybindsStore.activeModifiers.any);

    function isActiveCombo(combo: ModifierCombo): boolean {
        if (keybindsStore.activeModifiers.any) return false;
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
        keybindsStore.activeModifiers.any = false;
    }

    function toggleAny() {
        if (keybindsStore.activeModifiers.any) {
            keybindsStore.activeModifiers.any = false;
        } else {
            keybindsStore.activeModifiers.ctrl = false;
            keybindsStore.activeModifiers.shift = false;
            keybindsStore.activeModifiers.alt = false;
            keybindsStore.activeModifiers.space = false;
            keybindsStore.activeModifiers.any = true;
        }
    }
</script>

<style lang="scss" scoped>
    .modifier-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
    }

    .modifier-label {
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        flex-shrink: 0;
    }

    .modifier-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .divider {
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.12);
        flex-shrink: 0;
        margin: 0 2px;
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

    .any-btn {
        &.active {
            background: rgba(99, 57, 214, 0.4);
            border-color: rgba(139, 92, 246, 0.7);
            color: rgba(220, 200, 255, 1);
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
        }
    }
</style>
