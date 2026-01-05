<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div key="spectators" class="group" data-type="group" @dragenter.prevent="onDragEnter($event)" @dragover.prevent @drop="onDrop($event)">
        <div class="flex-row flex-center-items gap-md">
            <div class="title subtitle-1">{{ title }}</div>
            <div class="flex-grow"></div>
            <div v-if="memberCount > 0" class="member-count flex-row flex-center-items gap-xs">
                <Icon :icon="personIcon" height="16" />
                <span class="body-2">{{ memberCount }}</span>
            </div>
        </div>
        <div class="participants">
            <div
                v-for="player in battleWithMetadataStore.spectators"
                :key="player.id"
                draggable="true"
                @dragstart="onDragStart($event, player)"
                @dragend="onDragEnd()"
            >
                <SpectatorParticipant :player="player" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import { useTypedI18n } from "@renderer/i18n";

import SpectatorParticipant from "@renderer/components/battle/SpectatorParticipant.vue";
import { battleWithMetadataStore } from "@renderer/store/battle.store";
import { Player } from "@main/game/battle/battle-types";

const { t } = useTypedI18n();

const title = t("lobby.components.battle.spectatorsComponent.spectators");

const memberCount = computed(() => {
    return battleWithMetadataStore.spectators.length;
});

const emit = defineEmits(["onDragStart", "onDragEnd", "onDragEnter", "onDrop"]);

// TODO probably need to emit with a isSpectator flag
function onDragStart(event: DragEvent, member: Player) {
    emit("onDragStart", event, member);
}
function onDragEnd() {
    emit("onDragEnd");
}
function onDragEnter(event: DragEvent) {
    emit("onDragEnter", event);
}
function onDrop(event: DragEvent) {
    emit("onDrop", event);
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.group {
    border: 1px inset rgba(255, 255, 255, 0.1);
    background: radial-gradient(circle, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8));
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 1);
    min-height: 100px;
    padding: map.get($spacing, "sm");
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    &.highlight {
        &:before {
            @extend .fullsize;
            width: calc(100% + 10px);
            height: calc(100%);
            left: -5px;
            top: -5px;
            background: rgba(255, 255, 255, 0.1);
        }
    }
    &.highlight-error {
        &:before {
            @extend .fullsize;
            width: calc(100% + 10px);
            height: calc(100%);
            left: -5px;
            top: -5px;
            background: rgba(255, 100, 100, 0.1);
        }
    }
}
.title {
    // Typography handled by subtitle-1 class
}
.member-count {
    display: flex;
    align-items: center;
    opacity: 0.8;
}
.participants {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    margin-top: map.get($spacing, "xs");
}
</style>
