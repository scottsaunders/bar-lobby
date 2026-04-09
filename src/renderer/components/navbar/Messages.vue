<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <PopOutPanel :open="modelValue">
        <div class="side-sheet flex-col fullheight">
            <!-- Panel title bar: "Chat" + close at top -->
            <header class="panel-title-bar flex-row flex-space-between flex-center-items">
                <h2 class="panel-title-bar-label subtitle-2">{{ t('lobby.components.social.chat.title') }}</h2>
                <Button
                    v-tooltip.left="t('lobby.navbar.chatPanel.close')"
                    class="icon slim close-panel-btn"
                    @click="closePanel"
                >
                    <Icon :icon="closeThick" />
                </Button>
            </header>
            <div class="side-sheet-body flex-row flex-grow min-height-0">
            <!-- Left sidebar: vertical list of conversations -->
            <div class="sidebar flex-col">
                <div class="sidebar-list flex-col flex-grow gap-xxs padding-md">
                    <!-- Party chat (pinned, shown when in a party) -->
                    <button
                        v-if="partyState?.inParty"
                        type="button"
                        class="sidebar-item sidebar-party body-2"
                        :class="{ active: activeConversation?.type === 'party-chat' }"
                        @click="activeConversation = { type: 'party-chat' }"
                    >
                        <span class="party-dot">♛</span>
                        <span class="sidebar-item-label">Party Chat</span>
                    </button>
                    <!-- Chat rooms -->
                    <!-- Native button intentional: sidebar navigation list items with left-aligned text, hover/active states, and inline child elements — Button component's Control wrapper (audio, centered text, background) is structurally incompatible -->
                    <button
                        v-for="room in chatStore.chatRooms"
                        :key="'room-' + room.id"
                        type="button"
                        class="sidebar-item body-2"
                        :class="{ active: activeConversation?.type === 'room' && activeConversation?.id === room.id }"
                        @click="selectRoom(room)"
                    >
                        <span class="unread-dot" :class="{ visible: room.unreadMessages > 0 }">⬤</span>
                        <span class="sidebar-item-label">{{ room.name }}</span>
                        <span
                            v-if="room.closeable"
                            class="sidebar-item-close"
                            @click.stop="closeChatRoom(room)"
                        >
                            <Icon :icon="closeThick" />
                        </span>
                    </button>
                    <!-- Direct messages -->
                    <!-- Native button intentional: sidebar navigation list item (same pattern as chat rooms above) -->
                    <button
                        v-for="[userId, messages] in dmEntries"
                        :key="'dm-' + userId"
                        type="button"
                        class="sidebar-item body-2"
                        :class="{ active: activeConversation?.type === 'dm' && activeConversation?.userId === userId }"
                        @click="selectDm(userId)"
                    >
                        <span class="sidebar-item-label">{{ getUsername(userId) }}</span>
                        <span class="sidebar-item-close" @click.stop="closeDm(userId)">
                            <Icon :icon="closeThick" />
                        </span>
                    </button>
                    <!-- New conversation -->
                    <!-- Native button intentional: sidebar navigation list item (same pattern as chat rooms above) -->
                    <button
                        type="button"
                        class="sidebar-item new-conversation body-2"
                        :class="{ active: activeConversation?.type === 'new-dm' }"
                        @click="activeConversation = { type: 'new-dm' }"
                    >
                        <Icon :icon="chatPlus" />
                        <span class="sidebar-item-label">{{ t('lobby.navbar.messages.newConversation') }}</span>
                    </button>
                </div>
            </div>

            <!-- Main area: message list + bottom input -->
            <div class="main flex-col flex-grow min-width-0">
                <!-- Message list or new-DM form -->
                <div class="messages-scroll flex-grow overflow-y-auto">
                    <!-- Party chat -->
                    <template v-if="activeConversation?.type === 'party-chat'">
                        <div class="messages-scroll-inner">
                            <div class="party-chat-header">
                                <span class="party-chat-crown">♛</span> Party Chat
                                <span class="party-chat-members">{{ partyState?.members.length ?? 0 }} members</span>
                            </div>
                            <div
                                v-for="(msg, i) in MOCK_PARTY_MESSAGES"
                                :key="'party-msg-' + i"
                                :class="['message-bubble', { fromMe: msg.fromMe }]"
                            >
                                <div v-if="!msg.fromMe" class="bubble-sender">{{ msg.senderName }}</div>
                                <Markdown :source="msg.text" />
                            </div>
                        </div>
                    </template>
                    <!-- Room messages (column-reverse so newest is at bottom, same as original ChatComponent) -->
                    <template v-if="activeConversation?.type === 'room'">
                        <div class="messages-scroll-inner messages-scroll-room">
                            <div
                                v-for="(message, index) in chatStore.selectedChatRoom?.messages.toReversed()"
                                :key="'room-msg-' + index"
                                class="message-row"
                            >
                                <div class="message-content">
                                    <span
                                        class="username"
                                        :style="{ color: chatStore.selectedChatRoom?.color }"
                                    >{{ message.userName }}:</span>
                                    <span class="text">{{ message.text }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <!-- DM messages (chronological: oldest at top, newest at bottom) -->
                    <template v-else-if="activeConversation?.type === 'dm'">
                        <div class="messages-scroll-inner">
                            <div
                                v-for="(message, i) in dmMessages"
                                :key="'dm-msg-' + i"
                                v-in-view.once="() => (message.read = true)"
                                :class="['message-bubble', { fromMe: message.senderUserId === String(me.userId ?? '') }]"
                            >
                                <Markdown :source="message.text" />
                            </div>
                        </div>
                    </template>
                    <!-- New DM form -->
                    <template v-else-if="activeConversation?.type === 'new-dm'">
                        <div class="new-dm-form flex-col gap-md padding-lg">
                            <Textbox
                                v-model="newMessageUserId"
                                class="fullwidth"
                                :label="t('lobby.navbar.messages.userID')"
                                :placeholder="t('lobby.navbar.messages.userIDPlaceholder')"
                            />
                            <Textbox
                                v-model="newMessage"
                                class="fullwidth"
                                :placeholder="t('lobby.components.social.chat.inputPlaceholder')"
                            />
                            <Button class="blue" @click="startNewDm">
                                {{ t('lobby.navbar.messages.send') }}
                            </Button>
                        </div>
                    </template>
                </div>

                <!-- Single bottom input (room or DM only) -->
                <div
                    v-if="activeConversation?.type === 'room' || activeConversation?.type === 'dm'"
                    class="input-bar flex-row flex-center-items"
                >
                    <input
                        ref="mainInputRef"
                        v-model="mainInputText"
                        type="text"
                        class="input-field body-2"
                        :placeholder="t('lobby.components.social.chat.inputPlaceholder')"
                        @keydown.enter.stop.prevent="onMainInputEnter"
                    />
                </div>
                <div v-if="activeConversation?.type === 'party-chat'" class="input-bar flex-row flex-center-items">
                    <input
                        v-model="partyInput"
                        type="text"
                        class="input-field body-2"
                        placeholder="Message your party..."
                        @keydown.enter.stop.prevent="partyInput = ''"
                    />
                </div>
            </div>
            </div>
        </div>
    </PopOutPanel>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import chatPlus from "@iconify-icons/mdi/chat-plus";
import closeThick from "@iconify-icons/mdi/close-thick";
import { computed, inject, Ref, ref, watch } from "vue";
import Button from "@renderer/components/controls/Button.vue";
import Textbox from "@renderer/components/controls/Textbox.vue";
import Markdown from "@renderer/components/misc/Markdown.vue";
import PopOutPanel from "@renderer/components/navbar/PopOutPanel.vue";
import { Message } from "@renderer/model/messages";
import { me } from "@renderer/store/me.store";
import { chatActions, ChatRoom, chatStore } from "@renderer/store/chat.store";
import { useTypedI18n } from "@renderer/i18n";
import type { PartyMockState } from "@renderer/components/party/party-mock-state";

const { t } = useTypedI18n();

type ActiveConversation =
    | { type: "room"; id: string }
    | { type: "dm"; userId: number }
    | { type: "party-chat" }
    | { type: "new-dm" };

const props = defineProps<{
    modelValue: boolean;
}>();

const emits = defineEmits<{
    (event: "update:modelValue", open: boolean): void;
}>();

const partyState = inject<Ref<PartyMockState>>("partyState");

const MOCK_PARTY_MESSAGES = [
    { senderName: "StarCrusher", fromMe: false, text: "ready when you are" },
    { senderName: "NovaByte",    fromMe: false, text: "need 2 more minutes, finishing a skirmish" },
    { senderName: "You",         fromMe: true,  text: "no rush, I'll queue us up when you're back" },
    { senderName: "StarCrusher", fromMe: false, text: "nice, let's go ranked after this" },
];

const partyInput = ref("");

const directMessages = ref(new Map<number, Message[]>());
const activeConversation = ref<ActiveConversation | null>(null);
const mainInputText = ref("");
const mainInputRef = ref<HTMLInputElement | null>(null);
const newMessageUserId = ref("");
const newMessage = ref("");

const dmEntries = computed(() => Array.from(directMessages.value.entries()));

const dmMessages = computed(() => {
    if (activeConversation.value?.type !== "dm") return [];
    return directMessages.value.get(activeConversation.value.userId) ?? [];
});

function closePanel() {
    emits("update:modelValue", false);
}

const toggleMessages = inject<Ref<(open?: boolean, userId?: number) => void>>("toggleMessages")!;
const toggleFriends = inject<Ref<(open?: boolean) => void>>("toggleFriends")!;
const toggleDownloads = inject<Ref<(open?: boolean) => void>>("toggleDownloads")!;

toggleMessages.value = async (open?: boolean, userIdToActivate?: number | string) => {
    if (open) {
        toggleFriends.value(false);
        toggleDownloads.value(false);
    }
    emits("update:modelValue", open ?? !props.modelValue);
    if (open && userIdToActivate === "party-chat") {
        activeConversation.value = { type: "party-chat" };
        return;
    }
    if (open && userIdToActivate != null) {
        const userId = typeof userIdToActivate === "string" ? parseInt(userIdToActivate, 10) : userIdToActivate;
        if (!directMessages.value.has(userId)) {
            directMessages.value = new Map(directMessages.value).set(userId, []);
        }
        activeConversation.value = { type: "dm", userId };
    }
};

watch(
    () => props.modelValue,
    (open) => {
        if (open && activeConversation.value == null && chatStore.chatRooms.length) {
            activeConversation.value = { type: "room", id: chatStore.chatRooms[0].id };
            chatActions.selectChatRoom(chatStore.chatRooms[0].id);
        }
    },
    { immediate: true }
);

watch(activeConversation, (next) => {
    if (next?.type === "room") {
        chatActions.selectChatRoom(next.id);
    }
    mainInputText.value = "";
}, { immediate: true });

function selectRoom(room: ChatRoom) {
    activeConversation.value = { type: "room", id: room.id };
    chatActions.selectChatRoom(room.id);
    mainInputRef.value?.focus();
}

function selectDm(userId: number) {
    activeConversation.value = { type: "dm", userId };
    mainInputRef.value?.focus();
}

function closeChatRoom(chatRoom: ChatRoom) {
    chatActions.closeChatRoom(chatRoom.id);
    if (activeConversation.value?.type === "room" && activeConversation.value.id === chatRoom.id) {
        const remaining = chatStore.chatRooms;
        activeConversation.value = remaining.length ? { type: "room", id: remaining[0].id } : null;
    }
}

function closeDm(userId: number) {
    const next = new Map(directMessages.value);
    next.delete(userId);
    directMessages.value = next;
    if (activeConversation.value?.type === "dm" && activeConversation.value.userId === userId) {
        const entries = Array.from(next.entries());
        activeConversation.value = entries.length ? { type: "dm", userId: entries[0][0] } : null;
    }
}

function onMainInputEnter() {
    const text = mainInputText.value.trim();
    if (!text) return;
    if (activeConversation.value?.type === "room") {
        chatActions.sendMessage({
            userId: me.userId,
            userName: me.username,
            text,
            timestamp: Date.now(),
        });
        mainInputText.value = "";
        return;
    }
    if (activeConversation.value?.type === "dm") {
        sendDirectMessage(activeConversation.value.userId, text);
        mainInputText.value = "";
    }
}

function sendChatMessage() {
    const text = mainInputText.value.trim();
    if (!text) return;
    chatActions.sendMessage({
        userId: me.userId,
        userName: me.username,
        text,
        timestamp: Date.now(),
    });
    mainInputText.value = "";
}

function getUsername(userId: number): string {
    // TODO: resolve from users store when available
    return `User ${userId}`;
}

function sendDirectMessage(userId: number, messageText: string) {
    newMessageUserId.value = "";
    newMessage.value = "";
    mainInputText.value = "";
    const chatlog = directMessages.value.get(userId) ?? [];
    const message: Message = {
        type: "direct-message",
        senderUserId: String(me.userId ?? ""),
        text: messageText,
        read: true,
    };
    chatlog.push(message);
    directMessages.value = new Map(directMessages.value).set(userId, chatlog);
}

function startNewDm() {
    const userIdStr = newMessageUserId.value.trim();
    const text = newMessage.value.trim();
    if (!userIdStr) return;
    const userId = parseInt(userIdStr, 10);
    if (Number.isNaN(userId)) return;
    if (!directMessages.value.has(userId)) {
        directMessages.value = new Map(directMessages.value).set(userId, []);
    }
    if (text) {
        sendDirectMessage(userId, text);
    }
    activeConversation.value = { type: "dm", userId };
    newMessageUserId.value = "";
    newMessage.value = "";
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.side-sheet {
    min-height: 0;
    overflow: hidden;
}

.panel-title-bar {
    flex-shrink: 0;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    padding-right: map.get($spacing, "sm");
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.4);
}

.panel-title-bar-label {
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
}

.close-panel-btn {
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

.side-sheet-body {
    overflow: hidden;
}

.sidebar {
    width: 180px;
    min-width: 180px;
    flex-shrink: 0;
    border-right: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.35);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.sidebar-list {
    overflow-y: auto;
    min-height: 0;
}

.sidebar-party {
    border: 1px solid rgba(245, 158, 11, 0.25);
    background: rgba(245, 158, 11, 0.06);
    border-radius: 4px;
    margin-bottom: map.get($spacing, "xs");

    &:hover { background: rgba(245, 158, 11, 0.1); }
    &.active {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.45);
    }

    .party-dot {
        font-size: 10px;
        color: #f59e0b;
    }
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    width: 100%;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    text-align: left;
    background: none;
    border: none;
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    position: relative;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    &.active {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
    }

    .unread-dot {
        font-size: 8px; // Intentional: off-scale decorative dot indicator "⬤", controls dot visual size
        color: rgb(226, 91, 91);
        visibility: hidden;
        &.visible {
            visibility: visible;
        }
    }

    .sidebar-item-label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .sidebar-item-close {
        opacity: 0.5;
        padding: map.get($spacing, "xxs");
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
            opacity: 1;
        }
    }

    &.new-conversation {
        margin-top: map.get($spacing, "sm");
    }
}

