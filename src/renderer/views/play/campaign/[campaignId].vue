<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Campaign", devOnly: true, hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-header flex-row flex-center-items gap-lg">
                <Button class="back-button" @click="goBack">
                    <Icon :icon="arrowLeftIcon" height="24" />
                </Button>
                <div class="view-title">
                    <h1>{{ campaignData.name }}</h1>
                    <p>{{ campaignData.description }}</p>
                </div>
            </div>
            
            <div class="campaign-detail-layout flex-col gap-xl flex-grow">
                <!-- Campaign Progress Summary -->
                <Panel class="progress-panel padding-xl">
                    <div class="flex-row flex-center-items gap-xl">
                        <div class="campaign-icon">
                            <img v-if="campaignData.image" :src="campaignData.image" :alt="campaignData.name" />
                            <Icon v-else :icon="campaignData.icon" height="64" />
                        </div>
                        <div class="flex-col gap-md flex-grow">
                            <div class="flex-row flex-center-items gap-md">
                                <h2 class="title-2">Campaign Progress</h2>
                                <span class="caption-1">{{ campaignData.completedMissions }}/{{ campaignData.totalMissions }} missions completed</span>
                            </div>
                            <div class="progress-bar-large">
                                <div class="progress-fill" :style="{ width: campaignData.progressPercent + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </Panel>

                <!-- Mission Grid -->
                <div class="missions-grid">
                    <div 
                        v-for="(mission, index) in campaignData.missions" 
                        :key="mission.id"
                        class="mission-card"
                        :class="{ locked: mission.locked, completed: mission.completed }"
                        @click="!mission.locked && selectMission(mission.id)"
                    >
                        <div class="mission-number">
                            <span v-if="mission.completed">✓</span>
                            <span v-else-if="mission.locked">
                                <Icon :icon="lockIcon" height="20" />
                            </span>
                            <span v-else>{{ index + 1 }}</span>
                        </div>
                        <div class="mission-info">
                            <h3 class="subtitle-1">{{ mission.name }}</h3>
                            <p class="body-2">{{ mission.description }}</p>
                            <div class="mission-meta caption-1">
                                <span v-if="mission.difficulty">Difficulty: {{ mission.difficulty }}</span>
                                <span v-if="mission.estimatedTime">{{ mission.estimatedTime }} min</span>
                            </div>
                        </div>
                        <div v-if="mission.locked" class="locked-overlay">
                            <Icon :icon="lockIcon" height="32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import arrowLeftIcon from "@iconify-icons/mdi/arrow-left";
import lockIcon from "@iconify-icons/mdi/lock";
import skullIcon from "@iconify-icons/mdi/skull";

import Button from "@renderer/components/controls/Button.vue";
import Panel from "@renderer/components/common/Panel.vue";
import { useTypedI18n } from "@renderer/i18n";

import armadaImage from "@renderer/assets/images/factions/armada_faction.png";
import cortexImage from "@renderer/assets/images/factions/cortex_faction.png";

const { t } = useTypedI18n();
const router = useRouter();
const route = useRoute();

const campaignId = computed(() => route.params.campaignId as string);

// Mock campaign data - this would come from a store/API
const campaigns = {
    armada: {
        id: "armada",
        name: "Armada Campaign",
        description: "Lead the Armada forces in their fight for freedom",
        image: armadaImage,
        totalMissions: 12,
        completedMissions: 3,
        progressPercent: 25,
        missions: [
            { id: 1, name: "First Strike", description: "Defend the colony from initial assault", difficulty: "Easy", estimatedTime: 15, locked: false, completed: true },
            { id: 2, name: "Supply Lines", description: "Secure critical supply routes", difficulty: "Easy", estimatedTime: 20, locked: false, completed: true },
            { id: 3, name: "Hold the Line", description: "Defend against overwhelming odds", difficulty: "Medium", estimatedTime: 25, locked: false, completed: true },
            { id: 4, name: "Counterattack", description: "Launch offensive operations", difficulty: "Medium", estimatedTime: 30, locked: false, completed: false },
            { id: 5, name: "Behind Enemy Lines", description: "Infiltrate enemy territory", difficulty: "Hard", estimatedTime: 35, locked: true, completed: false },
            { id: 6, name: "Rescue Operation", description: "Extract trapped personnel", difficulty: "Medium", estimatedTime: 25, locked: true, completed: false },
            { id: 7, name: "Strategic Strike", description: "Destroy enemy stronghold", difficulty: "Hard", estimatedTime: 40, locked: true, completed: false },
            { id: 8, name: "Alliance", description: "Secure diplomatic relations", difficulty: "Medium", estimatedTime: 30, locked: true, completed: false },
            { id: 9, name: "Final Push", description: "Break through enemy lines", difficulty: "Hard", estimatedTime: 45, locked: true, completed: false },
            { id: 10, name: "Turning Point", description: "Secure strategic victory", difficulty: "Very Hard", estimatedTime: 50, locked: true, completed: false },
            { id: 11, name: "Last Stand", description: "Defend against final assault", difficulty: "Very Hard", estimatedTime: 55, locked: true, completed: false },
            { id: 12, name: "Liberation", description: "Final mission to secure freedom", difficulty: "Extreme", estimatedTime: 60, locked: true, completed: false },
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

function goBack() {
    router.push("/play/campaign");
}

function selectMission(missionId: number) {
    router.push(`/play/campaign/mission?campaign=${campaignId.value}&mission=${missionId}`);
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map-get($spacing, "xxl") map-get($spacing, "sm") map-get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
}

.view-header {
    flex-shrink: 0;
    
    .view-title {
        padding-left: 0;
    }
}

.back-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: map-get($spacing, "md");
    
    &:hover {
        background: rgba(255, 255, 255, 0.08);
    }
}

.campaign-detail-layout {
    min-height: 0;
    overflow-y: auto;
}

.progress-panel {
    flex-shrink: 0;
}

.campaign-icon {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}

.progress-bar-large {
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border-radius: 6px;
    transition: width 0.3s ease;
}

.missions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: map-get($spacing, "lg");
    padding-bottom: map-get($spacing, "xl");
}

.mission-card {
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: map-get($spacing, "lg");
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    gap: map-get($spacing, "md");
    
    &:hover:not(.locked) {
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    &.locked {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    &.completed {
        border-color: rgba(34, 197, 94, 0.3);
        
        .mission-number {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }
    }
}

.mission-number {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
}

.mission-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, "xs");
    
    h3 {
        margin: 0;
    }
    
    p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
    }
}

.mission-meta {
    display: flex;
    gap: map-get($spacing, "md");
    color: rgba(255, 255, 255, 0.6);
    margin-top: map-get($spacing, "xs");
}

.locked-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    pointer-events: none;
}
</style>
