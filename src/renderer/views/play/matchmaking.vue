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
                <!-- Left Panel: Game mode selection (Duel, Small Teams, FFA, PvE) -->
                <Panel class="queue-list-panel" no-padding>
                    <div class="queue-list-scroll flex-col fullheight">
                        <TransitionGroup name="fade" tag="div" class="queue-list flex-col fullheight">
                            <div
                                v-for="queue in availableQueues"
                                :key="queue.id"
                                class="queue-tile-wrapper"
                            >
                                <InteractiveTile
                                    :selected="selectedQueue === queue.id"
                                    :saturate="true"
                                    @click="() => (selectedQueue = queue.id)"
                                >
                                    <template #media>
                                        <div class="queue-background" :style="getQueueBackgroundStyle(queue.id)"></div>
                                    </template>
                                    <template #content>
                                        <h3 class="title-3">{{ getQueueDisplayName(queue.id) }}</h3>
                                        <div v-if="isQueueActive(queue.id)" class="queue-active-badge">
                                            <span class="searching-dot"></span>
                                            <span class="body-2">Searching</span>
                                        </div>
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

                        <!-- Game mode description -->
                        <div class="mode-description padding-left-xxl padding-right-xxl padding-bottom-lg">
                            <p class="body-1">{{ currentModeDescription }}</p>
                        </div>

                        <!-- PvE queue type (only when PvE selected) -->
                        <div
                            v-if="selectedQueue === 'pve'"
                            class="pve-queue-selector padding-left-xxl padding-right-xxl padding-bottom-lg"
                        >
                            <h3 class="subtitle-1 padding-bottom-sm">Queue type</h3>
                            <Options
                                v-model="selectedPveQueueType"
                                :options="pveQueueOptions"
                                option-value="value"
                                option-label="label"
                                class="pve-options"
                            />
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
                                v-if="isQueueActive(selectedQueue)"
                                class="grey large fullwidth"
                                @click="handleLeaveQueue"
                            >
                                {{ t("lobby.multiplayer.ranked.buttons.leaveQueue") }}
                            </Button>
                            <Button
                                v-else-if="canJoinQueue"
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
                                Match in progress...
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
import Options from "@renderer/components/controls/Options.vue";
import Progress from "@renderer/components/common/Progress.vue";
import MapDetailModal from "@renderer/components/maps/MapDetailModal.vue";
import { Icon } from "@iconify/vue";
import diamondIcon from "@iconify-icons/mdi/diamond";
import chevronUpIcon from "@iconify-icons/mdi/chevron-up";
import { me } from "@renderer/store/me.store";
import { db } from "@renderer/store/db";
import { MapData } from "@main/content/maps/map-data";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import type { MatchmakingMockState } from "@renderer/components/battle/matchmaking-mock-state";

const { t } = useTypedI18n();
const cache = useImageBlobUrlCache();

// Game mode options for left menu
const availableQueues = ref([
    { id: "duel", name: "Duel" },
    { id: "small-teams", name: "Small Teams" },
    { id: "ffa", name: "FFA" },
    { id: "pve", name: "PvE" },
]);

const selectedQueue = ref("duel");

// Game mode descriptions for right panel
const GAME_MODE_DESCRIPTIONS: Record<string, string> = {
    duel: "Test your skills one on one vs other commanders",
    "small-teams": "Join teams of 2 to 5 commanders",
    ffa: "You against the world in matches with 8-16 players",
    pve: "Cooperative play vs the AI. Join teams of 2 - 8 players as you take on the enemy together",
};

// PvE queue type (only used when selectedQueue === "pve")
const pveQueueOptions = [
    { value: "vs-ai", label: "Vs AI" },
    { value: "vs-raptors", label: "Vs Raptors" },
    { value: "vs-scavengers", label: "Vs Scavengers" },
];
const selectedPveQueueType = ref("vs-ai");

// Mock maps per queue - in real implementation, these would come from the playlist
const queueMaps: Record<string, string[]> = {
    duel: [
        "Red Comet Remake 1.8",
        "Supreme Crossing v1",
        "Twin Lakes Park Redux 1.2.2",
        "Supreme Isthmus v2.1",
        "Tundra Continents v2.3.1",
        "Tetrad v2",
    ],
    "small-teams": [
        "Ghenna Rising 4.0.1",
        "Koom Valley 3 3.1",
        "Lavender Bender v2",
        "Sand Crowns 1.0",
        "Silveridge v1.0.1",
        "Sunderance v1.3",
    ],
    ffa: [
        "All That Glitters v2.2",
        "All That Simmers v1.1.1",
        "All That Smolders v1.2",
        "Angel Crossing 1.5.1",
        "Avalanche 3.4",
        "Bismuth Valley v2.4.1",
    ],
    pve: [
        "Carrot Mountains v2.0",
        "Centerrock Remake 1.2",
        "Charlie in the Hills Remake v1.1.1",
        "Claymore 3.0.3",
        "Comet Catcher Remake 1.8",
        "Crater Islands Remake v1.0.1",
    ],
};

