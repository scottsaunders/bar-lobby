// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { EngineAI, EngineVersion } from "@main/content/engine/engine-version";
import { GameAI, GameVersion } from "@main/content/game/game-version";
import { MapData } from "@main/content/maps/map-data";
import { Battle, BattleWithMetadata, Bot, Faction, isBot, isPlayer, isRaptor, isScavenger, isScavengerOrRaptor, Player, StartPosType, Team, GameModeID } from "@main/game/battle/battle-types";
import { enginesStore } from "@renderer/store/engine.store";
import { gameStore } from "@renderer/store/game.store";
import { getRandomMap } from "@renderer/store/maps.store";
import { me } from "@renderer/store/me.store";
import { deepToRaw } from "@renderer/utils/deep-toraw";
import { spadsBoxToStartBox } from "@renderer/utils/start-boxes";
import { StartBox } from "tachyon-protocol/types";
import { reactive, readonly, watch } from "vue";
import { startBattle as startGame } from "@renderer/store/game.store";
import { setupI18n } from "@renderer/i18n";

const i18n = setupI18n();

let participantId = 0;
interface BattleLobby {
    isJoined: boolean;
    isLobbyOpened: boolean;
    isSelectingGameMode: boolean;
}

// Store participant bonuses (participant id -> bonus percentage)
const participantBonuses = reactive<Map<number, number>>(new Map());

// Store
export const battleStore = reactive<Battle & BattleLobby>({
    isJoined: false,
    isLobbyOpened: false,
    isSelectingGameMode: false,
    title: "Battle",
    isOnline: false,
    battleOptions: {
        gameMode: {
            id: GameModeID.CLASSIC,
            label: getTranslatedGameMode(GameModeID.CLASSIC),
            options: {},
        },
        mapOptions: {
            startPosType: StartPosType.Boxes,
            startBoxesIndex: 0,
        },
        restrictions: [],
    },
    teams: [],
    spectators: [],
    started: false,
});

export function getTranslatedGameMode(gameMode: GameModeID): string {
    switch (gameMode) {
        case GameModeID.CLASSIC:
            return i18n.global.t("lobby.components.battle.gameModeComponent.gameModeClassic");
        case GameModeID.FFA:
            return i18n.global.t("lobby.components.battle.gameModeComponent.gameModeFFA");
        case GameModeID.RAPTORS:
            return i18n.global.t("lobby.components.battle.gameModeComponent.gameModeRaptors");
        case GameModeID.SCAVENGERS:
            return i18n.global.t("lobby.components.battle.gameModeComponent.gameModeScavengers");
        case GameModeID.SKIRMISH:
            return i18n.global.t("lobby.components.battle.gameModeComponent.gameModeSkirmish");
        default:
            return i18n.global.t("lobby.components.battle.gameModeComponent.gameModeUnknown");
    }
}

// Automatically computing metadata for the battle
const _battleWithMetadataStore = reactive({} as BattleWithMetadata);
export const battleWithMetadataStore = readonly(_battleWithMetadataStore);
watch(
    battleStore,
    (battle) => {
        Object.assign(_battleWithMetadataStore, battle);
        _battleWithMetadataStore.participants = battle.teams.flatMap((team) => team.participants);
        _battleWithMetadataStore.bots = _battleWithMetadataStore.participants.filter((participant) => "aiShortName" in participant);
        _battleWithMetadataStore.players = _battleWithMetadataStore.participants.filter((participant) => "user" in participant);
        if (battle.started && !_battleWithMetadataStore.startTime) _battleWithMetadataStore.startTime = new Date();
    },
    { deep: true }
);

// Actions
function removeFromTeams(participant: Player | Bot) {
    battleStore.teams = battleStore.teams.map((team) => {
        return { participants: team.participants.filter((p) => p.id !== participant.id) };
    });
}

function removeFromSpectators(participant: Player) {
    const index = battleStore.spectators.findIndex((p) => p.id === participant.id);
    if (index !== -1) battleStore.spectators.splice(index, 1);
}

