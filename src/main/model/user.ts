// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type User = {
    userId: string;
    username: string;
    displayName: string;
    clanId: string | null;
    partyId: string | null;
    countryCode: string;
    status: "offline" | "menu" | "playing" | "lobby";

    // Is the user me?
    isMe?: 0 | 1;

    // When user is a contender in a battle
    battleRoomState: {
        isSpectator?: boolean;
        isReady?: boolean;
        teamId?: number;
    };
    
    // Optional player stats
    rank?: number; // Skill rank (e.g., 1-6)
    chevronLevel?: number; // Chevron level (e.g., 1-5)
    skillLevel?: number; // Skill level (average 17, top 5% = 30)
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUser(user: any): user is User {
    return "username" in user;
}

export type Me = User & {
    permissions: Set<string>;
    friendUserIds: Set<string>;
    outgoingFriendRequestUserIds: Set<string>;
    incomingFriendRequestUserIds: Set<string>;
    ignoreUserIds: Set<string>;
};
