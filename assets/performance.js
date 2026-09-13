import {PROGRAMS,localDate,weekStart,validSet,lastExercise,createDraft} from './programs.js';
import {readState,writeState,emptyState,backup,LEGACY_KEY} from './storage.js';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state,storage,blocked=false,selected='A',coreOnly=false,timerEnd=0;
try {storage=window.localStorage;state=readState(storage);}catch{state=emptyState();blocked=true;}
const root=$('strength-app');
function status(message){$('hp-status').textContent=message;}
function persist(){
  if(blocked){status('Lagring kunne ikke åbnes. Eksportér en sikkerhedskopi før du genindlæser. Eksisterende data overskrives ikke.');return false;}
  try {writeState(storage,state);status('Gemt på denne enhed');return true;}
  catch {status('Kunne ikke gemme. Behold siden åben og eksportér en sikkerhedskopi.');return false;}
}
function draft(){return state.drafts[selected];}
function ensureDraft(){if(!draft())state.drafts[selected]=createDraft(selected,state.sessions);}
function start(program){selected=program;ensureDraft();window.showView('tracker');renderStrength();persist();}
function downloadBackup(){
  try{
    const data=storage?backup(storage,state):{state,warning:'Browserlager utilgængeligt'};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`human-performance-${localDate()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch{status('Sikkerhedskopien kunne ikke læses. Eksisterende data er ikke ændret.');}
}
function renderDashboard(){
  const monday=weekStart(),today=localDate();
  const sessions=state.sessions.filter(s=>s.date>=monday&&s.date<=today);
  const next=['A','B','C'].find(p=>!sessions.some(s=>s.program===p))||'A';
  const resume=Object.keys(state.drafts).find(p=>PROGRAMS[p]);
  const program=resume||next;
  $('dashboard').innerHTML=`<div class="hp-grid">
    <section class="hp-card"><div class="hp-eyebrow">I dag · ${esc(new Date().toLocaleDateString('da-DK',{weekday:'long',day:'numeric',month:'long'}))}</div>
      <h2>${resume?'Fortsæt':'Vælg næste pas'} · ${esc(program)} / ${esc(PROGRAMS[program].name)}</h2>
      <p>${resume?'Din kladde er klar, med de sæt du allerede har registreret.':'A er fundamentet. Ved to pas kan du vælge A+B eller A+C. Home erstatter et centerpas.'}</p>
      <div class="hp-actions"><button class="hp-btn primary" data-start="${program}">${resume?'Fortsæt pas':'Åbn pas'}</button><button class="hp-btn" data-start="Home">Træn hjemme</button></div>
    </section>
    <section class="hp-card"><div class="hp-eyebrow">Denne uge · fra ${monday}</div><div class="hp-number">${sessions.length} <span style="font:16px Barlow,sans-serif">gemte styrkepas</span></div>
      <p>${sessions.length?sessions.map(s=>esc(s.program)).join(' · '):'Ingen afsluttede pas registreret endnu.'}</p>
      <label class="hp-field">Ugens ramme<select id="hp-week" class="hp-select"><option value="">Vælg uge</option value="lotus">Lotus-uge</option><option value="normal">Ikke-Lotus-uge</option></select></label>
    </section></div>
    <section class="hp-card"><div class="hp-eyebrow">Endurance + recovery</div><h2>Plads til hele din træning</h2><p>Emils løbeplan, søvn og belastning kan samles her, når data er importeret. Ingen Intervals.icu-data er endnu forbundet til denne app.</p><div class="hp-actions"><a class="hp-btn" href="https://intervals.icu/" target="_blank" rel="noopener">Åbn Intervals.icu</a></div><p class="hp-fine">Strength 2.0 gemmer lokalt i denne browser. Telefon og PC synkroniseres endnu ikke.</p></section>`;
  $('hp-week').value=state.weeks[monday]||'';
  $('hp-week').addEventListener('change',event=>{state.weeks[monday]=event.target.value;if(!persist())alert('Ugens ramme kunne ikke gemmes.');});
  $('dashboard').querySelectorAll('[data-start]').forEach(btn=>btn.addEventListener('click',()=>start(btn.dataset.start)));
}
function renderStrength(){
  const p=PROGRAMS[selected],d=draft();
  root.innerHTML=`<div class="hp-tabs" aria-label="Vælg program">${Object.keys(PROGRAMS).map(key=>`<button class="hp-btn" data-program="${key}" aria-pressed="${key===selected}">${key}</button>`).join('')}</div>
    <section class="hp-card"><div class="hp-meta"><h2>${selected} · ${p.name}</h2><span class="hp-badge">${p.duration}</span></div><p>${p.description}</p>
    <p class="hp-fine">Ca. 40 min: de første fire kerneøvelser. 50–60 min: tilføj ekstraøvelser efter tid. Opvarmning og udstyrsskift kan forlænge passet.</p>
    <div class="hp-actions"><button class="hp-btn" id="hp-core" aria-pressed="${coreOnly}">${coreOnly?'Vis alle øvelser':'Vis kun kerne'}</button>${!d?'<button class="hp-btn primary" id="hp-begin">Start pas</button>':''}</div></section>
    <div id="hp-status" class="hp-status" role="status">${blocked?'Lager kunne ikke læses. Eksisterende data overskrives ikke.':d?'Kladde · '+esc(d.date)+' · gemmes på denne enhed':'Klar til et nyt pas'}</div>
    <div id="hp-timer" class="hp-timer" ${timerEnd?'':'hidden'}><span>Pause</span><output id="hp-clock"></output><button class="hp-btn" id="hp-stop">Stop</button></div>
    <div>${p.exercises.map((ex,i)=>renderExercise(ex,i,d)).join('')}</div>
    ${d?`<label class="hp-field">Noter til passet<textarea id="hp-notes" class="na" maxlength="2000" placeholder="Teknik, energi eller ændringer…">${esc(d.notes)}</textarea></label><div class="hp-actions"><button id="hp-finish" class="hp-btn primary">Afslut og gem udførte sæt</button></div><p class="hp-fine">Kun afkrydsede sæt gemmes som udførte. Ikke udførte sæt tæller ikke med.</p>`:''}
    <section class="hp-card hp-history" style="margin-top:20px"><h2>Din træningshistorik</h2>${renderHistory()}</section>
    <section class="hp-card"><h2>Dine data</h2><p>Gamle registreringer bevares i deres oprindelige format. De er ikke automatisk omfortolket til udførte Strength 2.0-sæt.</p><div class="hp-actions"><button class="hp-btn" id="hp-backup">Eksportér sikkerhedskopi</button></div><details class="hp-legacy"><summary>Se tidligere registreringer</summary><pre id="hp-legacy-data"></pre></details></section>`;
  root.querySelectorAll('[data-program]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.program;renderStrength();}));
  $('hp-core').addEventListener('click',()=>{coreOnly=!coreOnly;renderStrength();});
  $('hp-begin')?.addEventListener('click',()=>{ensureDraft();renderStrength();persist();renderDashboard();});
  $('hp-stop').addEventListener('click',()=>{timerEnd=0;updateTimer();});
  $('hp-notes')?.addEventListener('input',event=>{draft().notes=event.target.value;persist();});
  $('hp-finish')?.addEventListener('click',finish);
  $('hp-backup').addEventListener('click',downloadBackup);
  try {$('hp-legacy-data').textContent=storage?.getItem(LEGACY_KEY)||'Ingen tidligere registreringer på denne enhed.';}catch{$('hp-legacy-data').textContent='Browserlager utilgængeligt.';}
  root.querySelectorAll('[data-field]').forEach(input=>input.addEventListener(input.type==='checkbox'?'change':'input',editSet));
  root.querySelectorAll('[data-rest]').forEach(btn=>btn.addEventListener('click',()=>{timerEnd=Date.now()+Number(btn.dataset.rest)*1000;updateTimer();}));
  updateTimer();
}
function renderExercise(ex,index,d){
  if(coreOnly&&index>=4)return '';
  const previous=lastExercise(state.sessions,ex.id),sets=d?.exercises[index].sets;
  const previousText=previous?`${previous.date}: ${previous.sets.map(s=>`${s.weight} kg × ${s.value} ${ex.unit} @ RIR ${s.rir}`).join(' · ')}`:'Ingen udførte sæt endnu';
  const progression=previous&&ex.unit==='reps'&&previous.sets.length>=ex.sets&&previous.sets.every(s=>Number(s.value)>=ex.max&&Number(s.rir)>=2);
  return `<section class="hp-exercise"><div class="hp-meta"><h3>${index+1}. ${ex.name}</h3><span class="hp-badge">${index<4?'Kerne':'Ekstra'}</span></div>
    <p>${ex.sets} × ${ex.min}${ex.min===ex.max?'':'–'+ex.max} ${ex.unit} ${ex.side} · RIR ca. ${ex.rir} · Pause ${ex.rest} sek · ${ex.load}</p>
    <p>Senest: ${esc(previousText)}</p>${progression?'<p style="color:var(--gold)">Øvre repmål nået med RIR ≥ 2 i alle sæt. Overvej en lille vægtstigning, hvis teknikken var god.</p>':''}
    ${sets?`<div class="hp-set labels"><span>Sæt</span><span>${ex.load}</span><span>${ex.unit}${ex.side?' / side':''}</span><span>RIR</span><span>Udført</span></div>${sets.map((s,j)=>`<div class="hp-set ${s.done?'done':''}"><span>${j+1}</span>${['weight','value','rir'].map(field=>`<input type="number" inputmode="decimal" min="${field==='value'?1:0}" max="${field==='weight'?1000:field==='rir'?10:10000}" step="${field==='value'?1:.5}" aria-label="${ex.name}, sæt ${j+1}, ${field==='weight'?ex.load:field==='value'?ex.unit:'RIR'}" value="${esc(s[field])}" data-ex="${index}" data-set="${j}" data-field="${field}">`).join('')}<input type="checkbox" aria-label="${ex.name}, sæt ${j+1} udført" data-ex="${index}" data-set="${j}" data-field="done" ${s.done?'checked':''}></div>`).join('')}`:''}
    <div class="hp-actions"><button class="hp-btn" data-rest="${ex.rest}">Start ${ex.rest} sek pause</button></div></section>`;
}
function editSet(event){
  const el=event.target,{ex,set,field}=el.dataset,s=draft().exercises[ex].sets[set];
  if(field==='done'){
    if(el.checked&&!validSet(s)){el.checked=false;status('Udfyld gyldig vægt, reps/distance/tid og RIR før sættet markeres udført. Brug 0 kg ved kropsvægt.');return;}
    s.done=el.checked;
  }else{
    if(!el.validity.valid){status('Kontrollér tallet: ingen negative værdier; RIR 0–10.');el.value=s[field];return;}
    s[field]=el.value;
    if(s.done&&!validSet(s)){s.done=false;el.parentElement.querySelector('[type=checkbox]').checked=false;}
  }
  el.parentElement.classList.toggle('done',s.done);persist();
}
function finish(){
  const d=draft(),exercises=d.exercises.map(ex=>({...ex,sets:ex.sets.filter(s=>s.done&&validSet(s))})).filter(ex=>ex.sets.length);
  if(!exercises.length){status('Markér mindst ét gyldigt sæt som udført først.');return;}
  const session={...d,exercises,finishedAt:new Date().toISOString()};
  state.sessions.unshift(session);delete state.drafts[selected];
  if(!persist()){state.sessions.shift();state.drafts[selected]=d;return;}
  timerEnd=0;renderStrength();status('Pas gemt — '+exercises.reduce((sum,ex)=>sum+ex.sets.length,0)+' udførte sæt');renderDashboard();
}
function renderHistory(){
  if(!state.sessions.length)return '<p>Afslut dit første pas for at se historikken her.</p>';
  return `<details><summary>${state.sessions.length} gemte pas · vis historik</summary>${state.sessions.map(s=>`<article><strong>${esc(s.date)} · ${esc(s.program)} · ${s.exercises.reduce((n,ex)=>n+ex.sets.length,0)} sæt</strong><ul>${s.exercises.map(ex=>{const spec=PROGRAMS[s.program]?.exercises.find(x=>x.id===ex.id);return `<li>${esc(spec?.name||ex.id)}: ${ex.sets.map(set=>`${esc(set.weight)} kg × ${esc(set.value)} ${esc(spec?.unit||'reps')} @ RIR ${esc(set.rir)}`).join(' · ')}</li>`;}).join('')}</ul>${s.notes?`<p>${esc(s.notes)}</p>`:''}</article>`).join('')}</details>`;
}
function updateTimer(){
  const panel=$('hp-timer');if(!panel)return;
  if(!timerEnd){panel.hidden=true;return;}
  panel.hidden=false;const seconds=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));
  $('hp-clock').textContent=seconds?`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'Pausen er slut';
}
setInterval(updateTimer,500);
document.addEventListener('hp:view',event=>{if(event.detail==='home')renderDashboard();});
renderStrength();renderDashboard();
