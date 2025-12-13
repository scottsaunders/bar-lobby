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
            <div class="flex-row flex-center-items gap-xs player-name-container">
                <!-- In multiplayer lobby, show rank image and skill number -->
                <img 
                    v-if="isMultiplayerLobby" 
                    :src="rankImageUrl" 
                    :alt="`Rank ${effectiveRank}`"
                    :title="`Rank ${effectiveRank}`"
                    class="rank-icon"
                />
                <span v-if="isMultiplayerLobby" class="skill-level">
                    {{ player.user.skillLevel ?? 17 }}
                </span>
                <span 
                    class="player-name" 
                    :title="player.user.username"
                >
                    {{ player.user.username }}
                </span>
            </div>
        </TeamParticipant>
    </div>
    <ContextMenu ref="menu" :model="actions" />
</template>

<script lang="ts" setup>
import { delay } from "$/jaz-ts-utils/delay";
import { computed, inject, Ref, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import { useRoute } from "vue-router";

import TeamParticipant from "@renderer/components/battle/TeamParticipant.vue";
import ContextMenu from "@renderer/components/common/ContextMenu.vue";
import Flag from "@renderer/components/misc/Flag.vue";
import { useRouter } from "vue-router";
import { Player } from "@main/game/battle/battle-types";
import { me } from "@renderer/store/me.store";

const { t } = useTypedI18n();

const router = useRouter();
const route = useRoute();

const props = defineProps<{
    player: Player;
}>();

const isMultiplayerLobby = computed(() => {
    return route.path.includes('/multiplayerLobby');
});

const effectiveRank = computed(() => {
    // Default to rank 1 if not set, clamp to valid range 1-6
    const rank = props.player.user.rank || 1;
    return Math.min(Math.max(1, rank), 6);
});

const rankImageUrl = computed(() => {
    const rank = effectiveRank.value;
    return new URL(`/src/renderer/assets/images/icons/ranks/${rank}.png`, import.meta.url).href;
});

const isCurrentUser = computed(() => {
    return props.player.user.userId === me.userId;
});

const menu = ref<InstanceType<typeof ContextMenu>>();

const actions =
    props.player.user.userId === me.userId
        ? [
              { label: t("lobby.components.battle.playerParticipant.viewProfile"), command: viewProfile },
              { label: t("lobby.components.battle.playerParticipant.makeBoss"), command: makeBoss },
          ]
        : [
              { label: t("lobby.components.battle.playerParticipant.viewProfile"), command: viewProfile },
              { label: t("lobby.components.battle.playerParticipant.message"), command: messagePlayer },
              //{ label: "Block", command: blockPlayer },
              { label: t("lobby.components.battle.playerParticipant.addFriend"), command: addFriend },
              { label: t("lobby.components.battle.playerParticipant.kick"), command: kickPlayer },
              { label: t("lobby.components.battle.playerParticipant.ring"), command: ringPlayer },
              {
                  label: t("lobby.components.battle.playerParticipant.more"),
                  items: [{ label: t("lobby.components.battle.playerParticipant.makeBoss"), command: makeBoss }],
              },
              //{ label: "Report", command: reportPlayer },
          ];

function onRightClick(event: MouseEvent) {
    if (menu.value) {
        menu.value.show(event);
    }
}

const toggleProfile = inject<Ref<((userId?: string) => void) | undefined>>("toggleProfile");

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
</script>

<style lang="scss" scoped>
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

:deep(.participant) {
    width: 100% !important;
    box-sizing: border-box;
}

.player-name-container {
    flex-wrap: nowrap;
    min-width: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
}

.rank-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    object-fit: contain;
}

.skill-level {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    padding: 0 4px;
    flex-shrink: 0;
    white-space: nowrap;
}

.player-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1 1 auto;
}
</style>
