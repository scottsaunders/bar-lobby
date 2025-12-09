<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

// a news feed component that displays the latest news from this rss feed https://www.beyondallreason.info/microblogs/rss.xml
<template>
    <div class="fullheight fullwidth flex-col">
        <div class="news-layout flex-row gap-lg">
            <div class="main-story">
                <NewsTile 
                    v-if="mainStory"
                    :news="mainStory" 
                    :key="mainStory.id"
                    featured
                />
            </div>
            <div v-if="subStories.length > 0" class="sub-stories flex-col gap-lg">
                <NewsTile 
                    v-for="(item, index) in subStories" 
                    :key="`sub-${item.id}-${index}`" 
                    :news="item"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import NewsTile from "@renderer/components/misc/NewsTile.vue";
const newsRssFeed = await window.misc.getNewsRssFeed(4);

// Reorder entries: lightbringer first, then others
const orderedEntries = computed(() => {
    if (!newsRssFeed?.entries) return [];
    
    const entries = [...newsRssFeed.entries];
    
    // Find lightbringer story and move it to the front
    const lightbringerIndex = entries.findIndex(entry => 
        entry.title?.toLowerCase().includes("lightbringer")
    );
    
    if (lightbringerIndex > 0) {
        const lightbringer = entries.splice(lightbringerIndex, 1)[0];
        entries.unshift(lightbringer);
    }
    
    return entries;
});

const mainStory = computed(() => {
    return orderedEntries.value[0];
});

const subStories = computed(() => {
    if (orderedEntries.value.length < 2) return [];
    return orderedEntries.value.slice(1, 4); // Get items 1, 2, 3 (skip the first one which is the main story)
});
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.news-layout {
    height: 100%;
    width: 100%;
    align-items: stretch;
}

.main-story {
    flex: 0 0 auto;
    height: 100%;
    width: auto;
    min-width: 0;
    display: flex;
    align-items: stretch;
}

.main-story :deep(.interactive-tile) {
    height: 100%;
    width: 100%;
    aspect-ratio: 1;
}

.sub-stories {
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.sub-stories :deep(.interactive-tile) {
    flex: 0 0 auto;
    height: calc((100% - (2 * map-get($spacing, "lg"))) / 3);
    width: 100%;
    min-height: 0;
}
</style>
