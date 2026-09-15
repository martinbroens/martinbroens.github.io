import type {RecordBase, Source} from './models.js';
import type {PerformanceRelation} from './platform-models.js';
export type {PerformanceRelation} from './platform-models.js';

/** Provisional architecture only. No runtime collection or validated content yet.
 * Final schemas, scoring and workflows await the main-chat specification.
 */
export type MentalDomain = 'mentalPerformance';
export interface MentalDefinitionRef {id:string; revision:number}

/** Reusable content is versioned separately from dated personal records. */
export interface MentalDefinition {
  id: string;
  domain: MentalDomain;
  revision: number;
  kind: 'skill'|'protocol'|'stressRegulationTool'|'pressureTraining'|'reflectionTemplate'|'metricDefinition';
  title: string;
  skillRefs: MentalDefinitionRef[];
  contentSchema: string; // Defined by the future validated specification.
  content: Record<string, unknown>;
  source: Source;
  reviewStatus: 'draft'|'validated'|'retired';
  createdAt: string;
  updatedAt: string;
}

export interface MentalRecordBase extends RecordBase {
  domain: MentalDomain;
  schemaVersion: number;
  revision: number;
  relations: PerformanceRelation[];
  supersedesId: string|null;
}

/** Planned daily practices do not count as completed practices. */
export interface MentalPractice extends MentalRecordBase {
  kind: 'practice';
  definitionRef: MentalDefinitionRef|null;
  skillRefs: MentalDefinitionRef[];
  status: 'planned'|'completed'|'skipped';
  durationSeconds: number|null;
  context: Record<string, unknown>;
  observationIds: string[];
}

export interface MentalReflection extends MentalRecordBase {
  kind: 'reflection';
  format: 'aar'|'reflection';
  templateRef: MentalDefinitionRef|null;
  relatedPracticeIds: string[];
  entries: Record<string, string>; // No fixed AAR questions before validation.
}

export interface MentalIdentityValues extends MentalRecordBase {
  kind: 'identityValues';
  effectiveFrom: string;
  effectiveThrough: string|null;
  contentSchema: string;
  entries: Record<string, unknown>; // User-authored, dated; no preset identity.
}

/** Observations support history without inventing a readiness/mastery score. */
export interface MentalProgressObservation extends MentalRecordBase {
  kind: 'progressObservation';
  skillRef: MentalDefinitionRef|null;
  practiceId: string|null;
  metricDefinitionRef: MentalDefinitionRef|null;
  value: number|string|null;
  unit: string|null;
  notes: string;
}

export type MentalRecord = MentalPractice|MentalReflection|MentalIdentityValues|MentalProgressObservation;
