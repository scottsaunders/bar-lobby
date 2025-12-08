<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Skirmish vs AI", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view" style="position: relative;">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.skirmish") }}</h1>
                <p>Configure your battle against AI opponents</p>
            </div>
            <div class="skirmish-layout flex-row gap-xl">
                <!-- Left Panel: Map Information -->
                <div class="map-panel flex-col fullheight">
                    <div class="map-panel-content flex-grow flex-col gap-md">
                        <div class="flex-row gap-md">
                            <Select
                                :modelValue="battleStore.battleOptions.map"
                                :options="mapListOptions"
                                data-key="springName"
                                label="Map"
                                optionLabel="springName"
                                :filter="true"
                                class="fullwidth"
                                @update:model-value="onMapSelected"
                            />
                            <Button v-tooltip.left="'Open map selector'" @click="openMapList">
                                <Icon :icon="listIcon" height="23" />
                            </Button>
                            <MapListModal
                                v-model="mapListOpen"
                                :title="t('lobby.components.battle.offlineBattleComponent.maps')"
                                @map-selected="onMapSelected"
                            />
                        </div>
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

                <!-- Center Panel: Teams and Spectators -->
                <Panel class="teams-settings-panel flex-grow" no-padding>
                    <div class="panel-content flex-col fullheight">
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                            <div class="game-mode-selector flex-row gap-md">
                                <Select
                                    :modelValue="gameModeOption"
                                    :options="gameModeOptions"
                                    data-key="id"
                                    optionLabel="label"
                                    label="Game Mode"
                                    class="game-mode-dropdown"
                                    @update:model-value="onGameModeChanged"
                                />
                                <Select
                                    v-if="isTeamMode"
                                    :modelValue="currentTeamSizeOption"
                                    :options="teamSizeOptions"
                                    data-key="value"
                                    optionLabel="label"
                                    label="Team Size"
                                    class="team-size-dropdown"
                                    @update:model-value="onTeamSizeChanged"
                                />
                            </div>
                            <div class="playerlist-container flex-grow">
                                <Playerlist :is-team-mode="isTeamMode" :hide-spectators="true" />
                            </div>
                            <Button v-if="isTeamMode" class="fullwidth" @click="addTeam">
                                Add Team
                            </Button>
                        </div>
                    </div>
                </Panel>

                <!-- Right Panel: Teams and Settings -->
                <Panel class="tbd-panel" no-padding>
                    <div class="panel-content flex-col fullheight">
                        <h2 class="title-2 padding-left-xxl padding-top-xxl padding-right-xxl padding-bottom-lg">Teams & Settings</h2>
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-bottom-xxl flex-col gap-md">
                            <GameModeComponent />
                            <div v-if="settingsStore.devMode" class="dev-only">
                                <Select
                                    :modelValue="battleStore.battleOptions.gameVersion"
                                    :options="gameListOptions"
                                    optionLabel="gameVersion"
                                    optionValue="gameVersion"
                                    label="Game"
                                    :filter="true"
                                    :placeholder="battleStore.battleOptions.gameVersion"
                                    @update:model-value="onGameSelected"
                                />
                            </div>
                            <div v-if="settingsStore.devMode" class="dev-only">
                                <Select
                                    :modelValue="enginesStore.selectedEngineVersion"
                                    @update:model-value="(engine) => (enginesStore.selectedEngineVersion = engine)"
                                    :options="enginesStore.availableEngineVersions"
                                    data-key="id"
                                    optionLabel="id"
                                    label="Engine"
                                    :filter="true"
                                    class="fullwidth"
                                />
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
            <!-- Bottom Panel: Action Button -->
            <Panel class="bottom-action-panel" no-padding>
                <div class="bottom-action-content flex-row flex-space-between padding-left-lg padding-right-lg padding-top-lg padding-bottom-lg">
                    <Button class="blue" @click="generateRandomSkirmish">
                        Generate Random Skirmish
                    </Button>
                    <div v-if="map" style="display: flex; align-items: center;">
                        <Button v-if="gameStore.status === GameStatus.LOADING" class="grey slim" disabled>{{
                            t("lobby.components.battle.offlineBattleComponent.gameIsStarting")
                        }}</Button>
                        <Button v-else-if="gameStore.status === GameStatus.RUNNING" class="grey slim" disabled>{{
                            t("lobby.components.battle.offlineBattleComponent.gameIsRunning")
                        }}</Button>
                        <DownloadContentButton
                            v-else
                            :maps="[map.springName]"
                            :engines="battleStore.battleOptions.engineVersion ? [battleStore.battleOptions.engineVersion] : []"
                            :games="battleStore.battleOptions.gameVersion ? [battleStore.battleOptions.gameVersion] : []"
                            download-text="Download Map"
                            class="slim"
                            @click="battleActions.startBattle"
                            >Start Game</DownloadContentButton
                        >
                    </div>
                    <Button v-else class="green slim" disabled>{{
                        t("lobby.components.battle.offlineBattleComponent.startTheGame")
                    }}</Button>
                </div>
            </Panel>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Panel from "@renderer/components/common/Panel.vue";
