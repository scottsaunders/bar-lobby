# Requirements: BAR Lobby

**Defined:** 2025-03-03  
**Core Value:** Users see a clear, consistent, and fast client: every screen is designed with the design system, text shows in English (not i18n keys), and the app loads quickly without startup errors.

## v1 Requirements

### Internationalization

- [x] **I18N-01**: User sees English (or correct locale) text in the UI, not localization keys or codes

### Performance & Stability

- [x] **PERF-01**: Client loads in acceptable time (fast; no extremely long load)
- [x] **STAB-01**: Initial setup and loading complete without errors

### Design System

- [x] **DS-01**: Design system is documented and applied consistently; Styles tab is the source of truth for components and tokens

### Screen Design & IA

- [x] **UX-01**: All client screens are designed with consistent layout and information architecture; faked data is acceptable until UX is locked

### Functionality

- [ ] **FUNC-01**: Enough functionality is built so designed flows work (e.g. navigation, real data where it serves design)

## v2 Requirements

Deferred; not in current roadmap.

- Additional language localization (after i18n pipeline is fixed)
- Full server integration for every screen (after UX is locked)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New game modes or protocol features | Focus is UX/UI of existing flows |
| Full backend integration for all screens | Faked data intentional until UX is nailed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| I18N-01 | Phase 1 | Complete |
| PERF-01 | Phase 1 | Complete |
| STAB-01 | Phase 1 | Complete |
| DS-01 | Phase 2 | Complete |
| UX-01 | Phase 3 | Complete |
| FUNC-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0

---
*Requirements defined: 2025-03-03*  
*Last updated: 2025-03-03 after roadmap creation*
