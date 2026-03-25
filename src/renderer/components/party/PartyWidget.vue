<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="party-widget" v-click-away:party="() => (panelOpen = false)">

        <!-- Compact trigger -->
        <div v-if="state.inParty" class="party-trigger flex-row flex-center-items gap-sm" @click="panelOpen = !panelOpen" :class="{ active: panelOpen }">
            <div class="avatar-stack flex-row">
                <div v-for="member in state.members" :key="member.id" class="avatar-wrap">
                    <div class="avatar" :style="{ background: member.avatarColor }">
                        {{ memberDisplayName(member)[0].toUpperCase() }}
                    </div>
                    <div class="status-dot" :class="member.status" />
                </div>
            </div>
            <div class="trigger-text flex-col">
                <span class="party-label">Party</span>
                <span class="party-count">{{ state.members.length }} / 8 members</span>
            </div>
        </div>

        <div v-else class="party-trigger form-party flex-row flex-center-items gap-sm" @click="formParty">
            <div class="form-party-icon">+</div>
            <span class="party-label">Form Party</span>
        </div>

        <!-- Dropdown panel -->
        <Transition name="panel-drop">
            <div v-if="state.inParty && panelOpen" class="party-panel flex-col">
                <!-- Header -->
                <div class="panel-header flex-row flex-space-between flex-center-items">
                    <span class="panel-title">PARTY</span>
                    <span class="panel-count">{{ state.members.length }} / 8</span>
                </div>

                <!-- Member list -->
                <div class="member-list flex-col gap-xs">
                    <div v-for="member in state.members" :key="member.id" class="member-row flex-row flex-center-items gap-sm">
                        <!-- Avatar -->
                        <div class="member-avatar" :style="{ background: member.avatarColor }">
                            {{ memberDisplayName(member)[0].toUpperCase() }}
                            <div v-if="member.isLeader" class="leader-crown">♛</div>
                        </div>
                        <!-- Name + status -->
                        <div class="member-info flex-col flex-grow">
                            <span class="member-name">{{ memberDisplayName(member) }}</span>
                            <div class="member-status-row flex-row flex-center-items gap-xs">
                                <span class="member-status" :class="member.status">{{ statusLabel(member.status) }}</span>
                                <!-- In-game tooltip -->
                                <div v-if="member.status === 'in-game' && member.currentGame" class="game-info-wrap">
                                    <Icon :icon="informationOutlineIcon" :height="12" class="game-info-icon" />
                                    <div class="game-tooltip">
                                        <div class="game-tooltip-type">{{ gameTypeLabel(member.currentGame.type) }}</div>
                                        <div class="game-tooltip-name">{{ member.currentGame.name }}</div>
                                        <button
                                            v-if="member.currentGame.type === 'custom-lobby'"
                                            class="game-join-btn"
                                            @click.stop="joinLobby(member)"
                                        >
                                            Join Lobby →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Context menu trigger -->
                        <button class="member-menu-btn" @click.stop="openMemberMenu($event, member)" title="More options">
                            <Icon :icon="dotsVerticalIcon" :height="16" />
                        </button>
                    </div>
                </div>

                <!-- Actions -->
                <div class="panel-actions flex-col gap-xs">
                    <button v-if="canInviteMore" class="action-btn invite" @click="inviteNext">
                        + Invite Friend
                    </button>
                    <button class="action-btn leave" @click="leaveParty">
                        Leave Party
                    </button>
                </div>
            </div>
        </Transition>

        <ContextMenu ref="menu" :model="menuActions" />
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import dotsVerticalIcon from "@iconify-icons/mdi/dots-vertical";
import informationOutlineIcon from "@iconify-icons/mdi/information-outline";
import { computed, inject, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import ContextMenu from "primevue/contextmenu";
import type { PartyMockState, PartyMember } from "./party-mock-state";
import { MOCK_INVITABLE_FRIENDS, ME_PARTY_MEMBER } from "./party-mock-state";
import { me } from "@renderer/store/me.store";

const state = inject<Ref<PartyMockState>>("partyState")!;
const panelOpen = ref(false);
const router = useRouter();

const menu = ref<InstanceType<typeof ContextMenu>>();
const activeMenuMember = ref<PartyMember | null>(null);

const STATUS_CYCLE: PartyMember["status"][] = ["online", "in-queue", "in-game", "offline"];

const iAmLeader = computed(() => state.value.members.find((m) => m.isMe)?.isLeader ?? false);

const canInviteMore = computed(() =>
    state.value.members.length < 8 &&
    state.value.members.filter((m) => !m.isMe).length < MOCK_INVITABLE_FRIENDS.length
);


function memberDisplayName(member: PartyMember): string {
    return member.isMe ? (me.username || "You") : member.name;
}

function formParty() {
    state.value.members = [
        { ...ME_PARTY_MEMBER },
        { ...MOCK_INVITABLE_FRIENDS[0] },
    ];
    state.value.inParty = true;
    panelOpen.value = true;
}

function inviteNext() {
    const alreadyIn = state.value.members.map((m) => m.id);
    const next = MOCK_INVITABLE_FRIENDS.find((f) => !alreadyIn.includes(f.id));
    if (next) state.value.members.push({ ...next });
}

function leaveParty() {
    state.value.inParty = false;
    state.value.members = [];
    panelOpen.value = false;
}

function removeMember(member: PartyMember) {
    state.value.members = state.value.members.filter((m) => m.id !== member.id);
}

function cycleStatus(member: PartyMember) {
    const idx = STATUS_CYCLE.indexOf(member.status);
    member.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

function statusLabel(status: PartyMember["status"]): string {
    return { online: "Online", "in-queue": "In Queue", "in-game": "In Game", offline: "Offline" }[status];
}

function gameTypeLabel(type: string): string {
    return (
        { "custom-lobby": "Custom Lobby", scenario: "Scenario", skirmish: "Skirmish vs AI", ranked: "Ranked Match" }[type] ?? type
    );
}

function openMemberMenu(event: MouseEvent, member: PartyMember) {
    activeMenuMember.value = member;
    menu.value?.show(event);
}

const toggleProfile = inject<Ref<((userId?: string) => void) | undefined>>("toggleProfile", ref(undefined));

const menuActions = computed(() => {
    const member = activeMenuMember.value;
    if (!member) return [];

    if (member.isMe) {
        return [{ label: "View Profile", command: () => viewProfile(member) }];
    }

    return [
        { label: "View Profile", command: () => viewProfile(member) },
        { label: "Message", command: () => messagePlayer(member) },
        { label: "Add Friend", command: () => addFriend(member) },
        { separator: true },
        ...(iAmLeader.value ? [{ label: "Remove from Party", command: () => removeMember(member) }, { separator: true }] : []),
        { label: "Demo: Cycle Status", command: () => cycleStatus(member) },
    ];
});

function viewProfile(member: PartyMember) {
    if (toggleProfile?.value) {
        toggleProfile.value(member.id);
    }
}

function messagePlayer(_member: PartyMember) {
    // TODO: open DM with member
}

function addFriend(_member: PartyMember) {
    // TODO: send friend request
}

function joinLobby(member: PartyMember) {
    if (member.currentGame?.lobbyId) {
        router.push(`/play/multiplayerLobby/${member.currentGame.lobbyId}`);
    }
    panelOpen.value = false;
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

$panel-width: 280px;

.party-widget {
    position: relative;
    flex-shrink: 0;
    align-self: stretch;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.party-trigger {
    height: 100%;
    padding: 0 map.get($spacing, "lg");
    cursor: pointer;
    transition: background 0.15s ease;
    min-width: 170px;

    &:hover,
    &.active {
        background: rgba(255, 255, 255, 0.05);
    }

    &.form-party {
        opacity: 0.55;
        &:hover {
            opacity: 1;
        }
    }
}

// Avatar stack
.avatar-stack {
    > .avatar-wrap + .avatar-wrap {
        margin-left: -6px;
    }
}

.avatar-wrap {
    position: relative;
    flex-shrink: 0;
}

.avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid rgba(10, 14, 20, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    position: relative;
}

.status-dot {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid rgba(10, 14, 20, 0.95);

    &.online    { background: #22c55e; }
    &.in-queue  { background: #f59e0b; }
    &.in-game   { background: #3b82f6; }
    &.offline   { background: rgba(255, 255, 255, 0.2); }
}

.trigger-text {
    gap: 1px;
}

.party-label {
    font-size: 15px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.3;
}

.party-count {
    font-size: 12px;
    font-family: Montserrat, sans-serif;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.3;
}

.form-party-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1.5px dashed rgba(255, 255, 255, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
}

// Panel
.party-panel {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    width: $panel-width;
    background: rgba(10, 14, 20, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-top: none;
    border-radius: 0 0 4px 4px;
    z-index: 15;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    padding: map.get($spacing, "md");
    gap: map.get($spacing, "md");
}

.panel-header {
    padding-bottom: map.get($spacing, "sm");
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
    font-size: 11px;
    font-weight: 700;
    font-family: Montserrat, sans-serif;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.4);
}

.panel-count {
    font-size: 11px;
    font-family: Montserrat, sans-serif;
    color: rgba(255, 255, 255, 0.3);
}


.member-row {
    padding: map.get($spacing, "xs") 0;
    border-radius: 3px;
    transition: background 0.1s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.03);

        .member-menu-btn {
            opacity: 1;
        }
    }
}

.member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    flex-shrink: 0;
    position: relative;

    .leader-crown {
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        color: #f59e0b;
        line-height: 1;
    }
}

.member-info {
    gap: 2px;
    min-width: 0;
}

.member-name {
    font-size: 14px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-status-row {
    gap: map.get($spacing, "xs");
}

.member-status {
    font-size: 12px;
    font-family: Montserrat, sans-serif;
    line-height: 1.3;

    &.online   { color: #22c55e; }
    &.in-queue { color: #f59e0b; }
    &.in-game  { color: #3b82f6; }
    &.offline  { color: rgba(255, 255, 255, 0.3); }
}

// In-game hover tooltip
.game-info-wrap {
    position: relative;
    display: flex;
    align-items: center;
    cursor: default;

    .game-info-icon {
        color: rgba(59, 130, 246, 0.6);
        transition: color 0.15s ease;
    }

    &:hover .game-info-icon {
        color: #3b82f6;
    }

    .game-tooltip {
        display: none;
        position: absolute;
        bottom: calc(100% + 6px);
        left: 0;
        min-width: 180px;
        background: rgba(10, 14, 20, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        padding: map.get($spacing, "sm");
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        z-index: 20;
        gap: map.get($spacing, "xs");
        flex-direction: column;
    }

    &:hover .game-tooltip {
        display: flex;
    }
}

.game-tooltip-type {
    font-size: 10px;
    font-weight: 700;
    font-family: Montserrat, sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
}

.game-tooltip-name {
    font-size: 13px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
    color: rgba(255, 255, 255, 0.9);
}

.game-join-btn {
    margin-top: map.get($spacing, "xxs");
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 3px;
    color: #22c55e;
    font-size: 12px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
    padding: map.get($spacing, "xxs") map.get($spacing, "sm");
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;

    &:hover {
        background: rgba(34, 197, 94, 0.18);
        border-color: rgba(34, 197, 94, 0.55);
    }
}

// Per-member context menu trigger
.member-menu-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: map.get($spacing, "xxs");
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0;
    transition: all 0.15s ease;

    &:hover {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
    }
}

.panel-actions {
    padding-top: map.get($spacing, "xs");
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.action-btn {
    width: 100%;
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    border-radius: 3px;
    font-size: 13px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
    cursor: pointer;
    border: 1px solid transparent;
    text-align: left;
    transition: all 0.15s ease;

    &.invite {
        background: rgba(34, 197, 94, 0.08);
        border-color: rgba(34, 197, 94, 0.25);
        color: #22c55e;
        &:hover {
            background: rgba(34, 197, 94, 0.15);
            border-color: rgba(34, 197, 94, 0.5);
        }
    }

    &.leave {
        background: rgba(239, 68, 68, 0.06);
        border-color: rgba(239, 68, 68, 0.2);
        color: rgba(239, 68, 68, 0.8);
        &:hover {
            background: rgba(239, 68, 68, 0.12);
            border-color: rgba(239, 68, 68, 0.4);
        }
    }
}

.panel-drop-enter-active,
.panel-drop-leave-active {
    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
}
.panel-drop-enter-from,
.panel-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
