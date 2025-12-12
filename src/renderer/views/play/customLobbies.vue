<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Multiplayer Lobbies", order: 5, devOnly: true, onlineOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.customLobbies.title") }}</h1>
                <p>{{ t("lobby.views.play.customLobbies.description") }}</p>
            </div>
            <div class="lobbies-layout flex-row flex-grow gap-xl">
                <Loader v-if="loading"></Loader>
                <Panel v-else class="flex-grow lobbies-list-panel">
                    <div class="flex-col fullheight gap-md">
                        <div class="flex-row flex-center-items gap-md fullwidth">
                            <Checkbox v-model="settingsStore.battlesHidePvE" :label="t('lobby.multiplayer.custom.filters.hidePvE')" />
                            <Checkbox v-model="settingsStore.battlesHideLocked" :label="t('lobby.multiplayer.custom.filters.hideLocked')" />
                            <Checkbox v-model="settingsStore.battlesHideEmpty" :label="t('lobby.multiplayer.custom.filters.hideEmpty')" />
                            <Checkbox v-model="settingsStore.battlesHideInProgress" :label="t('lobby.multiplayer.custom.filters.hideInProgress')" />
                            <div class="flex-grow">
                                <SearchBox v-model="searchVal" placeholder="Search for player, map, or lobby" />
                            </div>
                            <Button class="blue" @click="hostBattleOpen = true">{{ t("lobby.multiplayer.custom.hostBattle") }}</Button>
                            <HostBattle v-model="hostBattleOpen" />
                        </div>
                        <div class="scroll-container">
                            <DataTable
                                v-model:selection="selectedBattle"
                                :value="battles"
                                autoLayout
                                class="p-datatable-sm lobbies-table"
                                selectionMode="single"
                                :sortOrder="1"
                                sortField="battleOptions.title"
                                :rowClass="getRowClass"
                                paginator
                                :rows="16"
                                :pageLinkSize="20"
                                @row-select="selectedBattle = $event.data"
                                @row-dblclick="attemptJoinBattle($event.data)"
                            >
                                <Column field="battleOptions.title" :header="t('lobby.multiplayer.custom.table.title')" sortable :style="{ minWidth: '250px' }" />
                                <Column :header="t('lobby.multiplayer.custom.table.map')" sortable sortField="battleOptions.map">
                                    <template #body="{ data }">
                                        <MapCell :mapSpringName="data.mapSpringName" :mapName="data.battleOptions.map" />
                                    </template>
                                </Column>
                                <Column :header="t('lobby.multiplayer.custom.table.players')" sortable sortField="playerCount.value" headerStyle="width: 100px" bodyStyle="width: 100px">
                                    <template #body="{ data }">
                                        <div class="flex-row flex-center-items gap-md">
                                            <div v-if="data.players.value.length > 0" class="flex-row flex-center-items gap-xs">
                                                <Icon :icon="account" height="17" />
                                                <span>{{ data.players.value.length }}</span>
                                            </div>
                                            <div v-if="data.spectators.value.length > 0" class="flex-row flex-center-items gap-xs">
                                                <Icon :icon="eye" height="17" />
                                                <span>{{ data.spectators.value.length }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </Column>
                                <Column header="Runtime" sortable sortField="runtimeMs.value" headerStyle="width: 90px" bodyStyle="width: 90px">
                                    <template #body="{ data }">
                                        <span v-if="data.primaryFactor === 'Running'">{{ formatRuntime(data.runtimeMs.value) }}</span>
                                        <span v-else>-</span>
                                    </template>
                                </Column>
                                <Column headerStyle="width: 50px" bodyStyle="width: 50px" sortable sortField="isLockedOrPassworded.value">
                                    <template #header>
                                        <Icon :icon="lock" />
                                    </template>
                                    <template #body="{ data }">
                                        <div class="status-icons flex-row flex-center-items gap-xs">
                                            <Icon 
                                                v-if="data.primaryFactor === 'Running'" 
                                                :icon="swordCross" 
                                                height="18" 
                                                color="#ffffff"
                                                v-tooltip="'Game in progress'"
                                            />
                                            <Icon 
                                                v-if="data.isLockedOrPassworded.value" 
                                                :icon="lock" 
                                                height="18" 
                                                color="#ffffff"
                                                v-tooltip="'Locked or password protected'"
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </Panel>
                <Panel v-if="!loading" class="lobby-details-panel flex-grow" no-padding>
                    <div class="flex-col fullheight min-height-0">
                        <BattlePreview v-if="selectedBattle" :battle="selectedBattle">
                            <template #actions="{ battle }">
                                <Button class="green large flex-grow" @click="attemptJoinBattle(battle)">{{
                                    t("lobby.multiplayer.custom.table.join")
                                }}</Button>
                            </template>
                        </BattlePreview>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
/**
 * TODO:
 * - Filters
 * - Host custom battle button (should request spawning a dedicated instance instead of being self-hosted)
 * - Host battle modal that includes options such as public/passworded/friends-only/invite-only, title, map, mode etc
 */

import { Icon } from "@iconify/vue";
import account from "@iconify-icons/mdi/account";
import eye from "@iconify-icons/mdi/eye";
import lock from "@iconify-icons/mdi/lock";
import robot from "@iconify-icons/mdi/robot";
import swordCross from "@iconify-icons/mdi/sword-cross";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { Ref, ref, shallowRef } from "vue";

import BattlePreview from "@renderer/components/battle/BattlePreview.vue";
import HostBattle from "@renderer/components/battle/HostBattle.vue";
import MapCell from "@renderer/components/battle/MapCell.vue";
import Loader from "@renderer/components/common/Loader.vue";
import Panel from "@renderer/components/common/Panel.vue";
import Button from "@renderer/components/controls/Button.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import SearchBox from "@renderer/components/controls/SearchBox.vue";
import { getFriendlyDuration } from "@renderer/utils/misc";
import { OngoingBattle } from "@main/content/replays/replay";
import { settingsStore } from "@renderer/store/settings.store";
import { useTypedI18n } from "@renderer/i18n";
import { DemoModel } from "$/sdfz-demo-parser";

const { t } = useTypedI18n();

// Format runtime as H:MM:SS
function formatRuntime(ms: number): string {
    if (ms === 0) return "0:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Extended type for battles with computed properties used by the DataTable
type BattleWithComputed = OngoingBattle & {
    battleOptions: {
        title: string;
        map: string;
    };
    primaryFactor: string;
    runtimeMs: { value: number };
    players: { value: (DemoModel.Info.Player | DemoModel.Info.AI)[] };
    spectators: { value: DemoModel.Info.Spectator[] };
    bots: (DemoModel.Info.Player | DemoModel.Info.AI)[];
    isLockedOrPassworded: { value: boolean };
    playerCount: { value: number };
    score: number;
};

const loading = ref(false);
const hostBattleOpen = ref(false);
const searchVal = ref("");
const selectedBattle: Ref<BattleWithComputed | null> = shallowRef(null);

// Placeholder lobby data for UI design
// 5 games in progress (running) - mostly 8v8 full teams with spectators
// 5 games not started - 8v8, 4v4, 1v1 with partial teams and spectators
const battles = ref<BattleWithComputed[]>([
    // ===== GAMES IN PROGRESS (Running) =====
    {
        title: "Competitive 8v8 Tournament Match",
        gameId: "battle-001",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "All that glitters",
        startTime: new Date(Date.now() - 18 * 60 * 1000), // 18 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "AlphaCommander", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "BetaStriker", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "GammaDefender", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "DeltaRanger", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "EchoScout", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "FoxtrotTactician", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "GolfEngineer", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "HotelPilot", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "IndiaWarrior", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "JulietSniper", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "KiloAssault", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "LimaGuardian", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "MikeVanguard", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "NovemberSabre", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "OscarMarauder", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PapaVeteran", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "TournamentObserver1", participantId: 17 } as DemoModel.Info.Spectator,
            { name: "TournamentObserver2", participantId: 18 } as DemoModel.Info.Spectator,
            { name: "TournamentObserver3", participantId: 19 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "Competitive 8v8 Tournament Match",
            map: "All that glitters",
        },
        primaryFactor: "Running",
        runtimeMs: { value: 18 * 60 * 1000 },
        players: {
            value: [
                { name: "AlphaCommander", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "BetaStriker", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "GammaDefender", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "DeltaRanger", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "EchoScout", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "FoxtrotTactician", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "GolfEngineer", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "HotelPilot", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "IndiaWarrior", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "JulietSniper", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "KiloAssault", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "LimaGuardian", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "MikeVanguard", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "NovemberSabre", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "OscarMarauder", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PapaVeteran", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "TournamentObserver1", participantId: 17 } as DemoModel.Info.Spectator,
                { name: "TournamentObserver2", participantId: 18 } as DemoModel.Info.Spectator,
                { name: "TournamentObserver3", participantId: 19 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 16 },
        score: 98,
    },
    {
        title: "Elite 8v8 Ranked Battle",
        gameId: "battle-002",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Supreme Isthmus",
        startTime: new Date(Date.now() - 32 * 60 * 1000), // 32 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "AcePilot", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "BladeRunner", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "CrimsonTide", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "DarkHorse", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "EagleEye", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "FireStorm", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "GhostRider", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "HawkStrike", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "IronFist", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "JadeWarrior", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "KnightFall", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "LightningBolt", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "MysticSage", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "NightHawk", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "OmegaForce", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PhoenixRise", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "SpectatorAlpha", participantId: 17 } as DemoModel.Info.Spectator,
            { name: "SpectatorBeta", participantId: 18 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "Elite 8v8 Ranked Battle",
            map: "Supreme Isthmus",
        },
        primaryFactor: "Running",
        runtimeMs: { value: 32 * 60 * 1000 },
        players: {
            value: [
                { name: "AcePilot", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "BladeRunner", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "CrimsonTide", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "DarkHorse", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "EagleEye", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "FireStorm", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "GhostRider", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "HawkStrike", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "IronFist", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "JadeWarrior", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "KnightFall", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "LightningBolt", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "MysticSage", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "NightHawk", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "OmegaForce", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PhoenixRise", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "SpectatorAlpha", participantId: 17 } as DemoModel.Info.Spectator,
                { name: "SpectatorBeta", participantId: 18 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 16 },
        score: 95,
    },
    {
        title: "Pro League 8v8 Match",
        gameId: "battle-003",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Quicksilver Remake 1.24",
        startTime: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "RazorEdge", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ShadowStrike", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ThunderBolt", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ViperSting", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WolfPack", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "XrayVision", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "YankeeDoodle", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ZuluWarrior", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "AlphaSquad", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "BravoTeam", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "CharlieCo", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "DeltaForce", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "EchoUnit", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "FoxtrotSquad", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "GolfPlatoon", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "HotelBattalion", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "LiveStreamViewer1", participantId: 17 } as DemoModel.Info.Spectator,
            { name: "LiveStreamViewer2", participantId: 18 } as DemoModel.Info.Spectator,
            { name: "LiveStreamViewer3", participantId: 19 } as DemoModel.Info.Spectator,
            { name: "LiveStreamViewer4", participantId: 20 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "Pro League 8v8 Match",
            map: "All that glitters",
        },
        primaryFactor: "Running",
        runtimeMs: { value: 12 * 60 * 1000 },
        players: {
            value: [
                { name: "RazorEdge", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ShadowStrike", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ThunderBolt", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ViperSting", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WolfPack", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "XrayVision", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "YankeeDoodle", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ZuluWarrior", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "AlphaSquad", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "BravoTeam", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "CharlieCo", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "DeltaForce", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "EchoUnit", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "FoxtrotSquad", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "GolfPlatoon", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "HotelBattalion", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "LiveStreamViewer1", participantId: 17 } as DemoModel.Info.Spectator,
                { name: "LiveStreamViewer2", participantId: 18 } as DemoModel.Info.Spectator,
                { name: "LiveStreamViewer3", participantId: 19 } as DemoModel.Info.Spectator,
                { name: "LiveStreamViewer4", participantId: 20 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 16 },
        score: 92,
    },
    {
        title: "Championship 8v8 Finals",
        gameId: "battle-004",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Supreme Isthmus",
        startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "MasterChief", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "NobleSix", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "Spartan117", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "CortanaAI", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ArbiterElite", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "JohnsonSarge", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "KeyesCaptain", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "MirandaComm", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "TruthProphet", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "MercyProphet", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "RegretProphet", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "Gravemind", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "Didact", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "Librarian", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "Atriox", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "Escharum", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "ChampionshipFan1", participantId: 17 } as DemoModel.Info.Spectator,
            { name: "ChampionshipFan2", participantId: 18 } as DemoModel.Info.Spectator,
            { name: "ChampionshipFan3", participantId: 19 } as DemoModel.Info.Spectator,
            { name: "ChampionshipFan4", participantId: 20 } as DemoModel.Info.Spectator,
            { name: "ChampionshipFan5", participantId: 21 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "Championship 8v8 Finals",
            map: "Supreme Isthmus",
        },
        primaryFactor: "Running",
        runtimeMs: { value: 25 * 60 * 1000 },
        players: {
            value: [
                { name: "MasterChief", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "NobleSix", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "Spartan117", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "CortanaAI", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ArbiterElite", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "JohnsonSarge", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "KeyesCaptain", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "MirandaComm", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "TruthProphet", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "MercyProphet", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "RegretProphet", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "Gravemind", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "Didact", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "Librarian", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "Atriox", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "Escharum", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "ChampionshipFan1", participantId: 17 } as DemoModel.Info.Spectator,
                { name: "ChampionshipFan2", participantId: 18 } as DemoModel.Info.Spectator,
                { name: "ChampionshipFan3", participantId: 19 } as DemoModel.Info.Spectator,
                { name: "ChampionshipFan4", participantId: 20 } as DemoModel.Info.Spectator,
                { name: "ChampionshipFan5", participantId: 21 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: true },
        playerCount: { value: 16 },
        score: 96,
    },
    {
        title: "Casual 8v8 Public Game",
        gameId: "battle-005",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Quicksilver Remake 1.24",
        startTime: new Date(Date.now() - 7 * 60 * 1000), // 7 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "PlayerOne", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerTwo", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerThree", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerFour", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerFive", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerSix", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerSeven", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerEight", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "PlayerNine", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerTen", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerEleven", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerTwelve", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerThirteen", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerFourteen", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerFifteen", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "PlayerSixteen", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "Watcher1", participantId: 17 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "Casual 8v8 Public Game",
            map: "Quicksilver Remake 1.24",
        },
        primaryFactor: "Running",
        runtimeMs: { value: 7 * 60 * 1000 },
        players: {
            value: [
                { name: "PlayerOne", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerTwo", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerThree", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerFour", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerFive", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerSix", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerSeven", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerEight", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "PlayerNine", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerTen", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerEleven", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerTwelve", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerThirteen", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerFourteen", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerFifteen", participantId: 15, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "PlayerSixteen", participantId: 16, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "Watcher1", participantId: 17 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 16 },
        score: 85,
    },
    // ===== GAMES NOT STARTED (Waiting) =====
    {
        title: "8v8 Lobby - Need 4 More Players",
        gameId: "battle-006",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Supreme Isthmus",
        startTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "WaitingPlayer1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer3", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer4", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer5", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer6", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer7", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer8", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "WaitingPlayer9", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "WaitingPlayer10", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "WaitingPlayer11", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "WaitingPlayer12", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "LobbyWatcher1", participantId: 13 } as DemoModel.Info.Spectator,
            { name: "LobbyWatcher2", participantId: 14 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "8v8 Lobby - Need 4 More Players",
            map: "Supreme Isthmus",
        },
        primaryFactor: "12/16 Players",
        runtimeMs: { value: 0 },
        players: {
            value: [
                { name: "WaitingPlayer1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer3", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer4", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer5", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer6", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer7", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer8", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "WaitingPlayer9", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "WaitingPlayer10", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "WaitingPlayer11", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "WaitingPlayer12", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "LobbyWatcher1", participantId: 13 } as DemoModel.Info.Spectator,
                { name: "LobbyWatcher2", participantId: 14 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 12 },
        score: 75,
    },
    {
        title: "4v4 Casual Match - Join Us!",
        gameId: "battle-007",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Red Comet Remake 1.8",
        startTime: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "TeamA_Player1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "TeamA_Player2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "TeamA_Player3", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "TeamB_Player1", participantId: 4, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "TeamB_Player2", participantId: 5, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "ObserverOne", participantId: 6 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "4v4 Casual Match - Join Us!",
            map: "Red Comet Remake 1.8",
        },
        primaryFactor: "5/8 Players",
        runtimeMs: { value: 0 },
        players: {
            value: [
                { name: "TeamA_Player1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "TeamA_Player2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "TeamA_Player3", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "TeamB_Player1", participantId: 4, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "TeamB_Player2", participantId: 5, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "ObserverOne", participantId: 6 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 5 },
        score: 60,
    },
    {
        title: "1v1 Ranked Duel - Waiting for Opponent",
        gameId: "battle-008",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Quicksilver Remake 1.24",
        startTime: new Date(Date.now() - 30 * 1000), // 30 seconds ago
        hasBots: 0,
        preset: "duel",
        teams: [],
        contenders: [
            { name: "DuelMaster", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "DuelFan1", participantId: 2 } as DemoModel.Info.Spectator,
            { name: "DuelFan2", participantId: 3 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "1v1 Ranked Duel - Waiting for Opponent",
            map: "Quicksilver Remake 1.24",
        },
        primaryFactor: "1/2 Players",
        runtimeMs: { value: 0 },
        players: {
            value: [
                { name: "DuelMaster", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "DuelFan1", participantId: 2 } as DemoModel.Info.Spectator,
                { name: "DuelFan2", participantId: 3 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 1 },
        score: 50,
    },
    {
        title: "8v8 Team Battle - Almost Full",
        gameId: "battle-009",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Quicksilver Remake 1.24",
        startTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "ReadyPlayer1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer3", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer4", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer5", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer6", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer7", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer8", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "ReadyPlayer9", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "ReadyPlayer10", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "ReadyPlayer11", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "ReadyPlayer12", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "ReadyPlayer13", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
            { name: "ReadyPlayer14", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "SpectatorReady1", participantId: 15 } as DemoModel.Info.Spectator,
            { name: "SpectatorReady2", participantId: 16 } as DemoModel.Info.Spectator,
            { name: "SpectatorReady3", participantId: 17 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "8v8 Team Battle - Almost Full",
            map: "All that glitters",
        },
        primaryFactor: "14/16 Players",
        runtimeMs: { value: 0 },
        players: {
            value: [
                { name: "ReadyPlayer1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer3", participantId: 3, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer4", participantId: 4, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer5", participantId: 5, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer6", participantId: 6, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer7", participantId: 7, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer8", participantId: 8, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "ReadyPlayer9", participantId: 9, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "ReadyPlayer10", participantId: 10, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "ReadyPlayer11", participantId: 11, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "ReadyPlayer12", participantId: 12, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "ReadyPlayer13", participantId: 13, allyTeamId: 1 } as DemoModel.Info.Player,
                { name: "ReadyPlayer14", participantId: 14, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "SpectatorReady1", participantId: 15 } as DemoModel.Info.Spectator,
                { name: "SpectatorReady2", participantId: 16 } as DemoModel.Info.Spectator,
                { name: "SpectatorReady3", participantId: 17 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 14 },
        score: 87,
    },
    {
        title: "4v4 Newbie Friendly - Learning Game",
        gameId: "battle-010",
        engineVersion: "105.1.1-1547-g1234567",
        gameVersion: "10.123",
        mapSpringName: "Red Comet Remake 1.8",
        startTime: new Date(Date.now() - 45 * 1000), // 45 seconds ago
        hasBots: 0,
        preset: "team",
        teams: [],
        contenders: [
            { name: "Newbie1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "Newbie2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
            { name: "Newbie3", participantId: 3, allyTeamId: 1 } as DemoModel.Info.Player,
        ],
        spectators: [
            { name: "Mentor1", participantId: 4 } as DemoModel.Info.Spectator,
            { name: "Mentor2", participantId: 5 } as DemoModel.Info.Spectator,
        ],
        script: "",
        battleSettings: {},
        hostSettings: {},
        gameSettings: {},
        mapSettings: {},
        battleOptions: {
            title: "4v4 Newbie Friendly - Learning Game",
            map: "Red Comet Remake 1.8",
        },
        primaryFactor: "3/8 Players",
        runtimeMs: { value: 0 },
        players: {
            value: [
                { name: "Newbie1", participantId: 1, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "Newbie2", participantId: 2, allyTeamId: 0 } as DemoModel.Info.Player,
                { name: "Newbie3", participantId: 3, allyTeamId: 1 } as DemoModel.Info.Player,
            ],
        },
        spectators: {
            value: [
                { name: "Mentor1", participantId: 4 } as DemoModel.Info.Spectator,
                { name: "Mentor2", participantId: 5 } as DemoModel.Info.Spectator,
            ],
        },
        bots: [],
        isLockedOrPassworded: { value: false },
        playerCount: { value: 3 },
        score: 40,
    },
]);

function attemptJoinBattle(battle: OngoingBattle | BattleWithComputed) {
    console.log("Joining battle", battle);
}

function getRowClass(data: BattleWithComputed) {
    return data.primaryFactor === 'Running' ? 'lobby-running' : 'lobby-waiting';
}
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
    overflow: hidden;
    box-sizing: border-box;
    
    .view-title {
        padding-left: 0; // Ensure title isn't cut off - padding is handled by view-container
    }
}

.lobbies-layout {
    min-height: 0;
}

.lobbies-list-panel {
    flex: 2;
    min-width: 0;
}

.lobby-details-panel {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

// Row background colors for running vs waiting lobbies
:deep(.lobbies-table) {
    .lobby-running {
        background-color: rgba(244, 67, 54, 0.08) !important; // Red tint for running games
        
        &:hover {
            background-color: rgba(244, 67, 54, 0.15) !important;
        }
    }
    
    .lobby-waiting {
        // Normal white background for waiting games (no tint)
        &:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
        }
    }
}

.status-icons {
    min-width: 24px;
    justify-content: center;
}
</style>
