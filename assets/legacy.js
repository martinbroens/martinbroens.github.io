
var TITLES={home:'',madplan:'Madplan',tracker:'Strength 2.0',mobility:'Mobility',mental:'Mental Performance',running:'Running Performance',goals:'Dine mål',more:'Human Performance'};
var _sy=0;
document.addEventListener('touchstart',function(e){_sy=e.touches[0].clientY;},{passive:true});
function st(e,view){if(Math.abs(e.changedTouches[0].clientY-_sy)<12){e.preventDefault();showView(view);}}
function showView(view){
  if(!document.getElementById('view-'+view)) return;
  document.querySelectorAll('.view-panel').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  var panel=document.getElementById('view-'+view);
  var btn=document.getElementById('nav-'+view);
  var hdr=document.getElementById('app-header');
  var ttl=document.getElementById('header-title');
  if(panel){panel.classList.add('active');window.scrollTo(0,0);}
  if(!btn)btn=document.getElementById('nav-more');
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.setAttribute('aria-current',n===btn?'page':'false'));
  if(hdr)hdr.classList.toggle('hidden',view==='home');
  if(ttl)ttl.textContent=TITLES[view]||'';
  document.dispatchEvent(new CustomEvent('hp:view', {detail:view}));
}
(function(){
  var d=['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
  var m=['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
  var n=new Date();
  var el=document.getElementById('splash-date');
  if(el)el.textContent=d[n.getDay()]+' · '+n.getDate()+'. '+m[n.getMonth()]+' '+n.getFullYear();
})();

document.addEventListener('DOMContentLoaded',function(){
  // Universal toggle for all expandable cards
  var toggleSels=['.meal-header','.protocol-block','.tool-card','.ec','.ex-head'];
  toggleSels.forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      var sy=0,mv=false;
      el.addEventListener('touchstart',function(e){sy=e.touches[0].clientY;mv=false;},{passive:true});
      el.addEventListener('touchmove',function(e){if(Math.abs(e.touches[0].clientY-sy)>10)mv=true;},{passive:true});
      el.addEventListener('touchend',function(e){
        if(!mv){
          e.preventDefault();
          var card=el.classList.contains('meal-header')||el.classList.contains('ex-head')
            ?el.parentElement
            :el;
          card.classList.toggle('open');
        }
      },{passive:false});
    });
  });
  // Victory tracker
  document.querySelectorAll('.v-day').forEach(function(d){
    var sy=0;
    d.addEventListener('touchstart',function(e){sy=e.touches[0].clientY;},{passive:true});
    d.addEventListener('touchend',function(e){
      if(Math.abs(e.changedTouches[0].clientY-sy)<10){
        e.preventDefault();
        if(!d.classList.contains('won')&&!d.classList.contains('lost'))d.classList.add('won');
        else if(d.classList.contains('won')){d.classList.remove('won');d.classList.add('lost');}
        else d.classList.remove('lost');
      }
    },{passive:false});
  });
  // Baseline history
  document.querySelectorAll('.bhist-btn').forEach(function(btn){
    btn.addEventListener('touchend',function(e){
      e.preventDefault();
      var m=btn.getAttribute('onclick').match(/'([^']+)'/);
      if(m)tbh(m[1]);
    },{passive:false});
  });
});

// Desktop click handlers
function tog(el){el.classList.toggle('open');}
function togTool(el){el.classList.toggle('open');}
function toggleDay(el){
  if(!el.classList.contains('won')&&!el.classList.contains('lost'))el.classList.add('won');
  else if(el.classList.contains('won')){el.classList.remove('won');el.classList.add('lost');}
  else el.classList.remove('lost');
}

// MODULE JS

// MADPLAN JS
// ═══════════════════════════════════
// Touch handled globally

// ═══════════════════════════════════
// TRACKER JS
// ═══════════════════════════════════
const SK = 'styrke_v4';
const DOB = new Date(1977, 5, 19);

