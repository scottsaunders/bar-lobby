// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type PartyMemberStatus = "online" | "offline" | "in-game" | "in-queue";

export interface PartyMemberGame {
    type: "custom-lobby" | "scenario" | "skirmish" | "ranked" | "campaign";
    name: string;
    lobbyId?: string;
    mapName?: string;
    startedAt?: number;   // Date.now() at game start — used to compute elapsed time
    playerCount?: number;
    maxPlayers?: number;
    spectatable?: boolean;
}

export interface PartyMember {
    id: string;
    name: string;
    status: PartyMemberStatus;
    isLeader: boolean;
    isMe: boolean;
    avatarColor: string;
    currentGame?: PartyMemberGame;
}

export interface PartyMockState {
    inParty: boolean;
    members: PartyMember[];
}

/** Maximum party size allowed per queue. */
export const QUEUE_MAX_PARTY: Record<string, number> = {
    duel: 1,
    "small-teams": 4,
    ffa: 8,
    pve: 4,
};

/** Full mock friends list — used by the Friends panel. */
export const MOCK_FRIENDS_LIST: PartyMember[] = [
    {
        id: "f1", name: "StarCrusher", status: "in-game", isLeader: false, isMe: false, avatarColor: "#2563eb",
        currentGame: {
            type: "custom-lobby", name: "Galaxy Defenders #42", lobbyId: "lobby-42",
            mapName: "Comet Catcher Redux", startedAt: Date.now() - 754_000,
            playerCount: 4, maxPlayers: 8, spectatable: true,
        },
    },
    {
        id: "f2", name: "NovaByte", status: "in-game", isLeader: false, isMe: false, avatarColor: "#9333ea",
        currentGame: {
            type: "ranked", name: "Ranked Duel",
            mapName: "Altair Crossing", startedAt: Date.now() - 312_000,
            playerCount: 2, maxPlayers: 2, spectatable: true,
        },
    },
    {
        id: "f3", name: "IronWolf", status: "in-game", isLeader: false, isMe: false, avatarColor: "#ea580c",
        currentGame: { type: "skirmish", name: "Skirmish vs AI", mapName: "Zed's Garden" },
    },
    {
        id: "f4", name: "VoidReaper", status: "in-game", isLeader: false, isMe: false, avatarColor: "#0891b2",
        currentGame: { type: "scenario", name: "The Last Stand", mapName: "Ruins of Evon" },
    },
    { id: "f5",  name: "ApexDawn",    status: "online",  isLeader: false, isMe: false, avatarColor: "#65a30d" },
    { id: "f6",  name: "TitanRush",   status: "online",  isLeader: false, isMe: false, avatarColor: "#b45309" },
    { id: "f7",  name: "PulseStrike", status: "online",  isLeader: false, isMe: false, avatarColor: "#be185d" },
    {
        id: "f8",  name: "NightFalcon", status: "in-game", isLeader: false, isMe: false, avatarColor: "#7c3aed",
        currentGame: {
            type: "custom-lobby", name: "1v1 Ladder Night #7", lobbyId: "lobby-07",
            mapName: "Quicksilver Redux", startedAt: Date.now() - 89_000,
            playerCount: 2, maxPlayers: 2, spectatable: true,
        },
    },
    { id: "f9",  name: "SolarWarden", status: "online",  isLeader: false, isMe: false, avatarColor: "#c2410c" },
    { id: "f10", name: "GhostMerc",   status: "offline", isLeader: false, isMe: false, avatarColor: "#475569" },
    { id: "f11", name: "CrimsonEdge", status: "offline", isLeader: false, isMe: false, avatarColor: "#991b1b" },
    { id: "f12", name: "QuantumFist", status: "offline", isLeader: false, isMe: false, avatarColor: "#1e40af" },
];

/** Subset of friends that can be invited (online only) — used by PartyWidget invite flow. */
export const MOCK_INVITABLE_FRIENDS = MOCK_FRIENDS_LIST.filter((f) => f.status !== "offline");

/** Mock pool of non-friend players returned when searching to add a new friend. */
export const MOCK_PLAYER_POOL: PartyMember[] = [
    { id: "p1", name: "ArcLancer",    status: "online",  isLeader: false, isMe: false, avatarColor: "#0d9488" },
    { id: "p2", name: "StormForge",   status: "online",  isLeader: false, isMe: false, avatarColor: "#7c3aed",
      currentGame: { type: "ranked", name: "Ranked Duel" } },
    { id: "p3", name: "DuskRaider",   status: "offline", isLeader: false, isMe: false, avatarColor: "#92400e" },
    { id: "p4", name: "IceNova",      status: "online",  isLeader: false, isMe: false, avatarColor: "#0369a1" },
    { id: "p5", name: "FluxBlade",    status: "online",  isLeader: false, isMe: false, avatarColor: "#a21caf",
      currentGame: { type: "custom-lobby", name: "2v2 Draft Night", lobbyId: "lobby-99" } },
    { id: "p6", name: "EchoStrike",   status: "offline", isLeader: false, isMe: false, avatarColor: "#166534" },
    { id: "p7", name: "NullVector",   status: "online",  isLeader: false, isMe: false, avatarColor: "#b45309" },
];

/** Mock incoming friend requests. */
export interface FriendRequest {
    id: string;
    name: string;
    avatarColor: string;
}
export const MOCK_PENDING_REQUESTS: FriendRequest[] = [
    { id: "req1", name: "CobaltWing",  avatarColor: "#1d4ed8" },
    { id: "req2", name: "EmberStrike", avatarColor: "#b91c1c" },
];

export const ME_PARTY_MEMBER: PartyMember = {
    id: "me",
    name: "You",
    status: "online",
    isLeader: true,
    isMe: true,
    avatarColor: "#22c55e",
};
