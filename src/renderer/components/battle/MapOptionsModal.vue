<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Modal ref="modal" :title="t('lobby.components.battle.mapOptionsModal.mapOptionsTitle')">
        <div class="container">
            <div class="map-preview-container">
                <MapBattlePreview />
            </div>
            <div class="options flex-col gap-md">
                <!-- Start Style Selection -->
                <div class="flex-col gap-sm">
                    <h3 class="subtitle-2">Choose Start Style</h3>
                    <Select
                        v-model="selectedStartStyle"
                        :options="startStyleOptions"
                        optionLabel="label"
                        optionValue="value"
                        label="Start Style"
                        @update:model-value="onStartStyleChanged"
                    />
                </div>

                <!-- Start Boxes Configuration -->
                <div v-if="selectedStartStyle === StartPosType.Boxes" class="flex-col gap-md">
                    <div v-if="battleStore.battleOptions.map?.startboxesSet" class="flex-col gap-sm">
                        <h3 class="subtitle-2">{{ t("lobby.components.battle.mapOptionsModal.boxesPresets") }}</h3>
                        <div class="box-buttons">
                            <Button
                                v-for="(boxSet, i) in battleStore.battleOptions.map.startboxesSet"
                                :key="i"
                                class="grey slim"
                                @click="() => setPresetStartBoxes(i)"
                                :disabled="battleStore.battleOptions.mapOptions.startBoxesIndex === i"
                            >
                                <span>{{ i + 1 }}</span>
                            </Button>
                        </div>
                    </div>
                    <div class="flex-col gap-sm">
                        <h3 class="subtitle-2">{{ t("lobby.components.battle.mapOptionsModal.customBoxes") }}</h3>
                        <div class="box-buttons">
                            <Button class="grey slim" @click="() => setCustomStartBoxes(StartBoxOrientation.EastVsWest)">
                                <img src="/src/renderer/assets/images/icons/east-vs-west.png" />
                            </Button>
                            <Button class="grey slim" @click="() => setCustomStartBoxes(StartBoxOrientation.NorthVsSouth)">
                                <img src="/src/renderer/assets/images/icons/north-vs-south.png" />
                            </Button>
                            <Button class="grey slim" @click="() => setCustomStartBoxes(StartBoxOrientation.NortheastVsSouthwest)">
                                <img src="/src/renderer/assets/images/icons/northeast-vs-southwest.png" />
                            </Button>
                            <Button class="grey slim" @click="() => setCustomStartBoxes(StartBoxOrientation.NorthwestVsSoutheast)">
                                <img src="/src/renderer/assets/images/icons/northwest-vs-southeast.png" />
                            </Button>
                        </div>
                        <div class="box-buttons">
                            <Range v-model="customBoxRange" :min="5" :max="100" :step="5" />
                        </div>
                    </div>
                    <div v-if="hasCustomStartBoxes" class="flex-col gap-sm">
                        <div v-for="(teamBox, teamBoxId) in teamBoxes" :key="`delete-box-${teamBoxId}`">
                            <Button
                                :disabled="!canDeleteTeamBox(teamBox, teamBoxId)"
                                :class="{ red: canDeleteTeamBox(teamBox, teamBoxId) }"
                                class="fullwidth"
                                @click="() => battleActions.removeTeam(teamBoxId)"
                            >
                                <span v-if="canDeleteTeamBox(teamBox, teamBoxId)"
                                    >{{ t("lobby.components.battle.mapOptionsModal.deleteTeam") }} {{ teamBoxId + 1 }}</span
                                >
                                <span v-else>
                                    <Icon :icon="lockOutlineIcon" :inline="true"></Icon>
                                    {{ t("lobby.components.battle.mapOptionsModal.team") }} {{ teamBoxId + 1 }} (<template
                                        v-if="participantCounts[teamBoxId] != undefined"
                                    >
                                        <span v-if="participantCounts[teamBoxId].playerCount > 0">
                                            {{ participantCounts[teamBoxId].playerCount }}
                                            {{
                                                pluralize(
                                                    t("lobby.components.battle.mapOptionsModal.player"),
                                                    participantCounts[teamBoxId].playerCount || 0
                                                )
                                            }}
                                        </span>
                                        <span v-if="participantCounts[teamBoxId].botCount > 0 && participantCounts[teamBoxId].playerCount > 0"
                                            >&nbsp;-&nbsp;</span
                                        >
                                        <span v-if="participantCounts[teamBoxId].botCount > 0">
                                            {{ participantCounts[teamBoxId].botCount }}
                                            {{
                                                pluralize(
                                                    t("lobby.components.battle.mapOptionsModal.ai"),
                                                    participantCounts[teamBoxId].botCount || 0
                                                )
                                            }}
                                        </span> </template
                                    >)
                                </span>
                            </Button>
                        </div>

                        <Button class="green fullwidth" @click="() => battleActions.addTeam()">{{
                            t("lobby.components.battle.mapOptionsModal.addTeam")
                        }}</Button>
                    </div>
                    <div v-else-if="battleStore.battleOptions.mapOptions.startBoxesIndex !== undefined" class="flex-col gap-sm">
                        <Button class="fullwidth" @click="setCustomBoxesFromPresetBoxes">{{
                            t("lobby.components.battle.mapOptionsModal.editPresetTeams")
                        }}</Button>
                    </div>
                </div>

                <!-- Fixed Positions Configuration -->
                <div v-if="selectedStartStyle === StartPosType.Fixed || selectedStartStyle === StartPosType.Random" class="flex-col gap-sm">
                    <h3 class="subtitle-2">{{ t("lobby.components.battle.mapOptionsModal.fixedPositions") }}</h3>
                    <StatusCard 
                        v-if="!supportsFixedPositions" 
                        variant="warning"
                        label="Notice"
                        value="This map doesn't support fixed positions"
                    />
                    <div v-else class="box-buttons">
                        <Button
                            v-for="(teamSet, i) in battleStore.battleOptions.map.startPos?.team"
                            :key="`team${i}`"
                            class="grey slim"
                            @click="() => setFixedStartBoxes(i)"
                            :disabled="battleStore.battleOptions.mapOptions.startPosType === StartPosType.Fixed && battleStore.battleOptions.mapOptions.fixedPositionsIndex === i"
                        >
                            <span>{{ i + 1 }}</span>
                        </Button>
                        <Button
                            class="grey slim"
                            @click="setRandomStartBoxes"
                            :disabled="battleStore.battleOptions.mapOptions.startPosType === StartPosType.Random"
                        >
                            <span>{{ t("lobby.components.battle.mapOptionsModal.random") }}</span>
                        </Button>
                    </div>
                </div>
                <div class="actions">
                    <Button class="green fullwidth" @click="close" :disabled="!isStartStyleSupported">Save</Button>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import { Ref, ref, watch, computed } from "vue";

