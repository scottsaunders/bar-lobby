<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Menu", order: 0, hide: true, transition: { name: "slide-left" } } }
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

                    <InteractiveTile class="game-mode-card" @click="startCampaign">
                        <template #content>
                            <h3>{{ t("lobby.views.play.campaign.title") }}</h3>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card" @click="startMatchmaking">
                        <template #content>
                            <h3>{{ t("lobby.views.play.matchmaking.title") }}</h3>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card" @click="startCustomLobbies">
                        <template #content>
                            <h3>{{ t("lobby.views.play.customLobbies.title") }}</h3>
                        </template>
                    </InteractiveTile>

                    <InteractiveTile class="game-mode-card" @click="openTournaments">
                        <template #content>
                            <h3>{{ t("lobby.views.play.tournaments.title") }}</h3>
                        </template>
                    </InteractiveTile>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const router = useRouter();

// Game mode handlers
const startSkirmish = () => {
    router.push("/play/skirmish");
};

const startCampaign = () => {
    router.push("/play/campaign");
};

const startMatchmaking = () => {
    router.push("/play/matchmaking");
};

const startCustomLobbies = () => {
    router.push("/play/customLobbies");
};

const openScenarios = () => {
    router.push("/play/scenarios");
};

const openTournaments = () => {
    router.push("/play/tournaments");
};
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-adjust-bottom {
    padding-bottom: map.get($spacing, "xl");
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
    padding: map.get($spacing, "xxxxl") map.get($spacing, "xxxxl");
}

.game-modes-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: map.get($spacing, "xl");
    margin: 0 0;
    flex: 1;
}

.game-mode-card {
    min-height: 96px;
}

@media (max-width: 1200px) {
    .game-modes-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .game-menu-container {
        padding: map.get($spacing, "xl");
    }

    .game-modes-grid {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(6, minmax(150px, auto));
        gap: map.get($spacing, "lg");
    }

    .game-mode-card {
        min-height: 225px;
    }
}
</style>

