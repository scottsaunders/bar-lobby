<template>
    <div class="interactive-tile" :class="{ active, selected, saturate }">
        <div class="media">
            <slot name="media" />
        </div>
        <div class="overlay" :class="{ 'fade-out': textFade, 'persistent': textPersistent }">
            <slot name="content" />
        </div>
        <div class="hover-overlay"></div>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    active?: boolean;
    selected?: boolean;
    saturate?: boolean;
    textFade?: boolean;
    textPersistent?: boolean;
}>();
</script>

<style lang="scss" scoped>
.interactive-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease-out;
    cursor: pointer;
    width: 100%;
    height: 100%;

    &:hover,
    &.active {
        border-color: rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
        transform: translateY(-2px);

        .hover-overlay {
            opacity: 1;
        }

        .media :deep(img),
        .media :deep(video),
        .media :deep(div[style*="background-image"]) {
            transform: scale(1.01);
            transition: transform 0.2s ease-in-out;
        }

        .overlay.fade-out {
            opacity: 0;
        }
    }

    // Green highlight on hover when saturate variant is used (matches ScenarioTile behavior)
    &.saturate:hover {
        outline: 1px solid #22c55e;
        box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
    }

    .media {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        overflow: hidden;

        :deep(img),
        :deep(video) {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.2s ease-in-out;
            transform: scale(1.1); // Start scaled up to fill tile, matches Maps behavior
            will-change: transform;
        }

        // Support for background-image divs (like Maps uses)
        :deep(div[style*="background-image"]) {
            position: absolute;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            transform: scale(1.1);
            will-change: transform;
            transition: transform 0.2s ease-in-out;
        }
    }

    // Saturation transition variant
    &.saturate {
        .media :deep(img),
        .media :deep(video),
        .media :deep(div[style*="background-image"]) {
            filter: saturate(0) brightness(0.8) contrast(1);
            transition: transform 0.1s ease, filter 0.1s ease;
        }

        &:hover,
        &.active,
        &.selected {
            .media :deep(img),
            .media :deep(video),
            .media :deep(div[style*="background-image"]) {
                transform: scale(1);
                filter: saturate(1) brightness(1.1) contrast(1.1);
            }
        }
    }

    // Selected state with green highlight
    &.selected {
        outline: 1px solid #22c55e;
        box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
    }

    .overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 10px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        z-index: 2;
        pointer-events: none;
        transition: opacity 0.3s ease;

        &.persistent {
            opacity: 1 !important;
        }
    }

    .hover-overlay {
        @extend .fullsize;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(255, 255, 255, 0.05);
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        z-index: 3;
    }
}
</style>

