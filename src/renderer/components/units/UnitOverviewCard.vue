<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="unit-card" :class="[`faction-${factionClass}`]">
        <div class="faction-stripe" />
        <div class="card-content">
            <div class="unit-header">
                <div class="unit-icon">
                    <Icon :icon="typeIcon" :width="28" :height="28" />
                </div>
                <div class="unit-name-block">
                    <div class="unit-name">{{ unit.name }}</div>
                    <div class="unit-meta body-2">{{ unit.faction }} · {{ unit.unitType }} · T{{ unit.techLevel }}</div>
                </div>
            </div>
            <div class="unit-stats body-2">
                <div class="stat" v-tooltip.bottom="'Metal Cost'">
                    <Icon :icon="metalIcon" :width="14" :height="14" class="stat-icon metal" />
                    <span>{{ unit.metalCost }}</span>
                </div>
                <div class="stat" v-tooltip.bottom="'Energy Cost'">
                    <Icon :icon="energyIcon" :width="14" :height="14" class="stat-icon energy" />
                    <span>{{ unit.energyCost }}</span>
                </div>
                <div class="stat" v-if="unit.health > 0" v-tooltip.bottom="'Health'">
                    <Icon :icon="healthIcon" :width="14" :height="14" class="stat-icon health" />
                    <span>{{ unit.health }}</span>
                </div>
                <div class="stat" v-if="unit.speed > 0" v-tooltip.bottom="'Speed'">
                    <Icon :icon="speedIcon" :width="14" :height="14" class="stat-icon speed" />
                    <span>{{ unit.speed.toFixed(0) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { UnitData } from "@main/content/game/unit-data";
import metalIcon from "@iconify-icons/mdi/pickaxe";
import energyIcon from "@iconify-icons/mdi/lightning-bolt";
import healthIcon from "@iconify-icons/mdi/shield-half-full";
import speedIcon from "@iconify-icons/mdi/speedometer";
import aircraftIcon from "@iconify-icons/mdi/airplane";
import botIcon from "@iconify-icons/mdi/robot";
import buildingIcon from "@iconify-icons/mdi/domain";
import vehicleIcon from "@iconify-icons/mdi/tank";
import shipIcon from "@iconify-icons/mdi/ferry";
import hoverIcon from "@iconify-icons/mdi/turbine";
import defaultIcon from "@iconify-icons/mdi/cube-outline";

const props = defineProps<{ unit: UnitData }>();

const factionClass = computed(() => props.unit.faction.toLowerCase());

const typeIcon = computed(() => {
    switch (props.unit.unitType) {
        case "Aircraft":
        case "Seaplanes":
            return aircraftIcon;
        case "Bots":
            return botIcon;
        case "Buildings":
        case "Gantry":
            return buildingIcon;
        case "Vehicles":
            return vehicleIcon;
        case "Ships":
            return shipIcon;
        case "Hovercraft":
            return hoverIcon;
        default:
            return defaultIcon;
    }
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.unit-card {
    position: relative;
    display: flex;
    flex-direction: row;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    cursor: pointer;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.15s ease;
    will-change: transform;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.18);
        transform: translateY(-1px);
    }

    &.faction-armada .faction-stripe {
        background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    }
    &.faction-cortex .faction-stripe {
        background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%);
    }
    &.faction-legion .faction-stripe {
        background: linear-gradient(180deg, #a855f7 0%, #7e22ce 100%);
    }
    &.faction-scavengers .faction-stripe {
        background: linear-gradient(180deg, #f97316 0%, #c2410c 100%);
    }
    &.faction-other .faction-stripe {
        background: linear-gradient(180deg, #6b7280 0%, #374151 100%);
    }
}

.faction-stripe {
    width: 4px;
    flex-shrink: 0;
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    min-width: 0;
}

.unit-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: map.get($spacing, "sm");
    min-width: 0;
}

.unit-icon {
    flex-shrink: 0;
    opacity: 0.7;
}

.unit-name-block {
    min-width: 0;
}

.unit-name {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.unit-meta {
    opacity: 0.5;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.unit-stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: map.get($spacing, "sm");
}

.stat {
    display: flex;
    align-items: center;
    gap: 3px;
    opacity: 0.8;
    font-size: 0.8rem;
}

.stat-icon {
    &.metal {
        color: #94a3b8;
    }
    &.energy {
        color: #fbbf24;
    }
    &.health {
        color: #22c55e;
    }
    &.speed {
        color: #60a5fa;
    }
}
</style>
