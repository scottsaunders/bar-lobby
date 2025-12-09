<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <InteractiveTile 
        :class="{ featured }" 
        readMoreVariant
        @click="openNews"
    >
        <template #media>
            <div v-if="backgroundImageCss" :style="`background-image: ${backgroundImageCss}; background-position: center; background-size: cover; background-repeat: no-repeat; width: 100%; height: 100%;`"></div>
        </template>
        <template #content>
            <h3 class="subtitle-1">{{ news.title?.replace(" ⇀ News ★ Beyond All Reason RTS", "") }}</h3>
        </template>
        <template #body>
            <p class="body-1">{{ news.description }}</p>
        </template>
        <template #button>
            <Button class="black text-shadow tertiary" @click.stop="openNews">
                {{ t("lobby.components.misc.newsTile.clickToReadMore") }}
            </Button>
        </template>
    </InteractiveTile>
</template>

<script lang="ts" setup>
import { NewsFeedEntry } from "@main/services/news.service";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import Button from "@renderer/components/controls/Button.vue";

const { t } = useTypedI18n();

const props = defineProps<{
    news: NewsFeedEntry;
    featured?: boolean;
}>();

const { base64 } = useImageBlobUrlCache();
const newsThumbnail = props.news.thumbnailUrl;
const backgroundImageCss = newsThumbnail ? ref(`url('${base64(newsThumbnail, props.news.thumbnail || "")}')`) : ref();

const openNews = () => {
    if (props.news.link) window.shell.openInBrowser(props.news.link);
};
</script>

<style lang="scss" scoped>
.featured {
    height: 100%;
    width: 100%;
    aspect-ratio: 1;
}
</style>
