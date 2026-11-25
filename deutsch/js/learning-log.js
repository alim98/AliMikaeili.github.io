/* ================================================================
   LEARNING LOG · 🏠 HOME · 📊 MY PROGRESS
   ----------------------------------------------------------------
   Every action is saved as one "event" in a database inside this
   browser: IndexedDB "deutsch-practice-a11-2026-v1-history", object
   store "events" (falls back to localStorage if IndexedDB is blocked).
   Export: 📊 My progress → Your data (.json backup or .csv).

   Event fields (only the ones that apply are stored):
     uid      unique id                     ts       time, ms since 1970
     day      local date YYYY-MM-DD         session  study session (new after 30 min idle)
     section  vocab | gender | reading | verbs | talk | days | home | stats
     action   answer | hint | listen | lookup | open-text | archive | restore |
              list-add | list-remove | setting | nav
     mode     en-de/de-en · singular/plural · quiz · table/swap · answer/ask/build · abbr/next/prev/en/am/listen/order
     item     id of the card / sentence      label    readable name of it
     prompt   what you were asked            given    what you answered
     expected the correct answer             result   correct | wrong | revealed | skipped
     ms       time from seeing the question to answering
     hints    hints used before answering    errors   mistake categories, e.g. ["wrong article"]
     details  extra info (lesson, rule, per-person verb results, tips, …)
   ================================================================ */
(()=>{
'use strict';
const KEY='deutsch-practice-a11-2026-v1';            // same as storeKey in the main script
const LS_EV=KEY+'-events',DBNAME=KEY+'-history',STORE='events';
const BACKUP_KEY='deutsch-practice-last-backup';      // outside KEY so an import doesn't overwrite it
const SESSION_GAP=30*60e3,DAYMS=864e5;
const SECTIONS=['vocab','gender','reading','verbs','talk','days'];
const SEC={home:{i:'🏠',n:'Home'},vocab:{i:'📚',n:'Vocabulary'},gender:{i:'🎨',n:'der · die · das'},reading:{i:'📖',n:'Reading'},verbs:{i:'🔁',n:'Verbs'},talk:{i:'💬',n:'Ask & answer'},days:{i:'📅',n:'Wochentage'},stats:{i:'📊',n:'My progress'}};
const C_OK='#1f9d6a',C_BAD='#b4323f';                 // validated pair (colour-blind safe on white)
const $=id=>document.getElementById(id);
const H=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strip=html=>{const t=document.createElement('template');t.innerHTML=String(html??'');return t.content.textContent.replace(/\s+/g,' ').trim();};
const pad=n=>String(n).padStart(2,'0');
const dayOf=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
const startOfDay=ts=>{const d=new Date(ts);d.setHours(0,0,0,0);return +d;};
const secNow=()=>{try{return activeTab;}catch(e){return '';}};
const say=m=>{try{toast(m);}catch(e){}};
const pct=(a,b)=>b?Math.round(100*a/b)+'%':'—';
const groupBy=(a,f)=>a.reduce((m,x)=>{const k=f(x);(m[k]||(m[k]=[])).push(x);return m;},{});
const median=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};

/* ---------------- storage ---------------- */
let db=null,store='starting',EV=[],early=[],ready=false,warned=false;
const waiters=[],cur={};
let sid=newSid(),lastTs=0;
function newSid(){const d=new Date();return 'S'+dayOf(+d).replace(/-/g,'')+'-'+pad(d.getHours())+pad(d.getMinutes())+'-'+Math.random().toString(36).slice(2,5);}
function warn(m){console.warn(m);if(!warned){warned=true;say(m);}}
const validEv=e=>!!e&&typeof e==='object'&&typeof e.uid==='string'&&typeof e.ts==='number';
function lsRead(){try{const a=JSON.parse(localStorage.getItem(LS_EV)||'[]');return Array.isArray(a)?a.filter(validEv):[];}catch(e){return [];}}
function lsWrite(){try{localStorage.setItem(LS_EV,JSON.stringify(EV));}catch(e){warn('Browser storage is full – open 📊 My progress → Your data and export your history so nothing is lost.');}}
function openIDB(){return new Promise((res,rej)=>{let req;try{if(!window.indexedDB)throw new Error('IndexedDB not available');req=indexedDB.open(DBNAME,1);}catch(e){rej(e);return;}
  const t=setTimeout(()=>rej(new Error('IndexedDB timeout')),5000);
  req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE)){const s=d.createObjectStore(STORE,{keyPath:'uid'});s.createIndex('ts','ts');s.createIndex('section','section');}};
  req.onsuccess=()=>{clearTimeout(t);res(req.result);};req.onerror=()=>{clearTimeout(t);rej(req.error);};});}
function tx(mode,fn){return new Promise((res,rej)=>{const t=db.transaction(STORE,mode),s=t.objectStore(STORE);let out;const r=fn(s);if(r)r.onsuccess=()=>{out=r.result;};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error);});}
function persist(list){
  if(store==='idb')tx('readwrite',s=>{list.forEach(e=>s.put(e));}).catch(err=>{console.warn(err);store='local';lsWrite();warn('Could not write to the browser database – switched to simpler storage. Export your history soon.');});
  else if(store==='local')lsWrite();
}
async function init(){
  try{
    db=await openIDB();db.onversionchange=()=>{try{db.close();}catch(e){}};store='idb';
    EV=(await tx('readonly',s=>s.getAll()))||[];
    const old=lsRead();                 // move events from an earlier localStorage fallback
    if(old.length){const have=new Set(EV.map(e=>e.uid)),extra=old.filter(e=>!have.has(e.uid));if(extra.length){await tx('readwrite',s=>{extra.forEach(e=>s.put(e));});EV.push(...extra);}try{localStorage.removeItem(LS_EV);}catch(e){}}
  }catch(err){console.warn('Learning log: IndexedDB unavailable, using localStorage instead.',err);db=null;store='local';EV=lsRead();}
  EV.sort((a,b)=>a.ts-b.ts);
  const last=EV[EV.length-1];
  if(last&&last.session&&(early[0]?early[0].ts:Date.now())-last.ts<SESSION_GAP){sid=last.session;early.forEach(e=>{e.session=sid;});}
  if(last)lastTs=Math.max(lastTs,last.ts);
  if(early.length){EV.push(...early);persist(early.splice(0));}
  ready=true;
  waiters.splice(0).forEach(f=>{try{f();}catch(e){console.error(e);}});
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});}catch(e){}
}
function whenReady(f){if(ready)f();else waiters.push(f);}
const readyP=()=>new Promise(r=>whenReady(r));
function compact(o){if(!o||typeof o!=='object'||Array.isArray(o))return o;const r={};for(const [k,v] of Object.entries(o))if(v!==undefined&&v!==null&&v!==''&&v!==false&&!(Array.isArray(v)&&!v.length))r[k]=v;return Object.keys(r).length?r:undefined;}
function add(o){
  const ts=Date.now();
  if(lastTs&&ts-lastTs>SESSION_GAP)sid=newSid();
  lastTs=ts;
  const e={uid:ts.toString(36)+'-'+Math.random().toString(36).slice(2,8),ts,day:dayOf(ts),session:sid};
  for(const [k,v0] of Object.entries(o)){let v=k==='details'?compact(v0):v0;if(v===undefined||v===null||v===''||(Array.isArray(v)&&!v.length))continue;if(typeof v==='string'&&v.length>500)v=v.slice(0,500)+'…';e[k]=v;}
  if(!ready)early.push(e);else{EV.push(e);persist([e]);}
  return e;
}
async function importEvents(list){
  await readyP();
  const have=new Set(EV.map(e=>e.uid)),neu=(list||[]).filter(e=>validEv(e)&&!have.has(e.uid)).map(e=>({...e,day:e.day||dayOf(e.ts)}));
  if(!neu.length)return 0;
  if(store==='idb')await tx('readwrite',s=>{neu.forEach(e=>s.put(e));});
  EV.push(...neu);EV.sort((a,b)=>a.ts-b.ts);
  if(store!=='idb')lsWrite();
  return neu.length;
}
async function clearAll(){await readyP();if(store==='idb')await tx('readwrite',s=>s.clear());EV=[];try{localStorage.removeItem(LS_EV);}catch(e){}}
const lastExport=()=>{try{return Number(localStorage.getItem(BACKUP_KEY))||0;}catch(e){return 0;}};

/* ---------------- what gets logged ---------------- */
function shown(sec){cur[sec]={t:Date.now(),hints:0};}
function hint(sec,item){if(cur[sec])cur[sec].hints++;add({section:sec,action:'hint',item:item==null?undefined:String(item)});}
function answer(o){const c=cur[o.section];return add({section:o.section,action:'answer',mode:o.mode,item:o.item==null?undefined:String(o.item),label:o.label,prompt:o.prompt,given:o.given,expected:o.expected,result:o.result,ms:c?Date.now()-c.t:undefined,hints:c?c.hints:undefined,errors:o.errors,details:o.details});}

