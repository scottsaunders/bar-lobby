<template>
    <div class="interactive-tile" :class="{ active, selected, saturate, 'read-more-variant': readMoreVariant }">
        <div class="media">
            <slot name="media" />
        </div>
        <div class="overlay" :class="{ 'fade-out': textFade, 'persistent': textPersistent, 'read-more-title': readMoreVariant }">
            <slot name="content" />
        </div>
        <!-- Read More variant: black overlay with body copy and button that appears on hover -->
        <div v-if="readMoreVariant" class="read-more-overlay">
            <div class="read-more-content">
                <div class="read-more-body">
                    <slot name="body" />
                </div>
                <div class="read-more-button">
                    <slot name="button">
                        <Button class="black text-shadow tertiary">Read More</Button>
                    </slot>
                </div>
            </div>
        </div>
        <div class="hover-overlay"></div>
    </div>
</template>

<script lang="ts" setup>
import Button from "@renderer/components/controls/Button.vue";

defineProps<{
    active?: boolean;
    selected?: boolean;
    saturate?: boolean;
    textFade?: boolean;
    textPersistent?: boolean;
    readMoreVariant?: boolean;
}>();
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

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

        // Read More variant: fade out title on hover
        .overlay.read-more-title {
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
        padding: map-get($spacing, "sm");
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        z-index: 2;
        pointer-events: none;
        transition: opacity 0.3s ease;

        &.persistent {
            opacity: 1 !important; // Intentional: Force persistent overlay visibility
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

    // Read More variant: black overlay with body copy and button that appears on hover
    &.read-more-variant {
        .overlay {
            // Title overlay - fades out on hover
            transition: opacity 0.3s ease;
        }

        .read-more-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: map-get($spacing, "lg");
            background: rgba(0, 0, 0, 0.95);
            z-index: 2;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            box-sizing: border-box;
        }

        .read-more-content {
            display: flex;
            flex-direction: column;
            gap: map-get($spacing, "md");
            width: 100%;
            height: 100%;
            text-align: left;
            box-sizing: border-box;
            justify-content: flex-start;
            overflow: hidden;
        }

        .read-more-body {
            color: rgba(255, 255, 255, 0.9);
            pointer-events: auto;
            text-align: left;
            flex: 0 1 auto;
            min-height: 0;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            line-clamp: 4;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            word-break: break-word;
            line-height: 1.5;
            max-height: calc(1.5em * 4);
        }

        .read-more-button {
            pointer-events: auto;
            flex-shrink: 0;
            margin-top: auto;
        }

        &:hover {
            .read-more-overlay {
                opacity: 1;
            }
        }
    }
}
</style>

