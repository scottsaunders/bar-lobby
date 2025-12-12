<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Replays", order: 0, transition: { name: "slide-left" }, offine: true } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ t("lobby.views.watch.replays.title") }}</h1>
                <p>{{ t("lobby.views.watch.replays.description") }}</p>
            </div>
            <div class="replays-layout flex-row flex-grow gap-xl">
                <Panel class="flex-grow replays-list-panel">
                    <div class="flex-col fullheight gap-md">
                            <div class="flex-row flex-center-items gap-md fullwidth">
                                <TriStateCheckbox
                                    v-model="settingsStore.endedNormallyFilter"
                                    :label="t('lobby.views.watch.replays.endedNormally')"
                                />
                                <Checkbox v-model="showSpoilers" :label="t('lobby.views.watch.replays.showSpoilers')" />
                                <div class="flex-grow">
                                    <SearchBox v-model="fulltextSearch" :placeholder="t('lobby.views.watch.replays.searchPlaceholder')" />
                                </div>
                                <div class="flex-right flex-row gap-md" style="flex: none">
                                    <Button @click="openBrowserToReplayService">{{
                                        t("lobby.views.watch.replays.browseOnlineReplays")
                                    }}</Button>
                                    <Button @click="openReplaysFolder">{{ t("lobby.views.watch.replays.openReplaysFolder") }}</Button>
                                </div>
                            </div>
                            <DataTable
                                v-model:first="offset"
                                v-model:selection="selectedReplay"
                                :lazy="true"
                                :value="replays"
                                :paginator="true"
                                :rows="limit"
                                :totalRecords="replaysCount"
                                selectionMode="single"
                                dataKey="fileName"
                                :sortOrder="sortOrder === 'asc' ? 1 : -1"
                                :sortField="sortField"
                                :rowClass="(data) => (highlightedReplays.has(data.fileName) ? 'highlighted-replay' : '')"
                                @page="onPage"
                                @sort="onSort"
                            >
                                <template #empty>{{ t("lobby.views.watch.replays.noReplaysFound") }}</template>
                                <Column :header="t('lobby.views.watch.replays.name')">
                                    <template #body="{ data }">
                                        <template v-if="data.preset === 'duel'">
                                            {{ data.contenders?.[0]?.name ?? t("lobby.views.watch.replays.nobody") }} vs
                                            {{ data.contenders?.[1]?.name ?? t("lobby.views.watch.replays.nobody") }}
                                        </template>
                                        <template v-else-if="data.preset === 'team'">
                                            {{ data.teams[0].playerCount }} vs {{ data.teams[1].playerCount }}
                                        </template>
                                        <template v-if="data.preset === 'ffa'"
                                            >{{ data.contenders.length }} {{ t("lobby.views.watch.replays.wayFFA") }}</template
                                        >
                                        <template v-if="data.preset === 'teamffa'"
                                            >{{ data.teams[0].playerCount }} {{ t("lobby.views.watch.replays.wayTeamFFA") }}</template
                                        >
                                    </template>
                                </Column>
                                <Column :header="t('lobby.views.watch.replays.date')" :sortable="true" sortField="startTime">
                                    <template #body="{ data }">
                                        {{ format(data.startTime, "yyyy/MM/dd hh:mm a") }}
                                    </template>
                                </Column>
                                <Column :header="t('lobby.views.watch.replays.duration')" :sortable="true" sortField="gameDurationMs">
                                    <template #body="{ data }">
                                        {{ getFriendlyDuration(data.gameDurationMs) }}
                                    </template>
                                </Column>
                                <Column
                                    field="mapSpringName"
                                    :header="t('lobby.views.watch.replays.map')"
                                    :sortable="true"
                                    sortField="mapSpringName"
                                />
                            </DataTable>
                        </div>
                    </Panel>
                <Panel class="replay-side-panel flex-grow" no-padding>
                    <div class="flex-col fullheight min-height-0">
                        <TabView class="flex-grow min-height-0">
                            <TabPanel header="Map" class="tab-panel-no-padding">
                                <div class="flex-col fullheight min-height-0 tab-panel-inner-container">
                                    <div class="flex-grow min-height-0 margin-top-xxl margin-bottom-xxl margin-left-xxl margin-right-xxl inner-panel-container map-preview-container">
                                        <ReplayPreviewMap v-if="selectedReplay" :replay="selectedReplay" />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel header="Details" class="tab-panel-no-padding">
                                <div class="flex-col fullheight min-height-0 tab-panel-inner-container">
                                    <div class="flex-grow min-height-0 margin-top-xxl margin-bottom-xxl margin-left-xxl margin-right-xxl inner-panel-container scroll-container">
                                        <div class="flex-col flex-grow padding-xxl gap-lg">
                                            <div v-if="isFFA" class="team-section">
                                                <div class="team-title">{{ t("lobby.components.battle.replayPreview.players") }}</div>
                                                <div class="contenders">
                                                    <template v-for="(contender, i) in selectedReplay?.contenders" :key="`contender${i}`">
                                                        <BattlePreviewParticipant :contender="contender" />
                                                        <Icon
                                                            v-if="selectedReplay?.winningTeamId === contender.allyTeamId && showSpoilers"
                                                            class="trophy"
                                                            :icon="trophyVariant"
                                                            height="18"
                                                        />
                                                    </template>
                                                </div>
                                            </div>
                                            <template v-for="[teamId, contenders] in teams" v-else :key="`team${teamId}`">
                                                <div class="team-section">
                                                    <div class="team-title">
                                                        <div>Team {{ teamId + 1 }}</div>
                                                        <Icon
                                                            v-if="selectedReplay?.winningTeamId === teamId && showSpoilers"
                                                            class="trophy"
                                                            :icon="trophyVariant"
                                                            height="18"
                                                        />
                                                    </div>
                                                    <div class="contenders">
                                                        <BattlePreviewParticipant
                                                            v-for="(contender, contenderIndex) in contenders"
                                                            :key="`contender${contenderIndex}`"
                                                            :contender="contender"
                                                        />
                                                    </div>
                                                </div>
                                            </template>
                                            <div v-if="selectedReplay?.spectators.length" class="team-section">
                                                <div class="team-title">{{ t("lobby.components.battle.replayPreview.spectators") }}</div>
                                                <div class="contenders">
                                                    <BattlePreviewParticipant
                                                        v-for="(spectator, spectatorIndex) in selectedReplay.spectators"
                                                        :key="`spectator${spectatorIndex}`"
                                                        :contender="spectator"
                                                    />
                                                </div>
                                            </div>
                                            <hr class="margin-top-md margin-bottom-md divider" />
                                            <div class="padding-top-sm">
                                                <div v-for="(item, index) in extraDetails" :key="index">
                                                    <div>
                                                        <div :class="getStripeResult(index)">
                                                            <div class="margin-left-sm padding-top-sm padding-bottom-sm">
                                                                <p class="text-xs">
                                                                    <b>{{ item.title }}</b>
                                                                </p>
                                                            </div>
                                                            <div class="margin-right-sm padding-top-sm padding-bottom-sm txt-right">
                                                                <p class="text-xs">{{ item.data }}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                        <div class="flex-shrink-0 flex-col padding-bottom-xxl padding-left-xxl padding-right-xxl">
                            <div class="flex-row gap-md">
                                <DownloadContentButton
                                    v-if="map && selectedReplay"
                                    :maps="[map.springName]"
                                    :games="[selectedReplay.gameVersion]"
                                    :engines="[selectedReplay.engineVersion]"
                                    @click="watchReplay(selectedReplay)"
                                    :disabled="gameStore.status !== GameStatus.CLOSED"
                                    class="large"
                                    style="flex-grow: 1"
                                >
                                    <template v-if="gameStore.status === GameStatus.RUNNING">{{
                                        t("lobby.views.watch.replays.gameIsRunning")
                                    }}</template>
                                    <template v-else-if="gameStore.status === GameStatus.LOADING">{{
                                        t("lobby.views.watch.replays.launching")
                                    }}</template>
                                    <template v-else>{{ t("lobby.views.watch.replays.watch") }}</template>
                                </DownloadContentButton>
                                <Button v-else disabled class="large" style="flex-grow: 1">{{ t("lobby.views.watch.replays.watch") }}</Button>
                                <Button v-if="selectedReplay" @click="showReplayFile(selectedReplay)" class="icon folder-button" v-tooltip.left="'Open file location'">
                                    <Icon :icon="folder" :height="32" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
