<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <AddBotModal
        v-if="battleStore.battleOptions.engineVersion && battleStore.battleOptions.gameVersion"
        v-model="botListOpen"
        :engineVersion="battleStore.battleOptions.engineVersion"
        :gameVersion="battleStore.battleOptions.gameVersion"
        :teamId="botModalTeamId"
        :title="t('lobby.components.battle.addBotModal.title')"
        @bot-selected="onBotSelected"
    />
    <div class="scroll-container padding-right-sm">
        <!-- Multiplayer layout: 3-column grid with teams, toggle, join queue, and spectators -->
        <div v-if="showJoinQueue || showPlayingToggle" class="playerlist-layout" :class="{ dragging: draggedBot || draggedPlayer, 'team-mode': isTeamMode }">
            <!-- Teams grid (takes up 2 columns, tiles in 2-column grid) -->
            <div class="teams-grid">
                <TeamComponent
                    v-for="(teamId) in orderedTeamIds"
                    :key="teamId"
                    :teamId="teamId"
                    @add-bot-clicked="openBotList"
                    @on-join-clicked="joinTeam"
                    @on-drag-start="dragStart"
                    @on-drag-end="dragEnd"
                    @on-drag-enter="dragEnterTeam"
                    @on-drop="onDropTeam"
                />
            </div>
            <!-- Third column: Toggle, Join Queue, and Spectators -->
            <div class="queue-spectators-column">
                <template v-if="showPlayingToggle">
                    <div class="playing-toggle-wrapper" :class="{ 'playing-active': isPlaying }">
                        <Options 
                            :modelValue="isPlaying ? 'Playing' : 'Spectating'" 
                            :options="['Playing', 'Spectating']"
                            @update:modelValue="(value: string) => onPlayingToggle(value === 'Playing')"
                        />
                    </div>
                </template>
                <template v-if="showJoinQueue">
                    <div class="playerlist">
                        <JoinQueueComponent />
                    </div>
                </template>
                <template v-if="!hideSpectators">
                    <div class="playerlist">
                        <SpectatorsComponent
                            class="spectators"
                            @on-drag-start="dragStart"
                            @on-drag-end="dragEnd"
                            @on-drag-enter="dragEnterSpectators"
                            @on-drop="onDropSpectators"
                        />
                    </div>
                </template>
            </div>
        </div>
        <!-- Original layout: Single column/grid for teams (used in skirmish) -->
        <div v-else class="playerlist" :class="{ dragging: draggedBot || draggedPlayer, 'team-mode': isTeamMode }">
            <TeamComponent
                v-for="(teamId) in orderedTeamIds"
                :key="teamId"
                :teamId="teamId"
                @add-bot-clicked="openBotList"
                @on-join-clicked="joinTeam"
                @on-drag-start="dragStart"
                @on-drag-end="dragEnd"
                @on-drag-enter="dragEnterTeam"
                @on-drop="onDropTeam"
            />
            <template v-if="!hideSpectators">
                <hr class="margin-top-sm margin-bottom-sm" />
                <SpectatorsComponent
                    class="spectators"
                    @on-drag-start="dragStart"
                    @on-drag-end="dragEnd"
                    @on-drag-enter="dragEnterSpectators"
                    @on-drop="onDropSpectators"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Ref, ref, computed } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import AddBotModal from "@renderer/components/battle/AddBotModal.vue";
import Options from "@renderer/components/controls/Options.vue";
import TeamComponent from "@renderer/components/battle/TeamComponent.vue";
import { EngineAI } from "@main/content/engine/engine-version";
import { Bot, isBot, isRaptor, isScavenger, Player, GameModeID } from "@main/game/battle/battle-types";
import { battleWithMetadataStore, battleStore, battleActions } from "@renderer/store/battle.store";
import SpectatorsComponent from "@renderer/components/battle/SpectatorsComponent.vue";
import JoinQueueComponent from "@renderer/components/battle/JoinQueueComponent.vue";
import { GameAI } from "@main/content/game/game-version";

