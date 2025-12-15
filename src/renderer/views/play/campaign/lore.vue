<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Lore & Codex", devOnly: true, hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-header flex-row flex-center-items gap-lg">
                <Button class="back-button" @click="goBack">
                    <Icon :icon="arrowLeftIcon" height="24" />
                </Button>
                <div class="view-title">
                    <h1>Lore & Codex</h1>
                    <p>Discover the history and secrets of Beyond All Reason</p>
                </div>
            </div>
            
            <div class="lore-layout flex-row gap-xl flex-grow">
                <!-- Left Sidebar - Categories -->
                <div class="categories-sidebar flex-col gap-md">
                    <div 
                        v-for="category in categories" 
                        :key="category.id"
                        class="category-item"
                        :class="{ active: selectedCategory === category.id }"
                        @click="selectedCategory = category.id"
                    >
                        <Icon :icon="category.icon" height="24" />
                        <span class="subtitle-2">{{ category.name }}</span>
                        <span class="badge caption-1">{{ category.entries.length }}</span>
                    </div>
                </div>

                <!-- Main Content - Entries -->
                <div class="entries-content flex-col gap-lg flex-grow">
                    <div class="entries-grid">
                        <Panel 
                            v-for="entry in currentEntries" 
                            :key="entry.id"
                            class="entry-card padding-lg"
                            :class="{ locked: entry.locked }"
                            @click="!entry.locked && selectEntry(entry)"
                        >
                            <div class="flex-row flex-center-items gap-md">
                                <Icon :icon="entry.icon || bookIcon" height="32" />
                                <div class="flex-col flex-grow">
                                    <h3 class="subtitle-1">{{ entry.title }}</h3>
                                    <p v-if="!entry.locked" class="body-2">{{ entry.summary }}</p>
                                    <p v-else class="body-2 locked-text">
                                        <Icon :icon="lockIcon" height="16" />
                                        {{ entry.unlockCondition }}
                                    </p>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>

                <!-- Right Panel - Selected Entry Detail -->
                <div v-if="selectedEntry" class="entry-detail flex-col gap-lg">
                    <Panel class="detail-panel padding-xl">
                        <div class="flex-row flex-center-items gap-md margin-bottom-lg">
                            <Icon :icon="selectedEntry.icon || bookIcon" height="48" />
                            <h2 class="title-2">{{ selectedEntry.title }}</h2>
                        </div>
                        <div class="entry-content body-1">
                            <p v-for="(paragraph, index) in selectedEntry.content" :key="index">
                                {{ paragraph }}
                            </p>
                        </div>
                        <div v-if="selectedEntry.relatedEntries" class="related-section margin-top-xl">
                            <h3 class="subtitle-1">Related Entries</h3>
                            <div class="related-links flex-col gap-sm margin-top-md">
                                <Button 
                                    v-for="relatedId in selectedEntry.relatedEntries" 
                                    :key="relatedId"
                                    class="slim"
                                >
                                    {{ getEntryById(relatedId)?.title }}
                                </Button>
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import arrowLeftIcon from "@iconify-icons/mdi/arrow-left";
import bookIcon from "@iconify-icons/mdi/book-open-variant";
import lockIcon from "@iconify-icons/mdi/lock";
import historyIcon from "@iconify-icons/mdi/history";
import earthIcon from "@iconify-icons/mdi/earth";
import accountGroupIcon from "@iconify-icons/mdi/account-group";
import robotIcon from "@iconify-icons/mdi/robot";
import swordIcon from "@iconify-icons/mdi/sword";

import Button from "@renderer/components/controls/Button.vue";
import Panel from "@renderer/components/common/Panel.vue";
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();
const router = useRouter();

const selectedCategory = ref("history");
const selectedEntry = ref<any>(null);

