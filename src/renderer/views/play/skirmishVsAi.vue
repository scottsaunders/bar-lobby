<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Skirmish vs AI", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title flex-row flex-center-items gap-md">
                <Button
                    v-tooltip.bottom="t('lobby.views.play.skirmishBackToModes')"
                    class="icon grey view-back-button"
                    @click="goToModeSelector"
                >
                    <Icon :icon="arrowBackIcon" height="24" />
                </Button>
                <div class="flex-col gap-xxs">
                    <h1>{{ skirmishLobbyTitle }}</h1>
                    <p class="body-2 view-title-subtitle">{{ skirmishLobbySubtitle }}</p>
                </div>
            </div>
            <div class="skirmish-container flex-col fullheight">
                <!-- Top Row: Three Main Panels -->
                <div class="skirmish-layout flex-row gap-xl flex-grow min-height-0">
                    <!-- Left Panel: Map Information -->
                    <Panel class="map-panel" no-padding>
                    <div class="panel-content flex-col fullheight">
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                        <div class="map-selector-row flex-row gap-md">
                            <Select
                                :modelValue="battleStore.battleOptions.map"
                                :options="mapListOptions"
                                data-key="springName"
                                label="Map"
                                optionLabel="springName"
                                :filter="true"
                                class="map-selector-dropdown"
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
                </Panel>

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
                                <Select
                                    v-if="isFFAMode"
                                    :modelValue="currentPlayerCountOption"
                                    :options="playerCountOptions"
                                    data-key="value"
                                    optionLabel="label"
                                    label="Players"
                                    class="player-count-dropdown"
                                    @update:model-value="onPlayerCountChanged"
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
                        <div class="panel-body flex-grow padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl flex-col gap-md">
                            <GameModeComponent />
                        </div>
                    </div>
                </Panel>
                </div>
                <!-- Bottom Row: Button Panel -->
                <Panel class="bottom-action-panel" no-padding>
                    <div class="bottom-action-content flex-row flex-space-between padding-left-xxl padding-right-xxl padding-top-xxl padding-bottom-xxl">
                        <Button class="blue large subtitle-1" @click="generateRandomSkirmish">
                        Generate Random Skirmish
                    </Button>
                    <div v-if="map" style="display: flex; align-items: center;">
                        <Button v-if="gameStore.status === GameStatus.LOADING" class="grey large" disabled>{{
                            t("lobby.components.battle.offlineBattleComponent.gameIsStarting")
                        }}</Button>
                        <Button v-else-if="gameStore.status === GameStatus.RUNNING" class="grey large" disabled>{{
                            t("lobby.components.battle.offlineBattleComponent.gameIsRunning")
                        }}</Button>
                        <DownloadContentButton
                            v-else
                            :maps="[map.springName]"
                            :engines="battleStore.battleOptions.engineVersion ? [battleStore.battleOptions.engineVersion] : []"
                            :games="battleStore.battleOptions.gameVersion ? [battleStore.battleOptions.gameVersion] : []"
                            download-text="Download Map"
                            class="large"
                            @click="battleActions.startBattle"
                            >Start Game</DownloadContentButton
                        >
                    </div>
                        <Button v-else class="green large" disabled>{{
                            t("lobby.components.battle.offlineBattleComponent.startTheGame")
                        }}</Button>
                    </div>
                </Panel>
            </div>
            <!-- Dev-only dropdowns: Game and Engine (bottom right) -->
            <div v-if="settingsStore.devMode" class="dev-dropdowns dev-only">
                <Select
                    :modelValue="battleStore.battleOptions.gameVersion"
                    :options="gameListOptions"
                    optionLabel="gameVersion"
                    optionValue="gameVersion"
                    label="Game"
                    :filter="true"
                    :placeholder="battleStore.battleOptions.gameVersion"
                    @update:model-value="onGameSelected"
                    class="dev-select"
                />
                <Select
                    :modelValue="enginesStore.selectedEngineVersion"
                    @update:model-value="(engine) => (enginesStore.selectedEngineVersion = engine)"
                    :options="enginesStore.availableEngineVersions"
                    data-key="id"
                    optionLabel="id"
                    label="Engine"
                    :filter="true"
                    class="dev-select"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
