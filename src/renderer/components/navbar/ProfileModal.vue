<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Modal v-model="isOpen" :title="user?.displayName || t('lobby.views.profile.title')">
        <div class="profile-content" v-if="user">
            <div class="profile-header">
                <img ref="logo" class="avatar" src="/src/renderer/assets/images/BARLogoFull.png" />
                <div class="profile-user-info">
                    <h2 class="flex-row gap-lg">
                        <Flag :countryCode="user.countryCode" style="width: 50px" />
                        {{ user.displayName }}
                    </h2>
                    <p>{{ t("lobby.views.profile.status") }}{{ user.status }}</p>
                    <p>{{ t("lobby.views.profile.clan") }}{{ user.clanId }}</p>
                </div>
            </div>
        </div>
        <div v-else class="profile-content">
            <p>{{ t("lobby.views.profile.userNotFound") }}</p>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Flag from "@renderer/components/misc/Flag.vue";
import Modal from "@renderer/components/common/Modal.vue";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();

const props = defineProps<{
    modelValue: boolean;
    userId?: string;
}>();

const emits = defineEmits<{
    (event: "update:modelValue", open: boolean): void;
}>();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emits("update:modelValue", value),
});

const user = useDexieLiveQueryWithDeps([() => props.userId], () => {
    if (!props.userId) return undefined;
    return db.users.get(props.userId);
}, {
    initialValue: undefined,
});
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.profile-content {
    display: flex;
    flex-direction: column;
    min-width: 600px;
    max-width: 800px;
}

.profile-header {
    display: flex;
    align-items: center;
    margin-bottom: map-get($spacing, "md");
    margin-top: map-get($spacing, "xxl");
    div {
        margin-right: auto;
    }
}

.avatar {
    width: 184px;
    height: 184px;
    border-radius: 1%;
    margin-right: map-get($spacing, "xl");
    border: 1px solid #5e5757;
    backdrop-filter: blur(2px);
}

.profile-user-info {
    display: flex;
    flex-direction: column;
    gap: map-get($spacing, "xxs");
}
</style>

