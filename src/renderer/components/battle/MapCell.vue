<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="map-cell flex-row flex-center-items gap-sm">
        <img :src="mapImageUrl" class="map-thumbnail" />
        <span>{{ mapName }}</span>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import defaultMiniMap from "/src/renderer/assets/images/default-minimap.png?url";

const props = defineProps<{
    mapSpringName: string;
    mapName: string;
}>();

const imageCache = useImageBlobUrlCache();

const map = useDexieLiveQueryWithDeps([() => props.mapSpringName], () => {
    return db.maps.get(props.mapSpringName);
});

const mapImageUrl = computed(() => {
    if (map.value?.imagesBlob?.preview) {
        return imageCache.get(map.value.springName, map.value.imagesBlob.preview);
    }
    return defaultMiniMap;
});
</script>

<style lang="scss" scoped>
.map-cell {
    .map-thumbnail {
        width: 32px;
        height: 32px;
        object-fit: cover;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }
}
</style>
