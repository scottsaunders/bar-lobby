<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Keybinds", order: 5, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view keybinds-view">
        <div class="view-container keybinds-container">
            <div class="view-title flex-row flex-center-items gap-md">
                <Icon icon="mdi:keyboard" style="font-size: 24px" />
                <h1>Keybind Editor</h1>
            </div>
            <div class="editor-wrapper">
                <Panel :noPadding="true" class="editor-panel">
                    <KeybindEditor />
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Icon } from "@iconify/vue";
    import Panel from "@renderer/components/common/Panel.vue";
    import KeybindEditor from "@renderer/components/keybinds/KeybindEditor.vue";
</script>

<style lang="scss" scoped>
    .keybinds-view {
        overflow: hidden;
    }

    .keybinds-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0 24px 24px;
    }

    .view-title {
        flex-shrink: 0;
        padding: 16px 0 12px;
    }

    .editor-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    .editor-panel {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        :deep(.content) {
            min-height: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
    }
</style>
