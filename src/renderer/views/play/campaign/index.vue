<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Campaign", order: 2, devOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.play.campaign.title") }}</h1>
                <p>{{ t("lobby.views.play.campaign.description") }}</p>
            </div>
            
            <div class="campaign-layout flex-col gap-lg flex-grow">
                <!-- Main Campaign Tiles - Full Width -->
                <div class="campaigns-grid flex-row gap-lg flex-grow">
                    <!-- Armada Campaign -->
                    <div class="campaign-tile-wrapper" @click="selectCampaign('armada')">
                        <div class="campaign-card">
                            <div class="campaign-image">
                                <img :src="armadaImage" alt="Armada Campaign" />
                            </div>
                            <div class="campaign-info flex-col gap-md padding-lg">
                                <h2 class="title-2">Armada Campaign</h2>
                                <p class="body-2 campaign-description">Lead the Armada forces in their fight for freedom. 
                                Experience the origins of the galactic conflict through 12 challenging missions.</p>
                                <div class="progress-section flex-row flex-center-items gap-md">
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{ width: armadaProgress.percent + '%' }"></div>
                                    </div>
                                    <span class="caption-1">{{ armadaProgress.completed }}/{{ armadaProgress.total }}</span>
                                </div>
                                <Button class="green fullwidth" @click.stop="selectCampaign('armada')">
                                    {{ armadaProgress.completed > 0 ? 'Continue Campaign' : 'Start Campaign' }}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <!-- Cortex Campaign -->
                    <div class="campaign-tile-wrapper" :class="{ locked: !cortexUnlocked }" @click="cortexUnlocked && selectCampaign('cortex')">
                        <div class="campaign-card">
                            <div class="campaign-image">
                                <img :src="cortexImage" alt="Cortex Campaign" />
                                <div v-if="!cortexUnlocked" class="locked-overlay">
                                    <Icon :icon="lockIcon" height="48" />
                                </div>
                            </div>
                            <div class="campaign-info flex-col gap-md padding-lg">
                                <div class="flex-row flex-center-items gap-sm">
                                    <h2 class="title-2">Cortex Campaign</h2>
                                    <Icon v-if="!cortexUnlocked" :icon="lockIcon" height="20" />
                                </div>
                                <p class="body-2 campaign-description">Take command of the Cortex machine armies. 
                                Discover the truth behind the war in this gripping 10-mission campaign.</p>
                                <div v-if="cortexUnlocked" class="progress-section flex-row flex-center-items gap-md">
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{ width: cortexProgress.percent + '%' }"></div>
                                    </div>
                                    <span class="caption-1">{{ cortexProgress.completed }}/{{ cortexProgress.total }}</span>
                                </div>
                                <div v-else class="locked-message caption-1">
                                    Complete Armada Campaign to unlock
                                </div>
                                <Button 
                                    :class="cortexUnlocked ? 'green fullwidth' : 'grey fullwidth'" 
                                    :disabled="!cortexUnlocked"
                                    @click.stop="cortexUnlocked && selectCampaign('cortex')"
                                >
                                    {{ !cortexUnlocked ? 'Locked' : cortexProgress.completed > 0 ? 'Continue Campaign' : 'Start Campaign' }}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <!-- Legion Campaign -->
                    <div class="campaign-tile-wrapper" :class="{ locked: !legionUnlocked }" @click="legionUnlocked && selectCampaign('legion')">
                        <div class="campaign-card">
                            <div class="campaign-image legion-placeholder">
                                <Icon :icon="skullIcon" height="80" />
                                <div v-if="!legionUnlocked" class="locked-overlay">
                                    <Icon :icon="lockIcon" height="48" />
                                </div>
                            </div>
                            <div class="campaign-info flex-col gap-md padding-lg">
                                <div class="flex-row flex-center-items gap-sm">
                                    <h2 class="title-2">Legion Campaign</h2>
                                    <Icon v-if="!legionUnlocked" :icon="lockIcon" height="20" />
                                </div>
                                <p class="body-2 campaign-description">Command the mysterious Legion forces. 
                                Uncover ancient secrets in this epic 8-mission finale to the trilogy.</p>
                                <div v-if="legionUnlocked" class="progress-section flex-row flex-center-items gap-md">
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{ width: legionProgress.percent + '%' }"></div>
                                    </div>
                                    <span class="caption-1">{{ legionProgress.completed }}/{{ legionProgress.total }}</span>
                                </div>
                                <div v-else class="locked-message caption-1">
                                    Complete Cortex Campaign to unlock
                                </div>
                                <Button 
                                    :class="legionUnlocked ? 'green fullwidth' : 'grey fullwidth'" 
                                    :disabled="!legionUnlocked"
                                    @click.stop="legionUnlocked && selectCampaign('legion')"
                                >
                                    {{ !legionUnlocked ? 'Locked' : legionProgress.completed > 0 ? 'Continue Campaign' : 'Start Campaign' }}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Actions -->
                <div class="campaign-actions flex-row gap-lg">
                    <Button class="action-button fullwidth" @click="startTutorial">
                        <div class="flex-row flex-center-items gap-md">
                            <Icon :icon="schoolIcon" height="24" />
                            <span class="subtitle-1">Tutorial</span>
                        </div>
                    </Button>
                    <Button class="action-button fullwidth" @click="openLore">
                        <div class="flex-row flex-center-items gap-md">
                            <Icon :icon="bookIcon" height="24" />
                            <span class="subtitle-1">Lore & Codex</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import lockIcon from "@iconify-icons/mdi/lock";