const typoLimit=n=>n<=4?1:n<=8?2:3;
/* edit distance where swapping two neighbouring letters counts as one typo (Name → Naem) */
function typoDist(a,b){const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];for(let j=1;j<=b.length;j++)d[i][j]=i?Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1),(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])?d[i-2][j-2]+1:1e9):j;}return d[a.length][b.length];}
function vocabErr(given,c,target){
  const g=norm(given);if(!g)return {errors:['empty answer']};
  const al=aliases(c,target).map(x=>norm(x));
  if(al.includes(g))return {errors:['capital letters']};             // only possible with "Check German capitalization"
  const noun=target==='de'&&isNoun(c),ART=/^(der|die|das) /;
  const body=s=>noun?s.replace(ART,''):s,art=s=>(s.match(ART)||[])[1]||'';
  const gb=body(g);
  // typed the answer of a different card?
  const other=vocabulary.find(o=>o.id!==c.id&&aliases(o,target).some(x=>{const n=norm(x);return n===g||(noun&&gb.length>1&&body(n)===gb&&!al.some(a=>body(a)===gb));}));
  if(other){const src=target==='de'?'en':'de',syn=norm(other[src])===norm(c[src]);return {errors:[syn?'synonym from another card':'mixed up with another word'],mixed:{id:other.id,de:other.de,en:other.en}};}
  let best=al[0],bd=1e9;al.forEach(x=>{const d=typoDist(body(x),gb);if(d<bd){bd=d;best=x;}});
  const errs=[];
  if(noun&&bd<=typoLimit(body(best).length)){const ga=art(g),ea=art(best);if(ea&&ga!==ea&&(ga||$('articles').checked))errs.push(ga?'wrong article':'missing article');}
  if(bd>0&&bd<=typoLimit(body(best).length))errs.push('spelling');
  return {errors:errs.length?errs:['wrong word']};
}
function vocabAnswer(c,dir,result,given){
  const target=dir==='en-de'?'de':'en';
  const prev=EV.filter(e=>e.action==='answer'&&e.section==='vocab'&&e.item===c.id);
  let errors,mixed;
  if(result==='wrong'){const r=vocabErr(given||'',c,target);errors=r.errors;mixed=r.mixed;}
  answer({section:'vocab',mode:dir,item:c.id,label:c.de,prompt:dir==='en-de'?c.en:c.de,given:String(given||'').trim(),expected:target==='de'?c.de:c.en,result,errors,
    details:{topic:labels[c.cat]||c.cat,lesson:(LESSONS[c.les]||{}).label,mixedWith:mixed,strictCaps:$('caseStrict').checked}});
  if(result!=='skipped')pastNote(prev,c);
}
function pastNote(prev,c){
  const tries=prev.filter(e=>e.result!=='skipped');if(!tries.length)return;
  const ok=tries.filter(e=>e.result==='correct').length,last=tries[tries.length-1];
  const w=topWrongs(tries,3);
  const d=document.createElement('div');d.className='pastnote';
  d.innerHTML=`📒 Your history with this card (before this answer): <b>${tries.length}</b> ${tries.length===1?'try':'tries'} · ✓ ${ok} · ✗ ${tries.length-ok} · last time ${H(ago(last.ts))}`+(w.length?`<br>Earlier wrong answers: ${w.map(([g,n])=>`<span class="pw">${H(g)}</span>${n>1?' ×'+n:''}`).join(' ')}`:'');
  const b=document.createElement('button');b.type='button';b.className='linkbutton';b.textContent='Full history →';b.addEventListener('click',()=>openItem('vocab',c.id));d.append(b);
  const f=$('feedback');if(f)f.append(d);
}
const ruleName=r=>r.id==='comp'?'Compound nouns (last word decides)':r.lab+(r.art?' → '+r.art:'');
function genderAnswer(n,chosen,ok){
  const r=ruleOf(n);
  answer({section:'gender',mode:n.plural?'plural':'singular',item:n.id,label:n.word,prompt:n.word,given:chosen,expected:n.art,result:ok?'correct':'wrong',
    errors:ok?undefined:[`${n.art}-word → ${chosen}`],details:{meaning:n.en,rule:r?ruleName(r):'no rule – learn by heart',exception:!!(r&&r.art&&r.id!=='comp'&&!n.ok.includes(r.art))}});
}
function readingAnswer(t,qi,oi){const q=t.q[qi],o=q.t==='tf'?['True','False']:q.o;answer({section:'reading',mode:'quiz',item:t.id+'#'+(qi+1),label:t.title,prompt:q.q,given:o[oi],expected:o[q.a],result:oi===q.a?'correct':'wrong',errors:oi===q.a?undefined:['comprehension'],details:{text:t.id,question:q.en}});}
function readingLookup(word,L){add({section:'reading',action:'lookup',item:String(word).toLocaleLowerCase('de'),label:word,expected:L?L.en:'',details:{text:(typeof rdText!=='undefined'&&rdText)?rdText.id:undefined}});}
function verbTable(v,parts,nOk){
  const ins=[...document.querySelectorAll('#vGrid input')].map(i=>i.value.trim());
  const cells=VPRON.map((p,i)=>{const exp=vForm(parts[i]);return {person:p,given:ins[i]||'',expected:exp,ok:vSame(ins[i]||'',exp)};});
  answer({section:'verbs',mode:'table',item:v.id,label:v.inf,prompt:v.inf+' – '+v.en,given:ins.join(' · '),expected:cells.map(x=>x.expected).join(' · '),result:nOk===6?'correct':'wrong',
    errors:cells.filter(x=>!x.ok).map(x=>x.person+' form'),details:{score:nOk+'/6',family:vFams(v.inf).map(f=>VFAM[f].t),cells}});
}
function verbSwap(sw,val,ok){
  const f=vConj(sw.inf)[sw.to.i],person=VPRON[sw.to.i],hasForm=tToks(val).some(w=>vSame(w,f));
  const v=vList.find(x=>x.inf===sw.inf);
  answer({section:'verbs',mode:'swap',item:v?v.id:sw.inf,label:sw.inf,prompt:vSentence(sw.t,sw.from,sw.inf)+' → '+sw.to.l,given:val,expected:sw.exp,result:ok?'correct':'wrong',
    errors:ok?undefined:[hasForm?'rest of the sentence':person+' form'],details:{person,verbForm:f,family:vFams(sw.inf).map(x=>VFAM[x].t)}});
}
const TPN={st:'statement',inv:'starts with another word',w:'W-question',yn:'yes/no question',jn:'Ja / Nein answer'};
function talkCats(tips){
  const out=new Set();
  tips.forEach(t=>{
    if(/\border\b/i.test(t))out.add('word order');
    else if(/^Verb ending/.test(t))out.add('verb ending');
    else if(/splits/.test(t))out.add('separable verb');
    else if(/^Pronoun/.test(t))out.add('er / es / sie');
    else if(/yourself|answer with|asking the other|politely|two friends|formal/i.test(t))out.add('switching the person (du → ich)');
    else if(/\bk?eine?, not|kein \/ keine/.test(t))out.add('ein / kein');
    else if(/You wrote .+ = /.test(t))out.add('W-word');
    else if(/^Spelling/.test(t))out.add('spelling');
    else if(/^Missing/.test(t))out.add('missing words');
    else if(/^Not needed/.test(t))out.add('extra or misspelled words');
    else out.add('other');
  });
  return out.size?[...out]:['other'];
}
function talkAnswer(it,val,revealed,ok,target){
  let errors,tips=[];
  if(!ok&&!revealed){try{tips=tDiagnose(val,target,it).map(strip);}catch(e){}errors=talkCats(tips);}
  const prompt=it.parts?`${TPLAB[it.parts.p]||it.parts.p} + ${tInf(it.act)} → ${TPN[it.parts.ty]||it.parts.ty}`:it.prompt;
  let pattern;try{pattern=TPN[tType(target)];}catch(e){}
  answer({section:'talk',mode:it.mode,item:it.key,label:it.acc[0],prompt,given:val,expected:target,result:ok?'correct':revealed?'revealed':'wrong',errors,
    details:{topic:it.t,lesson:it.les,cue:it.cue,pattern,tips,wordTiles:tHintLv>=2,spoken:!!tSpoken}});
}
function daysAnswer(it,ok,val,note,helped){
  const res=ok?'correct':it.type==='order'?(dOrderPos<7?'revealed':'wrong'):(val?'wrong':'revealed');
  const n=strip(note);let cat;
  if(res==='wrong'){cat=it.type==='order'?'week order':/^Spelling/.test(n)?'spelling':/English/.test(n)?'wrote English':(it.type==='am'&&/\bam\b/.test(n))?'am + day':/before|after|same day|today/i.test(n)?'next / previous day':/^Careful/.test(n)?'short forms':'wrong day';}
  answer({section:'days',mode:it.type,item:it.type+'|'+it.q,label:it.ans,prompt:it.q,given:val,expected:it.sol||it.ans,result:res,errors:cat?[cat]:undefined,
    details:{kind:DKIND[it.type],day:it.d>=0?DAYS[it.d][0]:undefined,wrongTaps:it.type==='order'?dOrderErr:undefined,note:n,hint:helped}});
}

/* settings changes, listening and navigation are logged centrally */
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.id||!t.closest||!t.closest('.layout')||t.closest('#tabStats,#tabHome')||t.id==='importFile')return;
  if(t.type==='checkbox'||t.tagName==='SELECT')add({section:secNow(),action:'setting',item:t.id,given:t.type==='checkbox'?String(t.checked):t.value});},true);
const LISTEN='#speakBtn,#gSpeak,#vSay,#tSay,#dSayBtn,#rdPlay,.rsay,button.chip,.speak-mini:not(.arch)';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||!b.closest('.layout,#wpop')||b.closest('#tabStats,#tabHome'))return;const d=b.dataset;
  if(d.mode||d.order||d.vmode||d.tmode){add({section:secNow(),action:'setting',item:d.mode?'direction':d.order?'card order':d.vmode?'verb exercise':'talk exercise',given:d.mode||d.order||d.vmode||d.tmode});return;}
  if(!b.matches(LISTEN))return;
  let c=null;try{c={speakBtn:()=>current&&{item:current.id,label:current.de},gSpeak:()=>gCur&&{item:gCur.id,label:gCur.word},vSay:()=>vCur&&{item:vCur.id,label:vCur.inf},tSay:()=>tCur&&{item:tCur.key,label:tCur.prompt},dSayBtn:()=>dCur&&{item:dCur.type+'|'+dCur.q,label:dCur.ans},rdPlay:()=>rdText&&{item:rdText.id,label:rdText.title}}[b.id]?.();}catch(err){}
  add({section:secNow(),action:'listen',...(c||{label:(b.getAttribute('aria-label')||b.title||b.textContent||'').replace(/^(Pronounce|Listen to)\s*/,'')})});},true);

