<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="contender body-2 gap-xs" :class="{ color: Boolean(color) }">
        <Flag v-if="'countryCode' in contender" class="flag" :countryCode="contender.countryCode" />
        <Icon v-if="'aiId' in contender" :icon="robot" :height="16" />
        <div>{{ name }}</div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import robot from "@iconify-icons/mdi/robot";
import { computed } from "vue";
import Flag from "@renderer/components/misc/Flag.vue";

const props = defineProps<{
    contender: { name: string; rgbColor?: { r: number; g: number; b: number }; countryCode?: string; aiId?: number };
}>();

const name = computed(() => props.contender.name);

const color = computed(() => {
    if ("rgbColor" in props.contender) {
        return `rgb(${props.contender.rgbColor?.r}, ${props.contender.rgbColor?.g}, ${props.contender.rgbColor?.b})`;
    }
    return null;
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.contender {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: map.get($spacing, "xxs") 6px; /* 6px: off-scale, no exact token */
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    // &.color { // disabled for now because colors need to be parsed from packet stream (because of colour gadget), and we want to skip packet parsing to speed things up
    //     padding-left: 10px;
    //     &:before {
    //         @extend .fullsize;
    //         left: 0;
    //         top: 0;
    //         width: 4px;
    //         background: v-bind(color);
    //     }
    // }
}
.flag {
    width: 16px;
}
</style>
