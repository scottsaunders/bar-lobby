<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div @contextmenu="onRightClick" class="player-participant-wrapper">
        <TeamParticipant>
            <div>
                <Flag class="flag" :countryCode="player.user.countryCode" />
            </div>
            <div>{{ displayName }}</div>
            <div class="flex-row flex-right flex-center">
                <div class="flex-row flex-center gap-sm">
                    <!-- <div
                        v-if="player.battleStatus.teamId > 0 && isSpadsBattle(battle)"
                        class="ready"
                        :class="{ isReady: player.battleStatus.ready }"
                    >
                        ⬤
                    </div> -->
                    <Icon v-if="isSynced" :icon="checkBold" :height="16" color="#0f0" />
                    <Icon v-else :icon="cloudDownload" :height="16" color="#f00" />
                </div>
            </div>
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

async function viewProfile() {
    await router.push(`/profile/${props.player.user.userId}`);
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
.player-participant-wrapper {
    width: 100%;
}

.flag {
    width: 20px;
}
.ready {
    font-size: 12px;
    color: rgb(226, 0, 0);
    text-shadow: none;
    &.isReady {
        color: rgb(121, 226, 0);
    }
}

.menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 4px;
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
