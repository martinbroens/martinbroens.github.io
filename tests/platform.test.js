import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,readState,writeState,KEY,V1_KEY,LEGACY_KEY,backup} from '../assets/storage.js';
import {newGoal,saveGoal,goalGroups,goalDate,runningSummary,timeline} from '../assets/domain.js';
import {LocalRepository} from '../assets/repository.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
test('migration preserves original bytes and completed sets; reload does not reseed goals',()=>{
 const st=memory(),v1={version:1,sessions:[],drafts:{},weeks:{'2026-09-14':'lotus'}};
 const raw=JSON.stringify(v1);st.setItem(V1_KEY,raw);st.setItem(LEGACY_KEY,' {"x":1} ');
 const next=readState(st);assert.equal(next.version,2);assert.equal(next.weeks['2026-09-14'],'lotus');assert.equal(next.goals.length,2);
 next.goals=[];writeState(st,next);assert.equal(readState(st).goals.length,0);assert.equal(st.getItem(V1_KEY),raw);assert.equal(backup(st,next).legacyRaw,' {"x":1} ');
});
test('malformed and future formats cannot overwrite earlier data',()=>{
 const st=memory();for(const key of [V1_KEY,KEY]){st.setItem(key,'{"version":99}');assert.throws(()=>readState(st));assert.equal(st.getItem(key),'{"version":99}');}
});
test('expired goals persist; primary changes and completion retain revision history',()=>{
 let goals=[newGoal({name:'Past goal',startDate:'2020-01-01',endDate:'2020-01-01',level:'main',primary:true,status:'active'})];
 assert.equal(goalGroups(goals,'2026-09-14').attention.length,1);
 const next=newGoal({name:'Future arbitrary goal',startDate:'2030-05-01',endDate:'2030-05-01',level:'main',primary:true});
 goals=saveGoal(goals,next);assert.equal(goals.filter(x=>x.primary).length,1);assert.equal(goals[0].revisions.length,1);
 goals=saveGoal(goals,{...goals[0],status:'completed'});assert.equal(goals.length,2);assert.equal(goalGroups(goals).history.length,1);assert.equal(goals.find(x=>x.name==='Past goal').revisions.length,2);
});
test('goal validation rejects invalid dates, multiple primary intent and cyclic links',()=>{
 assert.throws(()=>newGoal({name:'Bad',startDate:'2026-02-30'}));assert.throws(()=>newGoal({name:'Bad',primary:true,level:'sub'}));
 const a=newGoal({name:'A',level:'main'}),b=newGoal({name:'B',parentGoalId:a.id});assert.throws(()=>saveGoal([a,b],{...a,parentGoalId:b.id}));
 assert.equal(goalDate(newGoal({name:'Unknown day',datePrecision:'year',startDate:'2026-01-01',endDate:'2026-12-31'})),'2026');
});
test('repository rejects stale writes and leaves persisted data intact',async()=>{
 const st=memory(),repo=new LocalRepository(st),s=await repo.load();const revision=await repo.save(s,{expectedRevision:0});assert.equal(revision,1);
 const before=st.getItem(KEY);await assert.rejects(repo.save(s,{expectedRevision:0}));assert.equal(st.getItem(KEY),before);
 const failing=new LocalRepository({getItem:()=>null,setItem(){throw Error('quota');}});await assert.rejects(failing.save(s,{expectedRevision:0}));
});
test('running windows exclude future and planned records; missing distance stays unknown',()=>{
 const mk=(id,date,distanceM,status='completed')=>({id,localDate:date,sport:'run',distanceM,status});
 const s=runningSummary([mk('1','2026-09-08',1000),mk('2','2026-09-07',2000),mk('3','2026-09-15',9999),mk('4','2026-09-14',9999,'planned')],'2026-09-14');
 assert.equal(s.seven.km,1);assert.equal(s.twentyEight.km,3);assert.equal(s.latest.id,'1');
 assert.equal(runningSummary([mk('5','2026-09-14',null)],'2026-09-14').seven.km,null);
 assert.equal(runningSummary([]).seven.km,null);
});
test('timeline keeps completed goals, tests and training linked without folding plans into actuals',()=>{
 const s=emptyState();s.goals[0].status='completed';s.tests=[{id:'test',localDate:'2026-04-21',title:'Lab',goalIds:[s.goals[0].id]}];s.coachPlans=[{id:'plan',localDate:'2026-09-15'}];
 const t=timeline(s);assert.ok(t.some(x=>x.status==='completed'));assert.equal(t.find(x=>x.id==='test').goalIds[0],s.goals[0].id);assert.ok(!t.some(x=>x.id==='plan'));
});
test('checkpoint revisions retain results even when the current checkpoint is removed',()=>{
 let g=newGoal({name:'Any test',checkpoints:[{id:'cp',label:'Result',date:'2026-09-14',unit:'kg',target:80,result:null}]});
 let goals=saveGoal([g],{...g,checkpoints:[{...g.checkpoints[0],result:75}]});
 goals=saveGoal(goals,{...goals[0],checkpoints:[]});assert.equal(goals[0].revisions.at(-1).checkpoints[0].result,75);
 assert.throws(()=>newGoal({name:'Invalid',checkpoints:[{id:'c',label:'',date:'',unit:'kg',target:null,result:null}]}));
});