import arrowBackIcon from "@iconify-icons/mdi/arrow-back";
import { getRandomMap } from "@renderer/store/maps.store";
import Playerlist from "@renderer/components/battle/Playerlist.vue";
import { GameModeID, type GameModeWithOptions, StartPosType } from "@main/game/battle/battle-types";
import { getTranslatedGameMode } from "@renderer/store/battle.store";

const { t } = useTypedI18n();
const route = useRoute();
const router = useRouter();

const skirmishLobbyTitle = computed(() => {
    const id = battleStore.battleOptions.gameMode.id;
    switch (id) {
        case GameModeID.CLASSIC:
            return t("lobby.views.play.skirmishLobbyTitle.teamsVsAi");
        case GameModeID.FFA:
            return t("lobby.views.play.skirmishLobbyTitle.ffaVsAi");
        case GameModeID.RAPTORS:
            return t("lobby.views.play.skirmishLobbyTitle.raptorDefense");
        case GameModeID.SCAVENGERS:
            return t("lobby.views.play.skirmishLobbyTitle.scavengerDefense");
        default:
            return t("lobby.views.play.skirmish");
    }
});

const skirmishLobbySubtitle = computed(() => {
    const id = battleStore.battleOptions.gameMode.id;
    switch (id) {
        case GameModeID.CLASSIC:
            return t("lobby.views.play.skirmishModeSelector.teamsVsAiDescription");
        case GameModeID.FFA:
            return t("lobby.views.play.skirmishModeSelector.ffaVsAiDescription");
        case GameModeID.RAPTORS:
            return t("lobby.views.play.skirmishModeSelector.vsRaptorsDescription");
        case GameModeID.SCAVENGERS:
            return t("lobby.views.play.skirmishModeSelector.vsScavengersDescription");
        default:
            return t("lobby.views.play.skirmishModeSelector.description");
    }
});

