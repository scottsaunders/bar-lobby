<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Tournaments", order: 6, onlineOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.tournaments.title") }}</h1>
                <p>{{ t("lobby.views.play.tournaments.description") }}</p>
            </div>
            <Panel class="coming-soon-panel">
                <div class="coming-soon-content">
                    <Icon :icon="trophyIcon" height="64" />
                    <h2 class="title-1">{{ t("lobby.views.play.comingSoon") }}</h2>
                    <p class="body-1">Tournament features are currently in development.</p>
                </div>
            </Panel>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useTypedI18n } from "@renderer/i18n";
import Panel from "@renderer/components/common/Panel.vue";
import { Icon } from "@iconify/vue";
import trophyIcon from "@iconify-icons/mdi/trophy";

const { t } = useTypedI18n();
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map.get($spacing, "xxl") map.get($spacing, "sm") map.get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
    
    .view-title {
        padding-left: 0;
    }
}

.coming-soon-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.coming-soon-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: map.get($spacing, "lg");
    text-align: center;
    opacity: 0.7;
}
</style>
