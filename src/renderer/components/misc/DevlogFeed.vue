<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Panel class="fullheight" no-padding>
        <div class="devlog-layout flex-col fullheight">
            <h2 class="title-2 padding-left-xxl padding-top-xxl padding-right-xxl padding-bottom-lg">{{ t("lobby.components.misc.devlogFeed.latestChanges") }}</h2>
            <div class="description-scroll scroll-container flex-grow">
                <ScrollingTextPanel>
                    <div class="flex-col gap-md">
                        <DevlogEntry v-for="entry in devlogRssFeed?.entries" :entry="entry" :key="entry.id" />
                    </div>
                </ScrollingTextPanel>
            </div>
        </div>
    </Panel>
</template>

<script lang="ts" setup>
import DevlogEntry from "@renderer/components/misc/DevlogEntry.vue";
import Panel from "@renderer/components/common/Panel.vue";
import ScrollingTextPanel from "@renderer/components/common/ScrollingTextPanel.vue";
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();

const devlogRssFeed = await window.misc.getDevlogRssFeed(3);
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.devlog-layout {
    min-height: 0;
}

.description-scroll {
    min-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-left: map.get($spacing, "xxl");
    margin-right: map.get($spacing, "xxl");
    margin-bottom: map.get($spacing, "xxl");
    overflow-x: hidden;
}
</style>
