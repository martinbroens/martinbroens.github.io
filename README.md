# Brøns Human Performance

Personal performance platform built as static HTML/CSS/JavaScript modules. Work remains on `codex/human-performance-strength-2`; do not merge or deploy without explicit approval.

## Working features

- Mobile dashboard: strength draft, weekly saved sessions/sets, next goal, primary goal, data status and timeline.
- Strength 2.0: agreed A/B/C/Home program, per-program drafts, weight/reps/distance/time/RIR logging, validation, rest timer, completed-set history and per-exercise progression.
- Generic goal editor: arbitrary type, date/period with precision, priority, status, primary main goal, subgoal links, notes, checkpoints and retained revisions. Passed dates never delete goals; completed/cancelled goals remain in history.
- Running Performance shell separating Performance Data from Emil/Løberlab's Coach Plan. No imported activities or laboratory values are fabricated. Import is not connected.
- Existing nutrition, mobility/rehab and mental content retained. Earlier calculator is collapsed and labelled as an unvalidated model, not measured strength.

Navigation: Overblik / Styrke / Løb / Mål / Mere. Existing modules also have dashboard shortcuts. Current goals are ordinary one-time records in `assets/initial-goals.js`, not race-specific application logic. Valencia has year precision; MDS January 2027 has month precision until exact dates are supplied.

## Structure

- `index.html`: app shell and preserved content.
- `assets/legacy.css`, `assets/legacy.js`: retained design and legacy behavior.
- `assets/programs.js`: prescriptions, validation, dates and exercise snapshots.
- `assets/performance.js`, `assets/performance.css`: strength UI, composition and shared styling.
- `assets/platform.js`: dashboard, goals editor/history, running shell and module navigation.
- `assets/domain.js`: goal rules, timeline, running summaries and exercise history.
- `assets/initial-goals.js`: initial goal records.
- `assets/storage.js`: schema validation, migration and backup.
- `assets/repository.js`: asynchronous repository contract and local adapter.
- `assets/models.d.ts`: future activities, plans, tests, measurements, benchmarks, source and coverage contracts.
- `assets/mental-models.d.ts`: provisional first-class Mental Performance boundaries. Final content, storage and workflows await the validated main-chat specification; the current Mental screen remains a legacy view.
- `ARCHITECTURE.md`: decisions, limitations and future cloud boundary.

## Training and data

A is the full-body foundation. B/C supplement it; Home replaces a gym session. First four exercises retain the existing core/extra split. Durations are approximate. Only checked valid sets enter history. Partial sessions count as saved sessions, not completed entire programs. New drafts carry previous weights, never completion, reps or RIR. Progression shows actual recorded sets without claiming a measured or estimated 1RM.

New modules use an async repository. The implemented adapter still stores only in this browser/origin: phone and computer do not sync. It serializes writes and checks revisions, using Web Locks where supported. Without Web Locks, cross-tab checking is best-effort. Export before clearing browser data.

V2 uses `human_performance_v2`. Valid v1 sessions, drafts and week context migrate while `human_performance_v1` and `styrke_v4` remain intact. Backups contain current state and original raw data. Invalid/future formats are not overwritten. The retained legacy calculator continues using its original key. Restore UI, cloud database, login and offline sync are deferred.

## Intervals boundary

Intervals.icu remains the coach's source of truth and retains its watch integration. Future integration must be read-only: never create/edit/delete workouts, activities, zones, settings or device connections. This app makes no Intervals API requests and contains no credentials, private activity history or lab reports.

Future contracts preserve source IDs, dates/timezones, units, provenance, load method, quality flags, coverage and goal links. Plans and completed activities stay separate. Missing values are unknown, not zero. Lab results and wearable estimates must remain distinguishable. Comprehensive external validation and a private authenticated backend are required before enabling import/sync.

## Run and verify

Serve the directory with a static HTTP server; ES modules require HTTP(S). No build or external JavaScript dependencies. Node 22+: `npm test`. Restricted Node 24 environments: `node --test --test-isolation=none tests/*.test.js`.

Tests cover prescriptions, set validation, draft carryover, dates, migration, original bytes, malformed data, storage failure, stale revisions, generic goals, retained history, primary-goal changes, cyclic links, timeline and running windows. Browser checks use a separate local origin for synthetic data. Retained nutrition/mental/rehab claims are not medically revalidated in this engineering phase.
