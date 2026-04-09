<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="match-found">
        <div v-if="showOverlay" class="match-found-backdrop">
            <div class="match-found-card flex-col" :class="{ 'card-glow': status === 'matchFound' }">
                <!-- Hero -->
                <div class="hero-section flex-col flex-center gap-lg" :style="heroBgStyle">
                    <div class="hero-overlay" />
                    <div class="hero-content flex-col flex-center gap-lg">
                        <div class="status-badge" :class="heroBadgeClass">
                            <span class="badge-dot" />
                            {{ heroBadgeText }}
                            <span class="badge-dot" />
                        </div>
                        <div class="mode-name">{{ queueLabel }}</div>
                        <div v-if="status === 'lost'" class="hero-sub-message">
                            <template v-if="lostDeclinedPartyMember">
                                {{ lostDeclinedPartyMember }} (party) didn't accept &mdash; returning to queue
                            </template>
                            <template v-else>
                                A player didn't accept &mdash; returning to queue
                            </template>
                        </div>
                        <div v-if="status === 'gameStarting'" class="hero-sub-message launching">Launching game&hellip;</div>
                    </div>
                </div>

                <!-- Countdown (matchFound phase) -->
                <div v-if="status === 'matchFound'" class="info-section flex-col gap-sm">
                    <div class="flex-row flex-space-between flex-center-items">
                        <span class="body-2 section-label">Time to accept</span>
                        <span class="body-1-strong countdown-value" :class="{ urgent: countdown <= 5 }">{{ countdown }}s</span>
                    </div>
                    <Progress :percent="countdownProgress" :height="6" themed />
                </div>

                <!-- Ready progress (waitingForPlayers phase) -->
                <div v-if="status === 'waitingForPlayers'" class="info-section flex-col gap-sm">
                    <div class="flex-row flex-space-between flex-center-items">
                        <span class="body-2 section-label">Waiting for players</span>
                        <span class="body-1-strong">{{ state.playersReady }} / {{ state.totalPlayers }} ready</span>
                    </div>
                    <Progress :percent="readyProgress" :height="6" themed />

                    <!-- Party member ready status -->
                    <div v-if="partyMembersInMatch.length > 0" class="party-ready-row flex-row flex-center-items gap-sm">
                        <span class="party-ready-label">Party:</span>
                        <div class="party-ready-members flex-row gap-xs">
                            <div
                                v-for="member in partyMembersInMatch"
                                :key="member.id"
                                class="party-ready-member flex-row flex-center-items gap-xs"
                                :class="{ ready: partyMemberReady[member.id] }"
                            >
                                <div class="party-ready-avatar" :style="{ background: member.avatarColor }">
                                    {{ member.name[0] }}
                                </div>
                                <span class="party-ready-name">{{ member.name }}</span>
                                <span class="party-ready-check">{{ partyMemberReady[member.id] ? '✓' : '…' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div v-if="status === 'matchFound'" class="action-buttons flex-row gap-md">
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
import type { MatchmakingMockState } from "./matchmaking-mock-state";
import type { PartyMockState } from "@renderer/components/party/party-mock-state";
import heroBg from "@renderer/assets/images/backgrounds/BAR4K_Loadingscreen_1.jpg";

const state = inject<Ref<MatchmakingMockState>>("matchmakingWidgetState")!;
const partyState = inject<Ref<PartyMockState>>("partyState")!;

const COUNTDOWN_SECONDS = 30;
const countdown = ref(COUNTDOWN_SECONDS);
const countdownInterval = ref<number | null>(null);

const status = computed(() => state.value.status);
const showOverlay = computed(() =>
    status.value === "matchFound" ||
    status.value === "waitingForPlayers" ||
    status.value === "lost" ||
    status.value === "gameStarting"
);

const heroBadgeText = computed(() => {
    if (status.value === "waitingForPlayers") return "MATCH ACCEPTED";
    if (status.value === "lost") return "MATCH CANCELLED";
    if (status.value === "gameStarting") return "GAME STARTING";
    return "MATCH FOUND";
});

const heroBadgeClass = computed(() => ({
    accepted: status.value === "waitingForPlayers",
    lost: status.value === "lost",
    launching: status.value === "gameStarting",
}));

const queueLabel = computed(() => {
    const labels: Record<string, string> = {
        duel: "Ranked Duel",
        "small-teams": "Small Teams",
        ffa: "Free For All",
        pve: "Co-op PvE",
    };
    return labels[state.value.matchQueue] ?? state.value.matchQueue;
});

const heroBgStyle = `background-image: url('${heroBg}');`;

const countdownProgress = computed(() => (COUNTDOWN_SECONDS - countdown.value) / COUNTDOWN_SECONDS);
const readyProgress = computed(() =>
    state.value.totalPlayers > 0 ? state.value.playersReady / state.value.totalPlayers : 0
);

watch(
    () => status.value,
    (s) => {
        if (s === "matchFound") {
            countdown.value = COUNTDOWN_SECONDS;
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

const hasShownLost = ref(false);

// Party-aware ready tracking: map memberId → accepted
const partyMemberReady = ref<Record<string, boolean>>({});
const lostDeclinedPartyMember = ref<string | null>(null);

const partyMembersInMatch = computed(() => {
    if (!partyState.value.inParty) return [];
    return partyState.value.members.filter((m) => !m.isMe && m.status !== "offline");
});

function handleAccept() {
    clearCountdown();
    state.value.status = "waitingForPlayers";
    state.value.playersReady = 1;
    lostDeclinedPartyMember.value = null;

    // Simulate party members accepting one by one
    partyMemberReady.value = {};
    partyMembersInMatch.value.forEach((m, i) => {
        setTimeout(() => {
            partyMemberReady.value[m.id] = true;
        }, 400 + i * 350);
    });

    setTimeout(() => {
        state.value.playersReady = state.value.totalPlayers;

        if (!hasShownLost.value) {
            hasShownLost.value = true;
            // Pick a party member as the "decliner" for the demo, or generic if no party
            const decliner = partyMembersInMatch.value[0];
            lostDeclinedPartyMember.value = decliner?.name ?? null;
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
    state.value.queues = [state.value.matchQueue];
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
    display: flex;
    align-items: center;
    justify-content: center;
}

.match-found-card {
    width: 460px;
    background: rgba(10, 14, 20, 0.97);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.8);
    transition: box-shadow 0.4s ease;

    &.card-glow {
        box-shadow:
            0 8px 40px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(34, 197, 94, 0.35),
            0 0 40px rgba(34, 197, 94, 0.08);
    }
}


.hero-section {
    position: relative;
    height: 200px;
    background-size: cover;
    background-position: center 30%;
    flex-shrink: 0;
}

.hero-overlay {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to bottom, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(10, 14, 20, 0.92) 100%);
}

.hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: map.get($spacing, "sm");
    padding: map.get($spacing, "xxs") map.get($spacing, "md");
    border-radius: 999px;
    border: 1px solid rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.08);
    color: #22c55e;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    animation: badge-pulse 2s ease-in-out infinite;

    &.accepted {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.8);
        animation: none;
    }

    &.lost {
        border-color: rgba(251, 146, 60, 0.5);
        background: rgba(251, 146, 60, 0.08);
        color: #fb923c;
        animation: none;
    }

    &.launching {
        border-color: rgba(34, 197, 94, 0.7);
        background: rgba(34, 197, 94, 0.12);
        color: #22c55e;
        animation: badge-pulse-fast 1s ease-in-out infinite;
    }
}

.hero-sub-message {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.02em;

    &.launching {
        color: rgba(34, 197, 94, 0.7);
    }
}

.badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
}

.mode-name {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.95);
    text-transform: uppercase;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
}

.info-section {
    padding: map.get($spacing, "md") map.get($spacing, "xl");
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.section-label {
    color: rgba(255, 255, 255, 0.55);
}

.countdown-value {
    color: rgba(255, 255, 255, 0.9);
    transition: color 0.3s;

    &.urgent {
        color: #ef4444;
        animation: pulse-urgent 0.5s ease-in-out infinite alternate;
    }
}

.action-buttons {
    padding: map.get($spacing, "lg") map.get($spacing, "xl");
    flex-shrink: 0;
}

@keyframes badge-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}

@keyframes badge-pulse-fast {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
    50%       { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}

@keyframes pulse-urgent {
    from { opacity: 0.7; }
    to   { opacity: 1; }
}

.party-ready-row {
    padding-top: map.get($spacing, "xs");
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.party-ready-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
}

.party-ready-members {
    flex-wrap: wrap;
}

.party-ready-member {
    padding: 2px map.get($spacing, "xs");
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.3s ease;

    &.ready {
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.06);
    }
}

.party-ready-avatar {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 8px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.party-ready-name {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
}

.party-ready-check {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.3);

    .ready & {
        color: #22c55e;
    }
}

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
