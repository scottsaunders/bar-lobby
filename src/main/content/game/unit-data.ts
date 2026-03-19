// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type UnitFaction = "Armada" | "Cortex" | "Legion" | "Scavengers" | "Other";

export type UnitType = "Aircraft" | "Bots" | "Buildings" | "Vehicles" | "Ships" | "Hovercraft" | "Seaplanes" | "Gantry" | "Other";

export interface WeaponData {
    name: string; // weapon def codename
    damage: number;
    range: number;
    reloadTime: number; // seconds
    dps: number;
    projectileSpeed: number;
    aoe: number; // area of effect radius
    weaponType: string; // e.g. "LaserCannon", "MissileLauncher", "Cannon", etc.
}

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
    turnRate: number; // degrees per second
    acceleration: number;
    brakeRate: number;
    sightRange: number;
    radarRange: number;
    sonarRange: number;
    armorType: string;

    // Builder (0 if not a builder)
    buildPower: number;
    buildRange: number;

    // Weapons (full parsed data)
    weapons: WeaponData[];
    // Weapon def names referenced by this unit (for backwards compatibility)
    weaponDefs: string[];
}