function removeTeam(teamId: number) {
    if (!battleStore.teams[teamId]) {
        console.error(`Trying to remove team with teamId=${teamId}`, "Teams:", battleStore.teams);
        return;
    }

    const players = battleStore.teams[teamId].participants.filter(isPlayer);
    const bots = battleStore.teams[teamId].participants.filter((p) => isBot(p) && !isScavenger(p) && !isRaptor(p));
    const scavengersOrRaptors = battleStore.teams[teamId].participants.filter(isScavengerOrRaptor);

    battleStore.teams.splice(teamId, 1);

    const maxPlayersPerTeam = getMaxPlayersPerTeam();

    //  first handle scavs/raptors to ensure they are alone in the last team
    if (scavengersOrRaptors.length > 0) {
        const lastTeam = battleStore.teams.at(-1);
        if (lastTeam && lastTeam.participants.length > 0) {
            players.push(...lastTeam.participants.filter(isPlayer));
            bots.push(...lastTeam.participants.filter(isBot));
            lastTeam.participants = [...scavengersOrRaptors.splice(0)];
        }
    }

    // then handle all players to not force spec when bots can be removed
    for (const team of battleStore.teams.values()) {
        if (team.participants.filter(isScavengerOrRaptor).length > 0) continue;

        if (team.participants.length < maxPlayersPerTeam) {
            const numberOfPlayersToAdd = maxPlayersPerTeam - team.participants.length;
            team.participants.push(...players.splice(0, numberOfPlayersToAdd));
        }
    }

    // finally handle regular bots the same as players
    for (const team of battleStore.teams.values()) {
        if (team.participants.filter(isScavengerOrRaptor).length > 0) continue;

        if (team.participants.length < maxPlayersPerTeam) {
            const numberOfBotsToAdd = maxPlayersPerTeam - team.participants.length;
            team.participants.push(...bots.splice(0, numberOfBotsToAdd));
        }
    }

    // force spec or remove bots if any are left
    const extraParticipants = [...players, ...bots, ...scavengersOrRaptors];
    if (extraParticipants.length > 0) {
        extraParticipants.forEach((participant) => (isPlayer(participant) ? movePlayerToSpectators(participant) : removeBot(participant)));
    }

    removeCustomStartBox(teamId);
}

function addTeam() {
    battleStore.teams.push({ participants: [] } as Team);
    addCustomStartBox();
}

function addBot(ai: EngineAI | GameAI, teamId: number) {
    if (!battleStore.me) throw new Error("failed to access current player");

    // Ensure the team exists before adding a bot to it
    if (!battleStore.teams[teamId]) {
        addTeam();
        // If we just added a team, it might not be at the expected index
        // Ensure we have enough teams
        while (battleStore.teams.length <= teamId) {
            addTeam();
        }
    }

    battleStore.teams[teamId].participants.push({
        id: participantId++,
        name: ai.name,
        aiOptions: {},
        aiShortName: ai.shortName,
        host: battleStore.me.id,
    } satisfies Bot);
}

function removeBot(bot: Bot) {
    removeFromTeams(bot);
}

function duplicateBot(bot: Bot, teamId: number) {
    const newBot = {
        ...bot,
        id: participantId++,
    };
    battleStore.teams[teamId].participants.push(newBot);
}

function updateBotOptions(bot: Bot, options: Record<string, unknown>) {
    const foundBot = battleStore.teams
        .flat()
        .filter((p) => isBot(p))
        .find((p) => p.id === bot.id);
    if (!foundBot) {
        throw Error(`Failed to find bot ${bot.name} (${bot.id})`);
    }
    bot.aiOptions = options;
}

function movePlayerToTeam(player: Player, teamId: number) {
    removeFromTeams(player);
    removeFromSpectators(player);
    if (!battleStore.teams[teamId]) addTeam();
    battleStore.teams[teamId].participants.push(player);
}

function movePlayerToSpectators(player: Player) {
    removeFromTeams(player);
    removeFromSpectators(player);
    battleStore.spectators.push(player);
}

function moveBotToTeam(bot: Bot, teamId: number) {
    removeFromTeams(bot);
    if (!battleStore.teams[teamId]) addTeam();
    battleStore.teams[teamId].participants.push(bot);
}

