// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type PartyMemberStatus = "online" | "offline" | "in-game" | "in-queue";

export interface PartyMemberGame {
    type: "custom-lobby" | "scenario" | "skirmish" | "ranked";
    name: string;
    lobbyId?: string;
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

/** Pre-defined friends available to invite in the prototype. */
export const MOCK_INVITABLE_FRIENDS: PartyMember[] = [
    {
        id: "f1", name: "StarCrusher", status: "online", isLeader: false, isMe: false, avatarColor: "#2563eb",
        currentGame: { type: "custom-lobby", name: "Galaxy Defenders #42", lobbyId: "lobby-42" },
    },
    {
        id: "f2", name: "NovaByte", status: "online", isLeader: false, isMe: false, avatarColor: "#9333ea",
        currentGame: { type: "ranked", name: "Ranked Duel" },
    },
    {
        id: "f3", name: "IronWolf", status: "online", isLeader: false, isMe: false, avatarColor: "#ea580c",
        currentGame: { type: "skirmish", name: "Skirmish vs AI" },
    },
    {
        id: "f4", name: "VoidReaper", status: "online", isLeader: false, isMe: false, avatarColor: "#0891b2",
        currentGame: { type: "scenario", name: "The Last Stand" },
    },
    { id: "f5", name: "ApexDawn",    status: "online", isLeader: false, isMe: false, avatarColor: "#65a30d" },
    { id: "f6", name: "TitanRush",   status: "online", isLeader: false, isMe: false, avatarColor: "#b45309" },
    { id: "f7", name: "PulseStrike", status: "online", isLeader: false, isMe: false, avatarColor: "#be185d" },
];

export const ME_PARTY_MEMBER: PartyMember = {
    id: "me",
    name: "You",
    status: "online",
    isLeader: true,
    isMe: true,
    avatarColor: "#22c55e",
};
