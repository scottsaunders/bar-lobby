<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Multiplayer Lobby", order: 1, hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view" style="position: relative;">
        <div class="view-container">
            <div class="view-title flex-row flex-space-between flex-center-items">
                <div class="flex-row flex-center-items gap-md">
                    <Button v-tooltip.bottom="'Back to Lobbies'" class="icon" @click="goBack">
                        <Icon :icon="arrow_back" height="24" />
                    </Button>
                    <div class="flex-row flex-center-items gap-md">
                        <div>
                            <h1>{{ battleStore.title }}</h1>
                            <p>Configure your battle and join the game</p>
                        </div>
                        <Button class="icon" @click="editTitle">
                            <Icon :icon="pencilIcon" height="20" />
                        </Button>
                    </div>
                </div>
            </div>
            <div class="lobby-container flex-col fullheight">
                <!-- Top Row: Three Main Panels -->
                <div class="lobby-layout flex-row gap-xl flex-grow min-height-0">
                    <!-- Left Panel: Map Information -->
                    <Panel class="map-panel" no-padding>
                        <div class="panel-content flex-col fullheight">
                            <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                                <div class="map-preview-container">
                                    <MapBattlePreview />
                                </div>
                                <div class="map-features-container">
                                    <div class="map-features-row flex-row">
                                        <div class="flex-row flex-center-items gap-sm body-2 map-feature-item">
                                            <Icon :icon="personIcon" height="16" />
                                            <span>{{ map?.playerCountMin }} - {{ map?.playerCountMax }}</span>
                                        </div>
                                        <div class="flex-row flex-center-items gap-sm body-2 map-feature-item">
                                            <Icon :icon="gridIcon" height="16" />
                                            <span>{{ map?.mapWidth }} x {{ map?.mapHeight }}</span>
                                        </div>
                                        <div class="terrain-icons-container flex-row flex-center-items gap-sm flex-wrap flex-grow">
                                            <TerrainIcon v-for="terrain in map?.terrain" :terrain="terrain" v-bind:key="terrain" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <!-- Center Panel: Teams and Players -->
                    <Panel class="teams-settings-panel flex-grow" no-padding>
                        <div class="panel-content flex-col fullheight">
                            <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                                <div class="playerlist-container flex-grow">
                                    <Playerlist 
                                        :is-team-mode="isTeamMode" 
                                        :show-join-queue="true"
                                        :show-playing-toggle="true"
                                        :is-playing="isPlaying"
                                        @playing-toggle="togglePlayingSpectating"
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <!-- Right Panel: Settings and Chat -->
                    <Panel class="settings-panel" no-padding>
                        <div class="panel-content flex-col fullheight">
                            <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                                <GameModeComponent />
                            </div>
                        </div>
                    </Panel>
                </div>
                <!-- Bottom Row: Button Panel -->
                <Panel class="bottom-action-panel" no-padding>
                    <div class="bottom-action-content flex-row flex-space-between padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl">
                        <div class="flex-row gap-md flex-center-items">
                            <Button class="red large" @click="leaveLobby">
                                Leave Lobby
                            </Button>
                        </div>
                        <div class="flex-row gap-md flex-center-items">
                            <div v-if="isPlaying && isOnTeam" class="ready-checkbox-wrapper">
                                <Checkbox 
                                    :modelValue="isReady" 
                                    label="Ready"
                                    :class="{ 'ready-checked': isReady }"
                                    @update:modelValue="toggleReady"
                                />
                            </div>
                            <div v-if="map" style="display: flex; align-items: center;">
                                <Button v-if="gameStore.status === GameStatus.LOADING" class="grey large" disabled>
                                    Game is starting...
                                </Button>
                                <Button v-else-if="gameStore.status === GameStatus.RUNNING" class="grey large" disabled>
                                    Game is running
                                </Button>
                                <!-- Enabled start button - shown when player is on team and ready -->
                                <DownloadContentButton
                                    v-else-if="canStartGame"
                                    :maps="[map.springName]"
                                    :engines="battleStore.battleOptions.engineVersion ? [battleStore.battleOptions.engineVersion] : []"
                                    :games="battleStore.battleOptions.gameVersion ? [battleStore.battleOptions.gameVersion] : []"
                                    download-text="Download Map"
                                    class="large"
                                    :disabled="false"
                                    @click="battleActions.startBattle"
                                    >Start Game</DownloadContentButton
                                >
                                <!-- Disabled start button - shown when player is not on team or not ready -->
                                <DownloadContentButton
                                    v-else
                                    :maps="[map.springName]"
                                    :engines="battleStore.battleOptions.engineVersion ? [battleStore.battleOptions.engineVersion] : []"
                                    :games="battleStore.battleOptions.gameVersion ? [battleStore.battleOptions.gameVersion] : []"
                                    download-text="Download Map"
                                    class="large"
                                    :disabled="true"
                                    @click="battleActions.startBattle"
                                    >Start Game</DownloadContentButton
                                >
                            </div>
                            <Button v-else class="green large" disabled>
                                Start the game
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Panel from "@renderer/components/common/Panel.vue";
import { Icon } from "@iconify/vue";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import Button from "@renderer/components/controls/Button.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import { db } from "@renderer/store/db";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import MapBattlePreview from "@renderer/components/maps/MapBattlePreview.vue";
import { MapData } from "@main/content/maps/map-data";
import GameModeComponent from "@renderer/components/battle/GameModeComponent.vue";
import { GameStatus, gameStore } from "@renderer/store/game.store";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import gridIcon from "@iconify-icons/mdi/grid";
import arrow_back from "@iconify-icons/mdi/arrow-back";
import pencilIcon from "@iconify-icons/mdi/pencil";
import Playerlist from "@renderer/components/battle/Playerlist.vue";
import { GameModeID } from "@main/game/battle/battle-types";
import { me } from "@renderer/store/me.store";

