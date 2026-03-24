<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="slide-up">
        <div v-if="isVisible" class="matchmaking-widget">
            <!-- Match Found expansion — only on the queue that found the match -->
            <Transition name="expand-down">
                <div v-if="status === 'matchFound' && !isPaused" class="match-found-body flex-col">
                    <!-- Map Preview -->
                    <div class="map-preview" :style="mapBgStyle">
                        <div class="map-preview-overlay flex-col gap-xs">
                            <div class="found-label caption-1-stronger">MATCH FOUND</div>
                            <div class="map-name title-2">{{ state.matchMap || "Unknown Map" }}</div>
                            <div class="queue-label body-2">{{ queueLabel }}</div>
                        </div>
                    </div>

                    <!-- Players -->
                    <div class="players-row flex-row flex-center-items padding-md gap-xl">
                        <div class="team flex-col gap-xs flex-grow">
                            <div v-for="p in team1" :key="p.name" class="player-entry flex-row gap-sm flex-center-items">
                                <div class="player-dot team1-dot"></div>
                                <span class="body-1-strong">{{ p.name }}</span>
                            </div>
                        </div>
                        <div class="vs-label body-2" style="color: rgba(255,255,255,0.35)">VS</div>
                        <div class="team flex-col gap-xs flex-grow flex-align-end">
                            <div v-for="p in team2" :key="p.name" class="player-entry flex-row gap-sm flex-center-items">
                                <span class="body-1-strong">{{ p.name }}</span>
                                <div class="player-dot team2-dot"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Countdown -->
                    <div class="countdown-row flex-col gap-xs padding-left-md padding-right-md padding-bottom-md">
                        <div class="flex-row flex-space-between flex-center-items">
                            <span class="body-2" style="color: rgba(255,255,255,0.6)">Time to accept</span>
                            <span class="body-1-strong countdown-value" :class="{ urgent: countdown <= 5 }">{{ countdown }}s</span>
                        </div>
                        <Progress :percent="countdownProgress" :height="5" themed />
                    </div>

                    <!-- Accept / Decline -->
                    <div class="match-actions flex-row gap-sm padding-left-md padding-right-md padding-bottom-md">
                        <Button class="red flex-grow" @click="handleDecline">Decline</Button>
                        <Button class="green flex-grow" @click="handleAccept">Accept</Button>
                    </div>
                </div>
            </Transition>

            <!-- Status Bar (always visible while widget is open) -->
            <div class="status-bar flex-row gap-md flex-center-items">
                <!-- Indicator -->
                <div class="status-indicator">
                    <div v-if="isPaused" class="state-icon pause-icon caption-1-stronger">⏸</div>
                    <div v-else-if="status === 'searching'" class="searching-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <div v-else-if="status === 'waitingForPlayers'" class="waiting-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <div v-else-if="status === 'matchFound'" class="match-icon caption-1-stronger">!</div>
                    <div v-else-if="status === 'lost'" class="state-icon lost-icon caption-1-stronger">✕</div>
                    <div v-else-if="status === 'gameStarting'" class="state-icon go-icon caption-1-stronger">▶</div>
                    <div v-else-if="status === 'cancelled'" class="state-icon cancel-icon caption-1-stronger">–</div>
                </div>

                <!-- Text -->
                <div class="status-text-section flex-col gap-xxs flex-grow">
                    <div class="body-1-strong status-text">{{ displayStatusText }}</div>

                    <div v-if="status === 'searching' && playersQueued" class="body-2 sub-text">
                        {{ playersQueued }} players in queue
                    </div>
                    <div v-if="status === 'waitingForPlayers'" class="flex-col gap-xxs">
                        <div class="body-2 sub-text">{{ playersReady }}/{{ totalPlayers }} players ready</div>
                        <Progress :percent="readyProgress" :height="3" themed />
                    </div>
                    <div v-if="status === 'cancelled' && cancelReason" class="body-2 sub-text">
                        {{ cancelReasonLabel }}
                    </div>
                </div>

                <!-- Action Button -->
                <Button v-if="showCancelButton" class="red" @click="handleCancel">
                    {{ cancelButtonLabel }}
                </Button>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { computed, inject, onUnmounted, ref, type Ref, watch } from "vue";