function getNumberOfTeams(): number {
    // FFA mode always has 1 team
    if (battleStore.battleOptions.gameMode.id === GameModeID.FFA) {
        return 1;
    }

    let numberOfTeams = 2;

    const map = battleStore.battleOptions.map;

    if (!map) throw new Error("failed to access battle options map");

    if (battleStore.battleOptions.mapOptions.startPosType === StartPosType.Boxes) {
        const startBoxIndex = battleStore.battleOptions.mapOptions.startBoxesIndex;

        if (startBoxIndex != undefined) {
            const startBoxes = map.startboxesSet?.[startBoxIndex];
            if (startBoxes?.startboxes) {
                numberOfTeams = startBoxes.startboxes.length;
            }
        } else if (battleStore.battleOptions.mapOptions.customStartBoxes) {
            numberOfTeams = battleStore.battleOptions.mapOptions.customStartBoxes.length;
        }
    }

    if (battleStore.battleOptions.mapOptions.startPosType === StartPosType.Fixed || 
        battleStore.battleOptions.mapOptions.startPosType === StartPosType.Random) {
        if (!map.startPos || !map.startPos.team) {
            // Map doesn't have fixed positions, default to 2 teams
            return 2;
        }

        const fixedPositionsIndex = battleStore.battleOptions.mapOptions.fixedPositionsIndex ?? 0;
        if (fixedPositionsIndex >= map.startPos.team.length) {
            // Index out of bounds, default to 2 teams
            return 2;
        }

        const teamPreset = map.startPos.team[fixedPositionsIndex];
        numberOfTeams = teamPreset?.sides?.length || 0;
        
        // Safety check: if numberOfTeams is 0 but we have existing teams, preserve the current team count
        // This prevents teams from being cleared when switching to unsupported fixed positions
        if (numberOfTeams === 0 && battleStore.teams.length > 0) {
            return battleStore.teams.length;
        }
        
        // If still 0, default to 2 teams to prevent clearing all teams
        if (numberOfTeams === 0) {
            return 2;
        }
    }

    return numberOfTeams;
}

function getMaxPlayersPerTeam() {
    // If custom team size is set, use it
    if (battleStore.battleOptions.mapOptions.customTeamSize !== undefined) {
        return battleStore.battleOptions.mapOptions.customTeamSize;
    }

    // For FFA mode, return custom team size (used for max players) or default to 8, but allow up to 16
    if (battleStore.battleOptions.gameMode.id === GameModeID.FFA) {
        if (battleStore.battleOptions.mapOptions.customTeamSize !== undefined) {
            return Math.min(battleStore.battleOptions.mapOptions.customTeamSize, 16);
        }
        return 8;
    }

    let maxPlayersPerTeam: number | null = null;

    const map = battleStore.battleOptions.map;

    if (!map) return 0;

    if (battleStore.battleOptions.mapOptions.startPosType === StartPosType.Boxes) {
        const startBoxIndex = battleStore.battleOptions.mapOptions.startBoxesIndex;

        if (startBoxIndex != undefined) {
            const startBoxes = map.startboxesSet?.[startBoxIndex];
            if (startBoxes?.maxPlayersPerStartbox) {
                maxPlayersPerTeam = startBoxes.maxPlayersPerStartbox;
            }
        } else if (battleStore.battleOptions.mapOptions.customStartBoxes) {
            maxPlayersPerTeam = Math.round(map.playerCountMax / battleStore.battleOptions.mapOptions.customStartBoxes.length);
        }
    }

    if (battleStore.battleOptions.mapOptions.startPosType === StartPosType.Fixed || 
        battleStore.battleOptions.mapOptions.startPosType === StartPosType.Random) {
        if (!map.startPos || !map.startPos.team) return 0;

        const fixedPositionsIndex = battleStore.battleOptions.mapOptions.fixedPositionsIndex ?? 0;
        if (fixedPositionsIndex >= map.startPos.team.length) {
            return 0;
        }

        const teamPreset = map.startPos.team[fixedPositionsIndex];
        maxPlayersPerTeam = teamPreset?.playersPerTeam || 0;
    }

    return maxPlayersPerTeam || 0;
}

function updateTeams() {
    if (!battleStore.battleOptions.map) return;
    const numberOfTeams = getNumberOfTeams();

    // Adjust number of teams
    if (battleStore.teams.length < numberOfTeams) {
        for (let i = 0; i < numberOfTeams - battleStore.teams.length; i++) addTeam();
    } else if (battleStore.teams.length > numberOfTeams) {
        for (let i = battleStore.teams.length - 1; i + 1 > numberOfTeams; i--) removeTeam(i);
    }

    // Adjust number of participants per team
    const maxPartipantsPerTeam = getMaxPlayersPerTeam();
    const extraParticipants: Array<Player | Bot> = [];
    for (const team of battleStore.teams.values()) {
        if (team.participants.filter(isScavengerOrRaptor).length > 0) continue;

        if (team.participants.length > maxPartipantsPerTeam) {
            extraParticipants.push(...team.participants.splice(maxPartipantsPerTeam));
        } else {
            team.participants.push(...extraParticipants.splice(0, maxPartipantsPerTeam - team.participants.length));
        }
    }
}

