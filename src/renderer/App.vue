<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div v-if="settingsStore.isInitialized" id="wrapper" class="wrapper fullsize">
        <Transition name="fade">
            <SplashScreen v-if="loading" />
        </Transition>
        <template v-if="!loading">
            <transition mode="in-out" name="intro">
                <IntroVideo v-if="!settingsStore.skipIntro && videoVisible" @complete="onIntroEnd" />
            </transition>
            <Suspense>
                <DebugSidebar v-if="settingsStore.devMode" />
            </Suspense>
            <StickyBattle />
            <Background :blur="blurBg" />
            <Notifications />
            <PromptContainer />
            <NavBar :class="{ hidden: empty }" />
            <Messages v-show="messagesOpen" v-model="messagesOpen" v-click-away:messages="closeMessages" />
            <FriendsMockPanel v-show="friendsMockOpen" v-model="friendsMockOpen" v-click-away:friends="() => (friendsMockOpen = false)" />
            <div class="lobby-version">
                {{ infosStore.lobby.version }}
            </div>
            <div v-if="empty" class="splash-options">
                <div class="option" @click="settingsOpen = true">
                    <Icon :icon="cog" height="21" />
                </div>
                <div class="option" @click="exitOpen = true">
                    <Icon :icon="closeThick" height="21" />
                </div>
            </div>
            <div class="view-container" :class="{ 'translated-right': battleStore.isLobbyOpened }">
                <RouterView v-slot="{ Component, route }">
                    <template v-if="Component">
                        <Transition v-bind="route.meta.transition" mode="out-in">
                            <KeepAlive>
                                <Suspense timeout="0">
                                    <component :is="Component" />
                                    <template #fallback>
                                        <Loader />
                                    </template>
                                </Suspense>
                            </KeepAlive>
                        </Transition>
                    </template>
                </RouterView>
            </div>
            <Settings v-model="settingsOpen" />
            <ServerSettings v-model="serverSettingsOpen" />
            <MatchFoundOverlay />
            <LogInConfirmationModal v-model="logInConfirmationIsOpen" :intendedRoute="logInConfirmationIntendedRoute" />
        </template>
    </div>
    <Error />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import closeThick from "@iconify-icons/mdi/close-thick";
import cog from "@iconify-icons/mdi/cog";
import { onMounted, provide, Ref, toRef, toValue } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import StickyBattle from "@renderer/components/battle/StickyBattle.vue";
import Loader from "@renderer/components/common/Loader.vue";
import Background from "@renderer/components/misc/Background.vue";
import DebugSidebar from "@renderer/components/misc/DebugSidebar.vue";
import Error from "@renderer/components/misc/Error.vue";
import IntroVideo from "@renderer/components/misc/IntroVideo.vue";
import SplashScreen from "@renderer/components/misc/SplashScreen.vue";
import NavBar from "@renderer/components/navbar/NavBar.vue";
import Messages from "@renderer/components/navbar/Messages.vue";
import FriendsMockPanel from "@renderer/components/navbar/FriendsMockPanel.vue";
import Settings from "@renderer/components/navbar/Settings.vue";
import ServerSettings from "@renderer/components/navbar/ServerSettings.vue";
import Notifications from "@renderer/components/notifications/Notifications.vue";
import PromptContainer from "@renderer/components/prompts/PromptContainer.vue";
import LogInConfirmationModal from "@renderer/components/misc/LogInConfirmationModal.vue";

import { playRandomMusic } from "@renderer/utils/play-random-music";
import { runInit } from "@renderer/utils/background-init";
import { settingsStore } from "./store/settings.store";
import { infosStore } from "@renderer/store/infos.store";
import MatchFoundOverlay from "@renderer/components/battle/MatchFoundOverlay.vue";
import type { PartyMockState } from "@renderer/components/party/party-mock-state";
import { battleStore } from "@renderer/store/battle.store";
import { useGlobalKeybindings } from "@renderer/composables/useGlobalKeybindings";
import { me } from "@renderer/store/me.store";
import { auth } from "@renderer/store/me.store";
import { useLogInConfirmation } from "@renderer/composables/useLogInConfirmation";