/**
 * TODO:
 * - Local replays
 * - Online replays
 * - Preview pane
 * - Searchable
 * - Sortable
 * - Filterable
 * - Paginated
 * - Watched
 * - Favorite
 */

// https://primefaces.org/primevue/datatable/lazy

import { format } from "date-fns";
import Column from "primevue/column";
import { Ref, ref, shallowRef, onMounted, triggerRef, computed, watch } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import Button from "@renderer/components/controls/Button.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import TriStateCheckbox from "@renderer/components/controls/TriStateCheckbox.vue";
import { getFriendlyDuration } from "@renderer/utils/misc";
import { Replay } from "@main/content/replays/replay";
import DataTable, { DataTablePageEvent, DataTableSortEvent } from "primevue/datatable";
import Panel from "@renderer/components/common/Panel.vue";
import { db } from "@renderer/store/db";
import { useDexieLiveQueryWithDeps } from "@renderer/composables/useDexieLiveQuery";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import { GameStatus, gameStore, watchReplay } from "@renderer/store/game.store";
import { replaysStore, acknowledgeReplay } from "@renderer/store/replays.store";
import { MapDownloadData } from "@main/content/maps/map-data";
import { Icon } from "@iconify/vue";
import folder from "@iconify-icons/mdi/folder";
import file from "@iconify-icons/mdi/file";
import SearchBox from "@renderer/components/controls/SearchBox.vue";
import { settingsStore } from "@renderer/store/settings.store";
import TabView from "@renderer/components/common/TabView.vue";
import TabPanel from "primevue/tabpanel";
import ReplayPreviewMap from "@renderer/components/maps/ReplayPreviewMap.vue";
import BattlePreviewParticipant from "@renderer/components/battle/BattlePreviewParticipant.vue";
import trophyVariant from "@iconify-icons/mdi/trophy-variant";
import { DemoModel } from "$/sdfz-demo-parser";

