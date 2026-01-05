<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Modal v-model="isOpen" :title="map?.displayName || ''" style="height: 85vh; width: 90vw; max-width: 1600px">
        <div v-if="map" class="map-detail-content">
            <div class="container">
                <div class="map-preview-wrapper">
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
    </Modal>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { MapData } from "@main/content/maps/map-data";
import Button from "@renderer/components/controls/Button.vue";
import Modal from "@renderer/components/common/Modal.vue";
import { db } from "@renderer/store/db";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import { enginesStore } from "@renderer/store/engine.store";
import { gameStore } from "@renderer/store/game.store";
import MapSimplePreview from "@renderer/components/maps/MapSimplePreview.vue";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import { Icon } from "@iconify/vue";
import heart_plus from "@iconify-icons/mdi/heart-plus";
import heart_minus from "@iconify-icons/mdi/heart-minus";
import personIcon from "@iconify-icons/mdi/person-multiple";
import waves from "@iconify-icons/mdi/waves";
import gridIcon from "@iconify-icons/mdi/grid";
import windPower from "@iconify-icons/mdi/wind-power";
import { useTypedI18n } from "@renderer/i18n";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";

const { t } = useTypedI18n();
const router = useRouter();

const props = defineProps<{
    map: MapData | null;
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (event: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
});

async function play() {
    if (!props.map) return;
    // Set the map in battle store and navigate to skirmish page
    battleActions.resetToDefaultBattle(enginesStore.selectedEngineVersion, gameStore.selectedGameVersion, props.map);
    isOpen.value = false;
    router.push("/play/skirmishVsAi");
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

.map-detail-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.container {
    display: flex;
    flex-direction: row;
    gap: map.get($spacing, "lg");
    height: 100%;
    min-height: 0;
    flex: 1;
}

.map-preview-wrapper {
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

.info {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
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