function getAge() {
  const now = new Date();
  let y = now.getFullYear() - DOB.getFullYear();
  const m = now.getMonth() - DOB.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < DOB.getDate())) y--;
  const days = Math.floor((now - new Date(DOB.getFullYear() + y, DOB.getMonth(), DOB.getDate())) / 86400000);
  const months = Math.floor(days / 30.44);
  return { years: y, months };
}

function ageRed() {
  const over = Math.max(0, getAge().years - 40);
  return Math.max(0.70, 1 - over * 0.01);
}

function r25(v) { return Math.round(v / 2.5) * 2.5; }

function calcB() {
  const bw = parseFloat(document.getElementById('bw')?.value) || 0;
  const red = ageRed();
  const { years, months } = getAge();
  const adsp = document.getElementById('adsp');
  if (adsp) adsp.textContent = `${years} år ${months} mdr · Aldersreduktion: ${((1-red)*100).toFixed(0)}%`;
  if (!bw || bw < 0) return;

  const lifts = [
    { ids:['sq-b','sq-g','sq-gr'], m:[0.8,1.2,1.5], u:'kg' },
    { ids:['dl-b','dl-g','dl-gr'], m:[1.0,1.5,1.8], u:'kg' },
    { ids:['bp-b','bp-g','bp-gr'], m:[0.6,1.0,1.3], u:'kg' },
    { ids:['mp-b','mp-g','mp-gr'], m:[0.35,0.55,0.75], u:'kg' },
    { ids:['bor-b','bor-g','bor-gr'], m:[0.5,0.75,1.0], u:'kg' },
    { ids:['lat-b','lat-g','lat-gr'], m:[0.45,0.65,0.85], u:'kg' },
  ];
  lifts.forEach(l => l.m.forEach((mult,i) => {
    const el = document.getElementById(l.ids[i]);
    if (el) el.textContent = r25(bw * mult * red) + ' ' + l.u;
  }));



  const data = gs(); data['bw'] = bw; ss(data);
}

function autoSaveTest() {
  clearTimeout(window._bt);
  window._bt = setTimeout(saveTest, 1200);
}

function saveTest() {
  const bw = parseFloat(document.getElementById('bw')?.value) || 0;
  if (!bw) return;
  const red = ageRed();
  const t = today();
  const data = gs();
  const { years, months } = getAge();

  const tests = [
    { key:'sq', label:'Squat', m:[0.8,1.2,1.5], u:'kg' },
    { key:'dl', label:'Deadlift', m:[1.0,1.5,1.8], u:'kg' },
    { key:'bp', label:'Bænkpres', m:[0.6,1.0,1.3], u:'kg' },
    { key:'mp', label:'Military', m:[0.35,0.55,0.75], u:'kg' },
    { key:'bor', label:'Row', m:[0.5,0.75,1.0], u:'kg' },
    { key:'lat', label:'Lat Pulldown', m:[0.45,0.65,0.85], u:'kg' },
    { key:'fc', label:'Carry', m:[0.35,0.5,0.65], u:'kg' },
  ];

  tests.forEach(t2 => {
    const hk = 'bh_' + t2.key;
    const hist = data[hk] || [];
    const vals = t2.m.map(m => r25(bw * m * red) + t2.u).join(' / ');
    const entry = { date: t, bw, age: `${years}år`, vals };
    const idx = hist.findIndex(h => h.date === t);
    if (idx >= 0) hist[idx] = entry; else hist.unshift(entry);
    data[hk] = hist.slice(0, 20);
  });

  // Pull-ups
  const puH = data['bh_pu'] || [];
  const puV = [Math.max(3,Math.round(5*red)), Math.max(6,Math.round(10*red)), Math.max(10,Math.round(15*red))];
  const puEntry = { date: t, bw, age: `${years}år`, vals: puV.join(' / ') + ' reps' };
  const puIdx = puH.findIndex(h => h.date === t);
  if (puIdx >= 0) puH[puIdx] = puEntry; else puH.unshift(puEntry);
  data['bh_pu'] = puH.slice(0, 20);

  // Plank
  const plH = data['bh_pl'] || [];
  const plV = [Math.round(20*red), Math.round(35*red), Math.round(50*red)];
  const plEntry = { date: t, bw, age: `${years}år`, vals: plV.join(' / ') + ' sek' };
  const plIdx = plH.findIndex(h => h.date === t);
  if (plIdx >= 0) plH[plIdx] = plEntry; else plH.unshift(plEntry);
  data['bh_pl'] = plH.slice(0, 20);

  ss(data);
  loadBHist();
  const el = document.getElementById('sstatus');
  if (el) { el.textContent = '✓ Test gemt'; setTimeout(()=>el.textContent='', 2500); }
}

