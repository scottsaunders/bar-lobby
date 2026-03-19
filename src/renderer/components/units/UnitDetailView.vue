<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="unit-detail-view">
        <div class="scroll-container">
            <div class="detail-page">

                <!-- Header -->
                <div class="unit-header flex-row gap-lg flex-center-items">
                    <Button class="icon" @click="$emit('close')">
                        <Icon :icon="arrowBack" :width="20" :height="20" />
                    </Button>
                    <Icon :icon="typeIcon" :width="44" :height="44" class="header-type-icon" :style="{ color: factionColor }" />
                    <div class="header-info flex-col gap-xs">
                        <div class="header-badges flex-row gap-xs flex-center-items">
                            <span class="badge tech-badge">T{{ unit.techLevel }}</span>
                            <span class="badge type-badge">{{ unit.unitType.toUpperCase() }}</span>
                            <span class="badge faction-badge" :class="`faction-${unit.faction.toLowerCase()}`">{{ unit.faction.toUpperCase() }}</span>
                        </div>
                        <h1 class="header-name">{{ unit.name.toUpperCase() }}</h1>
                        <div v-if="unit.description" class="header-desc body-2">{{ unit.description }}</div>
                    </div>
                </div>

                <!-- Two-column layout -->
                <div class="main-layout">

                    <!-- Left: 3D viewer + balance chart -->
                    <div class="left-col flex-col gap-lg">
                        <div class="viewer-wrap">
                            <Unit3DViewer :unitName="unit.unitName" :faction="unit.faction" :key="unit.unitName" />
                        </div>
                        <div class="chart-wrap flex-col gap-xs">
                            <div class="section-label">BALANCE CHART</div>
                            <svg viewBox="0 0 240 240" class="balance-svg">
                                <!-- Background rings -->
                                <circle v-for="r in [16, 32, 49, 65]" :key="r" cx="120" cy="120" :r="r"
                                    fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
                                <!-- Sectors -->
                                <path v-for="s in chartSectors" :key="s.label" :d="s.path"
                                    :fill="s.color" fill-opacity="0.8" />
                                <!-- Center dot -->
                                <circle cx="120" cy="120" r="2" fill="rgba(255,255,255,0.25)" />
                                <!-- Labels -->
                                <text v-for="s in chartSectors" :key="'lbl'+s.label"
                                    :x="s.lx" :y="s.ly" class="chart-lbl"
                                    text-anchor="middle" dominant-baseline="middle">{{ s.label }}</text>
                            </svg>
                        </div>
                    </div>

                    <!-- Right: all data -->
                    <div class="right-col flex-col gap-lg">

                        <!-- COST -->
                        <div class="data-section flex-col gap-xs">
                            <div class="section-label">COST</div>
                            <div v-if="unit.metalCost > 0" class="stat-bar-row">
                                <span class="sbar-label">METAL</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#94a3b8', width: pct(unit.metalCost, maxStats.metal) }" />
                                </div>
                                <span class="sbar-value">{{ unit.metalCost }}</span>
                            </div>
                            <div v-if="unit.energyCost > 0" class="stat-bar-row">
                                <span class="sbar-label">ENERGY</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#fbbf24', width: pct(unit.energyCost, maxStats.energy) }" />
                                </div>
                                <span class="sbar-value">{{ unit.energyCost }}</span>
                            </div>
                            <div v-if="unit.buildTime > 0" class="stat-bar-row">
                                <span class="sbar-label">BUILD TIME</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#a78bfa', width: pct(unit.buildTime, maxStats.buildTime) }" />
                                </div>
                                <span class="sbar-value">{{ unit.buildTime }}</span>
                            </div>
                        </div>

                        <!-- GENERAL STATS -->
                        <div class="data-section flex-col gap-xs">
                            <div class="section-label">GENERAL STATS</div>
                            <div v-if="unit.health > 0" class="stat-bar-row">
                                <span class="sbar-label">HEALTH</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#22c55e', width: pct(unit.health, maxStats.health) }" />
                                </div>
                                <span class="sbar-value">{{ unit.health }}</span>
                            </div>
                            <div v-if="unit.speed > 0" class="stat-bar-row">
                                <span class="sbar-label">SPEED</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#38bdf8', width: pct(unit.speed, maxStats.speed) }" />
                                </div>
                                <span class="sbar-value">{{ unit.speed.toFixed(0) }}</span>
                            </div>
                            <div v-if="unit.sightRange > 0" class="stat-bar-row">
                                <span class="sbar-label">SIGHT</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#e2e8f0', width: pct(unit.sightRange, maxStats.sight) }" />
                                </div>
                                <span class="sbar-value">{{ unit.sightRange }}</span>
                            </div>
                            <div v-if="totalDPS > 0" class="stat-bar-row">
                                <span class="sbar-label">DPS</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#ef4444', width: pct(totalDPS, maxStats.dps) }" />
                                </div>
                                <span class="sbar-value">{{ totalDPS }}</span>
                            </div>
                            <div v-if="maxRange > 0" class="stat-bar-row">
                                <span class="sbar-label">RANGE</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#f97316', width: pct(maxRange, maxStats.range) }" />
                                </div>
                                <span class="sbar-value">{{ maxRange }}</span>
                            </div>
                        </div>

                        <!-- ORDNANCE -->
                        <div v-if="unit.weapons.length > 0" class="data-section flex-col gap-xs">
                            <div class="section-label">ORDNANCE</div>
                            <div class="ordnance-list flex-col gap-xs">
                                <div v-for="wep in unit.weapons" :key="wep.name" class="weapon-card">
                                    <div class="wep-header flex-row flex-center-items gap-sm"
                                        @click="expandedWeapons[wep.name] = !expandedWeapons[wep.name]">
                                        <Icon :icon="weaponIcon" :width="16" :height="16" class="wep-icon" />
                                        <span class="wep-name body-2">{{ wep.name }}</span>
                                        <span v-if="wep.weaponType" class="wep-type">{{ wep.weaponType }}</span>
                                        <Icon :icon="expandedWeapons[wep.name] ? chevronUpIcon : chevronDownIcon"
                                            :width="14" :height="14" class="wep-chevron" />
                                    </div>
                                    <div v-if="expandedWeapons[wep.name]" class="wep-stats">
                                        <div v-if="wep.damage > 0" class="wep-stat">
                                            <span class="wep-stat-lbl">DAMAGE</span>
                                            <span>{{ wep.damage }}</span>
                                        </div>
                                        <div v-if="wep.dps > 0" class="wep-stat">
                                            <span class="wep-stat-lbl">DPS</span>
                                            <span>{{ wep.dps }}</span>
                                        </div>
                                        <div v-if="wep.range > 0" class="wep-stat">
                                            <span class="wep-stat-lbl">RANGE</span>
                                            <span>{{ wep.range }}</span>
                                        </div>
                                        <div v-if="wep.reloadTime > 0" class="wep-stat">
                                            <span class="wep-stat-lbl">RELOAD</span>
                                            <span>{{ wep.reloadTime.toFixed(1) }}s</span>
                                        </div>
                                        <div v-if="wep.aoe > 0" class="wep-stat">
                                            <span class="wep-stat-lbl">AOE</span>
                                            <span>{{ wep.aoe }}</span>
                                        </div>
                                        <div v-if="wep.projectileSpeed > 0" class="wep-stat">
                                            <span class="wep-stat-lbl">PROJ SPD</span>
                                            <span>{{ wep.projectileSpeed }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CONSTRUCTION -->
                        <div v-if="unit.buildPower > 0" class="data-section flex-col gap-xs">
                            <div class="section-label">CONSTRUCTION</div>
                            <div class="stat-bar-row">
                                <span class="sbar-label">BUILD POWER</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#fb923c', width: pct(unit.buildPower, maxStats.buildPower) }" />
                                </div>
                                <span class="sbar-value">{{ unit.buildPower }}</span>
                            </div>
                            <div v-if="unit.buildRange > 0" class="stat-bar-row">
                                <span class="sbar-label">BUILD RANGE</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#fb923c', width: pct(unit.buildRange, maxStats.buildRange) }" />
                                </div>
                                <span class="sbar-value">{{ unit.buildRange }}</span>
                            </div>
                        </div>

                        <!-- SENSORS -->
                        <div v-if="unit.radarRange > 0 || unit.sonarRange > 0" class="data-section flex-col gap-xs">
                            <div class="section-label">SENSORS</div>
                            <div v-if="unit.radarRange > 0" class="stat-bar-row">
                                <span class="sbar-label">RADAR</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#38bdf8', width: pct(unit.radarRange, maxStats.radar) }" />
                                </div>
                                <span class="sbar-value">{{ unit.radarRange }}</span>
                            </div>
                            <div v-if="unit.sonarRange > 0" class="stat-bar-row">
                                <span class="sbar-label">SONAR</span>
                                <div class="sbar-track">
                                    <div class="sbar-fill" :style="{ background: '#34d399', width: pct(unit.sonarRange, maxStats.sonar) }" />
                                </div>
                                <span class="sbar-value">{{ unit.sonarRange }}</span>
                            </div>
                        </div>

                        <!-- Codename -->
                        <div class="codename-row">
                            <span class="cod-key">CODENAME</span>
                            <span class="cod-val">{{ unit.unitName }}</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from "vue";
import { Icon } from "@iconify/vue";
import Button from "@renderer/components/controls/Button.vue";
import Unit3DViewer from "@renderer/components/units/Unit3DViewer.vue";
import { UnitData } from "@main/content/game/unit-data";
import { unitsStore } from "@renderer/store/units.store";

import arrowBack from "@iconify-icons/mdi/arrow-back";
import aircraftIcon from "@iconify-icons/mdi/airplane";
import botIcon from "@iconify-icons/mdi/robot";
import buildingIcon from "@iconify-icons/mdi/domain";
import vehicleIcon from "@iconify-icons/mdi/tank";
import shipIcon from "@iconify-icons/mdi/ferry";
import hoverIcon from "@iconify-icons/mdi/turbine";
import defaultIcon from "@iconify-icons/mdi/cube-outline";
import weaponIcon from "@iconify-icons/mdi/target";
import chevronUpIcon from "@iconify-icons/mdi/chevron-up";
import chevronDownIcon from "@iconify-icons/mdi/chevron-down";

const props = defineProps<{ unit: UnitData }>();
defineEmits<{ (e: "close"): void }>();

const expandedWeapons = reactive<Record<string, boolean>>({});

const factionColors: Record<string, string> = {
    Armada: "#60a5fa",
    Cortex: "#f87171",
    Legion: "#4ade80",
    Scavengers: "#c084fc",
    Other: "#6b7280",
};
const factionColor = computed(() => factionColors[props.unit.faction] ?? "#6b7280");

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

const totalDPS = computed(() => Math.round(props.unit.weapons.reduce((s, w) => s + w.dps, 0)));
const maxRange = computed(() => props.unit.weapons.reduce((m, w) => Math.max(m, w.range), 0));

const maxStats = computed(() => {
    const units = unitsStore.units;
    let metal = 1, energy = 1, buildTime = 1, health = 1, speed = 1, sight = 1,
        dps = 1, range = 1, buildPower = 1, buildRange = 1, radar = 1, sonar = 1;
    for (const u of units) {
        if (u.metalCost > metal) metal = u.metalCost;
        if (u.energyCost > energy) energy = u.energyCost;
        if (u.buildTime > buildTime) buildTime = u.buildTime;
        if (u.health > health) health = u.health;
        if (u.speed > speed) speed = u.speed;
        if (u.sightRange > sight) sight = u.sightRange;
        if (u.buildPower > buildPower) buildPower = u.buildPower;
        if (u.buildRange > buildRange) buildRange = u.buildRange;
        if (u.radarRange > radar) radar = u.radarRange;
        if (u.sonarRange > sonar) sonar = u.sonarRange;
        const uDps = u.weapons.reduce((s, w) => s + w.dps, 0);
        if (uDps > dps) dps = uDps;
        const uRange = u.weapons.reduce((m, w) => Math.max(m, w.range), 0);
        if (uRange > range) range = uRange;
    }
    return { metal, energy, buildTime, health, speed, sight, dps, range, buildPower, buildRange, radar, sonar };
});

function pct(value: number, max: number): string {
    return `${Math.min(100, Math.max(1, (value / max) * 100)).toFixed(1)}%`;
}

// Fixed reference values for the balance chart — represent strong-but-not-extreme stats.
// Using all-unit max causes buildings/commanders to dominate, making combat units appear near-zero.
const CHART_REF = { health: 6000, dps: 500, range: 1800, sight: 1200, speed: 160 };

// Polar area chart — 5 sectors clockwise from top-left matching BAR website axis layout:
// HEALTH (top-left), DPS (top-right), RANGE (right), SIGHT (bottom), SPEED (left)
const chartSectors = computed(() => {
    const cx = 120, cy = 120, R = 65, labelR = 91;
    const startAngle = (-162 * Math.PI) / 180;
    const sectorAngle = (2 * Math.PI) / 5;
    const axes = [
        { label: "HEALTH", value: props.unit.health / CHART_REF.health, color: "#22c55e" },
        { label: "DPS", value: totalDPS.value / CHART_REF.dps, color: "#ef4444" },
        { label: "RANGE", value: maxRange.value / CHART_REF.range, color: "#f97316" },
        { label: "SIGHT", value: props.unit.sightRange / CHART_REF.sight, color: "#94a3b8" },
        { label: "SPEED", value: props.unit.speed / CHART_REF.speed, color: "#38bdf8" },
    ];
    return axes.map((axis, i) => {
        const a1 = startAngle + i * sectorAngle;
        const a2 = startAngle + (i + 1) * sectorAngle;
        const aMid = (a1 + a2) / 2;
        const r = R * Math.max(0.04, Math.min(1, axis.value || 0));
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);
        const path = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
        const lx = (cx + labelR * Math.cos(aMid)).toFixed(1);
        const ly = (cy + labelR * Math.sin(aMid)).toFixed(1);
        return { label: axis.label, path, color: axis.color, lx, ly };
    });
});
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
    padding: map.get($spacing, "xl") map.get($spacing, "xxl");
    min-height: 100%;
}