function getCurrentStartBoxes(): Array<StartBox> {
    const startBoxesIndex = battleStore.battleOptions.mapOptions.startBoxesIndex;
    return startBoxesIndex != undefined
        ? battleStore.battleOptions.map?.startboxesSet?.at(startBoxesIndex)?.startboxes?.map((box) => spadsBoxToStartBox(box.poly)) || []
        : (battleStore.battleOptions.mapOptions.customStartBoxes as Array<StartBox>);
}

function addCustomStartBox() {
    const customBoxes = battleStore.battleOptions.mapOptions.customStartBoxes;

    if (customBoxes == undefined) return;

    if (customBoxes.length == 0) {
        // Add a default box with proper sizing at the top-left of the map
        const defaultBox = {
            top: 0.0,
            bottom: 1,
            left: 0.0,
            right: 0.25,
        };
        battleStore.battleOptions.mapOptions.customStartBoxes = [...customBoxes, defaultBox];
    } else {
        const lastBox = customBoxes.at(-1);
        if (lastBox == undefined) return;
        battleStore.battleOptions.mapOptions.customStartBoxes = [...customBoxes, lastBox];
    }
}

function removeCustomStartBox(boxId: number) {
    const customBoxes = battleStore.battleOptions.mapOptions.customStartBoxes;

    if (customBoxes == undefined || customBoxes.length == 0) return;

    if (customBoxes[boxId]) {
        const newBoxes = customBoxes.filter((_, index) => index !== boxId);
        battleStore.battleOptions.mapOptions.customStartBoxes = newBoxes;
    }
}

function defaultOfflineBattle(engine?: EngineVersion, game?: GameVersion, map?: MapData) {
    const barbAi = engine?.ais.find((ai) => ai.shortName === "BARb");
    const battle: Battle = {
        title: i18n.global.t("lobby.components.battle.offlineBattleComponent.offlineBattle"),
        isOnline: false,
        battleOptions: {
            engineVersion: engine?.id || enginesStore.selectedEngineVersion?.id,
            gameVersion: game?.gameVersion || gameStore.selectedGameVersion?.gameVersion,
            gameMode: {
                id: GameModeID.CLASSIC,
                label: getTranslatedGameMode(GameModeID.CLASSIC),
                options: {},
            },
            map,
            mapOptions: {
                startPosType: StartPosType.Boxes,
                startBoxesIndex: 0,
            },
            restrictions: [],
        },
        teams: [{ participants: [] }, { participants: [] }],
        spectators: [],
        started: false,
    };

    const mePlayer: Player = {
        id: participantId++,
        user: me,
        name: me.username,
        contentSyncState: {
            engine: 1,
            game: 1,
            map: map?.isInstalled ? 1 : 0,
        },
        inGame: false,
    };

    battle.me = mePlayer;

    battle.teams[0].participants.push(mePlayer);

    const defaultBot = {
        id: participantId++,
        host: mePlayer.id,
        aiOptions: {},
        faction: Faction.Armada,
        name: "AI 1",
        aiShortName: barbAi?.shortName || "BARb",
    } satisfies Bot;

    battle.teams[1].participants.push(defaultBot);

    return battle;
}

function resetToDefaultBattle(engine?: EngineVersion, game?: GameVersion, map?: MapData) {
    const battle = defaultOfflineBattle(engine, game, map);
    Object.assign(battleStore, battle);
}

async function startBattle() {
    await startGame(deepToRaw(_battleWithMetadataStore));
}

// Automatically compute my battle status given the changes in the battle
watch(
    battleWithMetadataStore,
    (battle) => {
        if (battle.spectators.find((spectator) => spectator.user.userId === me.userId)) {
            me.battleRoomState.isSpectator = true;
            me.battleRoomState.isReady = true;
            delete me.battleRoomState.teamId;
        } else {
            me.battleRoomState.isSpectator = false;
            // iterate over the map id, team to find the user's team
            battle.teams.forEach((team, teamId) => {
                if (
                    team.participants.find((participant) => {
                        return participant && "user" in participant && participant.user.userId === me.userId;
                    })
                ) {
                    me.battleRoomState.teamId = teamId;
                }
            });
        }
    },
    { deep: true }
);

