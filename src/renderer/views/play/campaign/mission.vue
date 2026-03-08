<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Mission", hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <div class="flex-row flex-center-items gap-md">
                    <Button class="icon view-back-button" @click="goBack">
                        <Icon :icon="arrowLeftIcon" height="24" />
                    </Button>
                    <div>
                        <h1>{{ missionData.name }}</h1>
                        <p>{{ campaignName }} - Mission {{ missionId }}</p>
                    </div>
                </div>
            </div>
            
            <div class="mission-layout flex-row gap-xl flex-grow">
                <!-- Main Content - Mission Info -->
                <Panel class="flex-grow mission-content-panel">
                    <div class="scroll-container main-panel-scroll">
                        <div class="flex-col gap-lg padding-xxl">
                            <!-- Mission Brief -->
                            <div class="mission-section">
                                <h2 class="title-3 margin-bottom-md">Mission Brief</h2>
                                <p class="body-1 brief-content">{{ missionData.briefing }}</p>
                            </div>

                            <!-- Mission Stats -->
                            <div class="mission-section">
                                <h3 class="subtitle-1 margin-bottom-md">Mission Details</h3>
                                <div class="mission-stats flex-col gap-sm">
                                    <StatusCard label="Difficulty" :value="missionData.difficulty" :class="getDifficultyClass(missionData.difficulty)" />
                                    <StatusCard label="Estimated Time" :value="`${missionData.estimatedTime} minutes`" />
                                    <StatusCard label="Map" :value="missionData.map" />
                                </div>
                            </div>

                            <!-- Objectives -->
                            <div class="mission-section">
                                <h3 class="subtitle-1 margin-bottom-md">Objectives</h3>
                                <div class="objectives-list flex-col gap-md">
                                    <div v-for="(objective, index) in missionData.objectives" :key="index" class="objective-item flex-row gap-md">
                                        <div class="objective-marker">{{ index + 1 }}</div>
                                        <div class="objective-text">
                                            <h4 class="subtitle-2">{{ objective.title }}</h4>
                                            <p class="body-2">{{ objective.description }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Rewards (if completed) -->
                            <div v-if="missionData.completed" class="mission-section rewards-section">
                                <h3 class="subtitle-1 margin-bottom-md">Mission Completed!</h3>
                                <div class="rewards-list flex-col gap-sm">
                                    <div class="reward-item body-1">
                                        <Icon :icon="checkIcon" height="20" />
                                        <span>Experience: +{{ missionData.experienceReward }}</span>
                                    </div>
                                    <div class="reward-item body-1">
                                        <Icon :icon="checkIcon" height="20" />
                                        <span>New Units Unlocked: {{ missionData.unitsUnlocked }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>

                <!-- Right Panel - Map Preview & Actions -->
                <Panel class="mission-side-panel" no-padding>
                    <div class="mission-side-layout flex-col fullheight">
                        <h2 class="title-2 padding-left-xxl padding-top-xxl padding-right-xxl padding-bottom-lg">{{ missionData.map }}</h2>
                        <div class="map-preview-container flex-grow margin-left-xxl margin-right-xxl">
                            <MapSimplePreview v-if="map" :map="map" />
                        </div>
                        <div class="mission-controls flex-col gap-md padding-left-xxl padding-right-xxl padding-top-lg padding-bottom-xxl">
                            <Button v-if="!missionData.locked" class="green large fullwidth" @click="startMission">
                                {{ missionData.completed ? 'Replay Mission' : 'Start Mission' }}
                            </Button>
                            <Button v-else class="grey large fullwidth" disabled>
                                Mission Locked
                            </Button>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Icon } from "@iconify/vue";
import arrowLeftIcon from "@iconify-icons/mdi/arrow-left";
import checkIcon from "@iconify-icons/mdi/check-circle";

import Button from "@renderer/components/controls/Button.vue";
import Panel from "@renderer/components/common/Panel.vue";
import StatusCard from "@renderer/components/common/StatusCard.vue";
import MapSimplePreview from "@renderer/components/maps/MapSimplePreview.vue";
import { useTypedI18n } from "@renderer/i18n";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";

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

// Use Quicksilver Remake as the example map for all missions
const map = useDexieLiveQuery(() => db.maps.get("Quicksilver Remake 1.24"));

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
            mapSize: "16x16",
            playerCount: "2v2",
            terrain: ["grassy", "water"],
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
            mapSize: "12x16",
            playerCount: "1v2",
            terrain: ["desert", "flat"],
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
            mapSize: "20x20",
            playerCount: "1v3",
            terrain: ["hills", "forests"],
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
            mapSize: "16x20",
            playerCount: "2v2",
            terrain: ["tropical", "sea", "island"],
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
        mapSize: "16x16",
        playerCount: "TBD",
        terrain: ["grassy"],
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
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.mission-layout {
    min-height: 0;
}

.mission-content-panel {
    min-height: 0;
}

.main-panel-scroll {
    height: 100%;
    overflow-y: auto;
}

.mission-section {
    margin-bottom: map.get($spacing, "xl");
    
    &:last-child {
        margin-bottom: 0;
    }
}

.brief-content {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
}

.mission-stats {
    max-width: 500px;
}

.difficulty-easy :deep(.status-card) { border-color: #22c55e; }
.difficulty-medium :deep(.status-card) { border-color: #eab308; }
.difficulty-hard :deep(.status-card) { border-color: #f97316; }
.difficulty-very-hard :deep(.status-card) { border-color: #ef4444; }
.difficulty-extreme :deep(.status-card) { border-color: #dc2626; }

.objectives-list {
    display: flex;
    flex-direction: column;
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
    
    h4 {
        margin: 0 0 map.get($spacing, "xs") 0;
    }
    
    p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
    }
}

.rewards-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: map.get($spacing, "xl");
}

.reward-item {
    display: flex;
    align-items: center;
    gap: map.get($spacing, "sm");
    color: #22c55e;
}

.mission-side-panel {
    width: 450px;
    flex-shrink: 0;
}

.mission-side-layout {
    display: flex;
    flex-direction: column;
}

.map-preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    height: 100%;
}

.mission-controls {
    flex-shrink: 0;
}
</style>
