<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Modal v-model="isOpen" :title="t('lobby.components.battle.addBonusModal.title')" @close="onClose">
        <div class="modal-content flex-col gap-md">
            <div class="body-2">
                {{ t('lobby.components.battle.addBonusModal.description', { name: participantName }) }}
            </div>
            <div class="slider-container flex-row flex-center-items gap-md">
                <Range
                    v-model="bonusValue"
                    :min="-100"
                    :max="200"
                    :step="1"
                    class="flex-grow"
                />
            </div>
        </div>
        <template #footer>
            <div class="modal-footer flex-row gap-md">
                <Button class="red flex-1" @click="onClose">{{ t('lobby.components.battle.addBonusModal.cancel') }}</Button>
                <Button class="green flex-1" @click="onOk">{{ t('lobby.components.battle.addBonusModal.save') }}</Button>
            </div>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import Modal from "@renderer/components/common/Modal.vue";
import Range from "@renderer/components/controls/Range.vue";
import Button from "@renderer/components/controls/Button.vue";
import { Player, Bot } from "@main/game/battle/battle-types";
import { battleActions } from "@renderer/store/battle.store";

const { t } = useTypedI18n();

const props = defineProps<{
    modelValue: boolean;
    participant: Player | Bot;
}>();

const emits = defineEmits<{
    (event: "update:modelValue", value: boolean): void;
    (event: "save", bonus: number): void;
}>();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emits("update:modelValue", value),
});

const participantName = computed(() => {
    if ("user" in props.participant) {
        return props.participant.user.username;
    }
    return props.participant.name;
});

const bonusValue = ref(0);

// Load current bonus value when modal opens
watch(isOpen, (open) => {
    if (open) {
        // Get current bonus from battle store
        bonusValue.value = battleActions.getParticipantBonus(props.participant);
    }
});

function onOk() {
    emits("save", bonusValue.value);
    isOpen.value = false;
}

function onClose() {
    isOpen.value = false;
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.modal-content {
    width: 480px;
    padding: map.get($spacing, "md");
}

// Match the Panel's content padding (30px) plus modal-content padding
// Panel default padding is 30px, which is approximately xxl (32px) in the spacing system

.slider-container {
    width: 100%;
}

.modal-footer {
    width: 100%;
    padding: map.get($spacing, "xxl");
    gap: map.get($spacing, "md");
    
    :deep(.button) {
        flex: 1;
    }
}
</style>