watch(
    () => battleStore.battleOptions.mapOptions,
    () => {
        updateTeams();
    },
    { deep: true }
);

watch(
    () => battleStore.battleOptions.map,
    () => {
        // Preserve FFA's Random startPosType when map changes
        if (battleStore.battleOptions.gameMode.id !== GameModeID.FFA) {
            battleStore.battleOptions.mapOptions.startPosType = StartPosType.Boxes;
            battleStore.battleOptions.mapOptions.startBoxesIndex = 0;
        }
        if (battleStore.me) battleStore.me.contentSyncState.map = battleStore.battleOptions.map?.isInstalled ? 1 : 0;
        updateTeams();
    },
    { deep: true }
);

// Watch for map installation changes to update contentSyncState
watch(
    () => battleStore.battleOptions.map?.isInstalled,
    (isInstalled) => {
        if (battleStore.me && battleStore.battleOptions.map) {
            battleStore.me.contentSyncState.map = isInstalled ? 1 : 0;
        }
    }
);

watch(
    () => enginesStore.selectedEngineVersion,
    () => {
        const engineVersion = enginesStore.selectedEngineVersion;
        if (!engineVersion) throw new Error("failed to access engine version");

        battleStore.battleOptions.engineVersion = engineVersion.id;
    }
);

watch(
    () => gameStore.selectedGameVersion,
    (gameVersion) => {
        if (!gameVersion) throw new Error("failed to access game version");

        battleStore.battleOptions.gameVersion = gameVersion.gameVersion;
    }
);

function leaveBattle() {
    battleStore.isJoined = false;
    resetToDefaultBattle();
}

async function loadGameMode(gameMode: GameModeID) {
    if (!battleStore.battleOptions.engineVersion) {
        const engineVersion = enginesStore.selectedEngineVersion;
        if (!engineVersion) throw new Error("failed to access engine version");

        battleStore.battleOptions.engineVersion = engineVersion.id;
    }
    if (!battleStore.battleOptions.gameVersion) {
        if (!gameStore.selectedGameVersion) throw new Error("failed to access game version");

        battleStore.battleOptions.gameVersion = gameStore.selectedGameVersion.gameVersion;
    }
    if (!battleStore.battleOptions.map) {
        const randomMap = await getRandomMap();
        battleStore.battleOptions.map = randomMap;
    }

    switch (gameMode) {
        case GameModeID.CLASSIC:
            removeCoopAIs();
            battleStore.title = getTranslatedGameMode(GameModeID.CLASSIC);
            battleStore.battleOptions = {
                ...battleStore.battleOptions,
                gameMode: {
                    id: GameModeID.CLASSIC,
                    label: getTranslatedGameMode(GameModeID.CLASSIC),
                    options: {},
                },
                mapOptions: {
                    startPosType: StartPosType.Boxes,
                    startBoxesIndex: 0,
                },
                restrictions: [],
            };
            break;
        case GameModeID.RAPTORS:
            addCoopAI("RaptorsAI");
            battleStore.title = getTranslatedGameMode(GameModeID.RAPTORS);
            battleStore.battleOptions = {
                ...battleStore.battleOptions,
                gameMode: {
                    id: GameModeID.RAPTORS,
                    label: getTranslatedGameMode(GameModeID.RAPTORS),
                    options: {},
                },
                mapOptions: {
                    startPosType: StartPosType.Boxes,
                    startBoxesIndex: 0,
                },
                restrictions: [],
            };
            break;
        case GameModeID.SCAVENGERS:
            addCoopAI("ScavengersAI");
            battleStore.title = getTranslatedGameMode(GameModeID.SCAVENGERS);
            battleStore.battleOptions = {
                ...battleStore.battleOptions,
                gameMode: {
                    id: GameModeID.SCAVENGERS,
                    label: getTranslatedGameMode(GameModeID.SCAVENGERS),
                    options: {},
                },
                mapOptions: {
                    startPosType: StartPosType.Boxes,
                    startBoxesIndex: 0,
                },
                restrictions: [],
            };
            break;
        case GameModeID.FFA:
            removeCoopAIs();
            battleStore.title = getTranslatedGameMode(GameModeID.FFA);
            battleStore.battleOptions = {
                ...battleStore.battleOptions,
                gameMode: {
                    id: GameModeID.FFA,
                    label: getTranslatedGameMode(GameModeID.FFA),
                    options: {},
                },
                mapOptions: {
                    startPosType: StartPosType.Random, // FFA uses random positions instead of boxes
                    fixedPositionsIndex: 0,
                },
                restrictions: [],
            };
            break;
        default:
            console.error("Unknown game mode", gameMode);
    }
}

