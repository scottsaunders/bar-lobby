<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Commands", order: 4, devOnly: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <h1>{{ route.meta.title }}</h1>
            </div>
            <div class="commands-content">
                <Panel class="fullheight">
                <div class="flex-col gap-lg flex-grow fullheight">
                    <div class="flex-row gap-md">
                        <SearchBox v-model="searchVal" />
                        <Select v-model="filterMethod" :options="filterMethods" label="Type" />
                    </div>
                    <div class="flex-col flex-grow fullheight">
                        <div class="scroll-container">
                            <div v-for="command in filteredCommands" :key="command.cmd" class="command">
                                <div class="cmd">{{ command.cmd }}</div>
                                <div class="cmdDescription">{{ command.cmdDescription }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Panel>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from "vue";

import { Command, serverCommandList } from "@renderer/api/commands";
import SearchBox from "@renderer/components/controls/SearchBox.vue";
import Select from "@renderer/components/controls/Select.vue";
import { useRouter } from "vue-router";
import Panel from "@renderer/components/common/Panel.vue";

type FilterMethod = "All" | "Spads" | "Server";
const filterMethods: FilterMethod[] = ["All", "Spads", "Server"];
const filterMethod: Ref<FilterMethod> = ref("All");

const searchVal = ref("");

/**
 * these server commands come with one message, not sure if make sense to build complex logic for parsing them
 * if they start come as spads commands, it could break the script
 **/

const commands: Command[] = serverCommandList;

// Sort the commands array based on the sort method
function filterCommands(commands: Command[], filterMethod: FilterMethod) {
    switch (filterMethod) {
        case "All":
            return commands;
        case "Spads":
            return commands.filter((command) => command.cmd.startsWith("!"));
        case "Server":
            return commands.filter((command) => command.cmd.startsWith("$"));
        default:
            return commands;
    }
}

const filteredCommands = computed(() => {
    if (!searchVal.value) {
        return filterCommands(commands, filterMethod.value);
    }
    return filterCommands(
        commands.filter((command) => (command.cmd + command.cmdDescription).includes(searchVal.value)),
        filterMethod.value
    );
});

const router = useRouter();
const route = router.currentRoute.value;

// const directMessageCommandListener = api.comms.onResponse("s.communication.received_direct_message").add(async (data) => {
//     const { message } = data;
//     // Check if the message is a command
//     if (!message.startsWith("!") && !message.startsWith("$")) return;
//     const cmd = message.split("-")[0].split(" ")[0];
//     const cmdDescription = message.slice(cmd.length + 1).replace("-", " ");
//     if (cmdDescription && !cmdDescription.includes("*")) {
//         commands.push({ cmd, cmdDescription });
//     }
// });

onMounted(() => {
    // // Send a message to the server to get all the commands
    // api.comms.request("c.communication.send_direct_message", {
    //     recipient_id: 3137,
    //     message: `!helpall`,
    // });
});

// // Unsubscribe from the response listener when the component is not visible anymore
// onUnmounted(() => {
//     directMessageCommandListener.destroy();
// });
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.commands-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    align-self: center;
    width: 1600px; /* Layout-specific max width for commands list */
}

.command {
    display: flex;
    align-items: center;
    margin-bottom: map.get($spacing, "xs");
}

.cmd {
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 13px; /* intentional: 13px off-scale, between caption-1 (12px) and body-2 (14px) */
    font-weight: bold;
    padding: 10px; /* intentional: 10px off-scale, between sm (8px) and md (12px) */
    border-radius: 3px;
    margin-right: 10px; /* intentional: 10px off-scale, between sm (8px) and md (12px) */
    min-width: 162px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.cmdDescription {
    flex-grow: 1;
    margin-left: map.get($spacing, "xs");
    font-size: 13px; /* intentional: 13px off-scale, between caption-1 (12px) and body-2 (14px) */
    color: white;
}
</style>
