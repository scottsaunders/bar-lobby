<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div
        class="friend-card flex-col"
        :class="{ 'in-party': inParty, offline }"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false; contextOpen = false"
    >
        <!-- ── Top row: avatar · name · hover actions ──────────────── -->
        <div class="card-top flex-row flex-center-items gap-sm">
            <div class="avatar-wrap flex-shrink-0">
                <div class="avatar" :style="{ background: friend.avatarColor }">
                    {{ friend.name[0].toUpperCase() }}
                </div>
                <div class="status-dot" :class="statusDotClass" />
            </div>

            <div class="friend-info flex-col flex-grow min-w-0">
                <div class="flex-row flex-center-items gap-xs">
                    <span class="friend-name">{{ friend.name }}</span>
                    <span v-if="inParty" class="party-tag">In Party</span>
                </div>
                <span class="friend-activity">{{ activityLabel }}</span>
            </div>

            <!-- Hover actions — simplified when game card is shown -->
            <Transition name="fade-actions">
                <div v-show="hovered || contextOpen" class="actions flex-row flex-center-items gap-xs">
                    <!-- Invite (only when no game card handles it) -->
                    <button
                        v-if="!hasGameInfo && !offline && !inParty"
                        class="action-btn invite-btn"
                        title="Invite to Party"
                        @click.stop="$emit('invite')"
                    >
                        <Icon :icon="partyIcon" :width="14" :height="14" />
                        Invite
                    </button>

                    <!-- Message -->
                    <button class="action-btn msg-btn" title="Message" @click.stop="$emit('message')">
                        <Icon :icon="messageIcon" :width="14" :height="14" />
                    </button>

                    <!-- More (⋮) -->
                    <div class="ctx-wrap">
                        <button class="action-btn more-btn" title="More options" @click.stop="toggleContext">
                            <Icon :icon="dotsIcon" :width="14" :height="14" />
                        </button>
                        <Transition name="ctx-pop">
                            <div v-if="contextOpen" v-click-away="closeContext" class="context-menu">
                                <button class="ctx-item" @click="emit('view-profile'); closeContext()">
                                    <Icon :icon="profileIcon" :width="13" :height="13" />
                                    View Profile
                                </button>
                                <button v-if="!offline && !inParty" class="ctx-item" @click="emit('invite'); closeContext()">
                                    <Icon :icon="partyIcon" :width="13" :height="13" />
                                    Invite to Party
                                </button>
                                <button v-if="hasGameInfo && friend.currentGame?.spectatable" class="ctx-item" @click="emit('spectate'); closeContext()">
                                    <Icon :icon="spectateIcon" :width="13" :height="13" />
                                    Spectate
                                </button>
                                <div class="ctx-sep" />
                                <button class="ctx-item danger" @click="emit('block'); closeContext()">
                                    <Icon :icon="blockIcon" :width="13" :height="13" />
                                    Block
                                </button>
                                <button class="ctx-item danger" @click="emit('unfriend'); closeContext()">
                                    <Icon :icon="unfriendIcon" :width="13" :height="13" />
                                    Unfriend
                                </button>
                            </div>
                        </Transition>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- ── Game info card ──────────────────────────────────────── -->
        <div v-if="hasGameInfo" class="game-card flex-row gap-sm">
            <!-- Map thumbnail -->
            <div class="map-thumb flex-shrink-0" :style="mapThumbStyle">
                <div class="map-grid-overlay" />
                <span class="map-abbr">{{ mapAbbr }}</span>
            </div>

            <!-- Details -->
            <div class="game-details flex-col flex-grow min-w-0">
                <span class="game-lobby-name">{{ friend.currentGame!.name }}</span>
                <span class="game-map-name">
                    <Icon :icon="mapIcon" :width="11" :height="11" class="detail-icon" />
                    {{ friend.currentGame!.mapName }}
                </span>
                <div class="game-meta flex-row flex-center-items gap-md">
                    <span v-if="friend.currentGame!.playerCount != null" class="meta-item">
                        <Icon :icon="playersIcon" :width="11" :height="11" class="detail-icon" />
                        {{ friend.currentGame!.playerCount }}/{{ friend.currentGame!.maxPlayers }}
                    </span>
                    <span v-if="elapsedLabel" class="meta-item">
                        <Icon :icon="clockIcon" :width="11" :height="11" class="detail-icon" />
                        {{ elapsedLabel }}
                    </span>
                </div>
                <div class="game-actions flex-row gap-xs">
                    <button
                        v-if="friend.currentGame!.lobbyId"
                        class="game-btn join-btn"
                        @click.stop="$emit('join-lobby')"
                    >
                        <Icon :icon="doorIcon" :width="12" :height="12" />
                        Join Lobby
                    </button>
                    <button
                        v-if="friend.currentGame!.spectatable"
                        class="game-btn spectate-btn"
                        @click.stop="$emit('spectate')"
                    >
                        <Icon :icon="spectateIcon" :width="12" :height="12" />
                        Spectate
                    </button>
                    <button
                        v-if="!inParty && !friend.currentGame!.lobbyId"
                        class="game-btn invite-btn"
                        @click.stop="$emit('invite')"
                    >
                        <Icon :icon="partyIcon" :width="12" :height="12" />
                        Invite
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import doorIcon from "@iconify-icons/mdi/door-open";
import partyIcon from "@iconify-icons/mdi/account-multiple-plus";
import messageIcon from "@iconify-icons/mdi/chat";
import dotsIcon from "@iconify-icons/mdi/dots-vertical";
import profileIcon from "@iconify-icons/mdi/account";
import blockIcon from "@iconify-icons/mdi/cancel";
import unfriendIcon from "@iconify-icons/mdi/account-remove";
import spectateIcon from "@iconify-icons/mdi/eye";
import mapIcon from "@iconify-icons/mdi/map";
import playersIcon from "@iconify-icons/mdi/account-group";
import clockIcon from "@iconify-icons/mdi/clock-outline";
import type { PartyMember } from "@renderer/components/party/party-mock-state";