import Button from "@renderer/components/controls/Button.vue";
import Progress from "@renderer/components/common/Progress.vue";
import { db } from "@renderer/store/db";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import type { MatchmakingMockState } from "./matchmaking-mock-state";

const props = defineProps<{ queueId: string }>();

const state = inject<Ref<MatchmakingMockState>>("matchmakingWidgetState")!;
const cache = useImageBlobUrlCache();

const COUNTDOWN_SECONDS = 30;
const countdown = ref(COUNTDOWN_SECONDS);
const countdownInterval = ref<number | null>(null);
const mapImageUrl = ref<string | null>(null);
const hasShownLost = ref(false);

const status = computed(() => state.value.status);
const playersQueued = computed(() => state.value.playersQueued);
const playersReady = computed(() => state.value.playersReady);
const totalPlayers = computed(() => state.value.totalPlayers);
const cancelReason = computed(() => state.value.cancelReason);

// This widget is visible whenever its queue is in the active queues array
const isVisible = computed(() => state.value.queues.includes(props.queueId));

// Paused: another queue found a match, this one is waiting
const isPaused = computed(() => {
    const s = state.value.status;
    return (s === "matchFound" || s === "waitingForPlayers" || s === "lost" || s === "gameStarting")
        && state.value.matchQueue !== props.queueId;
});

const team1 = computed(() => state.value.matchPlayers.filter((p) => p.team === 1));
const team2 = computed(() => state.value.matchPlayers.filter((p) => p.team === 2));

const readyProgress = computed(() => (totalPlayers.value > 0 ? playersReady.value / totalPlayers.value : 0));
const countdownProgress = computed(() => (COUNTDOWN_SECONDS - countdown.value) / COUNTDOWN_SECONDS);

const queueLabel = computed(() => {
    const labels: Record<string, string> = {
        duel: "Ranked Duel",
        "small-teams": "Small Teams",
        ffa: "Free For All",
        pve: "Co-op PvE",
    };
    return labels[state.value.matchQueue] ?? state.value.matchQueue;
});

const statusText = computed(() => {
    switch (status.value) {
        case "searching":         return "Searching for match...";
        case "matchFound":        return "Match found — respond now";
        case "waitingForPlayers": return "Waiting for all players...";
        case "lost":              return "A player didn't accept. Resuming search...";
        case "gameStarting":      return "Game starting!";
        case "cancelled":         return "Matchmaking cancelled";
        default:                  return "";
    }
});

const displayStatusText = computed(() => {
    if (isPaused.value) return `Paused · match found in ${queueLabel.value}`;
    return statusText.value;
});

const cancelReasonLabel = computed(() => {
    switch (cancelReason.value) {
        case "intentional":       return "You left the queue.";
        case "server_error":      return "Server error — you may retry.";
        case "party_user_left":   return "A party member left the queue.";
        case "ready_timeout":     return "You didn't accept in time.";
        default:                  return "";
    }
});

const showCancelButton = computed(() => isPaused.value || status.value === "searching" || status.value === "waitingForPlayers");
const cancelButtonLabel = computed(() => {
    if (status.value === "waitingForPlayers") return "Cancel";
    return "Leave Queue";
});

const mapBgStyle = computed(() => {
    if (mapImageUrl.value) return `background-image: url('${mapImageUrl.value}');`;
    return "background-image: url('/src/renderer/assets/images/backgrounds/5.jpg');";
});

