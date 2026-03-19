<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Units", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>Units</h1>
                <p>Browse and explore all units across factions and tech levels.</p>
            </div>

            <div v-if="!hasGameInstalled" class="no-game flex-col flex-center gap-lg">
                <Icon :icon="alertIcon" :width="48" :height="48" style="opacity: 0.3" />
                <div class="flex-col flex-center gap-sm">
                    <h3>No game version installed</h3>
                    <p class="body-2" style="opacity: 0.5">Download a game version from the Downloads section to browse units.</p>
                </div>
            </div>

            <div v-else class="units-layout flex-row gap-xl" :class="{ 'detail-mode': selectedUnit }">
                <Transition name="fade">
                    <Panel v-if="!selectedUnit" class="unit-filters" no-padding>
                        <UnitFiltersComponent />
                    </Panel>
                </Transition>
                <Panel class="flex-grow unit-list-panel">
                    <div class="flex-col fullheight panel-content">
                        <Transition name="fade">
                            <UnitListComponent v-if="!selectedUnit" @unit-selected="onUnitSelected" />
                        </Transition>
                        <Transition name="detail-fade">
                            <UnitDetailView v-if="selectedUnit" :unit="selectedUnit" @close="onCloseDetail" />
                        </Transition>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import Panel from "@renderer/components/common/Panel.vue";
import UnitFiltersComponent from "@renderer/components/units/UnitFiltersComponent.vue";
import UnitListComponent from "@renderer/components/units/UnitListComponent.vue";
import UnitDetailView from "@renderer/components/units/UnitDetailView.vue";
import { UnitData } from "@main/content/game/unit-data";
import { unitsStore, loadUnits } from "@renderer/store/units.store";
import { gameStore } from "@renderer/store/game.store";
import alertIcon from "@iconify-icons/mdi/alert-circle-outline";

const selectedUnit = ref<UnitData | null>(null);

const hasGameInstalled = computed(() => !!gameStore.selectedGameVersion);

function onUnitSelected(unit: UnitData) {
    selectedUnit.value = unit;
}

function onCloseDetail() {
    selectedUnit.value = null;
}

watch(
    () => gameStore.selectedGameVersion?.gameVersion,
    (version) => {
        if (version && !unitsStore.isLoaded) {
            loadUnits(version);
        }
    },
    { immediate: true }
);
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.units-layout {
    width: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: row;
    position: relative;
    align-items: stretch;
    gap: map.get($spacing, "xl");
    transition: gap 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &.detail-mode {
        gap: 0;
    }
}

.unit-filters {
    width: 260px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    transition:
        width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease,
        margin 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.unit-list-panel {
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

.no-game {
    flex: 1;
    text-align: center;
    padding: map.get($spacing, "xxxl");
}

// Filter panel transitions
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

// Detail view transitions
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
</style>
