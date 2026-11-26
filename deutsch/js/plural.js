/* 👥 PLURAL trainer: the 8 plural forms (Nov 26 worksheet "8 Plural Forms").
   The nouns and their plurals are in data/grammar.js (PLURALS). The pattern of each noun is worked out
   from its two forms, and a rule explains it after every answer.
   Exercises:  pattern = choose the pattern (keys 1–8) · write = write the plural · sing = plural → singular with its article
   Progress is saved per vocabulary card id (like 🎨 der · die · das), so a noun's history shows every trainer.
*/
/* ===== the 8 patterns, numbered as on the worksheet ===== */
const PPAT=[null,
{lab:'–',name:'no change',ex:['das Fenster','Fenster'],typ:'der / das nouns ending in -er, -el, -en · every -chen and -lein noun'},
{lab:'-s',name:'add -s',ex:['das Handy','Handys'],typ:'words ending in -a, -i, -o, -u, -y · short forms (CD) · many English words'},
{lab:'-n',name:'add -n',ex:['die Tafel','Tafeln'],typ:'nouns ending in -e · die nouns ending in -el or -er'},
{lab:'-en / -nen',name:'add -en (-nen after -in)',ex:['der Student','Studenten'],typ:'die nouns ending in a consonant (-ung, -heit, -keit, -ion …) · -or nouns · female -in → -innen'},
{lab:'-e',name:'add -e',ex:['der Tisch','Tische'],typ:'many der and das nouns, often one syllable'},
{lab:'¨-e',name:'umlaut + -e',ex:['der Stuhl','Stühle'],typ:'many one-syllable der nouns with a, o, u'},
{lab:'-er',name:'add -er',ex:['das Kind','Kinder'],typ:'a few short das nouns'},
{lab:'¨-er',name:'umlaut + -er',ex:['das Buch','Bücher'],typ:'short das nouns with a, o, u – always with the umlaut'}];
const P_UML=s=>s.replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u');
/* which pattern turns the singular into the plural? → {n, suf} or null */
function plType(sg,pl){sg=lc(sg);pl=lc(pl);const S=[['nen',4],['en',4],['n',3],['er',7],['e',5],['s',2],['',1]];
for(const [s,n] of S)if(pl.endsWith(s)&&pl.slice(0,pl.length-s.length)===sg)return {n,suf:s};
for(const [s,n] of S){if((n!==5&&n!==7)||!pl.endsWith(s))continue;const st=pl.slice(0,pl.length-s.length);if(st!==sg&&st.length===sg.length&&P_UML(st)===P_UML(sg))return {n:n+1,suf:s};}
return null;}
/* the singular with an umlaut on its last a / o / u (au → äu), or null if there is none */
function plUml(w){const U={a:'ä',o:'ö',u:'ü',A:'Ä',O:'Ö',U:'Ü'};for(let i=w.length-1;i>=0;i--){const ch=w[i];if(/[äöüÄÖÜie]/.test(ch)&&!(ch==='e'&&i===w.length-1))return null;if(!U[ch])continue;if((ch==='u'||ch==='U')&&/[aA]/.test(w[i-1]||''))return w.slice(0,i-1)+U[w[i-1]]+w.slice(i);if((ch==='u'||ch==='U')&&/[eE]/.test(w[i-1]||''))return null;return w.slice(0,i)+U[ch]+w.slice(i+1);}return null;}
/* what a pattern would make of the singular (to show why a wrong choice is wrong) */
function plApply(sg,n){const u=plUml(sg);return {1:sg,2:sg+'s',3:sg+'n',4:sg+(/in$/.test(sg)?'nen':'en'),5:sg+'e',6:u&&u+'e',7:sg+'er',8:u&&u+'er'}[n]||null;}
const P_ITEMS=(()=>{const out=[],seen=new Set();PLURALS.forEach(([full,pl,tag])=>{const m=full.match(/^(der|die|das) (.+)$/),t=m&&plType(m[2],pl);if(!t){console.warn('Plural trainer: cannot read',full,pl);return;}
const c=vocabulary.find(v=>v.de===full),id=c?c.id:'pl:'+m[2];if(seen.has(id))return;seen.add(id);
const arts=new Set([m[1]]);if(c)c.deAlt.forEach(a=>{const x=a.match(/^(der|die|das) (.+)$/);if(x&&x[2]===m[2])arts.add(x[1]);});
out.push({id,art:m[1],arts:[...arts],sg:m[2],pl,n:t.n,suf:t.suf,en:c?c.en:'',cat:c?c.cat:'',sheet:tag==='ws'});});return out;})();
const P_BY=Object.fromEntries(P_ITEMS.map(p=>[p.id,p]));
/* the plural as HTML: umlaut and ending marked */
function plMark(p){const st=p.pl.slice(0,p.pl.length-p.suf.length);let h='';for(let i=0;i<st.length;i++)h+=st[i]!==p.sg[i]?`<span class="pl-uml">${esc(st[i])}</span>`:esc(st[i]);return h+(p.suf?`<span class="pl-end">${esc(p.suf)}</span>`:'');}
/* the usual rule for this noun: set = patterns it predicts, t = explanation */
function plRule(p){const w=lc(p.sg),a=p.art,D=x=>`<b class="art-${x}">${x}</b>`;
if(p.n===2)return {set:[2],t:'Words ending in <b>-a, -i, -o, -u, -y</b>, short forms (die CD) and many English words add <b>-s</b>: das Handy → die Handys, der Test → die Tests.'};
if(/(chen|lein)$/.test(w))return {set:[1],t:'Nouns ending in <b>-chen</b> or <b>-lein</b> never change: das Mäppchen → die Mäppchen.'};
if(a==='die'&&/in$/.test(w)&&/female/i.test(p.en))return {set:[4],t:'Female <b>-in</b> → <b>-innen</b> (double n): die Lehrerin → die Lehrerinnen. The male form is in group 1: der Lehrer → die Lehrer.'};
if(a==='die'&&/(ung|heit|keit|schaft|ion|tät)$/.test(w))return {set:[4],t:'Nouns ending in <b>-ung, -heit, -keit, -schaft, -ion, -tät</b> always add <b>-en</b>: die Übung → die Übungen.'};
if(/e$/.test(w))return {set:[3],t:'Nouns ending in <b>-e</b> just add <b>-n</b>: die Lampe → die Lampen, der Kollege → die Kollegen.'};
if(a==='die'&&/(el|er)$/.test(w))return {set:[3],t:`${D('die')} nouns ending in <b>-el</b> or <b>-er</b> add <b>-n</b>: die Tafel → die Tafeln, die Büroklammer → die Büroklammern.`};
if(/(er|el|en)$/.test(w))return {set:[1],t:`${D('der')} and ${D('das')} nouns ending in <b>-er, -el, -en</b> usually stay the same – only the article changes: der Computer → die Computer.`};
if(a==='der'&&/or$/.test(w))return {set:[4],t:'Nouns ending in <b>-or</b> add <b>-en</b>, and the stress moves: der Pro<u>jek</u>tor → die Projek<u>to</u>ren.'};
if(a==='der'&&/(ent|ant|ist)$/.test(w))return {set:[4],t:`${D('der')} nouns for people ending in <b>-ent, -ant, -ist</b> add <b>-en</b>: der Student → die Studenten.`};
if(a==='die')return {set:[4],t:`${D('die')} nouns ending in a consonant usually add <b>-en</b>: die Uhr → die Uhren, die Tür → die Türen.`};
if(a==='der')return {set:[5,6],t:`Most ${D('der')} nouns add <b>-e</b>, often with an umlaut on a / o / u: der Tisch → die Tische, der Stuhl → die Stühle.`};
return {set:[5,7,8],t:`Most ${D('das')} nouns add <b>-e</b> (das Heft → die Hefte). Some short ones add <b>-er</b>, with an umlaut on a / o / u: das Kind → die Kinder, das Buch → die Bücher.`};}
function plTip(p){const r=plRule(p),ex=!r.set.includes(p.n);let h=ex?`⚠ Not the usual pattern. ${r.t} But it is <b>die ${esc(p.pl)}</b> – learn this one by heart.`:'💡 '+r.t;
if(p.n===6||p.n===8)h+='<div class="plnote">Umlaut: a → ä, o → ö, u → ü, au → äu – on the vowel of the <b>last part</b> of the word: Papier<b>korb</b> → Papier<b>körbe</b>.</div>';
return {cls:ex?'warn':'',html:h};}
/* "Plural: die Stühle ¨-e" – shown by the 📚 Vocabulary and 🎨 der · die · das trainers too */
function plLine(id,bare){const p=P_BY[id];return p?`<div class="plline">${bare?'':'Plural: '}<b class="art-die">die</b> <span lang="de">${plMark(p)}</span> <span class="plpat">${esc(PPAT[p.n].lab)}</span></div>`:'';}