import { useTypedI18n } from "@renderer/i18n";
import Select from "@renderer/components/controls/Select.vue";
import { Icon } from "@iconify/vue";
import MapListModal from "@renderer/components/battle/MapListModal.vue";
import MapOptionsModal from "@renderer/components/battle/MapOptionsModal.vue";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import Button from "@renderer/components/controls/Button.vue";
import { db } from "@renderer/store/db";
import listIcon from "@iconify-icons/mdi/format-list-bulleted";
import cogIcon from "@iconify-icons/mdi/cog";
import { useDexieLiveQuery, useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import MapBattlePreview from "@renderer/components/maps/MapBattlePreview.vue";
import { MapData } from "@main/content/maps/map-data";
import { settingsStore } from "@renderer/store/settings.store";
import GameModeComponent from "@renderer/components/battle/GameModeComponent.vue";
import { GameStatus, gameStore } from "@renderer/store/game.store";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import { enginesStore } from "@renderer/store/engine.store";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import gridIcon from "@iconify-icons/mdi/grid";
import pencilIcon from "@iconify-icons/mdi/pencil";
import { getRandomMap } from "@renderer/store/maps.store";
import Playerlist from "@renderer/components/battle/Playerlist.vue";
import { GameModeID, type GameModeWithOptions, StartPosType } from "@main/game/battle/battle-types";
import { getTranslatedGameMode } from "@renderer/store/battle.store";

const { t } = useTypedI18n();

const mapListOpen = ref(false);
const mapOptionsOpen = ref(false);
const mapListOptions = useDexieLiveQuery(() => db.maps.toArray());
const gameListOptions = computed(() => {
    return Array.from(gameStore.availableGameVersions.values());
});

const map = useDexieLiveQueryWithDeps([() => battleStore.battleOptions.map], () => {
    if (!battleStore.battleOptions.map) return;
    return db.maps.get(battleStore.battleOptions.map.springName);
});

function openMapList() {
    mapListOpen.value = true;
}

function openMapOptions() {
    mapOptionsOpen.value = true;
}

function onGameSelected(gameVersion: string) {
    gameStore.selectedGameVersion = gameStore.availableGameVersions.get(gameVersion);
    battleStore.battleOptions.gameVersion = gameVersion;
}

function onMapSelected(map: MapData) {
    battleStore.battleOptions.map = map;
    mapListOpen.value = false;
}

async function generateRandomSkirmish() {
    try {
        const randomMap = await getRandomMap();
        if (!randomMap) {
            return;
        }
        
        // Set the map
        battleStore.battleOptions.map = randomMap;
        
        // Ensure we have the required engine and game versions
        if (!enginesStore.selectedEngineVersion || !gameStore.selectedGameVersion) {
            return;
        }
        
        // Get the default AI (BARb)
        const barbAi = enginesStore.selectedEngineVersion.ais.find((ai) => ai.shortName === "BARb");
        if (!barbAi) {
            return;
        }
        
        // Ensure game mode is Teams (CLASSIC)
        if (battleStore.battleOptions.gameMode.id !== GameModeID.CLASSIC) {
            await battleActions.loadGameMode(GameModeID.CLASSIC);
        }
        
        // Reset battle to ensure clean state
        battleActions.resetToDefaultBattle(
            enginesStore.selectedEngineVersion,
            gameStore.selectedGameVersion,
            randomMap
        );
        
        // Use updateTeams to ensure we have the correct number of teams based on the map
        // This will create teams based on the map's start boxes
        try {
            battleActions.updateTeams();
        } catch (error) {
            console.warn("Could not update teams based on map, using default 2 teams");
        }
        
        // Get the recommended team size from the map
        let recommendedTeamSize: number;
        try {
            recommendedTeamSize = battleActions.getMaxPlayersPerTeam();
        } catch (error) {
            // If we can't get the team size, default to 3
            recommendedTeamSize = 3;
        }
        
        // Get the total number of teams (this should match the map's team count)
        const numberOfTeams = battleStore.teams.length;
        
        // Ensure player is in team 0
        if (battleStore.me && battleStore.teams[0]) {
            const playerInTeam0 = battleStore.teams[0].participants.find(
                (p) => "user" in p && p.user.userId === battleStore.me?.user.userId
            );
            if (!playerInTeam0) {
                battleActions.movePlayerToTeam(battleStore.me, 0);
            }
        }
        
        // Fill ALL teams with bots to reach recommended team size
        // General rule: loop through every team (0 to numberOfTeams-1) and fill each one
        for (let teamId = 0; teamId < numberOfTeams; teamId++) {
            // Ensure the team exists
            if (!battleStore.teams[teamId]) {
                continue;
            }
            
            const team = battleStore.teams[teamId];
            
            // Count current participants (excluding scavengers/raptors)
            const currentParticipants = team.participants.filter(
                (p) => !("aiShortName" in p && (p.aiShortName === "RaptorsAI" || p.aiShortName === "ScavengersAI"))
            );
            
            // Calculate how many bots we need to add to reach recommended team size
            const botsNeeded = recommendedTeamSize - currentParticipants.length;
            
            // Add bots to fill the team (always ensure team has bots if needed)
            for (let i = 0; i < botsNeeded; i++) {
                battleActions.addBot(barbAi, teamId);
            }
        }
    } catch (error) {
        console.error("Failed to generate random skirmish:", error);
    }
}

// Game mode management
const gameModeOptions: GameModeWithOptions[] = [
    { id: GameModeID.CLASSIC, label: "Teams", options: {} },
    { id: GameModeID.FFA, label: getTranslatedGameMode(GameModeID.FFA), options: {} },
    { id: GameModeID.RAPTORS, label: getTranslatedGameMode(GameModeID.RAPTORS), options: {} },
    { id: GameModeID.SCAVENGERS, label: getTranslatedGameMode(GameModeID.SCAVENGERS), options: {} },
];

const gameModeOption = computed(() => {
    return gameModeOptions.find(mode => mode.id === battleStore.battleOptions.gameMode.id) || gameModeOptions[0];
});

const isTeamMode = computed(() => {
    const gameMode = battleStore.battleOptions.gameMode.id;
    return gameMode === GameModeID.CLASSIC || gameMode === GameModeID.RAPTORS || gameMode === GameModeID.SCAVENGERS;
});

async function onGameModeChanged(mode: GameModeWithOptions) {
    await battleActions.loadGameMode(mode.id);
}

function addTeam() {
    battleActions.addTeam();
}

// Team size management
const teamSizeOptions = computed(() => {
    // Generate options from 1 to 10 as objects with label and value
    return Array.from({ length: 10 }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
    }));
});

