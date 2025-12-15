<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Mission", devOnly: true, hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-header flex-row flex-center-items gap-lg">
                <Button class="back-button" @click="goBack">
                    <Icon :icon="arrowLeftIcon" height="24" />
                </Button>
                <div class="view-title">
                    <h1>{{ missionData.name }}</h1>
                    <p>{{ campaignName }} - Mission {{ missionId }}</p>
                </div>
            </div>
            
            <div class="mission-detail-layout flex-row gap-xl flex-grow">
                <!-- Left Column - Mission Info -->
                <div class="mission-info-column flex-col gap-lg">
                    <Panel class="mission-brief padding-xl">
                        <h2 class="title-3">Mission Brief</h2>
                        <div class="brief-content body-1">
                            <p>{{ missionData.briefing }}</p>
                        </div>
                        
                        <div class="mission-stats flex-col gap-md margin-top-xl">
                            <div class="stat-row flex-row flex-center-items">
                                <span class="subtitle-2">Difficulty:</span>
                                <span class="body-1" :class="getDifficultyClass(missionData.difficulty)">{{ missionData.difficulty }}</span>
                            </div>
                            <div class="stat-row flex-row flex-center-items">
                                <span class="subtitle-2">Estimated Time:</span>
                                <span class="body-1">{{ missionData.estimatedTime }} minutes</span>
                            </div>
                            <div class="stat-row flex-row flex-center-items">
                                <span class="subtitle-2">Map:</span>
                                <span class="body-1">{{ missionData.map }}</span>
                            </div>
                        </div>
                    </Panel>

                    <Panel class="objectives-panel padding-xl">
                        <h2 class="title-3">Objectives</h2>
                        <div class="objectives-list flex-col gap-md margin-top-md">
                            <div v-for="(objective, index) in missionData.objectives" :key="index" class="objective-item flex-row gap-md">
                                <div class="objective-marker">{{ index + 1 }}</div>
                                <div class="objective-text">
                                    <h3 class="subtitle-2">{{ objective.title }}</h3>
                                    <p class="body-2">{{ objective.description }}</p>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <Panel v-if="missionData.completed" class="rewards-panel padding-xl">
                        <h2 class="title-3">Mission Completed!</h2>
                        <div class="rewards-list flex-col gap-sm margin-top-md">
                            <div class="reward-item body-1">
                                <Icon :icon="checkIcon" height="20" />
                                <span>Experience: +{{ missionData.experienceReward }}</span>
                            </div>
                            <div class="reward-item body-1">
                                <Icon :icon="checkIcon" height="20" />
                                <span>New Units Unlocked: {{ missionData.unitsUnlocked }}</span>
                            </div>
                        </div>
                    </Panel>
                </div>

                <!-- Right Column - Preview & Actions -->
                <div class="mission-preview-column flex-col gap-lg">
                    <Panel class="map-preview no-padding">
                        <div class="preview-placeholder">
                            <Icon :icon="mapIcon" height="64" />
                            <span class="body-1">Map Preview</span>
                        </div>
                    </Panel>

                    <div class="mission-actions flex-col gap-md">
                        <Button v-if="!missionData.locked" class="green large fullwidth" @click="startMission">
                            <div class="flex-row flex-center-items gap-md">
                                <Icon :icon="playIcon" height="24" />
                                <span>{{ missionData.completed ? 'Replay Mission' : 'Start Mission' }}</span>
                            </div>
                        </Button>
                        <Button v-else class="grey large fullwidth" disabled>
                            <div class="flex-row flex-center-items gap-md">
                                <Icon :icon="lockIcon" height="24" />
                                <span>Mission Locked</span>
                            </div>
                        </Button>
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
import playIcon from "@iconify-icons/mdi/play";
import lockIcon from "@iconify-icons/mdi/lock";
import mapIcon from "@iconify-icons/mdi/map";
import checkIcon from "@iconify-icons/mdi/check-circle";

import Button from "@renderer/components/controls/Button.vue";
import Panel from "@renderer/components/common/Panel.vue";
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();
const router = useRouter();
const route = useRoute();

const campaignId = computed(() => (route.query.campaign as string) || 'armada');
const missionId = computed(() => Number(route.query.mission) || 1);

// Mock mission data - this would come from a store/API
const campaigns = {
    armada: "Armada Campaign",
    cortex: "Cortex Campaign",
    legion: "Legion Campaign"
};

const campaignName = computed(() => campaigns[campaignId.value as keyof typeof campaigns] || "Campaign");