import schoolIcon from "@iconify-icons/mdi/school";
import skullIcon from "@iconify-icons/mdi/skull";
import bookIcon from "@iconify-icons/mdi/book-open-variant";

import Button from "@renderer/components/controls/Button.vue";
import { useTypedI18n } from "@renderer/i18n";

import armadaImage from "@renderer/assets/images/factions/armada_faction.png";
import cortexImage from "@renderer/assets/images/factions/cortex_faction.png";

const { t } = useTypedI18n();
const router = useRouter();

// TODO: These would come from a campaign store/save system
const tutorialProgress = ref({
    started: false,
    completed: false,
});

const armadaProgress = ref({
    completed: 3,
    total: 12,
    percent: 25,
});

const cortexProgress = ref({
    completed: 0,
    total: 10,
    percent: 0,
});

const legionProgress = ref({
    completed: 0,
    total: 8,
    percent: 0,
});

// Campaign unlock logic - complete previous to unlock next
const cortexUnlocked = computed(() => armadaProgress.value.completed >= armadaProgress.value.total);
const legionUnlocked = computed(() => cortexProgress.value.completed >= cortexProgress.value.total);

function startTutorial() {
    router.push("/play/campaign/tutorial");
}

function openLore() {
    router.push("/play/campaign/lore");
}

function selectCampaign(campaignId: string) {
    router.push(`/play/campaign/${campaignId}`);
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
    
    .view-title {
        padding-left: 0;
    }
}

.campaign-layout {
    min-height: 0;
    overflow: hidden;
}

.campaigns-grid {
    min-height: 0;
    flex-shrink: 1;
}

.campaign-tile-wrapper {
    flex: 1;
    min-width: 0;
    height: 100%;
    cursor: pointer;
    
    &.locked {
        opacity: 0.7;
        cursor: not-allowed;
        
        .campaign-card:hover {
            transform: none;
            border-color: rgba(255, 255, 255, 0.1);
        }
    }
}

.campaign-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    }
}

.campaign-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .campaign-card:hover & img {
        transform: scale(1.05);
    }
}

.campaign-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.campaign-description {
    color: rgba(255, 255, 255, 0.7);
    flex: 1;
}

.locked-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    
    svg {
        opacity: 0.5;
    }
}

.legion-placeholder {
    position: relative;
    height: 200px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    
    > svg {
        opacity: 0.3;
    }
}

.progress-section {
    width: 100%;
}

.progress-bar {
    flex: 1;
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

.locked-message {
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    padding: map-get($spacing, "xs") 0;
}

.campaign-actions {
    flex-shrink: 0;
}

.action-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: map-get($spacing, "lg") map-get($spacing, "xl");
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.3);
    }
}
</style>
