<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Menu", order: 0, devOnly: true, hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view view-adjust-bottom">
        <div class="move-left">
            <div class="game-menu-container">
                <div class="game-modes-grid">
                    <InteractiveTile class="game-mode-card" @click="openScenarios">
                        <template #content>
                            <h3>{{ t("lobby.views.play.scenarios") }}</h3>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card" @click="startSkirmish">
                        <template #content>
                            <h3>{{ t("lobby.views.play.skirmish") }}</h3>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card disabled" @click="startCampaign">
                        <template #content>
                            <h3>{{ t("lobby.views.play.campaign") }}</h3>
                            <p class="body-1">{{ t("lobby.views.play.comingSoon") }}</p>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card disabled" @click="startMatchmaking">
                        <template #content>
                            <h3>{{ t("lobby.views.play.matchmaking") }}</h3>
                            <p class="body-1">{{ t("lobby.views.play.comingSoon") }}</p>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card disabled" @click="startCustomLobbies">
                        <template #content>
                            <h3>{{ t("lobby.views.play.customLobbies") }}</h3>
                            <p class="body-1">{{ t("lobby.views.play.comingSoon") }}</p>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card disabled" @click="openTournaments">
                        <template #content>
                            <h3>{{ t("lobby.views.play.tournaments") }}</h3>
                            <p class="body-1">{{ t("lobby.views.play.comingSoon") }}</p>
                        </template>
                    </InteractiveTile>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { useRouter } from "vue-router";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import { settingsStore } from "@renderer/store/settings.store";
import { battleStore } from "@renderer/store/battle.store";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const router = useRouter();

watch(
    () => battleStore.isSelectingGameMode,
    (newValue) => {
        battleStore.isLobbyOpened = !newValue;
    }
);

// Game mode handlers
const startSkirmish = () => {
    //router.push("/play/skirmishVsAi");
    battleStore.isSelectingGameMode = true;
};

const startCampaign = () => {
    if (settingsStore.devMode) {
        router.push("/play/campaign");
    }
};

const startMatchmaking = () => {
    if (settingsStore.devMode) {
        router.push("/play/matchmaking");
    }
};

const startCustomLobbies = () => {
    if (settingsStore.devMode) {
        router.push("/play/customLobbies");
    }
};

const openScenarios = () => {
    router.push("/play/scenarios");
};

const openTournaments = () => {
    if (settingsStore.devMode) {
        router.push("/play/tournaments");
    }
};
</script>

<style lang="scss" scoped>
.disabled {
    opacity: 60%;
    pointer-events: none;
}
.view-adjust-bottom {
    padding-bottom: 30px;
    display: flex;
    flex-direction: column-reverse;
}
.move-left {
    display: flex;
    flex-direction: row;
}
.game-menu-container {
    display: flex;
    flex-direction: column;
    width: 28%;
    height: 100%;
    padding: 40px 40px;
}

.game-modes-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20px;
    margin: 0 0;
    flex: 1;
}

.game-mode-card {
    min-height: 96px; // 50% taller (64px * 1.5 = 96px)
}

@media (max-width: 1200px) {
    .game-modes-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .game-menu-container {
        padding: 20px;
    }

    .game-modes-grid {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(6, minmax(150px, auto));
        gap: 15px;
    }

    .game-mode-card {
        min-height: 225px; // 50% taller (150px * 1.5 = 225px)
    }
}
</style>
