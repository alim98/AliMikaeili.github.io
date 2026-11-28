/* 🎯 HEUTE – today's mixed session (step 2 of LEARNING-PLAN.md).
   Reviews that are due, your recent mistakes and a few new things, from every trainer, mixed together:
   translate a word, its article, its plural, a verb form. The schedule itself is in js/review.js.
   Every answer is recorded exactly like in the trainer it belongs to (same progress, same history),
   with details.via = 'heute'.
*/
const hxKey=storeKey+'-heute';
let HX={q:[],i:0,cur:null,done:false,tries:{},st:null,size:20,running:false};
try{const u=JSON.parse(localStorage.getItem(hxKey)||'null');if(u&&[10,20,30].includes(u.size))HX.size=u.size;}catch(e){}
function hxSaveUI(){try{localStorage.setItem(hxKey,JSON.stringify({size:HX.size}));}catch(e){}}
const HX_KIND={v:{i:'📚',n:'Translate',sec:'vocab'},g:{i:'🎨',n:'der · die · das',sec:'gender'},p:{i:'👥',n:'Plural',sec:'plural'},f:{i:'🔁',n:'Verb form',sec:'verbs'}};
const hxMin=n=>Math.max(1,Math.round(n/5));   // about 12 seconds per answer (your first sessions: 50 answers in 8 minutes)
const hxSec=ms=>(ms/1000).toFixed(ms<9950?1:0).replace('.0','')+' s';

/* ===== start screen ===== */
function hxEnter(){if(HX.running){hxShowCard();return;}const box=byId('hxStart');if(!SRS.ensure()){box.innerHTML='<p class="empty-s">Loading your learning history …</p>';LOG.ready(()=>{if(activeTab==='heute'&&!HX.running)hxRenderStart();});return;}hxRenderStart();}
function hxRenderStart(){byId('hxCard').classList.add('hidden');const box=byId('hxStart');box.classList.remove('hidden');
  const c=SRS.counts(),P=SRS.plan(HX.size),n=P.items.length,by={};P.items.forEach(x=>{by[x.k[0]]=(by[x.k[0]]||0)+1;});
  const rate=c.rev.n>=5?Math.round(100*c.rev.ok/c.rev.n):null;
  const tile=(v,l)=>`<div class="htile"><div class="v">${v}</div><div class="l">${l}</div></div>`;
  box.innerHTML=`<div class="hxhead"><div><div class="eyebrow">${esc(new Date().toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'}))}</div><h2>🎯 Heute – your session for today</h2>
<p class="note">Reviews that are due, your recent mistakes and a few new things, all mixed together.</p></div></div>
<div class="htiles">${tile(c.revDue+c.fix,'📅 due: reviews and today\'s fixes')}${tile(c.old,'📦 old mistakes – a few in every session')}${tile(P.fresh,'🆕 new in this session')}${tile(n?'≈ '+hxMin(P.answers)+' min':'—',n?`session · about ${P.answers} answers`:'session')}</div>
${n?`<div class="hxmix">${Object.entries(by).map(([t,k])=>`<span class="chip">${HX_KIND[t].i} ${esc(HX_KIND[t].n)} · ${k}</span>`).join('')}</div>`:''}
${P.why?`<p class="hintline hxwhy">🆕 <b>${P.fresh} new</b> in this session: ${esc(P.why)}.</p>`:''}
<div class="hxgo"><div class="seg" role="group" aria-label="Session length">${[10,20,30].map(s=>`<button type="button" data-hxsize="${s}" aria-pressed="${HX.size===s}">${s} questions</button>`).join('')}</div>
<button class="primary" type="button" id="hxGo"${n?'':' disabled'}>${n?'▶ Start Heute':'All done for today 🎉'}</button></div>
${n?'':`<p class="hintline">Nothing to do right now. ${c.tomorrow?`Tomorrow: <b>${c.tomorrow}</b> reviews.`:''} Practise any trainer – it all counts.</p>`}
<div class="hxstages"><span>🌱 learning <b>${c.stage.learning}</b></span><span>📅 reviewing <b>${c.stage.review}</b></span><span>🏦 known <b>${c.stage.known}</b></span><span>⏭ tomorrow <b>${c.tomorrow}</b> · next 7 days <b>${c.week}</b></span>${rate!=null?`<span>✓ reviews remembered (30 days) <b>${rate}%</b> <small>target 85%</small></span>`:''}</div>
<details class="hxhow"><summary>How Heute works</summary><p class="hintline">• Everything you answer – here or in any trainer – feeds one schedule. A right answer moves an item further away (about 1 → 3 → 7 → 16 → 35 days); a mistake brings it back soon, and after relearning it restarts at 40 % of its old gap, not at zero.<br>• 📦 Old mistakes (words you got wrong more than a day ago and haven't relearned, and practice from before 25 Nov) don't all come at once: they fill the rest of a session, a few of each kind. A word you never got right is shown to you first again.<br>• A session of 20 means about 20 answers: something you are still learning comes back once or twice in the session, so it counts double. The kinds take turns – no session is only verb forms.<br>• Each word has separate items: its translation both ways, its article, its plural and (for verbs) its forms – knowing <i lang="de">haben</i> = to have does not skip <i lang="de">du hast</i>.<br>• New things come in a fixed order: see the word → recognise it (DE → EN) → write it in German → its article → its plural. How many depends on your last 30 answers: none below 75 % correct (reviews first), 5 normally, 8 above 90 % when you are also quick. Fewer when you forget many reviews or a busy week is coming.<br>• ⚡ Speed counts: a right answer that comes quickly gets a slightly longer gap; a slow one (much slower than your usual time) a shorter one.<br>• 🎯 The gaps tune themselves: if you remember more than 85 % of your reviews they get longer, if less they get shorter.<br>• 🗃 Archive (under each question) takes it out of the section it comes from: a translation out of 📚 Vocabulary, an article out of 🎨 der · die · das, a plural out of 👥 Plural, a verb out of 🔁 Verbs. Restore it there, under “🗃 Archived”.</p></details>`;
  box.querySelectorAll('[data-hxsize]').forEach(b=>b.addEventListener('click',()=>{HX.size=Number(b.dataset.hxsize);hxSaveUI();hxRenderStart();}));
  byId('hxGo').addEventListener('click',hxStart);}
