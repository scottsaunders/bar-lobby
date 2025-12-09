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
    width: 44px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
    }
    
    &.on {
        background-color: rgba(34, 197, 94, 0.6);
        border-color: rgba(34, 197, 94, 0.8);
        
        .toggle-slider {
            transform: translateX(20px);
        }
    }
}

.toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background-color: #fff;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>