const props = defineProps<{
    friend: PartyMember;
    inParty: boolean;
    offline?: boolean;
}>();

const emit = defineEmits<{
    (e: "invite"): void;
    (e: "join-lobby"): void;
    (e: "spectate"): void;
    (e: "message"): void;
    (e: "view-profile"): void;
    (e: "block"): void;
    (e: "unfriend"): void;
}>();

// ── Hover / context ────────────────────────────────────────────────────────

const hovered = ref(false);
const contextOpen = ref(false);

function toggleContext() {
    if (contextOpen.value) {
        contextOpen.value = false;
    } else {
        nextTick(() => { contextOpen.value = true; });
    }
}

function closeContext() {
    contextOpen.value = false;
}

// ── Status ─────────────────────────────────────────────────────────────────

const statusDotClass = computed(() => {
    if (props.offline) return "dot-offline";
    if (props.friend.status === "in-queue") return "dot-queue";
    if (props.friend.status === "in-game") return "dot-ingame";
    return "dot-online";
});

const activityLabel = computed(() => {
    if (props.offline) return "Offline";
    if (props.inParty) return "In your party";
    const game = props.friend.currentGame;
    if (!game) return "Online";
    const labels: Record<string, string> = {
        "custom-lobby": "In Lobby",
        "ranked":        "In Ranked Match",
        "skirmish":      "Skirmish vs AI",
        "scenario":      "Playing Scenario",
        "campaign":      "Playing Campaign",
    };
    return labels[game.type] ?? "In Game";
});

// ── Game info card ─────────────────────────────────────────────────────────

const hasGameInfo = computed(() => {
    const g = props.friend.currentGame;
    return !props.offline && !!g?.mapName;
});

// Elapsed time ticker
const now = ref(Date.now());
let ticker: ReturnType<typeof setInterval> | undefined;

onMounted(() => { ticker = setInterval(() => { now.value = Date.now(); }, 1000); });
onUnmounted(() => { clearInterval(ticker); });

const elapsedLabel = computed(() => {
    const t = props.friend.currentGame?.startedAt;
    if (!t) return null;
    const total = Math.floor((now.value - t) / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
});

// Map thumbnail (deterministic CSS gradient from map name)
const MAP_PALETTES = [
    ["#1e4878", "#2d6db5"],   // ocean blue
    ["#1a4d2a", "#2a7a45"],   // forest green
    ["#4a2a0f", "#8c4e22"],   // desert orange
    ["#2d1a50", "#5a2a9e"],   // deep purple
    ["#2a4015", "#4e7a22"],   // jungle green
    ["#4a2222", "#7a3333"],   // volcanic red
];

const mapThumbStyle = computed(() => {
    const mapName = props.friend.currentGame?.mapName ?? "";
    let hash = 0;
    for (const c of mapName) hash = ((hash * 31) + c.charCodeAt(0)) & 0xffff;
    const [dark, light] = MAP_PALETTES[hash % MAP_PALETTES.length];
    return { background: `linear-gradient(135deg, ${dark} 0%, ${light} 100%)` };
});

const mapAbbr = computed(() => {
    return (props.friend.currentGame?.mapName ?? "")
        .split(" ")
        .slice(0, 3)
        .map((w) => w[0] ?? "")
        .join("")
        .toUpperCase();
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

// ── Card shell ────────────────────────────────────────────────────────────

.friend-card {
    padding: map.get($spacing, "sm");
    border-radius: 6px;
    border: 1px solid transparent;
    transition: background 0.1s ease, border-color 0.1s ease;
    position: relative;
    margin-bottom: 2px;
    gap: map.get($spacing, "sm");

    &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.07);
    }

    &.in-party {
        border-color: rgba(34, 197, 94, 0.2);
        background: rgba(34, 197, 94, 0.04);
        &:hover { background: rgba(34, 197, 94, 0.07); border-color: rgba(34, 197, 94, 0.3); }
    }

    &.offline { opacity: 0.5; }
}

.card-top {
    align-items: center;
}

// ── Avatar ────────────────────────────────────────────────────────────────

.avatar-wrap {
    position: relative;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
}

.avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
}