function hxStart(){const P=SRS.plan(HX.size);if(!P.items.length)return;HX.q=P.items.map(x=>({...x}));HX.i=0;HX.tries={};HX.running=true;
  HX.st={n:0,ok:0,t0:Date.now(),seen:new Set(),times:[],newK:new Set(P.items.filter(x=>x.isNew).map(x=>x.k)),before:{}};
  HX.q.forEach(x=>{const s=SRS.get(x.k);HX.st.before[x.k]=s?s.ivl:-1;});
  LOG.add({section:'heute',action:'setting',item:'session start',given:String(HX.q.length),details:{due:P.due,fresh:P.fresh}});
  byId('hxStart').classList.add('hidden');byId('hxCard').classList.remove('hidden');hxShow();}

/* ===== one question ===== */
function hxItem(x){const p=SRS.parse(x.k);if(p.t==='v')return {...p,c:vocabulary[Number(p.id)]};if(p.t==='g')return {...p,n:gById[p.id]};if(p.t==='p')return {...p,pl:P_BY[p.id]};return {...p,v:SRS.VINF[p.inf]};}
function hxShowCard(){byId('hxStart').classList.add('hidden');byId('hxCard').classList.remove('hidden');}
function hxShow(){hxShowCard();const x=HX.q[HX.i],it=hxItem(x),K=HX_KIND[it.t];HX.cur={x,it};HX.done=false;
  const st=x.preview?'🆕 new word':x.again?'🔁 again':x.isNew?'🆕 new':{learning:'🌱 learning',review:'📅 review',known:'🏦 known'}[SRS.stage(x.k)]||'';
  byId('hxKind').textContent=K.i+' '+K.n;byId('hxStage').textContent=st;byId('hxCount').textContent=`${HX.i+1} / ${HX.q.length}`;byId('hxFill').style.width=(100*HX.i/HX.q.length)+'%';
  const q=byId('hxQ'),sub=byId('hxSub'),task=byId('hxTask'),form=byId('hxForm'),inp=byId('hxIn'),arts=byId('hxArts'),fb=byId('hxFb');
  q.className='hxq';sub.textContent='';fb.className='hxfb';fb.innerHTML='';inp.value='';inp.disabled=false;byId('hxCheck').classList.remove('hidden');byId('hxReveal').disabled=false;byId('hxReveal').classList.toggle('hidden',!!x.preview);byId('hxNext').disabled=true;byId('hxNext').textContent='Next →';
  arts.classList.add('hidden');form.classList.add('hidden');arts.querySelectorAll('.gbtn').forEach(b=>{b.disabled=false;b.classList.remove('right','wrong','dim');});
  if(x.preview){const c=it.c,m=c.de.match(/^(der|die|das) (.+)$/);task.textContent='🌱 A new word – look at it and say it aloud';q.innerHTML=m?artSpan(m[1],m[2]):esc(c.de);sub.textContent=c.en;
    fb.className='hxfb show pv';fb.innerHTML=hxExtras(c,true);hxWire(fb);byId('hxNext').disabled=false;byId('hxNext').textContent='Got it →';HX.done=true;
    byId('hxKbd').textContent='Enter = got it · it comes back in a few questions';if(byId('autoSay').checked)speak(c.de);setTimeout(()=>byId('hxNext').focus(),40);return;}
  LOG.shown(K.sec);
  if(it.t==='v'){const c=it.c,de=it.dir==='en-de';task.textContent=de?'Translate into German'+(isNoun(c)&&byId('articles').checked?' – with der / die / das':''):'Translate into English';q.textContent=de?c.en:c.de;q.lang=de?'en':'de';if(!de)q.classList.add('isde');
    form.classList.remove('hidden');inp.placeholder=de?'Write in German…':'Write in English…';inp.lang=de?'de':'en';}
  else if(it.t==='g'){task.textContent='Which article?';q.textContent=it.n.word;q.lang='de';sub.textContent=it.n.en;arts.classList.remove('hidden');}
  else if(it.t==='p'){task.textContent='Write the plural';q.innerHTML=artSpan(it.pl.art,it.pl.sg);q.lang='de';sub.textContent=it.pl.en;form.classList.remove('hidden');inp.placeholder='die …';inp.lang='de';}
  else{const v=it.v;task.textContent=`Conjugate: ${v.inf} (${v.en})`;q.innerHTML=`${esc(SRS.PRON[it.i])} <span class="hxgap">…</span>`;q.lang='de';sub.textContent='';form.classList.remove('hidden');inp.placeholder=SRS.PRON[it.i].split(' / ')[0]+' …';inp.lang='de';}
  byId('hxKbd').textContent=it.t==='g'?'Keys 1 = der · 2 = die · 3 = das · Enter = next':'Enter = check · Enter again = next';
  if(it.t!=='g')setTimeout(()=>{if(!HX.done)inp.focus();},40);else document.activeElement?.blur?.();}
