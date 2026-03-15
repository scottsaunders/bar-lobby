<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <Modal
        :class="{ 'keybinds-mode': activePanel === 'keybinds' }"
        :style="activePanel === 'keybinds' ? { width: 'calc(100vw - 64px)', height: 'calc(100vh - 64px)' } : undefined"
        :title="activePanel === 'keybinds' ? 'Keybind Editor' : t('lobby.navbar.settings.title')"
        :back-action="activePanel === 'keybinds' ? goBack : undefined"
    >

        <Transition :name="transitionName" mode="out-in">
            <div v-if="activePanel === 'settings'" key="settings">
                <div class="gridform">
                    <div>{{ t("lobby.navbar.settings.fullscreen") }}</div>
                    <Checkbox v-model="settingsStore.fullscreen" />

                    <div>{{ t("lobby.navbar.settings.windowSize") }}</div>
                    <Select
                        v-model="settingsStore.size"
                        :options="sizeOptions"
                        optionLabel="label"
                        optionValue="value"
                        :disabled="settingsStore.fullscreen"
                    />

                    <div>{{ t("lobby.navbar.settings.display") }}</div>
                    <Select v-model="settingsStore.displayIndex" :options="displayOptions" optionLabel="label" optionValue="value" />

                    <div>{{ t("lobby.navbar.settings.skipIntro") }}</div>
                    <Checkbox v-model="settingsStore.skipIntro" />

                    <template v-if="settingsStore.devMode">
                        <div class="dev-only">{{ t("lobby.navbar.settings.loginAutomatically") }}</div>
                        <div class="dev-only"><Checkbox v-model="settingsStore.loginAutomatically" /></div>
                    </template>

                    <div>{{ t("lobby.navbar.settings.sfxVolume") }}</div>
                    <Range v-model="settingsStore.sfxVolume" :min="0" :max="100" :step="1" />

                    <div>{{ t("lobby.navbar.settings.musicVolume") }}</div>
                    <Range v-model="settingsStore.musicVolume" :min="0" :max="100" :step="1" />

                    <div>{{ t("lobby.navbar.settings.devMode") }}</div>
                    <Checkbox v-model="settingsStore.devMode" />

                    <OverlayPanel ref="op">
                        <div class="container">
                            {{ tooltipMessage }}
                        </div>
                    </OverlayPanel>
                    <Button @click="uploadLogsCommand">{{ t("lobby.navbar.settings.uploadLogs") }}</Button>
                </div>

                <div class="keybinds-shortcut">
                    <div class="keybinds-label">Game Keybinds</div>
                    <Button @click="openKeybindEditor">Open Keybind Editor</Button>
                </div>
            </div>

            <div v-else key="keybinds" class="keybinds-panel">
                <KeybindEditor />
            </div>
        </Transition>
    </Modal>
</template>


<script lang="ts" setup>
import { ref } from "vue";
import Modal from "@renderer/components/common/Modal.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import Range from "@renderer/components/controls/Range.vue";
import Select from "@renderer/components/controls/Select.vue";
import Button from "@renderer/components/controls/Button.vue";
import OverlayPanel from "primevue/overlaypanel";
import { asyncComputed } from "@vueuse/core";
import { settingsStore } from "@renderer/store/settings.store";
import { infosStore } from "@renderer/store/infos.store";
import { uploadLogs } from "@renderer/utils/log";
import { useTypedI18n } from "@renderer/i18n";
import KeybindEditor from "@renderer/components/keybinds/KeybindEditor.vue";
const { t } = useTypedI18n();

type Panel = "settings" | "keybinds";
const activePanel = ref<Panel>("settings");
const transitionName = ref<"slide-forward" | "slide-back">("slide-forward");

function openKeybindEditor() {
    transitionName.value = "slide-forward";
    activePanel.value = "keybinds";
}

function goBack() {
    transitionName.value = "slide-back";
    activePanel.value = "settings";
}

const op = ref();
const tooltipMessage = ref("");

const sizeOptions = [
    { label: t("lobby.navbar.settings.labelLg"), value: 900 },
    { label: t("lobby.navbar.settings.labelMd"), value: 720 },
    { label: t("lobby.navbar.settings.labelSm"), value: 540 },
];

const displayOptions = asyncComputed(async () => {
    return Array(infosStore.hardware.numOfDisplays)
        .fill(0)
        .map((_, i) => {
            return { label: t("lobby.navbar.settings.labelDisplay", { id: i + 1 }), value: i };
        });
});

async function uploadLogsCommand(event) {
    const curE = event;
    const curTarget = curE.currentTarget;

    try {
        const url = await uploadLogs();
        await navigator.clipboard.writeText(url);
        tooltipMessage.value = t("lobby.navbar.settings.logUrlCopied");
    } catch (e) {
        if (typeof e === "string") {
            tooltipMessage.value = e;
        } else {
            tooltipMessage.value = t("lobby.navbar.settings.couldNotUploadLog");
        }
    }

    op.value.show(curE, curTarget);
}
</script>

<style lang="scss" scoped>
.container {
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
}

.keybinds-shortcut {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 14px;
    gap: 12px;
}

.keybinds-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
}

.keybinds-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

/* Panel transitions */
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-back-enter-active,
.slide-back-leave-active {
    transition:
        transform 0.22s ease-in-out,
        opacity 0.22s ease-in-out;
}

.slide-forward-enter-from {
    transform: translateX(40px);
    opacity: 0;
}
.slide-forward-leave-to {
    transform: translateX(-40px);
    opacity: 0;
}

.slide-back-enter-from {
    transform: translateX(-40px);
    opacity: 0;
}
.slide-back-leave-to {
    transform: translateX(40px);
    opacity: 0;
}
</style>

<!-- Non-scoped: target the Modal's inner Panel when in keybinds mode.
     #modal is the id set by Modal.vue on its Panel element. -->
<style lang="scss">
#modal.keybinds-mode {
    .content {
        padding: 0;
        overflow: hidden;
    }
}
</style>
