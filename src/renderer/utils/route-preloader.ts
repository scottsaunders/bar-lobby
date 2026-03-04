// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { Router } from "vue-router";

/**
 * Preloads all registered route chunks so navigation is instant once the user is in the client.
 * Iterates over every route in the router (instead of a hardcoded list) so new views are
 * automatically covered.
 */
export function preloadCommonRoutes(router: Router): Promise<void> {
    const promises: Promise<unknown>[] = [];

    for (const route of router.getRoutes()) {
        if (route.components) {
            for (const component of Object.values(route.components)) {
                if (component && typeof component === "function") {
                    promises.push(
                        (component as () => Promise<unknown>)().catch(() => {
                            // Silently fail — route chunk may not exist or may already be loaded
                        })
                    );
                }
            }
        }
    }

    return Promise.all(promises).then(() => {});
}

