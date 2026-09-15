/** Provisional cross-domain architecture; no runtime schema or migration. */
export type PerformanceDomain =
  | 'physicalPerformance' | 'sleepRecovery' | 'nutrition'
  | 'mentalPerformance' | 'healthPhysiology';

export type PerformanceEntityKind =
  | 'knowledge' | 'tool' | 'protocol' | 'practice' | 'experience'
  | 'reflection' | 'outcome' | 'learning' | 'adaptation'
  | 'activity' | 'coachPlan' | 'measurement' | 'labTest'
  | 'benchmark' | 'goal' | 'mission' | 'identityValues';

/** Definitions pin revision; existing records need adapters, not duplicated data. */
export interface PerformanceEntityRef {
  kind: PerformanceEntityKind;
  id: string;
  revision: number|null;
  domains: PerformanceDomain[];
}

/** Directed associations with provenance; never proof of causal effect.
 * Ownership/access checks and endpoint validation belong in the future repository.
 */
export interface PerformanceLink {
  id: string;
  profileId: string;
  from: PerformanceEntityRef;
  to: PerformanceEntityRef;
  relationship: 'informs'|'uses'|'practices'|'appliedIn'|'reflectsOn'
    |'observes'|'learnsFrom'|'proposesChangeTo'|'supportsGoal'|'relatedTo';
  createdAt: string;
  source: import('./models.js').Source;
}

/** Compatibility boundary for provisional Mental records, not a second graph.
 * Migrate to typed endpoints when validated domain schemas are implemented.
 */
export interface PerformanceRelation {
  domain: PerformanceDomain;
  recordId: string;
  relationType: string;
}
