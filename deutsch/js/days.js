/* 📅 WOCHENTAGE drill.
*/
/* ===== Wochentage drill ===== */
const DAYS=[['Montag','Mo','Monday'],['Dienstag','Di','Tuesday'],['Mittwoch','Mi','Wednesday'],['Donnerstag','Do','Thursday'],['Freitag','Fr','Friday'],['Samstag','Sa','Saturday'],['Sonntag','So','Sunday']];
const DSPELL={Montag:'one n: Mon-tag.',Dienstag:'ie, like in <i>die</i>: Diens-tag.',Mittwoch:'double t and no -tag: Mitt-woch (Mitte + Woche).',Donnerstag:'Donner + s + tag.',Freitag:'frei + tag.',Samstag:'Sams + tag.',Sonntag:'double n: Sonn-tag (Sonne + Tag).',Wochenende:'Woche + n + Ende.'};
const DTYPES={abbr:'Mi → Mittwoch (short forms)',next:'Heute ist … Morgen ist … (next day)',prev:'Der Tag vor … (day before)',en:'Thursday → Donnerstag',am:'on Saturday → am Samstag',listen:'🔊 Listen and write',order:'🧩 Put the week in order'};
const DKIND={abbr:'Short form',next:'Next day',prev:'Day before',en:'English → German',am:'am + day',listen:'Listening',order:'Week order'};
const dKey=storeKey+'-days',D_ROUND=10;
let dProg={total:0,correct:0,streak:0,best:0,by:{}};
try{const p=JSON.parse(localStorage.getItem(dKey)||'null');if(p&&typeof p==='object')dProg={...dProg,...p,by:p.by||{}};}catch(e){}
let dTypes=Object.keys(DTYPES);
try{const u=JSON.parse(localStorage.getItem(dKey+'-ui')||'null');if(u&&Array.isArray(u.types)){const t=u.types.filter(x=>DTYPES[x]);if(t.length)dTypes=t;}}catch(e){}
function dSave(){try{localStorage.setItem(dKey,JSON.stringify(dProg));}catch(e){}}
function dSaveUI(){try{localStorage.setItem(dKey+'-ui',JSON.stringify({types:dTypes}));}catch(e){}}
const dNorm=s=>String(s).normalize('NFC').toLocaleLowerCase('de').replace(/ß/g,'ss').replace(/[.,!?;:…"'„“”()]/g,' ').replace(/\s+/g,' ').trim();
let dQueue=[],dIdx=0,dCur=null,dDone=false,dHintLv=0,dRoundOk=0,dOrderPos=0,dOrderErr=0,dBoxes=false;
function dRec(i){return dProg.by[i]||(dProg.by[i]={c:0,w:0});}
function dPickDay(){const w=DAYS.map((_,i)=>{const r=dProg.by[i]||{c:0,w:0};return 1+2*r.w/(1+r.c*.5);});let x=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<7;i++){x-=w[i];if(x<=0)return i;}return 6;}
function dMake(type,d){const [de,ab,en]=DAYS[d]||DAYS[0],nx=(d+1)%7,pv=(d+6)%7,day=i=>DAYS[i][0];
switch(type){
case 'abbr':return {type,d,task:'Write the full name of the day',q:ab,ql:'de',en:'',ans:de,acc:[de,'der '+de]};
case 'next':return {type,d:nx,from:d,task:'Which day comes next?',q:`Heute ist ${de}. Morgen ist …`,ql:'de',en:`Today is ${en}. Tomorrow is …`,ans:day(nx),acc:[day(nx),'der '+day(nx),'Morgen ist '+day(nx)],say:`Heute ist ${de}. Morgen ist …`,sol:`Heute ist ${de}. Morgen ist ${day(nx)}.`};
case 'prev':return {type,d:pv,from:d,task:'Which day comes before?',q:`Der Tag vor ${de} ist …`,ql:'de',en:`The day before ${en} is …`,ans:day(pv),acc:[day(pv),'der '+day(pv),`Der Tag vor ${de} ist ${day(pv)}`],say:`Der Tag vor ${de} ist …`,sol:`Der Tag vor ${de} ist ${day(pv)}.`};
case 'en':return {type,d,task:'Translate into German',q:en,ql:'en',en:'',ans:de,acc:[de,'der '+de]};
case 'am':if(Math.random()<.15)return {type,d:-1,we:1,task:'Translate into German',q:'at the weekend',ql:'en',en:'',ans:'am Wochenende',acc:['am Wochenende'],bare:'Wochenende'};
return {type,d,task:'Translate into German',q:'on '+en,ql:'en',en:'',ans:'am '+de,acc:['am '+de],bare:de};
case 'listen':return {type,d,task:'Listen and write the day you hear',q:'🔊',ql:'',en:'Tap 🔊 Listen to hear it again',ans:de,acc:[de,'der '+de],say:de};
case 'order':return {type,d:-1,task:'Tap the days in order – the week starts on Montag',q:'Mo → So',ql:'de',en:'',ans:DAYS.map(x=>x[0]).join(' · ')};}}
function dNewRound(){const types=dTypes.length?dTypes:Object.keys(DTYPES),pool=types.filter(t=>t!=='order'),q=[],seen=new Set();
if(types.includes('order'))q.push(dMake('order'));
if(!pool.length)while(q.length<3)q.push(dMake('order'));
for(let k=0;q.length<D_ROUND&&pool.length&&k<200;k++){const it=dMake(pool[Math.floor(Math.random()*pool.length)],dPickDay());const key=it.type+'|'+it.q;if(seen.has(key))continue;seen.add(key);q.push(it);}
dQueue=shuffle(q);if(dQueue.length>1&&dQueue[0].type==='order')dQueue.push(dQueue.shift());dIdx=0;dRoundOk=0;dShow();}
function dShow(){dCur=dQueue[dIdx];dDone=false;dHintLv=0;const it=dCur,isOrder=it.type==='order';
byId('dKind').textContent=DKIND[it.type];byId('dTask').textContent=it.task;const q=byId('dQ');q.textContent=it.q;if(it.ql)q.lang=it.ql;else q.removeAttribute('lang');q.className='tq'+(it.type==='abbr'||it.type==='listen'?' dbig':'');byId('dEn').textContent=it.en;
const inp=byId('dIn');inp.value='';inp.disabled=false;byId('dForm').classList.toggle('hidden',isOrder);byId('dCheckBtn').classList.remove('hidden');
byId('dFb').className='answer-feedback';byId('dFb').replaceChildren();byId('dWeekBox').replaceChildren();
byId('dNextBtn').classList.add('hidden');const hb=byId('dHintBtn');hb.disabled=isOrder;hb.textContent='💡 Hint';byId('dRevealBtn').disabled=false;byId('dSayBtn').disabled=false;byId('dSayBtn').classList.toggle('hidden',!it.say);
const tiles=byId('dTiles');tiles.replaceChildren();tiles.classList.toggle('hidden',!isOrder);
if(isOrder){dOrderPos=0;dOrderErr=0;const names=DAYS.map(x=>x[0]);let s=shuffle(names.slice());for(let k=0;k<6&&s.join()===names.join();k++)s=shuffle(names.slice());
s.forEach(n=>{const b=document.createElement('button');b.type='button';b.className='dtile';b.lang='de';b.textContent=n;b.addEventListener('click',()=>dTapTile(b,n));tiles.append(b);});}
else if(activeTab==='days')setTimeout(()=>inp.focus(),50);
if(it.type==='listen'&&activeTab==='days')setTimeout(()=>speak(it.say),250);LOG.shown('days');
dUpdateTop();}
function dTapTile(b,n){if(dDone)return;const fb=byId('dFb');if(n===DAYS[dOrderPos][0]){dOrderPos++;b.disabled=true;b.classList.remove('no');b.classList.add('done');b.textContent=`${dOrderPos}. ${n}`;fb.className='answer-feedback';fb.replaceChildren();if(dOrderPos===7)dFinish(dOrderErr===0,'',dOrderErr?`${dOrderErr} wrong tap${dOrderErr>1?'s':''} – this one comes back later in the round.`:'');}
else{dOrderErr++;b.classList.remove('no');void b.offsetWidth;b.classList.add('no');fb.className='answer-feedback neutral';fb.innerHTML=dOrderPos?`Not <b lang="de">${esc(n)}</b> – which day comes after <b lang="de">${esc(DAYS[dOrderPos-1][0])}</b>?`:`Not <b lang="de">${esc(n)}</b> – the German week starts on Monday.`;}}
function dDiagnose(val,it){const v=dNorm(val),words=v.split(' '),u=v.replace(/^(der|am|morgen ist) /,'');
if(it.type==='am'){if(v===dNorm(it.bare)||v==='der '+dNorm(it.bare))return `Nearly! “${esc(it.q)}” needs <b>am</b>: <b lang="de">${esc(it.ans)}</b>.`;if(words[0]!=='am'&&words.slice(1).join(' ')===dNorm(it.bare))return `With days (and das Wochenende) use <b>am</b> (= an dem), not <i lang="de">${esc(words[0])}</i>.`;}
const eng=DAYS.findIndex(x=>dNorm(x[2])===u||dNorm(x[2])===v.replace(/^on /,''));if(eng>=0)return `That's English – in German: <b lang="de">${esc(DAYS[eng][0])}</b>.`;
const other=DAYS.findIndex(x=>dNorm(x[0])===u);
if(other>=0&&other!==it.d){const f=it.from;
if(it.type==='next'&&other===f)return `That's today. <b>morgen</b> = tomorrow – the day <b>after</b> ${esc(DAYS[f][0])}.`;
if(it.type==='next'&&other===(f+6)%7)return `That's the day <b>before</b>. <b>morgen</b> = tomorrow – the day <b>after</b> ${esc(DAYS[f][0])}.`;
if(it.type==='prev'&&other===(f+1)%7)return `That's the day <b>after</b>. <b>vor</b> = before.`;
if(it.type==='prev'&&other===f)return `That's the same day. <b>vor</b> = before.`;
if(it.type==='abbr'&&DAYS[other][1].charAt(0)===it.q.charAt(0))return `Careful: <b>${esc(DAYS[other][1])}</b> = ${esc(DAYS[other][0])}, but <b>${esc(it.q)}</b> = ${esc(it.ans)}.`;
return `<span lang="de">${esc(DAYS[other][0])}</span> = ${DAYS[other][2]}.`;}
const tgt=it.bare||(it.d>=0?DAYS[it.d][0]:'');if(tgt&&tLev(u,dNorm(tgt))<=3)return `Spelling: <b lang="de">${esc(tgt)}</b> – ${DSPELL[tgt]||''}`;
return '';}
function dCheck(){if(dDone||!dCur||dCur.type==='order')return;const val=byId('dIn').value;if(!val.trim()){toast('Write your answer first.');return;}const it=dCur,ok=it.acc.some(a=>dNorm(a)===dNorm(val));dFinish(ok,val,ok?'':dDiagnose(val,it));}
function dDrawWeek(from,ans){const w=byId('dWeekBox');w.replaceChildren();DAYS.forEach(([de,ab],i)=>{const c=document.createElement('div');c.className='dcell'+(i>=5?' we':'')+(i===from?' from':'')+(ans.includes(i)?' ans':'');c.textContent=ab;c.title=de;w.append(c);});const l=document.createElement('div');l.className='dwelab';l.textContent='Wochenende';w.append(l);}
function dFinish(ok,val,note){if(dDone)return;dDone=true;const it=dCur,helped=dHintLv>0;
dProg.total++;if(ok){dProg.correct++;dRoundOk++;if(!helped){dProg.streak++;dProg.best=Math.max(dProg.best||0,dProg.streak);}}else{dProg.streak=0;dQueue.push({...it});}
if(it.d>=0){const r=dRec(it.d);if(ok)r.c++;else r.w++;}dSave();LOG.days(it,ok,val,note,helped);
const fb=byId('dFb');fb.className='answer-feedback '+(ok?'good':'bad');
let h=ok?`<strong>${helped?'✓ Correct – with a hint. Next time try it without!':'✓ Richtig!'}</strong>`:`<strong>${val?'Not quite. The answer is:':'The answer is:'}</strong>`;
h+=`<div class="solution" lang="de">${esc(it.sol||it.ans)}</div>`;if(note)h+=`<div style="margin-top:6px">${note}</div>`;
if(it.d>=0&&it.type!=='am'&&it.type!=='next'&&it.type!=='prev')h+=`<div class="tnote">${esc(DAYS[it.d][0])} = ${DAYS[it.d][2]} · short: ${DAYS[it.d][1]}</div>`;
fb.innerHTML=h;if(it.type==='order'){const T=byId('dTiles');T.append(...[...T.children].sort((x,y)=>parseInt(x.textContent)-parseInt(y.textContent)));}
dDrawWeek(it.from??-1,it.type==='order'||it.we?(it.we?[5,6]:[0,1,2,3,4,5,6]):[it.d]);
byId('dIn').disabled=true;byId('dCheckBtn').classList.add('hidden');byId('dHintBtn').disabled=true;byId('dRevealBtn').disabled=true;byId('dSayBtn').classList.remove('hidden');
const nb=byId('dNextBtn');nb.classList.remove('hidden');nb.textContent=dIdx>=dQueue.length-1?'New round ↻':'Next →';nb.focus();dUpdateTop();}
function dHint(){if(dDone||!dCur||dCur.type==='order')return;LOG.hint('days',dCur.type+'|'+dCur.q);const it=dCur,a=it.ans,fb=byId('dFb');fb.className='answer-feedback neutral';
if(dHintLv===0){dHintLv=1;if(it.type==='next'||it.type==='prev'){dDrawWeek(it.from,[]);fb.innerHTML=`Find <b>${esc(DAYS[it.from][1])}</b> in the week and go one step ${it.type==='next'?'right →':'← left'}.`;}else fb.innerHTML=`It starts with <b lang="de">${esc(a.slice(0,it.type==='am'?4:2))}…</b> (${a.replace(/ /g,'').length} letters).`;byId('dHintBtn').textContent='💡 More help';}
else{dHintLv=2;fb.innerHTML=`<b lang="de">${esc(a.slice(0,Math.ceil(a.length*.6)))}…</b>`;byId('dHintBtn').disabled=true;}
byId('dIn').focus();}
function dReveal(){if(dDone||!dCur)return;if(dCur.type==='order'){byId('dTiles').querySelectorAll('.dtile').forEach(b=>{const i=DAYS.findIndex(x=>b.textContent.endsWith(x[0]));b.disabled=true;b.classList.add('done');b.textContent=`${i+1}. ${DAYS[i][0]}`;});dFinish(false,'','The German week starts on Monday: Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag.');}else dFinish(false,'','');}
function dNextQ(){if(!dDone)return;dIdx++;if(dIdx>=dQueue.length){toast(`Round done – ${dRoundOk} correct. New round!`);dNewRound();}else dShow();}
function dSayFn(){if(!dCur)return;if(dDone)speak(dCur.type==='order'?DAYS.map(x=>x[0]).join(', '):(dCur.sol||dCur.ans));else if(dCur.say)speak(dCur.say);}
function dUpdateTop(){const n=dQueue.length;byId('dCount').textContent=n?`${Math.min(dIdx+1,n)} / ${n}`:'';byId('dFill').style.width=n?(100*(dIdx+(dDone?1:0))/n)+'%':'0%';byId('dScore').textContent=`🔥 ${dProg.streak}`;dStatsRender();}
function dStatsRender(){const p=dProg;byId('dStats').textContent=p.total?`${p.total} answers · ${Math.round(100*p.correct/p.total)}% correct · best streak ${p.best||0}`:'No answers yet – your results per day show up here.';
const g=byId('dDays');g.replaceChildren();DAYS.forEach(([de],i)=>{const r=p.by[i]||{c:0,w:0},n=r.c+r.w,row=document.createElement('div');row.className='drow'+(n?(r.w*2>r.c?' weak':(r.c>=3?' strong':'')):'');row.innerHTML=`<span lang="de">${de}</span><span>${n?`✓ ${r.c} · ✗ ${r.w}`:'—'}</span>`;g.append(row);});}
function dTypeBoxes(){const box=byId('dTypeBox');box.replaceChildren();Object.entries(DTYPES).forEach(([k,l])=>{const lab=document.createElement('label');lab.className='checkrow';const cb=document.createElement('input');cb.type='checkbox';cb.checked=dTypes.includes(k);lab.append(cb,' '+l);cb.addEventListener('change',()=>{if(cb.checked){if(!dTypes.includes(k))dTypes.push(k);}else{if(dTypes.length===1){cb.checked=true;toast('Keep at least one question type.');return;}dTypes=dTypes.filter(x=>x!==k);}dSaveUI();dNewRound();});box.append(lab);});}
function dEnter(){if(!dBoxes){dTypeBoxes();dBoxes=true;}if(!dCur)dNewRound();else if(!dDone&&dCur.type!=='order')setTimeout(()=>byId('dIn').focus(),50);}
byId('dForm').addEventListener('submit',e=>{e.preventDefault();if(dDone)dNextQ();else dCheck();});
byId('dNextBtn').addEventListener('click',dNextQ);byId('dHintBtn').addEventListener('click',dHint);byId('dRevealBtn').addEventListener('click',dReveal);byId('dSayBtn').addEventListener('click',dSayFn);
byId('dNew').addEventListener('click',()=>{dNewRound();toast('New round.');});
byId('dResetBtn').addEventListener('click',()=>{if(!confirm('Reset your weekday progress? (Nothing else is touched.)'))return;dProg={total:0,correct:0,streak:0,best:0,by:{}};dSave();dNewRound();toast('Weekday progress reset.');});
try{byId('dLesson').open=localStorage.getItem(dKey+'-lesson')!=='closed';}catch(e){}
byId('dLesson').addEventListener('toggle',()=>{try{localStorage.setItem(dKey+'-lesson',byId('dLesson').open?'open':'closed');}catch(e){}});
