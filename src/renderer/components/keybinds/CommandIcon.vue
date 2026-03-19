<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="cmd-icon-wrap" :style="{ width: `${size}px`, height: `${size}px` }" :class="{ 'is-playing': playing }">
        <!-- SVG: loaded inline so we can pause/resume CSS animations via animation-play-state -->
        <span v-if="isSvg" v-html="svgContent" class="cmd-icon-svg" />
        <!-- GIF: canvas (frozen first frame) when idle, live img when playing.
             v-show keeps both nodes alive so there's no DOM surgery on hover. -->
        <template v-else-if="isGif">
            <img v-show="playing" :src="src" class="cmd-icon" :width="size" :height="size" />
            <canvas v-show="!playing" ref="canvasEl" :width="size" :height="size" class="cmd-icon" />
        </template>
        <!-- PNG and everything else: always static -->
        <img v-else :src="src" class="cmd-icon" :width="size" :height="size" />
    </div>
</template>

<script lang="ts" setup>
    import { ref, computed, watch, onMounted } from "vue";

    const props = defineProps<{
        src: string;
        size?: number;
        playing?: boolean;
    }>();

    const size = computed(() => props.size ?? 20);
    const canvasEl = ref<HTMLCanvasElement | null>(null);

    // Derive extension robustly, ignoring query params / hashes
    const ext = computed(() => {
        const clean = props.src.split("?")[0].split("#")[0];
        return clean.split(".").pop()?.toLowerCase() ?? "";
    });
    const isSvg = computed(() => ext.value === "svg");
    const isGif = computed(() => ext.value === "gif");

    // --- SVG: fetch and render inline ---
    const svgContent = ref("");

    async function loadSvg() {
        if (!isSvg.value) return;
        try {
            const res = await fetch(props.src);
            svgContent.value = await res.text();
        } catch {
            svgContent.value = "";
        }
    }

    onMounted(loadSvg);
    watch(() => props.src, loadSvg);

    // --- GIF: draw first frame to canvas ---
    function captureFirstFrame(canvas: HTMLCanvasElement) {
        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, size.value, size.value);
            ctx?.drawImage(img, 0, 0, size.value, size.value);
        };
        img.src = props.src;
    }

    watch(canvasEl, (canvas) => {
        if (canvas) captureFirstFrame(canvas);
    });
</script>

<style lang="scss" scoped>
    .cmd-icon-wrap {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cmd-icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        display: block;
    }

    .cmd-icon-svg {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(svg) {
            width: 100%;
            height: 100%;
            // Pause all CSS animations when not playing
            * {
                animation-play-state: paused !important;
            }
        }
    }

    .cmd-icon-wrap.is-playing .cmd-icon-svg :deep(svg) * {
        animation-play-state: running !important;
    }
</style>
