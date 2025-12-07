<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Skirmish vs AI", order: 1, devOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.skirmish") }}</h1>
                <p>Configure your battle against AI opponents</p>
            </div>
            <div class="skirmish-layout flex-row gap-xl">
                <!-- Left Panel: Map Information -->
                <Panel class="map-panel" no-padding>
                    <div class="panel-content flex-col fullheight">
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                            <div class="flex-row gap-md">
                                <Select
                                    :modelValue="battleStore.battleOptions.map"
                                    :options="mapListOptions"
                                    data-key="springName"
                                    label="Map"
                                    optionLabel="springName"
                                    :filter="true"
                                    class="fullwidth"
                                    @update:model-value="onMapSelected"
                                />
                                <Button v-tooltip.left="'Open map selector'" @click="openMapList">
                                    <Icon :icon="listIcon" height="23" />
                                </Button>
                                <Button v-tooltip.left="'Configure map options'" @click="openMapOptions">
                                    <Icon :icon="cogIcon" height="23" />
                                </Button>
                                <MapListModal
                                    v-model="mapListOpen"
                                    :title="t('lobby.components.battle.offlineBattleComponent.maps')"
                                    @map-selected="onMapSelected"
                                />
                                <MapOptionsModal v-if="battleStore.battleOptions.map" v-model="mapOptionsOpen" />
                            </div>
                            <div class="map-preview-container">
                                <MapBattlePreview />
                            </div>
                            <div class="flex-row flex-space-between">
                                <div class="flex-row gap-lg flex-center-items">
                                    <div class="flex-row flex-center-items gap-sm body-1">
                                        <Icon :icon="personIcon" />
                                        <span>{{ map?.playerCountMin }} - {{ map?.playerCountMax }}</span>
                                    </div>
                                    <div class="flex-row flex-center-items gap-sm body-1">
                                        <Icon :icon="gridIcon" />
                                        <span>{{ map?.mapWidth }} x {{ map?.mapHeight }}</span>
                                    </div>
                                </div>
                                <div class="flex-row flex-justify-end">
                                    <div class="flex-row flex-center-items gap-sm">
                                        <TerrainIcon v-for="terrain in map?.terrain" :terrain="terrain" v-bind:key="terrain" />
                                    </div>
                                </div>
                            </div>
                            <GameModeComponent />
                            <div v-if="settingsStore.devMode">
                                <Select
                                    :modelValue="battleStore.battleOptions.gameVersion"
                                    :options="gameListOptions"
                                    optionLabel="gameVersion"
                                    optionValue="gameVersion"
                                    label="Game"
                                    :filter="true"
                                    :placeholder="battleStore.battleOptions.gameVersion"
                                    @update:model-value="onGameSelected"
                                />
                            </div>
                            <div v-if="settingsStore.devMode">
                                <Select
                                    :modelValue="enginesStore.selectedEngineVersion"
                                    @update:model-value="(engine) => (enginesStore.selectedEngineVersion = engine)"
                                    :options="enginesStore.availableEngineVersions"
                                    data-key="id"
                                    optionLabel="id"
                                    label="Engine"
                                    :filter="true"
                                    class="fullwidth"
                                />
                            </div>
                            <div class="flex-row flex-bottom gap-md flex-grow">
                                <div class="fullwidth" v-if="map">
                                    <Button v-if="gameStore.status === GameStatus.LOADING" class="fullwidth grey" disabled>{{
                                        t("lobby.components.battle.offlineBattleComponent.gameIsStarting")
                                    }}</Button>
                                    <Button v-else-if="gameStore.status === GameStatus.RUNNING" class="fullwidth grey" disabled>{{
                                        t("lobby.components.battle.offlineBattleComponent.gameIsRunning")
                                    }}</Button>
                                    <DownloadContentButton
                                        v-else
                                        :maps="[map.springName]"
                                        :engines="battleStore.battleOptions.engineVersion ? [battleStore.battleOptions.engineVersion] : []"
                                        :games="battleStore.battleOptions.gameVersion ? [battleStore.battleOptions.gameVersion] : []"
                                        class="fullwidth large"
                                        @click="battleActions.startBattle"
                                        >{{ t("lobby.components.battle.offlineBattleComponent.startTheGame") }}</DownloadContentButton
                                    >
                                </div>
                                <Button v-else class="fullwidth green" disabled>{{
                                    t("lobby.components.battle.offlineBattleComponent.startTheGame")
                                }}</Button>
                            </div>
                        </div>
                    </div>
                </Panel>

                <!-- Center Panel: Teams and Settings -->
                <Panel class="teams-settings-panel flex-grow" no-padding>
                    <div class="panel-content flex-col fullheight">
                        <h2 class="title-2 padding-left-xxl padding-top-xxl padding-right-xxl padding-bottom-lg">Teams & Settings</h2>
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-bottom-xxl">
                            <p class="body-1">Teams and settings will go here</p>
                        </div>
                    </div>
                </Panel>

                <!-- Right Panel: TBD Content -->
                <Panel class="tbd-panel" no-padding>
                    <div class="panel-content flex-col fullheight">
                        <h2 class="title-2 padding-left-xxl padding-top-xxl padding-right-xxl padding-bottom-lg">Additional Options</h2>
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-bottom-xxl">
                            <p class="body-1">TBD content will go here</p>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Panel from "@renderer/components/common/Panel.vue";
