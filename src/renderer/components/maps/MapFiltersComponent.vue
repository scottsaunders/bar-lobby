<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="scroll-container main-panel-scroll">
        <div class="flex-col gap-xl filters">
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">{{ t("lobby.components.maps.mapFiltersComponent.maxPlayers") }}</h6>
                <MaxPlayersFilter />
            </div>
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">{{ t("lobby.components.maps.mapFiltersComponent.filterBy") }}</h6>
                <div class="flex-col gap-sm">
                    <FavoritesFilter />
                    <DownloadedFilter />
                    <FixedPositionsFilter />
                </div>
            </div>
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">{{ t("lobby.components.maps.mapFiltersComponent.terrain") }}</h6>
                <TerrainFilter />
            </div>
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">{{ t("lobby.components.maps.mapFiltersComponent.gameType") }}</h6>
                <GameTypeFilter />
            </div>
            <div class="flex-col gap-sm filter-section">
                <h6 class="subtitle-2">{{ t("lobby.components.maps.mapFiltersComponent.mapSize") }}</h6>
                <MapSizeFilter />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
/**
 * Sort by:
 * - name
 * - size
 * - ideal max player count
 * - downloaded
 * - date created or updated
 *
 * Filter by:
 * - name (text search)
 * - map size (min and max, as slider)
 * - max players (min and max, as slider)
 * - game type
 * - terrain (general, water type, & layout)
 */
import GameTypeFilter from "@renderer/components/maps/filters/GameTypeFilter.vue";
import MapSizeFilter from "@renderer/components/maps/filters/MapSizeFilter.vue";
import MaxPlayersFilter from "@renderer/components/maps/filters/MaxPlayersFilter.vue";
import TerrainFilter from "@renderer/components/maps/filters/TerrainFilter.vue";
import FavoritesFilter from "@renderer/components/maps/filters/FavoritesFilter.vue";
import DownloadedFilter from "@renderer/components/maps/filters/DownloadedFilter.vue";
import FixedPositionsFilter from "@renderer/components/maps/filters/FixedPositionsFilter.vue";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.filters {
    padding: map.get($spacing, "xxl"); // Padding on all sides to match scenarios page
}
</style>