/* example sentence, article rule and plural for a word */
function hxExtras(c,withEx){let h='';if(withEx){try{const e=EX.find(c)[0];if(e)h+=`<div class="tip vtip vex"><span class="vtag">Example</span><div class="vexrow"><button type="button" class="speak-mini" data-say="${esc(e.de)}" title="Listen">🔊</button><div><div class="vexde" lang="de">${EX.mark(c,e.de)}</div><div class="vexen">${esc(e.en)}</div></div></div></div>`;}catch(err){}}
  const n=gById[c.id];if(n&&!n.plural){const r=ruleOf(n),t=r?tipHTML(n):null,pl=typeof plLine==='function'?plLine(c.id,!r):'';if(t||pl)h+=`<div class="tip vtip ${t?t.cls:''}"><span class="vtag">${t?'der · die · das':'Plural'}</span>${t?t.html:''}${pl}</div>`;}return h;}
function hxWire(el){el.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.say)));}
function hxCheck(art){if(HX.done||!HX.cur)return;const {x,it}=HX.cur;let val=byId('hxIn').value.trim();if(it.t!=='g'&&!val){toast('Type an answer – or choose Show answer.');return;}hxRecord(art!=null?art:val,false);}
/* record the answer in the trainer it belongs to, show the result */
function hxRecord(val,revealed){const {x,it}=HX.cur;HX.done=true;LOG.via('heute');let res,head='',sol='',more='',say='';
  try{
  if(it.t==='v'){const c=it.c,dir=it.dir,de=dir==='en-de';const j=revealed?{res:'revealed'}:de?deJudge(val,c):enJudge(val,c);res=j.res;
    const note=vocabScore(c,dir,res);LOG.vocab(c,dir,res,revealed?'':val,j);
    if(res==='almost'&&/article/.test(j.kind)&&gById[c.id]){const g=gRec(c.id);g.w++;g.s=0;gSave();}
    sol=esc(de?c.de:c.en);head=res==='almost'?(/article/.test(j.kind)?'≈ Almost – check the article:':'≈ Almost – small spelling mistake:'):'';
    more=(res==='almost'&&j.kind==='spelling'?`<div class="hxnote">Your answer: “${esc(val)}” → <span class="vdiff">${diffMark(val.replace(/^(der|die|das) /i,''),String(j.exp||c.de).replace(/^(der|die|das) /,''))}</span></div>`:'')+(j.gram?`<div class="hxnote">${esc(j.gram)}</div>`:'')+(j.typo?'<div class="hxnote">Small typo – counted as correct.</div>':'')+(j.loose?'<div class="hxnote">Right meaning in other words – counted as correct.</div>':'')+(j.syn?`<div class="hxnote">Right – that is also the meaning of <span lang="de">${esc(j.syn.de)}</span>.</div>`:'')+(note?`<div class="hxnote">${esc(note)}</div>`:'')+(de&&!revealed&&res!=='correct'?(t=>t?`<div class="hxnote">✍️ ${t}</div>`:'')(spellTip(val.replace(/^(der|die|das) /i,''),c.de.replace(/^(der|die|das) /,''))):'')+hxExtras(c,true);say=c.de;}
  else if(it.t==='g'){const n=it.n,ok=!revealed&&n.ok.includes(val);res=ok?'correct':revealed?'revealed':'wrong';gScore(n,revealed?'':val,ok);
    document.querySelectorAll('#hxArts .gbtn').forEach(b=>{b.disabled=true;const a=b.dataset.art;if(n.ok.includes(a))b.classList.add('right');else if(a===val)b.classList.add('wrong');else b.classList.add('dim');});
    sol=artSpan(n.art,n.word);const t=tipHTML(n);more=`<div class="tip ${t.cls}">${t.html}</div>`+(typeof plLine==='function'?plLine(n.id):'');say=n.art+' '+n.word;}
  else if(it.t==='p'){const p=it.pl,J=revealed?{ok:false,errors:undefined,det:{},note:'',expected:'die '+p.pl}:plJudge(p,'write',val);res=J.ok?'correct':revealed?'revealed':'wrong';
    pScore(p,'write',J.ok,revealed?'':val,J.expected,res,J.errors,J.det);const t=plTip(p);
    sol=`${artSpan(p.art,p.sg)} → <b class="art-die">die</b> ${plMark(p)} <span class="plpat">${esc(PPAT[p.n].lab)}</span>`;more=(J.note?`<div class="hxnote">${J.note}</div>`:'')+`<div class="tip ${t.cls}">${t.html}</div>`;say='die '+p.pl;}
  else{const v=it.v,parts=vParts(v.inf),exp=vForm(parts[it.i]),given=val.replace(/^(ich|du|er|sie|es|wir|ihr|Sie)(\s*\/\s*(sie|es|Sie))*\s+/i,'').trim();
    const ok=!revealed&&norm(given,1)===norm(exp,1),uml=!ok&&!revealed&&norm(given,0)===norm(exp,0);res=ok?'correct':revealed?'revealed':'wrong';
    LOG.verbForm(v,it.i,revealed?'':val,exp,res,ok||revealed?undefined:[uml?'missing umlaut':VPRON[it.i]+' form']);
    sol=`${esc(SRS.PRON[it.i])} ${vFormHTML(v.inf,parts[it.i])}`;const stip=!ok&&!revealed&&!uml?spellTip(given,exp):'',fam=!ok&&vFams(v.inf).some(f=>f!=='reg');
    more=(uml?'<div class="hxnote">Right letters, but the umlaut is missing. Type it with the ä ö ü buttons below the box.</div>':'')+(stip?`<div class="hxnote">✍️ ${stip}</div>`:'')+(fam?`<div class="tip hxfam">${vTipHTML(v.inf)}</div>`:'')+`<table class="vtab hxvtab">${parts.map((pp,i)=>`<tr${i===it.i?' class="on"':''}><td>${esc(VPRON[i])}</td><td lang="de">${vFormHTML(v.inf,pp)}</td></tr>`).join('')}</table>`;say=SRS.PRON[it.i].split(' / ')[0]+' '+exp;}
  }finally{LOG.via(null);}
  const SP=SRS.lastSpeed(),wasRev=(HX.st.before[x.k]||0)>0&&!x.again;   // ⚡ how fast it came (js/review.js)
  if(res==='correct'&&SP){HX.st.times.push(SP.t);
    if(SP.sp==='slow')more=`<div class="hxnote">🐢 Right, but slow: ${hxSec(SP.t)} to think (you usually need ${hxSec(SP.med)}). ${wasRev?'It comes back a little sooner.':'Say it aloud a few times.'}</div>`+more;
    else if(SP.sp==='fast')more=`<div class="hxnote">⚡ Quick – ${hxSec(SP.t)}.${wasRev?' Its next gap grows a little more.':''}</div>`+more;}
  const ok=res==='correct'||res==='almost';HX.st.n++;if(ok)HX.st.ok++;HX.st.seen.add(x.k);
  const fb=byId('hxFb');fb.className='hxfb show '+(res==='correct'?'good':res==='almost'?'almost':'bad');
  fb.innerHTML=`<div class="gres">${head||(res==='correct'?'✓ Right!':revealed?'👁 The answer:':'✗ Not quite – it is:')}</div><div class="hxsol" lang="de">${sol}</div>${more}`;hxWire(fb);
  byId('hxIn').disabled=true;byId('hxCheck').classList.add('hidden');byId('hxReveal').disabled=true;byId('hxNext').disabled=false;
  const s=SRS.get(x.k),tries=HX.tries[x.k]=(HX.tries[x.k]||0)+1;        // still learning? it comes back later in this session
  if(s&&s.ivl===0&&tries<3)HX.q.splice(Math.min(HX.i+1+(res==='correct'?5:3),HX.q.length),0,{k:x.k,again:true});
  byId('hxCount').textContent=`${HX.i+1} / ${HX.q.length}`;
  if(say&&byId('autoSay').checked)speak(say);
  setTimeout(()=>byId('hxNext').focus(),30);}
