import test from 'node:test';
import assert from 'node:assert/strict';
import {PROGRAMS,validSet,createDraft,lastExercise,weekStart,localDate} from '../assets/programs.js';
import {readState,writeState,emptyState,backup,KEY,LEGACY_KEY} from '../assets/storage.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
test('agreed program structure and units',()=>{
  assert.deepEqual(Object.keys(PROGRAMS),['A','B','C','Home']);
  assert.deepEqual(PROGRAMS.A.exercises.slice(0,4).map(e=>[e.id,e.sets,e.min,e.max]),[['squat',3,5,6],['deadlift',2,3,5],['bench',3,6,8],['pulldown',3,6,10]]);
  assert.equal(PROGRAMS.C.exercises[0].id,'rdl');
  assert.deepEqual(Object.values(PROGRAMS).map(p=>p.exercises.length),[9,8,8,8]);
  assert.equal(PROGRAMS.Home.exercises.at(-1).unit,'sek');
  assert.equal(PROGRAMS.A.exercises.at(-1).unit,'m');
});
test('new drafts carry weights but never carry completion, reps or RIR',()=>{
  const sessions=[{date:'2026-09-12',exercises:[{id:'pulldown',sets:[{weight:50,value:10,rir:2,done:true}]}]}];
  const d=createDraft('C',sessions),other=createDraft('C',sessions);
  assert.notEqual(d.id,other.id);
  assert.deepEqual(d.exercises[1].sets[0],{weight:50,value:'',rir:'',done:false});
  assert.equal(d.exercises[1].sets.length,3);
  assert.equal(lastExercise(sessions,'missing'),null);
});
test('validation accepts bodyweight and rejects blanks, invalid values and negatives',()=>{
  assert.ok(validSet({weight:0,value:8,rir:2}));
  for(const s of [{weight:'',value:8,rir:2},{weight:10,value:0,rir:2},{weight:10,value:1.5,rir:2},{weight:-1,value:8,rir:2},{weight:10,value:8,rir:11},{weight:10,value:8,rir:''},{weight:'bad',value:8,rir:2}])assert.ok(!validSet(s));
});
test('legacy bytes survive load, saving and backup including unknown fields',()=>{
  const storage=memory(),legacy=' {"bw":83,"gsq1":"60","unknown":[1,2]} ';
  storage.setItem(LEGACY_KEY,legacy);const state=readState(storage);
  state.drafts.A=createDraft('A',[]);writeState(storage,state);
  assert.deepEqual(readState(storage),state);assert.equal(storage.getItem(LEGACY_KEY),legacy);
  assert.equal(backup(storage,state).legacyRaw,legacy);
});
test('corrupt or future-version data fail closed without overwriting',()=>{
  const storage=memory();for(const raw of ['{bad','{"version":2}', 'null']){storage.setItem(KEY,raw);assert.throws(()=>readState(storage));assert.equal(storage.getItem(KEY),raw);}
  assert.throws(()=>writeState({setItem(){throw Error('quota');}},emptyState()));
});
test('local calendar weeks handle Sunday and year boundary',()=>{
  assert.equal(weekStart(new Date(2026,8,13,23)), '2026-09-07');
  assert.equal(weekStart(new Date(2026,8,14,0)), '2026-09-14');
  assert.equal(weekStart(new Date(2027,0,1)), '2026-12-28');
  assert.equal(localDate(new Date(2026,8,13,23)), '2026-09-13');
});
