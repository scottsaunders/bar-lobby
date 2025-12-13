<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Scenarios", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.singleplayer.scenarios.title") }}</h1>
                <p>{{ t("lobby.singleplayer.scenarios.description") }}</p>
            </div>
            <!-- Loading state -->
            <div v-if="isLoading" class="scenarios-loading flex-center-items fullheight">
                <Loader />
            </div>
            <!-- Content when loaded -->
            <div v-else class="scenarios-layout flex-row gap-xl">
                <Panel class="flex-grow scenarios-panel" no-padding>
                    <div class="scroll-container main-panel-scroll">
                        <div class="scenarios-grid">
                            <TransitionGroup name="fade">
                                <div
                                    v-for="scenario in scenarios"
                                    :key="scenario.title"
                                    style="height: 200px"
                                >
                                    <InteractiveTile
                                        :saturate="true"
                                        :selected="selectedScenario?.scenarioid === scenario.scenarioid"
                                        @click="selectedScenario = scenario"
                                    >
                                        <template #media>
                                            <div :style="`background-image: url('bar://${encodeURIComponent(scenario.imagepath)}')`"></div>
                                        </template>
                                        <template #content>
                                            <h3 class="title-3">{{ scenario.title }}</h3>
                                        </template>
                                    </InteractiveTile>
                                </div>
                            </TransitionGroup>
                        </div>
                    </div>
                </Panel>
                <Panel v-if="selectedScenario" class="scenario-details-panel" no-padding>
                    <div class="scenario-details-layout flex-col fullheight">
                        <h2 class="title-2 padding-left-xxl padding-top-xxl padding-right-xxl padding-bottom-lg">{{ selectedScenario.title }}</h2>
                        <div class="description-scroll scroll-container flex-grow">
                            <ScrollingTextPanel>
                                <div class="flex-col gap-md">
                                    <Markdown :source="selectedScenario.summary" />
                                    <Markdown :source="selectedScenario.briefing" />
                                </div>
                            </ScrollingTextPanel>
                        </div>
                        <div class="scenario-controls flex-col gap-md padding-left-xxl padding-right-xxl padding-top-lg padding-bottom-xxl">
                            <div class="scenario-conditions flex-col gap-sm">
                                <StatusCard variant="victory" :label="t('lobby.singleplayer.scenarios.victoryCondition')" :value="selectedScenario.victorycondition" />
                                <StatusCard variant="lose" :label="t('lobby.singleplayer.scenarios.loseCondition')" :value="selectedScenario.losscondition" />
                            </div>
                            <div>
                                <Select v-model="selectedFaction" :label="t('lobby.singleplayer.scenarios.faction')" :options="factions" />
                            </div>
                            <div>
                                <Select
                                    v-model="selectedDifficulty"
                                    :label="t('lobby.singleplayer.scenarios.difficulty')"
                                    :options="difficulties"
                                    optionLabel="name"
                                />
                            </div>
                            <DownloadContentButton
                                v-if="map"
                                :maps="[map.springName]"
                                :games="currentGameVersion ? [currentGameVersion] : []"
                                :engines="enginesStore.selectedEngineVersion ? [enginesStore.selectedEngineVersion.id] : []"
                                class="fullwidth large"
                                :disabled="gameStore.status !== GameStatus.CLOSED"
                                @click="launch"
                                >{{ t("lobby.singleplayer.scenarios.start") }}</DownloadContentButton
                            >
                            <Button v-else class="fullwidth green" disabled>{{ t("lobby.singleplayer.scenarios.start") }}</Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onActivated } from "vue";

import Button from "@renderer/components/controls/Button.vue";
import Select from "@renderer/components/controls/Select.vue";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import StatusCard from "@renderer/components/common/StatusCard.vue";
import ScrollingTextPanel from "@renderer/components/common/ScrollingTextPanel.vue";
import Loader from "@renderer/components/common/Loader.vue";
import { Scenario } from "@main/content/game/scenario";
import { LATEST_GAME_VERSION } from "@main/config/default-versions";
import Panel from "@renderer/components/common/Panel.vue";
import { db } from "@renderer/store/db";
import { MapDownloadData } from "@main/content/maps/map-data";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import Markdown from "@renderer/components/misc/Markdown.vue";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import { GameStatus, gameStore } from "@renderer/store/game.store";

import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();

import { enginesStore } from "@renderer/store/engine.store";

// Computed game version for reactivity
const currentGameVersion = computed(() => gameStore?.selectedGameVersion?.gameVersion);

// Loading state for scenarios - avoid top-level await which blocks other routes
const isLoading = ref(true);
const scenarios = ref<Scenario[]>([]);
const selectedScenario = ref<Scenario | null>(null);

// Load scenarios asynchronously on component activation (not top-level await)
async function loadScenarios() {
    const gameVersion = gameStore?.selectedGameVersion?.gameVersion;
    if (gameVersion) {
        isLoading.value = true;
        const loadedScenarios = await window.game.getScenarios(gameVersion);
        scenarios.value = loadedScenarios;
        selectedScenario.value = scenarios.value[0] ?? null;
        isLoading.value = false;
    } else {
        scenarios.value = [];
        selectedScenario.value = null;
        isLoading.value = false;
    }
}