function hxNext(){if(!HX.running||!HX.done)return;const x=HX.q[HX.i];
  if(x&&x.preview){const c=vocabulary[Number(SRS.parse(x.k).id)],r=progress.byId[c.id]||{correct:0,wrong:0};r.previewed=true;progress.byId[c.id]=r;save();
    LOG.add({section:'vocab',action:'preview',item:c.id,label:c.de,details:{via:'heute'}});HX.q.splice(Math.min(HX.i+4,HX.q.length),0,{k:x.k,isNew:true});}
  HX.i++;if(HX.i>=HX.q.length)hxFinish();else{hxShow();showTop(byId('hxCard'));}}
/* ===== the end of a session ===== */
function hxFinish(){HX.running=false;const st=HX.st,min=Math.max(1,Math.round((Date.now()-st.t0)/6e4));let up=0,learned=0;
  st.seen.forEach(k=>{const s=SRS.get(k),b=st.before[k];if(!s)return;if(s.ivl>0&&(b===-1||b===0))learned++;else if(s.ivl>b&&b>0)up++;});
  const c=SRS.counts();LOG.add({section:'heute',action:'setting',item:'session end',given:`${st.ok}/${st.n}`,details:{minutes:min,learned,stronger:up}});
  byId('hxCard').classList.add('hidden');const box=byId('hxStart');box.classList.remove('hidden');
  box.innerHTML=`<div class="hxhead"><div><div class="eyebrow">Session finished</div><h2>${st.n&&st.ok/st.n>=.8?'🎉 Sehr gut!':'👍 Gut gemacht!'}</h2><p class="note">${st.n} answers · ${st.n?Math.round(100*st.ok/st.n):0}% right · about ${min} min${st.times.length>=3?` · typical thinking time ${hxSec(st.times.slice().sort((a,b)=>a-b)[st.times.length>>1])} <small>(goal: under 3 s)</small>`:''}</p></div></div>
<div class="htiles"><div class="htile"><div class="v">${learned}</div><div class="l">🌱 → 📅 learned (back tomorrow or later)</div></div><div class="htile"><div class="v">${up}</div><div class="l">📈 reviews passed – now longer gaps</div></div><div class="htile"><div class="v">${c.revDue+c.fix}</div><div class="l">📅 still due today${c.old?` · 📦 ${c.old} old mistakes`:''}</div></div><div class="htile"><div class="v">${c.tomorrow}</div><div class="l">⏭ due tomorrow</div></div></div>
<div class="hxgo"><button class="primary" type="button" id="hxMore"${c.due||SRS.plan(10).items.length?'':' disabled'}>▶ 10 more</button><button class="secondary" type="button" id="hxHome">🏠 Back to Home</button></div>`;
  byId('hxMore').addEventListener('click',()=>{HX.size=10;hxStart();HX.size=JSON.parse(localStorage.getItem(hxKey)||'{"size":20}').size||20;});byId('hxHome').addEventListener('click',()=>setTab('home'));}
