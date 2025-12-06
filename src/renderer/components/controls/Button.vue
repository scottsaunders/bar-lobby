<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Control 
        class="button" 
        :class="[{ active }, $attrs.class]" 
        :style="$attrs.style" 
        :disabled="disabled" 
        @click="onClick"
    >
        <PrimeVueButton 
            v-bind="$attrs"
            v-tooltip.bottom="tooltipValue"
        >
            <div class="button-content">
                <div v-if="$slots.icon" class="icon leading">
                    <slot name="icon" />
                </div>
                <slot />
                <div v-if="$slots['icon-right']" class="icon trailing">
                    <slot name="icon-right" />
                </div>
            </div>
        </PrimeVueButton>
    </Control>
</template>

<script lang="ts">
export default {
    inheritAttrs: false,
};
</script>

<script lang="ts" setup>
// https://primevue.org/button

import PrimeVueButton, { ButtonProps } from "primevue/button";
import { computed } from "vue";

import Control from "@renderer/components/controls/Control.vue";
import { useRouter } from "vue-router";

export interface Props extends /* @vue-ignore */ ButtonProps {
    to?: string;
    disabled?: boolean;
    tooltip?: string;
    showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showTooltip: false,
});

const router = useRouter();
const active = computed(() => props?.to && router.currentRoute.value.path.includes(props.to));

const tooltipEnabled = computed(() => props.showTooltip && !!props.tooltip);

// Provide tooltip text when enabled
const tooltipValue = computed(() => {
    if (tooltipEnabled.value && props.tooltip) {
        return { value: props.tooltip };
    }
    return null;
});

async function onClick() {
    if (props.to && router.currentRoute.value.path !== props.to) {
        await router.push(props.to);
    }
}
</script>

<style lang="scss" scoped>
.button {
    padding: 0;
    align-self: unset;
    &.inline {
        align-self: flex-start;
    }
    &:not(.slim) {
        .p-button {
            min-height: 33px;
        }
    }
    &.slim {
        min-height: unset;
        align-self: center;
        border-radius: 2px;
        font-size: 14px;
        font-weight: 300;
    }
}
.p-button {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 0 8px;
    border-radius: 2px;
    text-transform: capitalize;
    text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.6);
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

$btnColors: (
    "blue": rgb(37, 99, 235), // More vibrant blue for primary buttons
    "red": rgb(165, 30, 30),
    "green": rgb(34, 197, 94), // Match splash screen login button green (#22c55e)
    "yellow": rgb(243, 213, 79),
    "purple": rgb(199, 14, 199),
    "orange": rgb(199, 109, 14),
    "black": rgb(0, 0, 0),
    "white": rgb(255, 255, 255),
    "grey": rgb(128, 128, 128), // British spelling - standard for European developers
);

@each $colorKey, $color in $btnColors {
    .control.#{$colorKey} {
        background-color: rgba($color, 0.6);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        &:hover {
            background-color: rgba($color, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
    }
}

</style>