import { useTypedI18n } from "@renderer/i18n";
import Select from "@renderer/components/controls/Select.vue";
import { Icon } from "@iconify/vue";
import MapListModal from "@renderer/components/battle/MapListModal.vue";
import MapOptionsModal from "@renderer/components/battle/MapOptionsModal.vue";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import Button from "@renderer/components/controls/Button.vue";
import { db } from "@renderer/store/db";
import listIcon from "@iconify-icons/mdi/format-list-bulleted";
import cogIcon from "@iconify-icons/mdi/cog";
import { useDexieLiveQuery, useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import MapBattlePreview from "@renderer/components/maps/MapBattlePreview.vue";
import { MapData } from "@main/content/maps/map-data";
import { settingsStore } from "@renderer/store/settings.store";
import GameModeComponent from "@renderer/components/battle/GameModeComponent.vue";
import { GameStatus, gameStore } from "@renderer/store/game.store";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import { enginesStore } from "@renderer/store/engine.store";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import gridIcon from "@iconify-icons/mdi/grid";
import { getRandomMap } from "@renderer/store/maps.store";

const { t } = useTypedI18n();

const mapListOpen = ref(false);
const mapOptionsOpen = ref(false);
const mapListOptions = useDexieLiveQuery(() => db.maps.toArray());
const gameListOptions = computed(() => {
    return Array.from(gameStore.availableGameVersions.values());
});

const map = useDexieLiveQueryWithDeps([() => battleStore.battleOptions.map], () => {
    if (!battleStore.battleOptions.map) return;
    return db.maps.get(battleStore.battleOptions.map.springName);
});

function openMapList() {
    mapListOpen.value = true;
}

function openMapOptions() {
    mapOptionsOpen.value = true;
}

function onGameSelected(gameVersion: string) {
    gameStore.selectedGameVersion = gameStore.availableGameVersions.get(gameVersion);
    battleStore.battleOptions.gameVersion = gameVersion;
}

function onMapSelected(map: MapData) {
    battleStore.battleOptions.map = map;
    mapListOpen.value = false;
}

// Initialize a map if none is selected
onMounted(async () => {
    if (!battleStore.battleOptions.map) {
        const randomMap = await getRandomMap();
        if (randomMap) {
            battleStore.battleOptions.map = randomMap;
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

.skirmish-layout {
    width: 100%;
    height: 100%;
    min-height: 0;
    align-items: stretch; // Ensure all panels have the same height
}

.map-panel {
    width: 400px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}

.teams-settings-panel {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.tbd-panel {
    width: 400px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}

.panel-content {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.panel-body {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.map-preview-container {
    flex-shrink: 0;
    width: 100%;
    min-height: 200px;
    max-height: 400px;
}
</style>