/* 🗃 archive the current question in the section it comes from:
   translation → 📚 Vocabulary · article → 🎨 der · die · das · plural → 👥 Plural · verb form → the verb in 🔁 Verbs */
function hxArchive(){if(!HX.running||!HX.cur)return;const {it}=HX.cur;let lab,where;
  if(it.t==='v'){setArchived(it.c.id,true);lab=it.c.de;where='📚 Vocabulary (translation only)';}
  else if(it.t==='g'){lab=it.n.art+' '+it.n.word;setArch('gender',it.n.id,true,lab);where=ARCH_NAME.gender;}
  else if(it.t==='p'){lab=it.pl.art+' '+it.pl.sg;setArch('plural',it.pl.id,true,lab);where=ARCH_NAME.plural;}
  else{lab=it.v.inf;setArch('verbs',it.v.id,true,lab);where=ARCH_NAME.verbs+' (all its forms)';}
  toast(`🗃 “${lab}” archived in ${where}. Restore it there under “🗃 Archived”.`);
  for(let i=HX.q.length-1;i>HX.i;i--)if(!SRS.valid(HX.q[i].k))HX.q.splice(i,1);      // its later repeats go too
  HX.q.splice(HX.i,1);if(HX.i>=HX.q.length)hxFinish();else{hxShow();showTop(byId('hxCard'));}}
