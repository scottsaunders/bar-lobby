---
phase: 3
slug: screen-design-ia
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-04
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | grep-based structural analysis + Vitest ^3.2.4 |
| **Config file** | vitest.config.mts |
| **Quick run command** | `rg "class=\"view\"" --glob "*.vue" -A 1` |
| **Full suite command** | Full grep audit for view structure across views/ |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Visual check of modified screen
- **After every plan wave:** Grep audit for view structure across views/
- **Before `/gsd:verify-work`:** All major screens conform to layout spec
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| Layout spec | 01 | 1 | UX-01 | grep | `rg "class=\"view\"" --glob "*.vue"` | N/A | pending |
| view-title presence | 02 | 1 | UX-01 | grep | Audit view files for view-title | N/A | pending |
| Design system usage | 03 | 2 | UX-01 | manual | Code review | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. UX-01 validation is structural (grep) and manual (visual consistency). No new test files required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Layout consistency across screens | UX-01 | Visual assessment | Load each major screen, verify layout matches spec |
| Navigation hierarchy consistent | UX-01 | Subjective | Verify breadcrumbs/nav patterns across deep routes |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity maintained
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
