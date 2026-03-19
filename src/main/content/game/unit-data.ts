// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type UnitFaction = "Armada" | "Cortex" | "Legion" | "Scavengers" | "Other";

export type UnitType = "Aircraft" | "Bots" | "Buildings" | "Vehicles" | "Ships" | "Hovercraft" | "Seaplanes" | "Gantry" | "Other";

export interface UnitData {
    unitName: string; // codename e.g. "armflea"
    name: string; // display name e.g. "Tick"
    description: string;
    faction: UnitFaction;
    unitType: UnitType;
    techLevel: number;

    // Economy
    metalCost: number;
    energyCost: number;
    buildTime: number;

    // Combat
    health: number;
    speed: number;
    sightRange: number;
    radarRange: number;
    sonarRange: number;

    // Builder (0 if not a builder)
    buildPower: number;
    buildRange: number;

    // Weapon def names referenced by this unit
    weaponDefs: string[];
}