const { t } = useTypedI18n();

const showSpoilers = ref(true);
const offset = ref(0);
const limit = ref(15);
const fulltextSearch = ref("");
const fulltextSearchWords = computed(() =>
    fulltextSearch.value
        .split(" ")
        .filter((word) => word.trim() !== "")
        .map((word) => word.toLocaleLowerCase())
);
const sortField: Ref<keyof Replay> = ref("startTime");
const sortOrder: Ref<"asc" | "desc"> = ref("desc");
const selectedReplay: Ref<Replay | null> = shallowRef(null);

const highlightedReplays = computed(() => replaysStore.highlightedReplays);

onMounted(() => {
    window.replays.onReplayDeleted((filename: string) => {
        if (selectedReplay.value?.fileName == filename) {
            selectedReplay.value = null;
            triggerRef(selectedReplay);
        }
    });
});

watch(selectedReplay, (newReplay) => {
    if (newReplay && highlightedReplays.value.has(newReplay.fileName)) {
        acknowledgeReplay(newReplay.fileName);
    }
});

function fulltextSearchFilter(replay: Replay) {
    if (fulltextSearchWords.value.length === 0) return true;
    return fulltextSearchWords.value.every((word) => {
        return replay.mapSpringName.toLowerCase().includes(word) || replay.contenders.some((c) => c.name.toLowerCase().includes(word));
    });
}

function endedNormallyFilter(replay: Replay, expected: "true" | "false" | "null") {
    if (expected === "null") return true;
    if (expected === "true" && replay.gameEndedNormally === 1) return true;
    if (expected === "false" && replay.gameEndedNormally === 0) return true;
    return false;
}

const replays = useDexieLiveQueryWithDeps(
    [() => settingsStore.endedNormallyFilter, offset, limit, sortField, sortOrder, fulltextSearch],
    () => {
        const allReplaysBySortField =
            sortOrder.value === "asc" ? db.replays.orderBy(sortField.value) : db.replays.orderBy(sortField.value).reverse();

        return allReplaysBySortField
            .filter((replay: Replay) => endedNormallyFilter(replay, settingsStore.endedNormallyFilter))
            .filter(fulltextSearchFilter)
            .offset(offset.value)
            .limit(limit.value)
            .toArray();
    }
);

const replaysCount = useDexieLiveQueryWithDeps([() => settingsStore.endedNormallyFilter, fulltextSearch], () => {
    return db.replays
        .filter((replay: Replay) => endedNormallyFilter(replay, settingsStore.endedNormallyFilter))
        .filter(fulltextSearchFilter)
        .count();
});

