<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div @contextmenu="onRightClick" class="bot-participant-wrapper">
        <TeamParticipant>
            <div class="bot-content flex-row flex-center-items">
                <div class="flex-row flex-center">
                    <GameIconsVelociraptor v-if="isRaptor(bot)" />
                    <Icon v-else-if="isScavenger(bot)" :icon="robotAngry" />
                    <Icon v-else :icon="robot" />
                </div>
                <div class="flex-grow">{{ displayName }}</div>
                <span v-if="difficultyLabel" class="difficulty-badge body-2">{{ difficultyLabel }}</span>
                <!-- Native button intentional: compact hover-reveal context menu trigger within participant row — Button's Control wrapper adds audio/min-size inappropriate for inline icon triggers -->
                <button class="menu-button" @click.stop="onMenuClick" title="Menu">
                    <Icon :icon="dotsVerticalIcon" />
                </button>
                <!-- Native button intentional: compact hover-reveal delete icon within participant row — Button's Control wrapper adds audio/min-size inappropriate for inline icon triggers -->
                <button class="delete-bot-button" @click.stop="kickBot" :title="t('lobby.components.battle.botParticipant.kick')">
                    <Icon :icon="closeIcon" />
                </button>
            </div>
        </TeamParticipant>
        <LuaOptionsModal
            :id="`configure-bot-${bot.name}`"
            :title="t('lobby.components.battle.botParticipant.configureBot')"
            v-model="botOptionsOpen"
            :options="bot.aiOptions"
            :sections="botOptions"
            @set-options="setBotOptions"
        />
        <ContextMenu ref="menu" :model="actions" />
        <AddBonusModal v-model="addBonusModalOpen" :participant="bot" @save="onBonusSave" />
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import robot from "@iconify-icons/mdi/robot";
import robotAngry from "@iconify-icons/mdi/robot-angry";
import closeIcon from "@iconify-icons/mdi/close";
import dotsVerticalIcon from "@iconify-icons/mdi/dots-vertical";
import { Ref, ref, computed } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import LuaOptionsModal from "@renderer/components/battle/LuaOptionsModal.vue";
import TeamParticipant from "@renderer/components/battle/TeamParticipant.vue";
import { LuaOptionSection, LuaOptionList, LuaOptionNumber } from "@main/content/game/lua-options";
import { Bot, isRaptor, isScavenger } from "@main/game/battle/battle-types";
import ContextMenu from "primevue/contextmenu";
import { battleActions } from "@renderer/store/battle.store";
import { enginesStore } from "@renderer/store/engine.store";
import { gameStore } from "@renderer/store/game.store";
import GameIconsVelociraptor from "@renderer/components/icons/GameIconsVelociraptor.vue";
import AddBonusModal from "@renderer/components/battle/AddBonusModal.vue";

const { t } = useTypedI18n();

const props = defineProps<{
    bot: Bot;
    teamId: number;
}>();

const botOptions: Ref<LuaOptionSection[]> = ref([]);
const botOptionsOpen = ref(false);
const menu = ref<InstanceType<typeof ContextMenu>>();
const addBonusModalOpen = ref(false);

const bonus = computed(() => battleActions.getParticipantBonus(props.bot));
const displayName = computed(() => {
    const name = props.bot.name;
    if (bonus.value !== 0) {
        const sign = bonus.value > 0 ? "+" : "";
        return `${name} (${sign}${bonus.value})`;
    }
    return name;
});

// Get the AI definition to understand difficulty options
const aiDefinition = computed(() => {
    return [...(enginesStore.selectedEngineVersion?.ais || []), ...(gameStore.selectedGameVersion?.ais || [])].find(
        (ai) => ai.name === props.bot.name
    );
});

