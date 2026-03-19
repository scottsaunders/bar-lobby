<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="scroll-container main-panel-scroll">
        <div class="flex-col gap-xl filters">
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">Faction</h6>
                <div class="flex-col gap-xs">
                    <Checkbox
                        v-for="faction in factions"
                        :key="faction"
                        :label="faction"
                        :modelValue="!!filters.factions[faction]"
                        @update:modelValue="(v) => (filters.factions[faction] = v || undefined)"
                        fill
                    />
                </div>
            </div>
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">Unit Type</h6>
                <div class="flex-col gap-xs">
                    <Checkbox
                        v-for="type in unitTypes"
                        :key="type"
                        :label="type"
                        :modelValue="!!filters.types[type]"
                        @update:modelValue="(v) => (filters.types[type] = v || undefined)"
                        fill
                    />
                </div>
            </div>
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">Tech Level</h6>
                <div class="flex-col gap-xs">
                    <Checkbox
                        v-for="tl in techLevels"
                        :key="tl"
                        :label="`Tech ${tl}`"
                        :modelValue="!!filters.techLevels[tl]"
                        @update:modelValue="(v) => (filters.techLevels[tl] = v || undefined)"
                        fill
                    />
                </div>
            </div>
            <Button class="secondary" @click="clearFilters">Clear Filters</Button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import Button from "@renderer/components/controls/Button.vue";
import { unitsStore } from "@renderer/store/units.store";
import { UnitFaction, UnitType } from "@main/content/game/unit-data";

const { filters } = unitsStore;

const factions: UnitFaction[] = ["Armada", "Cortex", "Legion", "Scavengers", "Other"];
const unitTypes: UnitType[] = ["Aircraft", "Bots", "Buildings", "Vehicles", "Ships", "Hovercraft", "Seaplanes", "Gantry", "Other"];

const techLevels = computed(() => {
    const levels = new Set(unitsStore.units.map((u) => u.techLevel));
    return [...levels].sort((a, b) => a - b);
});

function clearFilters() {
    filters.factions = {};
    filters.types = {};
    filters.techLevels = {};
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.filters {
    padding: map.get($spacing, "xxl");
}
</style>