function loadBHist() {
  const data = gs();
  ['sq','dl','bp','mp','bor','lat','pu','fc','pl'].forEach(key => {
    const hk = 'bh_' + key;
    const hist = data[hk] || [];
    const el = document.getElementById('bh-' + key);
    if (!el) return;
    el.innerHTML = hist.length === 0
      ? '<div class="bhi"><span class="bhid">Ingen historik endnu</span></div>'
      : hist.map(h => `<div class="bhi"><span class="bhid">${h.date} · ${h.bw}kg · ${h.age}</span><span class="bhiv">${h.vals}</span></div>`).join('');
  });
}

function tbh(key) {
  const el = document.getElementById('bh-' + key);
  if (el) el.classList.toggle('show');
}

// ── Exercise tracking ──
const GRP = [
  {id:'g0', d:'g0d', dh:'g0dh', f:['g0k','g0n']},
  {id:'gsq', d:'gsqd', dh:'gsqdh', f:['gsq1','gsq2','gsq3','gsq4','gsq5','gsqn']},
  {id:'gdl', d:'gdld', dh:'gdldh', f:['gdl1','gdl2','gdl3','gdln']},
  {id:'gbp', d:'gbpd', dh:'gbpdh', f:['gbp1','gbp2','gbp3','gbp4','gbpn']},
  {id:'gld', d:'gldd', dh:'glddh', f:['gld1','gld2','gld3','gld4','gldn']},
  {id:'gmp', d:'gmpd', dh:'gmpdh', f:['gmp1','gmp2','gmp3','gmpn']},
  {id:'gbss', d:'gbssd', dh:'gbssdh', f:['gbss1','gbss2','gbss3','gbssn']},
  {id:'gslr', d:'gslrd', dh:'gslrdh', f:['gslr1','gslr2','gslr3','gslrn']},
  {id:'ght', d:'ghtd', dh:'ghtdh', f:['ght1','ght2','ght3','ghtn']},
  {id:'grdl', d:'grdld', dh:'grdldh', f:['grdl1','grdl2','grdl3','grdln']},
  {id:'gpl', d:'gpld', dh:'gpldh', f:['gpls','gpln']},
  {id:'gfc', d:'gfcd', dh:'gfcdh', f:['gfcw','gsps','gfcn']},
  {id:'gdips', d:'gdipsd', dh:'gdipsdh', f:['gdips','gdipsn']},
  {id:'gcurl', d:'gcurld', dh:'gcurldh', f:['gcurl1','gcurl2','gcurl3','gcurln']},
  {id:'h0', d:'h0d', dh:'h0dh', f:['h0v','h0n']},
  {id:'hgs', d:'hgsd', dh:'hgsdh', f:['hgs1','hgs2','hgs3','hgs4','hgsn']},
  {id:'hrd', d:'hrdd', dh:'hrddh', f:['hrd1','hrd2','hrd3','hrdn']},
  {id:'hpu', d:'hpud', dh:'hpudh', f:['hpub','hpus','hpue','hpun']},
  {id:'hrw', d:'hrwd', dh:'hrwdh', f:['hrw1','hrw2','hrw3','hrw4','hrwn']},
  {id:'hsp', d:'hspd', dh:'hspdh', f:['hsp1','hsp2','hsp3','hspn']},
  {id:'hlu', d:'hlud', dh:'hludh', f:['hlu1','hlu2','hlu3','hlun']},
  {id:'hsl', d:'hsld', dh:'hsldh', f:['hsl1','hsl2','hsl3','hsln']},
  {id:'hgb', d:'hgbd', dh:'hgbdh', f:['hgb1','hgb2','hgb3','hgbn']},
  {id:'hci', d:'hcid', dh:'hcidh', f:['hpls','hdbr','hfww','hcin']},
  {id:'htri', d:'htrid', dh:'htridh', f:['htri1','htri2','htri3','htrin']},
  {id:'hcrl', d:'hcrld', dh:'hcrldh', f:['hcrl1','hcrl2','hcrl3','hcrln']},
];

