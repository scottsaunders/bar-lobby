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
                <div class="flex-grow">{{ bot.name }}</div>
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
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import robot from "@iconify-icons/mdi/robot";
import robotAngry from "@iconify-icons/mdi/robot-angry";
import closeIcon from "@iconify-icons/mdi/close";
import { Ref, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import LuaOptionsModal from "@renderer/components/battle/LuaOptionsModal.vue";
import TeamParticipant from "@renderer/components/battle/TeamParticipant.vue";
import { LuaOptionSection } from "@main/content/game/lua-options";
import { Bot, isRaptor, isScavenger } from "@main/game/battle/battle-types";
import ContextMenu from "primevue/contextmenu";
import { battleActions } from "@renderer/store/battle.store";
import { enginesStore } from "@renderer/store/engine.store";
import { gameStore } from "@renderer/store/game.store";
import GameIconsVelociraptor from "@renderer/components/icons/GameIconsVelociraptor.vue";

const { t } = useTypedI18n();

const props = defineProps<{
    bot: Bot;
    teamId: number;
}>();

const botOptions: Ref<LuaOptionSection[]> = ref([]);
const botOptionsOpen = ref(false);
const menu = ref<InstanceType<typeof ContextMenu>>();

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
        label: t("lobby.components.battle.botParticipant.kick"),
        command: kickBot,
    },
];

function onRightClick(event: MouseEvent) {
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
</script>

<style lang="scss" scoped>
.bot-type {
    opacity: 0.5;
}

.bot-participant-wrapper {
    width: 100%;
}

.bot-content {
    width: 100%;
    gap: 8px;
}

.delete-bot-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 4px;
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
