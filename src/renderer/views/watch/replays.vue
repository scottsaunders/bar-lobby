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
                <Panel class="replay-preview-panel flex-grow" no-padding>
                        <ReplayPreview v-if="selectedReplay" :replay="selectedReplay" :showSpoilers="showSpoilers">
                            <template #actions="{ replay }">
                                <div class="fullwidth">
                                    <div class="flex-row flex-bottom gap-md padding-bottom-md">
                                        <DownloadContentButton
                                            v-if="map && replay"
                                            :maps="[map.springName]"
                                            :games="[replay.gameVersion]"
                                            :engines="[replay.engineVersion]"
                                            @click="watchReplay(replay)"
                                            :disabled="gameStore.status !== GameStatus.CLOSED"
                                            class="large"
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
                                        <Button v-if="replay" @click="showReplayFile(replay)" class="icon folder-button" v-tooltip.left="'Open file location'"
                                            ><Icon :icon="folder" :height="32"
                                        /></Button>
                                    </div>
                                </div>
                            </template>
                        </ReplayPreview>
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
import ReplayPreview from "@renderer/components/battle/ReplayPreview.vue";
import DownloadContentButton from "@renderer/components/controls/DownloadContentButton.vue";
import { GameStatus, gameStore, watchReplay } from "@renderer/store/game.store";
import { replaysStore, acknowledgeReplay } from "@renderer/store/replays.store";
import { MapDownloadData } from "@main/content/maps/map-data";
import { Icon } from "@iconify/vue";
import folder from "@iconify-icons/mdi/folder";
import SearchBox from "@renderer/components/controls/SearchBox.vue";
import { settingsStore } from "@renderer/store/settings.store";

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

.replay-preview-panel {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
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
