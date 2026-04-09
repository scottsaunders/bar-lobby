<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="mm-slide">
        <div v-if="state.queues.length > 0" class="mm-indicator" @click="goToMatchmaking">
            <!-- Status icon -->
            <div class="mm-icon">
                <div v-if="state.status === 'matchFound'" class="state-icon match-icon">!</div>
                <div v-else-if="state.status === 'waitingForPlayers'" class="waiting-dots">
                    <span></span><span></span><span></span>
                </div>
                <div v-else-if="state.status === 'gameStarting'" class="state-icon go-icon">▶</div>
                <div v-else-if="state.status === 'lost'" class="state-icon lost-icon">✕</div>
                <div v-else-if="state.status === 'cancelled'" class="state-icon cancel-icon">–</div>
                <div v-else class="searching-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>

            <!-- Text -->
            <div class="mm-text">
                <div class="mm-queues">{{ queueNames }}</div>
                <div class="mm-status">{{ statusLine }}</div>
            </div>

            <!-- Leave button — always rendered to keep layout stable -->
            <Button
                class="red slim"
                :style="{ visibility: showLeave ? 'visible' : 'hidden' }"
                @click.stop="handleLeave"
            >
                {{ state.queues.length > 1 ? "Leave All" : "Leave" }}
            </Button>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { computed, inject, type Ref } from "vue";
import { useRouter } from "vue-router";
import Button from "@renderer/components/controls/Button.vue";
import type { MatchmakingMockState } from "@renderer/components/battle/matchmaking-mock-state";

const router = useRouter();
const stateRef = inject<Ref<MatchmakingMockState>>("matchmakingWidgetState")!;
const state = computed(() => stateRef.value);

const SHORT_LABELS: Record<string, string> = {
    duel: "Duel",
    "small-teams": "Teams",
    ffa: "FFA",
    pve: "PvE",
};

const queueNames = computed(() =>
    state.value.queues.map((q) => SHORT_LABELS[q] ?? q).join(" · ")
);

const statusLine = computed(() => {
    switch (state.value.status) {
        case "searching":         return `Searching · ${state.value.playersQueued} players`;
        case "matchFound":        return "Match found — respond now";
        case "waitingForPlayers": return `${state.value.playersReady} / ${state.value.totalPlayers} players ready`;
        case "lost":              return "A player didn't accept. Resuming...";
        case "gameStarting":      return "Game starting!";
        case "cancelled":         return "Matchmaking cancelled";
        default:                  return "";
    }
});

const showLeave = computed(() => state.value.status === "searching");

function handleLeave() {
    state.value.queues = [];
    state.value.status = "idle";
}

function goToMatchmaking() {
    router.push("/play/matchmaking");
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.mm-indicator {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: map.get($spacing, "sm");
    width: 390px;
    flex-shrink: 0;
    min-height: map.get($spacing, "xxxl"); // at least 48px, grows with wrapped text
    padding: 0 map.get($spacing, "lg");
    border-left: 1px solid rgba(255, 255, 255, 0.12);
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
    }

}

.mm-icon {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.mm-text {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xxs");
    flex: 1;
    min-width: 0;
}

.mm-queues {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.95);
}

.mm-status {
    font-size: 12px;
    font-weight: 400;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.45);
}

// Searching dots
.searching-dots,
.waiting-dots {
    display: flex;
    gap: 3px;

    span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        animation: dot-pulse 1.4s infinite ease-in-out;

        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
    }
}

.searching-dots span { background: #22c55e; }
.waiting-dots span   { background: #22c55e; }

@keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0.25; transform: scale(0.75); }
    40%           { opacity: 1;    transform: scale(1); }
}

// State icons
.state-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
}

.match-icon  { @extend .state-icon; background: #22c55e; animation: match-pulse 0.8s ease-in-out infinite alternate; }
.go-icon     { @extend .state-icon; background: #22c55e; }
.lost-icon   { @extend .state-icon; background: #ef4444; }
.cancel-icon { @extend .state-icon; background: rgba(255, 255, 255, 0.2); }

@keyframes match-pulse {
    from { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
    to   { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
}

// Slide in from right
.mm-slide-enter-active,
.mm-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.mm-slide-enter-from,
.mm-slide-leave-to {
    opacity: 0;
    transform: translateX(8px);
}
</style>
