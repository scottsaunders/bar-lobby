<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="toggle-switch" :class="{ 'on': modelValue }" @click="onClick">
        <div class="toggle-slider"></div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (event: "update:modelValue", value: boolean): void;
}>();

function onClick() {
    emit("update:modelValue", !props.modelValue);
}
</script>

<style lang="scss" scoped>
.toggle-switch {
    position: relative;
    width: 3rem;
    height: 32px;
    cursor: pointer;
    
    .toggle-slider {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
        position: relative;
        
        &:before {
            content: "";
            position: absolute;
            background: #ffffff;
            width: 1.25rem;
            height: 1.25rem;
            left: 0.25rem;
            top: 50%;
            margin-top: -0.625rem;
            border-radius: 2px;
            transition-duration: 0.2s;
        }
    }
    
    &.on {
        .toggle-slider {
            background: #22c55e;
            
            &:before {
                transform: translateX(1.25rem);
            }
        }
    }
}
</style>