.status-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid rgba(10, 14, 20, 0.95);

    &.dot-online  { background: #22c55e; }
    &.dot-ingame  { background: #f59e0b; }
    &.dot-queue   { background: #38bdf8; }
    &.dot-offline { background: rgba(255, 255, 255, 0.18); }
}

// ── Friend info ───────────────────────────────────────────────────────────

.friend-info {
    gap: map.get($spacing, "xxs");
    min-width: 0;
    overflow: hidden;
}

.friend-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.friend-activity {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.38);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.party-tag {
    font-size: 10px;
    font-weight: 700;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: 3px;
    padding: 1px 5px;
    flex-shrink: 0;
    letter-spacing: 0.04em;
}

// ── Hover action buttons ──────────────────────────────────────────────────

.actions { flex-shrink: 0; }

.action-btn {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.65);
    font-size: 12px;
    cursor: pointer;
    transition: background 0.1s ease, color 0.1s ease;
    white-space: nowrap;

    &:hover {
        background: rgba(255, 255, 255, 0.11);
        color: rgba(255, 255, 255, 0.9);
        border-color: rgba(255, 255, 255, 0.18);
    }

    &.invite-btn {
        border-color: rgba(34, 197, 94, 0.28);
        color: #4ade80;
        background: rgba(34, 197, 94, 0.07);
        &:hover { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.45); }
    }

    &.msg-btn, &.more-btn { padding: map.get($spacing, "xs"); }
}

// ── Context menu ──────────────────────────────────────────────────────────

.ctx-wrap { position: relative; }

.context-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    z-index: 200;
    min-width: 170px;
    background: rgba(8, 12, 20, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 6px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.8);
    padding: map.get($spacing, "xxs") 0;
    overflow: hidden;
}

.ctx-item {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "sm");
    width: 100%;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s ease;

    &:hover { background: rgba(255, 255, 255, 0.08); }
    &.danger { color: rgba(239, 68, 68, 0.75); }
    &.danger:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; }
}

.ctx-sep {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: map.get($spacing, "xxs") 0;
}

// ── Game info card ────────────────────────────────────────────────────────

.game-card {
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.3);
    padding: map.get($spacing, "sm");
    gap: map.get($spacing, "sm");
    align-items: flex-start;
}

// Map thumbnail
.map-thumb {
    width: 80px;
    min-width: 80px;
    height: 56px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.map-grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 12px 12px;
}

.map-abbr {
    position: relative;
    z-index: 1;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
}

// Game details
.game-details {
    gap: map.get($spacing, "xxs");
    min-width: 0;
    overflow: hidden;
}

.game-lobby-name {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.game-map-name {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    line-height: 1.3;
}

.game-meta {
    gap: map.get($spacing, "sm");
    flex-wrap: wrap;
}

.meta-item {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xxs");
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.detail-icon {
    opacity: 0.6;
    flex-shrink: 0;
}

// Game action buttons
.game-actions {
    margin-top: map.get($spacing, "xxs");
    flex-wrap: wrap;
}

.game-btn {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid;
    transition: background 0.1s ease, border-color 0.1s ease;
    white-space: nowrap;

    &.join-btn {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.35);
        color: #60a5fa;
        &:hover { background: rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.55); }
    }

    &.spectate-btn {
        background: rgba(168, 85, 247, 0.1);
        border-color: rgba(168, 85, 247, 0.35);
        color: #c084fc;
        &:hover { background: rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.55); }
    }

    &.invite-btn {
        background: rgba(34, 197, 94, 0.08);
        border-color: rgba(34, 197, 94, 0.28);
        color: #4ade80;
        &:hover { background: rgba(34, 197, 94, 0.16); border-color: rgba(34, 197, 94, 0.45); }
    }
}

// ── Transitions ───────────────────────────────────────────────────────────

.fade-actions-enter-active { transition: opacity 0.12s ease; }
.fade-actions-leave-active { transition: opacity 0.08s ease; }
.fade-actions-enter-from, .fade-actions-leave-to { opacity: 0; }

.ctx-pop-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.ctx-pop-leave-active { transition: opacity 0.08s ease, transform 0.08s ease; }
.ctx-pop-enter-from, .ctx-pop-leave-to { opacity: 0; transform: translateY(-4px) scale(0.97); }

.min-w-0 { min-width: 0; }
</style>
