<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <PopOutPanel :open="modelValue">
        <div class="friends-panel flex-col fullheight">

        <!-- ── Header ─────────────────────────────────────────────── -->
        <header class="panel-header flex-row flex-center-items flex-space-between">
            <div class="flex-row flex-center-items gap-sm">
                <span class="panel-title">Friends</span>
                <span class="online-badge">{{ onlineFriends.length }} online</span>
            </div>
            <Button class="icon slim close-btn" @click="closePanel">
                <Icon :icon="closeThick" />
            </Button>
        </header>

        <!-- ── Search / Add friend ────────────────────────────────── -->
        <div class="search-row flex-row gap-sm">
            <div class="search-wrap flex-grow">
                <Icon :icon="searchIcon" class="search-icon" :width="16" :height="16" />
                <input
                    v-model="searchQuery"
                    class="search-input"
                    placeholder="Search or add a friend…"
                    type="text"
                    @keydown.enter="onSearchEnter"
                />
                <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                    <Icon :icon="closeThick" :width="12" :height="12" />
                </button>
            </div>
            <Button class="add-friend-btn" @click="showAddFriend = !showAddFriend">
                <Icon :icon="addFriendIcon" :width="16" :height="16" />
                Add
            </Button>
        </div>

        <!-- ── Add friend panel ───────────────────────────────────── -->
        <Transition name="slide-down">
            <div v-if="showAddFriend" class="add-friend-section flex-col gap-sm">
                <div class="flex-row gap-sm">
                    <input
                        v-model="addFriendQuery"
                        class="search-input add-input flex-grow"
                        placeholder="Enter player name…"
                        type="text"
                        @keydown.enter="onAddFriendEnter"
                    />
                    <Button class="send-btn" :disabled="!addFriendQuery.trim()" @click="onAddFriendEnter">
                        Send Request
                    </Button>
                </div>
                <div v-if="addFriendResults.length" class="search-results flex-col gap-xs">
                    <div class="section-label">PLAYERS</div>
                    <div
                        v-for="player in addFriendResults"
                        :key="player.id"
                        class="search-result-row flex-row flex-center-items gap-sm"
                    >
                        <div class="avatar sm" :style="{ background: player.avatarColor }">
                            {{ player.name[0].toUpperCase() }}
                        </div>
                        <span class="result-name flex-grow">{{ player.name }}</span>
                        <span v-if="sentRequests.has(player.id)" class="sent-label">Sent ✓</span>
                        <Button v-else class="slim-btn" @click="sendRequest(player.id)">Add</Button>
                    </div>
                </div>
                <p v-else-if="addFriendQuery.trim().length >= 2 && !addFriendResults.length" class="no-results-text">
                    No players found for "{{ addFriendQuery }}"
                </p>
            </div>
        </Transition>

        <div class="list-body scroll-container">

            <!-- ── Pending requests ───────────────────────────────── -->
            <div v-if="pendingRequests.length" class="list-section">
                <div class="section-header flex-row flex-center-items">
                    <span class="section-label">PENDING REQUESTS</span>
                    <span class="section-count">{{ pendingRequests.length }}</span>
                </div>
                <div
                    v-for="req in pendingRequests"
                    :key="req.id"
                    class="friend-card pending-card flex-row flex-center-items gap-sm"
                >
                    <div class="avatar" :style="{ background: req.avatarColor }">
                        {{ req.name[0].toUpperCase() }}
                    </div>
                    <div class="flex-col flex-grow min-w-0">
                        <span class="friend-name">{{ req.name }}</span>
                        <span class="friend-activity">Wants to be your friend</span>
                    </div>
                    <button class="action-pill accept" title="Accept" @click="acceptRequest(req.id)">
                        <Icon :icon="checkIcon" :width="14" :height="14" />
                    </button>
                    <button class="action-pill decline" title="Decline" @click="declineRequest(req.id)">
                        <Icon :icon="closeThick" :width="14" :height="14" />
                    </button>
                </div>
            </div>

            <!-- ── Online ─────────────────────────────────────────── -->
            <div v-if="onlineFriends.length" class="list-section">
                <div class="section-header flex-row flex-center-items">
                    <span class="section-label">ONLINE</span>
                    <span class="section-count">{{ onlineFriends.length }}</span>
                </div>
                <FriendCard
                    v-for="friend in onlineFriends"
                    :key="friend.id"
                    :friend="friend"
                    :in-party="isInParty(friend)"
                    @invite="inviteToParty(friend)"
                    @join-lobby="joinLobby(friend)"
                    @spectate="spectateFriend(friend)"
                    @message="messageFriend(friend)"
                    @view-profile="viewProfile(friend)"
                    @block="blockFriend(friend)"
                    @unfriend="unfriendFriend(friend)"
                />
            </div>

            <!-- ── Offline ────────────────────────────────────────── -->
            <div v-if="offlineFriends.length" class="list-section">
                <div class="section-header flex-row flex-center-items">
                    <span class="section-label">OFFLINE</span>
                    <span class="section-count">{{ offlineFriends.length }}</span>
                </div>
                <FriendCard
                    v-for="friend in offlineFriends"
                    :key="friend.id"
                    :friend="friend"
                    :in-party="false"
                    offline
                    @message="messageFriend(friend)"
                    @view-profile="viewProfile(friend)"
                    @block="blockFriend(friend)"
                    @unfriend="unfriendFriend(friend)"
                />
            </div>

            <div v-if="!onlineFriends.length && !offlineFriends.length && searchQuery" class="empty-state">
                No friends match "{{ searchQuery }}"
            </div>
            <div v-else-if="!onlineFriends.length && !offlineFriends.length && !searchQuery" class="empty-state">
                Your friends list is empty. Add some friends!
            </div>

        </div>
        </div>
    </PopOutPanel>
