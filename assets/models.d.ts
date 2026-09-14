/** Forward-compatible record contracts. This file documents the boundary; no build step required. */
export type LocalDate = string; // YYYY-MM-DD, independent of timezone shifts
export interface Source {
  provider: 'manual' | 'intervals' | 'lab' | string;
  sourceId: string | null;
  importedAt: string | null;
  measuredAt: string | null;
  method: string | null;
  evidence: 'measured' | 'estimated' | 'reported';
}
export interface RecordBase {
  id: string;
  profileId: string;
  localDate: LocalDate;
  startedAt: string | null; // timestamp with offset when known
  timezone: string | null;
  source: Source;
  goalIds: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Activity extends RecordBase {
  title: string;
  sport: 'run' | 'virtualRun' | 'ride' | 'strength' | 'hike' | string;
  status: 'completed';
  coachPlanId: string | null;
  distanceM: number | null;
  movingSeconds: number | null;
  elapsedSeconds: number | null;
  averageHr: number | null;
  maxHr: number | null;
  elevationM: number | null;
  gapSecondsPerKm: number | null;
  load: {value:number|null; method:string|null; includedInFitness:boolean|null};
  zoneSnapshot: {metric:string; boundaries:number[]; effectiveFrom:LocalDate} | null;
  qualityFlags: string[];
}
export interface CoachPlan extends RecordBase {
  title: string;
  status: 'planned' | 'cancelled';
  durationSeconds: number | null;
  distanceM: number | null;
  coach: string | null;
  description: string | null;
  // Read-only external source. No write-back or prescription generator.
}
export interface Measurement extends RecordBase {
  metricKey: 'lt1'|'lt2'|'vo2max'|'economy'|'matchedPace'|string;
  value: number | null;
  unit: string;
  testId: string | null;
  conditions: {heartRate?:number; speedKmh?:number; gradePercent?:number; protocol?:string; device?:string};
}
export interface LabTest extends RecordBase {
  title: string;
  protocol: string | null;
  lab: string | null;
  measurementIds: string[];
  reportReference: string | null; // private reference, never a credential
}
export interface Benchmark extends RecordBase {
  title: string;
  metricKey: string;
  value: number | null;
  unit: string;
  population: string | null;
  reference: string | null;
}
export interface Goal {
  id: string;
  name: string;
  type: string;
  startDate: LocalDate;
  endDate: LocalDate;
  datePrecision: 'day'|'month'|'year'|'period';
  priority: number;
  status: 'planned'|'active'|'completed'|'cancelled';
  level: 'main'|'sub';
  primary: boolean;
  parentGoalId: string|null;
  notes: string;
  checkpoints: {id:string;label:string;metricKey:string|null;date:LocalDate|'';unit:string;target:number|null;result:number|null;source:Source|null}[];
  revisions: (Omit<Goal,'revisions'> & {recordedAt:string})[];
  createdAt: string;
  updatedAt: string;
}
export interface Coverage {
  provider: string;
  from: LocalDate;
  through: LocalDate;
  sports: string[];
  complete: boolean;
  checkedAt: string;
}
export interface Repository<State> {
  mode: string;
  load(): Promise<State>;
  save(state:State,options:{expectedRevision:number}):Promise<number>;
  export(state:State):Promise<unknown>;
  legacy():Promise<string|null>;
}
