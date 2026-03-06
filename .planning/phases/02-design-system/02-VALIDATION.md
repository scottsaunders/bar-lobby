---
phase: 2
slug: design-system
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | grep-based static analysis (rg/ripgrep) + Vitest ^3.2.4 |
| **Config file** | vitest.config.mts |
| **Quick run command** | `rg "font-size:" --glob "*.vue" --glob "!**/styles/**" --glob "!**/new-styles.vue" -c` |
| **Full suite command** | See per-requirement commands below |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run grep audit on modified files only
- **After every plan wave:** Run full grep audit across all `.vue` files
- **Before `/gsd:verify-work`:** Full suite must show zero violations in migrated files
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| Typography migration | 01 | 1 | DS-01 | grep | `rg "font-size:" --glob "*.vue" --glob "!**/styles/**" --glob "!**/new-styles.vue"` | N/A | pending |
| Spacing migration | 02 | 1 | DS-01 | grep | `rg "(padding\|margin\|gap):\s*\d+px" --glob "*.vue" --glob "!**/styles/**" --glob "!**/new-styles.vue"` | N/A | pending |
| Component replacement | 03 | 2 | DS-01 | grep | `rg "<button" --glob "*.vue" --glob "!**/new-styles.vue" --glob "!**/Button.vue"` | N/A | pending |
| Styles tab completeness | 04 | 2 | DS-01 | manual | Load app, navigate to Styles tab | manual | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. DS-01 validation is structural/static analysis via grep, not runtime behavior testing. No new test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Styles tab renders all components/tokens | DS-01 | Visual layout check | Load app → Styles → verify all sections visible |
| No visual regressions from token mapping | DS-01 | Subjective visual assessment | Compare before/after screenshots of key screens |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
