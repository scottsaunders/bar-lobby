<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="participant" data-type="participant" @mouseenter.stop="onMouseEnter">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import { audioApi } from "@renderer/audio/audio";

function onMouseEnter() {
    audioApi.play("button-hover");
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.participant {
    height: map.get($spacing, "xxl");
    width: 100%;
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 16px;
    font-weight: 400;
    font-family: Poppins, sans-serif;
    line-height: 1.4;
    backdrop-filter: blur(5px);
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.8));
    box-sizing: border-box;
    &.dragging {
        pointer-events: auto;
    }
    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>