import Modal from "@renderer/components/common/Modal.vue";
import Button from "@renderer/components/controls/Button.vue";
import Range from "@renderer/components/controls/Range.vue";
import Select from "@renderer/components/controls/Select.vue";
import StatusCard from "@renderer/components/common/StatusCard.vue";
import { battleStore, battleActions } from "@renderer/store/battle.store";
import { isPlayer, StartBoxOrientation, StartPosType, Team } from "@main/game/battle/battle-types";
import MapBattlePreview from "@renderer/components/maps/MapBattlePreview.vue";
import { getBoxes } from "@renderer/utils/start-boxes";
import { StartBox } from "tachyon-protocol/types";
import { pluralize } from "@renderer/utils/i18n";
import { Icon } from "@iconify/vue";
import lockOutlineIcon from "@iconify-icons/mdi/lock-outline";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const modal: Ref<null | InstanceType<typeof Modal>> = ref(null);

const customBoxRange = ref(25);

watch(
    () => battleStore.battleOptions.map,
    () => {
        customBoxRange.value = 25;
    }
);

// merged boxes with teams for displaying team info
// and team based logic for start boxes
const teamBoxes = computed<Array<StartBox & Team>>(() => {
    const teams = battleStore.teams;
    const boxes = battleActions.getCurrentStartBoxes();

    const teamBoxes: Array<StartBox & Team> = [];

    for (let i = 0; i < teams.length; i++) {
        teamBoxes.push({ ...teams[i], ...boxes[i] });
    }

    return teamBoxes;
});

// get player and bot counts for better ux
const participantCounts = computed(() => {
    return teamBoxes.value.map((teamBox) => {
        const players = teamBox.participants.filter(isPlayer);
        return {
            playerCount: players.length,
            botCount: teamBox.participants.length - players.length,
        };
    });
});

const canDeleteTeamBox = (teamBox: StartBox & Team, teamBoxId: number) => {
    // Can't delete teams 1 and 2 (teamBoxId 0 and 1)
    if (teamBoxId === 0 || teamBoxId === 1) {
        return false;
    }
    return teamBoxes.value.length >= 3 && teamBox.participants.length == 0;
};

const hasCustomStartBoxes = computed(() => {
    const customStartBoxes = battleStore.battleOptions.mapOptions.customStartBoxes;
    const startBoxesIndex = battleStore.battleOptions.mapOptions.startBoxesIndex;

    if (customStartBoxes == undefined || startBoxesIndex != undefined) return false;

    return true;
});

// Start style selection
const startStyleOptions = [
    { label: "Start Boxes", value: StartPosType.Boxes },
    { label: "Fixed Positions", value: StartPosType.Fixed },
];

// Map Random to Fixed for the selector (since Random is a Fixed position variant)
const selectedStartStyle = computed({
    get: () => {
        const type = battleStore.battleOptions.mapOptions.startPosType;
        // If Random, show as Fixed in the selector
        return type === StartPosType.Random ? StartPosType.Fixed : type;
    },
    set: (value: StartPosType) => {
        onStartStyleChanged(value);
    },
});

