<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="nav" :class="{ hidden }">
        <div class="logo">
            <Button to="/play/menu">
                <img src="/src/renderer/assets/images/logo.svg" />
            </Button>
        </div>
        <div class="flex-col flex-grow">
            <div class="primary flex-row flex-space-between gap-xxs">
                <div class="primary-left">
                    <Button 
                        v-for="view in primaryRoutes" 
                        :key="view.path" 
                        :to="view.path === '/styles' ? '/styles/new-styles' : view.path"
                        :match-prefix="view.path"
                        :class="{ 'dev-only': view.meta.devOnly }"
                        @mouseenter="prefetchRoute(view.path === '/styles' ? '/styles/new-styles' : view.path)"
                    >
                        {{ view.meta.title }}
                    </Button>
                </div>
                <div class="drag-window-area"></div>
                <div class="primary-right">
                    <DownloadsButton
                        v-if="hasActiveDownload"
                        v-tooltip.bottom="t('lobby.navbar.tooltips.downloads')"
                        v-click-away:downloads="() => (downloadsOpen = false)"
                        :class="['icon', { active: downloadsOpen }]"
                        @click="downloadsOpen = !downloadsOpen"
                    />
                    <Button
                        v-if="me.isAuthenticated"
                        v-tooltip.bottom="t('lobby.navbar.tooltips.directMessages')"
                        v-click-away:messages="closeMessages"
                        :class="['icon', { active: messagesOpenRef }]"
                        @click="openMessages"
                    >
                        <Icon :icon="messageIcon" :height="40" />
                        <div v-if="messagesUnread" class="unread-dot"></div>
                    </Button>
                    <Button
                        v-if="settingsStore.devMode"
                        v-tooltip.bottom="t('lobby.navbar.tooltips.friends')"
                        v-click-away:friends="() => (friendsOpen = false)"
                        :class="['icon', 'dev-only', { active: friendsOpen }]"
                        @click="handleFriendsClick"
                    >
                        <Icon :icon="accountMultiple" :height="40" />
                    </Button>
                    <Button v-tooltip.bottom="t('lobby.navbar.tooltips.settings')" class="icon" @click="settingsOpen = true">
                        <Icon :icon="cog" :height="40" />
                    </Button>
                    <div class="window-controls-stack">
                        <Button v-tooltip.bottom="t('lobby.navbar.tooltips.exit')" class="icon window-control-btn close" @click="exitOpen = true">
                            <Icon :icon="closeThick" :height="20" />
                        </Button>
                        <Button
                            v-tooltip.bottom="
                                settingsStore.fullscreen ? t('lobby.navbar.tooltips.windowed') : t('lobby.navbar.tooltips.fullscreen')
                            "
                            class="icon window-control-btn"
                            @click="toggleFullscreen"
                        >
                            <Icon v-if="settingsStore.fullscreen" :icon="fullscreenExit" :height="20"></Icon>
                            <Icon v-else :icon="fullscreen" :height="20"></Icon>
                        </Button>
                        <Button v-tooltip.bottom="t('lobby.navbar.tooltips.minimize')" class="icon window-control-btn" @click="minimizeWindow">
                            <Icon :icon="windowMinimize" :height="20"></Icon>
                        </Button>
                    </div>
                </div>
            </div>
            <div class="secondary">
                <div class="secondary-left flex-row flex-left">
                    <Button 
                        v-for="view in secondaryRoutes" 
                        :key="view.path" 
                        :to="view.path"
                        :class="{ 'dev-only': view.meta.devOnly }"
                        @mouseenter="prefetchRoute(view.path)"
                    >
                        {{ view.meta.title ?? view.name }}
                    </Button>
                </div>
                <div class="secondary-right flex-row flex-right">
                    <ServerStatus v-if="settingsStore.devMode" />
                    <Button 
                        v-if="me.isAuthenticated" 
                        class="user" 
                        @click="profileOpen = true; profileUserId = me.userId?.toString()"
                    >
                        <div class="flex-row flex-center gap-sm">
                            <Icon :icon="account" :height="20" />
                            <div>{{ me.username }}</div>
                        </div>
                    </Button>
                </div>
            </div>
        </div>

        <TransitionGroup name="slide-right">
            <Friends v-show="friendsOpen" key="friends" v-model="friendsOpen" v-click-away:friends="() => (friendsOpen = false)" />
            <Downloads
                v-show="downloadsOpen"
                key="downloads"
                v-model="downloadsOpen"
                v-click-away:downloads="() => (downloadsOpen = false)"
            />
        </TransitionGroup>

        <ProfileModal v-model="profileOpen" :userId="profileUserId || me.userId?.toString()" />

        <Exit v-model="exitOpen" />
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import account from "@iconify-icons/mdi/account";
import accountMultiple from "@iconify-icons/mdi/account-multiple";
import messageIcon from "@iconify-icons/mdi/chat";
import closeThick from "@iconify-icons/mdi/close-thick";
import windowMinimize from "@iconify-icons/mdi/window-minimize";
import fullscreen from "@iconify-icons/mdi/fullscreen";
import fullscreenExit from "@iconify-icons/mdi/fullscreen-exit";

