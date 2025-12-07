<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="scrolling-text-panel">
        <div class="scrolling-text-panel__container">
            <div class="scrolling-text-panel__content">
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// No props needed - uses slots for content
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.scrolling-text-panel {
    width: 100%;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.scrolling-text-panel__container {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin: 0;
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    box-sizing: border-box;
}

.scrolling-text-panel__content {
    flex: 1;
    overflow-y: auto;
    padding-top: map-get($spacing, "lg");
    padding-bottom: map-get($spacing, "lg");
    padding-left: map-get($spacing, "lg");
    padding-right: map-get($spacing, "lg");
    // Fade effect only at the bottom
    mask-image: linear-gradient(
        to bottom,
        black 0%,
        black calc(100% - 20px),
        transparent 100%
    );
    -webkit-mask-image: linear-gradient(
        to bottom,
        black 0%,
        black calc(100% - 20px),
        transparent 100%
    );
}
</style>

