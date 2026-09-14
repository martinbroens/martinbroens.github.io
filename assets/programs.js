// Latest agreed A/B/C revision; Home from the agreed 40–50 minute version.
// Core/extra split is an implementation choice: first four exercises are the core.
function exercise(id, name, sets, min, max, rest=90, unit='reps', side='', load='kg i alt') {
  return {id,name,sets,min,max,rest,unit,side,load,rir:2};
}
const e=exercise;
export const PROGRAMS={
  A:{name:'Full Body',duration:'45–55 min',description:'Squat, deadlift, bryst og ryg — dit fundament, også når du kun når ét pas.',exercises:[
    e('squat','Barbell Full Squat',3,5,6,180),e('deadlift','Barbell Deadlift',2,3,5,180),
    e('bench','Barbell Bench Press',3,6,8,120),e('pulldown','Lat Pulldown',3,6,10),
    e('rear-lunge','Dumbbell Rear Lunge',2,6,8,90,'reps','pr. ben','kg pr. hånd'),
    e('calf','Standing Calf Raise',3,10,15,60),e('curl','DB Biceps Curl',2,8,12,60,'reps','','kg pr. hånd'),
    e('pushdown','Triceps Pushdown',2,8,12,60),e('farmer','Farmer Carry',2,30,50,60,'m','','kg pr. hånd')
  ]},
  B:{name:'Push + Unilateral',duration:'40–50 min',description:'Unilateral benstyrke, skuldre og pres. Supplér A med B eller C.',exercises:[
    e('split-squat','Bulgarian Split Squat',3,6,8,120,'reps','pr. ben','kg pr. hånd'),
    e('military','Standing Military Press',3,6,8,120),e('dip','Chest Dip',3,6,10,90,'reps','','ekstra kg'),
    e('step-up','Dumbbell Step-Up',2,8,8,90,'reps','pr. ben','kg pr. hånd'),
    e('lateral','Lateral Raise',3,12,15,60,'reps','','kg pr. hånd'),e('triceps','Triceps Overhead Extension',2,10,15,60),
    e('pallof','Pallof Press',2,10,12,60,'reps','pr. side'),e('suitcase','Suitcase Carry',2,30,40,60,'m','pr. side','kg i én hånd')
  ]},
  C:{name:'Pull + Posterior Chain',duration:'45–55 min',description:'Ekstra bagkæde og ryg. RDL her; konventionel deadlift ligger i A.',exercises:[
    e('rdl','Romanian Deadlift',3,6,8,120),e('pulldown','Lat Pulldown',3,6,10),e('row','Barbell Bent Over Row',3,6,10),
    e('hip-thrust','Hip Thrust',3,8,10),e('hamstring','Hamstring Curl',3,8,12,90),e('face-pull','Face Pull',2,12,15,60),
    e('hammer','Hammer Curl',3,8,12,60,'reps','','kg pr. hånd'),e('back-extension','Back Extension',2,12,15,60,'reps','','ekstra kg')
  ]},
  Home:{name:'Full Body hjemme',duration:'40–50 min',description:'Med håndvægte. Erstatter et centerpas; er ikke et ekstra obligatorisk pas.',exercises:[
    e('home-split','DB Bulgarian Split Squat',3,8,8,120,'reps','pr. ben','kg pr. hånd'),
    e('home-rdl','DB Romanian Deadlift',3,8,10,120,'reps','','kg pr. hånd'),
    e('floor','DB Floor Press',3,8,12,90,'reps','','kg pr. hånd'),e('home-row','One-Arm DB Row',3,8,12,90,'reps','pr. side','kg i én hånd'),
    e('home-press','DB Standing Overhead Press',2,8,12,90,'reps','','kg pr. hånd'),
    e('curl','DB Curl',2,10,15,60,'reps','','kg pr. hånd'),e('home-triceps','DB Overhead Triceps Extension',2,10,15,60,'reps','','kg i alt'),
    e('home-farmer','Farmer Hold/Carry',2,30,60,60,'sek','','kg pr. hånd')
  ]}
};
export function localDate(date=new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function weekStart(date=new Date()) {
  const d=new Date(date);d.setDate(d.getDate()-((d.getDay()+6)%7));return localDate(d);
}
export function validSet(set) {
  return set && set.weight!=='' && set.value!=='' && set.rir!=='' &&
    Number.isFinite(Number(set.weight)) && Number(set.weight)>=0 && Number(set.weight)<=1000 &&
    Number.isInteger(Number(set.value)) && Number(set.value)>0 && Number(set.value)<=10000 &&
    Number.isFinite(Number(set.rir)) && Number(set.rir)>=0 && Number(set.rir)<=10;
}
export function lastExercise(sessions,id) {
  for(const session of [...sessions].sort((a,b)=>b.date.localeCompare(a.date)||(b.finishedAt||'').localeCompare(a.finishedAt||''))) {
    const ex=session.exercises.find(x=>x.id===id && x.sets.some(s=>s.done));
    if(ex)return {date:session.date,sets:ex.sets.filter(s=>s.done)};
  }
  return null;
}
export function createDraft(program,sessions) {
  return {id:crypto.randomUUID(),program,programVersion:1,date:localDate(),createdAt:new Date().toISOString(),goalIds:[],notes:'',exercises:PROGRAMS[program].exercises.map(ex=>{
    const previous=lastExercise(sessions,ex.id);
    return {id:ex.id,name:ex.name,unit:ex.unit,load:ex.load,side:ex.side,prescription:{sets:ex.sets,min:ex.min,max:ex.max,rir:ex.rir},sets:Array.from({length:ex.sets},(_,i)=>({weight:previous?.sets[i]?.weight??'',value:'',rir:'',done:false}))};
  })};
}