async function loadMapImage() {
    const springName = state.value.matchMap;
    if (!springName) return;
    mapImageUrl.value = null;
    try {
        let map = await db.maps.get(springName);
        if (!map) map = await db.nonLiveMaps.get(springName);
        if (map?.imagesBlob?.preview) {
            mapImageUrl.value = cache.get(springName, map.imagesBlob.preview);
        }
    } catch {
        // use fallback background
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

    setTimeout(() => {
        state.value.playersReady = state.value.totalPlayers;

        if (!hasShownLost.value) {
            hasShownLost.value = true;
            setTimeout(() => {
                state.value.status = "lost";
                setTimeout(() => {
                    state.value.status = "searching";
                    state.value.playersReady = 0;
                    setTimeout(() => triggerMatchFound(), 4000);
                }, 2500);
            }, 1500);
        } else {
            setTimeout(() => {
                state.value.status = "gameStarting";
                setTimeout(() => {
                    state.value.status = "idle";
                    state.value.queues = [];
                    state.value.playersReady = 0;
                    hasShownLost.value = false;
                }, 2500);
            }, 1000);
        }
    }, 2500);
}

function handleDecline() {
    clearCountdown();
    // Keep only this queue visible for the cancelled message; others disappear
    state.value.queues = [props.queueId];
    triggerCancelled("intentional");
}

function handleCancel() {
    if (isPaused.value || status.value === "searching") {
        // Just leave this specific queue silently
        const idx = state.value.queues.indexOf(props.queueId);
        if (idx !== -1) state.value.queues.splice(idx, 1);
        if (state.value.queues.length === 0) state.value.status = "idle";
        return;
    }
    // waitingForPlayers — cancel the whole match flow
    state.value.queues = [props.queueId];
    triggerCancelled("intentional");
}

function triggerCancelled(reason: MatchmakingMockState["cancelReason"]) {
    state.value.status = "cancelled";
    state.value.cancelReason = reason;
    state.value.playersReady = 0;
    setTimeout(() => {
        state.value.status = "idle";
        state.value.queues = [];
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

onUnmounted(() => clearCountdown());
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.matchmaking-widget {
    width: 500px;
    background: rgba(8, 12, 18, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
    overflow: hidden;
}

// Status bar
.status-bar {
    padding: map.get($spacing, "md") map.get($spacing, "lg");
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.status-indicator {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.status-text {
    color: rgba(255, 255, 255, 0.95);
}

.sub-text {
    color: rgba(255, 255, 255, 0.55);
}

.status-text-section {
    min-width: 0;
    flex: 1;
}

// Dot animations
.searching-dots,
.waiting-dots {
    display: flex;
    gap: 4px;

    span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        animation: dot-pulse 1.4s infinite ease-in-out;

        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
    }
}

.searching-dots span {
    background: rgba(255, 255, 255, 0.6);
}

.waiting-dots span {
    background: #22c55e;
}

@keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0.25; transform: scale(0.75); }
    40%           { opacity: 1;    transform: scale(1); }
}

// State icons
.state-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.match-icon {
    @extend .state-icon;
    background: #22c55e;
    animation: match-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes match-pulse {
    from { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    to   { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}

.lost-icon   { @extend .state-icon; background: #ef4444; }
.go-icon     { @extend .state-icon; background: #22c55e; }
.cancel-icon { @extend .state-icon; background: rgba(255, 255, 255, 0.25); }
.pause-icon  { @extend .state-icon; background: rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.6); font-size: 10px; }

// Match found body
.match-found-body {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.map-preview {
    height: 160px;
    position: relative;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    flex-shrink: 0;
}

.map-preview-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(8, 12, 18, 0.95) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
    padding: map.get($spacing, "md");
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
    color: rgba(255, 255, 255, 0.55);
}

// Players
.players-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.player-entry {
    min-width: 0;
}

.player-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.team1-dot { background: rgb(37, 99, 235); }
.team2-dot { background: rgb(220, 38, 38); }

// Countdown
.countdown-value {
    color: rgba(255, 255, 255, 0.9);

    &.urgent {
        color: #ef4444;
        animation: urgent-pulse 0.5s ease-in-out infinite alternate;
    }
}

@keyframes urgent-pulse {
    from { opacity: 0.6; }
    to   { opacity: 1; }
}

// Match found expand transition
.expand-down-enter-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.expand-down-leave-active {
    transition: all 0.2s ease-in;
    overflow: hidden;
}

.expand-down-enter-from {
    max-height: 0;
    opacity: 0;
}

.expand-down-enter-to {
    max-height: 600px;
    opacity: 1;
}

.expand-down-leave-from {
    max-height: 600px;
    opacity: 1;
}

.expand-down-leave-to {
    max-height: 0;
    opacity: 0;
}

// Widget slide up
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(calc(100% + map.get($spacing, "xl")));
    opacity: 0;
}
</style>