const displayedMaps = ref<MapData[]>([]);
const mapDetailOpen = ref(false);
const selectedMap = ref<MapData | null>(null);

// Get shared mock state from App.vue (for prototyping)
const matchmakingState = inject<Ref<MatchmakingMockState>>("matchmakingWidgetState")!;

const canJoinQueue = computed(() => {
    const s = matchmakingState.value.status;
    return s === "idle" || s === "searching";
});

function isQueueActive(queueId: string): boolean {
    return matchmakingState.value.queues.includes(queueId);
}

const playersQueued = computed(() => matchmakingState.value.playersQueued);

const playerName = computed(() => me.username || "Player");

// Mock rank/XP data per queue
const playerRank = computed(() => {
    if (selectedQueue.value === "duel") return 3;
    if (selectedQueue.value === "small-teams") return 5;
    if (selectedQueue.value === "ffa") return 4;
    if (selectedQueue.value === "pve") return 6;
    return 4;
});

const rankIcon = computed(() => {
    // Mock: use diamond for rank 5+, chevron for lower ranks
    return playerRank.value >= 5 ? diamondIcon : chevronUpIcon;
});

const xpProgress = computed(() => {
    if (selectedQueue.value === "duel") return 0.45;
    if (selectedQueue.value === "small-teams") return 0.65;
    if (selectedQueue.value === "ffa") return 0.55;
    if (selectedQueue.value === "pve") return 0.75;
    return 0.55;
});

const currentModeDescription = computed(() => GAME_MODE_DESCRIPTIONS[selectedQueue.value] ?? "");

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

const MOCK_OPPONENT_NAMES = ["Ares_VII", "NebulaCmdr", "IronTide", "VortexKing", "StarlightGG", "QuantumRex"];
const mockTimerActive = ref(false);

function handleJoinQueue() {
    const s = matchmakingState.value;
    if (s.queues.includes(selectedQueue.value)) return;
    s.queues.push(selectedQueue.value);
    s.status = "searching";

    // Only one timer at a time — it picks a random queue when it fires
    if (mockTimerActive.value) return;
    mockTimerActive.value = true;

    setTimeout(() => {
        mockTimerActive.value = false;
        const currentQueues = matchmakingState.value.queues;
        if (currentQueues.length === 0 || matchmakingState.value.status !== "searching") return;

        // Pick a random winning queue from all currently active queues
        const winningQueue = currentQueues[Math.floor(Math.random() * currentQueues.length)];
        const maps = queueMaps[winningQueue] ?? queueMaps["duel"];
        const randomMap = maps[Math.floor(Math.random() * maps.length)];
        const opponent = MOCK_OPPONENT_NAMES[Math.floor(Math.random() * MOCK_OPPONENT_NAMES.length)];
        const totalPlayers = winningQueue === "duel" ? 2 : winningQueue === "ffa" ? 8 : 4;

        s.matchMap = randomMap;
        s.matchQueue = winningQueue;
        s.totalPlayers = totalPlayers;
        s.playersReady = 0;

        if (winningQueue === "duel") {
            s.matchPlayers = [
                { name: me.username || "You", team: 1 },
                { name: opponent, team: 2 },
            ];
        } else {
            const half = Math.floor(totalPlayers / 2);
            s.matchPlayers = [
                { name: me.username || "You", team: 1 },
                ...Array.from({ length: half - 1 }, (_, i) => ({
                    name: MOCK_OPPONENT_NAMES[i % MOCK_OPPONENT_NAMES.length],
                    team: 1 as const,
                })),
                ...Array.from({ length: half }, (_, i) => ({
                    name: MOCK_OPPONENT_NAMES[(i + half) % MOCK_OPPONENT_NAMES.length],
                    team: 2 as const,
                })),
            ];
        }

        s.status = "matchFound";
    }, 6000);
}

function handleLeaveQueue() {
    const s = matchmakingState.value;
    const idx = s.queues.indexOf(selectedQueue.value);
    if (idx !== -1) s.queues.splice(idx, 1);
    if (s.queues.length === 0) s.status = "idle";
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
    display: flex;
    padding: map.get($spacing, "xl");
}

.queue-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    gap: map.get($spacing, "sm");
}

.queue-tile-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;

    .interactive-tile {
        height: 100%;
    }
}

.queue-active-badge {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    margin-top: map.get($spacing, "xxs");
    color: #22c55e;
}

.searching-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
    flex-shrink: 0;
    animation: searching-pulse 1.4s infinite ease-in-out;
}

@keyframes searching-pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.75); }
    40%           { opacity: 1;   transform: scale(1); }
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

.mode-description {
    flex-shrink: 0;
}

.pve-queue-selector {
    flex-shrink: 0;

    .pve-options {
        max-width: 360px;
    }
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


















