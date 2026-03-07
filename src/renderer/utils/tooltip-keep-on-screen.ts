// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

/**
 * Clamps PrimeVue tooltip position so it stays within the viewport.
 * PrimeVue positions tooltips centered on the trigger and only flips placement;
 * it does not shift horizontally, so tooltips can extend off the screen.
 * This observer runs after tooltips are added and clamps their left/top.
 */

const VIEWPORT_PADDING_PX = 8;

function clampTooltipPosition(tooltip: HTMLElement): void {
    const rect = tooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = VIEWPORT_PADDING_PX;

    let { left, top } = rect;
    const width = rect.width;
    const height = rect.height;

    left = Math.max(padding, Math.min(left, vw - width - padding));
    top = Math.max(padding, Math.min(top, vh - height - padding));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function processTooltip(tooltip: HTMLElement): void {
    requestAnimationFrame(() => {
        clampTooltipPosition(tooltip);
    });
}

export function initTooltipKeepOnScreen(): void {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length === 0) continue;
            mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement) {
                    if (node.classList.contains("p-tooltip")) {
                        processTooltip(node);
                    }
                    node.querySelectorAll?.(".p-tooltip").forEach((el) => {
                        if (el instanceof HTMLElement) processTooltip(el);
                    });
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