</template>

<script lang="ts" setup>
import { computed, inject, reactive, ref, type Ref } from "vue";
import { Icon } from "@iconify/vue";
import closeThick from "@iconify-icons/mdi/close-thick";
import searchIcon from "@iconify-icons/mdi/magnify";
import addFriendIcon from "@iconify-icons/mdi/account-plus";
import checkIcon from "@iconify-icons/mdi/check";
import Button from "@renderer/components/controls/Button.vue";
import PopOutPanel from "@renderer/components/navbar/PopOutPanel.vue";
import FriendCard from "@renderer/components/navbar/FriendCard.vue";
import {
    MOCK_FRIENDS_LIST,
    MOCK_PENDING_REQUESTS,
    MOCK_PLAYER_POOL,
    ME_PARTY_MEMBER,
    type FriendRequest,
    type PartyMember,
    type PartyMockState,
} from "@renderer/components/party/party-mock-state";
import { useRouter } from "vue-router";

const props = defineProps<{ modelValue: boolean }>();
const emits = defineEmits<{ (event: "update:modelValue", open: boolean): void }>();

const router = useRouter();
const partyState = inject<Ref<PartyMockState>>("partyState")!;
const toggleMessages = inject<Ref<((open?: boolean, userId?: string) => void) | undefined>>("toggleMessages")!;
const toggleDownloads = inject<Ref<((open?: boolean) => void) | undefined>>("toggleDownloads", ref(undefined));
const toggleFriends = inject<Ref<((open?: boolean) => void) | undefined>>("toggleFriends")!;

toggleFriends.value = (open?: boolean) => {
    if (open) {
        toggleMessages.value?.(false);
        toggleDownloads.value?.(false);
    }
    emits("update:modelValue", open ?? !props.modelValue);
};

// ── State ──────────────────────────────────────────────────────────────────

const searchQuery = ref("");
const showAddFriend = ref(false);
const addFriendQuery = ref("");
const sentRequests = reactive(new Set<string>());
const friends = reactive([...MOCK_FRIENDS_LIST]);
const pendingRequests = reactive<FriendRequest[]>([...MOCK_PENDING_REQUESTS]);

