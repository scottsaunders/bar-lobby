<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Tournaments", order: 6, devOnly: true, onlineOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.tournaments.title") }}</h1>
                <p>{{ t("lobby.views.play.tournaments.description") }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map-get($spacing, "xxl") map-get($spacing, "sm") map-get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
    
    .view-title {
        padding-left: 0; // Ensure title isn't cut off - padding is handled by view-container
    }
}
</style>
