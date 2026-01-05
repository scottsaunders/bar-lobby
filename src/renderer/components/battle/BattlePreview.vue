<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="battle-preview-content flex-col fullheight padding-xxl gap-lg">
        <div class="lobby-name title-2">{{ battle.battleOptions?.title || battle.title }}</div>
        <div class="map-preview-container" @click="onMapClick" :class="{ 'has-map': map }">
            <div v-if="mapTextureUrl" class="map-image-wrapper">
                <div class="map-background" :style="`background-image: url('${mapTextureUrl}')`"></div>
                <div v-if="map" class="map-name">
                    {{ map.displayName }}
                </div>
                <div v-if="map" class="map-attributes">
                    <div class="attributes bl">
                        <div class="flex-row flex-center-items gap-sm">
                            <Icon :icon="gridIcon" />
                            <span>{{ mapSize }}</span>
                        </div>
                        <div class="flex-row flex-center-items gap-sm">
                            <Icon :icon="personIcon" />
                            <span>{{ map.playerCountMin }} - {{ map.playerCountMax }}</span>
                        </div>
                    </div>
                    <div class="attributes br flex-row gap-sm">
                        <TerrainIcon v-for="terrain in map.terrain" :terrain="terrain" :key="terrain" />
                    </div>
                </div>
            </div>
            <div v-else class="map-image-wrapper">
                <div class="map-placeholder">No map preview</div>
            </div>
        </div>
        <div v-if="isRunning && formattedRuntime" class="runtime-info body-2 flex-row flex-center-items gap-sm">
            <Icon :icon="swordCross" height="18" />
            <span>Runtime: {{ formattedRuntime }}</span>
        </div>
        <div class="teams scroll-container flex-grow">
            <div v-if="isFFA" class="team-section">
                <div class="team-title">{{ t("lobby.components.battle.battlePreview.players") }}</div>
                <div class="contenders">
                    <template v-for="(contender, i) in battle.contenders" :key="`contender${i}`">
                        <BattlePreviewParticipant :contender="contender" />
                    </template>
                </div>
            </div>
            <template v-for="[teamId, contenders] in teams" v-else :key="`team${teamId}`">
                <div class="team-section">
                    <div class="team-title">Team {{ teamId + 1 }}</div>
                    <div class="contenders">
                        <BattlePreviewParticipant
                            v-for="(contender, contenderIndex) in contenders"
                            :key="`contender${contenderIndex}`"
                            :contender="contender"
                        />
                    </div>
                </div>
            </template>
            <div v-if="battle.spectators.length" class="team-section">
                <div class="team-title">{{ t("lobby.components.battle.battlePreview.spectators") }}</div>
                <div class="contenders">
                    <BattlePreviewParticipant
                        v-for="(spectator, spectatorIndex) in battle.spectators"
                        :key="`spectator${spectatorIndex}`"
                        :contender="spectator"
                    />
                </div>
            </div>
        </div>
        <div class="flex-row flex-bottom gap-md flex-shrink-0">
            <slot name="actions" :battle="battle"></slot>
        </div>
        <MapDetailModal v-if="map" v-model="showMapDetailModal" :map="map" />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import { DemoModel } from "$/sdfz-demo-parser";
import defaultMiniMap from "/src/renderer/assets/images/default-minimap.png?url";
import { Icon } from "@iconify/vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import gridIcon from "@iconify-icons/mdi/grid";
import swordCross from "@iconify-icons/mdi/sword-cross";

import BattlePreviewParticipant from "@renderer/components/battle/BattlePreviewParticipant.vue";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import MapDetailModal from "@renderer/components/maps/MapDetailModal.vue";
import { OngoingBattle } from "@main/content/replays/replay";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { db } from "@renderer/store/db";

const { t } = useTypedI18n();

const props = defineProps<{
    battle: OngoingBattle & {
        primaryFactor?: string;
        runtimeMs?: { value: number };
    };
    showSpoilers?: boolean;
}>();

// Try to get map by springName, or fallback to displayName lookup
const map = useDexieLiveQueryWithDeps([() => props.battle], async () => {
    // Try direct lookup by springName first
    let foundMap = await db.maps.get(props.battle.mapSpringName);
    
    // If not found, try to find by displayName (from battleOptions.map)
    if (!foundMap && props.battle.battleOptions?.map) {
        foundMap = await db.maps.where("displayName").equals(props.battle.battleOptions.map).first();
    }
    
    return foundMap || null;
});
const showMapDetailModal = ref(false);