const matchmakingWidgetState = ref({
    status: "idle" as "idle" | "searching" | "matchFound" | "waitingForPlayers" | "lost" | "gameStarting" | "cancelled",
    queues: [] as string[],
    playersQueued: 42,
    playersReady: 0,
    totalPlayers: 2,
    cancelReason: null as "intentional" | "server_error" | "party_user_left" | "ready_timeout" | null,
    matchMap: "",
    matchPlayers: [] as { name: string; team: 1 | 2 }[],
    matchQueue: "duel",
});

provide("matchmakingWidgetState", matchmakingWidgetState);

const partyState = ref<PartyMockState>({
    inParty: false,
    members: [],
});
provide("partyState", partyState);

const router = useRouter();
const videoVisible = toRef(!toValue(settingsStore.skipIntro));
const loading = ref(true);

const empty = ref(router.currentRoute.value?.meta?.empty ?? false);
const blurBg = ref(router.currentRoute.value?.meta?.blurBg ?? false);

const settingsOpen = ref(false);
const serverSettingsOpen = ref(false);
const exitOpen = ref(false);

const { isOpen: logInConfirmationIsOpen, intendedRoute: logInConfirmationIntendedRoute } = useLogInConfirmation();

provide("settingsOpen", settingsOpen);
provide("serverSettingsOpen", serverSettingsOpen);
provide("exitOpen", exitOpen);

const messagesOpen = ref(false);
provide("messagesOpen", messagesOpen);

function closeMessages() {
    messagesOpen.value = false;
}

const friendsMockOpen = ref(false);

useGlobalKeybindings({ exitOpen });

const toggleMessages: Ref<((open?: boolean, userId?: number) => void) | undefined> = ref();
provide("toggleMessages", toggleMessages);

const toggleFriends: Ref<((open?: boolean) => void) | undefined> = ref();
provide("toggleFriends", toggleFriends);

const toggleDownloads: Ref<((open?: boolean) => void) | undefined> = ref();
provide("toggleDownloads", toggleDownloads);

playRandomMusic();

onMounted(async () => {
    await runInit(router);
    loading.value = false;

    // In non-dev mode, skip login and go directly to the menu
    if (!settingsStore.devMode) {
        auth.playOffline();
        router.push("/play/menu");
    }
});

window.barNavigation.onNavigateTo((target: string) => {
    router.push(target);
});

const simpleRouterMemory = new Map<string, string>();
router.beforeEach(async (to) => {
    if (!to.meta?.redirect) return;

    const section = to.fullPath.split("/")[1];
    const rememberedPath = simpleRouterMemory.get(section);
    const defaultRedirect = to.meta.redirect;

    if (!rememberedPath || rememberedPath === "/play/menu") {
        return { path: router.resolve(defaultRedirect).fullPath };
    }

    const isAuthed = Boolean(toValue(me.isAuthenticated));
    if (!isAuthed) {
        const resolved = router.resolve(rememberedPath);
        const requiresAuth = router.getRoutes().find((r) => r.name === resolved.name)?.meta?.onlineOnly;

        if (requiresAuth) {
            return { path: router.resolve(defaultRedirect).fullPath };
        }
    }

    return { path: rememberedPath };
});

router.afterEach(async (to) => {
    const section = to.fullPath.split("/")[1];
    if (to.fullPath !== "/play/menu") {
        simpleRouterMemory.set(section, to.fullPath);
    }
    empty.value = to?.meta?.empty ?? false;
    blurBg.value = to?.meta?.blurBg ?? false;
});

function onIntroEnd() {
    videoVisible.value = false;
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    flex: auto;
    transition: transform 0.4s ease-out;
    overflow: hidden;
    position: relative;
    &.translated-right {
        transform: translateX(10%);
    }
}

.wrapper {
    overflow: hidden;
    position: relative;
}

.lobby-version {
    position: absolute;
    left: 3px;
    bottom: 1px;
    @extend .caption-1 !optional;
    color: rgba(255, 255, 255, 0.3);
}

.splash-options {
    position: fixed;
    display: flex;
    flex-direction: row;
    gap: map.get($spacing, "xs");
    right: 0;
    top: 0;
    padding: map.get($spacing, "sm");
    z-index: 5;
    .option {
        opacity: 0.8;
        &:hover {
            opacity: 1;
        }
    }
}
</style>
