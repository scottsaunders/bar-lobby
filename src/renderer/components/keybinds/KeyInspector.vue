<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="key-inspector">
        <div class="inspector-header">
            <div class="key-name-block">
                <span class="key-name-label">{{ keyLabel }}</span>
                <span v-if="sharedEntry" class="status-badge" :class="sharedEntry.severity">
                    <Icon :icon="sharedEntry.severity === 'conflict' ? 'mdi:alert' : 'mdi:information-outline'" />
                    {{ sharedEntry.severity === 'conflict' ? 'Conflict' : 'Shared' }}
                </span>
            </div>
            <div class="header-spacer" />
            <button class="btn-close" @click="emit('close')">✕</button>
        </div>

        <div v-if="sharedEntry?.severity === 'conflict'" class="inspector-notice is-conflict caption-2">
            Two or more commands in the same context are bound here. The game may use one and ignore the other — remove the one you don't need.
        </div>
        <div v-else-if="sharedEntry?.severity === 'shared'" class="inspector-notice is-shared caption-2">
            This key is shared across unit type contexts. Commands only fire for the relevant unit type, so this is usually fine.
        </div>

        <div v-if="layerGroups.length === 0" class="empty-state caption-1">
            No commands bound to this key.
        </div>

        <div v-else class="layer-list">
            <div v-for="group in layerGroups" :key="group.modifierLabel" class="layer-group">
                <div class="layer-label caption-1-strong">{{ group.modifierLabel }}</div>
                <div class="binding-rows">
                    <div
                        v-for="b in group.bindings"
                        :key="b.id"
                        class="binding-row"
                        :class="{ 'is-conflict-row': isConflictBinding(b) }"
                    >
                        <div class="binding-info">
                            <span class="cmd-label body-2">{{ getCommandLabel(b.command) }}</span>
                            <span class="unit-type-badge caption-2" :class="getCommandUnitType(b.command)">
                                {{ getCommandUnitType(b.command) }}
                            </span>
                        </div>
                        <button class="btn-remove" title="Remove this binding" @click="onRemove(b.id)">Remove</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="sharedEntry?.severity === 'conflict'" class="inspector-footer caption-2">
            You can also drag a new command from the panel on the left directly onto this key.
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { computed } from "vue";
    import { Icon } from "@iconify/vue";
    import { keybindsStore, getBindingsForKey, removeBinding } from "@renderer/store/keybinds.store";
    import { engineKeyToLabel, formatBindingLabel } from "@renderer/utils/uikeys/key-formatter";
    import { getCommandLabel, getCommandUnitType } from "@renderer/utils/uikeys/commands";
    import type { KeyBinding } from "@renderer/utils/uikeys/types";

    const props = defineProps<{ engineKey: string }>();
    const emit = defineEmits<{ (e: "close"): void }>();

    const keyLabel = computed(() => engineKeyToLabel(props.engineKey));

    const allBindings = computed(() => getBindingsForKey(props.engineKey));

    const sharedEntry = computed(() =>
        keybindsStore.sharedKeys.find((s) => s.key === props.engineKey)
    );

    interface LayerGroup {
        modifierLabel: string;
        modifiers: string[];
        bindings: KeyBinding[];
    }

    const layerGroups = computed((): LayerGroup[] => {
        const map = new Map<string, LayerGroup>();

        for (const b of allBindings.value) {
            const label = b.modifiers.length === 0
                ? "Base"
                : b.modifiers.includes("Any")
                    ? "Any Layer"
                    : formatBindingLabel(b.modifiers, "").replace(/\+$/, "");

            const existing = map.get(label);
            if (existing) {
                existing.bindings.push(b);
            } else {
                map.set(label, { modifierLabel: label, modifiers: b.modifiers, bindings: [b] });
            }
        }

        // Put current active modifier layer first
        const activeLabel = keybindsStore.activeModifiers.any
            ? "Any Layer"
            : (() => {
                const mods: string[] = [];
                if (keybindsStore.activeModifiers.ctrl) mods.push("Ctrl");
                if (keybindsStore.activeModifiers.shift) mods.push("Shift");
                if (keybindsStore.activeModifiers.alt) mods.push("Alt");
                return mods.length === 0 ? "Base" : mods.join("+");
            })();

        const groups = [...map.values()];
        groups.sort((a, b) => {
            if (a.modifierLabel === activeLabel) return -1;
            if (b.modifierLabel === activeLabel) return 1;
            if (a.modifierLabel === "Base") return -1;
            if (b.modifierLabel === "Base") return 1;
            return a.modifierLabel.localeCompare(b.modifierLabel);
        });
        return groups;
    });

    function isConflictBinding(b: KeyBinding): boolean {
        if (!sharedEntry.value || sharedEntry.value.severity !== "conflict") return false;
        return sharedEntry.value.bindings.some((sb) => sb.id === b.id);
    }

    function onRemove(id: string) {
        removeBinding(id);
    }
</script>

<style lang="scss" scoped>
    .key-inspector {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
    }

    .inspector-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .key-name-block {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .key-name-label {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        line-height: 1;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;

        &.conflict {
            background: rgba(251, 191, 36, 0.15);
            border: 1px solid rgba(251, 191, 36, 0.35);
            color: rgba(251, 191, 36, 0.9);
        }

        &.shared {
            background: rgba(148, 163, 184, 0.08);
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: rgba(148, 163, 184, 0.7);
        }
    }

    .header-spacer { flex: 1; }

    .btn-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.35);
        font-size: 13px;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        transition: all 0.1s;
        &:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
    }

    .inspector-notice {
        padding: 6px 10px;
        border-radius: 4px;
        line-height: 1.4;

        &.is-conflict {
            background: rgba(251, 191, 36, 0.08);
            border: 1px solid rgba(251, 191, 36, 0.2);
            color: rgba(251, 191, 36, 0.8);
        }

        &.is-shared {
            background: rgba(148, 163, 184, 0.06);
            border: 1px solid rgba(148, 163, 184, 0.15);
            color: rgba(148, 163, 184, 0.6);
        }
    }

    .empty-state {
        color: rgba(255, 255, 255, 0.3);
        font-style: italic;
        padding: 4px 0;
    }

    .layer-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .layer-group {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .layer-label {
        flex-shrink: 0;
        min-width: 70px;
        padding-top: 5px;
        color: rgba(255, 255, 255, 0.35);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 10px;
    }

    .binding-rows {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .binding-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);

        &.is-conflict-row {
            background: rgba(251, 191, 36, 0.06);
            border-color: rgba(251, 191, 36, 0.2);
        }
    }

    .binding-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .cmd-label {
        color: rgba(255, 255, 255, 0.85);
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .unit-type-badge {
        flex-shrink: 0;
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;

        &.combat  { background: rgba(239, 68, 68, 0.15);  color: rgba(239, 68, 68, 0.7); }
        &.builder { background: rgba(234, 179, 8, 0.15);  color: rgba(234, 179, 8, 0.7); }
        &.all     { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.3); }
    }

    .btn-remove {
        flex-shrink: 0;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.45);
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.1s;

        &:hover {
            background: rgba(220, 50, 50, 0.25);
            border-color: rgba(220, 50, 50, 0.5);
            color: #fff;
        }
    }

    .inspector-footer {
        color: rgba(255, 255, 255, 0.25);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 6px;
    }
</style>