let map = useDexieLiveQueryWithDeps([() => selectedReplay.value?.mapSpringName], async () => {
    let selected = selectedReplay.value;
    if (!selected) return;

    const [live, nonLive] = await Promise.all([db.maps.get(selected.mapSpringName), db.nonLiveMaps.get(selected.mapSpringName)]);

    let map = live ?? nonLive;

    if (!map) {
        map = {
            springName: selected.mapSpringName,
            isDownloading: false,
            isInstalled: false,
        } satisfies MapDownloadData;
    }

    return map;
});

function onPage(event: DataTablePageEvent) {
    offset.value = event.first;
}

function onSort(event: DataTableSortEvent) {
    sortField.value = event.sortField as keyof Replay;
    sortOrder.value = event.sortOrder === 1 ? "asc" : "desc";
}

function openBrowserToReplayService() {
    window.shell.openInBrowser("https://bar-rts.com/replays");
}

function openReplaysFolder() {
    window.shell.openReplaysDir();
}

function showReplayFile(replay: Replay) {
    if (replay?.fileName) window.shell.showReplayInFolder(replay.fileName);
}

const isFFA = computed(() => {
    return selectedReplay.value?.preset === "ffa";
});

const teams = computed<Map<number, (DemoModel.Info.Player | DemoModel.Info.AI)[]>>(() => {
    if (!selectedReplay.value) {
        return new Map();
    }
    const teams = Map.groupBy(selectedReplay.value.contenders, (contender) => contender.allyTeamId);
    const sortedTeams = new Map([...teams.entries()].sort());
    return sortedTeams;
});

const extraDetails = computed(() => {
    if (!selectedReplay.value) return [];
    return [
        {
            title: t("lobby.components.battle.replayPreview.engineVersion"),
            data: selectedReplay.value.engineVersion,
        },
        {
            title: t("lobby.components.battle.replayPreview.gameVersion"),
            data: selectedReplay.value.gameVersion,
        },
    ];
});

function getStripeResult(index: number) {
    return index & 1 ? "datagrid" : "datagrid datagridstripe";
}
</script>

<style lang="scss" scoped>
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map-get($spacing, "xxl") map-get($spacing, "sm") map-get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
    
    .view-title {
        padding-left: 0; // Ensure title isn't cut off - padding is handled by view-container
    }
}

.replays-layout {
    min-height: 0;
}

.replays-list-panel {
    flex: 2;
    min-width: 0;
}

.replay-side-panel {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

:deep(.tab-panel-no-padding.p-tabview-panel) {
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0;
}

:deep(.replay-side-panel .tab-panel-no-padding.p-tabview-panel) {
    padding: 0 !important;
    margin: 0 !important;
}

:deep(.replay-side-panel .p-tabview-panel) {
    padding: 0 !important;
    margin: 0 !important;
}

.tab-panel-inner-container {
    padding: 0 !important;
    margin: 0 !important;
    width: 100%;
    height: 100%;
}

:deep(.replay-side-panel .p-tabview) {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
}

:deep(.replay-side-panel .p-tabview-panels) {
    flex-grow: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    margin: 0 !important;
}

.inner-panel-container {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.map-preview-container {
    overflow: hidden;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.map-preview-container :deep(.map-container) {
    height: 100%;
    min-height: 0;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
}

.map-preview-container :deep(.map) {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.teams {
    gap: 5px;
    height: auto;
}

.team-title {
    display: flex;
    flex-direction: row;
    gap: 10px;
    font-weight: 500;
    margin-bottom: 3px;
}

.contenders {
    display: flex;
    flex-direction: row;
    gap: 4px;
    flex-wrap: wrap;
}

.trophy {
    color: #ffbc00;
    display: flex;
    align-self: center;
    margin-bottom: 1px;
}

.datagrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: auto;
}

.datagridstripe {
    background-color: #00000033;
}

.divider {
    background: rgba(255, 255, 255, 0.3);
}


:deep(.p-datatable-tbody tr.highlighted-replay td) {
    background-color: rgba(255, 200, 0, 0.3) !important;
}

.folder-button {
    height: 72px; // Match large button height
    width: 72px; // 1:1 aspect ratio
    flex-shrink: 0; // Prevent shrinking
    display: flex;
    align-items: center;
    justify-content: center;
    
    .p-button {
        width: 100%;
        height: 100%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
