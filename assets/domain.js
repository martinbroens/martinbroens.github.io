import {localDate, validSet} from './programs.js';
import {INITIAL_GOALS} from './initial-goals.js';

export const GOAL_STATUSES={planned:'Planlagt',active:'Aktivt',completed:'Gennemført',cancelled:'Aflyst'};
export const METRICS={
  lt1:{label:'LT1',units:['bpm','s/km']},lt2:{label:'LT2',units:['bpm','s/km']},
  vo2max:{label:'VO₂max',units:['ml/kg/min']},economy:{label:'Running economy',units:['ml/kg/km']},
  matchedPace:{label:'Pace ved sammenlignelig puls',units:['s/km']},
  strength:{label:'Styrke',units:['kg','reps']},bodyMass:{label:'Kropsvægt',units:['kg']}
};
export const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
export const uid=()=>crypto.randomUUID();
export const activeGoal=g=>g.status==='active'||g.status==='planned';
export function validateGoal(g){
  if(!object(g)||!g.id||typeof g.name!=='string'||!g.name.trim()||typeof g.type!=='string'||!g.type.trim()||
    !Object.hasOwn(GOAL_STATUSES,g.status)||!['main','sub'].includes(g.level)||typeof g.primary!=='boolean'||
    !Number.isInteger(g.priority)||g.priority<1||g.priority>5||typeof g.notes!=='string'||
    !Array.isArray(g.checkpoints)||!Array.isArray(g.revisions)||
    !validDate(g.startDate)||!validDate(g.endDate)||g.startDate>g.endDate||
    !['day','month','year','period'].includes(g.datePrecision)||
    (g.primary&&(g.level!=='main'||!activeGoal(g))))throw Error('Kontrollér mål, datoer og status.');
  if(g.checkpoints.some(c=>!object(c)||typeof c.id!=='string'||typeof c.label!=='string'||!c.label.trim()||typeof c.unit!=='string'||(c.date!==''&&!validDate(c.date))||!['target','result'].every(k=>c[k]===null||Number.isFinite(c[k]))))throw Error('Kontrollér checkpointets navn, dato og tal.');
  return g;
}
export function newGoal(input){
  const at=new Date().toISOString();
  return validateGoal({id:uid(),name:'',type:'other',startDate:localDate(),endDate:localDate(),datePrecision:'day',priority:3,status:'planned',level:'sub',primary:false,parentGoalId:null,notes:'',checkpoints:[],revisions:[],createdAt:at,updatedAt:at,...input});
}
// Personal starting records, not application logic. Approximate dates remain approximate.
export function starterGoals(){
  return INITIAL_GOALS.map(input=>newGoal(input));
}
export function saveGoal(goals,input){
  const g=validateGoal(structuredClone(input)),at=new Date().toISOString();
  if(g.parentGoalId){
    if(g.parentGoalId===g.id||!goals.some(x=>x.id===g.parentGoalId))throw Error('Vælg et eksisterende hovedmål.');
    let parent=goals.find(x=>x.id===g.parentGoalId),seen=new Set([g.id]);
    while(parent){if(seen.has(parent.id))throw Error('Mål kan ikke være delmål af hinanden i en cirkel.');seen.add(parent.id);parent=goals.find(x=>x.id===parent.parentGoalId);}
  }
  const previous=goals.find(x=>x.id===g.id);
  const snapshot=x=>{const {revisions,...rest}=x;return {...rest,recordedAt:at};};
  g.revisions=previous?[...previous.revisions,snapshot(previous)]:[];
  g.createdAt=previous?.createdAt||g.createdAt;g.updatedAt=at;
  const result=goals.filter(x=>x.id!==g.id).map(x=>g.primary&&x.primary?{...x,primary:false,updatedAt:at,revisions:[...x.revisions,snapshot(x)]}:x);
  return [...result,g];
}
export function goalDate(g){
  if(g.datePrecision==='year')return g.startDate.slice(0,4);
  if(g.datePrecision==='month')return new Date(g.startDate+'T12:00:00').toLocaleDateString('da-DK',{month:'long',year:'numeric'});
  return g.startDate===g.endDate?g.startDate:`${g.startDate} – ${g.endDate}`;
}
export function goalGroups(goals,today=localDate()){
  const order=(a,b)=>a.startDate.localeCompare(b.startDate)||a.priority-b.priority;
  return {active:goals.filter(g=>g.status==='active').sort((a,b)=>Number(b.primary)-Number(a.primary)||order(a,b)),
    upcoming:goals.filter(g=>g.status==='planned').sort(order),history:goals.filter(g=>!activeGoal(g)).sort(order),
    attention:goals.filter(g=>activeGoal(g)&&g.endDate<today)};
}
export function timeline(state){
  return [
    ...state.sessions.map(s=>({id:s.id,date:s.date,kind:'strength',title:`Strength ${s.program}`,goalIds:s.goalIds||[]})),
    ...state.activities.map(a=>({id:a.id,date:a.localDate,kind:'activity',title:a.title,goalIds:a.goalIds||[]})),
    ...state.tests.map(t=>({id:t.id,date:t.localDate,kind:'test',title:t.title,goalIds:t.goalIds||[]})),
    ...state.benchmarks.map(b=>({id:b.id,date:b.localDate,kind:'benchmark',title:b.title,goalIds:b.goalIds||[]})),
    ...state.goals.map(g=>({id:g.id,date:g.endDate,kind:'goal',title:g.name,status:g.status,goalIds:[g.id],datePrecision:g.datePrecision}))
  ].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
}
export function daysAgo(today,n){const d=new Date(today+'T12:00:00');d.setDate(d.getDate()-n);return localDate(d);}
export function runningSummary(activities,today=localDate()){
  const runs=activities.filter(a=>['run','virtualRun'].includes(a.sport)&&a.status==='completed'&&a.localDate<=today).sort((a,b)=>b.localDate.localeCompare(a.localDate));
  const window=n=>{const a=runs.filter(r=>r.localDate>=daysAgo(today,n-1));return {count:a.length,days:new Set(a.map(r=>r.localDate)).size,km:a.length&&a.every(r=>Number.isFinite(r.distanceM))?a.reduce((s,r)=>s+r.distanceM,0)/1000:null};};
  return {latest:runs[0]||null,seven:window(7),twentyEight:window(28)};
}
export function exerciseHistory(sessions,id){
  return [...sessions].sort((a,b)=>b.date.localeCompare(a.date)||(b.finishedAt||'').localeCompare(a.finishedAt||''))
    .flatMap(s=>s.exercises.filter(e=>e.id===id).map(e=>({date:s.date,program:s.program,sets:e.sets.filter(x=>x.done&&validSet(x))}))).filter(x=>x.sets.length);
}
