<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Maps", order: 1, transition: { name: "slide-left" }, offine: true } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.library.maps.title") }}</h1>
                <p>{{ t("lobby.library.maps.description") }}</p>
            </div>
            <div class="maps-layout flex-row gap-xl">
                <Panel class="map-filters" no-padding>
                    <MapFiltersComponent />
                </Panel>
                <Panel class="flex-grow">
                    <div class="flex-col fullheight">
                        <MapListComponent @map-selected="onMapSelected" />
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { MapData } from "@main/content/maps/map-data";
import Panel from "@renderer/components/common/Panel.vue";
import MapFiltersComponent from "@renderer/components/maps/MapFiltersComponent.vue";
import MapListComponent from "@renderer/components/maps/MapListComponent.vue";
import { useRouter } from "vue-router";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const router = useRouter();

async function onMapSelected(map: MapData) {
    await router.push(`/library/maps/${map.springName}`);
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map-get($spacing, "xxl") map-get($spacing, "sm") map-get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
    
    .view-title {
        padding-left: 0;
    }
}

.maps-layout {
    width: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: row;
}

.map-filters {
    width: 300px; // Layout-specific width for filters panel (no close design system match)
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}
</style>