// ── Computed ───────────────────────────────────────────────────────────────

const filteredFriends = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
});

const onlineFriends = computed(() => filteredFriends.value.filter((f) => f.status !== "offline"));
const offlineFriends = computed(() => filteredFriends.value.filter((f) => f.status === "offline"));

const addFriendResults = computed(() => {
    const q = addFriendQuery.value.toLowerCase().trim();
    if (q.length < 2) return [];
    const friendIds = new Set(friends.map((f) => f.id));
    return MOCK_PLAYER_POOL.filter(
        (p) => p.name.toLowerCase().includes(q) && !friendIds.has(p.id)
    );
});

function isInParty(friend: PartyMember): boolean {
    return partyState.value.members.some((m) => m.id === friend.id);
}

// ── Actions ────────────────────────────────────────────────────────────────

function closePanel() {
    emits("update:modelValue", false);
}

function inviteToParty(friend: PartyMember) {
    if (!partyState.value.inParty) {
        partyState.value.members = [{ ...ME_PARTY_MEMBER }, { ...friend }];
        partyState.value.inParty = true;
    } else if (!isInParty(friend) && partyState.value.members.length < 8) {
        partyState.value.members.push({ ...friend });
    }
}

function joinLobby(friend: PartyMember) {
    if (friend.currentGame?.lobbyId) {
        router.push(`/play/multiplayerLobby/${friend.currentGame.lobbyId}`);
        closePanel();
    }
}

function messageFriend(friend: PartyMember) {
    toggleMessages.value?.(true, friend.id);
    emits("update:modelValue", false);
}

function spectateFriend(friend: PartyMember) {
    if (friend.currentGame?.lobbyId) {
        router.push(`/play/multiplayerLobby/${friend.currentGame.lobbyId}?spectate=true`);
        closePanel();
    }
}

function viewProfile(_friend: PartyMember) {
    // stub — will hook into profile modal when available
}

function blockFriend(friend: PartyMember) {
    const idx = friends.findIndex((f) => f.id === friend.id);
    if (idx !== -1) friends.splice(idx, 1);
}

function unfriendFriend(friend: PartyMember) {
    const idx = friends.findIndex((f) => f.id === friend.id);
    if (idx !== -1) friends.splice(idx, 1);
    // Also remove from party if they're in it
    const partyIdx = partyState.value.members.findIndex((m) => m.id === friend.id);
    if (partyIdx !== -1) partyState.value.members.splice(partyIdx, 1);
}

function acceptRequest(id: string) {
    const req = pendingRequests.find((r) => r.id === id);
    if (req) {
        // Add them as a friend (online, no current game)
        friends.unshift({ id: req.id, name: req.name, status: "online", isLeader: false, isMe: false, avatarColor: req.avatarColor });
    }
    const idx = pendingRequests.findIndex((r) => r.id === id);
    if (idx !== -1) pendingRequests.splice(idx, 1);
}

function declineRequest(id: string) {
    const idx = pendingRequests.findIndex((r) => r.id === id);
    if (idx !== -1) pendingRequests.splice(idx, 1);
}

function sendRequest(playerId: string) {
    sentRequests.add(playerId);
}

function onAddFriendEnter() {
    const q = addFriendQuery.value.trim();
    if (!q) return;
    // If exactly one result, send request to it
    if (addFriendResults.value.length === 1) {
        sendRequest(addFriendResults.value[0].id);
    }
}

function onSearchEnter() {
    // nothing extra needed
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.friends-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

// ── Header — matches Messages.vue panel-title-bar exactly ────────────────

.panel-header {
    flex-shrink: 0;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    padding-right: map.get($spacing, "sm");
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.4);
}

.panel-title {
    // subtitle-2: 16px/600 — matches Messages.vue panel-title-bar-label
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
}

