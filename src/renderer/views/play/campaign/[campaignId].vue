<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Campaign", hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <div class="flex-row flex-center-items gap-md">
                    <Button class="icon" @click="goBack">
                        <Icon :icon="arrowLeftIcon" height="24" />
                    </Button>
                    <div>
                        <h1>{{ campaignData.name }}</h1>
                        <p>{{ campaignData.description }}</p>
                    </div>
                </div>
            </div>
            
            <div class="campaign-layout flex-row gap-xl">
                <!-- Left Panel: Mission List -->
                <Panel class="missions-panel" no-padding>
                    <div class="scroll-container main-panel-scroll missions-scroll">
                        <div class="missions-list">
                            <div
                                v-for="(mission, index) in campaignData.missions"
                                :key="mission.id"
                                class="mission-tile-wrapper"
                            >
                                <InteractiveTile
                                    :saturate="!mission.locked"
                                    :selected="selectedMission?.id === mission.id"
                                    :class="getMissionClass(mission)"
                                    @click="!mission.locked && selectMission(mission)"
                                >
                                    <template #media>
                                        <div class="mission-media" :class="getMissionClass(mission)">
                                            <div class="mission-number-badge">
                                                <Icon v-if="mission.completed" :icon="checkIcon" height="24" />
                                                <Icon v-else-if="mission.locked" :icon="lockIcon" height="24" />
                                                <span v-else>{{ index + 1 }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <template #content>
                                        <div class="mission-tile-content">
                                            <h3 class="subtitle-1">{{ mission.name }}</h3>
                                            <p class="body-2">{{ mission.description }}</p>
                                            <div class="mission-badges flex-row gap-sm">
                                                <span v-if="mission.completed" class="badge completed">Completed</span>
                                                <span v-else-if="isCurrentMission(mission, index)" class="badge current">Current</span>
                                                <span v-else-if="mission.locked" class="badge locked">Locked</span>
                                                <span class="badge difficulty">{{ mission.difficulty }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </InteractiveTile>
                            </div>
                        </div>
                    </div>
                </Panel>

                <!-- Right Panel: Galaxy Map & Mission Info -->
                <Panel class="galaxy-panel" no-padding>
                    <div class="galaxy-layout flex-col fullheight">
                        <!-- Campaign Progress Header -->
                        <div class="campaign-progress-header padding-xl">
                            <div class="flex-row flex-center-items gap-lg">
                                <div class="campaign-icon">
                                    <img v-if="campaignData.image" :src="campaignData.image" :alt="campaignData.name" />
                                    <Icon v-else :icon="campaignData.icon" height="48" />
                                </div>
                                <div class="flex-col gap-sm flex-grow">
                                    <div class="flex-row flex-center-items flex-space-between">
                                        <span class="subtitle-1">Campaign Progress</span>
                                        <span class="body-2">{{ campaignData.completedMissions }}/{{ campaignData.totalMissions }} missions</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{ width: campaignData.progressPercent + '%' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Galaxy Map Placeholder -->
                        <div class="galaxy-map-container flex-grow">
                            <div class="galaxy-map-placeholder">
                                <Icon :icon="planetIcon" height="80" />
                                <h2 class="title-2">3D Galaxy Map</h2>
                                <p class="body-1">Goes Here</p>
                                <p class="caption-1">Rotates and animates as you select missions</p>
                            </div>
                        </div>

                        <!-- Selected Mission Info -->
                        <div v-if="selectedMission" class="mission-info-section padding-xxl">
                            <div class="flex-row flex-center-items gap-lg margin-bottom-lg">
                                <div class="selected-mission-number">
                                    <Icon v-if="selectedMission.completed" :icon="checkIcon" height="28" />
                                    <span v-else>{{ selectedMissionIndex + 1 }}</span>
                                </div>
                                <div class="flex-col flex-grow">
                                    <h2 class="title-2">{{ selectedMission.name }}</h2>
                                    <p class="body-2">{{ selectedMission.description }}</p>
                                </div>
                            </div>
                            <div class="mission-stats flex-row gap-xl margin-bottom-lg">
                                <div class="stat">
                                    <span class="caption-1">Difficulty</span>
                                    <span class="body-1-strong" :class="getDifficultyClass(selectedMission.difficulty)">{{ selectedMission.difficulty }}</span>
                                </div>
                                <div class="stat">
                                    <span class="caption-1">Est. Time</span>
                                    <span class="body-1-strong">{{ selectedMission.estimatedTime }} min</span>
                                </div>
                            </div>
                            <Button class="green large fullwidth" @click="openMissionBriefing">
                                Mission Briefing
                            </Button>
                        </div>

                        <!-- No Mission Selected -->
                        <div v-else class="no-mission-selected padding-xxl">
                            <p class="body-1">Select a mission to view details</p>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import arrowLeftIcon from "@iconify-icons/mdi/arrow-left";
import lockIcon from "@iconify-icons/mdi/lock";
import checkIcon from "@iconify-icons/mdi/check-circle";
import skullIcon from "@iconify-icons/mdi/skull";
import planetIcon from "@iconify-icons/mdi/planet";

import Button from "@renderer/components/controls/Button.vue";
import Panel from "@renderer/components/common/Panel.vue";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import { useTypedI18n } from "@renderer/i18n";

import armadaImage from "@renderer/assets/images/factions/armada_faction.png";
import cortexImage from "@renderer/assets/images/factions/cortex_faction.png";

const { t } = useTypedI18n();
const router = useRouter();
const route = useRoute();

const campaignId = computed(() => route.params.campaignId as string);

interface Mission {
    id: number;
    name: string;
    description: string;
    difficulty: string;
    estimatedTime: number;
    locked: boolean;
    completed: boolean;
}

// Mock campaign data - this would come from a store/API
const campaigns = {
    armada: {
        id: "armada",
        name: "Armada Campaign",
        description: "Lead the Armada forces in their fight for freedom",
        image: armadaImage,
        totalMissions: 18,
        completedMissions: 3,
        progressPercent: 17,
        missions: [
            { id: 1, name: "First Strike", description: "Defend the colony from initial assault", difficulty: "Easy", estimatedTime: 15, locked: false, completed: true },
            { id: 2, name: "Supply Lines", description: "Secure critical supply routes", difficulty: "Easy", estimatedTime: 20, locked: false, completed: true },
            { id: 3, name: "Hold the Line", description: "Defend against overwhelming odds", difficulty: "Medium", estimatedTime: 25, locked: false, completed: true },
            { id: 4, name: "Counterattack", description: "Launch offensive operations", difficulty: "Medium", estimatedTime: 30, locked: false, completed: false },
            { id: 5, name: "Behind Enemy Lines", description: "Infiltrate enemy territory", difficulty: "Hard", estimatedTime: 35, locked: true, completed: false },
            { id: 6, name: "Rescue Operation", description: "Extract trapped personnel from the fallen outpost", difficulty: "Medium", estimatedTime: 25, locked: true, completed: false },
            { id: 7, name: "Strategic Strike", description: "Destroy the enemy's main supply depot", difficulty: "Hard", estimatedTime: 40, locked: true, completed: false },
            { id: 8, name: "Alliance Talks", description: "Secure diplomatic relations with neutral factions", difficulty: "Medium", estimatedTime: 30, locked: true, completed: false },
            { id: 9, name: "The Crossing", description: "Lead your forces across the dangerous DMZ", difficulty: "Hard", estimatedTime: 35, locked: true, completed: false },
            { id: 10, name: "Enemy Within", description: "Root out Cortex infiltrators in your ranks", difficulty: "Hard", estimatedTime: 40, locked: true, completed: false },
            { id: 11, name: "Orbital Defense", description: "Protect the space station from attack", difficulty: "Very Hard", estimatedTime: 45, locked: true, completed: false },
            { id: 12, name: "Final Push", description: "Break through the enemy's fortified lines", difficulty: "Hard", estimatedTime: 45, locked: true, completed: false },
            { id: 13, name: "Turning Point", description: "Secure a strategic victory at the crossroads", difficulty: "Very Hard", estimatedTime: 50, locked: true, completed: false },
            { id: 14, name: "Heart of Darkness", description: "Assault the enemy's central command", difficulty: "Very Hard", estimatedTime: 55, locked: true, completed: false },
            { id: 15, name: "Last Stand", description: "Defend against the enemy's final assault", difficulty: "Very Hard", estimatedTime: 55, locked: true, completed: false },
            { id: 16, name: "The Reckoning", description: "Face the enemy commander in battle", difficulty: "Extreme", estimatedTime: 60, locked: true, completed: false },
            { id: 17, name: "Dawn of Freedom", description: "Lead the final liberation assault", difficulty: "Extreme", estimatedTime: 60, locked: true, completed: false },
            { id: 18, name: "Victory", description: "Secure total victory for the Armada", difficulty: "Extreme", estimatedTime: 75, locked: true, completed: false },
        ]
    },
    cortex: {
        id: "cortex",
        name: "Cortex Campaign",
        description: "Take command of the Cortex machine armies",
        image: cortexImage,
        totalMissions: 10,
        completedMissions: 0,
        progressPercent: 0,
        missions: [
            { id: 1, name: "Awakening", description: "Initial Cortex operations", difficulty: "Easy", estimatedTime: 15, locked: false, completed: false },
            { id: 2, name: "Expansion Protocol", description: "Secure additional resources", difficulty: "Easy", estimatedTime: 20, locked: true, completed: false },
            { id: 3, name: "Assimilation", description: "Convert enemy technology", difficulty: "Medium", estimatedTime: 25, locked: true, completed: false },
            { id: 4, name: "Network Nexus", description: "Establish command network", difficulty: "Medium", estimatedTime: 30, locked: true, completed: false },
            { id: 5, name: "Optimization", description: "Improve unit efficiency", difficulty: "Hard", estimatedTime: 35, locked: true, completed: false },
            { id: 6, name: "Hostile Takeover", description: "Capture enemy facilities", difficulty: "Hard", estimatedTime: 40, locked: true, completed: false },
            { id: 7, name: "System Override", description: "Hack enemy systems", difficulty: "Very Hard", estimatedTime: 45, locked: true, completed: false },
            { id: 8, name: "Integration", description: "Merge captured technology", difficulty: "Very Hard", estimatedTime: 50, locked: true, completed: false },
            { id: 9, name: "Singularity", description: "Achieve technological supremacy", difficulty: "Extreme", estimatedTime: 55, locked: true, completed: false },
            { id: 10, name: "Total Control", description: "Establish complete dominance", difficulty: "Extreme", estimatedTime: 60, locked: true, completed: false },
        ]
    },
    legion: {
        id: "legion",
        name: "Legion Campaign",
        description: "Command the mysterious Legion forces",
        icon: skullIcon,
        totalMissions: 8,
        completedMissions: 0,
        progressPercent: 0,
        missions: [
            { id: 1, name: "Emergence", description: "The Legion awakens", difficulty: "Medium", estimatedTime: 20, locked: false, completed: false },
            { id: 2, name: "Ancient Power", description: "Unlock forgotten technology", difficulty: "Medium", estimatedTime: 25, locked: true, completed: false },
            { id: 3, name: "Convergence", description: "Unite scattered forces", difficulty: "Hard", estimatedTime: 30, locked: true, completed: false },
            { id: 4, name: "Revelation", description: "Discover the truth", difficulty: "Hard", estimatedTime: 35, locked: true, completed: false },
            { id: 5, name: "Cataclysm", description: "Unleash devastating force", difficulty: "Very Hard", estimatedTime: 40, locked: true, completed: false },
            { id: 6, name: "Dominion", description: "Assert control over all", difficulty: "Very Hard", estimatedTime: 45, locked: true, completed: false },
            { id: 7, name: "Ascension", description: "Transcend limitations", difficulty: "Extreme", estimatedTime: 50, locked: true, completed: false },
            { id: 8, name: "Eternity", description: "Shape the future forever", difficulty: "Extreme", estimatedTime: 60, locked: true, completed: false },
        ]
    }
};

const campaignData = computed(() => campaigns[campaignId.value as keyof typeof campaigns] || campaigns.armada);

const selectedMission = ref<Mission | null>(null);

const selectedMissionIndex = computed(() => {
    if (!selectedMission.value) return -1;
    return campaignData.value.missions.findIndex(m => m.id === selectedMission.value?.id);
});

// Auto-select the current mission on load
const currentMissionIndex = computed(() => {
    const missions = campaignData.value.missions;
    // Find first incomplete, unlocked mission
    const idx = missions.findIndex(m => !m.completed && !m.locked);
    return idx >= 0 ? idx : 0;
});

// Initialize with current mission selected
if (!selectedMission.value && campaignData.value.missions.length > 0) {
    const currentIdx = campaignData.value.missions.findIndex(m => !m.completed && !m.locked);
    selectedMission.value = campaignData.value.missions[currentIdx >= 0 ? currentIdx : 0];
}

function goBack() {
    router.push("/play/campaign");
}

function selectMission(mission: Mission) {
    selectedMission.value = mission;
}

function openMissionBriefing() {
    if (selectedMission.value) {
        router.push(`/play/campaign/mission?campaign=${campaignId.value}&mission=${selectedMission.value.id}`);
    }
}

function getMissionClass(mission: Mission): string {
    if (mission.completed) return 'completed';
    if (mission.locked) return 'locked';
    if (isCurrentMission(mission, campaignData.value.missions.indexOf(mission))) return 'current';
    return 'available';
}

function isCurrentMission(mission: Mission, index: number): boolean {
    // Current mission is first incomplete, unlocked mission
    return !mission.completed && !mission.locked && index === currentMissionIndex.value;
}

function getDifficultyClass(difficulty: string): string {
    const difficultyMap: Record<string, string> = {
        'Easy': 'difficulty-easy',
        'Medium': 'difficulty-medium',
        'Hard': 'difficulty-hard',
        'Very Hard': 'difficulty-very-hard',
        'Extreme': 'difficulty-extreme'
    };
    return difficultyMap[difficulty] || '';
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map.get($spacing, "xxl") map.get($spacing, "sm") map.get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
}

.campaign-layout {
    width: 100%;
    height: 100%;
    min-height: 0;
    align-items: stretch;
}

.missions-panel {
    width: 450px;
    min-height: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    
    // Override Panel's internal structure for proper scrolling
    :deep(.panel) {
        min-height: 0;
        height: 100%;
    }
    
    :deep(.content) {
        min-height: 0;
        overflow: hidden;
    }
}

.missions-scroll {
    min-height: 0;
    flex: 1;
}

.missions-list {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "lg");
    padding: map.get($spacing, "xxl");
}

.mission-tile-wrapper {
    height: 140px;
}

.mission-media {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%);
    
    &.completed {
        background: linear-gradient(135deg, rgba(34, 100, 50, 0.6) 0%, rgba(20, 60, 30, 0.6) 100%);
    }
    
    &.current {
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.6) 0%, rgba(20, 50, 120, 0.6) 100%);
    }
    
    &.locked {
        background: linear-gradient(135deg, rgba(50, 50, 50, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%);
    }
}

