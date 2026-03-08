<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Skirmish vs AI", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.skirmishModeSelector.title") }}</h1>
                <p>{{ t("lobby.views.play.skirmishModeSelector.description") }}</p>
            </div>
            <div class="mode-grid">
                <InteractiveTile
                    v-for="mode in skirmishModes"
                    :key="mode.id"
                    class="mode-tile"
                    saturate
                    @click="selectMode(mode.id)"
                >
                    <template #media>
                        <div class="mode-media" :class="mode.mediaClass" />
                    </template>
                    <template #content>
                        <h3 class="title-3">{{ mode.title }}</h3>
                        <p class="body-2 mode-description">{{ mode.description }}</p>
                    </template>
                </InteractiveTile>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import { useTypedI18n } from "@renderer/i18n";
import { GameModeID } from "@main/game/battle/battle-types";

const { t } = useTypedI18n();
const router = useRouter();

const skirmishModes = [
    {
        id: GameModeID.CLASSIC,
        title: t("lobby.views.play.skirmishModeSelector.teamsVsAi"),
        description: t("lobby.views.play.skirmishModeSelector.teamsVsAiDescription"),
        mediaClass: "mode-teams",
    },
    {
        id: GameModeID.FFA,
        title: t("lobby.views.play.skirmishModeSelector.ffaVsAi"),
        description: t("lobby.views.play.skirmishModeSelector.ffaVsAiDescription"),
        mediaClass: "mode-ffa",
    },
    {
        id: GameModeID.RAPTORS,
        title: t("lobby.views.play.skirmishModeSelector.vsRaptors"),
        description: t("lobby.views.play.skirmishModeSelector.vsRaptorsDescription"),
        mediaClass: "mode-raptors",
    },
    {
        id: GameModeID.SCAVENGERS,
        title: t("lobby.views.play.skirmishModeSelector.vsScavengers"),
        description: t("lobby.views.play.skirmishModeSelector.vsScavengersDescription"),
        mediaClass: "mode-scavengers",
    },
];

function selectMode(modeId: GameModeID) {
    router.push({ path: "/play/skirmishVsAi", query: { mode: modeId } });
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xl");
}

.mode-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: map.get($spacing, "xl");
    flex: 1;
    min-height: 0;
}

.mode-tile {
    min-height: 200px;
}

.mode-media {
    width: 100%;
    height: 100%;
    min-height: 140px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    &.mode-teams {
        background-color: rgba(40, 60, 80, 0.9);
        background-image: linear-gradient(135deg, rgba(30, 50, 70, 0.95) 0%, rgba(50, 75, 100, 0.85) 100%);
    }

    &.mode-ffa {
        background-image: url("/src/renderer/assets/images/modes/ffa.jpg");
    }

    &.mode-raptors {
        background-image: url("/src/renderer/assets/images/modes/raptors.jpg");
    }

    &.mode-scavengers {
        background-image: url("/src/renderer/assets/images/modes/scavengers.webp");
    }
}

.mode-description {
    margin-top: map.get($spacing, "xs");
    opacity: 0.9;
}

@media (max-width: 768px) {
    .mode-grid {
        grid-template-columns: 1fr;
    }
}
</style>