.online-badge {
    font-size: 12px;
    font-weight: 600;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.25);
    border-radius: 10px;
    padding: 1px 8px;
}

.close-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    :deep(.p-button) {
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

// ── Search bar ────────────────────────────────────────────────────────────

.search-row {
    flex-shrink: 0;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    align-items: center;
}

.search-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 10px;
    color: rgba(255, 255, 255, 0.3);
    pointer-events: none;
    flex-shrink: 0;
}

.search-input {
    width: 100%;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    padding-left: 34px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;

    &::placeholder { color: rgba(255, 255, 255, 0.35); }
    &:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.35);
    }
}

.search-clear {
    position: absolute;
    right: map.get($spacing, "sm");
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: map.get($spacing, "xxs");
    &:hover { color: rgba(255, 255, 255, 0.6); }
}

.add-friend-btn {
    flex-shrink: 0;
    font-size: 14px;
    :deep(.p-button) {
        padding: map.get($spacing, "sm") map.get($spacing, "md");
        gap: map.get($spacing, "xs");
    }
}

// ── Add friend section ────────────────────────────────────────────────────

.add-friend-section {
    flex-shrink: 0;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.02);
}

.add-input {
    padding-left: map.get($spacing, "md") !important; // Override search-input left-pad (no icon)
}

.send-btn {
    flex-shrink: 0;
    font-size: 14px;
    :deep(.p-button) {
        padding: map.get($spacing, "sm") map.get($spacing, "md");
    }
}

.search-results {
    padding-top: map.get($spacing, "xs");
}

.search-result-row {
    padding: map.get($spacing, "xs") 0;
    border-radius: 4px;
}

.result-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
}

.sent-label {
    font-size: 12px;
    color: #22c55e;
}

.slim-btn {
    font-size: 12px;
    :deep(.p-button) {
        padding: 4px map.get($spacing, "sm");
    }
}

.no-results-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);

    margin: 0;
}

// ── List body ─────────────────────────────────────────────────────────────

.list-body {
    padding-bottom: map.get($spacing, "lg");
}

.list-section {
    padding: map.get($spacing, "md") map.get($spacing, "md") map.get($spacing, "xs");

    & + .list-section {
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: map.get($spacing, "md");
    }
}

.section-header {
    gap: map.get($spacing, "xs");
    margin-bottom: map.get($spacing, "sm");
}

.section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
}

.section-count {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.2);
}

// ── Pending card ──────────────────────────────────────────────────────────

.pending-card {
    padding: map.get($spacing, "sm");
    border-radius: 6px;
    border: 1px solid rgba(245, 158, 11, 0.2);
    background: rgba(245, 158, 11, 0.05);
    margin-bottom: map.get($spacing, "xs");
}

.action-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.12s ease;

    &.accept {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
        &:hover { background: rgba(34, 197, 94, 0.3); }
    }

    &.decline {
        background: rgba(239, 68, 68, 0.12);
        color: rgba(239, 68, 68, 0.7);
        &:hover { background: rgba(239, 68, 68, 0.25); }
    }
}

// ── Avatar ────────────────────────────────────────────────────────────────

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    flex-shrink: 0;

    &.sm {
        width: 28px;
        height: 28px;
        font-size: 12px;
    }
}

// ── Shared text ───────────────────────────────────────────────────────────

.friend-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.friend-activity {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

// ── Empty state ───────────────────────────────────────────────────────────

.empty-state {
    text-align: center;
    padding: map.get($spacing, "xxxl") map.get($spacing, "xl");
    color: rgba(255, 255, 255, 0.25);
    font-size: 14px;
}

// ── Transitions ───────────────────────────────────────────────────────────

.slide-down-enter-active { transition: all 0.2s ease; }
.slide-down-leave-active { transition: all 0.15s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to   { opacity: 0; transform: translateY(-8px); }

.min-w-0 { min-width: 0; }
</style>
