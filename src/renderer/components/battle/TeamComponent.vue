<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div
        :key="`team${teamId}`"
        class="group"
        :class="{
            raptor: isRaptorTeam(teamId),
            scavenger: isScavengerTeam(teamId),
        }"
        data-type="group"
        @dragenter.prevent="onDragEnter($event, teamId)"
        @dragover.prevent
        @drop="onDrop($event, teamId)"
    >
        <div class="group-header flex-row flex-center-items gap-md">
            <div class="title subtitle-1">{{ title }}</div>
            <div class="member-count body-2" v-if="!isRaptorTeam(teamId) && !isScavengerTeam(teamId)">
                {{ t("lobby.components.battle.teamComponent.players", { count: memberCount, maxCount: maxPlayersPerTeam }) }}
            </div>
            <button 
                v-if="canDeleteTeam" 
                class="delete-team-button" 
                @click.stop="deleteTeam"
                :title="t('lobby.components.battle.teamComponent.deleteTeam')"
            >
                <Icon :icon="closeIcon" />
            </button>
            <!-- <Button v-if="showJoin" class="slim black" @click="onJoinClicked(teamId)">Join</Button> -->
        </div>
        <div
            v-for="member in battleWithMetadataStore.teams[teamId].participants"
            :key="member.id"
            :draggable="!isRaptorTeam(teamId) && !isScavengerTeam(teamId)"
            @dragstart="onDragStart($event, member)"
            @dragend="onDragEnd()"
            class="participant"
        >
            <PlayerParticipant v-if="isPlayer(member)" :player="member" />
            <BotParticipant v-else-if="isBot(member)" :bot="member" :team-id="teamId" />
        </div>
        <template v-if="!isRaptorTeam(teamId) && !isScavengerTeam(teamId)">
            <button
                v-for="(_, i) in getAmountOfJoinButtons(maxPlayersPerTeam, memberCount)"
                :key="i"
                class="join-button"
                :class="{ first: i === 0 }"
                @click="addBotClicked(teamId)"
            >
                {{ t("lobby.components.battle.teamComponent.addBot") }}
            </button>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import { Icon } from "@iconify/vue";
import closeIcon from "@iconify-icons/mdi/close";

import BotParticipant from "@renderer/components/battle/BotParticipant.vue";
import PlayerParticipant from "@renderer/components/battle/PlayerParticipant.vue";
import { Bot, isBot, isPlayer, isRaptor, isScavenger, Player, GameModeID } from "@main/game/battle/battle-types";
import { battleActions, battleStore, battleWithMetadataStore } from "@renderer/store/battle.store";

const { t } = useTypedI18n();

const props = defineProps<{
    teamId: number;
}>();

const title = computed(() => {
    if (isScavengerTeam(props.teamId)) {
        return t("lobby.components.battle.teamComponent.scavengers");
    }
    if (isRaptorTeam(props.teamId)) {
        return t("lobby.components.battle.teamComponent.raptors");
    }
    // In FFA mode, show "Players" instead of "Team 1"
    if (battleStore.battleOptions.gameMode.id === GameModeID.FFA) {
        return t("lobby.components.battle.teamComponent.playersTitle");
    }
    return t("lobby.components.battle.teamComponent.teamId", { id: Number(props.teamId) + 1 });
});

const memberCount = computed(() => {
    return battleWithMetadataStore.teams[props.teamId]?.participants.length || 0;
});

const maxPlayersPerTeam = computed(() => {
    if (!battleWithMetadataStore.battleOptions.map) return 1;
    return battleActions.getMaxPlayersPerTeam();
});

const canDeleteTeam = computed(() => {
    // Can't delete raptor or scavenger teams
    if (isRaptorTeam(props.teamId) || isScavengerTeam(props.teamId)) {
        return false;
    }
    // Can't delete teams 1 and 2 (teamId 0 and 1)
    if (props.teamId === 0 || props.teamId === 1) {
        return false;
    }
    // Need at least 2 teams to delete one
    return battleWithMetadataStore.teams.length >= 2;
});