// ── Header ───────────────────────────────────────────────────────────────

.unit-header {
    flex-shrink: 0;
}

.header-type-icon {
    flex-shrink: 0;
    opacity: 0.9;
}

.header-name {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    line-height: 1;
    margin: 0;
}

.header-desc {
    opacity: 0.45;
    font-size: 0.8rem;
}

.badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 2px 8px;
    border-radius: 3px;
}

.tech-badge {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.75);
}

.type-badge {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.45);
}

.faction-badge {
    &.faction-armada   { background: rgba(96, 165, 250, 0.18); color: #93c5fd; }
    &.faction-cortex   { background: rgba(248, 113, 113, 0.18); color: #fca5a5; }
    &.faction-legion   { background: rgba(74, 222, 128, 0.18); color: #86efac; }
    &.faction-scavengers { background: rgba(192, 132, 252, 0.18); color: #d8b4fe; }
    &.faction-other    { background: rgba(107, 114, 128, 0.18); color: #9ca3af; }
}

// ── Main layout ──────────────────────────────────────────────────────────

.main-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: map.get($spacing, "xl");
    align-items: start;
}

// ── Left column ──────────────────────────────────────────────────────────

.viewer-wrap {
    height: 300px;
    border-radius: 4px;
    overflow: hidden;
}

.balance-svg {
    width: 100%;
    height: auto;
}

.chart-lbl {
    fill: rgba(255, 255, 255, 0.45);
    font-size: 9px;
    font-family: "Rajdhani", monospace;
    letter-spacing: 0.07em;
    font-weight: 700;
}

// ── Section shared ────────────────────────────────────────────────────────

.section-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    opacity: 0.38;
    margin-bottom: 2px;
}

.data-section {
    padding-bottom: map.get($spacing, "md");
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

// ── Stat bars ─────────────────────────────────────────────────────────────

.stat-bar-row {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "sm");
    padding: 3px 0;
}

.sbar-label {
    width: 82px;
    flex-shrink: 0;
    font-size: 0.67rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    opacity: 0.42;
    font-family: "Rajdhani", monospace;
}

.sbar-track {
    flex: 1;
    height: 7px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
}

.sbar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 2px;
}

.sbar-value {
    width: 56px;
    flex-shrink: 0;
    text-align: right;
    font-size: 0.82rem;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    opacity: 0.9;
}

// ── Ordnance ──────────────────────────────────────────────────────────────

.weapon-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 3px;
    overflow: hidden;
}

.wep-header {
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
    }
}