import cog from "@iconify-icons/mdi/cog";
import { computed, inject, provide, Ref, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";
const { t } = useTypedI18n();

import Button from "@renderer/components/controls/Button.vue";
import Downloads from "@renderer/components/navbar/Downloads.vue";
import DownloadsButton from "@renderer/components/navbar/DownloadsButton.vue";
import Exit from "@renderer/components/navbar/Exit.vue";
import Friends from "@renderer/components/navbar/Friends.vue";
import ProfileModal from "@renderer/components/navbar/ProfileModal.vue";
import { useRouter } from "vue-router";
import { settingsStore } from "@renderer/store/settings.store";
import { downloadsStore } from "@renderer/store/downloads.store";
import { me } from "@renderer/store/me.store";
import ServerStatus from "@renderer/components/navbar/ServerStatus.vue";
import { useLogInConfirmation } from "@renderer/composables/useLogInConfirmation";

defineProps<{
    hidden?: boolean;
}>();

const router = useRouter();
const allRoutes = router.getRoutes();

function translateRouteTitle(title: string | undefined): string {
    if (!title) return "";
    // If title looks like an i18n key (starts with "lobby."), translate it
    if (title.startsWith("lobby.")) {
        try {
            const translated = t(title as any);
            // If translation returns the key itself, it means the key wasn't found
            return translated === title ? title : translated;
        } catch {
            return title;
        }
    }
    // Map route titles to their i18n keys (only translate if key exists)
    const titleMap: Record<string, string> = {
        "Multiplayer Lobbies": "lobby.views.play.customLobbies.title",
        "Custom Lobbies": "lobby.views.play.customLobbies.title",
        "Scenarios": "lobby.views.play.scenarios",
        "Skirmish vs AI": "lobby.views.play.skirmish",
        "Campaign": "lobby.views.play.campaign.title",
        "Matchmaking": "lobby.views.play.matchmaking.title",
        "Tournaments": "lobby.views.play.tournaments.title",
        "Replays": "lobby.views.watch.replays.title",
    };
    const translationKey = titleMap[title];
    if (translationKey) {
        try {
            const translated = t(translationKey as any);
            // If translation returns the key (meaning it wasn't found), return original title
            return translated === translationKey ? title : translated;
        } catch {
            return title;
        }
    }
    // For titles without a mapping, return as-is (they should already be in the correct language)
    return title;
}

const primaryRoutes = computed(() => {
    return allRoutes
        .filter((r) => ["/play", "/watch", "/news", "/library", "/styles"].includes(r.path))
        .filter(
            (r) => (r.meta.hide === false || r.meta.hide === undefined) && ((r.meta.devOnly && settingsStore.devMode) || !r.meta.devOnly)
        )
        .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99))
        .map((r) => ({
            ...r,
            meta: {
                ...r.meta,
                title: translateRouteTitle(r.meta.title),
            },
        }));
});
const secondaryRoutes = computed(() => {
    const currentPrimaryRouteSegment = router.currentRoute.value.path.split("/")[1];
    if (currentPrimaryRouteSegment === "styles") {
        return [
            {
                path: "/styles/new-styles",
                meta: { title: translateRouteTitle("New Styles") },
            },
        ];
    }

    return allRoutes
        .filter((r) => r.path.startsWith(`/${router.currentRoute.value.path.split("/")[1]}/`))
        .filter(
            (r) => (r.meta.hide === false || r.meta.hide === undefined) && ((r.meta.devOnly && settingsStore.devMode) || !r.meta.devOnly)
        )
        .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99))
        .map((r) => ({
            ...r,
            meta: {
                ...r.meta,
                title: translateRouteTitle(r.meta.title),
            },
        }));
});
const hasActiveDownload = computed(() => downloadsStore.mapDownloads.length > 0);
const messagesOpenRef = inject<Ref<boolean>>("messagesOpen")!;
const friendsOpen = ref(false);

