<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="flex-col gap-lg flex-grow fullheight map-list-wrapper">
        <div class="flex-row gap-md">
            <SearchBox v-model="searchVal" />
            <Select
                v-model="sortMethod"
                :options="sortMethods"
                :label="t('lobby.components.maps.mapListComponents.sortBy')"
                optionLabel="label"
            />
        </div>

        <div class="flex-col flex-grow fullheight">
            <div class="scroll-container" style="overflow-y: scroll" ref="el">
                <div class="maps">
                    <TransitionGroup name="maps-list">
                        <MapOverviewCard v-for="map in maps" :key="map.springName" :map="map" @click="mapSelected(map)" />
                    </TransitionGroup>
                    <div v-if="maps === undefined" class="loading-state">
                        <Loader />
                    </div>
                    <div v-else-if="maps.length === 0">
                        <h4>{{ t("lobby.components.maps.mapListComponents.noMapsFound") }}</h4>
                        <span>{{ t("lobby.components.maps.mapListComponents.pleaseTryDifferent") }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
/**
 * TODO:
 * - Similar to online map browser
 * - Indicator whether map is installed or not
 * - Easy one click install button
 * - Demo map button that launches a simple offline game on the map
 */
import { Ref, ref } from "vue";

import SearchBox from "@renderer/components/controls/SearchBox.vue";
import Select from "@renderer/components/controls/Select.vue";
import MapOverviewCard from "@renderer/components/maps/MapOverviewCard.vue";
import Loader from "@renderer/components/common/Loader.vue";
import { type MapData } from "@main/content/maps/map-data";
import type { GameType, Terrain } from "@main/content/maps/map-metadata";
import { db } from "@renderer/store/db";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { mapsStore } from "@renderer/store/maps.store";

import { useInfiniteScroll } from "@vueuse/core";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const { filters } = mapsStore;

type SortMethod = { label: string; dbKey: string };

const sortMethods: SortMethod[] = [
    { label: t("lobby.components.maps.mapListComponents.labelName"), dbKey: "displayName" },
    { label: t("lobby.components.maps.mapListComponents.labelSize"), dbKey: "mapWidth" },
];
const sortMethod: Ref<SortMethod | undefined> = ref(sortMethods.at(0));
const searchVal = ref("");
const emit = defineEmits<{
    (event: "map-selected", map: MapData): void;
}>();

const limit = ref(30);
const el = ref<HTMLElement | null>(null);
useInfiniteScroll(
    el,
    () => {
        limit.value += 30;
    },
    { distance: 300, interval: 550 }
);

// Simplified query - if "downloaded only" filter is on, use indexed query
// Otherwise use a simple toArray with in-memory filtering
const maps = useDexieLiveQueryWithDeps([searchVal, sortMethod, limit, filters], async () => {
    const { terrain, gameType, mapSize } = filters;
    const terrainFilters = new Set([...(<Terrain[]>Object.keys(terrain)).filter((key) => !!terrain[key]).map((k) => k)]);
    const gameTypeFilters = new Set([...(<GameType[]>Object.keys(gameType)).filter((key) => gameType[key]).map((k) => k)]);
    const mapSizeFilters = new Set([...Object.keys(mapSize).filter((key) => !!mapSize[key])]);
    const searchLower = searchVal.value.toLocaleLowerCase();
    const sortKey = sortMethod.value?.dbKey || "displayName";
    
    // Build the filter function for in-memory filtering
    const filterFn = (map: MapData) => {
        if (searchLower && !map.displayName.toLocaleLowerCase().includes(searchLower)) return false;
        if (filters.downloadedOnly && !map.isInstalled) return false;
        if (filters.favoritesOnly && !map.isFavorite) return false;
        if (filters.minPlayers > map.playerCountMax) return false;
        if (filters.maxPlayers < map.playerCountMax) return false;
        if (filters.fixedPositionsOnly && !(map.startPos?.team && map.startPos.team.length > 0)) return false;
        const mapSizeStr = `${map.mapWidth}x${map.mapHeight}`;
        if (mapSizeFilters.size > 0 && !mapSizeFilters.has(mapSizeStr)) return false;
        if (terrainFilters.size > 0 && !terrainFilters.isSubsetOf(new Set([...map.terrain]))) return false;
        if (gameTypeFilters.size > 0 && gameTypeFilters.isDisjointFrom(new Set([...map.tags]))) return false;
        return true;
    };
    
    // Use indexed where clause when possible for better performance
    let query;
    if (filters.downloadedOnly) {
        // Use index on isInstalled - much faster for users with downloaded maps
        query = db.maps.where("isInstalled").equals(1);
    } else {
        // Fall back to orderBy which uses the sort index
        query = db.maps.orderBy(sortKey);
    }
    
    // Get a batch of records and filter in memory
    // This is faster than .filter() callback which runs on every record
    const batchSize = Math.max(limit.value * 3, 100); // Fetch more to account for filtering
    const batch = await query.limit(batchSize).toArray();
    
    // Filter and sort in memory
    let results = batch.filter(filterFn);
    
    // Sort if we used where() instead of orderBy()
    if (filters.downloadedOnly) {
        results.sort((a, b) => {
            const aVal = a[sortKey as keyof MapData] as string;
            const bVal = b[sortKey as keyof MapData] as string;
            return aVal?.localeCompare?.(bVal) ?? 0;
        });
    }
    
    return results.slice(0, limit.value);
});

function mapSelected(map: MapData) {
    emit("map-selected", map);
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.maps {
    display: grid;
    grid-gap: map-get($spacing, "lg"); // 16px (closest to 15px)
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding-right: map-get($spacing, "sm"); // 8px (closest to 10px)
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    grid-column: 1 / -1;
}

// Transition
.maps-list-move,
.maps-list-enter-active,
.maps-list-leave-active {
    transition: all 0.5s ease;
}
.maps-list-enter-from,
.maps-list-leave-to {
    opacity: 0;
    // transform: translateX(0, 30px);
}
.maps-list-leave-active {
    position: absolute;
}
</style>