const router = useRouter();

const map = useDexieLiveQueryWithDeps([() => battleStore.battleOptions.map], () => {
    if (!battleStore.battleOptions.map) return;
    // If map is already a MapData object, return it
    if (typeof battleStore.battleOptions.map === 'object' && 'springName' in battleStore.battleOptions.map) {
        return battleStore.battleOptions.map;
    }
    // Otherwise, look it up by springName
    return db.maps.get(battleStore.battleOptions.map.springName);
});

const isTeamMode = computed(() => {
    const gameMode = battleStore.battleOptions.gameMode.id;
    return gameMode === GameModeID.CLASSIC || gameMode === GameModeID.RAPTORS || gameMode === GameModeID.SCAVENGERS;
});

const isSpectator = computed(() => {
    // Check if player is in spectators list
    if (!battleStore.me) return false;
    return battleStore.spectators.some(p => p.id === battleStore.me.id);
});

const isOnTeam = computed(() => {
    // Check if player is on any team
    if (!battleStore.me) return false;
    return battleStore.teams.some(team => 
        team.participants.some(p => 'user' in p && p.user.userId === battleStore.me?.user.userId)
    );
});

const isInQueue = computed(() => {
    // Player is in queue if they're playing but not on a team and not spectating
    return !isSpectator.value && !isOnTeam.value && battleStore.me !== null;
});

const isPlaying = computed(() => {
    // Playing means not spectating
    return !isSpectator.value;
});

const isReady = computed(() => {
    return me.battleRoomState?.isReady === true;
});

const canStartGame = computed(() => {
    // Can only start if player is on a team AND ready is checked
    return isOnTeam.value && isReady.value;
});

const canStart = computed(() => {
    // TODO: Add logic to check if user can start (e.g., is boss, has enough players ready, etc.)
    return true;
});

function goBack() {
    // Navigate back to multiplayer lobbies list but stay in the lobby
    router.push("/play/customLobbies");
}

function leaveLobby() {
    // Use battleActions.leaveLobby which calls resetToDefaultBattle to clear placeholder data
    battleActions.leaveLobby();
    // Navigate back to custom lobbies
    router.push("/play/customLobbies");
}