// Extract and format difficulty label
const difficultyLabel = computed(() => {
    if (!props.bot.aiOptions || Object.keys(props.bot.aiOptions).length === 0) {
        return null;
    }

    // Find the difficulty option in the AI definition
    const difficultyOption = aiDefinition.value?.options
        ?.flatMap((section) => section.options || [])
        .find((opt) => {
            const key = opt.key.toLowerCase();
            return key.includes("difficulty") || key.includes("level");
        });

    if (!difficultyOption) {
        return null;
    }

    // Get the difficulty value from bot options
    const difficultyValue = props.bot.aiOptions[difficultyOption.key];

    if (difficultyValue === undefined || difficultyValue === null) {
        return null;
    }

    // Handle list options (e.g., "easy", "medium", "hard")
    if (difficultyOption.type === "list") {
        const listOption = difficultyOption as LuaOptionList;
        const selectedOption = listOption.options?.find((opt) => opt.key === String(difficultyValue));
        return selectedOption?.name || String(difficultyValue);
    }

    // Handle numeric options - map to common labels
    if (difficultyOption.type === "number") {
        const numValue = Number(difficultyValue);
        if (!isNaN(numValue)) {
            const numberOption = difficultyOption as LuaOptionNumber;
            // Try to find a label in the option name or use a default mapping
            const optionName = difficultyOption.name.toLowerCase();
            
            // Common numeric difficulty mappings
            if (optionName.includes("difficulty")) {
                const labels = ["Very Easy", "Easy", "Normal", "Hard", "Very Hard", "Insane"];
                const index = Math.max(0, Math.min(numValue - 1, labels.length - 1));
                return labels[index] || `Level ${numValue}`;
            }
            
            // If it's a range, show the value
            if (numberOption.min !== undefined && numberOption.max !== undefined) {
                return `${difficultyOption.name}: ${numValue}`;
            }
            
            return String(numValue);
        }
    }

    // For string values, return as-is
    return String(difficultyValue);
});

const actions = [
    {
        label: t("lobby.components.battle.botParticipant.configure"),
        command: configureBot,
    },
    {
        label: t("lobby.components.battle.botParticipant.duplicate"),
        command: duplicateBot,
    },
    {
        label: t("lobby.components.battle.botParticipant.addBonus"),
        command: openAddBonusModal,
    },
    {
        label: t("lobby.components.battle.botParticipant.kick"),
        command: kickBot,
    },
];

function onRightClick(event: MouseEvent) {
    if (menu.value) {
        menu.value.show(event);
    }
}

function onMenuClick(event: MouseEvent) {
    if (menu.value) {
        menu.value.show(event);
    }
}

function kickBot() {
    battleActions.removeBot(props.bot);
}

// Duplicates this bot and its settings and gives it a new player id.
function duplicateBot() {
    battleActions.duplicateBot(props.bot, props.teamId);
}

async function configureBot() {
    botOptions.value =
        [...(enginesStore.selectedEngineVersion?.ais || []), ...(gameStore.selectedGameVersion?.ais || [])].find(
            (ai) => ai.name === props.bot.name
        )?.options || [];
    botOptionsOpen.value = true;
}

function setBotOptions(options: Record<string, unknown>) {
    battleActions.updateBotOptions(props.bot, options);
}

function openAddBonusModal() {
    addBonusModalOpen.value = true;
}

function onBonusSave(bonus: number) {
    battleActions.setParticipantBonus(props.bot, bonus);
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.bot-type {
    opacity: 0.5;
}

.bot-participant-wrapper {
    width: 100%;
}

.bot-content {
    width: 100%;
    gap: map.get($spacing, "sm");
}

.difficulty-badge {
    padding: map.get($spacing, "xxs") map.get($spacing, "sm");
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
    @extend .caption-1 !optional;
    line-height: 1.2;
}

.menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: map.get($spacing, "xxs");
    border-radius: 3px;
    transition: all 0.2s ease;
    opacity: 0;
    
    .bot-participant-wrapper:hover & {
        opacity: 1;
    }
    
    &:hover {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
    }
    
    &:active {
        transform: scale(0.95);
    }
}

.delete-bot-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: map.get($spacing, "xxs");
    border-radius: 3px;
    transition: all 0.2s ease;
    opacity: 0;
    
    .bot-participant-wrapper:hover & {
        opacity: 1;
    }
    
    &:hover {
        color: rgba(239, 68, 68, 0.9);
        background: rgba(239, 68, 68, 0.1);
    }
    
    &:active {
        transform: scale(0.95);
    }
}
</style>