.main {
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.15);
}

.messages-scroll {
    padding: map.get($spacing, "md");
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
}

/* Room messages: column-reverse so newest is at bottom (matches original ChatComponent) */
.messages-scroll-inner.messages-scroll-room {
    display: flex;
    flex-direction: column-reverse;
    gap: map.get($spacing, "xs");
    min-height: min-content;
}

.messages-scroll-inner:not(.messages-scroll-room) {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
}

.message-row .message-content {
    display: flex;
    flex-direction: row;
    gap: map.get($spacing, "xs");
    align-items: baseline;
    font-size: 13px; // Intentional: 13px is off-scale, between caption-1(12px) and body-2(14px)
}

.message-row .username {
    font-weight: bold;
    flex-shrink: 0;
}

.message-bubble {
    word-break: break-word;
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    user-select: text;
    max-width: 85%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    align-self: flex-start;

    &.fromMe {
        align-self: flex-end;
        background: rgba(240, 240, 240, 0.25);
    }
}

.input-bar {
    flex-shrink: 0;
    padding: map.get($spacing, "md");
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
}

.input-field {
    width: 100%;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.4);
    color: #e0e0e0;
    font-family: inherit;

    &::placeholder {
        color: rgba(255, 255, 255, 0.45);
    }

    &:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.4);
    }
}

.new-dm-form {
    max-width: 320px;
}

.min-width-0 {
    min-width: 0;
}

.party-chat-header {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    padding: map.get($spacing, "sm") 0 map.get($spacing, "md");
    font-size: 14px;
    font-weight: 700;
    color: #f59e0b;
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    margin-bottom: map.get($spacing, "sm");
}

.party-chat-crown {
    font-size: 12px;
}

.party-chat-members {
    margin-left: auto;
    font-size: 12px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.35);
}

.bubble-sender {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: map.get($spacing, "xxs");
}
</style>
