// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type MatchmakingMockStatus = "idle" | "searching" | "matchFound" | "waitingForPlayers" | "lost" | "gameStarting" | "cancelled";

export type CancelReason = "intentional" | "server_error" | "party_user_left" | "ready_timeout";

export interface MatchmakingMockState {
    status: MatchmakingMockStatus;
    playersQueued: number;
    playersReady: number;
    totalPlayers: number;
    cancelReason: CancelReason | null;
    matchMap: string;
    matchPlayers: { name: string; team: 1 | 2 }[];
    matchQueue: string;
}