const props = withDefaults(defineProps<{
    isTeamMode?: boolean;
    hideSpectators?: boolean;
    showJoinQueue?: boolean;
    showPlayingToggle?: boolean;
    isPlaying?: boolean;
}>(), {
    isTeamMode: true,
    hideSpectators: false,
    showJoinQueue: false,
    showPlayingToggle: false,
    isPlaying: false,
});

const emit = defineEmits<{
    (event: "playingToggle", value: boolean): void;
    (event: "onJoinClicked"): void;
    (event: "onDragStart", event: DragEvent, member: Player | Bot): void;
    (event: "onDragEnd"): void;
    (event: "onDragEnter", event: DragEvent): void;
    (event: "onDrop", event: DragEvent): void;
}>();

const { t } = useTypedI18n();

// Helper functions to check if a team is Raptor/Scavenger team
function isRaptorTeam(teamId: number) {
    return battleWithMetadataStore.teams[teamId]?.participants.some((member) => isBot(member) && isRaptor(member));
}

function isScavengerTeam(teamId: number) {
    return battleWithMetadataStore.teams[teamId]?.participants.some((member) => isBot(member) && isScavenger(member));
}

// Reorder teams so Raptors/Scavengers appear first when in those modes
const orderedTeamIds = computed(() => {
    const gameMode = battleStore.battleOptions.gameMode.id;
    const isRaptorsOrScavengers = gameMode === GameModeID.RAPTORS || gameMode === GameModeID.SCAVENGERS;
    
    if (!isRaptorsOrScavengers) {
        // Normal order: 0, 1, 2, ...
        return battleWithMetadataStore.teams.map((_, index) => index);
    }
    
    // For Raptors/Scavengers: put team 1 (special team) first, then team 0 (players), then rest
    const teamIds = battleWithMetadataStore.teams.map((_, index) => index);
    const reordered = [];
    
    // Team 1 (Raptors/Scavengers) first
    if (teamIds.includes(1)) {
        reordered.push(1);
    }
    
    // Team 0 (players) second
    if (teamIds.includes(0)) {
        reordered.push(0);
    }
    
    // Add remaining teams (2, 3, 4, ...)
    teamIds.forEach(id => {
        if (id !== 0 && id !== 1) {
            reordered.push(id);
        }
    });
    
    return reordered;
});

const botListOpen = ref(false);
const botModalTeamId = ref(0);

function openBotList(teamId: number) {
    botModalTeamId.value = teamId;
    botListOpen.value = true;
}

function onBotSelected(bot: EngineAI | GameAI, teamId: number) {
    botListOpen.value = false;
    battleActions.addBot(bot, teamId);
}

function joinTeam(teamId: number) {
    if (battleStore.me) battleActions.movePlayerToTeam(battleStore.me, teamId);
}

function joinSpectators() {
    if (battleStore.me) battleActions.movePlayerToSpectators(battleStore.me);
}

const draggedPlayer: Ref<Player | null> = ref(null);
const draggedBot: Ref<Bot | null> = ref(null);
let draggedEl: Element | null = null;

function dragEnterTeam(event: DragEvent) {
    if (!draggedPlayer.value && !draggedBot.value) {
        return;
    }
    const target = event.target as HTMLElement;
    const groupEl = target.closest("[data-type=group]");
    if (draggedEl && groupEl) {
        document.querySelectorAll("[data-type=group]").forEach((el) => {
            el.classList.remove("highlight");
            el.classList.remove("highlight-error");
        });
    }
    groupEl?.classList.add("highlight");
}

