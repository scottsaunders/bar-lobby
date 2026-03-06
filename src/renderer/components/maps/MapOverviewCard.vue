<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="map">
        <div class="background" :style="`background-image: url('${imageUrl}')`"></div>
        <Icon class="favorite" v-if="map?.isFavorite" :icon="heartIcon" />
        <div class="name">
            {{ map?.displayName }}
        </div>
        <div class="attributes bl body-1-strong">
            <div class="flex-row flex-center-items gap-sm"><Icon :icon="gridIcon" />{{ mapSize }}</div>
            <div class="flex-row flex-center-items gap-sm">
                <Icon :icon="personIcon" />{{ map?.playerCountMin }} - {{ map?.playerCountMax }}
            </div>
        </div>
        <div class="attributes br flex-row gap-sm body-1-strong">
            <TerrainIcon v-for="terrain in map?.terrain" :terrain="terrain" v-bind:key="terrain" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import defaultMiniMap from "/src/renderer/assets/images/default-minimap.png?url";
import { computed } from "vue";
import { useImageBlobUrlCache } from "@renderer/composables/useImageBlobUrlCache";
import { MapData } from "@main/content/maps/map-data";
import TerrainIcon from "@renderer/components/maps/filters/TerrainIcon.vue";
import { Icon } from "@iconify/vue";
import personIcon from "@iconify-icons/mdi/person-multiple";
import gridIcon from "@iconify-icons/mdi/grid";
import heartIcon from "@iconify-icons/mdi/heart";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const props = defineProps<{
    map: MapData | undefined;
}>();

const cache = useImageBlobUrlCache();
const mapSize = computed(() =>
    props.map ? props.map.mapWidth + "x" + props.map.mapHeight : t("lobby.components.maps.mapOverviewCard.sizeUnknown")
);
const imageUrl = computed(() =>
    props.map?.imagesBlob?.preview ? cache.get(props.map?.springName, props.map?.imagesBlob?.preview) : defaultMiniMap
);
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.map {
    will-change: transform, opacity;
    aspect-ratio: 1;
    position: relative;
    overflow: hidden;
    &:after {
        @extend .fullsize;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow:
            inset 0 1px 0 rgba(0, 0, 0, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            inset 1px 0 0 rgba(0, 0, 0, 0.3),
            inset -1px 0 0 rgba(0, 0, 0, 0.3);
        border: 3px solid rgba(0, 0, 0, 0.2);
        z-index: 5;
    }
    &:hover {
        .name {
            opacity: 0;
        }
        .background {
            transform: scale(1.01);
            transition: 0.2s ease-in-out;
            &:after {
                opacity: 0;
                transition: 0.2s ease-in-out;
            }
        }
        .attributes {
            opacity: 0;
        }
        .favorite {
            opacity: 0;
            transition: opacity 0.2s;
        }
    }
}
.background {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
    transform: scale(1.1);
    will-change: transform;
    z-index: 0;
    &:after {
        @extend .fullsize;
        z-index: 1;
        background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
        transition: 0.2s opacity ease-in-out;
    }
    transition: 0.2s ease-in-out;
}
.favorite {
    position: absolute;
    top: map.get($spacing, "sm"); // 8px (closest to 10px)
    right: map.get($spacing, "sm"); // 8px (closest to 10px)
    transition: 0.2s opacity;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 1.5625rem; // Intentional: 25px is off-scale, no matching typography class
    padding: map.get($spacing, "xs"); // 4px (closest to 3px)
}
.name {
    @extend .fullsize;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: break-word;
    padding: map.get($spacing, "sm"); // 8px (closest to 10px)
    font-size: 2.375rem; // Intentional: 38px is off-scale, between title-1(32px) and large-title(40px)
    font-weight: 600;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
    transition: 0.2s opacity;
}
.attributes {
    position: absolute;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(0, 0, 0, 0.2);
    padding: map.get($spacing, "xxs") map.get($spacing, "xs"); // 2px 4px (closest to 2px 5px)
    transition: 0.2s opacity;

    &.bl {
        bottom: map.get($spacing, "sm"); // 8px (closest to 10px)
        left: map.get($spacing, "sm"); // 8px (closest to 10px)
    }
    &.br {
        bottom: map.get($spacing, "sm"); // 8px (closest to 10px)
        right: map.get($spacing, "sm"); // 8px (closest to 10px)
        flex-wrap: wrap-reverse;
        justify-content: flex-end;
        max-width: 55%;
    }
}
</style>
