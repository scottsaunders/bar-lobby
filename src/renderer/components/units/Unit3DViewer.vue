<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="viewer-container" ref="containerRef">
        <canvas ref="canvasRef" class="viewer-canvas" />
        <div v-if="state === 'loading'" class="viewer-overlay">
            <div class="body-2" style="opacity: 0.6">Loading 3D model...</div>
        </div>
        <div v-if="state === 'error'" class="viewer-overlay flex-col gap-sm">
            <Icon :icon="cubeIcon" :width="48" :height="48" style="opacity: 0.2" />
            <div class="body-2" style="opacity: 0.4">No 3D model available</div>
        </div>
        <div v-if="state === 'loaded'" class="viewer-hint body-2">
            <Icon :icon="mouseIcon" :width="14" :height="14" /> Drag to rotate · Scroll to zoom
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Icon } from "@iconify/vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import cubeIcon from "@iconify-icons/mdi/cube-outline";
import mouseIcon from "@iconify-icons/mdi/mouse";

const props = defineProps<{ unitName: string }>();

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const state = ref<"loading" | "loaded" | "error">("loading");

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let animFrameId: number | null = null;
let resizeObserver: ResizeObserver | null = null;

function setupScene(canvas: HTMLCanvasElement, container: HTMLDivElement) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 50, 150);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e0, 2.0);
    sun.position.set(80, 120, 60);
    sun.castShadow = true;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8ab4f8, 0.5);
    fill.position.set(-60, 20, -80);
    scene.add(fill);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 10;
    controls.maxDistance = 800;
    controls.target.set(0, 0, 0);
    controls.update();

    resizeObserver = new ResizeObserver(() => {
        if (!renderer || !camera || !container) return;
        const { width, height } = container.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
}

function startRenderLoop() {
    function animate() {
        animFrameId = requestAnimationFrame(animate);
        controls?.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    animate();
}

async function loadModel(unitName: string) {
    if (!scene || !camera || !controls) return;

    // Remove previous model
    const toRemove = scene.children.filter((c) => c.userData.isModel);
    toRemove.forEach((c) => scene!.remove(c));

    state.value = "loading";

    const url = `https://raw.githubusercontent.com/icexuick/BAR-modelviewer/main/${unitName}.glb`;

    try {
        const loader = new GLTFLoader();
        const gltf = await new Promise<{ scene: THREE.Object3D }>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });

        const model = gltf.scene;
        model.userData.isModel = true;

        // Center and scale the model to fit comfortably
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 80;
        const scale = targetSize / (maxDim || 1);

        model.position.sub(center.multiplyScalar(scale));
        model.scale.setScalar(scale);

        // Enable shadows on all meshes
        model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(model);

        // Reposition camera to frame the model
        const scaledSize = size.clone().multiplyScalar(scale);
        const maxScaledDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
        const camDist = maxScaledDim * 2.2;
        camera.position.set(camDist * 0.6, camDist * 0.4, camDist);
        camera.near = camDist * 0.01;
        camera.far = camDist * 10;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.minDistance = camDist * 0.2;
        controls.maxDistance = camDist * 5;
        controls.update();

        state.value = "loaded";
    } catch {
        state.value = "error";
    }
}

function cleanup() {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    resizeObserver?.disconnect();
    controls?.dispose();
    renderer?.dispose();
    renderer = null;
    scene = null;
    camera = null;
    controls = null;
    animFrameId = null;
}

onMounted(async () => {
    const canvas = canvasRef.value;
    const container = containerRef.value;
    if (!canvas || !container) return;

    setupScene(canvas, container);
    startRenderLoop();
    await loadModel(props.unitName);
});

watch(
    () => props.unitName,
    async (newName) => {
        await loadModel(newName);
    }
);

onUnmounted(cleanup);
</script>

<style lang="scss" scoped>
.viewer-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
}

.viewer-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.viewer-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
}

.viewer-hint {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.35;
    white-space: nowrap;
    pointer-events: none;
    font-size: 0.75rem;
}
</style>
