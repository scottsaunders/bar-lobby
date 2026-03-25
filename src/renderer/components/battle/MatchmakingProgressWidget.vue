<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="slide-up">
        <div v-if="isVisible" class="matchmaking-widget">
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
import { computed, inject, ref, type Ref } from "vue";
import Button from "@renderer/components/controls/Button.vue";
import Progress from "@renderer/components/common/Progress.vue";
import type { MatchmakingMockState } from "./matchmaking-mock-state";

const props = defineProps<{ queueId: string }>();

const state = inject<Ref<MatchmakingMockState>>("matchmakingWidgetState")!;

const status = computed(() => state.value.status);
const playersQueued = computed(() => state.value.playersQueued);
const playersReady = computed(() => state.value.playersReady);
const totalPlayers = computed(() => state.value.totalPlayers);
const cancelReason = computed(() => state.value.cancelReason);

const isVisible = computed(() => state.value.queues.includes(props.queueId));

const isPaused = computed(() => {
    const s = state.value.status;
    return (
        (s === "matchFound" || s === "waitingForPlayers" || s === "lost" || s === "gameStarting") &&
        state.value.matchQueue !== props.queueId
    );
});

const readyProgress = computed(() => (totalPlayers.value > 0 ? playersReady.value / totalPlayers.value : 0));

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

function handleCancel() {
    if (isPaused.value || status.value === "searching") {
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
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.matchmaking-widget {
    width: 360px;
    background: rgba(8, 12, 18, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
    overflow: hidden;
}

.status-bar {
    padding: map.get($spacing, "md") map.get($spacing, "lg");
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