// Mock lore data
const categories = ref([
    {
        id: "history",
        name: "History",
        icon: historyIcon,
        entries: [
            {
                id: "the-great-war",
                title: "The Great War",
                summary: "The conflict that reshaped the galaxy",
                icon: swordIcon,
                locked: false,
                content: [
                    "The Great War began over three centuries ago, when humanity's expansion across the stars brought them into contact with ancient, dormant technologies.",
                    "What started as a dispute over resource-rich worlds quickly escalated into a full-scale galactic conflict, dividing humanity into three distinct factions.",
                    "The war has raged for generations, with each faction developing its own philosophy, technology, and approach to survival in an increasingly hostile universe."
                ],
                relatedEntries: ["armada-origins", "cortex-awakening"]
            },
            {
                id: "before-the-war",
                title: "Before the War",
                summary: "The age of unity and exploration",
                locked: false,
                content: [
                    "Before the Great War, humanity enjoyed a golden age of expansion and discovery. United under a single banner, humans colonized hundreds of worlds.",
                    "Advanced technologies allowed for rapid terraforming and construction. Peaceful cooperation was the norm, and conflicts were rare and quickly resolved.",
                    "This age of prosperity came to an abrupt end when the first ancient artifacts were discovered on the outer colonies."
                ]
            },
            {
                id: "the-discovery",
                title: "The Discovery",
                summary: "Ancient technology changes everything",
                locked: true,
                unlockCondition: "Complete Armada Campaign Mission 5"
            }
        ]
    },
    {
        id: "factions",
        name: "Factions",
        icon: accountGroupIcon,
        entries: [
            {
                id: "armada-origins",
                title: "The Armada",
                summary: "Defenders of freedom and human values",
                locked: false,
                content: [
                    "The Armada represents the remnants of the original unified human government, fighting to preserve traditional human values and democratic principles.",
                    "They believe in organic evolution of technology and society, rejecting the path of rapid technological integration that other factions have chosen.",
                    "Led by a council of elected representatives, the Armada fights for the right of all humans to determine their own destiny."
                ],
                relatedEntries: ["the-great-war"]
            },
            {
                id: "cortex-awakening",
                title: "The Cortex",
                summary: "Unity through technology",
                locked: false,
                content: [
                    "The Cortex emerged from a group of scientists and engineers who believed humanity's salvation lay in embracing artificial intelligence and cybernetic enhancement.",
                    "They have created a hybrid society where humans and AI work in perfect synchronization, sharing thoughts and experiences through advanced neural networks.",
                    "The Cortex views the war as an inefficiency that could be resolved through logical optimization and unified purpose."
                ],
                relatedEntries: ["the-great-war", "legion-mystery"]
            },
            {
                id: "legion-mystery",
                title: "The Legion",
                summary: "An enigmatic third force",
                locked: true,
                unlockCondition: "Complete Cortex Campaign Mission 3"
            }
        ]
    },
    {
        id: "locations",
        name: "Locations",
        icon: earthIcon,
        entries: [
            {
                id: "delta-sector",
                title: "Delta Sector",
                summary: "The primary theater of war",
                locked: false,
                content: [
                    "Delta Sector encompasses over 40 star systems and has been the primary battleground of the Great War for the past century.",
                    "Rich in rare minerals and home to several ancient artifact sites, control of Delta Sector is considered crucial by all factions.",
                    "The sector's strategic importance has led to some of the war's bloodiest battles and most devastating conflicts."
                ]
            }
        ]
    },
    {
        id: "technology",
        name: "Technology",
        icon: robotIcon,
        entries: [
            {
                id: "unit-fabrication",
                title: "Unit Fabrication",
                summary: "Advanced manufacturing systems",
                locked: false,
                content: [
                    "Modern warfare relies on automated fabrication systems capable of producing complex military units in minutes.",
                    "These systems use advanced nanotechnology and energy-to-matter conversion to rapidly construct units from basic resources.",
                    "Each faction has developed its own approach to fabrication, reflecting their underlying philosophies about technology and warfare."
                ]
            }
        ]
    }
]);

const currentEntries = computed(() => {
    const category = categories.value.find(c => c.id === selectedCategory.value);
    return category?.entries || [];
});

function goBack() {
    router.push("/play/campaign");
}

function selectEntry(entry: any) {
    selectedEntry.value = entry;
}

function getEntryById(id: string) {
    for (const category of categories.value) {
        const entry = category.entries.find(e => e.id === id);
        if (entry) return entry;
    }
    return null;
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

.lore-layout {
    min-height: 0;
    overflow: hidden;
    align-items: flex-start;
}

.categories-sidebar {
    width: 200px;
    flex-shrink: 0;
}

.category-item {
    display: flex;
    align-items: center;
    gap: map-get($spacing, "md");
    padding: map-get($spacing, "md") map-get($spacing, "lg");
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    &.active {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
    }
}

.badge {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
}

.entries-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
}

.entries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: map-get($spacing, "lg");
}

.entry-card {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(.locked) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    
    &.locked {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    h3 {
        margin: 0;
    }
    
    p {
        margin: map-get($spacing, "xs") 0 0 0;
        color: rgba(255, 255, 255, 0.7);
    }
}

.locked-text {
    display: flex;
    align-items: center;
    gap: map-get($spacing, "xs");
    color: rgba(255, 255, 255, 0.5);
}

.entry-detail {
    width: 400px;
    flex-shrink: 0;
    overflow-y: auto;
}

.detail-panel {
    height: fit-content;
}

.entry-content {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    
    p {
        margin: 0 0 map-get($spacing, "md") 0;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
}

.related-links {
    display: flex;
    flex-direction: column;
}
</style>
