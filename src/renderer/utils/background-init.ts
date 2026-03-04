// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { reactive } from "vue";
import type { Router } from "vue-router";

import { fontFiles, backgroundImages } from "@renderer/assets/assetFiles";
import { randomFromArray } from "$/jaz-ts-utils/object";

export const initProgress = reactive({
    percent: 0,
    label: "",
    done: false,
});

const WEIGHTS = {
    fonts: 15,
    db: 5,
    maps: 25,
    replays: 10,
    routes: 20,
    audio: 5,
    firstRun: 15,
    finalize: 5,
};
const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
let accumulated = 0;

function advance(weight: number, label: string) {
    accumulated += weight;
    initProgress.percent = Math.min(accumulated / TOTAL_WEIGHT, 1);
    initProgress.label = label;
}

/**
 * Runs all initialization with progress tracking. Returns a promise that
 * resolves when everything is loaded and the app is ready.
 */
export async function runInit(router: Router) {
    setRandomBackground();

    initProgress.label = "Loading fonts…";
    await loadAllFonts();
    advance(WEIGHTS.fonts, "Initializing database…");

    await initDatabase();
    advance(WEIGHTS.db, "Loading maps…");

    await initMaps();
    advance(WEIGHTS.maps, "Loading replays…");

    await initReplays();
    advance(WEIGHTS.replays, "Preparing interface…");

    await preloadRoutes(router);
    advance(WEIGHTS.routes, "Loading audio…");

    await initAudio();
    advance(WEIGHTS.audio, "Checking game files…");

    await runFirstRunChecks();
    advance(WEIGHTS.firstRun, "Almost ready…");

    window.barNavigation.signalReady();
    advance(WEIGHTS.finalize, "");

    initProgress.done = true;
}

function setRandomBackground() {
    const randomBackgroundImage = randomFromArray(Object.values(backgroundImages));
    document.documentElement.style.setProperty("--background", `url(${randomBackgroundImage})`);
}

async function loadAllFonts() {
    const promises: Promise<unknown>[] = [];
    for (const fontFile of Object.values(fontFiles)) {
        const fileName = fontFile.split("/").pop()!.split(".")[0];
        const [family, weight, style] = fileName.split("-");
        const font = new FontFace(family, `url(${fontFile})`, { weight, style });
        document.fonts.add(font);
        promises.push(font.load());
    }
    await Promise.all(promises);
}

async function initDatabase() {
    const { initDb } = await import("@renderer/store/db");
    await initDb();
}

async function initMaps() {
    const { initMapsStore } = await import("@renderer/store/maps.store");
    await initMapsStore();
}

async function initReplays() {
    const { initReplaysStore } = await import("@renderer/store/replays.store");
    await initReplaysStore();
}

async function preloadRoutes(router: Router) {
    const { preloadCommonRoutes } = await import("@renderer/utils/route-preloader");
    await preloadCommonRoutes(router);
}

async function initAudio() {
    const { audioApi } = await import("@renderer/audio/audio");
    audioApi.load();
}

async function runFirstRunChecks() {
    const { defaultMaps } = await import("@main/config/default-maps");
    const { LATEST_GAME_VERSION } = await import("@main/config/default-versions");
    const { downloadGame } = await import("@renderer/store/game.store");
    const { initBattleStore } = await import("@renderer/store/battle.store");
    const { enginesStore } = await import("@renderer/store/engine.store");
    const { db } = await import("@renderer/store/db");

    if (!enginesStore.selectedEngineVersion || enginesStore.selectedEngineVersion.installed === false) {
        await window.engine.downloadEngine();
    }

    await window.game.preloadPoolData();
    await downloadGame(LATEST_GAME_VERSION);

    const installedMaps = await db.maps.count();
    if (installedMaps === 0) {
        await window.maps.downloadMaps(defaultMaps);
    }

    await initBattleStore();

    const updateAvailable = await window.autoUpdater.checkForUpdates();
    if (updateAvailable) {
        await window.autoUpdater.downloadUpdate();
        await window.autoUpdater.installUpdates();
    }

    // Fire-and-forget background map image fetch
    import("@renderer/store/maps.store").then(({ fetchMissingMapImages }) => {
        fetchMissingMapImages().catch((e) => console.warn("Background map image fetch failed:", e));
    });
}
