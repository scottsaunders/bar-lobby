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

        <!-- Nav cluster -->
        <div class="keyboard-nav">
            <template v-for="(row, rIdx) in NAV_CLUSTER_ROWS" :key="rIdx">
                <div v-if="row.keys.length > 0" class="key-row" :style="row.indent ? { paddingLeft: `${row.indent * KEY_UNIT}px` } : {}">
                    <KeyboardKey v-for="keyDef in row.keys" :key="keyDef.id" :keyDef="keyDef" @keyClicked="onKeyClicked" />
                </div>
                <div v-else class="key-row-spacer" />
            </template>
        </div>

        <!-- Numpad -->
        <div class="keyboard-numpad">
            <div v-for="(row, rIdx) in NUMPAD_ROWS" :key="rIdx" class="key-row">
                <KeyboardKey v-for="keyDef in row.keys" :key="keyDef.id" :keyDef="keyDef" @keyClicked="onKeyClicked" />
            </div>
        </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted, onUnmounted, nextTick } from "vue";
    import { KEYBOARD_ROWS, NAV_CLUSTER_ROWS, NUMPAD_ROWS } from "@renderer/utils/uikeys/keyboard-layout";
    import KeyboardKey from "./KeyboardKey.vue";

    const KEY_UNIT = 56;

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
        align-items: flex-start;
        gap: 16px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.08);
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
