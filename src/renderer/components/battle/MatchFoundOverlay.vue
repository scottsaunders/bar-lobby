<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="match-found">
        <div v-if="status === 'matchFound'" class="match-found-backdrop flex-center">
            <div class="match-found-card flex-col">
                <!-- Map Preview -->
                <div class="map-preview" :style="mapBgStyle">
                    <div class="map-preview-overlay flex-col gap-xs">
                        <div class="found-label caption-1-stronger">MATCH FOUND</div>
                        <div class="map-name title-1">{{ state.matchMap || "Unknown Map" }}</div>
                        <div class="queue-label body-2">{{ queueLabel }}</div>
                    </div>
                </div>

                <!-- Players -->
                <div class="players-section flex-row flex-center-items padding-xl gap-xl">
                    <!-- Team 1 -->
                    <div class="team team-left flex-col gap-sm flex-grow">
                        <div
                            v-for="player in team1"
                            :key="player.name"
                            class="player-entry flex-row gap-sm flex-center-items"
                        >
                            <div class="player-avatar team1-color"></div>
                            <span class="body-1-strong">{{ player.name }}</span>
                        </div>
                    </div>

                    <div class="vs-divider flex-col flex-center">
                        <span class="vs-text">VS</span>
                    </div>

                    <!-- Team 2 -->
                    <div class="team team-right flex-col gap-sm flex-grow flex-align-end">
                        <div
                            v-for="player in team2"
                            :key="player.name"
                            class="player-entry flex-row gap-sm flex-center-items"
                        >
                            <span class="body-1-strong">{{ player.name }}</span>
                            <div class="player-avatar team2-color"></div>
                        </div>
                    </div>
                </div>

                <!-- Countdown -->
                <div class="countdown-section flex-col gap-sm padding-left-xl padding-right-xl">
                    <div class="flex-row flex-space-between flex-center-items">
                        <span class="body-2 countdown-label">Time to accept</span>
                        <span class="body-1-strong countdown-value" :class="{ urgent: countdown <= 5 }">{{ countdown }}s</span>
                    </div>
                    <Progress :percent="countdownProgress" :height="6" themed />
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons flex-row gap-md padding-xl">
                    <Button class="red large flex-grow" @click="handleDecline">Decline</Button>
                    <Button class="green large flex-grow" @click="handleAccept">Accept</Button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { computed, inject, onUnmounted, ref, type Ref, watch } from "vue";
import Progress from "@renderer/components/common/Progress.vue";
import Button from "@renderer/components/controls/Button.vue";
import { me } from "@renderer/store/me.store";
import { db } from "@renderer/store/db";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import type { MatchmakingMockState } from "./matchmaking-mock-state";

const state = inject<Ref<MatchmakingMockState>>("matchmakingWidgetState")!;
const cache = useImageBlobUrlCache();

const COUNTDOWN_SECONDS = 30;
const countdown = ref(COUNTDOWN_SECONDS);
const countdownInterval = ref<number | null>(null);
const mapImageUrl = ref<string | null>(null);
const hasShownLost = ref(false);

const status = computed(() => state.value.status);

const team1 = computed(() => state.value.matchPlayers.filter((p) => p.team === 1));
const team2 = computed(() => state.value.matchPlayers.filter((p) => p.team === 2));

const queueLabel = computed(() => {
    const labels: Record<string, string> = {
        duel: "Ranked Duel",
        "small-teams": "Small Teams",
        ffa: "Free For All",
        pve: "Co-op PvE",
    };
    return labels[state.value.matchQueue] ?? state.value.matchQueue;
});

const countdownProgress = computed(() => (COUNTDOWN_SECONDS - countdown.value) / COUNTDOWN_SECONDS);

const mapBgStyle = computed(() => {
    if (mapImageUrl.value) {
        return `background-image: url('${mapImageUrl.value}');`;
    }
    return "background-image: url('/src/renderer/assets/images/backgrounds/5.jpg');";
});

async function loadMapImage() {
    const springName = state.value.matchMap;
    if (!springName) return;
    try {
        let map = await db.maps.get(springName);
        if (!map) map = await db.nonLiveMaps.get(springName);
        if (map?.imagesBlob?.preview) {
            mapImageUrl.value = cache.get(springName, map.imagesBlob.preview);
        }
    } catch {
        // fallback to default background
    }
}

watch(
    () => status.value,
    (s) => {
        if (s === "matchFound") {
            countdown.value = COUNTDOWN_SECONDS;
            loadMapImage();
            countdownInterval.value = window.setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    clearCountdown();
                    triggerCancelled("ready_timeout");
                }
            }, 1000);
        } else {
            clearCountdown();
        }
    }
);

