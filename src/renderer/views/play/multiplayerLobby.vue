<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Multiplayer Lobby", order: 1, hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title flex-row flex-space-between flex-center-items">
                <div class="flex-row flex-center-items gap-md">
                    <Button v-tooltip.bottom="'Back to Lobbies'" class="icon view-back-button" @click="goBack">
                        <Icon :icon="arrow_back" height="24" />
                    </Button>
                    <div class="flex-col">
                        <div class="flex-row flex-center-items gap-sm">
                            <h1>{{ battleStore.title }}</h1>
                            <Button v-tooltip.bottom="'Edit Lobby Settings'" class="icon slim" @click="openEditLobbyModal">
                                <Icon :icon="pencilIcon" height="16" />
                            </Button>
                        </div>
                        <p>Level {{ lobbyMinLevel }}-{{ lobbyMaxLevel }} • Chevron {{ lobbyMinChevron }}-{{ lobbyMaxChevron }}</p>
                    </div>
                </div>
            </div>
            
            <LuaOptionsModal
                id="lobby-options"
                title="Lobby Settings"
                v-model="editLobbyModalOpen"
                :options="battleStore.battleOptions.gameMode.options"
                :sections="gameStore.selectedGameVersion?.luaOptionSections || []"
                :show-lobby-settings="true"
                @set-options="onOptionsChanged"
            />
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
                                        <div class="map-start-position-controls flex-row flex-center-items gap-sm">
                                            <span class="body-2">{{ currentStartSystemText }}</span>
                                            <Button class="grey slim" @click="openMapOptions" v-tooltip.left="'Configure start positions'">
                                                <Icon :icon="pencilIcon" height="16" />
                                            </Button>
                                            <MapOptionsModal v-if="battleStore.battleOptions.map" v-model="mapOptionsOpen" />
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

                    <!-- Right Panel: Chat -->
                    <Panel class="chat-panel" no-padding>
                        <div class="panel-content flex-col fullheight">
                            <div class="chat-messages-container scroll-container main-panel-scroll flex-grow">
                                <div class="chat-messages flex-col gap-lg padding-md">
                                    <!-- Mock conversation -->
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="DE" class="flag" />
                                            <span>CommanderX</span>
                                        </div>
                                        <div class="message-text body-2">Hey everyone! Ready for some 8v8?</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="US" class="flag" />
                                            <span>TankMaster42</span>
                                        </div>
                                        <div class="message-text body-2">Let's go! I'll take south spawn</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="GB" class="flag" />
                                            <span>AirSupreme</span>
                                        </div>
                                        <div class="message-text body-2">I'll go air this game if that's ok</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="DE" class="flag" />
                                            <span>CommanderX</span>
                                        </div>
                                        <div class="message-text body-2">Sounds good! Anyone want to go navy?</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="FR" class="flag" />
                                            <span>NavalKnight</span>
                                        </div>
                                        <div class="message-text body-2">I got navy covered 🚢</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="PL" class="flag" />
                                            <span>RushBot</span>
                                        </div>
                                        <div class="message-text body-2">glhf!</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="SE" class="flag" />
                                            <span>VikingStorm</span>
                                        </div>
                                        <div class="message-text body-2">Same here, good luck all!</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="US" class="flag" />
                                            <span>TankMaster42</span>
                                        </div>
                                        <div class="message-text body-2">Who's going eco? We need someone to pump metal</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="CA" class="flag" />
                                            <span>MapleReclaimer</span>
                                        </div>
                                        <div class="message-text body-2">I can eco mid, I'll build up and support both flanks</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="DE" class="flag" />
                                            <span>CommanderX</span>
                                        </div>
                                        <div class="message-text body-2">Perfect. Let's coordinate early game</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="AU" class="flag" />
                                            <span>OutbackTactics</span>
                                        </div>
                                        <div class="message-text body-2">I'll push north with some early bots</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="JP" class="flag" />
                                            <span>NinjaMech</span>
                                        </div>
                                        <div class="message-text body-2">Watch out for early rush, they have RushBot on the other team 😅</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="PL" class="flag" />
                                            <span>RushBot</span>
                                        </div>
                                        <div class="message-text body-2">👀</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="GB" class="flag" />
                                            <span>AirSupreme</span>
                                        </div>
                                        <div class="message-text body-2">lol I'll scout early, don't worry</div>
                                    </div>
                                    
                                    <div class="chat-message flex-col gap-xs">
                                        <div class="player-chip caption-1">
                                            <Flag countryCode="FR" class="flag" />
                                            <span>NavalKnight</span>
                                        </div>
                                        <div class="message-text body-2">Ready when you are, host</div>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-input-container">
                                <Textbox 
                                    v-model="chatInput"
                                    placeholder="Type a message..."
                                    class="chat-input fullwidth"
                                    @keydown.enter="sendChatMessage"
                                />
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
import LuaOptionsModal from "@renderer/components/battle/LuaOptionsModal.vue";
import { GameStatus, gameStore } from "@renderer/store/game.store";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import gridIcon from "@iconify-icons/mdi/grid";
import arrow_back from "@iconify-icons/mdi/arrow-back";
import pencilIcon from "@iconify-icons/mdi/pencil";
import Playerlist from "@renderer/components/battle/Playerlist.vue";
import MapOptionsModal from "@renderer/components/battle/MapOptionsModal.vue";
import Flag from "@renderer/components/misc/Flag.vue";
import Textbox from "@renderer/components/controls/Textbox.vue";
import { GameModeID, StartPosType } from "@main/game/battle/battle-types";
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

