<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Styles", order: 10, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.styles.title") }}</h1>
                <p>{{ t("lobby.styles.description") }}</p>
            </div>

            <RouterView v-slot="{ Component, route }">
                <template v-if="Component">
                    <Transition v-bind="route.meta.transition" mode="out-in">
                        <component :is="Component" />
                    </Transition>
                </template>
            </RouterView>
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
}
</style>
