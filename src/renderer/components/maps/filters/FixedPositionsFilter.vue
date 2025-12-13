<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Checkbox v-model="fixedPositionsOnly" label="Has fixed positions" fill />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import { mapsStore } from "@renderer/store/maps.store";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const fixedPositionsOnly = ref(mapsStore.filters.fixedPositionsOnly);

watch(fixedPositionsOnly, (newFixedPositionsOnly) => {
    mapsStore.filters.fixedPositionsOnly = newFixedPositionsOnly;
});
</script>

<style lang="scss" scoped></style>

