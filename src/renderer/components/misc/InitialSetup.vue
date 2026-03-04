<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="initial-setup fullsize flex-center">
        <h1>{{ t("lobby.components.misc.initialSetup.title") }}</h1>
        <h4>{{ text }}</h4>
        <Progress :percent="stepPercent" :height="40" style="width: 70%" />
    </div>
</template>

<script lang="ts" setup>
import { defaultMaps } from "@main/config/default-maps";
import { LATEST_GAME_VERSION } from "@main/config/default-versions";
import { initBattleStore } from "@renderer/store/battle.store";
import { db } from "@renderer/store/db";
import { enginesStore } from "@renderer/store/engine.store";
import { downloadGame } from "@renderer/store/game.store";
import { computed, onMounted, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import Progress from "@renderer/components/common/Progress.vue";

const { t } = useTypedI18n();

const emit = defineEmits<{
    (event: "complete"): void;
}>();

const text = ref("");
const completedSteps = ref(0);
const totalSteps = ref(4);
const stepPercent = computed(() => completedSteps.value / totalSteps.value);

onMounted(async () => {
    console.debug("Initial setup");

    // Step 1: Engine
    if (!enginesStore.selectedEngineVersion || enginesStore.selectedEngineVersion.installed === false) {
        text.value = t("lobby.components.misc.initialSetup.downloadingEngine");
        await window.engine.downloadEngine();
    }
    completedSteps.value++;

    // Step 2: Game
    text.value = t("lobby.components.misc.initialSetup.downloadingGame");
    await window.game.preloadPoolData();
    await downloadGame(LATEST_GAME_VERSION);
    completedSteps.value++;

    // Step 3: Maps (only if none installed)
    const installedMaps = await db.maps.count();
    if (installedMaps === 0) {
        text.value = t("lobby.components.misc.initialSetup.downloadingMaps");
        await window.maps.downloadMaps(defaultMaps);
    }
    completedSteps.value++;

    // Step 4: Updates + battle store
    const updateAvailable = await window.autoUpdater.checkForUpdates();
    if (updateAvailable) {
        text.value = t("lobby.components.misc.initialSetup.downloadingUpdate");
        await window.autoUpdater.downloadUpdate();
        await window.autoUpdater.installUpdates();
    }
    await initBattleStore();
    completedSteps.value++;

    emit("complete");
});
</script>

<style lang="scss" scoped>
.initial-setup {
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
}
</style>