.wep-icon {
    flex-shrink: 0;
    opacity: 0.4;
}

.wep-name {
    flex: 1;
    font-size: 0.8rem;
    font-family: monospace;
    opacity: 0.85;
}

.wep-type {
    font-size: 0.65rem;
    opacity: 0.35;
    letter-spacing: 0.06em;
    font-weight: 600;
}

.wep-chevron {
    flex-shrink: 0;
    opacity: 0.35;
}

.wep-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: rgba(255, 255, 255, 0.04);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.wep-stat {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 6px map.get($spacing, "sm");
    background: rgba(10, 15, 28, 0.7);
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
}

.wep-stat-lbl {
    font-size: 0.58rem;
    opacity: 0.38;
    letter-spacing: 0.08em;
    font-weight: 700;
    font-family: "Rajdhani", monospace;
}

// ── Codename ──────────────────────────────────────────────────────────────

.codename-row {
    display: flex;
    gap: map.get($spacing, "sm");
    align-items: center;
    padding-top: map.get($spacing, "xs");
}

.cod-key {
    font-size: 0.62rem;
    opacity: 0.28;
    font-weight: 700;
    letter-spacing: 0.1em;
    font-family: "Rajdhani", monospace;
}

.cod-val {
    opacity: 0.45;
    font-family: monospace;
    font-size: 0.75rem;
}
</style>
