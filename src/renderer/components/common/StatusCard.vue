<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="status-card" :class="`status-card--${variant}`">
        <div class="status-card__label caption-1-strong">
            <slot name="label">{{ label }}</slot>
        </div>
        <div class="status-card__value body-1">
            <slot>{{ value }}</slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
export type StatusCardVariant = "victory" | "lose" | "success" | "error" | "warning" | "info";

defineProps<{
    label?: string;
    value?: string;
    variant?: StatusCardVariant;
}>();
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.status-card {
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, "xs");
    padding: map-get($spacing, "sm");
    border-radius: 2px;
    transition: all 0.2s ease;
    
    &__label {
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    &__value {
        // Uses body-1 class from global typography
        // No additional styling needed
    }
    
    // Victory/Success variant (green)
    &--victory,
    &--success {
        background: rgba(34, 197, 94, 0.1);
        border-left: 2px solid rgba(34, 197, 94, 0.4);
        
        .status-card__label {
            color: rgba(34, 197, 94, 0.9);
        }
    }
    
    // Lose/Error variant (red)
    &--lose,
    &--error {
        background: rgba(239, 68, 68, 0.1);
        border-left: 2px solid rgba(239, 68, 68, 0.4);
        
        .status-card__label {
            color: rgba(239, 68, 68, 0.9);
        }
    }
    
    // Warning variant (yellow)
    &--warning {
        background: rgba(243, 213, 79, 0.1);
        border-left: 2px solid rgba(243, 213, 79, 0.4);
        
        .status-card__label {
            color: rgba(243, 213, 79, 0.9);
        }
    }
    
    // Info variant (blue)
    &--info {
        background: rgba(37, 99, 235, 0.1);
        border-left: 2px solid rgba(37, 99, 235, 0.4);
        
        .status-card__label {
            color: rgba(37, 99, 235, 0.9);
        }
    }
}
</style>

