<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="unit-detail-view">
        <div class="scroll-container">
            <div class="detail-page">
                <!-- Header -->
                <div class="header-row flex-row flex-center-items gap-md">
                    <Button class="icon" @click="$emit('close')">
                        <Icon :icon="arrowBack" :width="22" :height="22" />
                    </Button>
                    <div>
                        <h1>{{ unit.name }}</h1>
                        <div class="unit-subtitle body-2" :class="`faction-${unit.faction.toLowerCase()}`">
                            {{ unit.faction }} · {{ unit.unitType }} · Tech {{ unit.techLevel }}
                        </div>
                    </div>
                </div>

                <!-- Main content -->
                <div class="detail-layout">
                    <!-- 3D Viewer -->
                    <div class="viewer-panel">
                        <Unit3DViewer :unitName="unit.unitName" :key="unit.unitName" />
                    </div>

                    <!-- Stats Panel -->
                    <div class="stats-panel flex-col gap-lg">
                        <!-- Description -->
                        <div v-if="unit.description" class="description body-1">
                            {{ unit.description }}
                        </div>

                        <!-- Cost -->
                        <div class="stat-group flex-col gap-sm">
                            <h4 class="subtitle-2 group-title">Cost</h4>
                            <div class="stat-row" v-if="unit.metalCost > 0">
                                <Icon :icon="metalIcon" :width="18" :height="18" class="stat-icon metal" />
                                <span class="stat-label body-2">Metal</span>
                                <span class="stat-value body-1-strong">{{ unit.metalCost }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.energyCost > 0">
                                <Icon :icon="energyIcon" :width="18" :height="18" class="stat-icon energy" />
                                <span class="stat-label body-2">Energy</span>
                                <span class="stat-value body-1-strong">{{ unit.energyCost }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.buildTime > 0">
                                <Icon :icon="buildTimeIcon" :width="18" :height="18" class="stat-icon buildtime" />
                                <span class="stat-label body-2">Build Time</span>
                                <span class="stat-value body-1-strong">{{ unit.buildTime }}</span>
                            </div>
                        </div>

                        <!-- Combat -->
                        <div class="stat-group flex-col gap-sm" v-if="unit.health > 0 || unit.speed > 0 || unit.sightRange > 0">
                            <h4 class="subtitle-2 group-title">Combat</h4>
                            <div class="stat-row" v-if="unit.health > 0">
                                <Icon :icon="healthIcon" :width="18" :height="18" class="stat-icon health" />
                                <span class="stat-label body-2">Health</span>
                                <span class="stat-value body-1-strong">{{ unit.health }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.speed > 0">
                                <Icon :icon="speedIcon" :width="18" :height="18" class="stat-icon speed" />
                                <span class="stat-label body-2">Speed</span>
                                <span class="stat-value body-1-strong">{{ unit.speed.toFixed(1) }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.sightRange > 0">
                                <Icon :icon="sightIcon" :width="18" :height="18" class="stat-icon sight" />
                                <span class="stat-label body-2">Sight Range</span>
                                <span class="stat-value body-1-strong">{{ unit.sightRange }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.radarRange > 0">
                                <Icon :icon="radarIcon" :width="18" :height="18" class="stat-icon radar" />
                                <span class="stat-label body-2">Radar Range</span>
                                <span class="stat-value body-1-strong">{{ unit.radarRange }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.sonarRange > 0">
                                <Icon :icon="sonarIcon" :width="18" :height="18" class="stat-icon radar" />
                                <span class="stat-label body-2">Sonar Range</span>
                                <span class="stat-value body-1-strong">{{ unit.sonarRange }}</span>
                            </div>
                        </div>

                        <!-- Builder -->
                        <div class="stat-group flex-col gap-sm" v-if="unit.buildPower > 0">
                            <h4 class="subtitle-2 group-title">Construction</h4>
                            <div class="stat-row">
                                <Icon :icon="constructIcon" :width="18" :height="18" class="stat-icon build" />
                                <span class="stat-label body-2">Build Power</span>
                                <span class="stat-value body-1-strong">{{ unit.buildPower }}</span>
                            </div>
                            <div class="stat-row" v-if="unit.buildRange > 0">
                                <Icon :icon="constructIcon" :width="18" :height="18" class="stat-icon build" />
                                <span class="stat-label body-2">Build Range</span>
                                <span class="stat-value body-1-strong">{{ unit.buildRange }}</span>
                            </div>
                        </div>

                        <!-- Weapons -->
                        <div class="stat-group flex-col gap-sm" v-if="unit.weaponDefs.length > 0">
                            <h4 class="subtitle-2 group-title">Weapons</h4>
                            <div v-for="wep in unit.weaponDefs" :key="wep" class="weapon-tag body-2">
                                <Icon :icon="weaponIcon" :width="14" :height="14" />
                                {{ wep }}
                            </div>
                        </div>

                        <!-- Codename -->
                        <div class="codename body-2">
                            <span style="opacity: 0.4">Codename:</span>
                            <span style="opacity: 0.6; font-family: monospace">{{ unit.unitName }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import Button from "@renderer/components/controls/Button.vue";
import Unit3DViewer from "@renderer/components/units/Unit3DViewer.vue";
import { UnitData } from "@main/content/game/unit-data";

import arrowBack from "@iconify-icons/mdi/arrow-back";
import metalIcon from "@iconify-icons/mdi/pickaxe";
import energyIcon from "@iconify-icons/mdi/lightning-bolt";
import buildTimeIcon from "@iconify-icons/mdi/clock-outline";
import healthIcon from "@iconify-icons/mdi/shield-half-full";
import speedIcon from "@iconify-icons/mdi/speedometer";
import sightIcon from "@iconify-icons/mdi/eye-outline";
import radarIcon from "@iconify-icons/mdi/radar";
import sonarIcon from "@iconify-icons/mdi/wave";
import constructIcon from "@iconify-icons/mdi/wrench";
import weaponIcon from "@iconify-icons/mdi/target";

defineProps<{ unit: UnitData }>();
defineEmits<{ (e: "close"): void }>();
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.unit-detail-view {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.scroll-container {
    height: 100%;
    overflow-y: auto;
}

.detail-page {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xl");
    padding: map.get($spacing, "xxl");
    min-height: 100%;
}

.header-row {
    flex-shrink: 0;
}

.unit-subtitle {
    font-size: 0.85rem;
    opacity: 0.7;
    margin-top: 2px;

    &.faction-armada {
        color: #60a5fa;
    }
    &.faction-cortex {
        color: #f87171;
    }
    &.faction-legion {
        color: #c084fc;
    }
    &.faction-scavengers {
        color: #fb923c;
    }
}

.detail-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: map.get($spacing, "xl");
    flex: 1;
    min-height: 480px;
}

.viewer-panel {
    min-height: 400px;
    border-radius: 4px;
    overflow: hidden;
}

.stats-panel {
    overflow-y: auto;
}

.description {
    opacity: 0.7;
    line-height: 1.6;
    font-style: italic;
    padding-bottom: map.get($spacing, "sm");
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-group {
    padding-bottom: map.get($spacing, "md");
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    &:last-of-type {
        border-bottom: none;
    }
}

.group-title {
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.7rem;
    margin-bottom: map.get($spacing, "xs");
}

.stat-row {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "sm");
    padding: map.get($spacing, "xxs") 0;
}

.stat-label {
    flex: 1;
    opacity: 0.6;
}

.stat-value {
    font-variant-numeric: tabular-nums;
}

.stat-icon {
    flex-shrink: 0;

    &.metal {
        color: #94a3b8;
    }
    &.energy {
        color: #fbbf24;
    }
    &.buildtime {
        color: #a78bfa;
    }
    &.health {
        color: #22c55e;
    }
    &.speed {
        color: #60a5fa;
    }
    &.sight {
        color: #34d399;
    }
    &.radar {
        color: #38bdf8;
    }
    &.build {
        color: #fb923c;
    }
}

.weapon-tag {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xs");
    opacity: 0.65;
    font-family: monospace;
    font-size: 0.8rem;
}

.codename {
    display: flex;
    gap: map.get($spacing, "sm");
    margin-top: auto;
}
</style>
