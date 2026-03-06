<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { empty: true, blurBg: true, transition: { name: "fade" } } }
</route>

<template>
    <div class="container">
        <img ref="logo" class="logo" src="/src/renderer/assets/images/BARLogoFull.png" />
        <Transition mode="out-in" name="fade">
            <div v-if="connecting">
                <div class="relative">
                    <Loader></Loader>
                </div>
                <Transition :appear="true" name="delayed-fade">
                    <Button class="slim go-back-button" @click="abort">{{ t("lobby.views.index.goBack") }}</Button>
                </Transition>
            </div>
            <div v-else class="buttons-container">
                <Button class="green large fullwidth login-button" @click="login">{{ t("lobby.views.index.login") }}</Button>
                <div v-if="hasCredentials" class="play-offline" @click="changeAccount">{{ t("lobby.views.index.changeAccount") }}</div>
                <div v-if="error" class="txt-error">{{ error }}</div>
                <div class="play-offline" @click="playOffline">{{ t("lobby.views.index.playOffline") }}</div>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { onActivated, ref } from "vue";
import { useTypedI18n } from "@renderer/i18n";

import Button from "@renderer/components/controls/Button.vue";
import Loader from "@renderer/components/common/Loader.vue";
import { useRouter } from "vue-router";
import { auth } from "@renderer/store/me.store";
import { settingsStore } from "@renderer/store/settings.store";
import { tachyon } from "@renderer/store/tachyon.store";

const { t } = useTypedI18n();

const router = useRouter();

const connecting = ref(false);
const error = ref<string>();

const hasCredentials = ref(false);
onActivated(() => {
    window.auth.hasCredentials().then((result) => {
        hasCredentials.value = result;
    });
});

async function login() {
    try {
        error.value = "";
        connecting.value = true;
        await auth.login();
        await tachyon.connect();
        const redirect = router.currentRoute.value.query.redirect as string | undefined;
        await router.push(redirect || "/play/menu");
    } catch (e) {
        console.error(e);
        error.value = (e as Error).message;
    } finally {
        connecting.value = false;
    }
}

async function abort() {
    connecting.value = false;
    error.value = "";
    await auth.logout();
    router.push("/");
}

async function changeAccount() {
    await auth.changeAccount();
    hasCredentials.value = false;
    login();
}

async function playOffline() {
    auth.playOffline();
    router.push("/play/menu");
}

if (hasCredentials.value && settingsStore.loginAutomatically) {
    console.log("Logging in automatically");
    login();
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: calc((100vh - 900px) / 2);
    width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.logo {
    filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8));
    margin-bottom: 80px;
}

.play-offline {
    display: flex;
    align-self: center;
    margin-top: map.get($spacing, "xl");
    @extend .title-1 !optional;
    opacity: 0.3;
    &:hover {
        opacity: 1;
    }
}

.go-back-button {
    align-self: center;
    margin-top: map.get($spacing, "xxxxl");
    background: transparent;
    border: none;
    opacity: 0.3;
    &:hover {
        opacity: 1;
        background: transparent;
    }
}

.buttons-container {
    display: flex;
    gap: map.get($spacing, "xl");
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.login-button {
    min-width: 400px;
    max-width: 100%;
}

.delayed-fade-enter-active {
    animation: fadeIn 0.5s ease-in-out;
    animation-delay: 2s;
    animation-fill-mode: both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 0.3;
    }
}
</style>
