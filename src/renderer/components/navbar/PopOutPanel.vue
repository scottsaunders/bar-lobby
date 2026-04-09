<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Panel class="popout-panel" :class="{ hidden: !open }" no-padding>
        <div class="popout-panel-inner">
            <slot></slot>
        </div>
    </Panel>
</template>

<script lang="ts" setup>
import Panel from "@renderer/components/common/Panel.vue";

defineProps<{
    open: boolean;
}>();
</script>

<style lang="scss" scoped>
.popout-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 720px;
    min-width: 720px;
    max-width: 720px;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    flex-direction: column;
    min-height: 0;
    :deep(.content) {
        padding: 0;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
}

.popout-panel-inner {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
</style>
