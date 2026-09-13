# Brøns Human Performance

Static HTML/CSS/JavaScript app. Phase 1 retains the original dark green design, nutrition, mobility, rehab, mental content and previous baseline calculator, and adds a dashboard and Strength 2.0.

## Structure

- `index.html`: app shell and existing content.
- `assets/legacy.css`, `assets/legacy.js`: extracted original design and behavior, with duplicate touch-handler and baseline history fixes.
- `assets/programs.js`: agreed A/B/C/Home exercises, prescriptions and pure session helpers.
- `assets/storage.js`: versioned local persistence and backup, isolated from `styrke_v4`.
- `assets/performance.js`, `assets/performance.css`: dashboard and strength interaction/layout.

Serve the repository with any static HTTP server; ES modules require HTTP(S). No build or external JavaScript dependencies. Run `npm test` with Node 22+; restricted environments can use `node --test --test-isolation=none tests/strength.test.js` on Node 24.

## Training and persistence

A includes squat 3×5–6, deadlift 2×3–5, bench 3×6–8 and pulldown 3×6–10. B is push/unilateral; C uses RDL and additional posterior-chain work. Home is the agreed dumbbell replacement session. The latest agreed A/B/C set counts take precedence over earlier versions. The first four exercises are marked core as a phase-1 implementation choice; remaining exercises are optional extras. Durations are approximate, not guaranteed.

Start a session, enter weight, reps/distance/time and RIR, mark performed sets, then finish. Drafts persist independently per program. Only checked valid sets enter history. New sessions prefill previous weights, never previous completion. Dashboard totals count saved sessions, including partial sessions. Week mode records Lotus/non-Lotus context without modifying any running plan. The pause timer is accurate across background throttling but does not survive page reload.

Strength 2.0 uses `human_performance_v1`. It does not migrate or overwrite `styrke_v4`; legacy data can be viewed and included verbatim in JSON backup. The existing baseline calculator still uses its existing key. Its age/bodyweight multipliers are explicitly labelled as an unvalidated earlier model, not measured lift performance. Row/pulldown history now matches the calculator. Backup restoration UI is a later phase.

Data stays in the current browser and origin. No account, cloud sync, service worker, automatic Intervals import or new validated benchmark system is included in phase 1. Export before clearing browser data. Corrupt/future-version Strength 2.0 data fails closed and can be exported without overwriting its original bytes.

## Intervals.icu boundary

Intervals.icu remains the coach's source of truth and retains its existing watch integration. Any future Human Performance integration must be read-only: never create/edit/delete workouts, activities, zones, settings or device connections. This app currently makes no Intervals API requests and contains no credentials or private activity data.

Candidate imported data: completed activities (date, sport, distance, duration, pace, HR, load, elevation), planned workouts (date, title, duration, target structure), and wellness (sleep, resting HR, HRV, weight, steps). Preserve source IDs, units, local date/time and planned/completed distinction; deduplicate matched workouts and activities. Treat missing fields as unknown, not zero.

The official [Open API overview](https://www.intervals.icu/features/open-api/) documents activity downloads, wellness data and OAuth with granular scopes. A later integration should request only read scopes and keep credentials outside this public static repository, behind an authenticated service. No connection or permission changes were made in phase 1.

## Verification

Automated tests cover agreed prescriptions, set validation, draft carryover, local date/week boundaries, preservation of legacy bytes, corrupt/future-version data and storage failures. Browser checks cover starting, validation, logging, draft reload, finishing, history, core filtering and desktop/mobile layout. Existing nutrition/mobility/mental screens are retained; this phase does not revalidate their training or nutrition claims.

Work is on `codex/human-performance-strength-2`, branched from main commit `6e57bb117e4f398afaac6a45f93b5ac69f2a75d5`. Do not merge or deploy without explicit approval.
