import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import VueRouter from "unplugin-vue-router/vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
            "@main": path.join(__dirname, "src/main"),
            "@renderer": path.join(__dirname, "src/renderer"),
            "@preload": path.join(__dirname, "src/preload"),
            $: path.join(__dirname, "vendor"),
        },
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Split vendor libraries into separate chunks
                    if (id.includes("node_modules")) {
                        if (id.includes("vue") || id.includes("vue-router")) {
                            return "vue-vendor";
                        }
                        if (id.includes("primevue")) {
                            return "primevue-vendor";
                        }
                        if (id.includes("@iconify")) {
                            return "iconify-vendor";
                        }
                        return "vendor";
                    }
                    // Keep route components in their own chunks for better caching
                    if (id.includes("/views/")) {
                        const viewMatch = id.match(/\/views\/([^/]+)/);
                        if (viewMatch) {
                            return `view-${viewMatch[1]}`;
                        }
                    }
                },
            },
        },
    },
    optimizeDeps: {
        entries: ["src/renderer/**/*.vue", "src/renderer/**/*.ts", "src/renderer/**/*.js"],
        esbuildOptions: {
            target: "esnext",
        },
    },
    css: {
        modules: false,
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@renderer/styles/_utils.scss";`,
            },
        },
    },
    plugins: [
        vueDevTools(),
        VueRouter({
            routesFolder: "src/renderer/views",
            dts: "src/renderer/typed-router.d.ts",
        }),
        vue(),
    ],
});
