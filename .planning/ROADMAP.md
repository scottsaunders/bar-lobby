# Roadmap: BAR Lobby

## Overview

This roadmap takes the client from current state (slow load, i18n key leakage, startup errors) to a design-led, consistent UX: fix foundation (i18n, performance, stability), harden the design system, design all screens with consistent IA, then add selective functionality so designed flows work.

## Phases

- [ ] **Phase 1: Foundation** — i18n, load performance, and startup stability so the client is reliable
- [x] **Phase 2: Design System** — Harden and document the design system; Styles tab as source of truth (completed 2026-03-04)
- [x] **Phase 3: Screen Design & IA** — Design all screens; iterate layouts and information architecture
 (completed 2026-03-04)
- [ ] **Phase 4: Selective Functionality** — Build enough real behavior so designed flows work

## Phase Details

### Phase 1: Foundation
**Goal:** Users see correct text (no i18n keys), the client loads quickly, and startup/setup runs without errors.  
**Depends on:** Nothing  
**Requirements:** I18N-01, PERF-01, STAB-01  
**Success Criteria:**
  1. No localization keys visible in UI; English (or set locale) displays correctly
  2. App load time is acceptable (measurably improved)
  3. Initial setup and loading complete without errors  
**Plans:** TBD (e.g. i18n fix, load profiling and fixes, startup error handling)

Plans:
- [ ] 01-01: TBD (e.g. Fix i18n key leakage; ensure vue-i18n wired with English default)
- [ ] 01-02: TBD (e.g. Profile and improve load performance)
- [ ] 01-03: TBD (e.g. Identify and fix initial setup/loading errors)

### Phase 2: Design System
**Goal:** Design system is consistent, documented, and the Styles tab is the single source of truth.  
**Depends on:** Phase 1  
**Requirements:** DS-01  
**Success Criteria:**
  1. Styles tab reflects all reusable components and tokens
  2. New or refactored screens use design system components and utilities consistently
  3. Conventions documented (e.g. in .cursorrules or design doc)  
**Plans:** 6 plans

Plans:
- [x] 02-01-PLAN.md — Typography + spacing migration: battle components (16 files)
- [x] 02-02-PLAN.md — Typography + spacing migration: views & pages (9 files)
- [x] 02-03-PLAN.md — Typography + spacing migration: nav, map, social & notification components (12 files)
- [x] 02-04-PLAN.md — Typography + spacing migration: common, controls & misc components (13 files)
- [x] 02-05-PLAN.md — Native element replacement: buttons & inputs (7 files)
- [x] 02-06-PLAN.md — !important triage + Styles tab completeness (17 files)

### Phase 3: Screen Design & IA
**Goal:** All client screens designed with consistent layout and information architecture; faked data OK.  
**Depends on:** Phase 2  
**Requirements:** UX-01  
**Success Criteria:**
  1. All major screens have defined layout and IA
  2. Navigation and hierarchy are consistent
  3. Design system is applied across screens  
**Plans:** 4/4 plans complete

Plans:
- [x] 03-01-PLAN.md — Layout spec + _views.scss foundation; View Shell section in Styles tab
- [x] 03-02-PLAN.md — Play screens alignment (remove inline styles, standardize view-container)
- [x] 03-03-PLAN.md — Library + Watch screens alignment (commands→view-container, maps, replays)
- [ ] 03-04-PLAN.md — News + Profile + Breadcrumbs + human verification

### Phase 4: Selective Functionality
**Goal:** Enough real functionality so designed flows work (navigation, real data where it serves design).  
**Depends on:** Phase 3  
**Requirements:** FUNC-01  
**Success Criteria:**
  1. Designed flows are usable with real or stubbed behavior where agreed
  2. No regression to foundation (i18n, performance, stability)  
**Plans:** TBD

Plans:
- [ ] 04-01: TBD (e.g. Wire real data or navigation for priority flows)
- [ ] 04-02: TBD (e.g. Remove or replace faked data where design is locked)

---
*Roadmap created: 2025-03-03*
