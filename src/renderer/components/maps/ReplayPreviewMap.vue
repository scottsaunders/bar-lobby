<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="map-container">
        <div v-if="mapTextureUrl" class="map" :style="mapAspectRatioStyle">
            <img :src="mapTextureUrl" ref="mapImage" />
            <div class="boxes">
                <div v-for="team in teams" :key="team.allyTeamId" v-startBox="team.startBox" class="box" />
            </div>
            <div class="start-positions">
                <div
                    v-for="(player, index) in replay?.contenders.filter((p) => p.startPos)"
                    :key="index"
                    v-startPos="[{ x: player.startPos?.x, y: player.startPos?.z }, mapWidthElmos, mapHeightElmos]"
                    v-setPlayerColor="player.rgbColor"
                    class="start-pos"
                >
                    <div class="start-pos-tooltip caption-1">
                        <img v-if="player.faction === 'Armada'" src="/src/renderer/assets/images/factions/armada_faction.png" />
                        <img v-else-if="player.faction === 'Cortex'" src="/src/renderer/assets/images/factions/cortex_faction.png" />
                        <img v-else src="/src/renderer/assets/images/factions/unknown_faction.png" />
                        <span>{{ player.name }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Replay } from "@main/content/replays/replay";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { db } from "@renderer/store/db";
import { computed, defineComponent, ref, watch } from "vue";
import vStartBox from "@renderer/directives/vStartBox";
import vStartPos from "@renderer/directives/vStartPos";
import vSetPlayerColor from "@renderer/directives/vSetPlayerColor";

const mapImage = ref<HTMLImageElement | null>(null);

const props = defineProps<{
    replay: Replay | null;
}>();

const teams = ref(props.replay?.teams || []);

watch(
    () => props.replay,
    () => {
        if (props.replay) teams.value = props.replay.teams;
    }
);

defineComponent({
    directives: {
        startBox: vStartBox,
        startPos: vStartPos,
        setPlayerColor: vSetPlayerColor,
    },
});

const map = useDexieLiveQueryWithDeps([() => props.replay?.mapSpringName], () => {
    if (!props.replay) throw new Error("unable to acces replay");

    return db.maps.get(props.replay.mapSpringName);
});
const mapWidthElmos = computed(() => (map.value?.mapWidth ? map.value.mapWidth * 512 : null));
const mapHeightElmos = computed(() => (map.value?.mapHeight ? map.value.mapHeight * 512 : null));
const cache = useImageBlobUrlCache();
const mapTextureUrl = computed(() => {
    if (!map.value?.imagesBlob?.preview) return null;
    return cache.get(map.value.springName, map.value.imagesBlob?.preview);
});

const mapAspectRatioStyle = computed(() => {
    if (!map.value?.mapWidth || !map.value?.mapHeight) {
        return {};
    }
    const aspectRatio = map.value.mapWidth / map.value.mapHeight;
    // Always set aspect-ratio to maintain correct proportions
    // For wide maps (aspect ratio > 1), set height: auto and width: 100%
    // For tall maps (aspect ratio <= 1), set height: 100% and width: auto
    return {
        aspectRatio: `${map.value.mapWidth} / ${map.value.mapHeight}`,
        ...(aspectRatio > 1 
            ? { height: "auto", width: "100%" } 
            : { height: "100%", width: "auto" }),
    };
});
</script>

<style lang="scss" scoped>
.map-container {
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    min-height: 0;
    flex-grow: 1;
    position: relative;
}

.map {
    position: relative;
    overflow: hidden;
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        // image-rendering: pixelated;
    }
}

.boxes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.box {
    position: absolute;
    background: rgba(194, 10, 10, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
    &:nth-child(1) {
        background: rgba(23, 202, 32, 0.3);
    }
}

.start-positions {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.start-pos {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 14px;
    border: 1px solid hsl(0deg 0% 0% / 53%);
    box-shadow: 1px 1px rgb(0 0 0 / 43%);
    transform: translateX(-6px) translateY(-6px);
    &-tooltip {
        display: flex;
        align-items: center;
        position: absolute;
        transform: translateX(-50%);
        left: 6px;
        bottom: 13px;
        width: max-content;
        .left &,
        .right & {
            bottom: -2px;
            transform: none;
        }
        .left & {
            left: 16px;
        }
        .right & {
            right: 16px;
            left: initial;
        }
        img {
            height: 16px;
            width: 16px;
        }
    }
}
</style>