/* ===== progress ===== */
const pKey=storeKey+'-plural',P_LEARN=3;
const P_MODES={pattern:'Which plural pattern?',write:'Write the plural',sing:'Back to the singular – with its article'};
let pProg={total:0,correct:0,streak:0,by:{}};
try{const x=JSON.parse(localStorage.getItem(pKey)||'null');if(x&&typeof x==='object')pProg={...pProg,...x,by:x.by||{}};}catch(e){}
let pMode='pattern',pFilter='all';
try{const u=JSON.parse(localStorage.getItem(pKey+'-ui')||'null');if(u&&typeof u==='object'){if(P_MODES[u.mode])pMode=u.mode;if(typeof u.filter==='string')pFilter=u.filter;['pShowEn','pSay','pAuto'].forEach(k=>{if(typeof u[k]==='boolean')byId(k).checked=u[k];});}}catch(e){}
function pSave(){try{localStorage.setItem(pKey,JSON.stringify(pProg));}catch(e){}}
function pSaveUI(){try{localStorage.setItem(pKey+'-ui',JSON.stringify({mode:pMode,filter:pFilter,pShowEn:byId('pShowEn').checked,pSay:byId('pSay').checked,pAuto:byId('pAuto').checked}));}catch(e){}}
function pRec(id){return pProg.by[id]||(pProg.by[id]={c:0,w:0,s:0});}
function pLearned(id){return (pProg.by[id]?.s||0)>=P_LEARN;}
const pOpen=p=>(pProg.by[p.id]?.w||0)>0&&!pLearned(p.id);
let pQueue=[],pIdx=0,pCur=null,pDone=false,pTimer=null,pHintLv=0;
function pList(){return P_ITEMS.filter(p=>!isArch(p.id));}
function pPool(){const f=pFilter,L=pList();if(f==='new')return L.filter(p=>!pLearned(p.id));if(f==='mistakes')return L.filter(pOpen);if(f==='sheet')return L.filter(p=>p.sheet);if(f.startsWith('pat:'))return L.filter(p=>p.n===Number(f.slice(4)));if(f.startsWith('cat:'))return L.filter(p=>p.cat===f.slice(4));return L;}
function pOptions(){const sel=byId('pFilter'),L=pList(),k=f=>L.filter(f).length;
const o=[['all',`All nouns (${L.length})`],['new',`Not learned yet (${k(p=>!pLearned(p.id))})`],['mistakes',`My mistakes (${k(pOpen)})`],['sheet',`The worksheet “8 Plural Forms” (${k(p=>p.sheet)})`],['cat:classroom',`Classroom & office (${k(p=>p.cat==='classroom')})`]];
for(let n=1;n<=8;n++)o.push(['pat:'+n,`Pattern ${n}: ${PPAT[n].lab} · ${PPAT[n].ex[0]} → die ${PPAT[n].ex[1]} (${k(p=>p.n===n)})`]);
sel.replaceChildren(...o.map(([v,t])=>{const e=document.createElement('option');e.value=v;e.textContent=t;return e;}));if(!o.some(x=>x[0]===pFilter))pFilter='all';sel.value=pFilter;}
function pNewRound(){const P=pPool();pQueue=shuffle(P.filter(p=>!pLearned(p.id)).map(p=>p.id)).concat(shuffle(P.filter(p=>pLearned(p.id)).map(p=>p.id)));pIdx=0;pShow();}
function pStats(){const L=pList(),k=L.filter(p=>pLearned(p.id)).length;byId('pLearned').textContent=`Learned ${k} / ${L.length}`;byId('pFill').style.width=(L.length?100*k/L.length:0)+'%';byId('pAcc').textContent=pProg.total?`Accuracy ${Math.round(100*pProg.correct/pProg.total)}% · ${pProg.total} answers`:'';byId('pStreakPill').textContent=`🔥 ${pProg.streak}`;}
function pPill(){if(!pCur)return;const r=pProg.by[pCur.id],el=byId('pLearnPill'),on=pLearned(pCur.id);el.textContent=on?'✓ Learned':`${r?.s||0}/${P_LEARN} in a row`;el.className='pill '+(on?'good':pDone&&r&&r.s===0?'bad':'');}
function pSay(p){return `${p.art} ${p.sg}, die ${p.pl}`;}