// Generate mission data based on mission ID
const missionData = computed(() => {
    const id = missionId.value;
    const missions: Record<number, any> = {
        1: {
            name: "First Strike",
            briefing: "Intelligence reports indicate an imminent enemy assault on our primary colony. Your mission is to defend the colony and repel the attacking forces. Establish defensive positions and hold the line at all costs. This is our first major engagement - make it count.",
            difficulty: "Easy",
            estimatedTime: 15,
            map: "Delta Siege",
            locked: false,
            completed: true,
            experienceReward: 500,
            unitsUnlocked: "Medium Tanks, Artillery",
            objectives: [
                { title: "Defend the Colony", description: "Protect the main base from enemy assault" },
                { title: "Eliminate Enemy Forces", description: "Destroy all attacking units" },
                { title: "Protect Civilians", description: "Ensure no civilian structures are destroyed" }
            ]
        },
        2: {
            name: "Supply Lines",
            briefing: "Our supply routes have been compromised by enemy raiders. Secure the convoy routes and eliminate the threat to our logistics network. Without supplies, our forces cannot sustain operations.",
            difficulty: "Easy",
            estimatedTime: 20,
            map: "Supply Route Alpha",
            locked: false,
            completed: true,
            experienceReward: 650,
            unitsUnlocked: "Transport Units",
            objectives: [
                { title: "Escort Supply Convoy", description: "Protect convoy units as they travel" },
                { title: "Clear Enemy Ambushes", description: "Eliminate raiders along the route" },
                { title: "Secure Waypoints", description: "Capture strategic positions" }
            ]
        },
        3: {
            name: "Hold the Line",
            briefing: "Enemy forces have launched a massive counteroffensive. You must hold your position against overwhelming odds while reinforcements are en route. Use all available resources to maintain defensive integrity.",
            difficulty: "Medium",
            estimatedTime: 25,
            map: "Last Stand",
            locked: false,
            completed: true,
            experienceReward: 800,
            unitsUnlocked: "Heavy Defenses",
            objectives: [
                { title: "Survive 20 Minutes", description: "Hold position until reinforcements arrive" },
                { title: "Maintain 50% Strength", description: "Keep at least half your forces operational" },
                { title: "Destroy Enemy Commander", description: "Eliminate the enemy leader" }
            ]
        },
        4: {
            name: "Counterattack",
            briefing: "The time has come to take the fight to the enemy. Launch a coordinated offensive against their forward positions. Intelligence suggests their defenses are strong, but not impenetrable. Strike hard and fast.",
            difficulty: "Medium",
            estimatedTime: 30,
            map: "Contested Valley",
            locked: false,
            completed: false,
            objectives: [
                { title: "Destroy Enemy Base", description: "Eliminate the enemy command center" },
                { title: "Capture Territory", description: "Secure resource points in enemy territory" },
                { title: "Minimize Casualties", description: "Complete mission with 70% force strength remaining" }
            ]
        }
    };
    
    return missions[id] || {
        name: `Mission ${id}`,
        briefing: "Mission briefing will be provided soon. Prepare your forces and await further orders.",
        difficulty: "Unknown",
        estimatedTime: 30,
        map: "Unknown",
        locked: true,
        completed: false,
        objectives: [
            { title: "Complete Previous Mission", description: "Unlock this mission by completing the previous one" }
        ]
    };
});

function goBack() {
    router.push(`/play/campaign/${campaignId.value}`);
}

function startMission() {
    // This would launch the actual mission/game
    console.log(`Starting mission ${missionId.value} in campaign ${campaignId.value}`);
    // TODO: Implement actual mission start logic
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

.mission-detail-layout {
    min-height: 0;
    overflow-y: auto;
    align-items: flex-start;
}

.mission-info-column {
    flex: 1;
    min-width: 0;
}

.mission-preview-column {
    width: 400px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
}

.brief-content {
    margin-top: map-get($spacing, "md");
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
}

.stat-row {
    justify-content: space-between;
    
    span:first-child {
        color: rgba(255, 255, 255, 0.7);
    }
}

.difficulty-easy { color: #22c55e; }
.difficulty-medium { color: #eab308; }
.difficulty-hard { color: #f97316; }
.difficulty-very-hard { color: #ef4444; }
.difficulty-extreme { color: #dc2626; font-weight: 600; }

.objectives-list {
    margin-top: map-get($spacing, "md");
}

.objective-item {
    align-items: flex-start;
}

.objective-marker {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.objective-text {
    flex: 1;
    
    h3 {
        margin: 0 0 map-get($spacing, "xs") 0;
    }
    
    p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
    }
}

.rewards-list {
    margin-top: map-get($spacing, "md");
}

.reward-item {
    display: flex;
    align-items: center;
    gap: map-get($spacing, "sm");
    color: #22c55e;
}

.map-preview {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: map-get($spacing, "md");
    color: rgba(255, 255, 255, 0.4);
}

.mission-actions {
    margin-top: auto;
}
</style>
