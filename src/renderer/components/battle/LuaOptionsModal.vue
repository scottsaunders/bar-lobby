<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Modal ref="modal" :title="title" no-padding>
        <TabView class="lua-options-panel">
            <!-- Lobby Tab - Only shown in multiplayer mode -->
            <TabPanel v-if="showLobbySettings" header="Lobby">
                <div class="lobby-settings flex-col gap-lg">
                    <Textbox 
                        v-model="lobbyTitle" 
                        label="Lobby Title"
                        placeholder="Enter lobby title..."
                    />
                    
                    <Select
                        v-model="numberOfTeams"
                        :options="teamCountOptions"
                        optionLabel="label"
                        optionValue="value"
                        label="Number of Teams"
                    />
                    
                    <Select
                        v-model="playersPerTeam"
                        :options="playersPerTeamOptions"
                        optionLabel="label"
                        optionValue="value"
                        label="Players per Team"
                    />
                    
                    <Select
                        v-model="balanceMode"
                        :options="balanceModeOptions"
                        optionLabel="label"
                        optionValue="value"
                        label="Balance Mode"
                    />
                    
                    <div class="level-range flex-row gap-lg">
                        <Range
                            v-model="minLevel"
                            label="Min Level"
                            :min="0"
                            :max="maxLevel"
                            :step="1"
                            class="flex-grow"
                        />
                        <Range
                            v-model="maxLevel"
                            label="Max Level"
                            :min="minLevel"
                            :max="100"
                            :step="1"
                            class="flex-grow"
                        />
                    </div>
                    
                    <div class="chevron-range flex-row gap-lg">
                        <Range
                            v-model="minChevron"
                            label="Min Chevron"
                            :min="0"
                            :max="maxChevron"
                            :step="1"
                            class="flex-grow"
                        />
                        <Range
                            v-model="maxChevron"
                            label="Max Chevron"
                            :min="minChevron"
                            :max="5"
                            :step="1"
                            class="flex-grow"
                        />
                    </div>
                    
                    <div class="map-selector-row flex-row gap-md">
                        <Select
                            :modelValue="battleStore.battleOptions.map"
                            :options="mapListOptions"
                            data-key="springName"
                            label="Map"
                            optionLabel="springName"
                            :filter="true"
                            class="map-selector-dropdown flex-grow"
                            @update:model-value="onMapSelected"
                        />
                        <Button v-tooltip.left="'Open map selector'" @click="openMapList">
                            <Icon :icon="listIcon" height="23" />
                        </Button>
                        <MapListModal
                            v-model="mapListOpen"
                            title="Select Map"
                            @map-selected="onMapSelected"
                        />
                    </div>
                </div>
            </TabPanel>
            
            <TabPanel v-for="section of sections.filter((section) => !section.hidden)" :key="section.key" :header="section.name">
                <div class="gridform padding-bottom-xl">
                    <template v-for="o in section.options.filter((option) => !option.hidden)" :key="o.key">
                        <div>
                            <div
                                v-tooltip.bottom="{ value: o.description || '' }"
                                :class="{
                                    overriden: options[o.key] !== undefined,
                                }"
                            >
                                {{ o.name }}
                            </div>
                        </div>
                        <Range
                            v-if="o.type === 'number'"
                            :modelValue="options[o.key] ?? o.default"
                            :min="o.min"
                            :max="o.max"
                            :step="o.step"
                            @update:model-value="(value: any) => setOptionValue(o, value)"
                            v-tooltip.bottom="{ value: o.description || '' }"
                            :class="{
                                overriden: options[o.key] !== undefined,
                            }"
                        />
                        <Checkbox
                            v-if="o.type === 'boolean'"
                            :modelValue="options[o.key] ?? o.default"
                            @update:model-value="(value) => setOptionValue(o, value)"
                            v-tooltip.right="{ value: o.description || '' }"
                            :class="{
                                overriden: options[o.key] !== undefined,
                            }"
                        />
                        <Textarea
                            v-if="o.type === 'string'"
                            class="fullwidth"
                            :modelValue="options[o.key] ?? o.default"
                            @update:model-value="(value) => setOptionValue(o, value)"
                            v-tooltip.bottom="{ value: o.description || '' }"
                            :class="{
                                overriden: options[o.key] !== undefined,
                            }"
                        />
                        <Select
                            v-if="o.type === 'list'"
                            :modelValue="options[o.key] ?? o.default"
                            :options="o.options"
                            optionLabel="name"
                            optionValue="key"
                            @update:model-value="(value: any) => setOptionValue(o, value)"
                            v-tooltip.bottom="{ value: o.description || '' }"
                            :class="{
                                overriden: options[o.key] !== undefined,
                            }"
                        />
                    </template>
                </div>
            </TabPanel>
        </TabView>
        <template #footer>
            <div class="actions padding-sm gap-sm">
                <Button class="fullwidth" @click="reset">{{ t("lobby.components.battle.luaOptionsModal.resetAllToDefault") }}</Button>
                <Button class="green fullwidth" @click="close">{{ t("lobby.components.battle.luaOptionsModal.close") }}</Button>
            </div>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
