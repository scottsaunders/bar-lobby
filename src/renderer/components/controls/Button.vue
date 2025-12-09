<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Control 
        ref="controlRef"
        class="button" 
        :class="[{ active }, $attrs.class]" 
        :style="$attrs.style" 
        :disabled="disabled" 
        @click="onClick"
    >
        <PrimeVueButton 
            v-bind="$attrs"
            :disabled="disabled"
            v-tooltip.bottom="tooltipValue"
        >
            <div class="button-content" :class="buttonTextClass">
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
import { computed, ref, useAttrs, watch, nextTick } from "vue";

import Control from "@renderer/components/controls/Control.vue";
import { useRouter } from "vue-router";

export interface Props extends /* @vue-ignore */ ButtonProps {
    to?: string;
    disabled?: boolean;
    tooltip?: string;
    showTooltip?: boolean;
    matchPrefix?: string | boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showTooltip: false,
    matchPrefix: false,
});

const router = useRouter();
const attrs = useAttrs();
const controlRef = ref<InstanceType<typeof Control> | null>(null);
const active = computed(() => {
    if (!props?.to) return false;
    const currentPath = router.currentRoute.value.path;
    if (props.matchPrefix) {
        // For primary nav buttons, check if current route starts with the prefix path
        const prefixPath = typeof props.matchPrefix === 'string' ? props.matchPrefix : props.to;
        return currentPath.startsWith(prefixPath);
    }
    // Default behavior: check if current path includes the button's path
    return currentPath.includes(props.to);
});

const tooltipEnabled = computed(() => props.showTooltip && !!props.tooltip);

// Get class string from attrs - handle string, array, or object
const getClassString = computed(() => {
    const classes = attrs.class;
    if (typeof classes === 'string') {
        return classes;
    }
    if (Array.isArray(classes)) {
        return classes.filter(c => typeof c === 'string').join(' ');
    }
    if (typeof classes === 'object' && classes !== null) {
        return Object.keys(classes).filter(key => classes[key]).join(' ');
    }
    return '';
});

const isSlim = ref(false);
const isLarge = ref(false);

const updateButtonClasses = () => {
    const classStr = getClassString.value;
    isSlim.value = classStr.includes('slim');
    isLarge.value = classStr.includes('large');
    
    // Also check DOM element as fallback
    nextTick(() => {
        if (controlRef.value) {
            const el = (controlRef.value as any).$el;
            if (el?.classList) {
                if (!isSlim.value) isSlim.value = el.classList.contains('slim');
                if (!isLarge.value) isLarge.value = el.classList.contains('large');
            }
        }
    });
};

// Watch for class changes
watch(() => attrs.class, updateButtonClasses, { immediate: true, deep: true });
watch(controlRef, updateButtonClasses, { immediate: true });

const buttonTextClass = computed(() => {
    if (isSlim.value) {
        return 'body-2-strong';
    }
    if (isLarge.value) {
        return 'subtitle-1';
    }
    return 'body-1-strong';
});

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
    &:not(.slim):not(.large) {
        min-height: 48px; // Set min-height on Control wrapper (includes border with box-sizing: border-box)
        .p-button {
            min-height: 48px;
        }
    }
    &.large {
        height: 72px; // Set height on Control wrapper (includes border with box-sizing: border-box)
        .p-button {
            padding: 0 24px; // Triple padding for large buttons
            height: 100%;
        }
    }
    &.slim {
        min-height: unset;
        height: auto; // Let padding determine height
        align-self: center;
        border-radius: 2px;
        .p-button {
            height: auto; // Let padding determine height
            min-height: unset;
            padding: 4px 8px; // Use padding to define height
        }
    }
}
.p-button {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 0 8px; // Default padding, overridden by large/slim variants
    border-radius: 2px;
    
    // Override border-radius for primary nav buttons (set via class)
    .button[style*="border-radius: 0"] &,
    .button[class*="no-radius"] & {
        border-radius: 0;
    }
    text-transform: capitalize;
    text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.6);
    font-size: inherit; // Allow typography classes to control font size
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    font-size: inherit; // Ensure typography classes work correctly
    
    // Ensure typography classes override any default font sizes
    &.subtitle-1 {
        font-size: 20px;
        font-weight: 600;
        font-family: Poppins, sans-serif;
        line-height: 1.4;
    }
    &.body-1-strong {
        font-size: 16px;
        font-weight: 600;
        font-family: Poppins, sans-serif;
        line-height: 1.4;
    }
    &.body-2-strong {
        font-size: 14px;
        font-weight: 600;
        font-family: Poppins, sans-serif;
        line-height: 1.4;
    }
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
        // Override color when disabled
        &.disabled {
            background-color: rgba(128, 128, 128, 0.3) !important;
            border-color: rgba(128, 128, 128, 0.2) !important;
            box-shadow: none !important;
        }
    }
}

</style>