function removeCoopAIs() {
    for (const team of battleStore.teams) team.participants.forEach((p) => isBot(p) && (isScavenger(p) || isRaptor(p)) && removeBot(p));
}

function addCoopAI(coopAI: "RaptorsAI" | "ScavengersAI") {
    if (!gameStore.selectedGameVersion) throw new Error("failed to retrieve game version");

    removeCoopAIs();

    // Ensure we have at least 2 teams (team 0 for players, team 1 for coop AI)
    while (battleStore.teams.length < 2) {
        addTeam();
    }

    const ai = gameStore.selectedGameVersion.ais.find((ai) => ai.shortName === coopAI);

    if (ai) addBot(ai, 1);

    // Ensure team 1 exists before accessing it
    if (!battleStore.teams[1]) return;

    for (const participant of battleStore.teams[1].participants) {
        if (isPlayer(participant)) {
            if (battleStore.teams[0].participants.length < getMaxPlayersPerTeam()) {
                movePlayerToTeam(participant, 0);
            } else {
                movePlayerToSpectators(participant);
            }
        } else if (isBot(participant)) {
            if (isRaptor(participant) || isScavenger(participant)) continue;

            if (battleStore.teams[0].participants.length < getMaxPlayersPerTeam()) {
                moveBotToTeam(participant, 0);
            } else {
                removeBot(participant);
            }
        }
    }
}

function setParticipantBonus(participant: Player | Bot, bonus: number) {
    participantBonuses.set(participant.id, bonus);
    // Also update incomeMultiplier: bonus 100% = 2.0x income, bonus 0% = 1.0x income
    // Formula: incomeMultiplier = 1 + (bonus / 100)
    participant.incomeMultiplier = 1 + (bonus / 100);
}

function getParticipantBonus(participant: Player | Bot): number {
    return participantBonuses.get(participant.id) ?? 0;
}

export const battleActions = {
    movePlayerToTeam,
    movePlayerToSpectators,
    moveBotToTeam,
    addTeam,
    removeTeam,
    addBot,
    removeBot,
    duplicateBot,
    updateBotOptions,
    startBattle,
    updateTeams,
    resetToDefaultBattle,
    leaveLobby: leaveBattle,
    loadGameMode,
    getMaxPlayersPerTeam,
    getCurrentStartBoxes,
    setParticipantBonus,
    getParticipantBonus,
};

// Needs game files to exists.
export async function initBattleStore() {
    resetToDefaultBattle();
    
    // Listen for map download completion to update contentSyncState
    window.downloads.onDownloadMapComplete(async (downloadInfo) => {
        // If the downloaded map is the current map in battleStore, update contentSyncState
        if (battleStore.battleOptions.map?.springName === downloadInfo.name && battleStore.me) {
            battleStore.me.contentSyncState.map = 1;
            // Refresh the map object from the database to get updated isInstalled status
            const { db } = await import("@renderer/store/db");
            const updatedMap = await db.maps.get(downloadInfo.name) || await db.nonLiveMaps.get(downloadInfo.name);
            if (updatedMap && battleStore.battleOptions.map?.springName === updatedMap.springName) {
                // Update the map object with fresh data from database
                Object.assign(battleStore.battleOptions.map, updatedMap);
            }
        }
    });
    
    // Listen for map added event (when map is detected after download)
    window.maps.onMapAdded(async (springName: string) => {
        // If the added map is the current map in battleStore, update contentSyncState
        if (battleStore.battleOptions.map?.springName === springName && battleStore.me) {
            battleStore.me.contentSyncState.map = 1;
            // Refresh the map object from the database to get updated isInstalled status
            const { db } = await import("@renderer/store/db");
            const updatedMap = await db.maps.get(springName) || await db.nonLiveMaps.get(springName);
            if (updatedMap && battleStore.battleOptions.map?.springName === updatedMap.springName) {
                // Update the map object with fresh data from database
                Object.assign(battleStore.battleOptions.map, updatedMap);
            }
        }
    });
}