/* ===== one card ===== */
function pShow(){clearTimeout(pTimer);const empty=!pQueue.length;byId('pQuiz').classList.toggle('hidden',empty);byId('pEmpty').classList.toggle('hidden',!empty);pStats();
if(empty){pCur=null;byId('pEmptyDesc').textContent=pFilter==='mistakes'?'No open mistakes – nice! 🎉':pFilter==='new'?'Every noun is learned! 🎉 Choose “All nouns” to keep them fresh.':'No nouns match this choice.';return;}
pCur=P_BY[pQueue[pIdx]];pDone=false;pHintLv=0;const p=pCur,sing=pMode==='sing';
byId('pTask').textContent=`${P_MODES[pMode]} · card ${pIdx+1} of ${pQueue.length}`;
const w=byId('pWord');w.className='gword';w.innerHTML=sing?`<b class="art-die">die</b> ${esc(p.pl)} <span class="pltag">plural</span>`:artSpan(p.art,p.sg);
byId('pMeaning').textContent=byId('pShowEn').checked?p.en:'';
byId('pBtns').classList.toggle('hidden',pMode!=='pattern');document.querySelectorAll('.pbtn').forEach(b=>{b.disabled=false;b.classList.remove('right','wrong','dim');});
byId('pForm').classList.toggle('hidden',pMode==='pattern');const inp=byId('pIn');inp.value='';inp.disabled=false;inp.placeholder=sing?'der / die / das + singular':'die + plural';
byId('pInLabel').textContent=sing?'The singular, with its article':'The plural';byId('pCheck').classList.remove('hidden');
const fb=byId('pFb');fb.className='gfb';fb.innerHTML='';byId('pNext').disabled=true;byId('pHint').disabled=false;byId('pReveal').disabled=false;
byId('pKbd').textContent=pMode==='pattern'?'Keys 1–8 = pattern · Enter = next':'Enter = check · Enter again = next · ä ö ü can also be typed as ae oe ue';
pPill();LOG.shown('plural');if(pMode!=='pattern'&&activeTab==='plural')setTimeout(()=>{if(!pDone&&pCur===p)inp.focus();},30);}
function pHint(){if(pDone||!pCur)return;const p=pCur;pHintLv++;LOG.hint('plural',p.id);let h;
if(pMode==='sing')h=`💡 This plural uses pattern ${p.n}: <b>${esc(PPAT[p.n].lab)}</b> (${esc(PPAT[p.n].name)}). Undo it to get the singular – and don't forget the article.`;
else if(pHintLv===1)h='💡 '+plRule(p).t+' <span class="note" style="display:inline">(Rules have exceptions.)</span>';
else h=`💡 This noun takes pattern ${p.n}: <b>${esc(PPAT[p.n].lab)}</b> (${esc(PPAT[p.n].name)}).`;
const fb=byId('pFb');fb.className='gfb show';fb.innerHTML=`<div class="tip">${h}</div>`;if(pMode==='sing'||pMode==='pattern'||pHintLv>=2)byId('pHint').disabled=true;}
function pErr(got,exp){if(got===exp-1&&(exp===6||exp===8))return 'forgot the umlaut';if(got===exp+1&&(exp===5||exp===7))return 'umlaut not needed';return 'wrong pattern';}
function lev(a,b){const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];for(let j=1;j<=b.length;j++)d[i][j]=i?Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j;}return d[a.length][b.length];}
/* record the answer, show the solution and the rule */
function pFinish(ok,given,expected,result,errors,details,note){
const p=pCur,r=pRec(p.id),was=pLearned(p.id);pDone=true;pProg.total++;
if(ok){pProg.correct++;pProg.streak++;r.c++;r.s++;}else{pProg.streak=0;r.w++;r.s=0;pQueue.splice(Math.min(pIdx+4,pQueue.length),0,p.id);}
pSave();LOG.plural(p,pMode,given,expected,result,errors,{...details,pattern:PPAT[p.n].lab,singular:p.art+' '+p.sg,plural:'die '+p.pl,meaning:p.en,worksheet:p.sheet});
const w=byId('pWord');w.className='gword pdone';w.innerHTML=`${artSpan(p.art,p.sg)} <span class="parrow">→</span> <b class="art-die">die</b> ${plMark(p)}`;void w.offsetWidth;w.classList.add(ok?'pop':'shake');
document.querySelectorAll('.pbtn').forEach(b=>{const k=Number(b.dataset.pat);b.disabled=true;if(k===p.n)b.classList.add('right');else if(!b.classList.contains('wrong'))b.classList.add('dim');});
byId('pIn').disabled=true;byId('pCheck').classList.add('hidden');byId('pHint').disabled=true;byId('pReveal').disabled=true;
const t=plTip(p),g=pMode==='sing'&&gById[p.id]?tipHTML(gById[p.id]):null;
const res=ok?(pLearned(p.id)&&!was?'🎉 Learned! 3 in a row.':'✓ Right!'):result==='revealed'?'👁 The answer:':'✗ Not quite.';
const fb=byId('pFb');fb.className='gfb show '+(ok?'good':'bad');
fb.innerHTML=`<div class="gres">${res} <span class="plpat">${esc(PPAT[p.n].lab)}</span> <span class="plname">pattern ${p.n} · ${esc(PPAT[p.n].name)}</span></div>${note?`<div class="plyou">${note}</div>`:''}<div class="tip ${t.cls}">${t.html}</div>${g&&!ok?`<div class="tip ${g.cls}" style="margin-top:8px">${g.html}</div>`:''}`;
byId('pNext').disabled=false;byId('pNext').focus();pStats();pPill();
if(byId('pSay').checked)speak(pSay(p));if(ok&&pMode==='pattern'&&byId('pAuto').checked&&!t.cls)pTimer=setTimeout(pNext,1700);renderPWall();}
function pPick(n){if(pDone||!pCur||pMode!=='pattern')return;const p=pCur,ok=n===p.n;
document.querySelectorAll('.pbtn').forEach(b=>{if(Number(b.dataset.pat)===n&&!ok)b.classList.add('wrong');});
let note='';if(!ok){const x=plApply(p.sg,n);note=x?`You chose <b>${esc(PPAT[n].lab)}</b>: that would make <span class="pw">die ${esc(x)}</span>.`:`You chose <b>${esc(PPAT[n].lab)}</b>, but ${esc(p.sg)} has no a, o or u in its last syllable to take an umlaut.`;}
pFinish(ok,PPAT[n].lab,PPAT[p.n].lab,ok?'correct':'wrong',ok?undefined:[pErr(n,p.n)],{chosen:ok?undefined:PPAT[n].lab},note);}
function pCheck(){if(pDone||!pCur)return;const p=pCur,raw=byId('pIn').value.trim().replace(/\s+/g,' ');if(!raw){toast('Type an answer or choose Show answer.');return;}
const m=raw.match(/^(der|die|das) (.+)$/i),art=m?lc(m[1]):'',word=(m?m[2]:raw).replace(/[.!]$/,'').trim(),same=(a,b)=>norm(a,1)===norm(b,1);
const errors=[],det={};let ok,note='';
if(pMode==='write'){const okW=same(word,p.pl),okA=!art||art==='die';ok=okW&&okA;
  if(!okW){const got=plType(p.sg,word)||plType(p.sg,word.replace(/ae/g,'ä').replace(/oe/g,'ö').replace(/ue/g,'ü'));
    if(got&&got.n!==p.n){errors.push(pErr(got.n,p.n));det.chosen=PPAT[got.n].lab;note=errors[0]==='forgot the umlaut'?`The umlaut is missing: <b>${esc(p.pl)}</b>, not <span class="pw">${esc(word)}</span>.`:errors[0]==='umlaut not needed'?`No umlaut here: <b>${esc(p.pl)}</b>, not <span class="pw">${esc(word)}</span>.`:`You used pattern ${got.n} (<b>${esc(PPAT[got.n].lab)}</b>) – this noun takes <b>${esc(PPAT[p.n].lab)}</b>.`;}
    else if(lev(norm(word,1),norm(p.pl,1))<=(p.pl.length<=5?1:2)){errors.push('spelling');note='Almost – check the spelling.';}
    else errors.push('wrong plural');}
  if(!okA){errors.push('wrong article');note+=(note?' ':'')+`In the plural the article is always <b class="art-die">die</b> – never ${esc(art)}.`;}}
else{const okW=same(word,p.sg),okA=p.arts.includes(art);ok=okW&&okA;
  if(!okW){if(same(word,p.pl)){errors.push('wrote the plural again');note=`That is still the plural. The singular is <b>${esc(p.sg)}</b>.`;}
    else if(same(P_UML(lc(word)),P_UML(lc(p.sg)))){errors.push('kept the umlaut');note=`The singular has no umlaut: <b>${esc(p.sg)}</b>.`;}
    else if(lev(norm(word,1),norm(p.sg,1))<=(p.sg.length<=5?1:2)){errors.push('spelling');note='Almost – check the spelling.';}
    else errors.push('wrong singular');}
  if(!art){errors.push('missing article');note+=(note?' ':'')+`Add the article: <b class="art-${p.art}">${p.art}</b> ${esc(p.sg)}. The plural <b>die</b> never tells you the singular article.`;}
  else if(!okA){errors.push('wrong article');note+=(note?' ':'')+`It's <b class="art-${p.art}">${p.art}</b> ${esc(p.sg)}, not ${esc(art)}. The plural <b>die</b> never tells you the singular article.`;}}
pFinish(ok,raw,pMode==='write'?'die '+p.pl:p.art+' '+p.sg,ok?'correct':'wrong',ok?undefined:errors,det,ok&&!m&&pMode==='write'?'Tip: say it with the article – <b class="art-die">die</b> '+esc(p.pl)+'.':note);}
function pReveal(){if(pDone||!pCur)return;const p=pCur;pFinish(false,'',pMode==='write'?'die '+p.pl:pMode==='sing'?p.art+' '+p.sg:PPAT[p.n].lab,'revealed',undefined,{},'');}
function pNext(){if(!pDone)return;clearTimeout(pTimer);pIdx++;if(pIdx>=pQueue.length){toast('Round done – starting a new one.');pOptions();pNewRound();}else pShow();showTop(byId('pWord'));}
function pSetMode(m){if(!P_MODES[m])return;pMode=m;pSaveUI();document.querySelectorAll('[data-pmode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pmode===m)));if(pDone)pNext();else pShow();}
function pSetFilter(v){pFilter=v;pSaveUI();pOptions();pNewRound();}
function pEnter(){pOptions();document.querySelectorAll('[data-pmode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pmode===pMode)));if(!pCur)pNewRound();else if(pMode!=='pattern'&&!pDone)setTimeout(()=>byId('pIn').focus(),50);renderPWall();document.activeElement?.blur?.();}
/* the worksheet table: one column per pattern */
function renderPWall(){if(activeTab!=='plural')return;const root=byId('pWall');root.replaceChildren();const L=pList();let k=0;
for(let n=1;n<=8;n++){const col=document.createElement('div');col.className='pcol';const items=L.filter(p=>p.n===n).sort((a,b)=>a.sg.localeCompare(b.sg,'de'));
col.innerHTML=`<h3><span class="pnum">${n}</span> ${esc(PPAT[n].lab)} <small>${items.length}</small></h3><p class="ptyp">${esc(PPAT[n].typ)}</p>`;
items.forEach(p=>{const b=document.createElement('button');b.type='button';const on=pLearned(p.id);if(on)k++;b.className='chip '+p.art+(on?' on':'');b.innerHTML=`${esc(p.sg)} → ${plMark(p)}`;b.title=`${p.art} ${p.sg} → die ${p.pl}${p.en?' – '+p.en:''}${on?' · learned':''}`;b.addEventListener('click',()=>speak(pSay(p)));col.append(b);});root.append(col);}
byId('pWallCount').textContent=`${k} of ${L.length} learned`;}
byId('pBtns').innerHTML=PPAT.slice(1).map((P,i)=>`<button type="button" class="pbtn" data-pat="${i+1}" title="${esc(P.name)} – e.g. ${esc(P.ex[0])} → die ${esc(P.ex[1])}">${esc(P.lab)}<small>${i+1} · ${esc(P.name)}</small></button>`).join('');
document.querySelectorAll('.pbtn').forEach(b=>b.addEventListener('click',()=>pPick(Number(b.dataset.pat))));
document.querySelectorAll('[data-pmode]').forEach(b=>b.addEventListener('click',()=>pSetMode(b.dataset.pmode)));
byId('pForm').addEventListener('submit',e=>{e.preventDefault();if(pDone)pNext();else pCheck();});
byId('pNext').addEventListener('click',pNext);byId('pHint').addEventListener('click',pHint);byId('pReveal').addEventListener('click',pReveal);
byId('pSpeak').addEventListener('click',()=>{if(pCur)speak(pDone?pSay(pCur):pMode==='sing'?'die '+pCur.pl:pCur.art+' '+pCur.sg);});
byId('pFilter').addEventListener('change',e=>pSetFilter(e.target.value));
['pShowEn','pSay','pAuto'].forEach(k=>byId(k).addEventListener('change',()=>{pSaveUI();if(k==='pShowEn'&&pCur)byId('pMeaning').textContent=byId('pShowEn').checked?pCur.en:'';}));
byId('pReset').addEventListener('click',()=>{if(!confirm('Reset your plural progress? (The other trainers are not touched.)'))return;pProg={total:0,correct:0,streak:0,by:{}};pSave();pOptions();pNewRound();renderPWall();toast('Plural progress reset.');});
document.addEventListener('keydown',e=>{if(activeTab!=='plural'||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest('input,select,textarea'))return;
if(pMode==='pattern'&&!pDone&&/^[1-8]$/.test(e.key)){e.preventDefault();pPick(Number(e.key));}else if(e.key==='Enter'&&pDone){e.preventDefault();pNext();}});
