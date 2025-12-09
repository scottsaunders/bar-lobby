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
            <div class="maps-layout flex-row gap-xl" :class="{ 'detail-mode': selectedMap && useAnimatedView }">
                <Transition name="fade">
                    <Panel v-if="!selectedMap || !useAnimatedView" class="map-filters" no-padding>
                        <MapFiltersComponent />
                    </Panel>
                </Transition>
                <Panel class="flex-grow map-list-panel" :class="{ 'detail-mode': selectedMap && useAnimatedView }">
                    <div class="flex-col fullheight panel-content">
                        <Transition name="fade">
                            <MapListComponent
                                v-if="!selectedMap || !useAnimatedView"
                                @map-selected="onMapSelected"
                            />
                        </Transition>
                        <Transition name="detail-fade">
                            <MapDetailView v-if="selectedMap && useAnimatedView" :map="selectedMap" @close="onCloseDetail" />
                        </Transition>
                    </div>
                </Panel>
            </div>
        </div>
        <!-- Modal variant -->
        <Transition name="map-detail-modal">
            <MapDetailModal v-if="selectedMap && !useAnimatedView && showMapDetail" v-model="showMapDetail" :map="selectedMap" />
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { MapData } from "@main/content/maps/map-data";
import Panel from "@renderer/components/common/Panel.vue";
import MapFiltersComponent from "@renderer/components/maps/MapFiltersComponent.vue";
import MapListComponent from "@renderer/components/maps/MapListComponent.vue";
import MapDetailView from "@renderer/components/maps/MapDetailView.vue";
import MapDetailModal from "@renderer/components/maps/MapDetailModal.vue";
import { useRouter } from "vue-router";
import { useTypedI18n } from "@renderer/i18n";
import { settingsStore } from "@renderer/store/settings.store";
const { t } = useTypedI18n();

const router = useRouter();

const selectedMap = ref<MapData | null>(null);
const showMapDetail = ref(false);

// Default to true if setting doesn't exist yet (for backwards compatibility)
const useAnimatedView = computed(() => settingsStore.mapDetailUseAnimatedView ?? true);

function onMapSelected(map: MapData) {
    selectedMap.value = map;
    if (useAnimatedView.value) {
        // Animated inline variant (new)
        showMapDetail.value = false;
    } else {
        // Modal variant
        showMapDetail.value = true;
    }
}

function onCloseDetail() {
    selectedMap.value = null;
    showMapDetail.value = false;
}

// Watch for toggle changes - if switching modes while a map is open, update the display
watch(useAnimatedView, (newValue) => {
    if (selectedMap.value) {
        if (newValue) {
            // Switched to animated view - close modal if open
            showMapDetail.value = false;
        } else {
            // Switched to modal view - open modal
            showMapDetail.value = true;
        }
    }
});
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
    position: relative;
    align-items: stretch;
    gap: map-get($spacing, "xl");
    transition: gap 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    // When in detail mode, remove gap so panel can expand
    &.detail-mode {
        gap: 0;
    }
}

.map-filters {
    width: 300px; // Layout-specific width for filters panel (no close design system match)
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.map-list-panel {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    min-width: 0;
    flex-grow: 1;
}

.panel-content {
    position: relative;
    min-height: 0;
}

// Fade transition for filter panel
.fade-enter-active {
    transition: opacity 0.3s ease 0.1s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, width 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
}

.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
    opacity: 0;
    transform: translateX(-20px);
    width: 0;
}

.fade-leave-to {
    opacity: 0;
    transform: translateX(-20px);
    width: 0;
}

// Fade transition for detail view
.detail-fade-enter-active {
    transition: opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.detail-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-fade-enter-from {
    opacity: 0;
    transform: scale(0.95);
}

.detail-fade-leave-to {
    opacity: 0;
    transform: scale(0.98);
}

// Map detail modal transition
.map-detail-modal-enter-active {
    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.map-detail-modal-leave-active {
    transition: opacity 0.2s ease, backdrop-filter 0.2s ease;
}

.map-detail-modal-enter-from,
.map-detail-modal-leave-to {
    opacity: 0;
}
</style>
