<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div @contextmenu="onRightClick" class="player-participant-wrapper" :class="{ 'current-user': isCurrentUser }">
        <TeamParticipant>
            <div>
                <Flag class="flag" :countryCode="player.user.countryCode" />
            </div>
            <div class="flex-row flex-center-items gap-xs">
                <!-- In multiplayer lobby, always show rank image (default to rank 1 if not set) -->
                <img 
                    v-if="isMultiplayerLobby" 
                    :src="rankImageUrl" 
                    :alt="`Rank ${effectiveRank}`"
                    :title="`Rank ${effectiveRank}`"
                    class="rank-icon"
                />
                <!-- Show skill level next to rank in multiplayer lobby -->
                <span v-if="isMultiplayerLobby" class="skill-level caption-1-strong">
                    {{ player.user.skillLevel ?? 17 }}
                </span>
                <span>{{ displayName }}</span>
            </div>
            <div class="flex-row flex-right flex-center">
                <div class="flex-row flex-center gap-sm">
                    <!-- Show ready status only in multiplayer lobby -->
                    <template v-if="isMultiplayerLobby && player.user.battleRoomState?.teamId !== undefined && player.user.battleRoomState?.teamId !== null">
                        <Icon v-if="isReady" :icon="checkBold" :height="16" color="#0f0" />
                        <Icon v-else :icon="closeThick" :height="16" color="#f00" />
                    </template>
                    <!-- Show sync status otherwise (skirmish and other views) -->
                    <template v-else>
                        <Icon v-if="isSynced" :icon="checkBold" :height="16" color="#0f0" />
                        <Icon v-else :icon="cloudDownload" :height="16" color="#f00" />
                    </template>
                </div>
            </div>
            <!-- Native button intentional: compact hover-reveal context menu trigger within participant row — Button's Control wrapper adds audio/min-size inappropriate for inline icon triggers -->
            <button class="menu-button" @click.stop="onMenuClick" title="Menu">
                <Icon :icon="dotsVerticalIcon" />
            </button>
        </TeamParticipant>
    </div>
    <ContextMenu ref="menu" :model="actions" />
    <AddBonusModal v-model="addBonusModalOpen" :participant="player" @save="onBonusSave" />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import checkBold from "@iconify-icons/mdi/check-bold";
import cloudDownload from "@iconify-icons/mdi/cloud-download";
import closeThick from "@iconify-icons/mdi/close-thick";
import dotsVerticalIcon from "@iconify-icons/mdi/dots-vertical";
import { delay } from "$/jaz-ts-utils/delay";
import { computed, inject, Ref, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import TeamParticipant from "@renderer/components/battle/TeamParticipant.vue";
import ContextMenu from "primevue/contextmenu";
import Flag from "@renderer/components/misc/Flag.vue";
import { useRouter, useRoute } from "vue-router";
import { Player, GameModeID } from "@main/game/battle/battle-types";
import { me } from "@renderer/store/me.store";
import { battleStore, battleActions } from "@renderer/store/battle.store";
import AddBonusModal from "@renderer/components/battle/AddBonusModal.vue";

const { t } = useTypedI18n();
const router = useRouter();
const route = useRoute();

const props = defineProps<{
    player: Player;
}>();

const isSynced = computed(() => {
    const syncStatus = props.player.contentSyncState;
    if (!syncStatus) return false;
    return syncStatus.engine === 1 && syncStatus.game === 1 && syncStatus.map === 1;
});

const isReady = computed(() => {
    return props.player.user.battleRoomState?.isReady ?? false;
});

const isMultiplayerLobby = computed(() => {
    return route.path.includes('/multiplayerLobby');
});

const effectiveRank = computed(() => {
    // Default to rank 1 if not set, clamp to valid range 1-6
    const rank = props.player.user.rank || 1;
    return Math.min(Math.max(1, rank), 6);
});

const isCurrentUser = computed(() => {
    return props.player.user.userId === me.userId;
});

const rankImageUrl = computed(() => {
    const rank = effectiveRank.value;
    return new URL(`/src/renderer/assets/images/icons/ranks/${rank}.png`, import.meta.url).href;
});

const bonus = computed(() => battleActions.getParticipantBonus(props.player));
const displayName = computed(() => {
    const name = props.player.user.username;
    if (bonus.value !== 0) {
        const sign = bonus.value > 0 ? "+" : "";
        return `${name} (${sign}${bonus.value})`;
    }
    return name;
});

const menu = ref<InstanceType<typeof ContextMenu>>();
const addBonusModalOpen = ref(false);

const isSkirmishMode = computed(() => route.path === "/play/skirmishVsAi");

const actions = computed(() => {
    const baseActions = props.player.user.userId === me.userId
        ? [
              { label: t("lobby.components.battle.playerParticipant.viewProfile"), command: viewProfile },
              { label: t("lobby.components.battle.playerParticipant.addBonus"), command: openAddBonusModal },
              ...(isSkirmishMode.value ? [] : [{ label: t("lobby.components.battle.playerParticipant.makeBoss"), command: makeBoss }]),
          ]
        : [
              { label: t("lobby.components.battle.playerParticipant.viewProfile"), command: viewProfile },
              { label: t("lobby.components.battle.playerParticipant.message"), command: messagePlayer },
              //{ label: "Block", command: blockPlayer },
              { label: t("lobby.components.battle.playerParticipant.addFriend"), command: addFriend },
              { label: t("lobby.components.battle.playerParticipant.addBonus"), command: openAddBonusModal },
              { label: t("lobby.components.battle.playerParticipant.kick"), command: kickPlayer },
              { label: t("lobby.components.battle.playerParticipant.ring"), command: ringPlayer },
              ...(isSkirmishMode.value ? [] : [{
                  label: t("lobby.components.battle.playerParticipant.more"),
                  items: [
                      { label: t("lobby.components.battle.playerParticipant.makeBoss"), command: makeBoss },
                  ],
              }]),
              //{ label: "Report", command: reportPlayer },
          ];
    return baseActions;
});

function onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (menu.value) {
        menu.value.show(event);
    }
}

function onMenuClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (menu.value) {
        menu.value.show(event);
    }
}

const toggleProfile = inject<Ref<((userId?: string) => void) | undefined>>("toggleProfile", ref(undefined));

async function viewProfile() {
    if (toggleProfile?.value) {
        toggleProfile.value(props.player.user.userId.toString());
    } else {
        // Fallback to route if toggle not available
        await router.push(`/profile/${props.player.user.userId}`);
    }
}

async function kickPlayer() {
    // await api.comms.request("c.lobby.message", {
    //     message: `!cv kick ${props.player.user.username}`,
    // });
}

async function ringPlayer() {
    // await api.comms.request("c.lobby.message", {
    //     message: `!ring ${props.player.user.username}`,
    // });
}

const toggleMessages = inject<Ref<((open?: boolean, userId?: string) => void) | undefined>>("toggleMessages")!;
async function messagePlayer() {
    // if (!api.session.directMessages.has(props.player.user.userId)) {
    //     api.session.directMessages.set(props.player.user.userId, []);
    // }
    if (toggleMessages.value) {
        await delay(10); // needed because the v-click-away directive tells the messages popout to close on the same frame as this would otherwise tell it to open
        toggleMessages.value(true, props.player.user.userId);
    }
}

async function makeBoss() {
    // await api.comms.request("c.lobby.message", {
    //     message: `!cv boss ${props.player.user.username}`,
    // });
}

async function addFriend() {
    // await api.comms.request("c.user.add_friend", {
    //     user_id: props.player.user.userId,
    // });
}

function openAddBonusModal() {
    addBonusModalOpen.value = true;
}

function onBonusSave(bonus: number) {
    battleActions.setParticipantBonus(props.player, bonus);
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.player-participant-wrapper {
    width: 100%;
    
    &.current-user {
        :deep(.participant) {
            background: rgba(37, 99, 235, 0.15);
            border-color: rgba(37, 99, 235, 0.3);
        }
    }
}

.flag {
    width: 20px;
}
.ready {
    font-size: 12px; /* Intentional: dead CSS rule (no template element), would be caption-1 */
    color: rgb(226, 0, 0);
    text-shadow: none;
    &.isReady {
        color: rgb(121, 226, 0);
    }
}

.rank-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    object-fit: contain;
}

.skill-level {
    color: rgba(255, 255, 255, 0.9);
    padding: 0 map.get($spacing, "xs");
}

.menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: map.get($spacing, "xxs");
    border-radius: 3px;
    transition: all 0.2s ease;
    opacity: 0;
    
    .player-participant-wrapper:hover & {
        opacity: 1;
    }
    
    &:hover {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
    }
    
    &:active {
        transform: scale(0.95);
    }
}
</style>
