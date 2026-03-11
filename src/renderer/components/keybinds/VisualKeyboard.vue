<!-- SPDX-FileCopyrightText: 2025 The BAR Lobby Authors -->
<!-- SPDX-License-Identifier: MIT -->

<template>
    <div class="visual-keyboard">
        <!-- Main keyboard -->
        <div class="keyboard-main">
            <div v-for="(row, rIdx) in KEYBOARD_ROWS" :key="rIdx" class="key-row">
                <KeyboardKey
                    v-for="keyDef in row.keys"
                    :key="keyDef.id"
                    :keyDef="keyDef"
                    @keyClicked="onKeyClicked"
                />
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
</template>

<script lang="ts" setup>
    import { KEYBOARD_ROWS, NAV_CLUSTER_ROWS, NUMPAD_ROWS } from "@renderer/utils/uikeys/keyboard-layout";
    import KeyboardKey from "./KeyboardKey.vue";

    const KEY_UNIT = 56;

    const emit = defineEmits<{
        keyClicked: [key: string];
    }>();

    function onKeyClicked(key: string) {
        emit("keyClicked", key);
    }
</script>

<style lang="scss" scoped>
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
        overflow-x: auto;
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

    .key-row-spacer {
        height: 20px;
    }
</style>
