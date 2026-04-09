<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "New Styles", order: 2, transition: { name: "slide-left" } } }
</route>

<template>
    <Panel class="flex-grow style-panel" no-padding>
        <div class="scroll-container main-panel-scroll">
            <div class="scroll-content flex-col gap-xl padding-xxl">
                <!-- Design System Constants Section -->
                <div class="flex-col gap-md">
                    <h2>Design System Constants</h2>
                    
                    <div class="flex-col gap-md">
                        <div class="flex-col gap-sm">
                            <h3>Spacing Scale</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>xxs</code> = <span class="constant-value">2px</span>
                                </div>
                                <div class="constant-item">
                                    <code>xs</code> = <span class="constant-value">4px</span>
                                </div>
                                <div class="constant-item">
                                    <code>sm</code> = <span class="constant-value">8px</span>
                                </div>
                                <div class="constant-item">
                                    <code>md</code> = <span class="constant-value">12px</span>
                                </div>
                                <div class="constant-item">
                                    <code>lg</code> = <span class="constant-value">16px</span>
                                </div>
                                <div class="constant-item">
                                    <code>xl</code> = <span class="constant-value">24px</span>
                                </div>
                                <div class="constant-item">
                                    <code>xxl</code> = <span class="constant-value">32px</span>
                                </div>
                                <div class="constant-item">
                                    <code>xxxl</code> = <span class="constant-value">48px</span>
                                </div>
                                <div class="constant-item">
                                    <code>xxxxl</code> = <span class="constant-value">56px</span>
                                </div>
                                <p class="body-2">Available classes: <code>gap-*</code>, <code>padding-*</code>, <code>margin-*</code>, <code>padding-top-*</code>, <code>padding-right-*</code>, <code>padding-bottom-*</code>, <code>padding-left-*</code>, <code>margin-top-*</code>, etc.</p>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Typography Scale</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>.display</code> = <span class="constant-value">68px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.large-title</code> = <span class="constant-value">40px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.title-1</code> = <span class="constant-value">32px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.title-2</code> = <span class="constant-value">28px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.title-3</code> = <span class="constant-value">24px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.subtitle-1</code> = <span class="constant-value">20px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.subtitle-2</code> = <span class="constant-value">16px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.subtitle-2-stronger</code> = <span class="constant-value">16px Bold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.body-1</code> = <span class="constant-value">16px Regular</span> (Montserrat) - Default body copy
                                </div>
                                <div class="constant-item">
                                    <code>.body-1-strong</code> = <span class="constant-value">16px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.body-2</code> = <span class="constant-value">14px Regular</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.body-2-strong</code> = <span class="constant-value">14px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.body-2-stronger</code> = <span class="constant-value">14px Bold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.caption-1</code> = <span class="constant-value">12px Regular</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.caption-1-strong</code> = <span class="constant-value">12px Semibold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.caption-1-stronger</code> = <span class="constant-value">12px Bold</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.caption-2</code> = <span class="constant-value">10px Regular</span> (Montserrat)
                                </div>
                                <div class="constant-item">
                                    <code>.caption-2-strong</code> = <span class="constant-value">10px Semibold</span> (Montserrat)
                                </div>
                                <p class="body-2" style="margin-top: 10px;">Heading mappings: <code>h1</code> = Large Title, <code>h2</code> = Title 1, <code>h3</code> = Title 2, <code>h4</code> = Title 3, <code>h5</code> = Subtitle 1, <code>h6</code> = Subtitle 2, <code>p</code> = Body 1 Regular</p>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Button Colors</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>blue</code> = <span class="constant-value">rgb(37, 99, 235)</span> <span class="color-swatch" style="background-color: rgb(37, 99, 235);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>red</code> = <span class="constant-value">rgb(165, 30, 30)</span> <span class="color-swatch" style="background-color: rgb(165, 30, 30);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>green</code> = <span class="constant-value">rgb(34, 197, 94)</span> <span class="color-swatch" style="background-color: rgb(34, 197, 94);"></span> <span class="caption-1">(#22c55e)</span>
                                </div>
                                <div class="constant-item">
                                    <code>yellow</code> = <span class="constant-value">rgb(243, 213, 79)</span> <span class="color-swatch" style="background-color: rgb(243, 213, 79);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>purple</code> = <span class="constant-value">rgb(199, 14, 199)</span> <span class="color-swatch" style="background-color: rgb(199, 14, 199);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>orange</code> = <span class="constant-value">rgb(199, 109, 14)</span> <span class="color-swatch" style="background-color: rgb(199, 109, 14);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>black</code> = <span class="constant-value">rgb(0, 0, 0)</span> <span class="color-swatch" style="background-color: rgb(0, 0, 0); border: 1px solid rgba(255, 255, 255, 0.3);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>white</code> = <span class="constant-value">rgb(255, 255, 255)</span> <span class="color-swatch" style="background-color: rgb(255, 255, 255); border: 1px solid rgba(0, 0, 0, 0.3);"></span>
                                </div>
                                <div class="constant-item">
                                    <code>grey</code> = <span class="constant-value">rgb(128, 128, 128)</span> <span class="color-swatch" style="background-color: rgb(128, 128, 128);"></span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Alert/Notification Colors</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>default/info</code> = <span class="constant-value">linear-gradient(to bottom, rgb(84, 94, 110), rgb(63, 69, 99))</span>
                                </div>
                                <div class="constant-item">
                                    <code>error</code> = <span class="constant-value">linear-gradient(to bottom, rgb(204, 22, 22), rgb(155, 0, 0))</span>
                                </div>
                                <div class="constant-item">
                                    <code>warning</code> = <span class="constant-value">linear-gradient(to bottom, rgb(216, 168, 11), rgb(167, 124, 6))</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Text Colors</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>.txt-error</code> = <span class="constant-value">rgb(255, 100, 100)</span> <span class="color-swatch" style="background-color: rgb(255, 100, 100);"></span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Tooltip Colors</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>background</code> = <span class="constant-value">#222</span> <span class="color-swatch" style="background-color: #222;"></span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Panel Defaults</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>default padding</code> = <span class="constant-value">30px</span>
                                </div>
                                <div class="constant-item">
                                    <code>background</code> = <span class="constant-value">linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))</span>
                                </div>
                                <div class="constant-item">
                                    <code>border</code> = <span class="constant-value">1px solid rgba(255, 255, 255, 0.2)</span>
                                </div>
                                <div class="constant-item">
                                    <code>border-top</code> = <span class="constant-value">1px solid rgba(255, 255, 255, 0.3)</span>
                                </div>
                                <div class="constant-item">
                                    <code>border-bottom</code> = <span class="constant-value">1px solid rgba(124, 124, 124, 0.3)</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Global Root Variables</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>--background</code> = <span class="constant-value">#000</span>
                                </div>
                                <div class="constant-item">
                                    <code>color</code> = <span class="constant-value">#fff</span>
                                </div>
                                <div class="constant-item">
                                    <code>font-family</code> = <span class="constant-value">Montserrat, sans-serif</span>
                                </div>
                                <div class="constant-item">
                                    <code>font-size</code> = <span class="constant-value">16px</span>
                                </div>
                                <div class="constant-item">
                                    <code>text-shadow</code> = <span class="constant-value">1px 1px 0 rgba(0, 0, 0, 0.6)</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Scrollbar</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>width</code> = <span class="constant-value">10px</span>
                                </div>
                                <div class="constant-item">
                                    <code>track</code> = <span class="constant-value">rgba(0, 0, 0, 0.2)</span>
                                </div>
                                <div class="constant-item">
                                    <code>thumb</code> = <span class="constant-value">rgba(255, 255, 255, 0.1)</span>
                                </div>
                                <div class="constant-item">
                                    <code>thumb-hover</code> = <span class="constant-value">rgba(255, 255, 255, 0.2)</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Other Constants</h3>
                            <div class="design-constants">
                                <div class="constant-item">
                                    <code>border-radius (buttons)</code> = <span class="constant-value">2px</span>
                                </div>
                                <div class="constant-item">
                                    <code>border-radius (tooltips, panels)</code> = <span class="constant-value">3px</span>
                                </div>
                                <div class="constant-item">
                                    <code>selection background</code> = <span class="constant-value">rgba(255, 255, 255, 0.3)</span>
                                </div>
                                <div class="constant-item">
                                    <code>divider/hr</code> = <span class="constant-value">rgba(255, 255, 255, 0.1)</span>, height: <span class="constant-value">1px</span>
                                </div>
                                <div class="constant-item">
                                    <code>special green gradient</code> = <span class="constant-value">linear-gradient(90deg, #22c55e, #16a34a)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Layout Utilities Section -->
                <div class="flex-col gap-md">
                    <h2>Layout Utilities</h2>

                    <div class="flex-col gap-lg">
                        <div class="flex-col gap-sm">
                            <h3>Flex Direction</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.flex-row</code> — <span class="constant-value">display: flex; flex-direction: row</span></div>
                                <div class="constant-item"><code>.flex-col</code> — <span class="constant-value">display: flex; flex-direction: column</span></div>
                            </div>
                            <div class="layout-demo flex-row gap-sm">
                                <div class="layout-demo-box">A</div>
                                <div class="layout-demo-box">B</div>
                                <div class="layout-demo-box">C</div>
                                <span class="caption-1 flex-center-items">.flex-row .gap-sm</span>
                            </div>
                            <div class="layout-demo flex-col gap-sm" style="max-width: 200px;">
                                <div class="layout-demo-box">A</div>
                                <div class="layout-demo-box">B</div>
                                <div class="layout-demo-box">C</div>
                                <span class="caption-1">.flex-col .gap-sm</span>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Flex Behavior</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.flex-grow</code> — <span class="constant-value">flex-grow: 1</span></div>
                                <div class="constant-item"><code>.flex-shrink</code> — <span class="constant-value">flex-shrink: 1</span></div>
                                <div class="constant-item"><code>.flex-none</code> — <span class="constant-value">flex: none</span></div>
                                <div class="constant-item"><code>.flex-wrap</code> — <span class="constant-value">flex-wrap: wrap</span></div>
                                <div class="constant-item"><code>.flex-nowrap</code> — <span class="constant-value">flex-wrap: nowrap</span></div>
                            </div>
                            <div class="layout-demo flex-row gap-sm">
                                <div class="layout-demo-box">Fixed</div>
                                <div class="layout-demo-box flex-grow">flex-grow</div>
                                <div class="layout-demo-box">Fixed</div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Flex Alignment</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.flex-center</code> — <span class="constant-value">justify-content: center; align-items: center</span></div>
                                <div class="constant-item"><code>.flex-center-items</code> — <span class="constant-value">align-items: center</span></div>
                                <div class="constant-item"><code>.flex-center-content</code> — <span class="constant-value">justify-content: center</span></div>
                                <div class="constant-item"><code>.flex-center-self</code> — <span class="constant-value">align-self: center</span></div>
                                <div class="constant-item"><code>.flex-space-between</code> — <span class="constant-value">justify-content: space-between</span></div>
                                <div class="constant-item"><code>.flex-space-around</code> — <span class="constant-value">justify-content: space-around</span></div>
                                <div class="constant-item"><code>.flex-justify-start</code> — <span class="constant-value">justify-content: flex-start</span></div>
                                <div class="constant-item"><code>.flex-justify-end</code> — <span class="constant-value">justify-content: flex-end</span></div>
                                <div class="constant-item"><code>.flex-align-start</code> — <span class="constant-value">align-items: flex-start</span></div>
                                <div class="constant-item"><code>.flex-align-end</code> — <span class="constant-value">align-items: flex-end</span></div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Flex Positioning</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.flex-left</code> — <span class="constant-value">margin-right: auto</span> (push to left)</div>
                                <div class="constant-item"><code>.flex-right</code> — <span class="constant-value">margin-left: auto</span> (push to right)</div>
                                <div class="constant-item"><code>.flex-top</code> — <span class="constant-value">margin-bottom: auto</span> (push to top)</div>
                                <div class="constant-item"><code>.flex-bottom</code> — <span class="constant-value">margin-top: auto</span> (push to bottom)</div>
                            </div>
                            <div class="layout-demo flex-row gap-sm">
                                <div class="layout-demo-box flex-left">flex-left</div>
                                <div class="layout-demo-box flex-right">flex-right</div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Gap Utilities</h3>
                            <p class="body-2">All spacing tokens work as gap classes: <code>.gap-{size}</code></p>
                            <div class="flex-col gap-md">
                                <div v-for="size in ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']" :key="size" class="flex-row flex-center-items gap-md">
                                    <code class="gap-label">.gap-{{ size }}</code>
                                    <div class="flex-row" :class="`gap-${size}`">
                                        <div class="layout-demo-box-small"></div>
                                        <div class="layout-demo-box-small"></div>
                                        <div class="layout-demo-box-small"></div>
                                        <div class="layout-demo-box-small"></div>
                                        <div class="layout-demo-box-small"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Size Utilities</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.fullwidth</code> — <span class="constant-value">width: 100%</span></div>
                                <div class="constant-item"><code>.fullheight</code> — <span class="constant-value">height: 100%</span></div>
                                <div class="constant-item"><code>.fullsize</code> — <span class="constant-value">position: absolute; width: 100%; height: 100%; display: flex; flex-direction: column</span></div>
                                <div class="constant-item"><code>.min-height-0</code> — <span class="constant-value">min-height: 0</span> (flex overflow fix)</div>
                                <div class="constant-item"><code>.flex-shrink-0</code> — <span class="constant-value">flex-shrink: 0</span> (prevent shrinking)</div>
                            </div>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Scroll Container</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.scroll-container</code> — <span class="constant-value">Flex-based scrollable container (height: 0; overflow-y: auto; flex-grow: 1)</span></div>
                                <div class="constant-item"><code>.scroll-container.main-panel-scroll</code> — <span class="constant-value">Scroll container with top/bottom fade mask</span></div>
                            </div>
                            <p class="body-2">Requires all ancestor elements to fill their height (<code>flex-col flex-grow fullheight</code>).</p>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>Other Utilities</h3>
                            <div class="design-constants">
                                <div class="constant-item"><code>.gridform</code> — <span class="constant-value">CSS Grid: auto | minmax(300px, 2fr) with sm row-gap and xl column-gap</span></div>
                                <div class="constant-item"><code>.hide-overflow</code> — <span class="constant-value">overflow: hidden</span></div>
                                <div class="constant-item"><code>.relative</code> — <span class="constant-value">position: relative</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- View Shell & Layout Section -->
                <div class="flex-col gap-md">
                    <h2>View Shell & Layout</h2>
                    <div class="flex-col gap-lg">
                        <div class="flex-col gap-sm">
                            <h3>Structure</h3>
                            <p class="body-2">All content screens use: <code>view</code> → <code>view-container</code> → <code>view-title</code> (h1 + optional p) → content</p>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>Canonical Padding</h3>
                            <p class="body-2"><code>view-container</code> uses <code>0 xxl sm xxl</code> (top right bottom left) via <code>map.get($spacing, ...)</code> in _views.scss.</p>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>Exceptions</h3>
                            <p class="body-2"><code>menu.vue</code> — no view-title, hero layout; <code>index.vue</code> — meta.empty, no NavBar.</p>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>Rules</h3>
                            <p class="body-2">All content screens get view-title except menu and index. Use design system <code>gap-*</code>, <code>padding-*</code>, <code>flex-row</code>, <code>flex-col</code>. Avoid inline styles on view root.</p>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>Layout Patterns</h3>
                            <p class="body-2 caption-1">Two-panel (list + detail), grid of tiles, single-column. See 03-RESEARCH.md for patterns.</p>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Typography Section -->
                <div class="flex-col gap-md">
                    <h2>Typography</h2>
                    <div class="flex-col gap-sm">
                        <div>
                            <div class="display">Display</div>
                            <span class="typography-spec">68px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="large-title">Large Title</div>
                            <span class="typography-spec">40px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="title-1">Title 1</div>
                            <span class="typography-spec">32px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="title-2">Title 2</div>
                            <span class="typography-spec">28px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="title-3">Title 3</div>
                            <span class="typography-spec">24px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="subtitle-1">Subtitle 1</div>
                            <span class="typography-spec">20px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="subtitle-2">Subtitle 2</div>
                            <span class="typography-spec">16px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="subtitle-2-stronger">Subtitle 2 Stronger</div>
                            <span class="typography-spec">16px Bold (Montserrat)</span>
                        </div>
                        <div>
                            <p class="body-1">Body 1</p>
                            <span class="typography-spec caption-1">16px Regular (Montserrat) - Default paragraph</span>
                        </div>
                        <div>
                            <div class="body-1-strong">Body 1 Strong</div>
                            <span class="typography-spec caption-1">16px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <p class="body-2">Body 2</p>
                            <span class="typography-spec caption-1">14px Regular (Montserrat)</span>
                        </div>
                        <div>
                            <div class="body-2-strong">Body 2 Strong</div>
                            <span class="typography-spec caption-1">14px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="body-2-stronger">Body 2 Stronger</div>
                            <span class="typography-spec caption-1">14px Bold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="caption-1">Caption 1</div>
                            <span class="typography-spec">12px Regular (Montserrat)</span>
                        </div>
                        <div>
                            <div class="caption-1-strong">Caption 1 Strong</div>
                            <span class="typography-spec">12px Semibold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="caption-1-stronger">Caption 1 Stronger</div>
                            <span class="typography-spec">12px Bold (Montserrat)</span>
                        </div>
                        <div>
                            <div class="caption-2">Caption 2</div>
                            <span class="typography-spec">10px Regular (Montserrat)</span>
                        </div>
                        <div>
                            <div class="caption-2-strong">Caption 2 Strong</div>
                            <span class="typography-spec">10px Semibold (Montserrat)</span>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Buttons Section -->
                <div class="flex-col gap-md">
                    <h2>Buttons</h2>
                    
                    <!-- Slim Buttons -->
                    <div class="flex-col gap-sm">
                        <h3>Slim</h3>
                        <div class="flex-row gap-md flex-center-items flex-wrap">
                            <Button class="blue slim">Primary</Button>
                            <Button class="grey slim">Secondary</Button>
                            <Button class="black slim tertiary">Tertiary</Button>
                            <Button class="green slim">Positive</Button>
                            <Button class="red slim">Alert</Button>
                            <Button disabled class="slim">Disabled</Button>
                        </div>
                    </div>

                    <!-- Small Buttons (default size) -->
                    <div class="flex-col gap-sm">
                        <h3>Small</h3>
                        <div class="flex-row gap-md flex-center-items flex-wrap">
                            <Button class="blue text-shadow">Primary</Button>
                            <Button class="grey text-shadow">Secondary</Button>
                            <Button class="black text-shadow tertiary">Tertiary</Button>
                            <Button class="green text-shadow">Positive</Button>
                            <Button class="red text-shadow">Alert</Button>
                            <Button disabled class="text-shadow">Disabled</Button>
                            <div class="download-button-wrapper">
                                <div
                                    class="download-button"
                                    :class="{
                                        'download-button--small': true,
                                        'download-button--ready': downloadButtonState.small.isReady.value,
                                        'download-button--downloading': downloadButtonState.small.isDownloading.value,
                                        'download-button--default': !downloadButtonState.small.isReady.value && !downloadButtonState.small.isDownloading.value
                                    }"
                                >
                                    <!-- Progress bar overlay during download -->
                                    <div
                                        v-if="downloadButtonState.small.isDownloading.value"
                                        class="download-button__progress"
                                        :style="{ width: `${downloadButtonState.small.progress.value * 100}%` }"
                                    ></div>
                                    <!-- Button text -->
                                    <span class="download-button__text body-1-strong">
                                        <span v-if="downloadButtonState.small.isReady.value">Ready</span>
                                        <span v-else-if="downloadButtonState.small.isDownloading.value">Downloading...</span>
                                        <span v-else>Download</span>
                                    </span>
                                    <!-- Click handler -->
                                    <button
                                        v-if="downloadButtonState.small.isReady.value"
                                        class="download-button__clickable"
                                        @click="resetDownloadDemo('small')"
                                    ></button>
                                    <button
                                        v-else
                                        class="download-button__clickable"
                                        @click="startDownloadDemo('small')"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Large Buttons -->
                    <div class="flex-col gap-sm">
                        <h3>Large</h3>
                        <div class="flex-row gap-md flex-center-items flex-wrap">
                            <Button class="blue text-shadow large">Primary</Button>
                            <Button class="grey text-shadow large">Secondary</Button>
                            <Button class="black text-shadow tertiary large">Tertiary</Button>
                            <Button class="green text-shadow large">Positive</Button>
                            <Button class="red text-shadow large">Alert</Button>
                            <div class="download-button-wrapper">
                                <div
                                    class="download-button"
                                    :class="{
                                        'download-button--large': true,
                                        'download-button--ready': downloadButtonState.large.isReady.value,
                                        'download-button--downloading': downloadButtonState.large.isDownloading.value,
                                        'download-button--default': !downloadButtonState.large.isReady.value && !downloadButtonState.large.isDownloading.value
                                    }"
                                >
                                    <!-- Progress bar overlay during download -->
                                    <div
                                        v-if="downloadButtonState.large.isDownloading.value"
                                        class="download-button__progress"
                                        :style="{ width: `${downloadButtonState.large.progress.value * 100}%` }"
                                    ></div>
                                    <!-- Button text -->
                                    <span class="download-button__text subtitle-1">
                                        <span v-if="downloadButtonState.large.isReady.value">Ready</span>
                                        <span v-else-if="downloadButtonState.large.isDownloading.value">Downloading...</span>
                                        <span v-else>Download</span>
                                    </span>
                                    <!-- Click handler -->
                                    <button
                                        v-if="downloadButtonState.large.isReady.value"
                                        class="download-button__clickable"
                                        @click="resetDownloadDemo('large')"
                                    ></button>
                                    <button
                                        v-else
                                        class="download-button__clickable"
                                        @click="startDownloadDemo('large')"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Other Buttons -->
                    <div class="flex-col gap-sm">
                        <h3>Other</h3>
                        <div class="flex-row gap-md flex-center-items flex-wrap">
                            <div 
                                class="close-button"
                                v-tooltip.bottom="{ value: 'Close' }"
                            >
                                <Icon :icon="closeThick" height="25" />
                            </div>
                            <Button 
                                tooltip="Back"
                                :show-tooltip="true"
                                class="grey text-shadow"
                            >
                                <Icon :icon="arrow_back" height="40" />
                            </Button>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Interactive Tile Section -->
                <div class="flex-col gap-md">
                    <h2>Interactive Tile</h2>
                    <div class="flex-row gap-md" style="height: 192px">
                        <div style="width: 300px">
                            <InteractiveTile textPersistent>
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                                <template #content>
                                    <h3>Persistent Text</h3>
                                    <p class="body-1">Text stays on hover</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile textFade>
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                                <template #content>
                                    <h3>Fade Text</h3>
                                    <p class="body-1">Text fades on hover</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile>
                                <template #content>
                                    <h3>Tile without Image</h3>
                                    <p class="body-1">Just text content here</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile>
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile>
                                <template #media>
                                    <div :style="`background-image: url('/src/renderer/assets/images/backgrounds/5.jpg')`"></div>
                                </template>
                                <template #content>
                                    <h3>Background Image</h3>
                                    <p class="body-1">Using background-image style</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile>
                                <template #media>
                                    <video autoplay loop muted playsinline>
                                        <source src="/src/renderer/assets/videos/intros/placeholder_intro.mp4" type="video/mp4" />
                                    </video>
                                </template>
                                <template #content>
                                    <h3>Video Background</h3>
                                    <p class="body-1">Animated video background</p>
                                </template>
                            </InteractiveTile>
                        </div>
                    </div>
                    <div class="flex-row gap-md" style="height: 192px; margin-top: 24px">
                        <div style="width: 300px">
                            <InteractiveTile saturate>
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                                <template #content>
                                    <h3>Saturation Transition</h3>
                                    <p class="body-1">Desaturated by default, saturates on hover</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile saturate :selected="true">
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                                <template #content>
                                    <h3>Selected with Saturation</h3>
                                    <p class="body-1">Green highlight + saturation</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile :selected="true">
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                                <template #content>
                                    <h3>Selected (No Saturation)</h3>
                                    <p class="body-1">Green highlight only</p>
                                </template>
                            </InteractiveTile>
                        </div>
                        <div style="width: 300px">
                            <InteractiveTile readMoreVariant>
                                <template #media>
                                    <img src="/src/renderer/assets/images/backgrounds/5.jpg" />
                                </template>
                                <template #content>
                                    <h3>Read More Variant</h3>
                                    <p class="body-1">Hover to see more content</p>
                                </template>
                                <template #body>
                                    <p class="body-1">This is body copy that appears on hover with a darker black overlay. The title fades away and this content fades in along with a "Read More" button. The text is left-aligned for better readability.</p>
                                </template>
                            </InteractiveTile>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Status Card Section -->
                <div class="flex-col gap-md">
                    <h2>Status Card</h2>
                    <p class="body-1">Use for: Displaying status information, conditions, alerts, or key-value pairs with color-coded variants. Each card shows a label and value with semantic color coding.</p>
                    <div class="flex-col gap-md" style="max-width: 600px;">
                        <div class="flex-col gap-sm">
                            <h3>Variants</h3>
                            <div class="flex-col gap-sm">
                                <StatusCard variant="victory" label="Victory Condition" value="Destroy all enemy units" />
                                <StatusCard variant="lose" label="Lose Condition" value="Lose all production facilities" />
                                <StatusCard variant="success" label="Status" value="Operation successful" />
                                <StatusCard variant="error" label="Error" value="Connection failed" />
                                <StatusCard variant="warning" label="Warning" value="Low resources detected" />
                                <StatusCard variant="info" label="Information" value="System update available" />
                            </div>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>With Slots</h3>
                            <p class="body-2">StatusCard supports slots for custom label and value content:</p>
                            <StatusCard variant="victory">
                                <template #label>Custom Label</template>
                                <template>Custom value with <strong>HTML content</strong></template>
                            </StatusCard>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Badge Section -->
                <div class="flex-col gap-md">
                    <h2>Badge</h2>
                    <p class="body-1">Use for: Small labels, tags, status indicators, difficulty levels, or metadata. Badges are compact, inline elements that provide additional context.</p>
                    <div class="flex-col gap-md" style="max-width: 600px;">
                        <div class="flex-col gap-sm">
                            <h3>Variants</h3>
                            <div class="flex-row gap-md flex-center-items">
                                <Badge>Default</Badge>
                                <Badge variant="primary">Primary</Badge>
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="error">Error</Badge>
                            </div>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>Usage Examples</h3>
                            <div class="flex-col gap-sm">
                                <div class="flex-row gap-md flex-center-items">
                                    <span class="body-1">Difficulty:</span>
                                    <Badge>Easy</Badge>
                                    <Badge variant="warning">Medium</Badge>
                                    <Badge variant="error">Hard</Badge>
                                </div>
                                <div class="flex-row gap-md flex-center-items">
                                    <span class="body-1">Status:</span>
                                    <Badge variant="success">Online</Badge>
                                    <Badge>Offline</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Scrolling Text Panel Section -->
                <div class="flex-col gap-md">
                    <h2>Scrolling Text Panel</h2>
                    <p class="body-1">Use for: Scrollable text content within a contained panel. Features a dark background container with border and a fade effect at the bottom to indicate scrollable content.</p>
                    <div class="flex-col gap-md" style="max-width: 600px;">
                        <div class="flex-col gap-sm">
                            <h3>Basic Usage</h3>
                            <div style="height: 200px; width: 100%;">
                                <ScrollingTextPanel>
                                    <div class="flex-col gap-md">
                                        <p class="body-1">This is a scrolling text panel. When the content exceeds the available height, it becomes scrollable with a fade effect at the bottom.</p>
                                        <p class="body-1">The panel has a dark background (rgba(0, 0, 0, 0.3)) and a subtle border to contain the content visually.</p>
                                        <p class="body-1">You can add any content inside using slots, including markdown, formatted text, or other components.</p>
                                    </div>
                                </ScrollingTextPanel>
                            </div>
                        </div>
                        <div class="flex-col gap-sm">
                            <h3>With More Content (Scrollable)</h3>
                            <div style="height: 200px; width: 100%;">
                                <ScrollingTextPanel>
                                    <div class="flex-col gap-md">
                                        <p class="body-1">This example demonstrates the scrolling behavior when there's more content than can fit in the visible area.</p>
                                        <p class="body-1">As you scroll down, you'll notice the fade effect at the bottom becomes more apparent.</p>
                                        <p class="body-1">The panel automatically handles overflow and provides smooth scrolling.</p>
                                        <p class="body-1">This is additional content to demonstrate scrolling.</p>
                                        <p class="body-1">More paragraphs help visualize how the scrollable area works.</p>
                                        <p class="body-1">The fade effect at the bottom indicates there's more content below.</p>
                                        <p class="body-1">This is the last paragraph in this example.</p>
                                    </div>
                                </ScrollingTextPanel>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Inputs Section -->
                <div class="flex-col gap-md">
                    <h2>Inputs</h2>
                    <div class="gridform standardized-inputs">
                        <div class="subtitle-2">Textbox</div>
                        <Textbox v-model="textValue" placeholder="Enter text..." />

                        <div class="subtitle-2">Textbox (Label)</div>
                        <Textbox v-model="textValue" label="With Label" />

                        <div class="subtitle-2">Textbox (Disabled)</div>
                        <Textbox v-model="textValue" disabled />

                        <div class="subtitle-2">Number</div>
                        <Number v-model="numValue" :min="0" :max="100" />

                        <div class="subtitle-2">SearchBox</div>
                        <SearchBox v-model="searchValue" />

                        <div class="subtitle-2">Textarea</div>
                        <Textarea v-model="areaValue" placeholder="Multi-line text..." />
                    </div>
                </div>

                <Divider />

                <!-- Selection Controls -->
                <div class="flex-col gap-md">
                    <h2>Selection Controls</h2>
                    <div class="gridform standardized-inputs">
                        <div class="subtitle-2">Select (Dropdown)</div>
                        <Select
                            v-model="selectedValue"
                            :options="selectOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select an option"
                        />

                        <div class="subtitle-2">Select (Filter)</div>
                        <Select
                            v-model="selectedFilterValue"
                            :options="selectOptions"
                            optionLabel="label"
                            optionValue="value"
                            filter
                            placeholder="Search options..."
                        />

                        <div class="subtitle-2">Checkbox</div>
                        <div class="flex-row gap-md">
                            <Checkbox v-model="checked" label="Check me" />
                            <Checkbox v-model="checkedNoLabel" />
                            <Checkbox v-model="checkedDisabled" label="Disabled" disabled />
                        </div>

                        <div class="subtitle-2">Toggle Switch</div>
                        <div class="flex-row gap-md">
                            <ToggleSwitch v-model="toggleChecked" />
                        </div>

                        <div class="subtitle-2">Radio Buttons (Circular)</div>
                        <div class="radio-button-list">
                            <div
                                v-for="option in radioButtonOptions"
                                :key="option.value"
                                class="radio-button-item"
                                :class="{ selected: radioButtonValue === option.value }"
                                @click="radioButtonValue = option.value"
                            >
                                <div class="radio-button-circle">
                                    <div v-if="radioButtonValue === option.value" class="radio-button-dot"></div>
                                </div>
                                <span class="radio-button-label">{{ option.label }}</span>
                            </div>
                        </div>

                        <div class="subtitle-2">Radio Buttons (Square)</div>
                        <div class="radio-button-list">
                            <div
                                v-for="option in radioButtonOptions"
                                :key="'square-' + option.value"
                                class="radio-button-item"
                                :class="{ selected: radioButtonValueSquare === option.value }"
                                @click="radioButtonValueSquare = option.value"
                            >
                                <div class="radio-button-square">
                                    <div v-if="radioButtonValueSquare === option.value" class="radio-button-check"></div>
                                </div>
                                <span class="radio-button-label">{{ option.label }}</span>
                            </div>
                        </div>

                        <div class="subtitle-2">Segmented Controller</div>
                        <Options v-model="radioValue" :options="['Option A', 'Option B', 'Option C']" />

                        <div class="subtitle-2">Range Slider</div>
                        <Range v-model="rangeValue" :min="0" :max="100" />

                        <div class="subtitle-2">Double Range Slider</div>
                        <Range v-model="doubleRangeValue" :min="0" :max="100" range />
                    </div>
                </div>

                <Divider />

                <!-- Panels Section -->
                <div class="flex-col gap-md">
                    <h2>Panels</h2>
                    <div class="flex-col gap-md">
                        <div class="flex-col gap-sm">
                            <h3>1. Content Panel (Default)</h3>
                            <p class="body-1">Use for: Main content areas, primary sections, card-like containers. This is the standard panel with gradient background and blur effect.</p>
                            <Panel class="flex-grow" style="min-height: 96px;">
                                <div class="flex-col gap-sm">
                                    <p class="body-1">This is a default content panel.</p>
                                    <p class="body-1">Background: rgba(0, 0, 0, 0.5) gradient with backdrop-filter blur(10px)</p>
                                </div>
                            </Panel>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>2. Nested Panel (Secondary Content)</h3>
                            <p class="body-1">Use for: Secondary content within a panel, grouped sections, nested information. Same style as Content Panel but nested for visual hierarchy.</p>
                            <Panel class="flex-grow" style="min-height: 96px;">
                                <div class="flex-col gap-sm">
                                    <p class="body-1">Outer Content Panel</p>
                                    <Panel style="min-height: 56px;">
                                        <p class="body-1">Nested Panel - Secondary content within a panel</p>
                                    </Panel>
                                </div>
                            </Panel>
                        </div>

                        <div class="flex-col gap-sm">
                            <h3>3. Modal Overlay + Modal Panel</h3>
                            <p class="body-1">Use for: Dialog boxes, popups, confirmations. The overlay dims the background, and the modal panel appears on top.</p>
                            <div class="modal-demo-container" style="position: relative; height: 448px; border: 1px dashed rgba(255, 255, 255, 0.3); overflow: visible;">
                                <div class="modal-overlay-demo" style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; overflow: visible;">
                                    <Panel class="modal-panel-demo" no-padding style="width: 450px; max-height: 416px; display: flex; flex-direction: column;">
                                        <template #header>
                                            <div class="modal-title subtitle-1">Modal Title</div>
                                            <div class="modal-close">
                                                <Icon :icon="closeThick" height="23" />
                                            </div>
                                        </template>
                                        <div class="modal-content-scrollable flex-col gap-md padding-xl">
                                            <div class="flex-col gap-md">
                                                <h4 class="modal-section-header subtitle-2">Section Header</h4>
                                                <p class="modal-body-copy body-1">
                                                    This is body copy text used in modals. It provides detailed information, descriptions, or instructions to the user. Body copy should be clear, concise, and easy to read.
                                                </p>
                                                <p class="modal-body-copy body-1">
                                                    Additional paragraphs of body copy can be added to provide more context or details about the modal's purpose or content.
                                                </p>
                                            </div>
                                            <div class="flex-col gap-md">
                                                <h4 class="modal-section-header">Another Section</h4>
                                                <p class="modal-body-copy body-1">
                                                    Modal content can be organized into multiple sections, each with its own header and body copy. This helps structure information clearly.
                                                </p>
                                                <p class="modal-body-copy body-1">
                                                    When modal content becomes lengthy, the content area should scroll while keeping the header and close button fixed at the top. This ensures users can always access the close button regardless of scroll position.
                                                </p>
                                            </div>
                                            <div class="flex-col gap-md">
                                                <h4 class="modal-section-header">Third Section</h4>
                                                <p class="modal-body-copy body-1">
                                                    This section demonstrates how scrolling works when there is more content than can fit in the visible area. As you scroll down, you'll notice the header remains fixed at the top.
                                                </p>
                                                <p class="modal-body-copy body-1">
                                                    The scrollable area uses the standard 30px padding that matches other panels throughout the application, ensuring visual consistency across all components.
                                                </p>
                                            </div>
                                            <div class="flex-col gap-md">
                                                <h4 class="modal-section-header">Fourth Section</h4>
                                                <p class="modal-body-copy body-1">
                                                    Continuing to add more content helps visualize how the modal handles longer forms, detailed information, or extensive lists. The scrolling behavior should feel smooth and natural.
                                                </p>
                                                <p class="modal-body-copy body-1">
                                                    Notice how the content flows naturally and the header stays accessible. This pattern works well for settings dialogs, information modals, and forms that require more vertical space.
                                                </p>
                                            </div>
                                            <div class="flex-col gap-md">
                                                <h4 class="modal-section-header">Final Section</h4>
                                                <p class="modal-body-copy body-1">
                                                    This is the last section of content in the modal demo. By the time you reach this point, you should have scrolled past the initial viewport, demonstrating that the header remains fixed while the content scrolls smoothly.
                                                </p>
                                                <p class="modal-body-copy body-1">
                                                    The modal maintains its structure and usability even with extensive content, making it suitable for a wide variety of use cases throughout the application.
                                                </p>
                                            </div>
                                        </div>
                                    </Panel>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Progress Section -->
                <div class="flex-col gap-md">
                    <h2>Progress</h2>
                    <div class="flex-col gap-sm">
                        <h3>Standard Progress</h3>
                        <p class="body-1">Use for: Download progress, loading states, completion indicators. Shows progress from 0% to 100%.</p>
                        <div class="flex-col gap-md" style="width: 100%; max-width: 500px;">
                            <div class="flex-col gap-sm">
                                <span class="body-1">0% - Empty</span>
                                <Progress :percent="0" :height="16" />
                            </div>
                            <div class="flex-col gap-sm">
                                <span class="text-sm">25% - Quarter</span>
                                <Progress :percent="0.25" :height="16" />
                            </div>
                            <div class="flex-col gap-sm">
                                <span class="text-sm">50% - Half</span>
                                <Progress :percent="0.5" :height="16" />
                            </div>
                            <div class="flex-col gap-sm">
                                <span class="text-sm">75% - Three Quarters</span>
                                <Progress :percent="0.75" :height="16" />
                            </div>
                            <div class="flex-col gap-sm">
                                <span class="text-sm">100% - Complete</span>
                                <Progress :percent="1" :height="16" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex-col gap-sm">
                        <h3>Progress with Text</h3>
                        <p class="body-1">Progress bars can display text overlay showing the percentage or status.</p>
                        <div class="flex-col gap-md" style="width: 100%; max-width: 500px;">
                            <Progress :percent="0.42" text="42%" :height="16" />
                            <Progress :percent="0.67" text="67%" :height="16" />
                            <Progress :percent="0.89" text="89%" :height="16" />
                        </div>
                    </div>
                    
                    <div class="flex-col gap-sm">
                        <h3>Themed Progress</h3>
                        <p class="body-1">Themed progress bars use a yellow/green gradient, typically for download operations.</p>
                        <div class="flex-col gap-md" style="width: 100%; max-width: 500px;">
                            <Progress :percent="0.5" themed :height="16" />
                            <Progress :percent="0.75" themed text="75%" :height="16" />
                        </div>
                    </div>
                    
                    <div class="flex-col gap-sm">
                        <h3>Pulsating Progress</h3>
                        <p class="body-1">Pulsating animation indicates active loading or processing.</p>
                        <div class="flex-col gap-md" style="width: 100%; max-width: 500px;">
                            <Progress :percent="0.5" pulsating :height="16" />
                            <Progress :percent="0.5" pulsating text="Loading..." :height="16" />
                        </div>
                    </div>
                    
                    <div class="flex-col gap-sm">
                        <h3>Different Heights</h3>
                        <p class="body-1">Progress bars can be customized with different heights for various contexts.</p>
                        <div class="flex-col gap-md" style="width: 100%; max-width: 500px;">
                            <div class="flex-col gap-sm">
                                <span class="body-1">Height: 8px</span>
                                <Progress :percent="0.6" :height="8" />
                            </div>
                            <div class="flex-col gap-sm">
                                <span class="body-1">Height: 16px (Default)</span>
                                <Progress :percent="0.6" :height="16" />
                            </div>
                            <div class="flex-col gap-sm">
                                <span class="body-1">Height: 32px</span>
                                <Progress :percent="0.6" :height="32" text="60%" />
                            </div>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Loader Section -->
                <div class="flex-col gap-md">
                    <h2>Loader</h2>
                    <div class="flex-col gap-sm">
                        <h3>Loading Spinner</h3>
                        <p class="body-1">Use for: Loading states, async operations, data fetching. The loader appears centered on the screen or within a container.</p>
                        <div style="position: relative; height: 192px; border: 1px dashed rgba(255, 255, 255, 0.3);">
                            <Loader />
                        </div>
                    </div>
                    
                    <div class="flex-col gap-sm">
                        <h3>Loader in Container</h3>
                        <p class="body-1">Loader without absolute positioning, for inline use within content areas.</p>
                        <div class="flex-row gap-md flex-center-items" style="padding: 20px; border: 1px dashed rgba(255, 255, 255, 0.3);">
                            <Loader :absolute-position="false" />
                            <span class="body-1">Loading content...</span>
                        </div>
                    </div>
                </div>

                <Divider />

                <!-- Accordion Section -->
                <div class="flex-col gap-md">
                    <h2>Accordion</h2>
                    <div class="flex-col gap-sm">
                        <h3>Multiple Open Sections</h3>
                        <p class="body-1">Use for: Grouping related content, collapsible lists, expandable sections. Multiple sections can be open simultaneously.</p>
                        <div style="width: 100%; max-width: 600px;">
                            <Accordion multiple>
                                <AccordionTab header="Outgoing Requests">
                                    <div class="flex-col gap-sm">
                                        <p class="body-1">Friend requests you've sent</p>
                                        <p class="body-1">This section shows pending friend requests that you have initiated.</p>
                                    </div>
                                </AccordionTab>
                                <AccordionTab header="Incoming Requests">
                                    <div class="flex-col gap-sm">
                                        <p class="body-1">Friend requests you've received</p>
                                        <p class="body-1">This section shows friend requests from other users waiting for your response.</p>
                                    </div>
                                </AccordionTab>
                                <AccordionTab header="Blocked Users">
                                    <div class="flex-col gap-sm">
                                        <p class="body-1">Users you've blocked</p>
                                        <p class="body-1">This section displays users you have blocked from contacting you.</p>
                                    </div>
                                </AccordionTab>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Panel>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import closeThick from "@iconify-icons/mdi/close-thick";
