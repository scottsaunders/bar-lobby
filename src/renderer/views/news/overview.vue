<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Overview", order: 0, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.news.overview.title") }}</h1>
            </div>
            <div class="overview-layout flex-row gap-lg fullheight">
                <div class="news-section">
                    <Suspense>
                        <NewsFeed />
                        <template #fallback><Loader class="column-loader" :absolutePosition="false" /></template>
                    </Suspense>
                </div>
                <div class="devlog-section">
                    <Suspense>
                        <DevlogFeed />
                        <template #fallback><Loader class="column-loader" :absolutePosition="false" /></template>
                    </Suspense>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Loader from "@renderer/components/common/Loader.vue";
import DevlogFeed from "@renderer/components/misc/DevlogFeed.vue";
import NewsFeed from "@renderer/components/misc/NewsFeed.vue";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0 map.get($spacing, "xxl") map.get($spacing, "sm") map.get($spacing, "xxl");
    box-sizing: border-box;
}

.overview-layout {
    width: 100%;
    height: 100%;
}

.news-section {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
}

.devlog-section {
    width: 460px;
    height: 100%;
    flex-shrink: 0;
}

.column-loader {
    position: relative;
    top: 25%;
}
</style>
