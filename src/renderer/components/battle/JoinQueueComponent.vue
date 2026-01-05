<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div key="joinQueue" class="group" data-type="group">
        <div class="flex-row flex-center-items gap-md">
            <div class="title subtitle-1">Join Queue</div>
            <div v-if="memberCount > 0" class="member-count body-2">
                {{ memberCount }}
            </div>
        </div>
        <div class="participants">
            <div
                v-for="player in joinQueuePlayers"
                :key="player.id"
            >
                <SpectatorParticipant :player="player" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import SpectatorParticipant from "@renderer/components/battle/SpectatorParticipant.vue";
import { Player } from "@main/game/battle/battle-types";

// Players in join queue are those who want to play but teams are full
// For now, we'll use spectators as a proxy, but filter to show only those who want to join
const joinQueuePlayers = computed(() => {
    // TODO: Implement actual join queue storage in battleStore
    // For now, return empty array - players are immediately placed on teams
    return [] as Player[];
});

const memberCount = computed(() => {
    return joinQueuePlayers.value.length;
});
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
}

.title {
    // Typography handled by subtitle-1 class
}

.member-count {
    display: inline-block;
    opacity: 0.5;
    vertical-align: middle;
}

.participants {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    margin-top: map.get($spacing, "xs");
}
</style>