const cache = useImageBlobUrlCache();
const mapTextureUrl = computed(() => {
    if (map.value?.imagesBlob?.preview) {
        return cache.get(map.value.springName, map.value.imagesBlob.preview);
    }
    return defaultMiniMap;
});

const isFFA = computed(() => {
    return props.battle.preset === "ffa";
});

const teams = computed<Map<number, (DemoModel.Info.Player | DemoModel.Info.AI)[]>>(() => {
    if (!props.battle.contenders || props.battle.preset === "ffa") {
        return new Map();
    }
    const teams = Map.groupBy(props.battle.contenders, (contender) => contender.allyTeamId);
    const sortedTeams = new Map([...teams.entries()].sort());
    return sortedTeams;
});

const mapSize = computed(() =>
    map.value ? map.value.mapWidth + "x" + map.value.mapHeight : t("lobby.components.maps.mapOverviewCard.sizeUnknown")
);

const isRunning = computed(() => {
    return props.battle.primaryFactor === "Running";
});

// Format runtime as H:MM:SS
function formatRuntime(ms: number): string {
    if (ms === 0) return "0:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

const formattedRuntime = computed(() => {
    if (isRunning.value && props.battle.runtimeMs?.value) {
        return formatRuntime(props.battle.runtimeMs.value);
    }
    return null;
});

function onMapClick() {
    if (map.value) {
        showMapDetailModal.value = true;
    }
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.battle-preview-content {
    min-height: 0;
}

.lobby-name {
    flex-shrink: 0;
}

.map-preview-container {
    aspect-ratio: 1;
    width: 100%;
    max-height: 250px;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
    position: relative;
    will-change: transform, opacity;
    
    &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow:
            inset 0 1px 0 rgba(0, 0, 0, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            inset 1px 0 0 rgba(0, 0, 0, 0.3),
            inset -1px 0 0 rgba(0, 0, 0, 0.3);
        border: 3px solid rgba(0, 0, 0, 0.2);
        z-index: 5;
        pointer-events: none;
    }
    
    &.has-map {
        cursor: pointer;
        
        &:hover {
            .map-name {
                opacity: 0;
            }
            .map-background {
                transform: scale(1.01);
                transition: 0.2s ease-in-out;
                &:after {
                    opacity: 0;
                    transition: 0.2s opacity ease-in-out;
                }
            }
            .attributes {
                opacity: 0;
            }
        }
    }
}

.map-image-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.map-background {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    transform: scale(1.1);
    will-change: transform;
    z-index: 0;
    transition: 0.2s ease-in-out;
    
    &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
        transition: 0.2s opacity ease-in-out;
    }
}

.map-name {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: break-word;
    padding: map.get($spacing, "sm");
    font-size: 1.75rem;
    font-weight: 600;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
    transition: 0.2s opacity;
    z-index: 3;
}

.map-attributes {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
}

.attributes {
    position: absolute;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(0, 0, 0, 0.2);
    font-size: 0.875rem;
    font-weight: 600;
    padding: map.get($spacing, "xxs") map.get($spacing, "xs");
    transition: 0.2s opacity;
    
    &.bl {
        bottom: map.get($spacing, "sm");
        left: map.get($spacing, "sm");
    }
    
    &.br {
        bottom: map.get($spacing, "sm");
        right: map.get($spacing, "sm");
        flex-wrap: wrap-reverse;
        justify-content: flex-end;
        max-width: 55%;
    }
}

.map-placeholder {
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
}

.runtime-info {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.7);
}

.teams {
    gap: 5px;
    min-height: 0;
}

.team-section {
    margin-bottom: map.get($spacing, "md");
}

.team-title {
    display: flex;
    flex-direction: row;
    gap: 10px;
    font-weight: 500;
    margin-bottom: 3px;
}

.contenders {
    display: flex;
    flex-direction: row;
    gap: 4px;
    flex-wrap: wrap;
}

.inline-icon {
    margin-top: 2px;
}

.trophy {
    color: #ffbc00;
    display: flex;
    align-self: center;
    margin-bottom: 1px;
}

.check {
    color: rgb(94, 230, 16);
}

.cross {
    color: rgb(223, 35, 35);
}
</style>
