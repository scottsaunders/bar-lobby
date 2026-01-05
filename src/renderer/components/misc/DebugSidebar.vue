<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="debug-sidebar" :class="{ active }">
        <div class="toggle">
            <Button @click="active = !active">
                <Icon :icon="tools" :height="20" />
            </Button>
        </div>
        <Select
            :modelValue="currentRoute"
            :label="t('lobby.components.misc.debugSidebar.view')"
            :options="routes"
            :filter="true"
            optionLabel="path"
            optionValue="path"
            :placeholder="currentRoute.path"
            class="fullwidth"
            @update:model-value="onRouteSelect"
        />
        <Button to="/debug"> Debug Sandbox </Button>
        <Button @click="openSettings"> {{ t("lobby.components.misc.debugSidebar.openSettingsFile") }} </Button>
        <Button @click="openAssetsDir"> {{ t("lobby.components.misc.debugSidebar.openAssetsDir") }} </Button>
        <Button @click="openStateDir"> {{ t("lobby.components.misc.debugSidebar.openStateDir") }} </Button>
        <Button @click="openStartScript"> {{ t("lobby.components.misc.debugSidebar.openStartScript") }} </Button>
        <Button @click="openSyncLobbyContentTool"> {{ t("lobby.components.misc.debugSidebar.syncLobbyContent") }} </Button>
        <Button @click="causeError"> {{ t("lobby.components.misc.debugSidebar.causeError") }} </Button>

        <Select
            :modelValue="gameStore.selectedGameVersion"
            :options="gameListOptions"
            optionLabel="gameVersion"
            :label="t('lobby.components.misc.debugSidebar.game')"
            :filter="true"
            @update:model-value="onGameSelected"
        />

        <Select
            :modelValue="enginesStore.selectedEngineVersion"
            :options="enginesStore.availableEngineVersions"
            data-key="id"
            option-label="id"
            :label="t('lobby.components.misc.debugSidebar.engine')"
            :filter="true"
            class="fullwidth"
            @update:model-value="(engine) => (enginesStore.selectedEngineVersion = engine)"
        />
        <Button @click="serverSettingsOpen = true">{{ t("lobby.components.misc.debugSidebar.lobbyServerSettings") }}</Button>
        <div class="setting-row">
            <span class="setting-label">Map Detail: Animated View</span>
            <ToggleSwitch v-model="settingsStore.mapDetailUseAnimatedView" />
        </div>
        <SyncDataDirsDialog v-model="syncLobbyContentToolOpen" />
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import tools from "@iconify-icons/mdi/tools";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import Button from "@renderer/components/controls/Button.vue";
import Select from "@renderer/components/controls/Select.vue";
import ToggleSwitch from "@renderer/components/controls/ToggleSwitch.vue";
import SyncDataDirsDialog from "@renderer/components/misc/SyncDataDirsDialog.vue";
import { gameStore } from "@renderer/store/game.store";
import { enginesStore } from "@renderer/store/engine.store";
import { settingsStore } from "@renderer/store/settings.store";
import { GameVersion } from "@main/content/game/game-version";
import { inject, Ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

const active = ref(false);
const syncLobbyContentToolOpen = ref(false);

const serverSettingsOpen = inject<Ref<boolean>>("serverSettingsOpen")!;

const router = useRouter();
const routes = router.getRoutes().sort((a, b) => a.path.localeCompare(b.path));
const currentRoute = router.currentRoute;

const gameListOptions = computed(() => {
    return Array.from(gameStore.availableGameVersions.values());
});

async function onGameSelected(gameVersion: GameVersion) {
    gameStore.selectedGameVersion = gameVersion;
}

async function onRouteSelect(newRoute: string) {
    console.log("Navigating to", newRoute);
    await router.replace(newRoute);
}

function openSettings() {
    window.shell.openSettingsFile();
}

async function openAssetsDir() {
    window.shell.openAssetsDir();
}

async function openStateDir() {
    window.shell.openStateDir();
}

async function openStartScript() {
    window.shell.openStartScript();
}

function openSyncLobbyContentTool() {
    syncLobbyContentToolOpen.value = true;
}

function causeError() {
    const x = null;
    /* eslint-disable */
    // @ts-expect-error: testing an intentional error
    const j = x.hello;
    /* eslint-enable */
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.debug-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    z-index: 15;
    background: #111;
    border-left: 1px solid #222;
    transform: translateX(100%);
    transition: transform 0.1s;
    padding: map.get($spacing, "sm");
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: map.get($spacing, "sm");
    &.active {
        transform: translateX(0);
        box-shadow: -5px 0 5px rgba(0, 0, 0, 0.5);
    }
    .toggle {
        position: absolute;
        bottom: 0;
        left: 0;
        :deep(.button) {
            transform: translateX(-100%);
            background: #111;
            border: 1px solid #222;
            border-right: none;
            border-bottom: none;
            box-shadow: -5px 2px 5px rgba(0, 0, 0, 0.5);
            &:hover {
                background: #222;
            }
        }
    }
    .setting-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: map.get($spacing, "sm");
        padding: map.get($spacing, "xs") 0;
    }
    .setting-label {
        flex: 1;
        color: rgba(255, 255, 255, 0.8);
        @extend .body-2 !optional;
    }
}
</style>
