<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="badge" :class="variant">
        <slot />
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    variant?: "default" | "primary" | "success" | "warning" | "error";
}>();
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.badge {
    display: inline-flex;
    align-items: center;
    padding: map-get($spacing, "xxs") map-get($spacing, "sm");
    border-radius: 4px;
    white-space: nowrap;
    @extend .caption-1 !optional;
    line-height: 1.2;
    
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    
    &.primary {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.4);
        color: rgba(255, 255, 255, 0.9);
    }
    
    &.success {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.4);
        color: rgba(255, 255, 255, 0.9);
    }
    
    &.warning {
        background: rgba(216, 168, 11, 0.2);
        border-color: rgba(216, 168, 11, 0.4);
        color: rgba(255, 255, 255, 0.9);
    }
    
    &.error {
        background: rgba(224, 17, 17, 0.2);
        border-color: rgba(224, 17, 17, 0.4);
        color: rgba(255, 255, 255, 0.9);
    }
}
</style>