/* ---------------- navigation: hash routes, scroll, sticky bar ---------------- */
const TABS=['home','vocab','gender','reading','verbs','talk','days','stats'];
let navFirst=true;
const fromHash=()=>{const m=location.hash.match(/^#\/?([a-z]+)/);return m&&TABS.includes(m[1])?m[1]:null;};
function navAfter(t){
  try{if(fromHash()!==t){if(navFirst)location.replace('#/'+t);else location.hash='/'+t;}}catch(e){}
  const s=$('navSentinel');
  if(!navFirst&&s){const top=s.getBoundingClientRect().top+window.scrollY;if(window.scrollY>top)window.scrollTo(0,top);}
  navFirst=false;
  document.title=(SEC[t]?SEC[t].n+' · ':'')+'Deutsch ⇄ English';
  add({section:t,action:'nav'});
}
window.addEventListener('hashchange',()=>{const t=fromHash();if(t&&t!==secNow())setTab(t);});
{const s=$('navSentinel'),w=$('navWrap');if(s&&w&&'IntersectionObserver' in window)new IntersectionObserver(([en])=>w.classList.toggle('stuck',!en.isIntersecting)).observe(s);}

/* ---------------- analysis helpers ---------------- */
const answers=(from=0)=>EV.filter(e=>e.action==='answer'&&e.result!=='skipped'&&e.ts>=from);
const isOk=e=>e.result==='correct';
function studyTime(list){const by={};let t=0;for(let i=1;i<list.length;i++){const g=list[i].ts-list[i-1].ts;if(g>0&&g<=10*60e3){const x=Math.min(g,5*60e3);t+=x;const s=list[i].section;by[s]=(by[s]||0)+x;}}return {t,by};}
function fmtDur(ms){const m=Math.round(ms/60e3);if(m<1)return ms>15e3?'<1 min':'0 min';if(m<60)return m+' min';return Math.floor(m/60)+' h '+pad(m%60)+' min';}
function ago(ts){if(!ts)return 'never';const s=(Date.now()-ts)/1e3;if(s<60)return 'just now';if(s<3600)return Math.round(s/60)+' min ago';if(dayOf(ts)===dayOf(Date.now()))return Math.round(s/3600)+' h ago';const d=Math.round((startOfDay(Date.now())-startOfDay(ts))/DAYMS);if(d===1)return 'yesterday';if(d<14)return d+' days ago';return new Date(ts).toLocaleDateString();}
const fmtWhen=ts=>new Date(ts).toLocaleString(undefined,{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const fmtSec=ms=>ms<10e3?(ms/1e3).toFixed(1)+' s':Math.round(ms/1e3)+' s';
function topWrongs(evs,n=3){const m={};evs.forEach(e=>{if(e.result==='wrong'&&e.given)m[e.given]=(m[e.given]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n);}
function streak(){const days=new Set(answers().map(e=>e.day)),d=new Date(),today=days.has(dayOf(+d));if(!today)d.setDate(d.getDate()-1);let n=0;while(days.has(dayOf(+d))){n++;d.setDate(d.getDate()-1);}return {n,today};}
function lastBySection(){const m={};EV.forEach(e=>{if(e.action==='answer')m[e.section]=e.ts;});return m;}

function weakWords(){
  const evBy=groupBy(EV.filter(e=>e.section==='vocab'&&e.action==='answer'&&e.result!=='skipped'),e=>e.item),now=Date.now(),out=[];
  vocabulary.forEach(c=>{
    if(isArch(c.id))return;const r=progress.byId[c.id];if(!r)return;
    const cor=r.correct||0,wr=r.wrong||0;if(!wr)return;
    const evs=evBy[c.id]||[],recentBad=evs.filter(e=>e.ts>now-14*DAYMS&&!isOk(e)).length,last=evs[evs.length-1];
    let score=(1-(cor+1)/(cor+wr+2))*Math.log2(2+wr)+(r.needsReview?.6:0)+.25*recentBad+(last&&!isOk(last)?.3:0);
    if(DIRS.every(d=>isBanked(c.id,d))&&!r.needsReview)score*=.4;
    out.push({c,cor,wr,score,needs:!!r.needsReview,wrongs:topWrongs(evs,3)});
  });
  return out.sort((a,b)=>b.score-a.score);
}
function example(e,cat,html=true){if(!e||e.result!=='wrong')return '';let g=e.given,x=e.expected,pre='';
  if(e.mode==='table'&&e.details&&Array.isArray(e.details.cells)){const c=e.details.cells.find(c=>!c.ok&&(!cat||c.person+' form'===cat))||e.details.cells.find(c=>!c.ok);if(c){g=c.given||'—';x=c.expected;pre=c.person+': ';}}
  if(!g)return '';return html?`e.g. ${H(pre)}<span class="pw">${H(g)}</span> → <span class="pr">${H(x)}</span>`:` (e.g. ${pre}“${g}” instead of “${x}”)`;}
function patterns(){
  const m={};
  EV.forEach(e=>{if(e.action!=='answer'||(e.result!=='wrong'&&e.result!=='revealed'))return;
    const cats=e.result==='revealed'?['gave up (revealed)']:(e.errors&&e.errors.length?e.errors:['other']);
    cats.forEach(c=>{const k=e.section+'|'+c;const p=m[k]||(m[k]={sec:e.section,cat:c,n:0,last:null});p.n++;p.last=e;});});
  return Object.values(m).sort((a,b)=>b.n-a.n);
}
function mixups(){const m={};EV.forEach(e=>{const x=e.details&&e.details.mixedWith;if(e.section!=='vocab'||!x)return;const k=e.item+'>'+x.id;const p=m[k]||(m[k]={e,x,n:0});p.n++;p.e=e;});return Object.values(m).sort((a,b)=>b.n-a.n);}
function genderMatrix(){const M={};ARTS.forEach(a=>{M[a]={der:0,die:0,das:0};});EV.forEach(e=>{if(e.section==='gender'&&e.action==='answer'&&M[e.expected]&&e.given in M[e.expected])M[e.expected][e.given]++;});return M;}
function genderRules(){const rs={};gNouns.forEach(n=>{const r=gProg.byId[n.id];if(!r||!(r.c+r.w))return;const ru=ruleOf(n),k=ru?ruleName(ru):'No rule – learn by heart';const o=rs[k]||(rs[k]={k,c:0,w:0});o.c+=r.c||0;o.w+=r.w||0;});return Object.values(rs).filter(r=>r.w).sort((a,b)=>b.w-a.w);}
function verbPersons(){const m={};VPRON.forEach(p=>{m[p]={p,n:0,w:0};});EV.forEach(e=>{if(e.section!=='verbs'||e.action!=='answer')return;const d=e.details||{};if(e.mode==='table'&&Array.isArray(d.cells))d.cells.forEach(x=>{if(m[x.person]){m[x.person].n++;if(!x.ok)m[x.person].w++;}});else if(e.mode==='swap'&&m[d.person]){m[d.person].n++;if(!isOk(e)&&(e.errors||[]).some(x=>/form$/.test(x)))m[d.person].w++;}});return Object.values(m);}
function verbFamilies(){const m={};vList.forEach(v=>{const r=vProg.byId[v.id];if(!r||!r.w)return;vFams(v.inf).forEach(f=>{const k=VFAM[f].t;m[k]=(m[k]||0)+r.w;});});return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
function errorCounts(sec){const m={};EV.forEach(e=>{if(e.section===sec&&e.action==='answer'&&e.result==='wrong')(e.errors||['other']).forEach(c=>{m[c]=(m[c]||0)+1;});});return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
function accBy(sec,key){const m={};EV.forEach(e=>{if(e.section!==sec||e.action!=='answer'||e.result==='skipped')return;const k=key(e);if(!k)return;const o=m[k]||(m[k]={k,n:0,ok:0});o.n++;if(isOk(e))o.ok++;});return Object.values(m).sort((a,b)=>a.ok/a.n-b.ok/b.n);}
function lookups(){const m={};EV.forEach(e=>{if(e.action!=='lookup')return;const o=m[e.item]||(m[e.item]={w:e.label,en:e.expected,n:0});o.n++;});return Object.values(m).sort((a,b)=>b.n-a.n);}
function slowItems(){const g={};EV.forEach(e=>{if(e.action!=='answer'||!isOk(e)||!e.ms||e.ms>300e3||e.section==='reading'||e.mode==='table')return;const k=e.section+'|'+e.item;(g[k]||(g[k]={sec:e.section,item:e.item,label:e.label,prompt:e.prompt,ms:[]})).ms.push(e.ms);});return Object.values(g).filter(x=>x.ms.length>=2).map(x=>({...x,med:median(x.ms)})).sort((a,b)=>b.med-a.med);}
function secMetric(s){
  switch(s){
    case 'vocab':{const act=vocabulary.filter(c=>!isArch(c.id));let b=0;act.forEach(c=>DIRS.forEach(d=>{if(isBanked(c.id,d))b++;}));return {p:act.length?b/(2*act.length):0,t:`${b} of ${2*act.length} directions banked`};}
    case 'gender':{const L=gNouns.filter(n=>!isArch(n.id)),k=L.filter(n=>gLearned(n.id)).length;return {p:L.length?k/L.length:0,t:`${k} of ${L.length} nouns learned`};}
    case 'reading':{const k=TEXTS.filter(t=>rdProg[t.id]&&rdProg[t.id].best===t.q.length).length;return {p:k/TEXTS.length,t:`${k} of ${TEXTS.length} texts fully understood`};}
    case 'verbs':{const L=vList.filter(v=>!isArch(v.id)),k=L.filter(v=>vMastered(v.id)).length;return {p:L.length?k/L.length:0,t:`${k} of ${L.length} verbs mastered`};}
    case 'talk':{const k=T_ITEMS.filter(it=>tProg.by[it.key]&&tProg.by[it.key].last!=='bad').length;return {p:k/T_ITEMS.length,t:`${k} of ${T_ITEMS.length} sentences done`};}
    case 'days':{const s=DAYS.filter((_,i)=>{const r=dProg.by[i];return r&&r.c>=3&&r.w*2<=r.c;}).length;return {p:s/7,t:dProg.total?`${pct(dProg.correct,dProg.total)} correct · ${s} of 7 days strong`:'not started yet'};}
  }
  return {p:0,t:''};
}
const SECDESC={vocab:'Translate words and phrases EN ⇄ DE. 8 correct answers in one direction bank it 🏦.',gender:'Choose der, die or das – with the rule behind each noun. 3 in a row = learned.',reading:'Short texts made from your own vocabulary. Tap any word to see what it means.',verbs:'Conjugate verbs (ich, du, er …) and rewrite sentences for a new person.',talk:'Answer questions, ask questions and build sentences – where does the verb go?',days:'Montag to Sonntag: short forms, next and previous day, am + day, listening.'};

/* ---------------- shortcuts into the trainers ---------------- */
function vocabTopic(t){topic=t;byId('category').value=t;setTab('vocab');newRound();}
function practiceList(name,ids){let l=lists.find(x=>x.name===name);if(!l){l={name,ids:[]};lists.push(l);}l.ids=[...new Set(ids.map(String))];saveLists();listOptions();vocabTopic('list:'+name);say(`${name}: ${l.ids.length} word${l.ids.length===1?'':'s'} – saved as a list you can reuse.`);}
function practiceTalk(){const cnt={};T_ITEMS.forEach(it=>{if(tProg.by[it.key]?.last==='bad')cnt[it.mode]=(cnt[it.mode]||0)+1;});const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];if(best)tMode=best[0];tTopic='mistakes';tSaveUI();setTab('talk');tOptions();tNewRound();}
function dueIds(){const ids=[];vocabulary.forEach(c=>{if(!isArch(c.id)&&DIRS.some(d=>isDue(c.id,d)))ids.push(c.id);});return ids;}
function recs(){
  const R=[];
  const mist=vocabulary.filter(c=>!isArch(c.id)&&progress.byId[c.id]?.needsReview===true).length;
  if(mist)R.push({p:10,i:'✗',t:`Fix ${mist} vocabulary mistake${mist>1?'s':''}`,d:'Words you got wrong and have not answered correctly since.',go:()=>vocabTopic('mistakes')});
  const due=dueIds();
  if(due.length)R.push({p:9,i:'🏦',t:`${due.length} banked word${due.length>1?'s are':' is'} due for a reminder`,d:'A quick check that you still remember them (spaced repetition).',go:()=>practiceList('🏦 Due reminders',due)});
  const le=lastExport();
  if(EV.length>=50&&(!le||Date.now()-le>7*DAYMS))R.push({p:8.5,i:'💾',t:'Back up your learning history',d:le?`Last backup ${ago(le)}. Browser data can be lost if site data is cleared.`:'Never backed up. Browser data can be lost if site data is cleared.',go:()=>exportProgress()});
  const weak=weakWords().slice(0,20);
  if(weak.length>=5)R.push({p:8,i:'⚠️',t:`Practice your ${weak.length} weakest words`,d:'Ranked by mistakes, accuracy and how recently you got them wrong.',go:()=>practiceList('⚠ Weak spots',weak.map(w=>w.c.id))});
  const L=LESSONS.length-1,fresh=vocabulary.filter(c=>c.les===L&&!isArch(c.id)&&!seenCount(c.id)).length;
  if(fresh)R.push({p:7,i:'🆕',t:`${fresh} new word${fresh>1?'s':''} from ${LESSONS[L].label}`,d:'From your newest lesson – not practiced yet.',go:()=>vocabTopic('les:'+L)});
  const gm=gNouns.filter(n=>!isArch(n.id)&&(gProg.byId[n.id]?.w||0)>0&&!gLearned(n.id)).length;
  if(gm)R.push({p:6,i:'🎨',t:`${gm} der/die/das mistake${gm>1?'s':''} to fix`,d:'Nouns whose article you got wrong.',go:()=>{setTab('gender');setGFilter('mistakes');}});
  const tm=T_ITEMS.filter(it=>tProg.by[it.key]?.last==='bad').length;
  if(tm)R.push({p:6,i:'💬',t:`${tm} sentence${tm>1?'s':''} to fix in Ask & answer`,d:'Sentences you got wrong last time.',go:practiceTalk});
  const wd=DAYS.filter((_,i)=>{const r=dProg.by[i];return r&&r.w>0&&r.w*2>r.c;}).map(x=>x[0]);
  if(wd.length)R.push({p:5,i:'📅',t:'Practice the weekdays you mix up',d:wd.join(', '),go:()=>setTab('days')});
  const vn=vList.filter(v=>!isArch(v.id)&&!vMastered(v.id)).length;
  if(vn)R.push({p:4,i:'🔁',t:`${vn} verb${vn>1?'s':''} not mastered yet`,d:'Fill in the whole table twice in a row without a mistake.',go:()=>{setTab('verbs');vSetFilter('new');}});
  const nt=TEXTS.find(t=>!rdProg[t.id]||rdProg[t.id].best<t.q.length);
  if(nt)R.push({p:3,i:'📖',t:`Read “${nt.title}”`,d:rdProg[nt.id]?`Best score so far: ${rdProg[nt.id].best} / ${nt.q.length}.`:'A short text made from your own vocabulary.',go:()=>{setTab('reading');rdOpen(nt);}});
  return R.sort((a,b)=>b.p-a.p);
}

/* ---------------- 🏠 Home ---------------- */
let homeRecs=[],homeWired=false;
const goalGet=()=>{try{return Number(localStorage.getItem(KEY+'-goal'))||40;}catch(e){return 40;}};
const lastTrainer=()=>{try{const t=localStorage.getItem(KEY+'-tab');return SECTIONS.includes(t)?t:'vocab';}catch(e){return 'vocab';}};
const tile=(v,l)=>`<div class="htile"><div class="v">${v}</div><div class="l">${l}</div></div>`;
function renderHome(){
  const root=$('tabHome');if(!root)return;
  const now=new Date(),hr=now.getHours(),today=dayOf(+now);
  const tA=answers(startOfDay(+now)),tOk=tA.filter(isOk).length,st=streak(),goal=goalGet(),lt=lastTrainer();
  const tm=studyTime(EV.filter(e=>e.day===today)).t,last=lastBySection();
  homeRecs=recs().slice(0,5);
  root.innerHTML=`<section class="panel hhero"><div class="hhead"><div><div class="eyebrow">${H(now.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'}))}</div><h2>${hr<11?'Guten Morgen':hr<18?'Guten Tag':'Guten Abend'}! 👋</h2></div>
<button class="primary" type="button" data-go="${lt}">Continue: ${SEC[lt].i} ${H(SEC[lt].n)} →</button></div>
<div class="htiles">${tile(tA.length,'Answers today')}${tile(tA.length?pct(tOk,tA.length):'—','Correct today')}${tile(fmtDur(tm),'≈ Study time today')}${tile((st.n||0)+(st.n?' 🔥':''),st.today||!st.n?'Day streak':'Day streak – practice today to keep it')}</div>
<div class="hgoal"><span>Daily goal: <b>${Math.min(tA.length,goal)} / ${goal}</b> answers${tA.length>=goal?' ✓ done – great work!':''}</span><div class="meter" role="progressbar" aria-label="Daily goal" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(tA.length,goal)}"><div style="width:${Math.min(100,100*tA.length/goal)}%"></div></div><select id="hGoal" aria-label="Daily goal">${[20,40,60,100,150].map(g=>`<option value="${g}"${g===goal?' selected':''}>${g} a day</option>`).join('')}</select></div></section>
<section class="panel hnext"><h2 class="sectionhead">What to do next</h2><div class="hrecs">${homeRecs.length?homeRecs.map((r,i)=>`<button class="hrec" type="button" data-rec="${i}"><span class="ico" aria-hidden="true">${r.i}</span><span><b>${H(r.t)}</b><small>${H(r.d)}</small></span><span class="go" aria-hidden="true">→</span></button>`).join(''):'<p class="empty-s">Nothing urgent – pick any section below. 🎉</p>'}</div></section>
<h2 class="hsec">Your sections</h2><div class="hcards">${SECTIONS.map(s=>{const m=secMetric(s);return `<button class="hcard" type="button" data-go="${s}"><div class="hctop"><span class="hcico" aria-hidden="true">${SEC[s].i}</span><b>${H(SEC[s].n)}</b></div><p>${H(SECDESC[s])}</p><div class="meter"><div style="width:${Math.round(100*m.p)}%"></div></div><div class="hcmeta"><span>${H(m.t)}</span><span>${last[s]?'last: '+H(ago(last[s])):''}</span></div></button>`;}).join('')}
<button class="hcard" type="button" data-go="stats"><div class="hctop"><span class="hcico" aria-hidden="true">📊</span><b>My progress</b></div><p>Weak spots, your typical mistakes, every answer you gave, and backups of your learning history.</p><div class="hcmeta"><span>${EV.length.toLocaleString()} actions recorded</span></div></button></div>`;
  if(!homeWired){homeWired=true;
    root.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){setTab(g.dataset.go);return;}const r=e.target.closest('[data-rec]');if(r){const x=homeRecs[Number(r.dataset.rec)];if(x)x.go();}});
    root.addEventListener('change',e=>{if(e.target.id==='hGoal'){try{localStorage.setItem(KEY+'-goal',e.target.value);}catch(err){}renderHome();}});}
}
function hEnter(){renderHome();if(!ready)whenReady(()=>{if(secNow()==='home')renderHome();});}

/* ---------------- 📊 My progress ---------------- */
const P={range:'30',hsec:'all',hkind:'answers',hq:'',hn:60,wired:false};
try{const r=localStorage.getItem(KEY+'-statsRange');if(['7','30','90','all'].includes(r))P.range=r;}catch(e){}
const kpi=(v,l)=>`<div class="kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`;
const card=(title,sub,body,cls='')=>`<div class="wcard ${cls}"><h3>${title}</h3><p class="sub">${sub}</p>${body}</div>`;
const none=t=>`<p class="empty-s">${t}</p>`;
const barRows=(rows,fmt=v=>v)=>{const max=Math.max(1,...rows.map(r=>r.v));return rows.map(r=>`<div class="bl" title="${H(r.title||r.l+': '+fmt(r.v))}"><div class="bll">${r.lh||H(r.l)}</div><div class="blt">${r.v>0?`<div class="blb" style="width:${100*r.v/max}%"></div>`:''}</div><div class="blv">${fmt(r.v)}</div>${r.s?`<div class="bls">${r.s}</div>`:''}</div>`).join('');};
function renderProgress(){
  const root=$('tabStats');if(!root)return;
  root.innerHTML=`<section class="panel spanel" id="pgAct"></section>
<section class="panel spanel"><div class="shead"><div><h2>Weak spots</h2><p class="note">All time · click any word or sentence to see every answer you gave.${EV.length<100?' Details like “what you wrote” appear as your history grows – the counters already include all your earlier practice.':''}</p></div></div><div class="wgrid" id="pgWeak"></div></section>
<section class="panel spanel" id="pgHist"></section>
<section class="panel spanel" id="pgData"></section>`;
  renderActivity();renderWeak();renderHistory();renderData();
  if(!P.wired){P.wired=true;
    root.addEventListener('click',e=>{const t=e.target;
      const r=t.closest('[data-rng]');if(r){P.range=r.dataset.rng;try{localStorage.setItem(KEY+'-statsRange',P.range);}catch(err){}renderActivity();return;}
      const it=t.closest('[data-item]');if(it){const s=it.dataset.item,i=s.indexOf('|');openItem(s.slice(0,i),s.slice(i+1));return;}
      const g=t.closest('[data-go]');if(g){setTab(g.dataset.go);return;}
      const a=t.closest('[data-act]');if(a)act(a.dataset.act);});
    root.addEventListener('input',e=>{if(e.target.id==='hfQ'){P.hq=e.target.value;P.hn=60;renderHistList();}});
    root.addEventListener('change',e=>{if(e.target.id==='hfSec'){P.hsec=e.target.value;P.hn=60;renderHistList();}else if(e.target.id==='hfKind'){P.hkind=e.target.value;P.hn=60;renderHistList();}});}
}
function act(a){
  if(a==='weak'){const W=weakWords().slice(0,15);if(W.length)practiceList('⚠ Weak spots',W.map(w=>w.c.id));}
  else if(a==='gender'){setTab('gender');setGFilter('mistakes');}
  else if(a==='verbs'){setTab('verbs');vSetFilter('new');}
  else if(a==='talk')practiceTalk();
  else if(a==='days')setTab('days');
  else if(a==='more'){P.hn+=200;renderHistList();}
  else if(a==='backup')exportProgress();
  else if(a==='csv')downloadCSV();
  else if(a==='report')showReport();
  else if(a==='import')byId('importFile').click();
  else if(a==='wipe'){if(!confirm(`Delete all ${EV.length} recorded actions from your learning history? Your saved progress in the trainers (banked words, mistakes, lists …) is NOT touched. Tip: export a backup first.`))return;clearAll().then(()=>{renderProgress();say('Learning history deleted.');});}
}
function renderActivity(){
  const box=$('pgAct');if(!box)return;
  const from=P.range==='all'?0:startOfDay(Date.now()-(Number(P.range)-1)*DAYMS);
  const A=answers(from),ok=A.filter(isOk).length,st=studyTime(EV.filter(e=>e.ts>=from)),last=lastBySection();
  box.innerHTML=`<div class="shead"><div><h2>Activity</h2><p class="note">${EV.length?`Recording since ${H(new Date(EV[0].ts).toLocaleDateString())}`:'Recording starts now – every answer from here on is saved.'}</p></div><div class="seg rng" role="group" aria-label="Time range">${[['7','7 days'],['30','30 days'],['90','90 days'],['all','All time']].map(([v,l])=>`<button type="button" data-rng="${v}" aria-pressed="${P.range===v}">${l}</button>`).join('')}</div></div>
<div class="kpis">${kpi(A.length.toLocaleString(),'Answers')}${kpi(pct(ok,A.length),'Correct')}${kpi((A.length-ok).toLocaleString(),'Mistakes & reveals')}${kpi(fmtDur(st.t),'≈ Study time')}${kpi(new Set(A.map(e=>e.day)).size,'Days practiced')}</div>
<div class="chartwrap" id="pgChart"></div>
<h3 class="sectionhead" style="margin:22px 0 4px">By section</h3><div class="tscroll"><table class="stable"><tr><th>Section</th><th class="n">Answers</th><th class="n">Correct</th><th class="n hide-s">≈ Time</th><th class="hide-s">Last practiced</th></tr>${SECTIONS.map(s=>{const a=A.filter(e=>e.section===s);return `<tr class="click" data-go="${s}"><td>${SEC[s].i} ${H(SEC[s].n)}</td><td class="n">${a.length}</td><td class="n">${pct(a.filter(isOk).length,a.length)}</td><td class="n hide-s">${fmtDur(st.by[s]||0)}</td><td class="hide-s">${H(ago(last[s]))}</td></tr>`;}).join('')}</table></div>`;
  drawChart($('pgChart'),buckets(A,from));
}
function buckets(A,from){
  const first=from||(A.length?startOfDay(A[0].ts):startOfDay(Date.now())),end=startOfDay(Date.now());
  const weekly=(end-first)/DAYMS>70,map=new Map(),d=new Date(first);
  const wk=ts=>{const x=new Date(startOfDay(ts));x.setDate(x.getDate()-((x.getDay()+6)%7));return +x;};
  if(weekly)d.setTime(wk(first));
  while(+d<=end){map.set(dayOf(+d),{ts:+d,c:0,w:0,weekly});d.setDate(d.getDate()+(weekly?7:1));}
  A.forEach(e=>{const b=map.get(weekly?dayOf(wk(e.ts)):e.day);if(b){if(isOk(e))b.c++;else b.w++;}});
  return [...map.values()];
}
const bLabel=b=>(b.weekly?'Week of ':'')+new Date(b.ts).toLocaleDateString(undefined,{weekday:b.weekly?undefined:'short',day:'numeric',month:'short'});
function niceStep(x){if(x<=1)return 1;const p=Math.pow(10,Math.floor(Math.log10(x))),m=x/p;return (m<=1?1:m<=2?2:m<=5?5:10)*p;}
function barPath(x,y0,w,h,round){const r=round?Math.min(4,w/2,h):0,y1=y0-h;return `M${x},${y0}V${y1+r}`+(r?`Q${x},${y1} ${x+r},${y1}`:'')+`H${x+w-r}`+(r?`Q${x+w},${y1} ${x+w},${y1+r}`:'')+`V${y0}Z`;}
function drawChart(el,B){
  if(!el)return;
  if(!B.some(b=>b.c+b.w)){el.innerHTML=none('No answers in this period yet – everything you practice from now on shows up here.');return;}
  const W=Math.max(300,Math.round(el.clientWidth||700)),HH=220,L=38,R=10,T=20,BOT=28,pw=W-L-R,ph=HH-T-BOT;
  const max=Math.max(...B.map(b=>b.c+b.w)),step=niceStep(max/4),top=Math.max(step,Math.ceil(max/step)*step);
  const n=B.length,slot=pw/n,bw=Math.max(2,Math.min(24,slot*.64)),y=v=>T+ph*(1-v/top),base=y(0);
  const every=Math.max(1,Math.ceil(n/Math.max(1,Math.floor(pw/54))));
  const maxI=B.reduce((m,b,i)=>b.c+b.w>B[m].c+B[m].w?i:m,0);
  let s=`<svg viewBox="0 0 ${W} ${HH}" width="${W}" height="${HH}" role="group" aria-label="Answers per ${B[0].weekly?'week':'day'}, correct and wrong">`;
  for(let v=0;v<=top;v+=step)s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="${v?'#e9edf4':'#c9d2e1'}" stroke-width="1"/><text class="ax" x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
  B.forEach((b,i)=>{
    const x0=L+slot*i,cx=x0+slot/2,x=cx-bw/2,hc=ph*b.c/top,hw=ph*b.w/top,tot=b.c+b.w;let g='';
    if(b.c)g+=`<path d="${barPath(x,base,bw,hc,!b.w)}" fill="${C_OK}"/>`;
    if(b.w){const gap=b.c?2:0;g+=`<path d="${barPath(x,base-hc-gap,bw,Math.max(1,hw-gap),true)}" fill="${C_BAD}"/>`;}
    s+=`<g class="bk" data-i="${i}" tabindex="0" role="img" aria-label="${H(bLabel(b))}: ${b.c} correct, ${b.w} wrong or revealed"><rect class="hit" x="${x0}" y="${T}" width="${slot}" height="${ph}" fill="transparent" rx="4"/>${g}</g>`;
    if(tot&&(i===n-1||i===maxI))s+=`<text class="dl" x="${cx}" y="${y(tot)-6}" text-anchor="middle">${tot}</text>`;
    if((n-1-i)%every===0)s+=`<text class="ax" x="${cx}" y="${HH-8}" text-anchor="middle">${H(new Date(b.ts).toLocaleDateString(undefined,{day:'numeric',month:'numeric'}))}</text>`;
  });
  s+='</svg>';
  el.innerHTML=s+`<div class="legend"><span><i style="background:${C_OK}"></i>✓ Correct</span><span><i style="background:${C_BAD}"></i>✗ Wrong or revealed</span><span class="note" style="margin:0">${B[0].weekly?'per week':'per day'}</span></div><div class="ctip" id="pgTip" role="status"></div>
<details class="tview"><summary>Show as table</summary><div class="tscroll"><table class="stable"><tr><th>${B[0].weekly?'Week':'Day'}</th><th class="n">✓ Correct</th><th class="n">✗ Wrong</th><th class="n">Correct</th></tr>${B.slice().reverse().filter(b=>b.c+b.w).map(b=>`<tr><td>${H(bLabel(b))}</td><td class="n">${b.c}</td><td class="n">${b.w}</td><td class="n">${pct(b.c,b.c+b.w)}</td></tr>`).join('')}</table></div></details>`;
  const tip=el.querySelector('#pgTip'),svg=el.querySelector('svg');
  const show=g=>{const b=B[Number(g.dataset.i)],sc=svg.getBoundingClientRect().width/W,cx=(L+slot*(Number(g.dataset.i)+.5))*sc;
    tip.innerHTML=`<div class="t">${H(bLabel(b))}</div><div><span class="k" style="background:${C_OK}"></span><b>${b.c}</b> correct</div><div><span class="k" style="background:${C_BAD}"></span><b>${b.w}</b> wrong or revealed</div><div>${b.c+b.w?pct(b.c,b.c+b.w)+' correct':'no answers'}</div>`;
    tip.style.display='block';const tw=tip.offsetWidth,left=Math.max(0,Math.min(cx-tw/2,el.clientWidth-tw));tip.style.left=left+'px';tip.style.top=Math.max(0,(y(b.c+b.w)*sc)-tip.offsetHeight-10)+'px';};
  el.querySelectorAll('.bk').forEach(g=>{g.addEventListener('pointerenter',()=>show(g));g.addEventListener('focus',()=>show(g));g.addEventListener('pointerleave',()=>{tip.style.display='none';});g.addEventListener('blur',()=>{tip.style.display='none';});});
}
let rsT=null;window.addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{if(secNow()==='stats')renderActivity();},180);});

function renderWeak(){
  const box=$('pgWeak');if(!box)return;const C=[];
  const W=weakWords().slice(0,15);
  C.push(card('📚 Words to focus on','Ranked by mistakes, accuracy and recent errors.',W.length?`<div class="tscroll"><table class="stable"><tr><th>German</th><th>English</th><th class="n">✓</th><th class="n">✗</th><th class="hide-s">What you wrote</th></tr>${W.map(w=>`<tr class="click" data-item="vocab|${w.c.id}"><td><b>${H(w.c.de)}</b>${w.needs?' <span class="res bad" title="On your mistakes list">•</span>':''}</td><td>${H(w.c.en)}</td><td class="n">${w.cor}</td><td class="n">${w.wr}</td><td class="hide-s">${w.wrongs.map(([g,k])=>`<span class="pw">${H(g)}</span>${k>1?'×'+k:''}`).join(' ')||'<span class="note">—</span>'}</td></tr>`).join('')}</table></div><div class="datarow"><button class="primary" type="button" data-act="weak">▶ Practice these ${W.length} words</button></div>`:none('No weak words yet – keep practicing! 🎉'),'wide'));
  const PT=patterns().slice(0,10);
  C.push(card('🧩 Your typical mistakes','What kind of mistake, in every section (from your recorded answers).',PT.length?barRows(PT.map(p=>({l:SEC[p.sec].i+' '+p.cat,v:p.n,s:example(p.last,p.cat)}))):none('No mistakes recorded yet.')));
  const MX=mixups().slice(0,8);
  C.push(card('🔀 Words you mix up','You typed the answer of a different card.',MX.length?MX.map(m=>`<div class="mxrow" data-item="vocab|${H(m.e.item)}"><span><b>${H(m.e.prompt)}</b> → you wrote <span class="pw">${H(m.e.given)}</span> <span class="note" style="display:inline">= ${H(m.e.mode==='en-de'?m.x.en:m.x.de)}</span></span><b class="blv">×${m.n}</b></div>`).join(''):none('No mix-ups recorded yet.')));
  const GM=genderMatrix(),gTot=ARTS.reduce((s,a)=>s+ARTS.reduce((t,b)=>t+GM[a][b],0),0),GR=genderRules().slice(0,6);
  const cell=(a,b)=>{const row=ARTS.reduce((t,x)=>t+GM[a][x],0),v=GM[a][b],sh=row?v/row:0;if(a===b)return `<td style="background:#eef7f2;color:var(--green)" title="${a}: ${v} correct">${v}</td>`;const al=v?.12+.7*sh:0;return `<td style="background:rgba(53,95,218,${al.toFixed(2)});color:${al>.5?'#fff':'#19243b'}" title="Answer was ${a}, you chose ${b}: ${v}×">${v||'·'}</td>`;};
  C.push(card('🎨 der · die · das','Which articles you confuse, and which rules trip you up.',(gTot?`<h4>Answer was → you chose</h4><table class="cm"><tr><th></th>${ARTS.map(b=>`<th class="art-${b}">${b}</th>`).join('')}</tr>${ARTS.map(a=>`<tr><th class="art-${a}" style="text-align:right">${a}</th>${ARTS.map(b=>cell(a,b)).join('')}</tr>`).join('')}</table>`:'')+(GR.length?`<h4>Rules with the most mistakes</h4>${barRows(GR.map(r=>({l:r.k,v:r.w,s:`${pct(r.c,r.c+r.w)} correct`})))}`:'')+(gTot||GR.length?`<div class="datarow"><button class="secondary" type="button" data-act="gender">▶ Practice my article mistakes</button></div>`:none('No article practice recorded yet.'))));
  const VP=verbPersons().filter(p=>p.n),VF=verbFamilies().slice(0,5),VW=vList.filter(v=>(vProg.byId[v.id]?.w||0)>0).sort((a,b)=>vProg.byId[b.id].w-vProg.byId[a.id].w).slice(0,8);
  C.push(card('🔁 Verbs','Where your conjugation mistakes happen.',(VP.length?`<h4>Mistakes by person</h4>${barRows(VP.map(p=>({l:p.p,v:p.w,s:`${pct(p.n-p.w,p.n)} correct of ${p.n}`})))}`:'')+(VF.length?`<h4>Verb families (all time)</h4>${barRows(VF.map(([k,v])=>({l:k,v})))}`:'')+(VW.length?`<h4>Verbs with the most wrong forms</h4><div class="chips">${VW.map(v=>`<button type="button" class="chip vchip" data-item="verbs|${v.id}" title="${H(v.en)}">${H(v.inf)} ×${vProg.byId[v.id].w}</button>`).join('')}</div>`:'')+(VP.length||VW.length?`<div class="datarow"><button class="secondary" type="button" data-act="verbs">▶ Practice verbs not mastered</button></div>`:none('No verb practice recorded yet.'))));
  const TE=errorCounts('talk').slice(0,8),TP=accBy('talk',e=>e.details&&e.details.pattern).filter(x=>x.n>=3),openT=T_ITEMS.filter(it=>tProg.by[it.key]?.last==='bad').length;
  C.push(card('💬 Ask & answer','Sentence building: what goes wrong most.',(TE.length?`<h4>Mistake types</h4>${barRows(TE.map(([k,v])=>({l:k,v})))}`:'')+(TP.length?`<h4>Sentence patterns, weakest first</h4>${barRows(TP.slice(0,5).map(x=>({l:x.k,v:Math.round(100*x.ok/x.n),s:`${x.n} answers`})),v=>v+'%')}`:'')+(openT?`<div class="datarow"><button class="secondary" type="button" data-act="talk">▶ Fix ${openT} open sentence mistake${openT>1?'s':''}</button></div>`:'')+(!TE.length&&!TP.length&&!openT?none('No sentence practice recorded yet.'):'')));
  const DR=DAYS.map(([de],i)=>({l:de,r:dProg.by[i]||{c:0,w:0}})).filter(x=>x.r.w).sort((a,b)=>b.r.w-a.r.w),DT=accBy('days',e=>e.details&&e.details.kind).filter(x=>x.n>=2);
  C.push(card('📅 Wochentage','Days and question types you get wrong.',(DR.length?`<h4>Mistakes per day (all time)</h4>${barRows(DR.map(x=>({l:x.l,v:x.r.w,s:`✓ ${x.r.c} · ✗ ${x.r.w}`})))}`:'')+(DT.length?`<h4>Question types, weakest first</h4>${barRows(DT.slice(0,5).map(x=>({l:x.k,v:Math.round(100*x.ok/x.n),s:`${x.n} answers`})),v=>v+'%')}`:'')+(DR.length||DT.length?`<div class="datarow"><button class="secondary" type="button" data-act="days">▶ Practice Wochentage</button></div>`:none('No weekday practice recorded yet.'))));
  const LK=lookups().slice(0,16);
  C.push(card('📖 Words you looked up while reading','The words you tapped most – good candidates to learn next.',LK.length?`<div class="chips">${LK.map(x=>`<span class="chip vchip" title="${H(x.en||'')}">${H(x.w)}${x.n>1?' ×'+x.n:''}<span class="note" style="display:inline;margin-left:5px">${H(x.en||'')}</span></span>`).join('')}</div>`:none('Tap words in a 📖 Reading text and they will be collected here.')));
  const SL=slowItems().slice(0,8),allMs=EV.filter(e=>e.action==='answer'&&isOk(e)&&e.ms&&e.ms<300e3&&e.section!=='reading'&&e.mode!=='table').map(e=>e.ms);
  C.push(card('🐢 Right, but slow','Correct answers that still take you long – they are not automatic yet.',SL.length?`<p class="note" style="margin:-6px 0 8px">Your typical correct answer takes ${fmtSec(median(allMs))}.</p>${barRows(SL.map(x=>({l:SEC[x.sec].i+' '+(x.prompt||x.label||x.item),lh:`<span class="histlink" data-item="${H(x.sec+'|'+x.item)}">${H(SEC[x.sec].i+' '+(x.prompt||x.label||x.item))}</span>`,v:x.med,s:`${x.ms.length} correct answers`})),fmtSec)}`:none('Needs at least two correct answers per card – keep practicing.')));
  box.innerHTML=C.join('');
}

function evText(e){
  if(e.action==='answer')return H(e.prompt||e.label||e.item||'');
  const map={hint:'💡 hint',listen:'🔊 listened',lookup:'🔎 looked up',nav:'opened section','open-text':'📖 opened text',setting:'⚙ setting',archive:'🗃 archived',restore:'↩ restored','list-add':'★ added to list','list-remove':'removed from list'};
  return `<span class="note" style="display:inline">${H(map[e.action]||e.action)}</span> ${H(e.action==='setting'?`${e.item} = ${e.given}`:e.action==='lookup'?`${e.label} = ${e.expected||'?'}`:e.action==='nav'?SEC[e.section]?.n||'':(e.label||e.item||'')+(e.details&&e.details.list?` (${e.details.list})`:''))}`;
}
function resBadge(e){
  if(e.action!=='answer')return '';
  const h=e.hints?` <span class="note" style="display:inline">· ${e.hints} hint${e.hints>1?'s':''}</span>`:'';
  return {correct:'<span class="res ok">✓ correct</span>',wrong:'<span class="res bad">✗ wrong</span>',revealed:'<span class="res mid">👁 revealed</span>',skipped:'<span class="res na">⏭ skipped</span>'}[e.result]+h;
}
function renderHistory(){
  const box=$('pgHist');if(!box)return;
  box.innerHTML=`<div class="shead"><div><h2>History</h2><p class="note">Everything you did, newest first. Click a row to see the whole story of that word or sentence.</p></div></div>
<div class="hfilters"><select id="hfSec" aria-label="Section"><option value="all">All sections</option>${SECTIONS.map(s=>`<option value="${s}"${P.hsec===s?' selected':''}>${SEC[s].i} ${H(SEC[s].n)}</option>`).join('')}</select><select id="hfKind" aria-label="What to show"><option value="answers"${P.hkind==='answers'?' selected':''}>Answers</option><option value="mistakes"${P.hkind==='mistakes'?' selected':''}>Mistakes only</option><option value="all"${P.hkind==='all'?' selected':''}>Everything (hints, listening, look-ups …)</option></select><input class="search" type="search" id="hfQ" placeholder="Search a word or an answer…" value="${H(P.hq)}" aria-label="Search history"></div><div id="hfList"></div>`;
  renderHistList();
}
function renderHistList(){
  const el=$('hfList');if(!el)return;const q=P.hq.trim().toLocaleLowerCase('de');
  let L=EV.filter(e=>(P.hsec==='all'||e.section===P.hsec)&&(P.hkind==='all'||(e.action==='answer'&&(P.hkind==='answers'||(e.result!=='correct'&&e.result!=='skipped')))));
  if(q)L=L.filter(e=>[e.label,e.prompt,e.given,e.expected,e.item].some(v=>v!=null&&String(v).toLocaleLowerCase('de').includes(q)));
  const total=L.length;L=L.slice(-P.hn).reverse();
  if(!total){el.innerHTML=none(EV.length?'Nothing matches these filters.':'No history yet – go practice and come back! Every answer is saved automatically.');return;}
  el.innerHTML=`<div class="tscroll"><table class="stable"><tr><th>When</th><th class="hide-s">Section</th><th>Question</th><th>You wrote</th><th class="hide-s">Correct answer</th><th>Result</th><th class="n hide-s">Time</th></tr>${L.map(e=>{const clickable=e.item&&(e.action==='answer'||e.action==='hint');return `<tr${clickable?` class="click" data-item="${H(e.section+'|'+e.item)}"`:''}><td class="when">${H(fmtWhen(e.ts))}</td><td class="hide-s">${SEC[e.section]?SEC[e.section].i+' '+H(SEC[e.section].n):H(e.section)}${e.mode&&e.action==='answer'?` <span class="note" style="display:inline">${H(e.mode)}</span>`:''}</td><td>${evText(e)}</td><td>${e.action==='answer'?(e.result==='correct'?H(e.given):e.given?`<span class="pw">${H(e.given)}</span>`:'<span class="note">—</span>'):''}</td><td class="hide-s">${e.action==='answer'?H(e.expected):''}</td><td>${resBadge(e)}</td><td class="n hide-s">${e.ms&&e.action==='answer'?fmtSec(e.ms):''}</td></tr>`;}).join('')}</table></div>
<p class="note" style="margin-top:8px">Showing ${L.length} of ${total.toLocaleString()}.${total>L.length?' <button class="linkbutton" type="button" data-act="more">Show more</button>':''}</p>`;
}
function renderData(){
  const box=$('pgData');if(!box)return;const le=lastExport(),sess=new Set(EV.map(e=>e.session)).size;
  box.innerHTML=`<div class="shead"><div><h2>Your data</h2><p class="note">Everything stays on this computer, in this browser.</p></div></div>
<p class="hintline">Saved in <b>${store==='idb'?'this browser’s database (IndexedDB)':store==='local'?'this browser’s local storage':'…'}</b> · <b>${EV.length.toLocaleString()}</b> recorded actions in <b>${sess}</b> session${sess===1?'':'s'}${EV.length?` since ${H(new Date(EV[0].ts).toLocaleDateString())}`:''} · last backup: <b>${le?H(ago(le)):'never'}</b></p>
<div class="datarow"><button class="primary" type="button" data-act="backup">⤓ Back up everything (.json)</button><button class="secondary" type="button" data-act="csv">⤓ History as spreadsheet (.csv)</button><button class="secondary" type="button" data-act="report">📋 Learning report</button><button class="secondary" type="button" data-act="import">⤒ Import a backup</button><button class="secondary danger" type="button" data-act="wipe">🗑 Delete history</button></div>
<p class="hintline" style="margin-top:12px">💡 <b>Backup</b> = your trainer progress + this full history in one file (import it on another computer or browser; history is merged, never lost). <b>CSV</b> opens in Excel / Numbers / Google Sheets. To analyse your learning with Claude, put either file in the same folder as this page and ask – or copy the learning report.</p>`;
}

/* ---------------- dialog: full history of one item ---------------- */
function dlg(html){let d=$('lgDlg');if(!d)return null;d.innerHTML=html;if(!d.open){try{d.showModal();}catch(e){d.setAttribute('open','');}}d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d.close()));return d;}
const VOCAB_SPACE=['vocab','gender','verbs'];
function openItem(sec,item){
  item=String(item);
  const same=VOCAB_SPACE.includes(sec)?e=>VOCAB_SPACE.includes(e.section)&&e.item===item:e=>e.section===sec&&e.item===item;
  const all=EV.filter(same),L=all.filter(e=>e.action==='answer'&&e.result!=='skipped'),ok=L.filter(isOk).length;
  let title='',sub='',facts=[];
  if(VOCAB_SPACE.includes(sec)&&vocabulary[Number(item)]){
    const c=vocabulary[Number(item)];title=c.de;sub=c.en+' · '+(labels[c.cat]||c.cat)+' · '+((LESSONS[c.les]||{}).label||'');
    const r=progress.byId[c.id];
    if(r)facts.push(`Vocabulary (all time): seen <b>${seenCount(c.id)}</b>× · ✓ ${r.correct||0} · ✗ ${r.wrong||0}`+DIRS.map(d=>{const s=dstate(c.id,d);return ` · ${DIRNAME[d]}: ${s.banked?'🏦 banked, next reminder '+H(new Date(s.due).toLocaleDateString()):`${s.c||0}/${bankTarget(s)} correct`}`;}).join('')+(r.needsReview?' · <span class="res bad">on your mistakes list</span>':''));
    const g=gProg.byId[c.id];if(g&&(g.c||g.w))facts.push(`der · die · das: ✓ ${g.c} · ✗ ${g.w}${gLearned(c.id)?' · learned':''}`);
    const v=vProg.byId[c.id];if(v&&(v.c))facts.push(`Verb tables: ${v.c} checked · ${v.w} wrong forms${vMastered(c.id)?' · mastered':''}`);
    if(isArch(c.id))facts.push('🗃 In the Archive (taken out of practice)');
    const inL=lists.filter(l=>l.ids.includes(c.id)).map(l=>l.name);if(inL.length)facts.push('Lists: '+inL.map(H).join(', '));
  }else if(sec==='talk'){const it=T_ITEMS.find(x=>x.key===item);const last=all[all.length-1];title=it?(it.parts?it.acc[0]:it.prompt):(last&&last.prompt)||item;sub=it?`${SEC.talk.n} · ${it.mode}${it.acc?' · answer: '+it.acc[0]:''}`:SEC.talk.n;const r=tProg.by[item];if(r)facts.push(`All time: ✓ ${r.c} · ✗ ${r.w} · last result: ${r.last==='bad'?'<span class="res bad">wrong</span>':r.last==='help'?'correct with word tiles':'correct'}`);}
  else{const last=all[all.length-1];title=(last&&(last.label||last.prompt))||item;sub=SEC[sec]?SEC[sec].n:sec;}
  const wr=topWrongs(L,12),hints=all.filter(e=>e.action==='hint').length,listens=all.filter(e=>e.action==='listen').length;
  dlg(`<div class="dh"><div><div class="eyebrow">History</div><h2>${H(title)}</h2><p class="note">${H(sub)}</p></div><button class="x" type="button" data-close aria-label="Close">✕</button></div><div class="db">
<div class="kpis">${kpi(L.length,'Recorded answers')}${kpi(pct(ok,L.length),'Correct')}${kpi(L.length?fmtSec(median(L.filter(e=>e.ms&&e.ms<300e3).map(e=>e.ms))||0):'—','Typical time')}${kpi(hints+' · '+listens,'Hints · listens')}</div>
${facts.length?`<p class="hintline" style="margin-top:12px">${facts.join('<br>')}</p>`:''}
${wr.length?`<h4 style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#73819a;margin:16px 0 6px">Your wrong answers</h4><div class="chips">${wr.map(([g,n])=>`<span class="pw">${H(g)}${n>1?' ×'+n:''}</span>`).join('')}</div>`:''}
<h4 style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#73819a;margin:16px 0 6px">Every attempt</h4>
${L.length?`<div class="tscroll"><table class="stable"><tr><th>When</th><th>Where</th><th>You wrote</th><th class="hide-s">Correct</th><th>Result</th><th class="n hide-s">Time</th></tr>${L.slice().reverse().map(e=>`<tr><td class="when">${H(fmtWhen(e.ts))}</td><td>${SEC[e.section]?SEC[e.section].i:''} ${H(e.mode||'')}</td><td>${e.result==='correct'?H(e.given):e.given?`<span class="pw">${H(e.given)}</span>`:'<span class="note">—</span>'}${e.errors&&e.result==='wrong'?`<div class="note">${H(e.errors.join(', '))}</div>`:''}</td><td class="hide-s">${H(e.expected)}</td><td>${resBadge(e)}</td><td class="n hide-s">${e.ms?fmtSec(e.ms):''}</td></tr>`).join('')}</table></div>`:none('No answers recorded for this one since the history log started. The totals above include your earlier practice.')}
</div>`);
}
function histLink(el,sec,item){el.classList.add('histlink');el.tabIndex=0;el.setAttribute('role','button');el.title='Show your full history for this word';el.addEventListener('click',()=>openItem(sec,item));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();openItem(sec,item);}});}
{const d=$('lgDlg');if(d)d.addEventListener('click',e=>{if(e.target===d)d.close();});}

/* ---------------- exports: CSV + learning report ---------------- */
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
function localTime(ts){const d=new Date(ts);return dayOf(ts)+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());}
function downloadCSV(){
  const cols=['time','day','session','section','action','mode','item','label','prompt','given','expected','result','ms','hints','errors','details'];
  const cell=v=>{if(v==null)return '';let s=Array.isArray(v)?v.join('; '):typeof v==='object'?JSON.stringify(v):String(v);if(typeof v==='string'&&/^[=+\-@\t\r]/.test(s))s="'"+s;return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const rows=[cols.join(',')].concat(EV.map(e=>cols.map(c=>cell(c==='time'?localTime(e.ts):e[c])).join(',')));
  download('deutsch-history-'+dayOf(Date.now())+'.csv','﻿'+rows.join('\r\n'),'text/csv;charset=utf-8');say(`Exported ${EV.length} actions as CSV.`);
}
const md=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
function reportText(){
  const A=answers(),A30=A.filter(e=>e.ts>=Date.now()-30*DAYMS),Lr=[];
  Lr.push(`# German learning report – ${dayOf(Date.now())}`,'');
  Lr.push(`History log: ${EV.length} recorded actions${EV[0]?` since ${EV[0].day}`:''}, ${new Set(EV.map(e=>e.session)).size} sessions, ≈ ${fmtDur(studyTime(EV).t)} of practice. Day streak: ${streak().n}.`,'');
  Lr.push('## Last 30 days by section','','| Section | Answers | Correct | Mistakes & reveals |','|---|---:|---:|---:|');
  SECTIONS.forEach(s=>{const a=A30.filter(e=>e.section===s),k=a.filter(isOk).length;Lr.push(`| ${SEC[s].n} | ${a.length} | ${pct(k,a.length)} | ${a.length-k} |`);});
  Lr.push('','## Saved progress (all time, includes practice from before the log)','');
  Lr.push(`- Vocabulary: ${progress.total} answers, ${pct(progress.correct,progress.total)} correct · ${secMetric('vocab').t}`);
  SECTIONS.slice(1).forEach(s=>Lr.push(`- ${SEC[s].n}: ${secMetric(s).t}`));
  Lr.push('','## Weakest vocabulary','','| German | English | ✓ | ✗ | Wrong answers given |','|---|---|---:|---:|---|');
  weakWords().slice(0,25).forEach(w=>Lr.push(`| ${md(w.c.de)} | ${md(w.c.en)} | ${w.cor} | ${w.wr} | ${w.wrongs.map(([g,n])=>md(g)+(n>1?' ×'+n:'')).join(', ')} |`));
  Lr.push('','## Mistake types (recorded answers)','');patterns().slice(0,15).forEach(p=>Lr.push(`- ${SEC[p.sec].n} · ${p.cat}: ${p.n}`+example(p.last,p.cat,false)));
  const MX=mixups().slice(0,10);if(MX.length){Lr.push('','## Words mixed up','');MX.forEach(m=>Lr.push(`- “${m.e.prompt}” → wrote “${m.e.given}” (that is ${m.e.mode==='en-de'?m.x.en:m.x.de}) ×${m.n}`));}
  const GR=genderRules().slice(0,8);if(GR.length){Lr.push('','## der · die · das – rules with mistakes (all time)','');GR.forEach(r=>Lr.push(`- ${r.k}: ✗ ${r.w}, ${pct(r.c,r.c+r.w)} correct`));}
  const GM=genderMatrix();Lr.push('','Article confusion (answer → chosen): '+ARTS.flatMap(a=>ARTS.filter(b=>b!==a&&GM[a][b]).map(b=>`${a}→${b} ×${GM[a][b]}`)).join(', ')||'none recorded');
  const VP=verbPersons().filter(p=>p.n);if(VP.length){Lr.push('','## Verbs – mistakes by person','');VP.forEach(p=>Lr.push(`- ${p.p}: ✗ ${p.w} of ${p.n} (${pct(p.n-p.w,p.n)} correct)`));}
  const VF=verbFamilies();if(VF.length)Lr.push('','Verb families with wrong forms (all time): '+VF.map(([k,v])=>`${k} ×${v}`).join(', '));
  const TE=errorCounts('talk');if(TE.length){Lr.push('','## Ask & answer – mistake types','');TE.forEach(([k,v])=>Lr.push(`- ${k}: ${v}`));}
  const DR=DAYS.map(([de],i)=>({de,r:dProg.by[i]||{c:0,w:0}})).filter(x=>x.r.c+x.r.w);if(DR.length){Lr.push('','## Wochentage (all time)','');DR.forEach(x=>Lr.push(`- ${x.de}: ✓ ${x.r.c} · ✗ ${x.r.w}`));}
  const LK=lookups().slice(0,20);if(LK.length){Lr.push('','## Words looked up while reading','',LK.map(x=>`${x.w} (${x.en||'?'})${x.n>1?' ×'+x.n:''}`).join(', '));}
  const SL=slowItems().slice(0,10);if(SL.length){Lr.push('','## Correct but slow','');SL.forEach(x=>Lr.push(`- ${SEC[x.sec].n}: ${x.prompt||x.label} – typically ${fmtSec(x.med)}`));}
  return Lr.join('\n');
}
function showReport(){
  const txt=reportText();
  const d=dlg(`<div class="dh"><div><div class="eyebrow">Learning report</div><h2>Summary of your learning</h2><p class="note">Copy it into a chat with Claude to get advice on what to practice, or save it as a file.</p></div><button class="x" type="button" data-close aria-label="Close">✕</button></div><div class="db"><textarea class="report" id="lgReport" readonly></textarea><div class="datarow"><button class="primary" type="button" id="lgCopy">📋 Copy</button><button class="secondary" type="button" id="lgSave">⤓ Save as .md</button></div></div>`);
  if(!d)return;const ta=$('lgReport');ta.value=txt;
  $('lgCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(txt);say('Report copied.');}catch(e){ta.focus();ta.select();try{document.execCommand('copy');say('Report copied.');}catch(err){say('Select the text and press ⌘C to copy.');}}});
  $('lgSave').addEventListener('click',()=>download('deutsch-report-'+dayOf(Date.now())+'.md',txt,'text/markdown;charset=utf-8'));
}

function sEnter(){renderProgress();if(!ready)whenReady(()=>{if(secNow()==='stats')renderProgress();});}

/* ---------------- public API (used by the trainers) ---------------- */
window.LOG={add,shown,hint,vocab:vocabAnswer,gender:genderAnswer,reading:readingAnswer,lookup:readingLookup,verbTable,verbSwap,talk:talkAnswer,days:daysAnswer,
  exportEvents:async()=>{await readyP();return EV.slice();},importEvents,markExported:()=>{try{localStorage.setItem(BACKUP_KEY,String(Date.now()));}catch(e){}},
  all:()=>EV,info:()=>({store,events:EV.length,ready})};
window.NAV={initial:()=>fromHash()||'home',after:navAfter};
window.hEnter=hEnter;window.sEnter=sEnter;window.openItem=openItem;window.histLink=histLink;
init();
})();