function deleteTeam() {
    if (canDeleteTeam.value) {
        battleActions.removeTeam(props.teamId);
    }
}

function isRaptorTeam(teamId: number) {
    return battleWithMetadataStore.teams[teamId].participants.some((member) => isBot(member) && isRaptor(member));
}
function isScavengerTeam(teamId: number) {
    return battleWithMetadataStore.teams[teamId]?.participants.some((member) => isBot(member) && isScavenger(member));
}

function getAmountOfJoinButtons(maxPlayersPerTeam: number | undefined, memberCount: number) {
    if (!maxPlayersPerTeam) return 1;

    // notice that we can have more members than the max players so that it can be negative
    const amount = maxPlayersPerTeam - memberCount;

    // we only return positive amount, otherwise we return 0 so that
    // we don't render any join buttons because the team is full or over full at this point
    if (amount > 0) return amount;
    return 0;
}

// const showJoin = computed(() => {
//     return props.teamId !== me.battleRoomState.teamId;
// });

const emit = defineEmits(["addBotClicked", "onJoinClicked", "onDragStart", "onDragEnd", "onDragEnter", "onDrop"]);
function addBotClicked(teamId: number) {
    emit("addBotClicked", teamId);
}

function onJoinClicked(teamId: number) {
    emit("onJoinClicked", teamId);
}

function onDragStart(event: DragEvent, member: Player | Bot) {
    emit("onDragStart", event, member);
}

function onDragEnd() {
    if (isRaptorTeam(props.teamId) || isScavengerTeam(props.teamId)) return;
    emit("onDragEnd");
}

function onDragEnter(event: DragEvent, teamId: number) {
    if (isRaptorTeam(props.teamId) || isScavengerTeam(props.teamId)) return;
    emit("onDragEnter", event, teamId);
}

function onDrop(event: DragEvent, teamId: number) {
    if (isRaptorTeam(props.teamId) || isScavengerTeam(props.teamId)) return;
    emit("onDrop", event, teamId);
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.group {
    border: 1px inset rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.5);
    min-height: 100px;
    padding-left: map.get($spacing, "sm");
    padding-right: map.get($spacing, "sm");
    padding-top: map.get($spacing, "sm");
    padding-bottom: map.get($spacing, "sm");
    position: relative;
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    &.highlight {
        &:before {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
        }
    }
    &.highlight-error {
        &:before {
            width: 100%;
            height: 100%;
            background: rgba(255, 100, 100, 0.1);
        }
    }
    &.raptor {
        border-color: rgb(206, 73, 73);
        background-image: url("/src/renderer/assets/images/modes/raptors.jpg");
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
    &.scavenger {
        border-color: rgb(135, 69, 176);
        background-image: url("/src/renderer/assets/images/modes/scavengers.webp");
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
}

.group-header {
    margin-bottom: map.get($spacing, "xs");
    position: relative;
}

.participant {
    height: map.get($spacing, "xxl");
    width: 100%;
    margin: 0;
    display: flex;
    align-items: center;
}

.title {
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.8));
}

.member-count {
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.8));
    display: inline-block;
    vertical-align: middle;
}

.team-members {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    flex-wrap: wrap;
    margin-top: map.get($spacing, "xs");
}

.delete-team-button {
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
    margin-left: auto;
    
    .group:hover & {
        opacity: 1;
    }
    
    &:hover {
        color: rgba(239, 68, 68, 0.9);
        background: rgba(239, 68, 68, 0.1);
    }
    
    &:active {
        transform: scale(0.95);
    }
}

.join-button {
    height: map.get($spacing, "xxl");
    &.first {
        border-top: none;
    }
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: map.get($spacing, "xs");
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    text-shadow: inset 0 0 10px rgba(0, 0, 0, 1);
    @extend .body-1-strong !optional;
    font-family: Montserrat, sans-serif;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 1);
    &:hover {
        color: rgba(255, 255, 255, 0.9);
        background-color: rgba(255, 255, 255, 0.05);
    }
}
</style>