function clearCountdown() {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
    }
}

function handleAccept() {
    clearCountdown();
    state.value.status = "waitingForPlayers";
    state.value.playersReady = 1;

    // Simulate the other player(s) accepting after a short delay
    setTimeout(() => {
        state.value.playersReady = state.value.totalPlayers;

        if (!hasShownLost.value) {
            // First accept: simulate a "lost" event (someone dropped) to show that flow
            hasShownLost.value = true;
            setTimeout(() => {
                state.value.status = "lost";
                // Resume searching after showing the lost message
                setTimeout(() => {
                    state.value.status = "searching";
                    state.value.playersReady = 0;
                    // Find another match shortly after
                    setTimeout(() => {
                        triggerMatchFound();
                    }, 4000);
                }, 2500);
            }, 1500);
        } else {
            // Second accept: all ready, game starts
            setTimeout(() => {
                state.value.status = "gameStarting";
                setTimeout(() => {
                    state.value.status = "idle";
                    state.value.playersReady = 0;
                    hasShownLost.value = false;
                }, 2500);
            }, 1000);
        }
    }, 2500);
}

function handleDecline() {
    clearCountdown();
    triggerCancelled("intentional");
}

function triggerCancelled(reason: MatchmakingMockState["cancelReason"]) {
    state.value.status = "cancelled";
    state.value.cancelReason = reason;
    state.value.playersReady = 0;
    setTimeout(() => {
        state.value.status = "idle";
        state.value.cancelReason = null;
    }, 3000);
}

function triggerMatchFound() {
    const queueMaps: Record<string, string[]> = {
        duel: ["Red Comet Remake 1.8", "Supreme Crossing v1", "Twin Lakes Park Redux 1.2.2"],
        "small-teams": ["Ghenna Rising 4.0.1", "Koom Valley 3 3.1", "Sand Crowns 1.0"],
        ffa: ["All That Glitters v2.2", "Angel Crossing 1.5.1", "Avalanche 3.4"],
        pve: ["Carrot Mountains v2.0", "Centerrock Remake 1.2", "Claymore 3.0.3"],
    };
    const maps = queueMaps[state.value.matchQueue] ?? queueMaps["duel"];
    state.value.matchMap = maps[Math.floor(Math.random() * maps.length)];
    state.value.status = "matchFound";
}

onUnmounted(() => {
    clearCountdown();
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.match-found-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
}

.match-found-card {
    width: 580px;
    background: rgba(10, 14, 20, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(34, 197, 94, 0.2);
}

.map-preview {
    height: 200px;
    position: relative;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    flex-shrink: 0;
}

.map-preview-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 14, 20, 0.95) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
    padding: map.get($spacing, "xl");
    justify-content: flex-end;
}

.found-label {
    color: #22c55e;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.map-name {
    color: rgba(255, 255, 255, 0.95);
}

.queue-label {
    color: rgba(255, 255, 255, 0.6);
}

.players-section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.team {
    min-width: 0;
}

.player-entry {
    min-width: 0;
}

.player-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
}

.team1-color {
    background: rgba(37, 99, 235, 0.8);
    border: 1px solid rgba(37, 99, 235, 1);
}

.team2-color {
    background: rgba(220, 38, 38, 0.8);
    border: 1px solid rgba(220, 38, 38, 1);
}

.vs-divider {
    padding: 0 map.get($spacing, "sm");
}

.vs-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 0.05em;
}

.countdown-section {
    padding-top: map.get($spacing, "md");
    padding-bottom: map.get($spacing, "md");
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.countdown-label {
    color: rgba(255, 255, 255, 0.6);
}

.countdown-value {
    color: rgba(255, 255, 255, 0.9);
    transition: color 0.3s;

    &.urgent {
        color: #ef4444;
        animation: pulse-urgent 0.5s ease-in-out infinite alternate;
    }
}

@keyframes pulse-urgent {
    from {
        opacity: 0.7;
    }
    to {
        opacity: 1;
    }
}

.action-buttons {
    flex-shrink: 0;
}

// Transition
.match-found-enter-active,
.match-found-leave-active {
    transition: all 0.25s ease-out;
    .match-found-card {
        transition: all 0.25s ease-out;
    }
}

.match-found-enter-from,
.match-found-leave-to {
    opacity: 0;
    .match-found-card {
        transform: scale(0.95) translateY(-12px);
    }
}
</style>
