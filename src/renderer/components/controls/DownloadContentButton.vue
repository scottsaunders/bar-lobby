<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="download-button-wrapper fullwidth">
        <div class="progress-bar-outer margin-left-md margin-right-md">
            <DownloadProgress
                :maps="maps"
                :engines="engines"
                :games="games"
                :height="75"
                @status-change="updateDownloadStatus"
            ></DownloadProgress>
        </div>
        <div
            class="download-button"
            :class="{
                'download-button--small': !isLarge,
                'download-button--large': isLarge,
                'download-button--ready': ready,
                'download-button--downloading': isDownloading,
                'download-button--default': !ready && !isDownloading
            }"
        >
            <!-- Progress bar overlay during download -->
            <div
                v-if="isDownloading"
                class="download-button__progress"
                :style="{ width: `${downloadProgress * 100}%` }"
            ></div>
            <!-- Button text -->
            <span :class="['download-button__text', isLarge ? 'subtitle-1' : 'body-1-strong']">
                <span v-if="ready">
                    <slot>Ready</slot>
                </span>
                <span v-else-if="isDownloading">{{ t("lobby.components.controls.downloadContentButton.downloading") }}</span>
                <span v-else>{{ t("lobby.components.controls.downloadContentButton.download") }}</span>
            </span>
            <!-- Click handler -->
            <button
                v-if="ready"
                class="download-button__clickable"
                :disabled="disabled"
                @click="onClick"
            ></button>
            <button
                v-else
                class="download-button__clickable"
                :disabled="disabled"
                @click="beginDownload(maps, engines, games)"
            ></button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { downloadMap } from "@renderer/store/maps.store";
import { ButtonProps } from "primevue/button";
import DownloadProgress from "@renderer/components/common/DownloadProgress.vue";
import { useTypedI18n } from "@renderer/i18n";
import { downloadEngine } from "@renderer/store/engine.store";
import { downloadGame } from "@renderer/store/game.store";
import { enginesStore } from "@renderer/store/engine.store";
import { mapsStore } from "@renderer/store/maps.store";
import { gameStore } from "@renderer/store/game.store";
import { downloadsStore } from "@renderer/store/downloads.store";
import { useAttrs } from "vue";

const { t } = useTypedI18n();
const attrs = useAttrs();

export interface Props extends /* @vue-ignore */ ButtonProps {
    disabled?: boolean;
    class?: string;
    onClick?: (event: MouseEvent) => void;
    maps?: string[];
    engines?: string[];
    games?: string[];
}
const { maps = [], engines = [], games = [] } = defineProps<Props>();

const isDownloading = ref(false);

// Detect if button should be large based on class
const attrsClass = computed(() => {
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

const isLarge = computed(() => {
    return attrsClass.value.includes('large');
});

const ready = computed(() => {
    const targetList = new Set([...maps, ...games, ...engines]);
    if (targetList.size == 0) return true;
    let availableContent = new Set(mapsStore.availableMapNames);
    availableContent = availableContent.union(new Set(enginesStore.availableEngineVersions.map((e) => e.id)));
    availableContent = availableContent.union(new Set(gameStore.availableGameVersions.keys()));
    if (targetList.difference(availableContent).size > 0) return false;
    else return true;
});

function updateDownloadStatus(value: boolean) {
    isDownloading.value = value;
}

// Calculate download progress (matching DownloadProgress component logic)
const downloadProgress = computed(() => {
    const targetList = new Set([...maps, ...games, ...engines]);
    if (targetList.size === 0) return 0;
    
    const downloads = [...downloadsStore.mapDownloads, ...downloadsStore.engineDownloads, ...downloadsStore.gameDownloads];
    if (downloads.length === 0) return 0;
    
    const relevantDownloads = downloads.filter(d => targetList.has(d.name));
    if (relevantDownloads.length === 0) return 0;
    
    const totalProgress = relevantDownloads.reduce((sum, d) => sum + (d.progress || 0), 0);
    return totalProgress / relevantDownloads.length;
});

// Note; we have to await each download because we need to update pr-downloader to accept concurrent downloads
async function beginDownload(maps?: string[], engines?: string[], games?: string[]) {
    for (const map of maps ?? []) {
        await downloadMap(map);
    }
    for (const engine of engines ?? []) {
        await downloadEngine(engine);
    }
    for (const game of games ?? []) {
        await downloadGame(game);
    }
}
</script>

<style lang="scss" scoped>
.download-button-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
}

.download-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: capitalize; // Title Case
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.15); // Unified border
    border-radius: 2px; // Unified corner radius
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.6); // Unified text shadow
    box-sizing: border-box; // Include border in height calculation
    width: 100%;
    
    // Size variants - match regular and large button sizes
    &--small {
        padding: 0 16px; // Double padding for small buttons
        min-height: 48px; // Match regular button height
        height: 48px;
    }
    
    &--large {
        padding: 0 24px; // Triple padding for large buttons
        height: 72px; // Match large button height
    }
    
    // State: Default (Red - Download) - use solid rgba color matching danger button
    &--default {
        background-color: rgba(165, 30, 30, 0.6); // Match red button color
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05); // Standard inset shadow
        
        &:hover {
            background-color: rgba(165, 30, 30, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
    }
    
    // State: Downloading (Grey with progress fill) - use standard shadow
    &--downloading {
        background-color: rgba(107, 114, 128, 0.6);
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        
        &:hover {
            background-color: rgba(107, 114, 128, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
    }
    
    // State: Ready (Green) - use solid rgba color matching success button
    &--ready {
        background-color: rgba(34, 197, 94, 0.6); // Match green button color (#22c55e)
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05); // Standard inset shadow
        
        &:hover {
            background-color: rgba(34, 197, 94, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
        
        &:active {
            transform: translateY(1px);
        }
    }
    
    // Progress bar fill during download - grey color
    &__progress {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(107, 114, 128, 0.6); // Grey progress bar
        transition: width 0.1s ease;
        z-index: 1;
    }
    
    // Text overlay - scale down if text doesn't fit
    &__text {
        position: relative;
        z-index: 2;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        width: 100%;
        text-align: center;
    }
    
    // Scale down text for downloading state to ensure it fits
    &--downloading &__text {
        font-size: 0.85em; // Scale down "Downloading..." to fit
    }
    
    // Small button specific scaling for downloading
    &--small {
        &.download-button--downloading &__text {
            font-size: 0.75em; // More scaling for small button
        }
    }
    
    // Large button specific scaling for downloading  
    &--large {
        &.download-button--downloading &__text {
            font-size: 0.9em; // Less scaling needed for large button
        }
    }
    
    // Invisible clickable overlay
    &__clickable {
        position: absolute;
        inset: 0;
        z-index: 3;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        margin: 0;
        
        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }
    
    // Active state (when button is pressed/down)
    &:active {
        transform: translateY(1px);
    }
    
    // Active state for ready state specifically
    &--ready:active {
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        transform: translateY(1px);
    }
}

.anchor {
    anchor-name: --anchor;
}
.progress-bar-outer {
    position: fixed;
    position-area: top span-all;
    position-anchor: --anchor;
    width: anchor-size(width);
    height: anchor-size(height);
    transform: translateY(100%);
    overflow: hidden;
}
</style>