function openMessages() {
    messagesOpenRef.value = true;
}
function closeMessages() {
    messagesOpenRef.value = false;
}
const downloadsOpen = ref(false);
const profileOpen = ref(false);
const profileUserId = ref<string | undefined>(undefined);
const settingsOpen = inject<Ref<boolean>>("settingsOpen")!;
const exitOpen = inject<Ref<boolean>>("exitOpen")!;

const toggleProfile: Ref<((userId?: string) => void) | undefined> = ref();
toggleProfile.value = (userId?: string) => {
    if (userId) {
        profileUserId.value = userId;
        profileOpen.value = true;
    } else {
        profileOpen.value = !profileOpen.value;
    }
};
provide("toggleProfile", toggleProfile);

const { openLogInConfirmation } = useLogInConfirmation();
function handleFriendsClick() {
    if (!me.isAuthenticated) {
        openLogInConfirmation(router.currentRoute.value);
        return;
    }
    friendsOpen.value = !friendsOpen.value;
}

const messagesUnread = computed(() => {
    //TODO dmStores
    // for (const [, messages] of api.session.directMessages) {
    //     for (const message of messages) {
    //         if (!message.read) {
    //             return true;
    //         }
    //     }
    // }
    return false;
});

function minimizeWindow() {
    window.mainWindow?.minimize();
}

function toggleFullscreen() {
    settingsStore.fullscreen = !settingsStore.fullscreen;
}

// Prefetch route components on hover to improve navigation performance
function prefetchRoute(path: string) {
    try {
        const route = router.resolve(path);
        if (route && route.matched.length > 0) {
            route.matched.forEach((matched) => {
                if (matched.components) {
                    Object.values(matched.components).forEach((component) => {
                        if (component && typeof component === "function") {
                            // Trigger lazy loading by calling the component function
                            component().catch(() => {
                                // Silently fail if component fails to load
                            });
                        }
                    });
                }
            });
        }
    } catch (error) {
        // Silently fail if route doesn't exist
    }
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.nav {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    backdrop-filter: blur(5px);
    background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.9));
    box-shadow:
        0 1px 0 rgba(0, 0, 0, 0.4),
        0 3px 5px rgba(0, 0, 0, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: map.get($spacing, "xxs");
    transition:
        transform 0.3s,
        opacity 0.3s;
    z-index: 2;
    font-family: Rajdhani, sans-serif;
    &.hidden {
        opacity: 0;
        transform: translateY(-100%);
    }
    &:before {
        @extend .fullsize;
        left: 0;
        top: 0;
        content: "";
        z-index: -1;
        opacity: 0.2;
        background-image: url("/src/renderer/assets/images/squares.png");
    }
}
.logo {
    flex-direction: column;
    flex-grow: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    height: 100%;
    box-shadow: 1px 0 0 rgba(255, 255, 255, 0.1);
    img {
        height: 40px;
        opacity: 0.9;
    }
    &:hover img,
    &.active img {
        opacity: 1;
    }
    img {
        height: 50px;
    }
}
/* Fixed height so row doesn’t stretch; matches close button width for 1:1 aspect ratio (icon 40px + padding md×2) */
.primary {
    height: 64px;
    min-height: 64px;
    flex-shrink: 0;
}
.primary,
.logo {
    .button {
        background: radial-gradient(rgba(73, 49, 49, 0), rgba(255, 255, 255, 0.05));
        color: rgba(255, 255, 255, 0.8);
        box-shadow:
            1px 0 0 rgba(255, 255, 255, 0.05),
            -1px 0 0 rgba(255, 255, 255, 0.05);
        border: none;
        border-radius: 0 !important; /* Intentional: NavBar buttons require square corners */
        flex-grow: 0;
        height: 100%;
        text-transform: uppercase;
        max-height: unset;
        :deep(.button-content) {
            font-size: 20px; // Intentional: :deep() override — 20px/regular is off-scale (subtitle-1 is 20px/semibold)
            font-weight: 400; // Intentional: regular weight for nav buttons, not semibold
            font-family: Montserrat, sans-serif;
            line-height: 1.3;
        }
        :deep(.p-button) {
            padding: 0 map.get($spacing, "xl");
            border-radius: 0 !important; // Intentional: NavBar buttons require square corners
        }
        &.icon {
            :deep(.p-button) {
                padding: 0 map.get($spacing, "md");
                border-radius: 0 !important; // Intentional: NavBar buttons require square corners
            }
        }
        &:hover,
        &.active {
            background: radial-gradient(rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.15));
            color: #fff;
            text-shadow: 0 0 7px #fff;
            box-shadow:
                1px 0 0 rgba(255, 255, 255, 0.2),
                -1px 0 0 rgba(255, 255, 255, 0.2),
                0 1px 0 rgba(255, 255, 255, 0.2),
                7px -3px 10px rgba(0, 0, 0, 0.5),
                -7px -3px 10px rgba(0, 0, 0, 0.5) !important; /* Override Button default box-shadow for NavBar active/hover glow */
        }
        &.active {
            z-index: 2;
        }
        &:hover {
            z-index: 3;
        }
    }
}
.primary-left,
.primary-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: map.get($spacing, "xxs");
}

