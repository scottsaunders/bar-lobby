<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Transition name="notice-slide">
        <div v-if="inParty" class="solo-party-notice flex-row flex-center-items gap-sm">
            <Icon :icon="accountGroupIcon" :height="16" class="notice-icon flex-shrink-0" />
            <span>You're in a party — this mode is single-player only. Your party members won't join.</span>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import accountGroupIcon from "@iconify-icons/mdi/account-group";
import { computed, inject, type Ref } from "vue";
import type { PartyMockState } from "./party-mock-state";

const partyState = inject<Ref<PartyMockState>>("partyState");
const inParty = computed(() => partyState?.value.inParty ?? false);
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.solo-party-notice {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 3px;
    padding: map.get($spacing, "sm") map.get($spacing, "md");
    font-size: 14px;
    font-weight: 500;
    color: rgba(245, 158, 11, 0.9);
    line-height: 1.4;

    .notice-icon {
        color: #f59e0b;
    }
}

.notice-slide-enter-active,
.notice-slide-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease,
        max-height 0.2s ease;
    overflow: hidden;
    max-height: 60px;
}
.notice-slide-enter-from,
.notice-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px);
    max-height: 0;
}
</style>
