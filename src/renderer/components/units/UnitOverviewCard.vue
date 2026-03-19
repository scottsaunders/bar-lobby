<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="unit-card" :class="[`faction-${factionClass}`]">
        <div class="background" :style="imageUrl ? `background-image: url('${imageUrl}')` : undefined" />
        <div v-if="!imageUrl" class="center-icon">
            <Icon :icon="typeIcon" :width="80" :height="80" />
        </div>
        <div class="attributes tl body-1-strong">
            T{{ unit.techLevel }}
        </div>
        <div class="attributes tr">
            <img v-if="iconUrl" class="unit-icon-img" :src="iconUrl" />
            <Icon v-else :icon="typeIcon" :width="18" :height="18" />
        </div>
        <div class="name">{{ unit.name }}</div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { UnitData } from "@main/content/game/unit-data";
import aircraftIcon from "@iconify-icons/mdi/airplane";
import botIcon from "@iconify-icons/mdi/robot";
import buildingIcon from "@iconify-icons/mdi/domain";
import vehicleIcon from "@iconify-icons/mdi/tank";
import shipIcon from "@iconify-icons/mdi/ferry";
import hoverIcon from "@iconify-icons/mdi/turbine";
import defaultIcon from "@iconify-icons/mdi/cube-outline";
import unitImages from "@renderer/assets/unit-images.json";

type UnitImageEntry = { image: string | null; icon: string | null };

const props = defineProps<{ unit: UnitData }>();

const factionClass = computed(() => props.unit.faction.toLowerCase());
const entry = computed(() => (unitImages as Record<string, UnitImageEntry>)[props.unit.unitName] ?? null);
const imageUrl = computed(() => entry.value?.icon ?? null);   // AVIF — large central image
const iconUrl = computed(() => entry.value?.image ?? null);  // WebP — small corner icon

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
    will-change: transform, opacity;
    aspect-ratio: 1;
    position: relative;
    overflow: hidden;
    cursor: pointer;

    &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow:
            inset 0 1px 0 rgba(0, 0, 0, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            inset 1px 0 0 rgba(0, 0, 0, 0.3),
            inset -1px 0 0 rgba(0, 0, 0, 0.3);
        border: 3px solid rgba(0, 0, 0, 0.2);
        z-index: 5;
        pointer-events: none;
    }

    &:hover {
        .name {
            opacity: 0;
        }
        .background {
            transform: scale(1.04);
            &:after {
                opacity: 0;
            }
        }
        .attributes {
            opacity: 0;
        }
        .center-icon {
            transform: translate(-50%, -50%) scale(1.08);
        }
    }

    // Faction gradient backgrounds (used when no image)
    &.faction-armada .background {
        background-image: linear-gradient(135deg, #1a3a6b 0%, #0c1a3a 60%, #060e1f 100%);
    }
    &.faction-armada .center-icon {
        color: #3b82f6;
    }

    &.faction-cortex .background {
        background-image: linear-gradient(135deg, #6b1a1a 0%, #3a0c0c 60%, #1f0606 100%);
    }
    &.faction-cortex .center-icon {
        color: #ef4444;
    }

    &.faction-legion .background {
        background-image: linear-gradient(135deg, #1a5c2a 0%, #0c3a18 60%, #061f0c 100%);
    }
    &.faction-legion .center-icon {
        color: #22c55e;
    }

    &.faction-scavengers .background {
        background-image: linear-gradient(135deg, #3b1a6b 0%, #200c3a 60%, #110620 100%);
    }
    &.faction-scavengers .center-icon {
        color: #a855f7;
    }

    &.faction-other .background {
        background-image: linear-gradient(135deg, #2a2f3d 0%, #181c26 60%, #0d1018 100%);
    }
    &.faction-other .center-icon {
        color: #6b7280;
    }
}

.background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;
    will-change: transform;

    &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
        transition: opacity 0.2s ease-in-out;
    }
}

.center-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.55;
    transition: transform 0.2s ease-in-out;
    z-index: 1;
}

.name {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    text-align: center;
    word-break: break-word;
    padding: map.get($spacing, "sm");
    font-size: 0.85rem;
    font-weight: 600;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9);
    transition: opacity 0.2s;
    z-index: 2;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 55%);
}

.attributes {
    position: absolute;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: rgba(0, 0, 0, 0.35);
    padding: map.get($spacing, "xxs") map.get($spacing, "xs");
    transition: opacity 0.2s;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: map.get($spacing, "xxs");
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;

    &.tl {
        top: map.get($spacing, "sm");
        left: map.get($spacing, "sm");
    }
    &.tr {
        top: map.get($spacing, "sm");
        right: map.get($spacing, "sm");
        padding: map.get($spacing, "xxs");
    }
}

.unit-icon-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    display: block;
}
</style>