import arrowLeft from "@iconify-icons/mdi/arrow-left";
import arrowRight from "@iconify-icons/mdi/arrow-right";
import arrow_back from "@iconify-icons/mdi/arrow-back";
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
import InteractiveTile from "@renderer/components/common/InteractiveTile.vue";
import StatusCard from "@renderer/components/common/StatusCard.vue";
import Badge from "@renderer/components/common/Badge.vue";
import ScrollingTextPanel from "@renderer/components/common/ScrollingTextPanel.vue";
import ToggleSwitch from "@renderer/components/controls/ToggleSwitch.vue";
import Progress from "@renderer/components/common/Progress.vue";
import Loader from "@renderer/components/common/Loader.vue";
import Accordion from "@renderer/components/common/Accordion.vue";
import AccordionTab from "primevue/accordiontab";

// State for inputs
const textValue = ref("");
const numValue = ref(42);
const searchValue = ref("");
const areaValue = ref("");
const selectedValue = ref(1);
const selectedFilterValue = ref(1);
const checked = ref(false);
const toggleChecked = ref(false);
const checkedNoLabel = ref(false);
const checkedDisabled = ref(false);
const radioButtonValue = ref("option1");
const radioButtonValueSquare = ref("option1");
const radioValue = ref("Option A");
const rangeValue = ref(50);
const doubleRangeValue = ref([20, 80]);

const radioButtonOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
];

const selectOptions = [
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 },
    { label: "Option 3", value: 3 },
    { label: "Long Option Name That Might Wrap", value: 4 },
];

// Download button demo state - separate state for each button
const downloadButtonState = {
    small: {
        isDownloading: ref(false),
        isReady: ref(false),
        progress: ref(0),
        interval: null as ReturnType<typeof setInterval> | null
    },
    large: {
        isDownloading: ref(false),
        isReady: ref(false),
        progress: ref(0),
        interval: null as ReturnType<typeof setInterval> | null
    }
};

function startDownloadDemo(size: 'small' | 'large') {
    const state = downloadButtonState[size];
    state.isDownloading.value = true;
    state.isReady.value = false;
    state.progress.value = 0;
    
    if (state.interval) {
        clearInterval(state.interval);
    }
    
    state.interval = setInterval(() => {
        state.progress.value += 0.02; // Increment by 2% each interval
        if (state.progress.value >= 1) {
            state.progress.value = 1;
            state.isDownloading.value = false;
            state.isReady.value = true;
            if (state.interval) {
                clearInterval(state.interval);
                state.interval = null;
            }
        }
    }, 100); // Update every 100ms (total ~5 seconds)
}

function resetDownloadDemo(size: 'small' | 'large') {
    const state = downloadButtonState[size];
    state.isDownloading.value = false;
    state.isReady.value = false;
    state.progress.value = 0;
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
    }
}

