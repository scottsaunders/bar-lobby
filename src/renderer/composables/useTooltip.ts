// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { ref, Ref, onUnmounted } from "vue";

// Global tooltip delay setting (in milliseconds)
export const tooltipDelay = ref(3000);

// Composable for tooltip functionality with delay
export function useTooltip(tooltipText: Ref<string | undefined> | string | undefined) {
    const showTooltip = ref(false);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function onMouseEnter() {
        // Clear any existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        // Only show tooltip if text is provided
        const text = typeof tooltipText === "string" ? tooltipText : tooltipText?.value;
        if (text) {
            timeoutId = setTimeout(() => {
                showTooltip.value = true;
            }, tooltipDelay.value);
        }
    }

    function onMouseLeave() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        showTooltip.value = false;
    }

    // Cleanup on unmount
    onUnmounted(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    });

    return {
        showTooltip,
        onMouseEnter,
        onMouseLeave,
    };
}