function gs(){try{return JSON.parse(localStorage.getItem(SK))||{};}catch{return{};}}
function ss(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch{}}
function today(){return new Date().toLocaleDateString('da-DK',{day:'2-digit',month:'2-digit',year:'numeric'});}

window.addEventListener('load', () => {
  const data = gs(), t = today();
  const bwEl = document.getElementById('bw');
  if (bwEl && data['bw']) bwEl.value = data['bw'];
  calcB();

  GRP.forEach(g => {
    g.f.forEach(id => { const el=document.getElementById(id); if(el&&data[id]!==undefined) el.value=data[id]; });
    const lbl=document.getElementById(g.d), hid=document.getElementById(g.dh);
    const saved=data[g.dh];
    if(lbl) lbl.textContent=saved||t;
    if(hid) hid.value=saved||t;
  });
  loadHist();
  loadBHist();
});

function save() {
  const data=gs(), t=today();
  GRP.forEach(g => {
    g.f.forEach(id => { const el=document.getElementById(id); if(el) data[id]=el.value; });
    const lbl=document.getElementById(g.d), hid=document.getElementById(g.dh);
    if(lbl) lbl.textContent=t;
    if(hid){hid.value=t; data[g.dh]=t;}
    const hk='h_'+g.id, hist=data[hk]||[];
    const vals=g.f.filter(f=>!f.endsWith('n')&&!f.endsWith('v')).map(f=>{const el=document.getElementById(f);return el&&el.value?el.value:null;}).filter(Boolean);
    if(vals.length){
      const entry={date:t, weights:vals.join(' · ')};
      const idx=hist.findIndex(h=>h.date===t);
      if(idx>=0) hist[idx]=entry; else hist.unshift(entry);
      data[hk]=hist.slice(0,12);
    }
  });
  ss(data);
  const el=document.getElementById('sstatus');
  if(el){el.textContent='✓ Gemt';setTimeout(()=>el.textContent='',2000);}
  loadHist();
}

function md(){clearTimeout(window._t);window._t=setTimeout(save,900);const el=document.getElementById('sstatus');if(el)el.textContent='...';}

function loadHist(){
  const data=gs();
  GRP.forEach(g=>{
    const hk='h_'+g.id, hist=data[hk]||[];
    const el=document.getElementById('h'+g.id);
    if(!el)return;
    el.innerHTML=hist.length===0
      ?'<div class="hi2"><span class="hid">Ingen historik endnu</span></div>'
      :hist.map(h=>`<div class="hi2"><span class="hid">${h.date}</span><span class="hiw">${h.weights}</span></div>`).join('');
  });
}

function th(id){const el=document.getElementById('h'+id);if(el)el.classList.toggle('show');}
// tog() defined globally above
function sv(v,btn){
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(x=>x.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  btn.classList.add('active');
}
window.addEventListener('beforeunload',e=>{if(window._t){e.preventDefault();e.returnValue='';}});

// ═══════════════════════════════════
// MOBILITY JS
// ═══════════════════════════════════
// MENTAL JS
// ═══════════════════════════════════
// Mental JS functions defined globally

// Update dynamic age displays
(function() {
  var dob = new Date(1977, 5, 19);
  var now = new Date();
  var age = now.getFullYear() - dob.getFullYear();
  var m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  
  // Update all dynamic age spans
  document.querySelectorAll('.dyn-age').forEach(function(el) {
    el.textContent = age;
  });
  var mobAge = document.getElementById('mob-age');
  if (mobAge) mobAge.textContent = age;
  
  // Update baseline title in tracker
  var bsecTitle = document.querySelector('.btitl');
  if (bsecTitle && bsecTitle.textContent.includes('Baseline')) {
    // Already handled by getAge() in tracker
  }
})();

