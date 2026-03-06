<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Matchmaking", order: 3, onlineOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.matchmaking.title") }}</h1>
                <p>{{ t("lobby.views.play.matchmaking.description") }}</p>
            </div>
            <div class="matchmaking-layout flex-row gap-xl fullheight">
                <!-- Left Panel: Queue Size Selection -->
                <Panel class="queue-list-panel" no-padding>
                    <div class="scroll-container queue-list-scroll">
                        <TransitionGroup name="fade" tag="div" class="queue-list">
                            <div
                                v-for="queue in availableQueues"
                                :key="queue.id"
                                class="queue-tile-wrapper"
                            >
                                <InteractiveTile
                                    :selected="selectedQueue === queue.id"
                                    :saturate="true"
                                    @click="() => (selectedQueue = queue.id)"
                                    :class="{ disabled: isSearching }"
                                >
                                    <template #media>
                                        <div class="queue-background" :style="getQueueBackgroundStyle(queue.id)"></div>
                                    </template>
                                    <template #content>
                                        <h3 class="title-3">{{ getQueueDisplayName(queue.id) }}</h3>
                                    </template>
                                </InteractiveTile>
                            </div>
                        </TransitionGroup>
                    </div>
                </Panel>

                <!-- Main Panel: Mode Details -->
                <Panel class="mode-details-panel flex-grow" no-padding>
                    <div class="mode-details-layout flex-col fullheight">
                        <!-- Season Title -->
                        <div class="season-title padding-top-xxl padding-bottom-lg">
                            <h2 class="title-1">Season 3</h2>
                        </div>

                        <!-- Maps Container -->
                        <div class="maps-container flex-col gap-md padding-left-xxl padding-right-xxl padding-bottom-lg">
                            <div class="maps-grid">
                                    <div
                                        v-for="map in displayedMaps"
                                        :key="map.springName"
                                        class="map-tile-wrapper"
                                    >
                                        <InteractiveTile
                                            @click="() => openMapDetail(map)"
                                        >
                                        <template #media>
                                            <div class="map-tile-background" :style="getMapBackgroundStyle(map)"></div>
                                        </template>
                                        <template #content>
                                            <h4 class="title-3">{{ map.displayName || map.springName }}</h4>
                                        </template>
                                    </InteractiveTile>
                                </div>
                            </div>
                        </div>

                        <!-- Info Panels -->
                        <div class="info-panels flex-row gap-lg padding-left-xxl padding-right-xxl padding-bottom-xxl">
                            <!-- Player Info Panel -->
                            <Panel class="player-info-panel flex-grow" no-padding>
                                <div class="panel-content flex-col gap-md padding-lg">
                                    <h3 class="subtitle-1">Your Rank</h3>
                                    <div class="player-info flex-col gap-md">
                                        <div class="player-name body-1-strong">{{ playerName }}</div>
                                        <div class="rank-info flex-row gap-sm flex-center-items">
                                            <div class="rank-number body-1-strong">{{ playerRank }}</div>
                                            <div class="rank-icon">
                                                <Icon :icon="rankIcon" :height="24" />
                                            </div>
                                        </div>
                                        <div class="xp-bar-section flex-col gap-xs">
                                            <div class="body-2">Progress to next rank</div>
                                            <Progress :percent="xpProgress" :height="20" themed />
                                        </div>
                                    </div>
                                </div>
                            </Panel>

                            <!-- Active Players Panel -->
                            <Panel class="active-players-panel flex-grow" no-padding>
                                <div class="panel-content flex-col gap-md padding-lg">
                                    <h3 class="subtitle-1">Active Players</h3>
                                    <div class="players-count body-1">
                                        {{ playersQueued }} players in queue
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <!-- Join Queue Button (Bottom Right) -->
                        <div class="join-queue-controls padding-left-xxl padding-right-xxl padding-top-lg padding-bottom-xxl">
                            <Button
                                v-if="!isSearching"
                                class="green large fullwidth"
                                @click="handleJoinQueue"
                            >
                                {{ t("lobby.multiplayer.ranked.buttons.searchGame") }}
                            </Button>
                            <Button
                                v-else
                                class="grey large fullwidth"
                                disabled
                            >
                                {{ t("lobby.multiplayer.ranked.buttons.searchingForOpponent") }}
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>

        <!-- Map Detail Modal -->
        <MapDetailModal v-model="mapDetailOpen" :map="selectedMap" />
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, type Ref, watch } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import Panel from "@renderer/components/common/Panel.vue";
import Button from "@renderer/components/controls/Button.vue";
import Progress from "@renderer/components/common/Progress.vue";
import MapDetailModal from "@renderer/components/maps/MapDetailModal.vue";
import { Icon } from "@iconify/vue";
import diamondIcon from "@iconify-icons/mdi/diamond";
import chevronUpIcon from "@iconify-icons/mdi/chevron-up";
import { me } from "@renderer/store/me.store";
import { db } from "@renderer/store/db";
import { MapData } from "@main/content/maps/map-data";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";