// Check if the map supports fixed positions
const supportsFixedPositions = computed(() => {
    const map = battleStore.battleOptions.map;
    return map?.startPos?.team && map.startPos.team.length > 0;
});

// Check if the currently selected start style is supported by the map
const isStartStyleSupported = computed(() => {
    const style = selectedStartStyle.value;
    if (style === StartPosType.Boxes) {
        // Start boxes are always supported
        return true;
    } else if (style === StartPosType.Fixed || style === StartPosType.Random) {
        // Fixed positions are only supported if the map has them
        return supportsFixedPositions.value;
    }
    return true;
});

// Handle start style change
function onStartStyleChanged(newType: StartPosType) {
    if (newType === StartPosType.Boxes) {
        // Switch to boxes mode - preserve existing selection if possible
        if (battleStore.battleOptions.mapOptions.startBoxesIndex !== undefined) {
            // Already using a preset, just switch the type
            battleStore.battleOptions.mapOptions.startPosType = StartPosType.Boxes;
        } else if (battleStore.battleOptions.mapOptions.customStartBoxes !== undefined) {
            // Already using custom boxes, just switch the type
            battleStore.battleOptions.mapOptions.startPosType = StartPosType.Boxes;
        } else if (battleStore.battleOptions.map?.startboxesSet && battleStore.battleOptions.map.startboxesSet.length > 0) {
            // Use first preset if available
            setPresetStartBoxes(0);
        } else {
            // No presets available, set up custom boxes
            setCustomStartBoxes(StartBoxOrientation.EastVsWest);
        }
    } else if (newType === StartPosType.Fixed) {
        // Switch to fixed positions mode - preserve existing selection if possible
        if (battleStore.battleOptions.mapOptions.fixedPositionsIndex !== undefined) {
            // Already have a fixed position selected, just switch the type
            battleStore.battleOptions.mapOptions.startPosType = StartPosType.Fixed;
        } else if (battleStore.battleOptions.map?.startPos?.team && battleStore.battleOptions.map.startPos.team.length > 0) {
            // Use first fixed position preset
            setFixedStartBoxes(0);
        } else {
            // No fixed positions available, use random
            setRandomStartBoxes();
        }
    }
}

function setPresetStartBoxes(startBoxIndex: number) {
    delete battleStore.battleOptions.mapOptions.fixedPositionsIndex;
    battleStore.battleOptions.mapOptions.startPosType = StartPosType.Boxes;
    battleStore.battleOptions.mapOptions.startBoxesIndex = startBoxIndex;
}

function setCustomStartBoxes(orientation: StartBoxOrientation) {
    const customStartBoxes = getBoxes(orientation, customBoxRange.value);
    delete battleStore.battleOptions.mapOptions.startBoxesIndex;
    battleStore.battleOptions.mapOptions.startPosType = StartPosType.Boxes;
    battleStore.battleOptions.mapOptions.customStartBoxes = customStartBoxes;
}

function setFixedStartBoxes(index: number) {
    delete battleStore.battleOptions.mapOptions.startBoxesIndex;
    battleStore.battleOptions.mapOptions.startPosType = StartPosType.Fixed;
    battleStore.battleOptions.mapOptions.fixedPositionsIndex = index;
}
function setRandomStartBoxes() {
    delete battleStore.battleOptions.mapOptions.startBoxesIndex;
    delete battleStore.battleOptions.mapOptions.fixedPositionsIndex;
    battleStore.battleOptions.mapOptions.startPosType = StartPosType.Random;
}

function setCustomBoxesFromPresetBoxes() {
    const startBoxesIndex = battleStore.battleOptions.mapOptions.startBoxesIndex;

    if (startBoxesIndex == undefined) {
        return;
    }

    const currentStartBoxes = battleActions.getCurrentStartBoxes();

    delete battleStore.battleOptions.mapOptions.startBoxesIndex;
    delete battleStore.battleOptions.mapOptions.customStartBoxes;

    battleStore.battleOptions.mapOptions.customStartBoxes = currentStartBoxes;
}

function close() {
    modal.value?.close();
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.container {
    height: 80vh;
    max-height: 80vh;
    position: relative;
    display: flex;
    gap: map-get($spacing, "md");
    min-height: 0;
    overflow: hidden;
}

.map-preview-container {
    aspect-ratio: 1;
    flex-shrink: 0;
    max-height: 100%;
    overflow: hidden;
}

.box-buttons {
    display: flex;
    flex-direction: row;
    gap: map-get($spacing, "xs");
    flex-wrap: wrap;
    :deep(button) {
        padding: map-get($spacing, "xs");
        &:hover {
            img {
                opacity: 1;
            }
            span {
                opacity: 1;
            }
        }
    }
    img {
        max-width: 50px;
        image-rendering: pixelated;
        opacity: 0.7;
    }
    span {
        min-width: 50px;
        opacity: 0.7;
        font-size: 2rem;
    }
}

.options {
    width: 400px;
    min-width: 400px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
}

.control {
    max-height: 80px;
}

.actions {
    margin-top: auto;
    width: 100%;
}
</style>
