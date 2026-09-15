# Human Performance: foundation, phase 2

## Scope and boundaries

Dashboard + Strength 2.0 are the working core. Goals has a small working editor and permanent logical history. Running Performance has a read-only presentation boundary and honest empty states. Nutrition, Mobility and Mental retain their existing content. Recovery/readiness, tests, benchmarks and advanced longitudinal analysis are prepared as domain contracts, not implemented products.

No running prescriptions, Intervals mutations, API credentials, private imported training history or laboratory results are included. The coach remains the sole source of the running plan. No merge or live deployment is part of this phase.

## Modules

| File | Responsibility |
|---|---|
| `assets/programs.js` | Agreed A/B/C/Home prescriptions, set validation, dated drafts and exercise snapshots |
| `assets/performance.js` | Strength UI and app composition; serial asynchronous save queue |
| `assets/platform.js` | Dashboard, goals editor/history, Running Performance shell and module navigation |
| `assets/domain.js` | Goal invariants, date handling, running summaries, exercise history and unified timeline projection |
| `assets/initial-goals.js` | Ordinary one-time personal starter records; no race-specific control flow |
| `assets/repository.js` | Async persistence contract, local adapter, revision conflict checks |
| `assets/storage.js` | Version validation, lossless v1 migration, v2 serialization and raw backup |
| `assets/models.d.ts` | Explicit contracts for activities, plans, tests, metrics, benchmarks, sources, coverage and goals |
| `assets/legacy.*` | Preserved older modules and calculator; later migration can happen module by module |

New UI modules must use the repository, never access browser storage directly. The retained legacy calculator is the explicit temporary exception.

## Persistence and later cloud implementation

The current adapter persists one versioned document per browser origin. `profileId` identifies that local dataset; it is not an authenticated account. `load`, `save(state, {expectedRevision})`, `export` and `legacy` are asynchronous so a later remote adapter can replace the storage mechanism without changing the feature views. The present document-level adapter is a foundation, not a claim that one large JSON document is an appropriate permanent database.

For a production backend: use authenticated server-side account ownership, separate collections/tables, record-level revisions, stable source IDs, transactional writes, an explicit offline queue and a documented conflict policy. Never trust a client-provided profile ID as authorization. Keep credentials and private data outside this static public repository. These backend changes are intentionally deferred.

Local writes are serialized within the app. Web Locks coordinate supported browser tabs; a revision mismatch fails closed and asks the user to export/reload rather than silently replacing data. Browsers without Web Locks have best-effort revision checking, not guaranteed multi-tab transactions. Cross-device sync is not enabled.

V2 uses `human_performance_v2`. On first opening, valid `human_performance_v1` sessions, drafts and week context are copied into v2. Both the original v1 bytes and `styrke_v4` are retained untouched by the new storage layer. A malformed or future document is not overwritten. Backups contain current in-memory state plus saved v2, v1 and legacy raw data. Restore UI, cloud backups and automatic recovery are deferred. Browser storage can be cleared by the user or platform; “history retained” means the app never expires/deletes records, not that local storage is permanent infrastructure.

## Goals and time

Goals use arbitrary names/types, ID, date range and precision, priority, status, main/sub classification, primary flag, parent link, notes, checkpoints and timestamped revisions. Saving a new primary goal demotes the former one with a retained revision. Completion/cancellation explicitly clears primary status in the editor. Passing a date never changes status or deletes a goal. History is chronological, with old revisions retained even when dates, notes or checkpoints change.

Valencia 2026 and MDS January 2027 are only starter records. Their exact race days were not supplied, so they retain year/month precision. They are never automatically recreated or rewritten after the first persistence. Checkpoints preserve target and result separately, with null for unknown values.

Calendar dates use YYYY-MM-DD; instants use ISO timestamps and source timezone when known. Do not convert local training dates to UTC midnight. The timeline is a derived view over strength, completed activities, tests, benchmarks and goals, not duplicate authoritative storage. External coach plans remain separate from completed activities. `goalIds` and goal date ranges provide future links to baseline, build-up, race/test, result and post-goal periods; comparison UI is deferred.

## Strength history and progression

The existing program is preserved. Completed sets retain weight, reps/distance/time and RIR. New drafts carry previous weights but never copy completion. New records snapshot exercise name, units, load convention and prescription plus program version, so future program changes need not reinterpret earlier sets. Old records retain fallback rendering through the original program definitions. No old data is turned into measured performance by inference.

Progression shows actual saved sets by exercise, ordered by date, and retains the existing conditional upper-rep/RIR suggestion. It does not claim a measured 1RM or add automatic loads. Partial sessions remain valid and are labelled as saved sessions/sets rather than fully completed programs. Program version migrations and a session-editing UI are future work.

## Performance data integrity

Activities, coach plans, tests and measurements share source metadata, timestamps, units and optional goal links. Import must deduplicate `(profileId, provider, sourceId)` and record coverage. A matched planned workout is not a second completed activity. Null measurements are unknown, not zero. Raw source payloads should remain in private storage for audit where appropriate.

The running summary helper uses completed run/virtualRun records, excludes future dates, and calculates inclusive 7/28-calendar-day windows. The UI labels values as imported data; absent data displays a dash. Full-history coverage is not implied. There is no import UI yet.

Laboratory measurements, wearable estimates and self-reported values must retain distinct evidence types. LT1/LT2 values need units and test conditions; pace-at-HR needs matched conditions. Historical zones, load method and source quality flags must be preserved. Neither readiness nor physiological values are fabricated from missing input. The typed contracts are design boundaries; comprehensive external import validation must be implemented before accepting remote payloads.

## Decisions for the next phase

### Mental Performance: reserved first-class domain

`mentalPerformance` is a separate future domain, alongside Strength and Running Performance. `assets/mental-models.d.ts` defines provisional boundaries, not an implemented or clinically validated specification. The current `mental` route, HTML content and legacy interactions are a temporary presentation layer. Their current frameworks, questions, protocols, identity text, daily schedule and victory tracker must not become permanent schema, default prescriptions or inferred history.

The domain separates versioned skill/protocol/tool definitions from dated personal practice, reflection and progression records. It reserves:

- Skills and protocols with source, revision and review status.
- Daily practices with planned/completed/skipped status and optional duration.
- AAR/reflection with future versioned templates rather than hardcoded questions.
- Stress-regulation tools and pressure-performance training as reusable definitions; their actual use is recorded as practices.
- Identity/values as dated user-authored records whose previous versions remain available.
- Progression/history as sourced observations linked to skills and practices; no invented scoring, streak-based mastery or readiness inference.
- Explicit record relationships to Sleep/Recovery, Nutrition, Physical Performance and Health/Physiology. Associations do not assert causation.

Mental records reuse profile ownership, source/provenance, local dates, timestamps and goal links. Future repository adapters must persist the new collections through the shared asynchronous boundary. Definition revisions referenced by past practices must remain resolvable. Corrections retain provenance and history; user-controlled privacy/deletion policy is to be specified before storing reflections. Personal reflections must never enter the public repository or be exposed in a shared dashboard by default.

Future timeline integration will project dated practice/reflection/observation events without duplicating source records, and must distinguish planned work from performed practices. No runtime collection, migration, new mental UI, scoring or content has been added in this preparation. Do not interpret or migrate existing legacy content as completed practices or validated mental skills. Await the validated Mental Performance specification from the main chat before implementing these schemas, workflows, content or cross-domain analysis.

Choose backend/account provider and private-data hosting, offline/conflict behavior, and read-only Intervals authorization before building sync. Confirm precise event dates and provide original test reports before filling physiological metrics. No such choice blocks the present static frontend foundation.
