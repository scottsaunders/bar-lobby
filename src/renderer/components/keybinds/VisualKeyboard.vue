<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="keyboard-scale-wrap" ref="scaleWrapEl">
    <div class="visual-keyboard" ref="keyboardEl" :style="{ zoom: scale }">
        <!-- Main keyboard -->
        <div class="keyboard-main">
            <div v-for="(row, rIdx) in KEYBOARD_ROWS" :key="rIdx" class="key-row">
                <template v-for="keyDef in row.keys" :key="keyDef.id">
                    <div v-if="keyDef.isSpacer" class="key-spacer" :style="{ width: `${keyDef.width * KEY_UNIT}px` }" />
                    <KeyboardKey v-else :keyDef="keyDef" @keyClicked="onKeyClicked" />
                </template>
            </div>
        </div>

        <!-- Right side: nav + numpad on top, mouse inset below -->
        <div class="keyboard-right">
            <div class="keyboard-clusters">
                <!-- Nav cluster -->
                <div class="keyboard-nav">
                    <template v-for="(row, rIdx) in NAV_CLUSTER_ROWS" :key="rIdx">
                        <div v-if="row.keys.length > 0" class="key-row" :style="row.indent ? { paddingLeft: `${row.indent * KEY_UNIT}px` } : {}">
                            <KeyboardKey v-for="keyDef in row.keys" :key="keyDef.id" :keyDef="keyDef" :customHeight="CLUSTER_KEY_H" @keyClicked="onKeyClicked" />
                        </div>
                        <div v-else class="key-row-spacer" />
                    </template>
                </div>

                <!-- Numpad -->
                <div class="keyboard-numpad">
                    <div v-for="(row, rIdx) in NUMPAD_ROWS" :key="rIdx" class="key-row">
                        <KeyboardKey v-for="keyDef in row.keys" :key="keyDef.id" :keyDef="keyDef" :customHeight="CLUSTER_KEY_H" @keyClicked="onKeyClicked" />
                    </div>
                </div>
            </div>

            <!-- Mouse inset box -->
            <div class="keyboard-mouse-inset">
                <span class="mouse-inset-label">Mouse</span>
                <div v-for="(row, i) in MOUSE_ROWS" :key="i" class="mouse-row">
                    <KeyboardKey
                        v-for="keyDef in row.keys"
                        :key="keyDef.id"
                        :keyDef="keyDef"
                        :fill="true"
                        :customHeight="48"
                        @keyClicked="onKeyClicked"
                    />
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted, onUnmounted, nextTick } from "vue";
    import { KEYBOARD_ROWS, NAV_CLUSTER_ROWS, NUMPAD_ROWS, MOUSE_ROWS } from "@renderer/utils/uikeys/keyboard-layout";
    import { useLiveKeyPreview } from "@renderer/composables/useLiveKeyPreview";
    import KeyboardKey from "./KeyboardKey.vue";

    useLiveKeyPreview();

    const KEY_UNIT = 56;
    // Nav/numpad key height is sized so that (5 rows × h + 4 × 2px gap) + 10px gap
    // + mouse inset ≈ main keyboard height (6 rows × 74px + 5 × 2px = 454px),
    // keeping both columns flush at the bottom.
    const CLUSTER_KEY_H = 61;

    const emit = defineEmits<{
        keyClicked: [key: string];
    }>();

    function onKeyClicked(key: string) {
        emit("keyClicked", key);
    }

    const scaleWrapEl = ref<HTMLElement | null>(null);
    const keyboardEl = ref<HTMLElement | null>(null);
    const scale = ref(1);

    let naturalWidth = 0;
    let ro: ResizeObserver | null = null;

    onMounted(() => {
        nextTick(() => {
            naturalWidth = keyboardEl.value?.getBoundingClientRect().width ?? 0;
            ro = new ResizeObserver((entries) => {
                requestAnimationFrame(() => {
                    const w = entries[0].contentRect.width;
                    if (w > 0 && naturalWidth > 0) {
                        scale.value = w / naturalWidth;
                    }
                });
            });
            if (scaleWrapEl.value) ro.observe(scaleWrapEl.value);
        });
    });

    onUnmounted(() => ro?.disconnect());
</script>

<style lang="scss" scoped>
    .keyboard-scale-wrap {
        width: 100%;
    }

    .visual-keyboard {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        width: fit-content;
    }

    .keyboard-main,
    .keyboard-nav,
    .keyboard-numpad {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    /* Column that holds nav+numpad row then mouse inset below */
    .keyboard-right {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    /* Nav and numpad side-by-side */
    .keyboard-clusters {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 16px;
    }

    /* Mouse inset box */
    .keyboard-mouse-inset {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        position: relative;
    }

    .mouse-inset-label {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.25);
        line-height: 1;
    }

    .mouse-row {
        display: flex;
        flex-direction: row;
        gap: 4px;
    }

    .key-row {
        display: flex;
        flex-direction: row;
        gap: 2px;
    }

    .key-spacer {
        flex-shrink: 0;
    }

    .key-row-spacer {
        height: 20px;
    }
</style>