function goToModeSelector() {
    router.push("/play/skirmish");
}

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
        
        // Get the total number of teams required by the map
        // Calculate it the same way updateTeams does, BEFORE calling updateTeams
        let numberOfTeams = 2; // default
        if (battleStore.battleOptions.mapOptions.startPosType === StartPosType.Boxes) {
            const startBoxIndex = battleStore.battleOptions.mapOptions.startBoxesIndex;
            if (startBoxIndex != undefined && randomMap.startboxesSet[startBoxIndex]) {
                numberOfTeams = randomMap.startboxesSet[startBoxIndex].startboxes.length;
            } else if (battleStore.battleOptions.mapOptions.customStartBoxes) {
                numberOfTeams = battleStore.battleOptions.mapOptions.customStartBoxes.length;
            }
        }
        
        // Use updateTeams to ensure we have the correct number of teams based on the map
        // This will create teams based on the map's start boxes
        try {
            battleActions.updateTeams();
        } catch (error) {
            console.warn("Could not update teams based on map, using default 2 teams");
        }
        
        // Ensure we have the correct number of teams (defensive check)
        while (battleStore.teams.length < numberOfTeams) {
            battleActions.addTeam();
        }
        
        // Get the recommended team size from the map
        let recommendedTeamSize: number;
        try {
            recommendedTeamSize = battleActions.getMaxPlayersPerTeam();
        } catch (error) {
            // If we can't get the team size, default to 3
            recommendedTeamSize = 3;
        }
        
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
        // First pass: ensure every team (except 0) has at least 1 bot
        for (let teamId = 0; teamId < numberOfTeams; teamId++) {
            // Ensure the team exists
            if (!battleStore.teams[teamId]) {
                battleActions.addTeam();
            }
            
            const team = battleStore.teams[teamId];
            
            // Count current bots (excluding scavengers/raptors)
            const currentBots = team.participants.filter(
                (p) => "aiShortName" in p && p.aiShortName !== "RaptorsAI" && p.aiShortName !== "ScavengersAI"
            );
            
            // For teams other than 0, ensure they have at least 1 bot
            if (teamId !== 0 && currentBots.length === 0) {
                battleActions.addBot(barbAi, teamId);
            }
        }
        
        // Second pass: fill all teams to recommended team size
        for (let teamId = 0; teamId < numberOfTeams; teamId++) {
            // Ensure the team exists
            if (!battleStore.teams[teamId]) {
                battleActions.addTeam();
            }
            
            const team = battleStore.teams[teamId];
            if (!team) continue; // Safety check
            
            // Count current participants (excluding scavengers/raptors)
            const currentParticipants = team.participants.filter(
                (p) => !("aiShortName" in p && (p.aiShortName === "RaptorsAI" || p.aiShortName === "ScavengersAI"))
            );
            
            // Calculate how many more bots we need to reach recommendedTeamSize
            const botsNeeded = Math.max(0, recommendedTeamSize - currentParticipants.length);
            
            // Add bots to fill the team to recommended size
            for (let i = 0; i < botsNeeded; i++) {
                battleActions.addBot(barbAi, teamId);
            }
        }
        
        // Final verification pass: ensure every team (except 0) has at least 1 bot
        for (let teamId = 0; teamId < numberOfTeams; teamId++) {
            if (teamId === 0) continue; // Skip team 0 (has player)
            
            // Ensure the team exists
            if (!battleStore.teams[teamId]) {
                battleActions.addTeam();
            }
            
            const team = battleStore.teams[teamId];
            if (!team) continue;
            
            // Count current bots (excluding scavengers/raptors)
            const currentBots = team.participants.filter(
                (p) => "aiShortName" in p && p.aiShortName !== "RaptorsAI" && p.aiShortName !== "ScavengersAI"
            );
            
            // If still no bots, add one
            if (currentBots.length === 0) {
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

const isFFAMode = computed(() => {
    return battleStore.battleOptions.gameMode.id === GameModeID.FFA;
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

// Player count management for FFA mode
const playerCountOptions = computed(() => {
    // Always allow up to 16 players for FFA
    return Array.from({ length: 16 }, (_, i) => ({
        label: String(i + 1),
        value: i + 1,
    }));
});

const currentPlayerCount = computed(() => {
    // Return custom team size if set (used for FFA max players), otherwise get from map
    if (battleStore.battleOptions.mapOptions.customTeamSize !== undefined) {
        return battleStore.battleOptions.mapOptions.customTeamSize;
    }
    // For FFA, default to 8 but allow up to 16
    return 8;
});

const currentPlayerCountOption = computed(() => {
    const count = currentPlayerCount.value;
    return playerCountOptions.value.find(opt => opt.value === count) || playerCountOptions.value[0];
});

function onPlayerCountChanged(option: { label: string; value: number }) {
    battleStore.battleOptions.mapOptions.customTeamSize = option.value;
    // Update teams to match the new player count
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

// Valid mode query param from skirmish mode selector
const VALID_SKIRMISH_MODES = Object.values(GameModeID);

function getRequestedModeFromQuery(): GameModeID | null {
    const queryMode = route.query.mode as string | undefined;
    if (!queryMode || !VALID_SKIRMISH_MODES.includes(queryMode as GameModeID)) return null;
    return queryMode as GameModeID;
}

async function applyModeFromSelectorIfPresent() {
    const requestedMode = getRequestedModeFromQuery();
    if (requestedMode == null) return;
    if (battleStore.battleOptions.gameMode.id !== requestedMode) {
        await battleActions.loadGameMode(requestedMode);
    }
    // Clear the query so the lobby dropdown is the single source of truth; avoids re-applying when component re-renders
    router.replace({ path: route.path, query: {} });
}

// When returning from mode selector with a different mode, apply it (onMounted only runs on first enter; watch handles later visits)
watch(
    () => route.query.mode,
    async (newMode) => {
        if (newMode && VALID_SKIRMISH_MODES.includes(newMode as GameModeID)) {
            await applyModeFromSelectorIfPresent();
        }
    }
);

// Initialize battle store on first mount
onMounted(async () => {
    let mapToUse = battleStore.battleOptions.map;
    if (!mapToUse) {
        const randomMap = await getRandomMap();
        if (randomMap) mapToUse = randomMap;
    }

    battleActions.resetToDefaultBattle(
        enginesStore.selectedEngineVersion,
        gameStore.selectedGameVersion,
        mapToUse
    );

    await applyModeFromSelectorIfPresent();

    if (battleStore.teams.length < 2) {
        while (battleStore.teams.length < 2) {
            battleActions.addTeam();
        }
    }
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    width: 100%;
    overflow: visible; // Allow panel shadows to be visible
    position: relative;
}

.skirmish-container {
    width: 100%;
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "lg"); // Gap between top row and bottom row
}

.skirmish-layout {
    width: 100%;
    min-height: 0;
    flex: 1; // Take up available space in top row
    align-items: stretch; // Ensure all panels have the same height
    overflow: visible; // Allow shadows to be visible (changed from hidden to prevent shadow clipping)
}

.map-panel {
    width: auto; // HUG width - determined by map preview
    min-width: 0;
    min-height: 0;
    max-width: 30%; // Constrain to max 30% of available width
    flex-shrink: 1; // Allow shrinking
    display: flex;
    flex-direction: column;
    height: 100%; // Fill height
    overflow: hidden; // Prevent overflow
    
    // Ensure panel content is properly constrained
    :deep(.content) {
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100%; // Fill panel width
    }
}

.map-selector-row {
    width: 100%; // Fill panel width
    flex-shrink: 0;
}

.map-selector-dropdown {
    flex: 1; // Take up remaining space
    min-width: 0; // Allow shrinking
    width: 100%; // Fill width
}

.map-features-container {
    flex-shrink: 0;
    order: 2; // Ensure map features come after map preview
    position: relative; // Ensure it's in normal flow
    width: 100%; // Fill panel width
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.3);
    padding: map.get($spacing, "md");
    border-radius: 2px;
    box-sizing: border-box; // Include padding in width calculation
}

.map-preview-container {
    flex-grow: 1; // Fill available height
    flex-shrink: 1; // Allow shrinking if needed
    width: 100%; // Fill panel width (constrained by panel max-width)
    min-height: 0; // Allow shrinking below minimum
    min-width: 0; // Allow flex item to shrink below content size
    order: 1; // Ensure map preview comes first
    overflow: hidden; // Prevent content from overflowing
    display: flex;
    align-items: center;
    justify-content: center;
    
    // Map preview fills HEIGHT, maintains 1:1 ratio, fits within container width
    :deep(.map-container) {
        height: 100%; // Fill available HEIGHT
        width: 100%; // Fill container width
        aspect-ratio: 1; // Maintain 1:1 ratio
        max-width: 100%; // Don't exceed container width
        max-height: 100%; // Don't exceed container height
        object-fit: contain; // Fit within bounds while maintaining aspect ratio
        flex-shrink: 1; // Allow shrinking to fit
    }
}

.map-start-position-controls {
    flex-shrink: 0; // Hug contents
    display: flex;
    align-items: center;
}

.map-features-row {
    flex-shrink: 0;
    gap: map.get($spacing, "md");
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
    overflow: hidden; // Prevent overflow
}

.panel-body {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden; // Prevent overflow
}

.playerlist-container {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.bottom-action-panel {
    flex-shrink: 0; // Don't shrink the button panel
    width: 100%;
}

.bottom-action-content {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "lg");
    
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
    flex: 3; // 75% of the space (3:1 ratio)
    min-width: 200px; // Ensure it doesn't shrink too much
}

.team-size-dropdown,
.player-count-dropdown {
    flex: 1; // 25% of the space (3:1 ratio)
    min-width: 120px; // Ensure it doesn't shrink too much
}

.dev-dropdowns {
    position: fixed; // Use fixed positioning relative to viewport
    bottom: 16px; // 16px from bottom of screen
    right: 64px; // 64px from right side of screen
    display: flex;
    flex-direction: row; // Side-by-side layout
    gap: map.get($spacing, "sm");
    z-index: 1; // Lower z-index so button bar appears above
    align-items: flex-end; // Align to the bottom
}

.dev-select {
    width: 200px;
    :deep(.p-dropdown) {
        font-size: 0.875rem; /* intentional: :deep() override, matches body-2 scale */
        padding: map.get($spacing, "xs") map.get($spacing, "sm");
    }
    :deep(.p-dropdown-label) {
        font-size: 0.875rem; /* intentional: :deep() override, matches body-2 scale */
    }
}
</style>