function togglePlayingSpectating(value: boolean) {
    if (!battleStore.me) return;
    
    if (value) {
        // Switching to "Playing" - try to join a team or queue
        const maxPlayersPerTeam = battleActions.getMaxPlayersPerTeam();
        
        // Find first team with space
        for (let teamId = 0; teamId < battleStore.teams.length; teamId++) {
            const team = battleStore.teams[teamId];
            if (team.participants.length < maxPlayersPerTeam) {
                // Found a team with space, add player there
                battleActions.movePlayerToTeam(battleStore.me, teamId);
                me.battleRoomState.isSpectator = false;
                if (me.battleRoomState.teamId === undefined) {
                    me.battleRoomState.teamId = teamId;
                }
                return;
            }
        }
        // If all teams are full, add to team 0 anyway (they'll be in queue)
        battleActions.movePlayerToTeam(battleStore.me, 0);
        me.battleRoomState.isSpectator = false;
        me.battleRoomState.teamId = 0;
    } else {
        // Switching to "Spectating" - move to spectators
        battleActions.movePlayerToSpectators(battleStore.me);
        me.battleRoomState.isSpectator = true;
        delete me.battleRoomState.teamId;
    }
}

function toggleReady(value?: boolean) {
    // Toggle ready state
    const newReadyState = value !== undefined ? value : !isReady.value;
    // Ensure battleRoomState exists
    if (!me.battleRoomState) {
        me.battleRoomState = {};
    }
    me.battleRoomState.isReady = newReadyState;
    // TODO: Send ready state to server
}

function editTitle() {
    // TODO: Implement title editing functionality
    console.log("Edit title clicked");
}


// Initialize battle store with the joined lobby's data
onMounted(async () => {
    // Mark that we're in a lobby (but don't set isLobbyOpened to avoid UI shift and auto-opening chat)
    battleStore.isJoined = true;
});
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map-get($spacing, "xxl") map-get($spacing, "sm") map-get($spacing, "xxl");
    overflow: visible;
    box-sizing: border-box;
    position: relative;
    
    .view-title {
        padding-left: 0;
        
        .icon {
            flex-shrink: 0;
        }
    }
}

.lobby-container {
    width: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, "lg");
}

.lobby-layout {
    width: 100%;
    min-height: 0;
    flex: 1;
    align-items: stretch;
    overflow: visible;
}

.map-panel {
    width: auto;
    min-width: 0;
    min-height: 0;
    max-width: 30%;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    
    :deep(.content) {
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100%;
    }
}

.map-preview-container {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    
    :deep(.map-container) {
        height: 100%;
        width: 100%;
        aspect-ratio: 1;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        flex-shrink: 1;
    }
}

.map-features-container {
    flex-shrink: 0;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
    padding: map-get($spacing, "md");
    border-radius: 2px;
    box-sizing: border-box;
}

.map-features-row {
    flex-shrink: 0;
    gap: map-get($spacing, "md");
    flex-wrap: nowrap;
    align-items: center;
}

.map-feature-item {
    flex-shrink: 0;
    white-space: nowrap;
}

.terrain-icons-container {
    flex-grow: 1;
    min-width: 0;
}

.teams-settings-panel {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.settings-panel {
    width: 350px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}

.panel-content {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-body {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.playerlist-container {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.bottom-action-panel {
    flex-shrink: 0;
    width: 100%;
}

.bottom-action-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: map-get($spacing, "lg");
    width: 100%;
    
    // Override DownloadContentButton wrapper width in button bar (same as skirmish)
    :deep(.download-button-wrapper) {
        width: auto;
        min-width: 400px;
    }
    
    > .flex-row {
        gap: map-get($spacing, "md");
    }
    
    
    // Ready checkbox turns green when checked and matches large button size
    .ready-checkbox-wrapper {
        height: 72px; // Match large button height
        
        :deep(.checkbox) {
            height: 100%;
            
            .label {
                font-size: 20px; // Match subtitle-1 from large button
                font-weight: 600;
                font-family: Poppins, sans-serif;
                line-height: 1.4;
                padding-left: 24px; // Match large button padding
                padding-right: 24px;
            }
            
            .check-wrapper {
                width: 72px; // Make square to match height
                height: 72px;
                min-width: 72px;
                min-height: 72px;
                max-width: 72px;
                max-height: 72px;
            }
        }
        
        :deep(.ready-checked) {
            .check-wrapper {
                background-color: rgba(34, 197, 94, 0.6);
                border-color: rgba(34, 197, 94, 0.8);
                
                &:hover {
                    background-color: rgba(34, 197, 94, 0.8);
                }
            }
        }
    }
}
</style>