/* Container = 32×64 (50% width of former close button); Close + Window + Minimize stacked */
.window-controls-stack {
    display: flex;
    flex-direction: column;
    width: 32px;
    height: 64px;
    flex-shrink: 0;
    gap: 0;
    overflow: hidden;
    .window-control-btn {
        flex: 1 1 0;
        min-height: 0 !important; /* Override Button component default 48px so all three fit */
        width: 32px;
        min-width: 32px;
        height: 100%;
        display: flex;
        :deep(.p-button),
        :deep(.button-content),
        :deep(button) {
            min-height: 0 !important; /* Override design system min-height so stack fits in 64px row */
        }
        :deep(.p-button),
        :deep(.button-content) {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            min-height: 0;
            width: 100%;
            height: 100%;
            min-width: 32px;
            padding: 0;
        }
    }
}
.primary-left {
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.4);
    &:first-child {
        box-shadow: 1px 0 0 rgba(255, 255, 255, 0.05);
    }
    &:last-child {
        box-shadow:
            -1px 0 0 rgba(255, 255, 255, 0.05),
            1px 0 0 rgba(255, 255, 255, 0.15);
    }
}
.primary-right {
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.4);
    &:first-child {
        box-shadow:
            1px 0 0 rgba(255, 255, 255, 0.05),
            -1px 0 0 rgba(255, 255, 255, 0.15);
    }
    &:last-child {
        box-shadow: -1px 0 0 rgba(255, 255, 255, 0.05);
    }
}
.secondary {
    flex-direction: row;
    background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.3));
    width: 100%;
    box-shadow: inset 2px 2px 10px rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center; // Align buttons vertically
    min-height: 48px; // Match small button height (48px including border)
    .button {
        background: none;
        border: none;
        border-radius: 0;
        color: rgba(255, 255, 255, 0.5);
        flex-grow: 0;
        height: map.get($spacing, "xxxl");
        :deep(.button-content) {
            font-size: 14px; // Intentional: :deep() override — can't add utility class to inner component element
            font-weight: 400; // Intentional: body-2 equivalent (14px/regular)
            font-family: Montserrat, sans-serif;
            line-height: 1.4;
        }
        :deep(> button) {
            padding: 0 map.get($spacing, "xl");
            height: 100%;
            border-radius: 0 !important; // Intentional: NavBar buttons require square corners
        }
        &:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
            box-shadow:
                inset 0 2px 10px rgba(0, 0, 0, 0.5),
                0 1px 0 rgba(255, 255, 255, 0.2);
        }
        &.active {
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
            border-bottom: 2px solid rgba(255, 255, 255, 0.8);
            box-sizing: border-box;
        }
    }
    &-right {
        .button {
            padding: 0;
            :deep(.button-content) {
                @extend .body-1 !optional; // 16px - for player name and server status
                font-family: Montserrat, sans-serif;
                line-height: 1.4;
            }
        }
    }
}
.button.close:hover {
    background: rgba(255, 0, 0, 0.2);
    box-shadow:
        1px 0 0 rgba(255, 47, 47, 0.418),
        -1px 0 0 rgba(255, 47, 47, 0.418),
        0 1px 0 rgba(255, 47, 47, 0.418),
        7px -3px 10px rgba(0, 0, 0, 0.5),
        -7px -3px 10px rgba(0, 0, 0, 0.5) !important; /* Override Button default box-shadow for close button hover */
}
.user {
    text-transform: unset;
}
.unread-dot {
    position: absolute;
    width: map.get($spacing, "sm");
    height: map.get($spacing, "sm");
    border-radius: 100%;
    right: map.get($spacing, "lg");
    bottom: map.get($spacing, "lg");
    background: red;
}

.drag-window-area {
    flex-grow: 1;
    -webkit-app-region: drag !important; /* Required for Electron window drag — must override any inherited region */
}
</style>
