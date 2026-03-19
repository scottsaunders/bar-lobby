// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { Directive } from "vue";

const MIN_FONT_SIZE = 6; // px — never go below this

// Shared canvas for text measurement — created once, reused across all calls.
// canvas.measureText() gives fractional pixel widths and requires no DOM layout.
let _ctx: CanvasRenderingContext2D | null = null;
function getCtx(): CanvasRenderingContext2D | null {
    if (!_ctx) _ctx = document.createElement("canvas").getContext("2d");
    return _ctx;
}

// WeakMap so cache entries are GC'd when elements are unmounted
const cache = new WeakMap<HTMLElement, { key: string; result: string }>();

export const vFitText: Directive<HTMLElement> = {
    mounted: fit,
    updated: fit,
};

function fit(el: HTMLElement): void {
    const parent = el.parentElement;
    if (!parent) return;

    const parentW = parent.clientWidth;
    if (parentW === 0) return; // not yet laid out

    const text = el.textContent ?? "";
    const cacheKey = `${text}|${parentW}`;

    // Cache hit: re-apply stored result without any measurement
    const cached = cache.get(el);
    if (cached?.key === cacheKey) {
        el.style.fontSize = cached.result;
        return;
    }

    const ctx = getCtx();
    if (!ctx) return;

    // Reset to CSS baseline and read font properties once
    el.style.fontSize = "";
    const style = getComputedStyle(el);
    const maxFontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const fontFamily = style.fontFamily;

    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) {
        cache.set(el, { key: cacheKey, result: "" });
        return;
    }

    // Subtract 1px from available width as a safety margin to account for
    // minor differences between canvas measurement and DOM text rendering.
    const targetW = parentW - 1;

    function longestWordWidth(size: number): number {
        ctx!.font = `${fontWeight} ${size}px ${fontFamily}`;
        let max = 0;
        for (const w of words) {
            const ww = ctx!.measureText(w).width;
            if (ww > max) max = ww;
        }
        return max;
    }

    // Fast path: all words already fit at CSS default size
    if (longestWordWidth(maxFontSize) <= targetW) {
        cache.set(el, { key: cacheKey, result: "" });
        return;
    }

    // Binary-search for the largest font size where no word exceeds the chip width.
    // All iterations are pure JS (canvas math) — zero forced DOM layout cycles.
    let lo = MIN_FONT_SIZE;
    let hi = maxFontSize;

    while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        if (longestWordWidth(mid) <= targetW) {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    const result = `${lo}px`;
    el.style.fontSize = result;
    cache.set(el, { key: cacheKey, result });
}
