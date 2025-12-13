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
import { computed, ref, watch, onMounted } from "vue";
import { db } from "@renderer/store/db";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { MapData } from "@main/content/maps/map-data";
import defaultMiniMap from "/src/renderer/assets/images/default-minimap.png?url";

const props = defineProps<{
    mapSpringName: string;
    mapName: string;
}>();

const imageCache = useImageBlobUrlCache();

// Simple one-time lookup instead of live query subscription per cell
// This avoids creating a subscription for each MapCell in the table
const map = ref<MapData | null>(null);

async function lookupMap() {
    // Try direct lookup by springName first (indexed, fast)
    let foundMap = await db.maps.get(props.mapSpringName);
    
    // If not found, try to find by displayName (mapName prop)
    if (!foundMap && props.mapName) {
        foundMap = await db.maps.where("displayName").equals(props.mapName).first() ?? null;
    }
    
    map.value = foundMap;
}

// Lookup on mount and when props change
onMounted(lookupMap);
watch(() => [props.mapSpringName, props.mapName], lookupMap);

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