import TabPanel from "primevue/tabpanel";
import { Ref, ref, computed, watch } from "vue";
import { useTypedI18n } from "@renderer/i18n";
import Modal from "@renderer/components/common/Modal.vue";
import TabView from "@renderer/components/common/TabView.vue";
import Button from "@renderer/components/controls/Button.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import Range from "@renderer/components/controls/Range.vue";
import Select from "@renderer/components/controls/Select.vue";
import Textbox from "@renderer/components/controls/Textbox.vue";
import { LuaOptionSection, LuaOptionNumber, LuaOptionBoolean, LuaOptionString, LuaOptionList } from "@main/content/game/lua-options";
import Textarea from "@renderer/components/controls/Textarea.vue";
import { battleStore } from "@renderer/store/battle.store";
import { Icon } from "@iconify/vue";
import listIcon from "@iconify-icons/mdi/format-list-bulleted";
import MapListModal from "@renderer/components/battle/MapListModal.vue";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { MapData } from "@main/content/maps/map-data";

const { t } = useTypedI18n();

const props = withDefaults(defineProps<{
    id: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Record<string, any>;
    sections: LuaOptionSection[];
    showLobbySettings?: boolean;
}>(), {
    showLobbySettings: false,
});

const options = ref(props.options);

// Lobby settings (only used when showLobbySettings is true)
const lobbyTitle = ref(battleStore.title || "");
const numberOfTeams = ref(2);
const playersPerTeam = ref(8);
const balanceMode = ref("balanced");
const minLevel = ref(5);
const maxLevel = ref(30);
const minChevron = ref(0);
const maxChevron = ref(5);

// Map list for selector
const mapListOpen = ref(false);
const mapListOptions = useDexieLiveQuery(() => db.maps.toArray(), []);

function openMapList() {
    mapListOpen.value = true;
}

function onMapSelected(map: MapData) {
    battleStore.battleOptions.map = map;
    mapListOpen.value = false;
}

const teamCountOptions = [
    { label: "2 Teams", value: 2 },
    { label: "3 Teams", value: 3 },
    { label: "4 Teams", value: 4 },
    { label: "5 Teams", value: 5 },
    { label: "6 Teams", value: 6 },
    { label: "8 Teams", value: 8 },
];

const playersPerTeamOptions = [
    { label: "1 Player", value: 1 },
    { label: "2 Players", value: 2 },
    { label: "3 Players", value: 3 },
    { label: "4 Players", value: 4 },
    { label: "5 Players", value: 5 },
    { label: "6 Players", value: 6 },
    { label: "7 Players", value: 7 },
    { label: "8 Players", value: 8 },
];

const balanceModeOptions = [
    { label: "Balanced", value: "balanced" },
    { label: "Random", value: "random" },
    { label: "Manual", value: "manual" },
];

// Watch for title changes and update battle store
watch(lobbyTitle, (newTitle) => {
    battleStore.title = newTitle;
});

// Initialize from battle store
watch(() => battleStore.title, (newTitle) => {
    if (newTitle) {
        lobbyTitle.value = newTitle;
    }
}, { immediate: true });

const emit = defineEmits<{
    (event: "set-options", options: Record<string, boolean | string | number>): void;
}>();

const modal: Ref<null | InstanceType<typeof Modal>> = ref(null);

function setOptionValue(option: LuaOptionNumber | LuaOptionBoolean | LuaOptionString | LuaOptionList, value: unknown) {
    if (value === option.default) {
        delete options.value[option.key];
    } else {
        options.value[option.key] = value;
    }
    emit("set-options", options.value);
}

function close() {
    modal.value?.close();
}

function reset() {
    options.value = {};
    emit("set-options", options.value);
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.lua-options-panel {
    display: flex;
    flex-direction: column;
    width: 1000px;
    height: 80vh;
}

.description {
    white-space: pre;
}

.actions {
    display: flex;
    flex-direction: row;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.overriden {
    color: #ffcc00;
    :deep(.p-slider-handle) {
        background-color: #ffcc00;
    }
    :deep(.p-slider-range) {
        background-color: #ffcc00;
    }
}

.lobby-settings {
    max-width: 500px;
}

.map-selector-row {
    width: 100%;
}

.map-selector-dropdown {
    min-width: 0;
}
</style>
