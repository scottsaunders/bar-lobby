<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Control class="checkbox" :class="{ fill }" :label="label">
        <div class="check-wrapper" @click="onClick">
            <Icon v-if="modelValue" :icon="checkBold" height="22px" />
        </div>
    </Control>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import checkBold from "@iconify-icons/mdi/check-bold";
import { toRef } from "vue";

import Control from "@renderer/components/controls/Control.vue";

const props = withDefaults(
    defineProps<{
        modelValue?: boolean;
        label?: string;
        fill?: boolean;
    }>(),
    {
        modelValue: false,
        label: undefined,
        fill: false,
    }
);

const emits = defineEmits<{
    (event: "update:modelValue", checked: boolean): void;
}>();

const value = toRef(props, "modelValue");

function onClick() {
    emits("update:modelValue", !value.value);
}
</script>

<style lang="scss" scoped>
.checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row-reverse;
    
    // When fill is true, the checkbox component fills the available space
    &.fill {
        width: 100%;
        flex-grow: 1;
    }
    
    // Label area should always be able to expand
    :deep(.label) {
        border-right: none;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        flex-grow: 1;
        flex-shrink: 1;
        min-width: 0;
        justify-content: flex-start; // Left-align the text
    }
}

// Checkbox square area - always fixed size
.check-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0; // Never shrink the checkbox square
    width: 33px;
    height: 33px;
    min-width: 33px;
    min-height: 33px;
    max-width: 33px;
    max-height: 33px;
}
</style>
