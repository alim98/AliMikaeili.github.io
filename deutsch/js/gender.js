/* 🎨 DER · DIE · DAS trainer: the article rules, the quiz and the "wall" of nouns.
   Noun lists it uses: data/grammar.js.
*/
/* ===== der · die · das trainer ===== */
const ARTS=['der','die','das'];
const gNouns=(()=>{const seen=new Set(),out=[];vocabulary.forEach(c=>{if(c.cat==='places')return;const m=c.de.match(/^(der|die|das) (\p{Lu}(?:[\p{L}-]*\p{L})?)$/u);if(!m)return;const plural=G_PLURAL.has(c.de);const key=c.de+(plural?'/pl':'');if(seen.has(key))return;seen.add(key);const ok=new Set([m[1]]);c.deAlt.forEach(a=>{const x=a.match(/^(der|die|das) (.+)$/);if(x&&x[2]===m[2])ok.add(x[1]);});out.push({id:c.id,art:m[1],word:m[2],ok:[...ok],en:c.en,cat:c.cat,plural});});return out;})();
const gById=Object.fromEntries(gNouns.map(n=>[n.id,n]));
const VERBSET=new Set(vocabulary.filter(c=>c.cat==='verbs').map(c=>c.de));
function isMale(n){return /\b(male|man|husband|gentleman|boyfriend|Mr)\b/i.test(n.en)&&!/female|woman/i.test(n.en);}
function isFemale(n){return /\b(female|woman|wife|girlfriend|Ms)\b/i.test(n.en);}
function compoundOf(n){let best=null;gNouns.forEach(m=>{if(m.plural||n.plural||m.word.length<3||m.word.length>=n.word.length)return;if(lc(n.word).endsWith(lc(m.word))&&(!best||m.word.length>best.word.length))best=m;});return best;}
const sfx=(id,art,suf,str,ex,extra)=>({id,art,suf,str,ex,lab:'-'+suf,test:n=>!n.plural&&lc(n.word).endsWith(suf)&&!(extra&&extra(n))});
const RULES=[
{id:'plural',art:'die',lab:'Plural',str:'always',ex:'die Bücher',test:n=>n.plural},
{id:'male',art:'der',lab:'Male people',str:'always',ex:'der Lehrer',test:n=>!n.plural&&isMale(n)},
{id:'female',art:'die',lab:'Female people (-in)',str:'always',ex:'die Lehrerin',test:n=>!n.plural&&isFemale(n)},
{id:'young',art:'das',lab:'Children',str:'always',ex:'das Kind',test:n=>!n.plural&&/\b(child|kid|baby|girl)\b/i.test(n.en)},
{id:'time',art:'der',lab:'Days, months, seasons',str:'always',ex:'der Montag',test:n=>!n.plural&&/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|spring|summer|autumn|winter)\b/i.test(n.en)},
{id:'verb',art:'das',lab:'Verb as a noun',str:'always',ex:'das Treffen',test:n=>!n.plural&&VERBSET.has(lc(n.word))},
{id:'comp',art:null,lab:'Compound noun',str:'always',ex:'die Telefonnummer',test:n=>!!compoundOf(n)},
sfx('ung','die','ung','always','die Zeitung'),sfx('heit','die','heit','always','die Freiheit'),sfx('keit','die','keit','always','die Möglichkeit'),sfx('schaft','die','schaft','always','die Freundschaft'),sfx('ion','die','ion','always','die Information'),sfx('taet','die','tät','always','die Universität'),sfx('ik','die','ik','usually','die Musik'),sfx('ie','die','ie','usually','die Biologie'),sfx('ei','die','ei','usually','die Polizei'),sfx('ur','die','ur','usually','die Kultur'),
sfx('chen','das','chen','always','das Mädchen'),sfx('lein','das','lein','always','das Fräulein'),sfx('ment','das','ment','usually','das Dokument'),sfx('um','das','um','usually','das Studium'),sfx('ma','das','ma','usually','das Thema'),sfx('nis','das','nis','usually','das Ergebnis'),sfx('o','das','o','often','das Foto'),
sfx('ismus','der','ismus','always','der Tourismus'),sfx('ling','der','ling','always','der Frühling'),sfx('or','der','or','usually','der Motor'),sfx('er','der','er','often','der Computer'),
sfx('e','die','e','usually','die Sprache',n=>lc(n.word).endsWith('ee'))
];
const RULEBY=Object.fromEntries(RULES.map(r=>[r.id,r]));
function ruleOf(n){return RULES.find(r=>r.test(n))||null;}
function predicted(n,r){return r.id==='comp'?compoundOf(n).art:r.art;}
function artSpan(art,word){return `<b class="art-${art}">${art}</b> ${esc(word)}`;}
function tipHTML(n){const r=ruleOf(n);const name=artSpan(n.art,n.word);if(!r)return {cls:'',html:`No rule for this one – learn it as one unit: <b>${name}</b>. Picture it in its colour.`};const p=predicted(n,r);
if(r.id==='comp'){const m=compoundOf(n);return {cls:'',html:`🧩 Compound noun – the <b>last part</b> decides: ${artSpan(m.art,m.word)} → ${name}.`};}
if(!n.ok.includes(p))return {cls:'warn',html:`⚠ Exception! Nouns ending in <b>${r.lab}</b> are ${r.str} <b class="art-${p}">${p}</b>, but it's <b>${name}</b>. Worth remembering.`};
const sg=n.plural&&gNouns.find(m=>!m.plural&&m.word===G_SING[n.word]);const why={plural:'Every plural noun takes <b class="art-die">die</b>'+(sg?(sg.art==='die'?` (singular: ${artSpan(sg.art,sg.word)}).`:` – even though the singular is ${artSpan(sg.art,sg.word)}.`):'.'),young:'Grammatical gender ≠ real gender: a child is <b class="art-das">das</b>, whether boy or girl.',time:'Days, months and seasons are always <b class="art-der">der</b>.',male:'Male people are <b class="art-der">der</b>.',female:'Female people (often ending in <b>-in</b>) are <b class="art-die">die</b>.',verb:`A verb used as a noun is always <b class="art-das">das</b> (${esc(lc(n.word))} → das ${esc(n.word)}).`}[r.id];
return {cls:'',html:'💡 '+(why||`Nouns ending in <b>${r.lab}</b> are ${r.str} <b class="art-${r.art}">${r.art}</b>.`)};}
const gKey=storeKey+'-gender';
let gProg={total:0,correct:0,streak:0,byId:{}};
try{const p=JSON.parse(localStorage.getItem(gKey)||'null');if(p&&typeof p==='object')gProg={...gProg,...p,byId:p.byId||{}};}catch(e){}
function gSave(){try{localStorage.setItem(gKey,JSON.stringify(gProg));}catch(e){}}
const G_LEARN=3;
function gRec(id){return gProg.byId[id]||(gProg.byId[id]={c:0,w:0,s:0});}
function gLearned(id){return (gProg.byId[id]?.s||0)>=G_LEARN;}
let gFilter='all',gQueue=[],gIdx=0,gCur=null,gDone=false,gTimer=null;
try{gFilter=localStorage.getItem(gKey+'-filter')||'all';}catch(e){}
function gPool(){const f=gFilter;let L=gNouns.slice();if(f==='new')return L.filter(n=>!gLearned(n.id));if(f==='mistakes')return L.filter(n=>(gProg.byId[n.id]?.w||0)>0&&!gLearned(n.id));if(f.startsWith('cat:'))return L.filter(n=>n.cat===f.slice(4));if(f.startsWith('rule:'))return L.filter(n=>ruleOf(n)?.id===f.slice(5));if(f.startsWith('art:'))return L.filter(n=>n.art===f.slice(4));return L;}
function gOptions(){const sel=byId('gFilter');const L=gNouns.slice();const opts=[['all',`All nouns (${L.length})`],['new',`Not learned yet (${L.filter(n=>!gLearned(n.id)).length})`],['mistakes',`My mistakes (${L.filter(n=>(gProg.byId[n.id]?.w||0)>0&&!gLearned(n.id)).length})`]];
[['nouns','Nouns'],['classroom','Classroom & office'],['jobs','Jobs & professions'],['personal','Personal info'],['leisure','Uni & free time']].forEach(([c,l])=>{const k=L.filter(n=>n.cat===c).length;if(k)opts.push(['cat:'+c,`Topic: ${l} (${k})`]);});
RULES.forEach(r=>{const k=L.filter(n=>ruleOf(n)===r).length;if(k>=2)opts.push(['rule:'+r.id,`Rule: ${r.id==='comp'?'compound nouns':r.lab+(r.art?' → '+r.art:'')} (${k})`]);});
sel.replaceChildren(...opts.map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;return o;}));if(!opts.some(o=>o[0]===gFilter))gFilter='all';sel.value=gFilter;}
function gNewRound(){const P=gPool();const a=shuffle(P.filter(n=>!gLearned(n.id)).map(n=>n.id)),b=shuffle(P.filter(n=>gLearned(n.id)).map(n=>n.id));gQueue=a.concat(b);gIdx=0;gShow();}
function gStats(){const L=gNouns.slice();const k=L.filter(n=>gLearned(n.id)).length;byId('gLearned').textContent=`Learned ${k} / ${L.length}`;byId('gFill').style.width=(L.length?100*k/L.length:0)+'%';byId('gAcc').textContent=gProg.total?`Accuracy ${Math.round(100*gProg.correct/gProg.total)}% · ${gProg.total} answers`:'';byId('gStreakPill').textContent=`🔥 ${gProg.streak}`;}
function gShow(){clearTimeout(gTimer);const empty=!gQueue.length;byId('gQuiz').classList.toggle('hidden',empty);byId('gEmpty').classList.toggle('hidden',!empty);gStats();if(empty){gCur=null;byId('gEmptyDesc').textContent=gFilter==='mistakes'?'No open mistakes – nice! 🎉':gFilter==='new'?'Every noun is learned! 🎉 Pick “All nouns” to keep them fresh.':'No nouns match this choice.';return;}
gCur=gById[gQueue[gIdx]];gDone=false;const w=byId('gWord');w.className='gword';w.innerHTML=esc(gCur.word)+(gCur.plural?' <span class="pltag">plural</span>':'');byId('gMeaning').textContent=byId('gShowEn').checked?gCur.en:'';
document.querySelectorAll('.gbtn').forEach(b=>{b.disabled=false;b.classList.remove('right','wrong','dim');});const fb=byId('gFb');fb.className='gfb';fb.innerHTML='';byId('gNext').disabled=true;
const r=gProg.byId[gCur.id];byId('gLearnPill').textContent=gLearned(gCur.id)?'✓ Learned':`${r?.s||0}/${G_LEARN} in a row`;byId('gLearnPill').className='pill '+(gLearned(gCur.id)?'good':'');byId('gRound').textContent=`Card ${gIdx+1} of ${gQueue.length}`;LOG.shown('gender');}
/* record one article answer (also used by 🎯 Heute) */
function gScore(n,art,ok){const r=gRec(n.id);gProg.total++;if(ok){gProg.correct++;gProg.streak++;r.c++;r.s++;}else{gProg.streak=0;r.w++;r.s=0;}gSave();LOG.gender(n,art,ok);}
function gAnswer(art){if(gDone||!gCur)return;gDone=true;const n=gCur,ok=n.ok.includes(art),was=gLearned(n.id);gScore(n,art,ok);if(!ok)gQueue.splice(Math.min(gIdx+4,gQueue.length),0,n.id);
document.querySelectorAll('.gbtn').forEach(b=>{b.disabled=true;const a=b.dataset.art;if(n.ok.includes(a))b.classList.add('right');else if(a===art)b.classList.add('wrong');else b.classList.add('dim');});
const w=byId('gWord');w.innerHTML=artSpan(n.art,n.word)+(n.plural?' <span class="pltag">plural</span>':'');w.classList.add(ok?'pop':'shake');
const t=tipHTML(n);const fb=byId('gFb');fb.className='gfb show '+(ok?'good':'bad');fb.innerHTML=`<div class="gres">${ok?(gLearned(n.id)&&!was?'🎉 Learned! 3 in a row.':'✓ Right!'):`✗ It's <b>${artSpan(n.art,n.word)}</b>`+(n.ok.length>1?` (also: ${n.ok.filter(a=>a!==n.art).join(', ')})`:'')}</div><div class="tip ${t.cls}">${t.html}</div>`+(typeof plLine==='function'?plLine(n.id):'');
byId('gNext').disabled=false;byId('gNext').focus();gStats();const r2=gProg.byId[n.id];byId('gLearnPill').textContent=gLearned(n.id)?'✓ Learned':`${r2.s}/${G_LEARN} in a row`;byId('gLearnPill').className='pill '+(gLearned(n.id)?'good':(ok?'':'bad'));
if(byId('gSay').checked)speak(n.art+' '+n.word);if(ok&&byId('gAuto').checked&&!t.cls)gTimer=setTimeout(gNext,1600);renderWall();}
function gNext(){if(!gDone)return;clearTimeout(gTimer);gIdx++;if(gIdx>=gQueue.length){toast('Round done – starting a new one.');gOptions();gNewRound();}else gShow();showTop(byId('gWord'));}
function setGFilter(v){gFilter=v;try{localStorage.setItem(gKey+'-filter',v);}catch(e){}gOptions();gNewRound();}
function renderGRules(){const root=byId('gRules');root.replaceChildren();const L=gNouns.slice();
const card=(r)=>{const ms=L.filter(n=>ruleOf(n)===r);if(!ms.length)return null;const d=document.createElement('div');d.className='rule';const top=document.createElement('div');top.className='rtop';top.innerHTML=`<span class="rlab">${esc(r.lab)}</span><span class="rstr">${r.str}</span>`;d.append(top);const ex=document.createElement('div');ex.className='rex';
if(ms.length)ms.slice(0,6).forEach(n=>{const s=document.createElement('span');const exc=r.art&&r.id!=='comp'&&!n.ok.includes(r.art);s.className='chip on '+n.art+(exc?' exc':'');s.textContent=(exc?'⚠ ':'')+n.art+' '+n.word;s.title=exc?'Exception':n.en;ex.append(s);});
if(ms.length>6){const s=document.createElement('span');s.className='rnone';s.textContent=`+${ms.length-6} more`;ex.append(s);}d.append(ex);
if(ms.length>=2){const b=document.createElement('button');b.type='button';b.className='linkbutton';b.textContent=`▶ Practice this rule (${ms.length})`;b.addEventListener('click',()=>{setGFilter('rule:'+r.id);byId('tabGender').scrollIntoView({behavior:'smooth'});});d.append(b);}return d;};
ARTS.forEach(a=>{const col=document.createElement('div');col.className='rcol '+a;const h=document.createElement('h3');h.innerHTML=`<span class="art-${a}">${a}</span> <small>${{der:'masculine',die:'feminine',das:'neuter'}[a]}</small>`;col.append(h);RULES.filter(r=>r.art===a&&r.id!=='plural').forEach(r=>{const c=card(r);if(c)col.append(c);});root.append(col);});
const gen=document.createElement('div');gen.className='rcol gen';gen.innerHTML='<h3>Rules that always work</h3>';[RULEBY.plural,RULEBY.comp].forEach(r=>{const c=card(r);if(c)gen.append(c);});root.append(gen);}
function renderWall(){if(activeTab!=='gender')return;const root=byId('gWall');root.replaceChildren();const L=gNouns.filter(n=>!n.plural);let k=0;ARTS.forEach(a=>{const col=document.createElement('div');col.className='wcol';const h=document.createElement('h3');const items=L.filter(n=>n.art===a);h.innerHTML=`<span class="art-${a}">${a}</span> <small>${items.length}</small>`;col.append(h);items.sort((x,y)=>x.word.localeCompare(y.word,'de')).forEach(n=>{const s=document.createElement('button');s.type='button';const on=gLearned(n.id);if(on)k++;s.className='chip '+a+(on?' on':'');s.textContent=n.word;s.title=`${n.art} ${n.word} – ${n.en}`+(on?' · learned':'');s.addEventListener('click',()=>speak(n.art+' '+n.word));col.append(s);});root.append(col);});byId('gWallCount').textContent=`${k} of ${L.length} singular nouns learned`;}
document.querySelectorAll('.gbtn').forEach(b=>b.addEventListener('click',()=>gAnswer(b.dataset.art)));
byId('gNext').addEventListener('click',gNext);byId('gSpeak').addEventListener('click',()=>gCur&&speak(gDone?gCur.art+' '+gCur.word:gCur.word));
byId('gFilter').addEventListener('change',e=>setGFilter(e.target.value));
byId('gShowEn').addEventListener('change',()=>{if(gCur)byId('gMeaning').textContent=byId('gShowEn').checked?gCur.en:'';});
byId('gReset').addEventListener('click',()=>{if(!confirm('Reset your der/die/das progress? (Vocabulary progress is not touched.)'))return;gProg={total:0,correct:0,streak:0,byId:{}};gSave();gOptions();gNewRound();renderWall();toast('Article progress reset.');});
document.addEventListener('keydown',e=>{if(activeTab!=='gender'||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest('input,select,textarea'))return;const i=['1','2','3'].indexOf(e.key);if(i>=0){e.preventDefault();gAnswer(ARTS[i]);}else if((e.key==='Enter'||e.key===' ')&&gDone){e.preventDefault();gNext();}});
