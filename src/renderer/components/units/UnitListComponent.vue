<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="flex-col gap-lg flex-grow fullheight unit-list-wrapper">
        <div class="flex-row gap-md flex-center-items">
            <SearchBox v-model="searchVal" />
            <Select v-model="sortMethod" :options="sortMethods" label="Sort by" optionLabel="label" />
            <div class="result-count body-2">{{ filteredUnits.length }} units</div>
        </div>

        <div class="flex-col flex-grow fullheight">
            <div class="scroll-container" style="overflow-y: scroll" ref="el">
                <div class="units-grid">
                    <TransitionGroup name="units-list">
                        <UnitOverviewCard
                            v-for="unit in visibleUnits"
                            :key="unit.unitName"
                            :unit="unit"
                            @click="$emit('unit-selected', unit)"
                        />
                    </TransitionGroup>
                </div>
                <div v-if="filteredUnits.length === 0 && !isLoading" class="no-results flex-col flex-center gap-lg">
                    <Icon :icon="searchIcon" :width="48" :height="48" style="opacity: 0.3" />
                    <div>
                        <h4>No units found</h4>
                        <span class="body-2" style="opacity: 0.5">Try adjusting your search or filters</span>
                    </div>
                </div>
                <div v-if="isLoading" class="no-results flex-col flex-center gap-lg">
                    <div class="body-1" style="opacity: 0.5">Loading units...</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from "vue";

import { Icon } from "@iconify/vue";
import { useInfiniteScroll } from "@vueuse/core";
import SearchBox from "@renderer/components/controls/SearchBox.vue";
import Select from "@renderer/components/controls/Select.vue";
import UnitOverviewCard from "@renderer/components/units/UnitOverviewCard.vue";
import { unitsStore } from "@renderer/store/units.store";
import { UnitData } from "@main/content/game/unit-data";
import searchIcon from "@iconify-icons/mdi/magnify";

defineEmits<{
    (event: "unit-selected", unit: UnitData): void;
}>();

const { filters } = unitsStore;

type SortMethod = { label: string; key: keyof UnitData };
const sortMethods: SortMethod[] = [
    { label: "Name", key: "name" },
    { label: "Metal Cost", key: "metalCost" },
    { label: "Health", key: "health" },
    { label: "Speed", key: "speed" },
    { label: "Tech Level", key: "techLevel" },
];
const sortMethod: Ref<SortMethod> = ref(sortMethods[0]);
const searchVal = ref("");
const isLoading = computed(() => unitsStore.isLoading);

const limit = ref(60);
const el = ref<HTMLElement | null>(null);
useInfiniteScroll(
    el,
    () => {
        limit.value += 60;
    },
    { distance: 300, interval: 400 }
);

const filteredUnits = computed(() => {
    const search = searchVal.value.toLowerCase();
    const activeFactions = Object.keys(filters.factions).filter((k) => !!filters.factions[k as keyof typeof filters.factions]);
    const activeTypes = Object.keys(filters.types).filter((k) => !!filters.types[k as keyof typeof filters.types]);
    const activeTechLevels = Object.keys(filters.techLevels)
        .filter((k) => !!filters.techLevels[Number(k)])
        .map(Number);

    return unitsStore.units
        .filter((unit) => {
            if (search && !unit.name.toLowerCase().includes(search) && !unit.unitName.toLowerCase().includes(search)) return false;
            if (activeFactions.length > 0 && !activeFactions.includes(unit.faction)) return false;
            if (activeTypes.length > 0 && !activeTypes.includes(unit.unitType)) return false;
            if (activeTechLevels.length > 0 && !activeTechLevels.includes(unit.techLevel)) return false;
            return true;
        })
        .sort((a, b) => {
            const key = sortMethod.value.key;
            const av = a[key] as string | number;
            const bv = b[key] as string | number;
            if (typeof av === "string") return av.localeCompare(bv as string);
            return (av as number) - (bv as number);
        });
});

const visibleUnits = computed(() => filteredUnits.value.slice(0, limit.value));
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.unit-list-wrapper {
    min-height: 0;
}

.units-grid {
    display: grid;
    position: relative;
    gap: map.get($spacing, "lg");
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    padding-right: map.get($spacing, "sm");
    padding-bottom: map.get($spacing, "lg");
}

.result-count {
    flex-shrink: 0;
    opacity: 0.5;
    white-space: nowrap;
}

.no-results {
    padding: map.get($spacing, "xxxl");
    text-align: center;
}

.units-list-move,
.units-list-enter-active,
.units-list-leave-active {
    transition: all 0.5s ease;
}
.units-list-enter-from,
.units-list-leave-to {
    opacity: 0;
}
.units-list-leave-active {
    position: absolute;
}
</style>