function dragEnterSpectators(event: DragEvent) {
    if (!draggedPlayer.value && !draggedBot.value) {
        return;
    }
    const target = event.target as HTMLElement;
    const groupEl = target.closest("[data-type=group]");
    if (draggedEl && groupEl) {
        document.querySelectorAll("[data-type=group]").forEach((el) => {
            el.classList.remove("highlight");
            el.classList.remove("highlight-error");
        });
    }
    if (draggedPlayer.value) {
        groupEl?.classList.add("highlight");
    }
    if (draggedBot.value) {
        groupEl?.classList.add("highlight-error");
    }
}

function dragStart(event: DragEvent, participant: Player | Bot) {
    if (isBot(participant)) {
        draggedBot.value = participant;
    } else {
        draggedPlayer.value = participant;
    }
    draggedEl = event.target as Element;
    const participantEl = draggedEl?.querySelector("[data-type=participant]");
    if (participantEl) {
        participantEl.classList.add("dragging");
    }
    document.addEventListener("dragend", dragEnd);
}

function dragEnd() {
    const participantEl = draggedEl?.querySelector("[data-type=participant]");
    if (participantEl) {
        participantEl.classList.remove("dragging");
    }
    draggedBot.value = null;
    draggedPlayer.value = null;
    draggedEl = null;
    document.querySelectorAll("[data-type=group]").forEach((el) => {
        el.classList.remove("highlight");
        el.classList.remove("highlight-error");
    });
    document.removeEventListener("dragend", dragEnd);
}

function onDropTeam(event: DragEvent, teamId: number) {
    const target = event.target as Element;
    if (!draggedBot.value && !draggedPlayer.value) {
        return;
    }
    if (target.getAttribute("data-type") !== "group") {
        return;
    }
    if (draggedBot.value) {
        if ((isRaptor(draggedBot.value) || isScavenger(draggedBot.value)) && battleStore.teams[teamId].participants.length != 0) {
            draggedBot.value = null;
        } else {
            battleActions.moveBotToTeam(draggedBot.value, teamId);
        }
    }
    if (draggedPlayer.value) {
        battleActions.movePlayerToTeam(draggedPlayer.value, teamId);
    }
}

function onDropSpectators(event: DragEvent) {
    const target = event.target as Element;
    if (draggedBot.value || !draggedPlayer.value || target.getAttribute("data-type") !== "group") {
        if (isBot(draggedBot.value) && (isRaptor(draggedBot.value) || isScavenger(draggedBot.value))) {
            draggedBot.value = null;
        }
        return;
    }
    battleActions.movePlayerToSpectators(draggedPlayer.value);
}

function onPlayingToggle(value: boolean) {
    emit("playingToggle", value);
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.playerlist-layout {
    display: grid;
    grid-template-columns: 1fr 1fr 210px;
    gap: map-get($spacing, "md");
    align-items: start;
    
    &.dragging .group > * {
        pointer-events: none;
    }
}

.teams-grid {
    grid-column: 1 / 3;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    gap: map-get($spacing, "sm");
    
    &.dragging .group > * {
        pointer-events: none;
    }
}

.playerlist {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: max-content;
    gap: map-get($spacing, "sm");
    
    &.dragging .group > * {
        pointer-events: none;
    }
    
    &.team-mode {
        // Teams tile in 2-column grid for skirmish (original layout)
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: map-get($spacing, "md");
    }
}

.queue-spectators-column {
    grid-column: 3;
    display: flex;
    flex-direction: column;
}

.playing-toggle-wrapper {
    padding-bottom: map-get($spacing, "sm");
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    
    :deep(.options) {
        width: 100%;
    }
    
    :deep(.p-selectbutton) {
        width: 100%;
        
        .p-button {
            padding: map-get($spacing, "sm") map-get($spacing, "md");
        }
    }
    
    &.playing-active {
        :deep(.p-selectbutton) {
            .p-highlight {
                background: rgba(37, 99, 235, 0.2);
                border-color: rgba(37, 99, 235, 0.4);
                
                &:hover {
                    background: rgba(37, 99, 235, 0.3);
                }
            }
        }
    }
}
</style>