const { t } = useTypedI18n();
const cache = useImageBlobUrlCache();

// Mock queue data for UI prototyping
const availableQueues = ref([
    { id: "1v1", teamSize: 1, numOfTeams: 2, name: "Duel" },
    { id: "2v2", teamSize: 2, numOfTeams: 2, name: "2v2" },
    { id: "3v3", teamSize: 3, numOfTeams: 2, name: "3v3" },
    { id: "4v4", teamSize: 4, numOfTeams: 2, name: "4v4" },
    { id: "5v5", teamSize: 5, numOfTeams: 2, name: "5v5" },
]);

const selectedQueue = ref("1v1");

// Mock maps per queue - in real implementation, these would come from the playlist
const queueMaps: Record<string, string[]> = {
    "1v1": [
        "Red Comet Remake 1.8",
        "Supreme Crossing v1",
        "Twin Lakes Park Redux 1.2.2",
        "Supreme Isthmus v2.1",
        "Tundra Continents v2.3.1",
        "Tetrad v2",
    ],
    "2v2": [
        "Ghenna Rising 4.0.1",
        "Koom Valley 3 3.1",
        "Lavender Bender v2",
        "Sand Crowns 1.0",
        "Silveridge v1.0.1",
        "Sunderance v1.3",
    ],
    "3v3": [
        "All That Glitters v2.2",
        "All That Simmers v1.1.1",
        "All That Smolders v1.2",
        "Angel Crossing 1.5.1",
        "Avalanche 3.4",
        "Bismuth Valley v2.4.1",
    ],
    "4v4": [
        "Carrot Mountains v2.0",
        "Centerrock Remake 1.2",
        "Charlie in the Hills Remake v1.1.1",
        "Claymore 3.0.3",
        "Comet Catcher Remake 1.8",
        "Crater Islands Remake v1.0.1",
    ],
    "5v5": [
        "Gasbag Grabens 1.0.2",
        "Gods of War Remake v1.3",
        "Hide and Seek 2.2.3",
        "Industrial Revolution v2",
        "Kings Assault v1.3",
        "Moonshine Run v1.0.1",
    ],
};

const displayedMaps = ref<MapData[]>([]);
const mapDetailOpen = ref(false);
const selectedMap = ref<MapData | null>(null);

// Get shared mock state from App.vue (for prototyping)
const matchmakingWidgetState = inject<Ref<{ isVisible: boolean; isSearching: boolean; isMatchFound: boolean; playersQueued: number }>>(
    "matchmakingWidgetState",
    ref({ isVisible: false, isSearching: false, isMatchFound: false, playersQueued: 42 })
);

// Use shared state so widget can reset the matchmaking page
const isSearching = computed(() => matchmakingWidgetState?.value.isSearching || false);
const playersQueued = computed(() => matchmakingWidgetState?.value.playersQueued || 0);

const playerName = computed(() => me.username || "Player");

// Mock rank/XP data per queue
const playerRank = computed(() => {
    // Mock: different ranks for different queues
    if (selectedQueue.value === "1v1") return 3; // Duel rank
    if (selectedQueue.value === "2v2") return 5; // 2v2 rank
    if (selectedQueue.value === "3v3") return 4; // 3v3 rank
    if (selectedQueue.value === "4v4") return 6; // 4v4 rank
    if (selectedQueue.value === "5v5") return 7; // 5v5 rank
    return 4; // Default
});

const rankIcon = computed(() => {
    // Mock: use diamond for rank 5+, chevron for lower ranks
    return playerRank.value >= 5 ? diamondIcon : chevronUpIcon;
});

