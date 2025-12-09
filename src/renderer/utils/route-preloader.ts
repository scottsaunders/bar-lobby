// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import type { Router } from "vue-router";

/**
 * Preloads commonly visited routes to improve first-time load performance.
 * Routes are preloaded in the background after a short delay to avoid blocking initial render.
 */
export function preloadCommonRoutes(router: Router) {
    // Common routes that users are likely to visit
    const commonRoutes = [
        "/play/menu",
        "/play/skirmishVsAi",
        "/play/scenarios",
        "/library/maps",
        "/watch/replays",
        "/news/overview",
    ];

    // Preload routes after a short delay to avoid blocking initial render
    setTimeout(() => {
        const currentPath = router.currentRoute.value.path;
        
        commonRoutes.forEach((path) => {
            // Skip if already on this route
            if (path === currentPath) return;
            
            try {
                // Use router.resolve to get the route and trigger component loading
                const route = router.resolve(path);
                if (route && route.matched.length > 0) {
                    // Access the matched routes to trigger lazy loading
                    route.matched.forEach((matched) => {
                        if (matched.components) {
                            // Trigger lazy loading by accessing the component functions
                            Object.values(matched.components).forEach((component) => {
                                if (component && typeof component === "function") {
                                    // Call the lazy loader function to preload
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
        });
    }, 1000); // Wait 1 second after app load to start preloading
}

