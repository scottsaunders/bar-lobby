<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Control class="textbox">
        <InputText type="text" v-bind="$attrs" />
    </Control>
</template>

<script lang="ts" setup>
import InputText from "primevue/inputtext";

import Control from "@renderer/components/controls/Control.vue";
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.textbox {
    align-items: baseline;
}
.p-inputtext {
    width: 100%;
    padding: 0 map-get($spacing, "sm");
}
</style>
