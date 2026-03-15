<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="modifier-selector">
        <div class="layer-row">
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
        </div>

        <div class="any-row">
            <button class="any-toggle" :class="{ active: isAnyActive }" @click="toggleAny">
                <span class="any-toggle-label">Modifier Key Actions</span>
                <span class="any-toggle-desc">Bindings that fire on keydown of a modifier key — active on every layer</span>
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
        flex-direction: column;
        gap: 8px;
    }

    .layer-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
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

    .any-row {
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        padding-top: 8px;
    }

    .any-toggle {
        display: flex;
        align-items: baseline;
        gap: 10px;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;
        text-align: left;
        width: 100%;

        &:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
        }

        &.active {
            background: rgba(99, 57, 214, 0.25);
            border-color: rgba(139, 92, 246, 0.6);

            .any-toggle-label { color: rgba(196, 168, 255, 1); }
            .any-toggle-desc { color: rgba(196, 168, 255, 0.6); }
        }
    }

    .any-toggle-label {
        font-size: 12px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.6);
        white-space: nowrap;
        flex-shrink: 0;
        transition: color 0.15s ease;
    }

    .any-toggle-desc {
        font-size: 11px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.3);
        transition: color 0.15s ease;
    }
</style>