.mission-number-badge {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    
    .completed & {
        border-color: #22c55e;
        color: #22c55e;
    }
    
    .current & {
        border-color: #3b82f6;
        color: #3b82f6;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
    
    .locked & {
        border-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.4);
    }
}

.mission-tile-content {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    
    h3 {
        margin: 0;
    }
    
    p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
    }
}

.mission-badges {
    margin-top: map.get($spacing, "xs");
    flex-wrap: wrap;
}

.badge {
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    
    &.completed {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
    }
    
    &.current {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
    }
    
    &.locked {
        background: rgba(128, 128, 128, 0.2);
        color: rgba(255, 255, 255, 0.5);
    }
    
    &.difficulty {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
    }
}

// Campaign Progress Header
.campaign-progress-header {
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.campaign-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border-radius: 4px;
    transition: width 0.3s ease;
}

// Galaxy Panel
.galaxy-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.galaxy-layout {
    min-height: 0;
}

.galaxy-map-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    background: linear-gradient(180deg, rgba(0, 0, 20, 0.8) 0%, rgba(10, 10, 30, 0.8) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.galaxy-map-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: map.get($spacing, "md");
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    
    h2, p {
        margin: 0;
    }
}

.mission-info-section {
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-mission-number {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.2);
    border: 2px solid #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    color: #3b82f6;
}

.mission-stats {
    .stat {
        display: flex;
        flex-direction: column;
        gap: map.get($spacing, "xs");
        
        .caption-1 {
            color: rgba(255, 255, 255, 0.6);
        }
    }
}

.difficulty-easy { color: #22c55e; }
.difficulty-medium { color: #eab308; }
.difficulty-hard { color: #f97316; }
.difficulty-very-hard { color: #ef4444; }
.difficulty-extreme { color: #dc2626; }

.no-mission-selected {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
}

// Override InteractiveTile styles for locked missions
:deep(.locked) {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