const currentTeamSize = computed(() => {
    // Return custom team size if set, otherwise get from map
    if (battleStore.battleOptions.mapOptions.customTeamSize !== undefined) {
        return battleStore.battleOptions.mapOptions.customTeamSize;
    }
    return battleActions.getMaxPlayersPerTeam();
});

const currentTeamSizeOption = computed(() => {
    const size = currentTeamSize.value;
    return teamSizeOptions.value.find(opt => opt.value === size) || teamSizeOptions.value[0];
});

function onTeamSizeChanged(option: { label: string; value: number }) {
    battleStore.battleOptions.mapOptions.customTeamSize = option.value;
    // Update teams to match the new team size
    battleActions.updateTeams();
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

// Initialize battle store and ensure game mode is Teams (CLASSIC)
onMounted(async () => {
    // Get a map first if we don't have one
    if (!battleStore.battleOptions.map) {
        const randomMap = await getRandomMap();
        if (randomMap) {
            battleStore.battleOptions.map = randomMap;
        }
    }
    
    // Always initialize/reset the battle store to ensure teams are created
    if (battleStore.teams.length === 0) {
        battleActions.resetToDefaultBattle(
            enginesStore.selectedEngineVersion,
            gameStore.selectedGameVersion,
            battleStore.battleOptions.map
        );
    }
    
    // Ensure game mode is set to Teams (CLASSIC)
    if (battleStore.battleOptions.gameMode.id !== GameModeID.CLASSIC) {
        await battleActions.loadGameMode(GameModeID.CLASSIC);
    }
    
    // Ensure we have at least 2 teams for classic mode
    if (battleStore.teams.length < 2) {
        while (battleStore.teams.length < 2) {
            battleActions.addTeam();
        }
    }
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
    padding-bottom: calc(#{map-get($spacing, "sm")} + 10px); // Add extra space for button bar shadow
    overflow-x: hidden;
    overflow-y: hidden;
    box-sizing: border-box;
    position: relative;
    
    .view-title {
        padding-left: 0;
    }
}

.skirmish-layout {
    width: 100%;
    height: 100%;
    min-height: 0;
    align-items: stretch; // Ensure all panels have the same height
    // Account for button bar: button bar has padding lg (16px) top/bottom, small button height 48px
    // Total button bar height: 48px + 16px + 16px = 80px
    // Add gap of lg (16px) between panels and button bar
    // Total space needed: 80px + 16px = 96px
    padding-bottom: calc(80px + #{map-get($spacing, "lg")}); // Button bar height + gap
    box-sizing: border-box;
    overflow: hidden; // Prevent content from appearing off-screen during transitions
}

.map-panel {
    width: 440px;
    min-height: 0;
    flex-shrink: 0;
}

.map-panel-content {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, "md"); // Ensure spacing between children
}

.map-preview-container {
    flex-shrink: 0;
    width: 100%;
    max-width: 100%;
    min-height: 200px;
    max-height: 440px; // Increased max height to ensure all maps fit
    order: 1; // Ensure map preview comes first
    overflow: hidden; // Prevent content from overflowing
    display: flex;
    align-items: center;
    justify-content: center;
    
    // Ensure the map container inside respects the parent size
    :deep(.map-container) {
        max-width: 100%;
        max-height: 100%;
    }
}

.map-start-position-controls {
    flex-shrink: 0; // Hug contents
    display: flex;
    align-items: center;
}

.map-features-container {
    flex-shrink: 0;
    order: 2; // Ensure map features come after map preview
    position: relative; // Ensure it's in normal flow
    width: 100%; // Ensure it takes full width
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
    padding: map-get($spacing, "md");
    border-radius: 2px;
}

.map-features-row {
    flex-shrink: 0;
    gap: map-get($spacing, "md");
    flex-wrap: nowrap; // Don't wrap the row itself
    align-items: center; // Center all items vertically
}

.teams-settings-panel {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.tbd-panel {
    width: 440px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}

.panel-content {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.panel-body {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.playerlist-container {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.bottom-action-panel {
    position: absolute;
    bottom: 10px; // Move up slightly to allow shadow to show
    left: map-get($spacing, "xxl");
    right: map-get($spacing, "xxl");
    width: calc(100% - #{map-get($spacing, "xxl") * 2});
    flex-shrink: 0;
    z-index: 2;
}

.bottom-action-content {
    display: flex;
    align-items: center;
    
    // Override DownloadContentButton wrapper width in button bar
    :deep(.download-button-wrapper) {
        width: auto;
        min-width: 400px;
    }
}

.map-feature-item {
    flex-shrink: 0; // Player count and map size hug their contents
    white-space: nowrap; // Prevent text wrapping
}

.terrain-icons-container {
    flex-grow: 1; // Terrain icons fill the remaining space
    min-width: 0; // Allow shrinking below content size
}


.game-mode-dropdown {
    flex: 4; // 80% of the space (4:1 ratio)
}

.team-size-dropdown {
    flex: 1; // 20% of the space (4:1 ratio)
}
</style>