onUnmounted(() => {
    // Clean up download button intervals
    if (downloadButtonState.small.interval) {
        clearInterval(downloadButtonState.small.interval);
    }
    if (downloadButtonState.large.interval) {
        clearInterval(downloadButtonState.large.interval);
    }
});
</script>

<style lang="scss">
// Range Slider text alignment
.p-slider-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50% !important; // Force center alignment
}
</style>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;
// Using global .main-panel-scroll class now


.gridform {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 10px;
    align-items: center;
}

h2 {
    padding-bottom: 5px;
}

.typography-spec {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
    font-family: monospace;
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
    height: 72px; // Set height on Control wrapper (includes border with box-sizing: border-box)
    .p-button {
        padding: 0 24px; // Triple padding for large buttons
        height: 100%;
    }
}

// Regular button (apply to all buttons that aren't large and aren't slim)
:deep(.button:not(.large):not(.slim)) {
    height: 48px; // Set height on Control wrapper (includes border with box-sizing: border-box)
    min-height: 48px;
    .p-button {
        padding: 0 16px; // Double padding for small buttons
        height: 100%;
        min-height: 48px;
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
        font-family: inherit;
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

// Native button with quick-play-button class (for Ready state)
button.quick-play-button {
    align-self: center;
    font-family: inherit;
    font-weight: bold;
    font-size: 1.4rem;
    padding: 10px 40px;
    color: #fff;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border: none;
    border-radius: 2px;
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
    text-transform: uppercase;

    &:hover {
        box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
    }

    &::before {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200%;
        height: 200%;
        background: rgba(255, 255, 255, 0.2);
        transform: translate(-50%, -50%) scale(0);
        border-radius: 50%;
        transition: transform 0.4s ease;
    }

    &:hover::before {
        transform: translate(-50%, -50%) scale(1);
    }
}

// Quick Download Button
:deep(.button.quick-download-button) {
    .p-button {
        font-family: inherit;
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
        font-family: inherit;
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

// Standardize input heights
.standardized-inputs {
    :deep(.control),
    :deep(.p-inputtext),
    :deep(.p-dropdown) {
        height: 32px;
        .p-dropdown-label {
            display: flex;
            align-items: center;
        }
    }

    :deep(.options) {
        height: 32px;
    }

    :deep(.textarea .control) {
        height: auto; // Textareas should grow
    }
}

// Radio Button List
.radio-button-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 300px;
    width: 100%;
}

.radio-button-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    height: 32px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    &.selected {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
    }
}

.radio-button-circle {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    
    .radio-button-item.selected & {
        border-color: rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.radio-button-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

.radio-button-label {
    color: rgba(255, 255, 255, 0.9);
    user-select: none;
    
    .radio-button-item.selected & {
        color: #fff;
        text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.6);
    }
}

// Square Radio Button
.radio-button-square {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    
    .radio-button-item.selected & {
        border-color: rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.radio-button-check {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

// Download button demo
.download-button-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
}

.download-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: capitalize; // Title Case
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.15); // Unified border
    border-radius: 2px; // Unified corner radius
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.6); // Unified text shadow
    box-sizing: border-box; // Include border in height calculation
    
    // Size variants - match regular and large button sizes
    &--small {
        padding: 0 16px; // Double padding for small buttons
        width: 180px; // Fixed width to accommodate "Downloading..."
        min-height: 48px; // Match regular button height
        height: 48px;
    }
    
    &--large {
        padding: 0 24px; // Triple padding for large buttons
        width: 220px; // Fixed width to accommodate "Downloading..."
        height: 72px; // Match large button height
    }
    
    // State: Default (Red - Download) - use solid rgba color matching danger button
    &--default {
        background-color: rgba(165, 30, 30, 0.6); // Match red button color
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05); // Standard inset shadow
        
        &:hover {
            background-color: rgba(165, 30, 30, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
    }
    
    // State: Downloading (Grey with progress fill) - use standard shadow
    &--downloading {
        background-color: rgba(107, 114, 128, 0.6);
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        
        &:hover {
            background-color: rgba(107, 114, 128, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
    }
    
    // State: Ready (Green) - use solid rgba color matching success button
    &--ready {
        background-color: rgba(34, 197, 94, 0.6); // Match green button color (#22c55e)
        box-shadow:
            1px 1px 3px rgba(49, 47, 47, 0.1),
            inset 0 -17px 0 rgba(0, 0, 0, 0.05); // Standard inset shadow
        
        &:hover {
            background-color: rgba(34, 197, 94, 0.8);
            box-shadow:
                1px 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 -17px 0 rgba(0, 0, 0, 0.05);
        }
        
        &:active {
            transform: translateY(1px);
        }
    }
    
    // Progress bar fill during download - grey color
    &__progress {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(107, 114, 128, 0.6); // Grey progress bar
        transition: width 0.1s ease;
        z-index: 1;
    }
    
    // Text overlay - scale down if text doesn't fit
    &__text {
        position: relative;
        z-index: 2;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        width: 100%;
        text-align: center;
    }
    
    // Scale down text for downloading state to ensure it fits
    &--downloading &__text {
        font-size: 0.85em; // Scale down "Downloading..." to fit
    }
    
    // Small button specific scaling for downloading
    &--small {
        &.download-button--downloading &__text {
            font-size: 0.75em; // More scaling for small button
        }
    }
    
    // Large button specific scaling for downloading  
    &--large {
        &.download-button--downloading &__text {
            font-size: 0.9em; // Less scaling needed for large button
        }
    }
    
    // Invisible clickable overlay
    &__clickable {
        position: absolute;
        inset: 0;
        z-index: 3;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        margin: 0;
    }
    
    // Active state (when button is pressed/down)
    &:active {
        transform: translateY(1px);
    }
    
    // Active state for ready state specifically
    &--ready:active {
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        transform: translateY(1px);
    }
}

// Modal Panel Demo Styles
.modal-panel-demo {
    background: rgba(0, 0, 0, 0.5) !important;
    
    :deep(.header) {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0; // Prevent header from shrinking
    }
    
    :deep(.content) {
        overflow-y: auto;
        flex: 1;
        min-height: 0; // Allow content to shrink and scroll
        
        // Fade effect only at the bottom (top stays cut off by header)
        mask-image: linear-gradient(
            to bottom,
            black 0%,
            black calc(100% - 20px),
            transparent 100%
        );
        -webkit-mask-image: linear-gradient(
            to bottom,
            black 0%,
            black calc(100% - 20px),
            transparent 100%
        );
    }
}

.modal-title {
    padding: 5px 10px;
    flex-grow: 1;
    text-transform: capitalize;
    font-size: 20px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
}

.modal-close {
    display: flex;
    margin-left: auto;
    padding: 5px 10px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: rgba(219, 20, 20, 0.6);
    }
}

.modal-section-header {
    font-size: 16px;
    font-weight: 600;
    font-family: Montserrat, sans-serif;
    margin: 0;
    padding: 0;
}

.modal-body-copy {
    margin: 0;
    padding: 0;
    color: rgba(255, 255, 255, 0.9);
}

.modal-content-scrollable {
    height: 100%;
}

// Design Constants Section
.design-constants {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 15px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.constant-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    
    code {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 13px;
        color: #fff;
    }
    
    .constant-value {
        color: rgba(255, 255, 255, 0.7);
        font-weight: normal;
    }
}

.color-swatch {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    vertical-align: middle;
    margin-left: 5px;
}

// Layout Utilities demo styles
.layout-demo {
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    padding: map.get($spacing, "sm");
}
.layout-demo-box {
    background: rgba(100, 150, 255, 0.2);
    border: 1px solid rgba(100, 150, 255, 0.4);
    border-radius: 2px;
    padding: map.get($spacing, "xs") map.get($spacing, "sm");
    text-align: center;
    min-width: 40px;
}
.layout-demo-box-small {
    width: 20px;
    height: 20px;
    background: rgba(100, 150, 255, 0.3);
    border: 1px solid rgba(100, 150, 255, 0.5);
    border-radius: 2px;
}
.gap-label {
    min-width: 80px;
    text-align: right;
}

</style>
