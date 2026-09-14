import {PROGRAMS} from './programs.js';
import {starterGoals,object,validDate,validateGoal,uid} from './domain.js';
export const KEY='human_performance_v2';
export const V1_KEY='human_performance_v1';
export const LEGACY_KEY='styrke_v4';
export function emptyState(){return {version:2,revision:0,profileId:uid(),sessions:[],drafts:{},weeks:{},goals:starterGoals(),activities:[],coachPlans:[],tests:[],benchmarks:[],measurements:[],coverage:[],updatedAt:null};}
function validateStrength(state){
  const session=s=>object(s)&&PROGRAMS[s.program]&&typeof s.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)&&typeof s.notes==='string'&&Array.isArray(s.exercises)&&s.exercises.every(ex=>object(ex)&&typeof ex.id==='string'&&Array.isArray(ex.sets)&&ex.sets.every(set=>object(set)&&typeof set.done==='boolean'&&['weight','value','rir'].every(k=>typeof set[k]==='string'||typeof set[k]==='number')));
  if(!object(state)||!Array.isArray(state.sessions) || !state.sessions.every(session)||!object(state.drafts)||!object(state.weeks)||!Object.entries(state.drafts).every(([key,d])=>session(d)&&d.program===key&&d.exercises.length===PROGRAMS[key].exercises.length&&d.exercises.every((ex,i)=>ex.id===PROGRAMS[key].exercises[i].id&&ex.sets.length===PROGRAMS[key].exercises[i].sets)))throw new Error('Ukendt styrkedataformat');
}
export function validateState(state){
  validateStrength(state);
  if(state.version!==2||!Number.isInteger(state.revision)||state.revision<0||typeof state.profileId!=='string'||!Array.isArray(state.goals)||!['activities','coachPlans','tests','benchmarks','measurements','coverage'].every(k=>Array.isArray(state[k])))throw Error('Ukendt dataformat');
  state.goals.forEach(validateGoal);
  if(new Set(state.goals.map(g=>g.id)).size!==state.goals.length||state.goals.filter(g=>g.primary).length>1)throw Error('Modstridende mål');
  for(const name of ['activities','coachPlans','tests','benchmarks','measurements']){
    const records=state[name];
    if(new Set(records.map(r=>r.id)).size!==records.length||records.some(r=>!object(r)||typeof r.id!=='string'||!validDate(r.localDate)||!object(r.source)))throw Error('Ukendte performance-data');
  }
  return state;
}
export function readState(storage) {
  const raw=storage.getItem(KEY);
  if(raw!==null)return validateState(JSON.parse(raw));
  const old=storage.getItem(V1_KEY),state=emptyState();
  if(old!==null){const v1=JSON.parse(old);validateStrength(v1);if(v1.version!==1)throw Error('Ukendt tidligere version');Object.assign(state,{sessions:v1.sessions,drafts:v1.drafts,weeks:v1.weeks});}
  return state;
}
export function writeState(storage,state){validateState(state);storage.setItem(KEY,JSON.stringify(state));}
// Legacy data remains byte-for-byte intact, and is included verbatim in backups.
export function backup(storage,state){return {format:'human-performance-backup',version:2,exportedAt:new Date().toISOString(),state,savedStateRaw:storage.getItem(KEY),v1Raw:storage.getItem(V1_KEY),legacyRaw:storage.getItem(LEGACY_KEY)};}