const editLobbyModalOpen = ref(false);
const mapOptionsOpen = ref(false);
const chatInput = ref("");

// Lobby restriction settings (placeholder values)
const lobbyMinLevel = ref(5);
const lobbyMaxLevel = ref(30);
const lobbyMinChevron = ref(0);
const lobbyMaxChevron = ref(5);

function openEditLobbyModal() {
    editLobbyModalOpen.value = true;
}

function openMapOptions() {
    mapOptionsOpen.value = true;
}

// Current start system text
const currentStartSystemText = computed(() => {
    const startPosType = battleStore.battleOptions.mapOptions.startPosType;
    if (startPosType === StartPosType.Boxes) {
        return "Start Boxes";
    } else if (startPosType === StartPosType.Fixed) {
        return "Fixed Positions";
    } else if (startPosType === StartPosType.Random) {
        return "Random Positions";
    }
    return "Start Boxes"; // Default
});

function sendChatMessage() {
    if (chatInput.value.trim()) {
        // TODO: Send message to server
        console.log("Send message:", chatInput.value);
        chatInput.value = "";
    }
}

function onOptionsChanged(options: Record<string, boolean | string | number>) {
    battleStore.battleOptions.gameMode.options = options;
}


// Initialize battle store with the joined lobby's data
onMounted(async () => {
    // Mark that we're in a lobby (but don't set isLobbyOpened to avoid UI shift and auto-opening chat)
    battleStore.isJoined = true;
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    width: 100%;
    overflow: visible;
    position: relative;
    
    .view-title .icon {
        flex-shrink: 0;
    }
}

.lobby-container {
    width: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "lg");
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
    padding: map.get($spacing, "md");
    border-radius: 2px;
    box-sizing: border-box;
}

.map-features-row {
    flex-shrink: 0;
    gap: map.get($spacing, "md");
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

.map-start-position-controls {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.teams-settings-panel {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.chat-panel {
    width: 350px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    :deep(.panel) {
        min-height: 0;
        height: 100%;
    }
    
    :deep(.content) {
        min-height: 0;
        overflow: hidden;
    }
    
    .panel-content {
        min-height: 0;
        overflow: hidden;
    }
}

.chat-messages-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: rgba(0, 0, 0, 0.3);
}

.chat-messages {
    display: flex;
    flex-direction: column;
}

.chat-message {
    align-items: flex-start;
}

.player-chip {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 5px; /* intentional: 5px off-scale, compact chip alignment */
    padding: map.get($spacing, "xxs") map.get($spacing, "sm");
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    white-space: nowrap;
    
    .flag {
        width: 14px;
        height: 10px;
    }
}

.message-text {
    line-height: 1.4;
    word-break: break-word;
    color: rgba(255, 255, 255, 0.9);
    padding-left: map.get($spacing, "xs");
}

.chat-input-container {
    flex-shrink: 0;
    width: 100%;
    
    .chat-input {
        width: 100%;
    }
    
    :deep(.control) {
        width: 100%;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-bottom: none;
    }
    
    :deep(.p-inputtext) {
        padding: map.get($spacing, "md") map.get($spacing, "lg");
        width: 100% !important; /* Override PrimeVue InputText default width */
        max-width: 100%;
        box-sizing: border-box;
    }
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
    gap: map.get($spacing, "lg");
    width: 100%;
    
    // Override DownloadContentButton wrapper width in button bar (same as skirmish)
    :deep(.download-button-wrapper) {
        width: auto;
        min-width: 400px;
    }
    
    > .flex-row {
        gap: map.get($spacing, "md");
    }
    
    
    // Ready checkbox turns green when checked and matches large button size
    .ready-checkbox-wrapper {
        height: 72px; // Match large button height
        
        :deep(.checkbox) {
            height: 100%;
            
            .label {
                font-size: 20px; /* intentional: :deep() override, matches subtitle-1 */
                font-weight: 600; /* intentional: :deep() override, matches subtitle-1 */
                font-family: Montserrat, sans-serif;
                line-height: 1.4;
                padding-left: map.get($spacing, "xl");
                padding-right: map.get($spacing, "xl");
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
