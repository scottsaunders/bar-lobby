<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="slide-up">
        <Panel v-if="isVisible" class="matchmaking-progress-widget" no-padding>
            <div class="widget-content flex-row gap-md flex-center-items">
                <!-- Status Section -->
                <div class="status-section flex-row gap-sm flex-center-items flex-grow">
                    <div class="status-indicator">
                        <div v-if="isSearching && !isMatchFound" class="searching-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div v-else-if="isMatchFound" class="match-found-icon">✓</div>
                    </div>
                    
                    <div class="status-text-section flex-col gap-xxs">
                        <div v-if="isSearching && !isMatchFound" class="status-text caption-1-strong">
                            Searching for match...
                        </div>
                        <div v-else-if="isMatchFound" class="status-text caption-1-strong">
                            Match found! Accepting in: {{ countdown }}s
                        </div>
                        
                        <div v-if="isMatchFound" class="countdown-progress">
                            <Progress :percent="countdownProgress" :height="4" themed />
                        </div>
                        
                        <div v-if="playersQueued && !isMatchFound" class="queue-info caption-2">
                            {{ playersQueued }} in queue
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <Button class="red slim" @click="handleCancel">
                    Leave Queue
                </Button>
            </div>
        </Panel>
    </Transition>
</template>

<script lang="ts" setup>
import { computed, inject, onUnmounted, ref, type Ref, watch } from "vue";
import Panel from "@renderer/components/common/Panel.vue";
import Button from "@renderer/components/controls/Button.vue";
import Progress from "@renderer/components/common/Progress.vue";

// Get shared mock state from parent (for prototyping)
const matchmakingWidgetState = inject<Ref<{ isVisible: boolean; isSearching: boolean; isMatchFound: boolean; playersQueued: number }>>(
    "matchmakingWidgetState",
    ref({ isVisible: false, isSearching: false, isMatchFound: false, playersQueued: 42 })
);

const countdown = ref(10); // 10 seconds to accept match
const countdownInterval = ref<number | null>(null);

const isVisible = computed(() => matchmakingWidgetState?.value?.isVisible || false);
const isSearching = computed(() => matchmakingWidgetState?.value?.isSearching || false);
const isMatchFound = computed(() => matchmakingWidgetState?.value?.isMatchFound || false);
const playersQueued = computed(() => matchmakingWidgetState?.value?.playersQueued || 0);

const countdownProgress = computed(() => {
    // Countdown from 10 to 0, so progress is (10 - countdown) / 10
    return (10 - countdown.value) / 10;
});

watch(
    () => isMatchFound.value,
    (found) => {
        if (found) {
            // Start countdown when match is found
            countdown.value = 10;
            countdownInterval.value = window.setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    if (countdownInterval.value) {
                        clearInterval(countdownInterval.value);
                        countdownInterval.value = null;
                    }
                    // For prototyping: dismiss widget when countdown completes (as if match was joined)
                    handleCancel();
                }
            }, 1000);
        } else {
            // Clear countdown
            if (countdownInterval.value) {
                clearInterval(countdownInterval.value);
                countdownInterval.value = null;
            }
        }
    }
);

function handleCancel() {
    // Mock: reset state
    if (!matchmakingWidgetState?.value) return;
    matchmakingWidgetState.value.isVisible = false;
    matchmakingWidgetState.value.isSearching = false;
    matchmakingWidgetState.value.isMatchFound = false;
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
    }
}

onUnmounted(() => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
    }
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.matchmaking-progress-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 450px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.widget-content {
    width: 100%;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    min-height: 0;
}

.status-section {
    min-width: 0;
    flex: 1;
}

.status-indicator {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.searching-dots {
    display: flex;
    gap: 3px;
    
    span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        animation: pulse 1.4s infinite ease-in-out;
        
        &:nth-child(1) {
            animation-delay: 0s;
        }
        
        &:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
}

.match-found-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #22c55e;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

@keyframes pulse {
    0%, 80%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
    }
    40% {
        opacity: 1;
        transform: scale(1);
    }
}

.status-text-section {
    min-width: 0;
    flex: 1;
}

.status-text {
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
}

.countdown-progress {
    width: 100%;
    min-width: 120px;
}

.queue-info {
    color: rgba(255, 255, 255, 0.6);
}

// Slide up animation
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}

.slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>

