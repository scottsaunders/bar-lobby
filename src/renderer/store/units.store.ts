// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { UnitData, UnitFaction, UnitType } from "@main/content/game/unit-data";
import { reactive } from "vue";

export const unitsStore: {
    units: UnitData[];
    isLoading: boolean;
    isLoaded: boolean;
    loadedForVersion: string | null;
    filters: {
        factions: Partial<Record<UnitFaction, boolean>>;
        types: Partial<Record<UnitType, boolean>>;
        techLevels: Partial<Record<number, boolean>>;
    };
} = reactive({
    units: [],
    isLoading: false,
    isLoaded: false,
    loadedForVersion: null,
    filters: {
        factions: {},
        types: {},
        techLevels: {},
    },
});

export async function loadUnits(gameVersion: string) {
    if (unitsStore.isLoaded && unitsStore.loadedForVersion === gameVersion) return;
    if (unitsStore.isLoading) return;

    unitsStore.isLoading = true;
    try {
        const units = await window.game.getUnits(gameVersion);
        const enLang = await import("@renderer/assets/languages/en.json");
        const nameMap = enLang.default.units.names as Record<string, string>;
        for (const unit of units) {
            const localized = nameMap[unit.unitName];
            if (localized) unit.name = localized;
        }
        unitsStore.units = units;
        unitsStore.loadedForVersion = gameVersion;
        unitsStore.isLoaded = true;
    } catch (err) {
        console.error("Failed to load units:", err);
    } finally {
        unitsStore.isLoading = false;
    }
}
