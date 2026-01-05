<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div v-if="map" class="map-detail-view">
        <div class="scroll-container main-panel-scroll">
            <div class="gap-md page padding-xxl">
                <div class="header-row">
                    <Button v-tooltip.bottom="t('lobby.library.maps.back')" class="icon back-button" @click="$emit('close')">
                        <Icon :icon="arrow_back" :height="24" />
                    </Button>
                    <h1 class="title-1">{{ map.displayName }}</h1>
                </div>
                <div class="container">
                    <div class="map-preview-container">
                        <MapSimplePreview :map="map" />
                    </div>
                    <div class="info flex-col fullheight">
                        <div class="details">
                            <h3 class="subtitle-1">{{ t("lobby.library.maps.properties") }}</h3>
                            <div class="detail-text body-1">
                                {{ map.description }}
                            </div>
                            <div class="padding-lg"></div>
                            <div class="flex-row flex-center-items gap-sm body-2">
                                <Icon :icon="windPower" width="20" height="20" />{{ map.windMin }} - {{ map.windMax }}
                            </div>
                            <div class="flex-row flex-center-items gap-sm body-2">
                                <Icon :icon="waves" width="20" height="20" />{{ map.tidalStrength }}
                            </div>
                            <div class="flex-row flex-center-items gap-sm body-2">
                                <Icon :icon="personIcon" width="20" height="20" />{{ map?.playerCountMin }} - {{ map?.playerCountMax }}
                            </div>
                            <div class="flex-row flex-center-items gap-sm body-2">
                                <Icon :icon="gridIcon" width="20" height="20" />{{ map?.mapWidth }} x {{ map?.mapHeight }}
                            </div>
                            <div class="mt-5">
                                <div class="detail-text flex-row gap-sm">
                                    <TerrainIcon v-for="terrain in map?.terrain" :terrain="terrain" v-bind:key="terrain" />
                                </div>
                            </div>
                            <div class="padding-lg"></div>
                            <div v-if="map.author" class="item-title body-2">
                                <p>
                                    {{ t("lobby.library.maps.author") }} <b class="padding-md item">{{ map.author }}</b>
                                </p>
                            </div>
                        </div>
                        <div class="gridform flex-bottom">
                            <Button
                                @click="toggleMapFavorite"
                                v-if="!map.isFavorite"
                                class="icon"
                                v-tooltip.bottom="t('lobby.library.maps.addToFavorites')"
                            >
                                <Icon :icon="heart_plus" :height="33" />
                            </Button>
                            <Button
                                @click="toggleMapFavorite"
                                v-if="map.isFavorite"
                                class="icon"
                                v-tooltip.bottom="t('lobby.library.maps.removeFromFavorites')"
                            >
                                <Icon :icon="heart_minus" :height="33" />
                            </Button>
                            <DownloadContentButton v-if="map" :maps="[map.springName]" class="fullwidth green" @click="play">{{
                                t("lobby.buttons.skirmishOnThisMap")
                            }}</DownloadContentButton>
                            <Button v-else class="fullwidth green" disabled>{{ t("lobby.buttons.skirmishOnThisMap") }}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRouter } from "vue-router";
import Button from "@renderer/components/controls/Button.vue";
import { db } from "@renderer/store/db";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import { enginesStore } from "@renderer/store/engine.store";
import { gameStore } from "@renderer/store/game.store";
import MapSimplePreview from "@renderer/components/maps/MapSimplePreview.vue";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import { Icon } from "@iconify/vue";
import arrow_back from "@iconify-icons/mdi/arrow-back";
import heart_plus from "@iconify-icons/mdi/heart-plus";
import heart_minus from "@iconify-icons/mdi/heart-minus";
import personIcon from "@iconify-icons/mdi/person-multiple";
import waves from "@iconify-icons/mdi/waves";
import gridIcon from "@iconify-icons/mdi/grid";
import windPower from "@iconify-icons/mdi/wind-power";
import { useTypedI18n } from "@renderer/i18n";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import type { MapData } from "@main/content/maps/map-data";

const { t } = useTypedI18n();
const router = useRouter();

const props = defineProps<{
    map: MapData | null;
}>();

const emit = defineEmits<{
    (event: "close"): void;
}>();

async function play() {
    if (!props.map) return;
    // Set the map in battle store and navigate to skirmish page
    battleActions.resetToDefaultBattle(enginesStore.selectedEngineVersion, gameStore.selectedGameVersion, props.map);
    router.push("/play/skirmishVsAi");
    emit("close");
}

function toggleMapFavorite() {
    if (!props.map) return;
    db.maps.update(props.map.springName, { isFavorite: !props.map.isFavorite });
    props.map.isFavorite = !props.map.isFavorite;
}

watch(
    () => battleStore.isSelectingGameMode,
    (newValue) => {
        battleStore.isLobbyOpened = !newValue;
    }
);
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.map-detail-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-height: 0;
    pointer-events: auto;
    width: 100%;
    height: 100%;
}

:deep(.scroll-container) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    height: 100%;
}

.page {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    height: 100%;
}

.header-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: map.get($spacing, "md");
    flex-shrink: 0;
    
    .back-button {
        flex-shrink: 0;
    }
    
    h1 {
        flex: 1;
        margin: 0;
    }
}

.container {
    display: flex;
    flex-direction: row;
    gap: map.get($spacing, "lg");
    min-height: 0;
    flex: 1;
    overflow: hidden;
}

.map-preview-container {
    flex-shrink: 0;
    width: auto;
    height: 100%;
    aspect-ratio: 1;
    min-height: 0;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.details {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    width: 512px;
    margin-bottom: map.get($spacing, "lg");
}

.item-title {
    color: #686868;
}
.item {
    color: #929292;
}
</style>