/* ===== wiring ===== */
byId('hxForm').addEventListener('submit',e=>{e.preventDefault();if(HX.done)hxNext();else hxCheck();});
byId('hxNext').addEventListener('click',hxNext);byId('hxArch').addEventListener('click',hxArchive);byId('hxReveal').addEventListener('click',()=>{if(!HX.done&&HX.cur)hxRecord('',true);});
byId('hxStop').addEventListener('click',()=>{if(HX.running&&confirm('Finish the session now? Everything you answered is saved.'))hxFinish();});
byId('hxSay').addEventListener('click',()=>{if(!HX.cur)return;const it=HX.cur.it;speak(it.t==='v'?it.c.de:it.t==='g'?(HX.done?it.n.art+' ':'')+it.n.word:it.t==='p'?(HX.done?'die '+it.pl.pl:it.pl.art+' '+it.pl.sg):it.v.inf);});
document.querySelectorAll('#hxArts .gbtn').forEach(b=>b.addEventListener('click',()=>hxCheck(b.dataset.art)));
document.addEventListener('keydown',e=>{if(activeTab!=='heute'||!HX.running||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest('input,select,textarea'))return;
  const it=HX.cur&&HX.cur.it,i=['1','2','3'].indexOf(e.key);
  if(it&&it.t==='g'&&!HX.done&&i>=0){e.preventDefault();hxCheck(ARTS[i]);}else if(e.key==='Enter'&&HX.done){e.preventDefault();hxNext();}});
