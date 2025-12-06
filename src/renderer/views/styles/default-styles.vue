<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Default Styles", order: 1, transition: { name: "slide-left" } } }
</route>

<template>
    <Panel class="flex-grow style-panel">
        <div class="scroll-container">
            <div class="flex-col gap-xl padding-md">
                <!-- Typography Section -->
                <div class="flex-col gap-md">
                    <h2>Typography</h2>
                    <div class="flex-col gap-sm">
                        <h1>Heading 1</h1>
                        <h2>Heading 2</h2>
                        <h3>Heading 3</h3>
                        <h4>Heading 4</h4>
                        <h5>Heading 5</h5>
                        <h6>Heading 6</h6>
                        <p>
                            This is a standard paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                            incididunt ut labore et dolore magna aliqua.
                        </p>
                        <div class="text-sm">Small text (text-sm)</div>
                        <div class="text-xs">Extra small text (text-xs)</div>
                        <div class="text-mono">Monospaced text (text-mono)</div>
                    </div>
                </div>

                <Divider />

                <!-- Buttons Section -->
                <div class="flex-col gap-md">
                    <h2>Buttons</h2>
                    <div class="flex-row gap-md flex-center-items flex-wrap">
                        <Button class="blue text-shadow">Primary</Button>
                        <Button class="grey text-shadow">Secondary</Button>
                        <Button class="black text-shadow tertiary">Tertiary</Button>
                        <Button class="green text-shadow">Success</Button>
                        <Button class="red text-shadow">Danger</Button>
                        <Button disabled class="text-shadow">Disabled</Button>
                    </div>
                    <div class="flex-row gap-md flex-center-items flex-wrap">
                        <Button class="yellow text-shadow">Yellow</Button>
                        <Button class="purple text-shadow">Purple</Button>
                        <Button class="orange text-shadow">Orange</Button>
                        <Button class="white text-shadow" style="color: #000">White</Button>
                        <Button class="blue text-shadow slim">Slim Blue</Button>
                        <div class="close-button">
                            <Icon :icon="closeThick" height="25" />
                        </div>
                    </div>
                    <div class="flex-row gap-md flex-center-items flex-wrap">
                        <Button class="quick-play-button">Quick Play</Button>
                        <Button class="quick-download-button red">Download</Button>
                        <Button class="cancel-button">Cancel</Button>
                    </div>
                    <div class="flex-row gap-md flex-center-items flex-wrap">
                        <Button class="grey text-shadow">
                            <template #icon>
                                <Icon :icon="arrowLeft" height="20" />
                            </template>
                            Back
                        </Button>
                        <Button class="blue text-shadow">
                            Next
                            <template #icon-right>
                                <Icon :icon="arrowRight" height="20" />
                            </template>
                        </Button>
                    </div>
                    <div class="flex-row gap-md flex-center-items flex-wrap">
                        <Button class="blue text-shadow large">Primary Large</Button>
                        <Button class="grey text-shadow large">Secondary Large</Button>
                        <Button class="black text-shadow tertiary large">Tertiary Large</Button>
                        <Button class="green text-shadow large">Success Large</Button>
                        <Button class="red text-shadow large">Danger Large</Button>
                    </div>
                </div>

                <Divider />

                <!-- Inputs Section -->
                <div class="flex-col gap-md">
                    <h2>Inputs</h2>
                    <div class="gridform">
                        <div>Textbox</div>
                        <Textbox v-model="textValue" placeholder="Enter text..." />

                        <div>Textbox (Label)</div>
                        <Textbox v-model="textValue" label="With Label" />

                        <div>Textbox (Disabled)</div>
                        <Textbox v-model="textValue" disabled />

                        <div>Number</div>
                        <Number v-model="numValue" :min="0" :max="100" />

                        <div>SearchBox</div>
                        <SearchBox v-model="searchValue" />

                        <div>Textarea</div>
                        <Textarea v-model="areaValue" placeholder="Multi-line text..." />
                    </div>
                </div>

                <Divider />

                <!-- Selection Controls -->
                <div class="flex-col gap-md">
                    <h2>Selection Controls</h2>
                    <div class="gridform">
                        <div>Select (Dropdown)</div>
                        <Select
                            v-model="selectedValue"
                            :options="selectOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select an option"
                        />

                        <div>Select (Filter)</div>
                        <Select
                            v-model="selectedValue"
                            :options="selectOptions"
                            optionLabel="label"
                            optionValue="value"
                            filter
                            placeholder="Search options..."
                        />

                        <div>Checkbox</div>
                        <div class="flex-row gap-md">
                            <Checkbox v-model="checked" label="Check me" />
                            <Checkbox v-model="checked" label="Disabled" disabled />
                        </div>

                        <div>Radio Options</div>
                        <Options v-model="radioValue" :options="['Option A', 'Option B', 'Option C']" />

                        <div>Range Slider</div>
                        <Range v-model="rangeValue" :min="0" :max="100" />
                    </div>
                </div>

                <Divider />

                <!-- Panels Section -->
                <div class="flex-col gap-md">
                    <h2>Panels</h2>
                    <div class="flex-row gap-md">
                        <Panel class="flex-grow">Default Panel</Panel>
                        <Panel class="flex-grow" noPadding>Panel (No Padding)</Panel>
                    </div>
                </div>
            </div>
        </div>
    </Panel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Panel from "@renderer/components/common/Panel.vue";