// Load on first activation
onActivated(() => {
    if (scenarios.value.length === 0) {
        loadScenarios();
    }
});

// Also load immediately if this is the initial mount
loadScenarios();

const map = useDexieLiveQueryWithDeps([selectedScenario], async () => {
    let selected = selectedScenario.value;
    if (!selected) return;

    const [live, nonLive] = await Promise.all([db.maps.get(selected.mapfilename), db.nonLiveMaps.get(selected.mapfilename)]);

    let map = live ?? nonLive;

    if (!map) {
        map = {
            springName: selected.mapfilename,
            isDownloading: false,
            isInstalled: false,
        } satisfies MapDownloadData;
    }

    return map;
});

const difficulties = computed(() => selectedScenario.value?.difficulties ?? []);
const selectedDifficulty = ref<Scenario["difficulties"][number] | undefined>(undefined);

const factions = computed(() => selectedScenario.value?.allowedsides ?? []);
const selectedFaction = ref<string | undefined>(undefined);

watch(
    () => gameStore.selectedGameVersion?.gameVersion,
    async (selectedVersion) => {
        const loadedScenarios = selectedVersion ? await window.game.getScenarios(selectedVersion) : [];
        scenarios.value = loadedScenarios;
        selectedScenario.value = scenarios.value[0] ?? null;
    }
);

watch(selectedScenario, (newScenario) => {
    if (newScenario) {
        selectedDifficulty.value = difficulties.value.find((dif) => dif.name === newScenario.defaultdifficulty);
        selectedFaction.value = factions.value[0] ?? "Armada";
    }
});

async function launch() {
    if (!selectedScenario.value) {
        throw new Error("No scenario selected");
    }
    
    const scenarioOptions = {
        ...selectedScenario.value.scenariooptions,
        version: selectedScenario.value.version,
        difficulty: selectedDifficulty.value,
    };
    const scenarioOptionsStr = btoa(JSON.stringify(scenarioOptions));

    let restrictionsStr = "";
    let restrictionCount = 0;
    for (const [unitId, limit] of Object.entries(selectedScenario.value.unitlimits)) {
        restrictionsStr += `unit${restrictionCount}=${unitId};\nlimit${restrictionCount}=${limit};\n`;
        restrictionCount++;
    }

    const script = selectedScenario.value.startscript
        .replaceAll("__SCENARIOOPTIONS__", scenarioOptionsStr)
        //TODO replace with online name when implemented
        .replaceAll("__PLAYERNAME__", "Player")
        .replaceAll("__BARVERSION__", LATEST_GAME_VERSION)
        .replaceAll("__MAPNAME__", selectedScenario.value.mapfilename)
        .replaceAll("__PLAYERSIDE__", selectedFaction.value ?? "Armada")
        .replaceAll("__ENEMYHANDICAP__", selectedDifficulty.value?.enemyhandicap?.toString() ?? "0")
        .replaceAll("__PLAYERHANDICAP__", selectedDifficulty.value?.playerhandicap?.toString() ?? "0")
        .replaceAll("__RESTRICTEDUNITS__", restrictionsStr)
        .replaceAll("__NUMRESTRICTIONS__", restrictionCount.toString());

    if (!enginesStore.selectedEngineVersion) {
        throw new Error("No engine version selected");
    }
    await window.game.launchScript(script, LATEST_GAME_VERSION, enginesStore.selectedEngineVersion.id);
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
    padding: 0 map-get($spacing, "xxl") map-get($spacing, "sm") map-get($spacing, "xxl"); // xxl (32px) for left/right, sm (8px) for bottom
    overflow: hidden;
    box-sizing: border-box;
    
    .view-title {
        padding-left: 0; // Ensure title isn't cut off - padding is handled by view-container
    }
}

.scenarios-layout {
    width: 100%;
    height: 100%;
    min-height: 0;
    align-items: stretch; // Ensure both panels have the same height
}

.scenarios-panel {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.scenarios-grid {
    width: 100%;
    display: grid;
    grid-gap: map-get($spacing, "lg"); // lg spacing
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    padding: map-get($spacing, "xxl"); // xxl spacing (doubled from lg/16px) - padding on all sides to prevent clipping of box-shadow/outline effects
}

.scenario-details-panel {
    width: 600px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}

.scenario-details-layout {
    min-height: 0;
}

.description-scroll {
    min-height: 0;
    padding-top: 0; // No top padding
    padding-bottom: 0; // No bottom padding
    margin-left: map-get($spacing, "xxl"); // Left margin to prevent touching panel edge
    margin-right: map-get($spacing, "xxl"); // Right margin to prevent touching panel edge
}

.scenario-controls {
    flex-shrink: 0;
    
    // Ensure DownloadContentButton extends full width
    :deep(.download-button-wrapper) {
        width: 100%;
    }
}

.scenario-conditions {
    padding: map-get($spacing, "md");
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

.scenarios-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
}
</style>
