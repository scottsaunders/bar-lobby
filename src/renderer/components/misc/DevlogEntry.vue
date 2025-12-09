<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div>
        <div class="dev-title title-3">
            {{ title }}
        </div>
        <div v-if="entry?.published" class="dev-date caption-1">
            {{ formatDistanceToNow(entry.published, { addSuffix: true }) }}
        </div>
        <div class="dev-desc body-1">{{ description }}</div>
    </div>
</template>
<script lang="ts" setup>
import { NewsFeedData } from "@main/services/news.service";
import { formatDistanceToNow } from "date-fns";
import { computed } from "vue";

const { entry } = defineProps<{ entry: NewsFeedData | undefined }>();

const title = computed(() => entry?.title?.replace(" ⇀ Microblog ★ Beyond All Reason RTS", ""));
const description = computed(() => entry?.description?.split("|")[1]?.trim());
</script>
<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.dev-title {
    filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8));
}

.dev-date {
    margin-bottom: map-get($spacing, "xs");
    filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8));
    color: rgba(255, 255, 255, 0.6);
}

.dev-desc {
    margin-bottom: map-get($spacing, "md");
    filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8));
    color: rgba(255, 255, 255, 0.8);
}
</style>
