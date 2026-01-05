<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<route lang="json5">
{ meta: { title: "Tutorial", hide: true, transition: { name: "slide-left" } } }
</route>

<template>
    <div class="view">
        <div class="view-container">
            <div class="view-title">
                <div class="flex-row flex-center-items gap-md">
                    <Button class="icon" @click="goBack">
                        <Icon :icon="arrowLeftIcon" height="24" />
                    </Button>
                    <div>
                        <h1>Tutorial Campaign</h1>
                        <p>Learn the basics of Beyond All Reason</p>
                    </div>
                </div>
            </div>
            
            <div class="tutorial-layout flex-col gap-xl flex-grow">
                <!-- Tutorial Progress -->
                <Panel class="progress-panel padding-xl">
                    <div class="flex-col gap-md">
                        <div class="flex-row flex-center-items gap-md">
                            <Icon :icon="schoolIcon" height="32" />
                            <h2 class="title-2">Your Progress</h2>
                            <span class="caption-1">{{ completedLessons }}/{{ totalLessons }} lessons completed</span>
                        </div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                        </div>
                    </div>
                </Panel>

                <!-- Tutorial Lessons -->
                <div class="lessons-grid">
                    <div 
                        v-for="(lesson, index) in lessons" 
                        :key="lesson.id"
                        class="lesson-card"
                        :class="{ locked: lesson.locked, completed: lesson.completed }"
                        @click="!lesson.locked && startLesson(lesson.id)"
                    >
                        <div class="lesson-icon">
                            <Icon v-if="lesson.completed" :icon="checkIcon" height="32" />
                            <Icon v-else-if="lesson.locked" :icon="lockIcon" height="32" />
                            <Icon v-else :icon="lesson.icon" height="32" />
                        </div>
                        <div class="lesson-info">
                            <h3 class="subtitle-1">Lesson {{ index + 1 }}: {{ lesson.title }}</h3>
                            <p class="body-2">{{ lesson.description }}</p>
                            <div class="lesson-meta caption-1">
                                <span>{{ lesson.duration }} min</span>
                                <span v-if="lesson.completed" class="completed-badge">✓ Completed</span>
                            </div>
                        </div>
                        <Button 
                            v-if="!lesson.locked" 
                            :class="lesson.completed ? 'grey' : 'green'"
                            @click.stop="startLesson(lesson.id)"
                        >
                            {{ lesson.completed ? 'Replay' : 'Start' }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import arrowLeftIcon from "@iconify-icons/mdi/arrow-left";
import schoolIcon from "@iconify-icons/mdi/school";
import checkIcon from "@iconify-icons/mdi/check-circle";
import lockIcon from "@iconify-icons/mdi/lock";
import hammerIcon from "@iconify-icons/mdi/hammer";
import tankIcon from "@iconify-icons/mdi/tank";
import lightningIcon from "@iconify-icons/mdi/lightning-bolt";
import shieldIcon from "@iconify-icons/mdi/shield";
import targetIcon from "@iconify-icons/mdi/crosshairs";
import strategyIcon from "@iconify-icons/mdi/chess-knight";

import Button from "@renderer/components/controls/Button.vue";
import Panel from "@renderer/components/common/Panel.vue";
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();
const router = useRouter();

// Mock tutorial data
const lessons = ref([
    {
        id: 1,
        title: "Basic Controls",
        description: "Learn how to move the camera, select units, and issue commands",
        duration: 5,
        icon: hammerIcon,
        locked: false,
        completed: false
    },
    {
        id: 2,
        title: "Building Your Base",
        description: "Construct your first structures and manage economy",
        duration: 8,
        icon: hammerIcon,
        locked: false,
        completed: false
    },
    {
        id: 3,
        title: "Unit Production",
        description: "Build your first army and understand unit types",
        duration: 7,
        icon: tankIcon,
        locked: true,
        completed: false
    },
    {
        id: 4,
        title: "Resource Management",
        description: "Master metal and energy production",
        duration: 10,
        icon: lightningIcon,
        locked: true,
        completed: false
    },
    {
        id: 5,
        title: "Combat Basics",
        description: "Engage in your first battle and learn combat mechanics",
        duration: 12,
        icon: targetIcon,
        locked: true,
        completed: false
    },
    {
        id: 6,
        title: "Defense Strategies",
        description: "Build defenses and protect your base",
        duration: 10,
        icon: shieldIcon,
        locked: true,
        completed: false
    },
    {
        id: 7,
        title: "Advanced Tactics",
        description: "Learn flanking, raiding, and strategic positioning",
        duration: 15,
        icon: strategyIcon,
        locked: true,
        completed: false
    }
]);

const totalLessons = computed(() => lessons.value.length);
const completedLessons = computed(() => lessons.value.filter(l => l.completed).length);
const progressPercent = computed(() => (completedLessons.value / totalLessons.value) * 100);

function goBack() {
    router.push("/play/campaign");
}

function startLesson(lessonId: number) {
    console.log(`Starting lesson ${lessonId}`);
    // TODO: Implement actual lesson start logic
}
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "@renderer/styles/spacing" as *;

.view-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0 map.get($spacing, "xxl") map.get($spacing, "sm") map.get($spacing, "xxl");
    overflow: hidden;
    box-sizing: border-box;
}



.tutorial-layout {
    min-height: 0;
    overflow-y: auto;
}

.progress-panel {
    flex-shrink: 0;
}

.progress-bar-large {
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border-radius: 6px;
    transition: width 0.3s ease;
}

.lessons-grid {
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "md");
    padding-bottom: map.get($spacing, "xl");
}

.lesson-card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: map.get($spacing, "lg");
    display: flex;
    align-items: center;
    gap: map.get($spacing, "lg");
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(.locked) {
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateX(4px);
        box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
    }
    
    &.locked {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    &.completed {
        border-color: rgba(34, 197, 94, 0.3);
        
        .lesson-icon {
            color: #22c55e;
        }
    }
}

.lesson-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.lesson-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: map.get($spacing, "xs");
    
    h3 {
        margin: 0;
    }
    
    p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
    }
}

.lesson-meta {
    display: flex;
    gap: map.get($spacing, "md");
    color: rgba(255, 255, 255, 0.6);
    margin-top: map.get($spacing, "xs");
}

.completed-badge {
    color: #22c55e;
}
</style>
