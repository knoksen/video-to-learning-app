# PWA Plan (Future Work)

## Status
Planned only. Not implemented in MVP.

## Why deferred
The project is currently backend-first (M1). A production-ready frontend (M2) is required before meaningful PWA work can begin.

## Proposed milestone
- Start after M2 frontend is stable.

## Scope proposal
1. Add web app manifest and app icons.
2. Implement service worker for offline shell + cache strategy.
3. Add installability checks and UX prompts.
4. Define offline behavior and stale-data messaging.
5. Add Lighthouse PWA validation to CI when workflow exists.

## Risks and constraints
- No fake PWA claims before actual frontend implementation.
- Browser cache strategy must avoid serving stale trust-critical report data.

## Exit criteria
- Frontend routes function offline for shell pages.
- Manifest and service worker are valid.
- Install prompt works in supported browsers.
- PWA audit passes agreed thresholds.