const xpProgress = computed(() => {
    // Mock: different XP progress for different queues
    if (selectedQueue.value === "1v1") return 0.45; // Duel XP
    if (selectedQueue.value === "2v2") return 0.65; // 2v2 XP
    if (selectedQueue.value === "3v3") return 0.55; // 3v3 XP
    if (selectedQueue.value === "4v4") return 0.75; // 4v4 XP
    if (selectedQueue.value === "5v5") return 0.35; // 5v5 XP
    return 0.55; // Default
});

function getQueueDisplayName(queueId: string): string {
    const queue = availableQueues.value.find((q) => q.id === queueId);
    return queue?.name || queueId.toUpperCase();
}

function getQueueBackgroundStyle(queueId: string): string {
    // Use the background image from the original design
    return "background-image: url('/src/renderer/assets/images/backgrounds/5.jpg');";
}

function getMapBackgroundStyle(map: MapData): string {
    // Use map preview image if available
    if (map?.imagesBlob?.preview) {
        const imageUrl = cache.get(map.springName, map.imagesBlob.preview);
        return `background-image: url('${imageUrl}');`;
    }
    // Fallback to default
    return "background-image: url('/src/renderer/assets/images/default-minimap.png');";
}

async function loadQueueMaps() {
    try {
        const mapNames = queueMaps[selectedQueue.value] || [];
        
        // Load map data from database by springName
        const maps = await Promise.all(
            mapNames.map(async (springName) => {
                // Try to find map in database
                let map = await db.maps.get(springName);
                if (!map) {
                    map = await db.nonLiveMaps.get(springName);
                }
                // If still not found, create a minimal mock map
                if (!map) {
                    return {
                        springName,
                        displayName: springName,
                        isInstalled: false,
                        isDownloading: false,
                    } as MapData;
                }
                return map;
            })
        );

        displayedMaps.value = maps.filter((m): m is MapData => m !== undefined);
    } catch (error) {
        console.error("Failed to load queue maps:", error);
        displayedMaps.value = [];
    }
}

function openMapDetail(map: MapData) {
    selectedMap.value = map;
    mapDetailOpen.value = true;
}

function handleJoinQueue() {
    // Mock: set searching state for UI prototype
    if (!matchmakingWidgetState?.value) return;
    
    matchmakingWidgetState.value.isVisible = true;
    matchmakingWidgetState.value.isSearching = true;
    matchmakingWidgetState.value.isMatchFound = false;
    
    // Mock: simulate finding a match after 3 seconds
    setTimeout(() => {
        if (matchmakingWidgetState?.value) {
            matchmakingWidgetState.value.isSearching = false;
            matchmakingWidgetState.value.isMatchFound = true;
        }
    }, 3000);
}

// Watch for queue changes to load the correct maps
watch(
    () => selectedQueue.value,
    () => {
        loadQueueMaps();
    },
    { immediate: true }
);

onMounted(() => {
    loadQueueMaps();
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.matchmaking-layout {
    width: 100%;
    height: 100%;
}

.queue-list-panel {
    width: 300px;
    flex-shrink: 0;
}

.queue-list-scroll {
    height: 100%;
    overflow-y: auto;
    padding: map.get($spacing, "md");
}

.queue-list {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "md");
}

.queue-tile-wrapper {
    min-height: 120px;
    
    .interactive-tile.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
}

.queue-background {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.mode-details-panel {
    min-width: 0;
}

.mode-details-layout {
    width: 100%;
    height: 100%;
}

.season-title {
    text-align: center;
    width: 100%;
}

.maps-container {
    width: 100%;
    flex-shrink: 0;
}

.maps-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: map.get($spacing, "md");
}

.map-tile-wrapper {
    aspect-ratio: 1;
    min-height: 0;
}

.map-tile-background {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.info-panels {
    width: 100%;
    flex-shrink: 0;
}

.player-info-panel,
.active-players-panel {
    min-width: 0;
}

.panel-content {
    width: 100%;
    height: 100%;
}

.player-info {
    width: 100%;
}

.rank-info {
    width: 100%;
}

.rank-icon {
    display: flex;
    align-items: center;
    color: #22c55e; // Green for rank icon
}

.xp-bar-section {
    width: 100%;
}

.players-count {
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
}

.join-queue-controls {
    flex-shrink: 0;
    margin-top: auto;
}

.loading-queues,
.queue-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 200px;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
}

.queue-error {
    color: #ff6b6b;
}
</style>


















