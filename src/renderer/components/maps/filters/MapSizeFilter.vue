<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="map-size-container gap-md">
        <IconFilterCheckbox
            v-for="mapSize in mapSizeOptions"
            v-model:checked="mapSizeFilters[mapSize]"
            v-bind:key="mapSize"
            class="map-size-option"
        >
            <div>{{ mapSize }}</div>
        </IconFilterCheckbox>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import IconFilterCheckbox from "@renderer/components/maps/filters/IconFilterCheckbox.vue";
import { mapsStore } from "@renderer/store/maps.store";
import { db } from "@renderer/store/db";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
const { filters } = mapsStore;
const { mapSize: mapSizeFilters } = filters;

// Query database for all unique map sizes
const allMaps = useDexieLiveQuery(async () => {
    return await db.maps.toArray();
});

// Extract unique map sizes and sort them
const mapSizeOptions = computed(() => {
    if (!allMaps.value) return [];
    
    const sizeSet = new Set<string>();
    allMaps.value.forEach((map) => {
        if (map.mapWidth && map.mapHeight) {
            sizeSet.add(`${map.mapWidth}x${map.mapHeight}`);
        }
    });
    
    // Sort by width first, then height
    return Array.from(sizeSet).sort((a, b) => {
        const [aWidth, aHeight] = a.split("x").map(Number);
        const [bWidth, bHeight] = b.split("x").map(Number);
        if (aWidth !== bWidth) {
            return aWidth - bWidth;
        }
        return aHeight - bHeight;
    });
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.map-size-container {
    display: flex;
    flex-flow: row wrap;
}
.map-size-option {
    padding: map.get($spacing, "sm"); // 8px
    flex-grow: 0;
}
</style>

