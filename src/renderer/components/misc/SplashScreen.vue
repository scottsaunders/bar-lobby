<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="splash fullsize">
        <div class="splash__content">
            <img class="splash__logo" src="/src/renderer/assets/images/BARLogoFull.png" alt="Beyond All Reason" />
            <div class="splash__progress-area">
                <Progress :percent="initProgress.percent" :height="6" />
                <p class="splash__label caption-1">{{ initProgress.label }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Progress from "@renderer/components/common/Progress.vue";
import { initProgress } from "@renderer/utils/background-init";
</script>

<style lang="scss" scoped>
.splash {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;

    &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 48px;
        width: 420px;
        animation: fadeIn 0.8s ease-out both;
    }

    &__logo {
        width: 100%;
        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.15));
    }

    &__progress-area {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__label {
        text-align: center;
        color: rgba(255, 255, 255, 0.4);
        min-height: 1.2em;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