import Button from "@renderer/components/controls/Button.vue";
import Textbox from "@renderer/components/controls/Textbox.vue";
import Number from "@renderer/components/controls/Number.vue";
import SearchBox from "@renderer/components/controls/SearchBox.vue";
import Textarea from "@renderer/components/controls/Textarea.vue";
import Select from "@renderer/components/controls/Select.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import Options from "@renderer/components/controls/Options.vue";
import Range from "@renderer/components/controls/Range.vue";
import Divider from "@renderer/components/common/Divider.vue";
import { Icon } from "@iconify/vue";
import closeThick from "@iconify-icons/mdi/close-thick";
import arrowLeft from "@iconify-icons/mdi/arrow-left";
import arrowRight from "@iconify-icons/mdi/arrow-right";

// State for inputs
const textValue = ref("");
const numValue = ref(42);
const searchValue = ref("");
const areaValue = ref("");
const selectedValue = ref(1);
const checked = ref(false);
const radioValue = ref("Option A");
const rangeValue = ref(50);

const selectOptions = [
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 },
    { label: "Option 3", value: 3 },
    { label: "Long Option Name That Might Wrap", value: 4 },
];
</script>

<style lang="scss" scoped>
.scroll-container {
    overflow-y: auto;
    padding-right: 10px;
    height: 0;
    flex-grow: 1;
}

.gridform {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 10px;
    align-items: center;
}

h2 {
    padding-bottom: 5px;
}

.padding-md {
    padding: 20px;
}

.style-panel {
    min-height: 0;
}

// Tertiary button style - maintains special transparent/underline treatment
:deep(.button.tertiary) {
    box-shadow: none !important;
    background: none !important;
    border: none !important;
    .p-button {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        text-decoration: underline;
        color: inherit;
    }
    &:hover {
        background: none !important;
        box-shadow: none !important;
        .p-button {
            background: transparent !important;
            box-shadow: none !important;
            color: #fff;
        }
    }
}

// Large button style
:deep(.button.large) {
    .p-button {
        font-size: 18px; // txt-lg
        padding: 0 8px; // Unified padding
        height: 50px;
    }
}

// Regular button font size (apply to all buttons that aren't large)
:deep(.button:not(.large)) {
    .p-button {
        font-size: 16px; // txt-md
    }
}

// Modal Close Button Style
.close-button {
    display: flex;
    padding: 5px 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;

    &:hover {
        background: rgba(219, 20, 20, 0.6);
        color: #fff;
        box-shadow:
            1px 0 0 rgba(255, 47, 47, 0.418),
            -1px 0 0 rgba(255, 47, 47, 0.418),
            0 1px 0 rgba(255, 47, 47, 0.418),
            7px -3px 10px rgba(0, 0, 0, 0.5),
            -7px -3px 10px rgba(0, 0, 0, 0.5) !important;
    }
}

// Quick Play Button
:deep(.button.quick-play-button) {
    .p-button {
        text-transform: uppercase;
        font-family: Rajdhani;
        font-weight: bold;
        font-size: 1.4rem;
        padding: 10px 40px;
        color: #fff;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        border: none;
        border-radius: 2px;
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;

        &:hover {
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
        }
    }
}

// Quick Download Button
:deep(.button.quick-download-button) {
    .p-button {
        font-family: Rajdhani;
        font-weight: bold;
        font-size: 1.4rem;
        padding: 10px 40px;
        color: #fff;
        border: none;
        border-radius: 2px;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }
}

// Cancel Button
:deep(.button.cancel-button) {
    .p-button {
        text-transform: uppercase;
        font-family: Rajdhani;
        font-weight: bold;
        font-size: 1.5rem;
        padding: 20px 40px;
        color: #fff;
        border: none;
        border-radius: 2px;
        transition: all 0.3s ease;

        &:hover {
            color: #eee;
            text-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
        }
    }
}
</style>

