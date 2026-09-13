import {PROGRAMS} from './programs.js';
export const KEY='human_performance_v1';
export const LEGACY_KEY='styrke_v4';
export function emptyState(){return {version:1,sessions:[],drafts:{},weeks:{}};}
export function readState(storage) {
  const raw=storage.getItem(KEY);
  if(!raw)return emptyState();
  const state=JSON.parse(raw);
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const session=s=>object(s)&&PROGRAMS[s.program]&&typeof s.id==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)&&typeof s.notes==='string'&&Array.isArray(s.exercises)&&s.exercises.every(ex=>object(ex)&&typeof ex.id==='string'&&Array.isArray(ex.sets)&&ex.sets.every(set=>object(set)&&typeof set.done==='boolean'&&['weight','value','rir'].every(k=>typeof set[k]==='string'||typeof set[k]==='number')));
  if(!object(state)||state.version!==1 || !Array.isArray(state.sessions) || !state.sessions.every(session)||!object(state.drafts)||!object(state.weeks)||!Object.entries(state.drafts).every(([key,d])=>session(d)&&d.program===key&&d.exercises.length===PROGRAMS[key].exercises.length&&d.exercises.every((ex,i)=>ex.id===PROGRAMS[key].exercises[i].id&&ex.sets.length===PROGRAMS[key].exercises[i].sets)))throw new Error('Ukendt dataformat');
  return state;
}
export function writeState(storage,state){storage.setItem(KEY,JSON.stringify(state));}
// Legacy data remains byte-for-byte intact, and is included verbatim in backups.
export function backup(storage,state){return {format:'human-performance-backup',version:1,exportedAt:new Date().toISOString(),state,savedStateRaw:storage.getItem(KEY),legacyRaw:storage.getItem(LEGACY_KEY)};}
