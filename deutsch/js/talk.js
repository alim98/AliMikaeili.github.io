/* 💬 ASK & ANSWER: build, check and explain question/answer sentences.
   The questions and activities are in data/talk.js.
*/
/* ===== Ask & answer (conversation trainer) ===== */
const TPERS={ich:{s:'ich',i:0,en:'I',dz:'do',poss:'my'},du:{s:'du',i:1,en:'you',dz:'do',poss:'your'},er:{s:'er',i:2,en:'he',dz:'does',poss:'his',v3:1},sie:{s:'sie',i:2,en:'she',dz:'does',poss:'her',v3:1},wir:{s:'wir',i:3,en:'we',dz:'do',poss:'our'},ihr:{s:'ihr',i:4,en:'you all',dz:'do',poss:'your'},siepl:{s:'sie',i:5,en:'they',dz:'do',poss:'their'},Sie:{s:'Sie',i:5,en:'you',dz:'do',poss:'your',fm:1}};
const TPLAB={ich:'ich',du:'du',er:'er',sie:'sie (she)',wir:'wir',ihr:'ihr',siepl:'sie (they)',Sie:'Sie (formal)'};
const TWHO={du:'ask a friend (du)',Sie:'ask politely (Sie)',ihr:'ask two friends (ihr)',er:'ask about him (er)',sie:'ask about her (sie)'};
const TWEN={Was:'What',Wo:'Where',Woher:'Where',Wie:'How'};
const TWW=new Set(['wer','was','wo','woher','wie','welche','welcher','welches','warum','wann']);
const TWMEAN={wann:'when',wer:'who (a person)',was:'what (a thing or activity)',wo:'where',woher:'where from',wie:'how',welche:'which',warum:'why'};
const TSUBJ=new Set(['ich','du','er','sie','es','wir','ihr']);
const TFUNC=new Set(['ein','eine','einen','kein','keine','keinen','der','die','das','den','dem','ich','du','er','sie','es','wir','ihr','mir','dir','und','oder','aber','in','im','aus','an','als','mit','was','wer','wo','wie','woher','ja','nein','nicht']);
/* sentence machinery */
const TWRE=/[\p{L}\p{M}\d]+(?:['-][\p{L}\p{M}\d]+)*/gu;
function tPrep(s){return String(s).normalize('NFC').replace(/[’‘´`]/g,"'");}
function tToks(s){return tPrep(s).match(TWRE)||[];}
function tMark(s,fn){const p=tPrep(s);let out='',last=0,k=0;for(const m of p.matchAll(TWRE)){out+=esc(p.slice(last,m.index))+fn(m[0],k++);last=m.index+m[0].length;}return out+esc(p.slice(last));}
const tk1=w=>w.toLocaleLowerCase('de').replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue');
const tk2=w=>tk1(w).replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u');
function tFront(A){return /Freizeit/.test(A.x||'')?'Oft':'In der Freizeit';}
function tInf(A){return [A.x,A.o,(A.sep||'')+A.v].filter(Boolean).join(' ');}
function tSent(A,p,ty,wAlt){const P=TPERS[p],V=vConj(A.v)[P.i],J=(a,e)=>{const s=a.filter(Boolean).join(' ');return s.charAt(0).toUpperCase()+s.slice(1)+e;};
switch(ty){case 'st':return J([P.s,V,A.x,A.o,A.sep],'.');case 'yn':return J([V,P.s,A.x,A.o,A.sep],'?');case 'w':return J([wAlt||A.w,V,P.s,A.x,A.sep],'?');case 'inv':return J([tFront(A),V,P.s,A.x,A.o,A.sep],'.');case 'ja':return J(['Ja,',P.s,V,A.x,A.o,A.sep],'.');case 'nein':return J(['Nein,',P.s,V,A.x,A.no,A.sep],'.');}}
function tEn(A,p,ty){const P=TPERS[p],vb=P.v3?A.en[1]:A.en[0],x=A.xen?A.xen.replace('{p}',P.poss):'',j=(...a)=>a.filter(Boolean).join(' '),fm=P.fm?' (formal)':'',cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
switch(ty){case 'st':return cap(j(P.en,vb,A.eo,x))+'.'+fm;case 'ja':return 'Yes, '+j(P.en,vb,A.eo,x)+'.';case 'nein':return 'No, '+j(P.en,vb,A.noEn,x)+'.';case 'yn':return cap(j(P.dz,P.en,A.en[0],A.eo,x))+'?'+fm;case 'w':return j(A.wen||TWEN[A.w],P.dz,P.en,A.en[0]+(A.wTail||''),x)+'?'+fm;case 'inv':return (/Freizeit/.test(A.x||'')?'Often, ':'In '+P.poss+' free time, ')+j(P.en,vb,A.eo,x)+'.'+fm;}}
function tActItems(A){const out=[],b={t:A.t,les:A.les||'',g:'a:'+A.id,act:A};
[['du','ich'],['ihr','wir'],['Sie','ich'],['er','er'],['sie','sie']].forEach(([qp,ap])=>{const q=tSent(A,qp,'yn');
out.push({...b,mode:'answer',prompt:q,pEn:tEn(A,qp,'yn'),cue:'✔ Ja',acc:[tSent(A,ap,'ja')],sEn:tEn(A,ap,'ja')});
if(A.no)out.push({...b,mode:'answer',prompt:q,pEn:tEn(A,qp,'yn'),cue:'✘ Nein → '+A.no,acc:[tSent(A,ap,'nein')],sEn:tEn(A,ap,'nein')});
if(A.w)out.push({...b,mode:'answer',prompt:tSent(A,qp,'w'),pEn:tEn(A,qp,'w'),cue:A.o,acc:[tSent(A,ap,'st')],sEn:tEn(A,ap,'st')});});
[['ich','du'],['ich','Sie'],['wir','ihr'],['er','er'],['sie','sie']].forEach(([ap,qp])=>{
out.push({...b,mode:'ask',prompt:tSent(A,ap,'ja'),pEn:tEn(A,ap,'ja'),who:qp,acc:[tSent(A,qp,'yn')],sEn:tEn(A,qp,'yn')});
if(A.w){const acc=[tSent(A,qp,'w')];(A.wAlt||[]).forEach(w=>acc.push(tSent(A,qp,'w',w)));if(A.x)acc.push(tSent({...A,x:''},qp,'w'));out.push({...b,mode:'ask',prompt:tSent(A,ap,'st'),hl:A.o,pEn:tEn(A,ap,'st'),who:qp,acc,sEn:tEn(A,qp,'w')});}});
Object.keys(TPERS).forEach(p=>['st','yn','w','inv'].forEach(ty=>{if(ty==='w'&&!A.w)return;out.push({...b,mode:'build',parts:{p,ty},prompt:[tInf(A),p,ty].join('|'),acc:[tSent(A,p,ty)],sEn:tEn(A,p,ty)});}));
return out;}
function tPairItems(P,g){const b={t:P.t,les:P.les||'',g,pron:!!P.pron},out=[];
out.push({...b,mode:'answer',prompt:P.q[0],pEn:P.qen,cue:P.cue,acc:P.a,sEn:P.aen});
if(!P.noAsk){const qt=tToks(P.q[0]);const who=qt.slice(1).includes('Sie')?'Sie':qt.includes('du')?'du':qt.includes('ihr')?'ihr':'';out.push({...b,mode:'ask',prompt:P.ap||P.a[0],hl:P.hl,pEn:P.aen,who,acc:P.q,sEn:P.qen});}
out.push({...b,mode:'build',en:1,prompt:P.qen,acc:P.q,sEn:P.qen});
out.push({...b,mode:'build',en:1,prompt:P.aen,acc:P.a,sEn:P.aen});
return out;}
const T_ITEMS=(()=>{const out=[],seen=new Set(),push=it=>{it.key=it.mode+'|'+it.prompt+'|'+it.acc[0];if(seen.has(it.key))return;seen.add(it.key);out.push(it);};
TPAIRS.forEach((P,i)=>tPairItems(P,'p'+i).forEach(push));tEinPairs().forEach((P,i)=>tPairItems(P,'e'+i).forEach(push));TACTS.forEach(A=>tActItems(A).forEach(push));return out;})();
const T_FORM={};[...new Set([...vList.map(v=>v.inf),...TACTS.map(a=>a.v)])].forEach(inf=>vConj(inf).forEach(f=>{const k=tk1(f);if(!(k in T_FORM))T_FORM[k]=inf;}));
const tIsVerb=w=>!!T_FORM[tk1(w)]&&!TSUBJ.has(tk1(w));
function tVerbHTML(s,sep){const n=tToks(s).length;return tMark(s,(w,k)=>tIsVerb(w)||(sep&&k===n-1&&tk1(w)===tk1(sep))?`<span class="vbx">${esc(w)}</span>`:esc(w));}
function tType(s){const T=tToks(s).map(tk1);if(!T.length)return 'st';if(T[0]==='ja'||T[0]==='nein')return 'jn';if(/\?\s*$/.test(String(s).trim()))return TWW.has(T[0])?'w':'yn';const vi=T.findIndex(w=>T_FORM[w]&&!TSUBJ.has(w));if(vi>0&&TSUBJ.has(T[vi+1])&&!TSUBJ.has(T[0]))return 'inv';return 'st';}
const TPAT={st:['subject','verb','…'],inv:['start','verb','subject','…'],w:['W-word','verb','subject','…?'],yn:['verb','subject','…?'],jn:['Ja, / Nein,','subject','verb','…']};
const TPATNAME={st:'Statement',inv:'Statement that starts with something else',w:'W-question',yn:'Yes/no question',jn:'Answer with Ja / Nein'};
const TPATWHY={st:'the verb is always in position 2.',inv:'the verb stays in position 2, so the subject moves behind it.',w:'W-word first, then the verb, then the subject.',yn:'the verb comes first.',jn:'“Ja,” / “Nein,” don’t count – then subject + verb, as in a statement.'};
function tPatHTML(ty){return `<b>${TPATNAME[ty]}:</b> `+TPAT[ty].map(s=>`<span class="slot${s==='verb'?' v':''}">${esc(s)}</span>`).join(' ')+` <span style="color:var(--muted)">– ${esc(TPATWHY[ty])}</span>`;}
function tLCS(a,b){const n=a.length,m=b.length,d=Array.from({length:n+1},()=>new Array(m+1).fill(0));for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)d[i][j]=a[i]===b[j]?d[i+1][j+1]+1:Math.max(d[i+1][j],d[i][j+1]);const ia=new Set(),ib=new Set();let i=0,j=0;while(i<n&&j<m){if(a[i]===b[j]){ia.add(i);ib.add(j);i++;j++;}else if(d[i+1][j]>=d[i][j+1])i++;else j++;}return [ia,ib];}
function tLev(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length];}
function tMatch(val,acc){const u=tToks(val),k1=u.map(tk1).join(' '),k2=u.map(tk2).join(' ');if(!u.length)return {ok:false};let i=acc.findIndex(a=>tToks(a).map(tk1).join(' ')===k1);if(i>=0)return {ok:true,i};i=acc.findIndex(a=>tToks(a).map(tk2).join(' ')===k2);if(i>=0)return {ok:true,i,um:true};return {ok:false};}
function tClosest(val,acc){const u=tToks(val).map(tk2);let best=acc[0],bs=-1e9;acc.forEach(a=>{const t=tToks(a).map(tk2);const s=2*tLCS(u,t)[0].size-t.length;if(s>bs){bs=s;best=a;}});return best;}
function tStops(s){const p=tPrep(s),r=[];let last=0;for(const m of p.matchAll(TWRE)){r.push(r.length===0||/[.?!:]\s*$/.test(p.slice(last,m.index)));last=m.index+m[0].length;}return r;}
function tCapsNotes(val,sol){const U=tToks(val),T=tToks(sol),out=[];if(U.length!==T.length)return out;const up=w=>w.charAt(0)!==w.charAt(0).toLocaleLowerCase('de'),st=tStops(sol);
for(let i=0;i<T.length;i++){const a=T[i],u=U[i];if(up(a)===up(u))continue;
if(up(a)){if(st[i])out.push(`Start a sentence with a capital letter: <b>${esc(a)}</b>.`);else if(a==='Sie')out.push('<b>Sie</b> (formal “you”) is always written with a capital S.');else if(a==='Ihnen')out.push('<b>Ihnen</b> (formal) is always written with a capital I.');else out.push(`<b>${esc(a)}</b> is a noun (or a name), so it starts with a capital letter.`);}
else if(!st[i]){if(a==='sie')out.push('Write a small <b>sie</b> here (= she / they). A capital <i>Sie</i> in the middle of a sentence means the formal “you”.');else if(TSUBJ.has(a))out.push(`Pronouns are written small in the middle of a sentence: <b>${esc(a)}</b>.`);else out.push(`<b>${esc(a)}</b> is not a noun, so it is written small.`);}}
return [...new Set(out)].slice(0,3);}
function tUmlautNotes(val,sol){const U=tToks(val),T=tToks(sol);if(U.length!==T.length)return [];const w=T.filter((a,i)=>tk1(a)!==tk1(U[i]));return w.length?[`Watch the umlaut / ß: <b>${w.map(esc).join(', ')}</b>.`]:[];}
function tDiffHTML(val,target){const U=tToks(val),T=tToks(target);const [iu,it]=tLCS(U.map(tk2),T.map(tk2));
return `<div class="tdiff"><span class="lab">You wrote</span> <span lang="de">${tMark(val,(w,k)=>iu.has(k)?esc(w):`<span class="dbad">${esc(w)}</span>`)}</span></div><div class="tdiff"><span class="lab">Correct</span> <span lang="de">${tMark(target,(w,k)=>it.has(k)?esc(w):`<span class="dx">${esc(w)}</span>`)}</span></div>`;}
function tDiagnose(val,target,it){const U=tToks(val),T=tToks(target),u=U.map(tk2),t=T.map(tk2),tips=[],has=(a,w)=>a.includes(w),bag=a=>a.slice().sort().join(' ');
if(bag(u)===bag(t))return ['You have all the right words – only the <b>order</b> is off. Check the pattern below.'];
if(it.mode==='answer'){if(has(t,'ich')&&!has(t,'du')&&has(u,'du'))tips.push('Answer about <b>yourself</b>: the question says <i>du</i>, so your answer uses <b>ich</b>.');if(has(t,'wir')&&has(u,'ihr'))tips.push('The question asks <i>ihr</i> (you all), so you answer with <b>wir</b> (we).');if(has(t,'ich')&&U.slice(1).includes('Sie'))tips.push('The question uses the formal <i>Sie</i>, but you answer about yourself with <b>ich</b>.');}
if(it.mode==='ask'){if(has(t,'du')&&has(u,'ich'))tips.push('You are asking the other person, so use <b>du</b>, not <i>ich</i>.');if(T.slice(1).includes('Sie')&&has(u,'ich'))tips.push('Ask politely with <b>Sie</b>, not <i>ich</i>.');if(has(t,'ihr')&&has(u,'wir'))tips.push('You are asking two friends, so use <b>ihr</b>, not <i>wir</i>.');}
T.forEach((w,i)=>{if(!tIsVerb(w)||u.includes(t[i]))return;const inf=T_FORM[tk1(w)];const wrong=U.find(x=>tk1(x)!==tk1(w)&&T_FORM[tk1(x)]===inf&&!t.includes(tk2(x)));if(wrong){const si=[i-1,i+1].find(k=>T[k]&&(TSUBJ.has(T[k].toLowerCase())||T[k]==='Sie'));const s=si===undefined?'':si===0&&!(it.parts&&it.parts.p==='Sie')?T[si].toLowerCase():T[si];tips.push(`Verb ending: ${s?`with <b>${esc(s)}</b> `:''}it is <b>${esc(w)}</b>, not <i>${esc(wrong)}</i>.`);}});
const A=it.act;if(A&&A.sep){const sp=tk1(A.sep);if(u.some(x=>x.startsWith(sp)&&x.length>sp.length+2))tips.push(`<b>${esc(A.sep)}|${esc(A.v)}</b> splits: <b>${esc(vConj(A.v)[0].slice(0,-1))}…</b> takes the normal verb place, and <b>${esc(A.sep)}</b> goes to the very end.`);}
[['eine','ein'],['keine','kein']].forEach(([f,m])=>{if(has(t,f)&&!has(u,f)&&has(u,m))tips.push(`<b>${f}</b>, not <i>${m}</i>: die-words take ${f}${f==='keine'?' (so does the plural)':''}.`);if(has(t,m)&&!has(u,m)&&has(u,f))tips.push(`<b>${m}</b>, not <i>${f}</i>: der- and das-words take ${m}.`);});
if((has(t,'kein')||has(t,'keine'))&&!has(u,'kein')&&!has(u,'keine')&&has(u,'nicht'))tips.push('Before a noun, “not a” is <b>kein / keine</b>, not <i>nicht ein</i>.');
const P3=['er','es','sie'],tp=P3.find(p=>has(t,p)&&!has(u,p)),upr=P3.find(p=>has(u,p)&&!has(t,p));if(tp&&upr)tips.push(`Pronoun: <b>${tp}</b>, not <i>${upr}</i>. der → er · das → es · die → sie · plural → sie.`);
if(TWW.has(t[0])&&TWW.has(u[0])&&t[0]!==u[0])tips.push(`<b>${esc(T[0])}</b> = ${TWMEAN[t[0]]||''}. You wrote <i>${esc(U[0])}</i> = ${TWMEAN[u[0]]||''}.`);
const missT=T.filter((w,i)=>!u.includes(t[i])),extraU=U.filter((w,i)=>!t.includes(u[i]));
extraU.forEach(x=>{if(tIsVerb(x))return;const y=missT.find(y=>Math.min(x.length,y.length)>=3&&tLev(tk2(x),tk2(y))<=2&&!tIsVerb(y)&&!(TFUNC.has(tk1(x))&&TFUNC.has(tk1(y))));if(y)tips.push(`Spelling: <b>${esc(y)}</b> (you wrote <i>${esc(x)}</i>).`);});
const tv=T.findIndex(tIsVerb);if(tv>=0&&!tips.length){const uv=u.indexOf(t[tv]);if(uv>=0&&uv!==tv)tips.push(`Word order: the verb <b>${esc(T[tv])}</b> is in the wrong place – see the pattern below.`);}
if(!tips.length){if(missT.length)tips.push(`Missing: <b>${missT.slice(0,4).map(esc).join(', ')}</b>`);if(extraU.length)tips.push(`Not needed (or misspelled): <i>${extraU.slice(0,4).map(esc).join(', ')}</i>`);}
return [...new Set(tips)].slice(0,4);}
/* state + UI */
const tKey=storeKey+'-talk',T_ROUND=10,T_NEWEST=LESSONS[LESSONS.length-1].label;
let tProg={total:0,correct:0,streak:0,by:{}};
try{const p=JSON.parse(localStorage.getItem(tKey)||'null');if(p&&typeof p==='object')tProg={...tProg,...p,by:p.by||{}};}catch(e){}
function tSave(){try{localStorage.setItem(tKey,JSON.stringify(tProg));}catch(e){}}
let tMode='answer',tTopic='all',tQueue=[],tIdx=0,tCur=null,tDone=false,tHintLv=0,tSpoken=false,tSayText='',tRound={ok:0};
try{const s=JSON.parse(localStorage.getItem(tKey+'-ui')||'{}');if(['answer','ask','build'].includes(s.mode))tMode=s.mode;if(typeof s.topic==='string')tTopic=s.topic;if(s.en===false)byId('tShowEn').checked=false;if(s.auto===true)byId('tAuto').checked=true;if(s.autoAns===true)byId('tAutoAns').checked=true;}catch(e){}
function tSaveUI(){try{localStorage.setItem(tKey+'-ui',JSON.stringify({mode:tMode,topic:tTopic,en:byId('tShowEn').checked,auto:byId('tAuto').checked,autoAns:byId('tAutoAns').checked}));}catch(e){}}
function tPool(){const L=T_ITEMS.filter(it=>it.mode===tMode);if(tTopic==='mistakes')return L.filter(it=>tProg.by[it.key]?.last==='bad');if(tTopic==='new')return L.filter(it=>it.les===T_NEWEST);if(tTopic==='all')return L;return L.filter(it=>it.t===tTopic);}
function tOptions(){const sel=byId('tTopic');const nm=T_ITEMS.filter(it=>it.mode===tMode&&tProg.by[it.key]?.last==='bad').length;const o=[['all','Everything (mixed)'],['new',`🆕 Newest lesson (${T_NEWEST})`],['me','About me – name, country, languages…'],['free','Free time & uni'],['ein','Wer / Was ist das? – ein / kein · er / es / sie'],['people','Other people – ihr, er, sie (Olivia, Noah, Dana …)'],['neg','Saying no – nicht / kein · am liebsten'],['mistakes',`My mistakes (${nm})`]];sel.replaceChildren(...o.map(([v,t])=>{const e=document.createElement('option');e.value=v;e.textContent=t;return e;}));if(!o.some(x=>x[0]===tTopic))tTopic='all';sel.value=tTopic;}
function tNewRound(){const P=tPool();let q=[];
if(tTopic==='mistakes')q=shuffle(P.slice()).slice(0,T_ROUND);
else{const used=new Set();shuffle(P.filter(it=>tProg.by[it.key]?.last==='bad')).forEach(it=>{if(q.length<3&&!used.has(it.g)){q.push(it);used.add(it.g);}});
const fam={};P.forEach(it=>{const f=fam[it.t]||(fam[it.t]={});(f[it.g]||(f[it.g]=[])).push(it);});let fs=Object.keys(fam);
while(q.length<T_ROUND&&fs.length){const f=fs[Math.floor(Math.random()*fs.length)];const gs=Object.keys(fam[f]).filter(g=>!used.has(g));if(!gs.length){fs=fs.filter(x=>x!==f);continue;}const g=gs[Math.floor(Math.random()*gs.length)];used.add(g);const its=fam[f][g],fresh=its.filter(it=>!tProg.by[it.key]),from=fresh.length?fresh:its;q.push(from[Math.floor(Math.random()*from.length)]);}
q=shuffle(q);}
tQueue=q;tIdx=0;tRound={ok:0};tShow();}
function tStats(){const acc=tProg.total?Math.round(100*tProg.correct/tProg.total)+'%':'—';const mist=Object.values(tProg.by).filter(r=>r.last==='bad').length;byId('tStats').innerHTML=`Answered <b>${tProg.total}</b> · accuracy <b>${acc}</b> · streak <b>${tProg.streak}</b><br>Open mistakes (all exercises): <b>${mist}</b>`;}
function tSetEn(){const it=tCur;byId('tEn').textContent=it&&byId('tShowEn').checked&&!it.en?(it.parts?it.sEn:it.pEn)||'':'';}
function tShow(){const empty=!tQueue.length;byId('tCard').classList.toggle('hidden',empty);byId('tEmpty').classList.toggle('hidden',!empty);tStats();
if(empty){tCur=null;byId('tCount').textContent='';byId('tFill').style.width='0%';byId('tEmptyDesc').textContent=tTopic==='mistakes'?'No open mistakes here – nice! 🎉 Wrong answers from your rounds will show up in this list.':'There are no sentences for this choice yet.';return;}
const it=tCur=tQueue[tIdx];tDone=false;tHintLv=0;tSpoken=false;
byId('tTask').textContent=it.mode==='answer'?'Answer the question':it.mode==='ask'?'Write the question for this answer':it.parts?'Make a sentence from these parts':'Say it in German';
const q=byId('tQ');q.className='tq'+(it.en?' isen':'');q.lang=it.en?'en':'de';
if(it.parts){const A=it.act,pp=it.parts,ch=[];if(pp.ty==='w')ch.push(['W-word',A.w,'w']);if(pp.ty==='inv')ch.push(['start with',tFront(A),'w']);ch.push(['person',TPLAB[pp.p],'subj']);ch.push(['activity',tInf(A),'']);q.innerHTML=`<div class="tparts">${ch.map(([l,v,c])=>`<span class="tpart ${c}"><small>${esc(l)}</small>${esc(v)}</span>`).join('')}</div>`;}
else if(it.hl&&it.prompt.includes(it.hl)){const i=it.prompt.indexOf(it.hl);q.innerHTML=esc(it.prompt.slice(0,i))+'<mark>'+esc(it.hl)+'</mark>'+esc(it.prompt.slice(i+it.hl.length));}
else q.textContent=it.prompt;
tSetEn();
const cues=[];
if(it.mode==='answer'){const c=it.cue||'';if(c.startsWith('✔'))cues.push(['yes',c]);else if(c.startsWith('✘')){const [n,alt]=c.split('→').map(s=>s.trim());cues.push(['no',n]);if(alt)cues.push(['use','say instead: '+alt]);}else if(c)cues.push(['use','use: '+c]);if(it.pron)cues.push(['type','use er / es / sie']);}
else if(it.mode==='ask'){cues.push(['type',it.hl?'ask about the highlighted words':'yes/no question']);if(it.who)cues.push(['use',TWHO[it.who]]);}
else if(it.parts)cues.push(['type',{st:'statement  .',yn:'yes/no question  ?',w:'W-question  ?',inv:'statement – start with the first part'}[it.parts.ty]]);
byId('tCues').innerHTML=cues.map(([c,t])=>`<span class="tcue ${c}">${esc(t)}</span>`).join('');
const inp=byId('tIn');inp.value='';inp.disabled=false;byId('tInLab').textContent=it.mode==='ask'?'Your question in German':'Your answer in German';
byId('tCheck').classList.remove('hidden');byId('tNext').classList.add('hidden');byId('tHint').disabled=false;byId('tHint').textContent='💡 Hint';byId('tReveal').disabled=false;
byId('tHintBox').classList.add('hidden');byId('tHintBox').innerHTML='';byId('tTiles').classList.add('hidden');byId('tTiles').replaceChildren();
const fb=byId('tFb');fb.className='answer-feedback';fb.innerHTML='';
byId('tSay').classList.toggle('hidden',!!(it.parts||it.en));byId('tSay').textContent='🔊 Listen';
byId('tCount').textContent=`${tIdx+1} / ${tQueue.length}`;byId('tFill').style.width=(100*tIdx/tQueue.length)+'%';byId('tScore').textContent='✓ '+tRound.ok;
LOG.shown('talk');if(byId('tAuto').checked&&!it.parts&&!it.en)speak(it.prompt);
setTimeout(()=>inp.focus(),50);}
function tSwitchHint(it){if(it.mode==='ask')return it.who?`<b>Person:</b> ${esc(TWHO[it.who])}`:'';if(it.mode!=='answer')return '';const q=tToks(it.prompt);if(q.includes('du'))return '<b>Person:</b> the question says <i>du</i> → answer with <b>ich</b>.';if(q.includes('ihr'))return '<b>Person:</b> the question says <i>ihr</i> → answer with <b>wir</b>.';if(q.slice(1).includes('Sie')||q.includes('Ihnen'))return '<b>Person:</b> formal <i>Sie</i> → answer with <b>ich</b>.';if(it.pron)return '<b>Pronoun:</b> der → er · das → es · die → sie · plural → sie';return '';}
function tHint(){if(!tCur||tDone)return;LOG.hint('talk',tCur.key);const it=tCur;
if(tHintLv===0){tHintLv=1;const target=it.acc[0],T=tToks(target),vi=T.findIndex(tIsVerb);let h=tPatHTML(tType(target));const A=it.act;
if(A&&A.sep)h+=`<br><b>Verb:</b> ${esc(A.sep)}|${esc(A.v)} – separable: <b>${esc(A.sep)}</b> goes to the end.`;else if(vi>=0)h+=`<br><b>Verb:</b> ${esc(T_FORM[tk1(T[vi])])}`;
const sw=tSwitchHint(it);if(sw)h+='<br>'+sw;const box=byId('tHintBox');box.innerHTML=h;box.classList.remove('hidden');byId('tHint').textContent='🧩 Word tiles';}
else if(tHintLv===1){tHintLv=2;tShowTiles();byId('tHint').disabled=true;}
byId('tIn').focus();}
function tShowTiles(){const T=tToks(tCur.acc[0]);const cap=w=>w.charAt(0).toUpperCase()+w.slice(1);const low=w=>tIsVerb(w)||TSUBJ.has(w.toLowerCase())||TWW.has(w.toLowerCase())||/^(Ja|Nein|Das|Der|Die|Mir|In|Oft|Ein|Eine|Kein|Keine|Und|Aber|Danke|Gut)$/.test(w);
let tiles=T.map((w,i)=>i===0&&low(w)?w.charAt(0).toLowerCase()+w.slice(1):w),s=shuffle(tiles.slice());for(let k=0;k<6&&tiles.length>1&&s.join(' ')===tiles.join(' ');k++)s=shuffle(tiles.slice());
const box=byId('tTiles');box.replaceChildren();s.forEach(w=>{const b=document.createElement('button');b.type='button';b.className='ttile';b.textContent=w;b.addEventListener('click',()=>{if(tDone)return;const inp=byId('tIn'),cur=inp.value.trim();inp.value=(cur?cur+' '+w:cap(w));b.classList.add('used');b.disabled=true;tSpoken=false;inp.focus();});box.append(b);});
const back=document.createElement('button');back.type='button';back.className='ttile ctl';back.textContent='⌫ Undo word';back.addEventListener('click',()=>{const inp=byId('tIn'),ws=inp.value.trim().split(/\s+/).filter(Boolean),last=ws.pop();inp.value=ws.join(' ');if(last){const t=[...box.querySelectorAll('.ttile.used')].reverse().find(x=>x.textContent.toLowerCase()===last.toLowerCase());if(t){t.classList.remove('used');t.disabled=false;}}inp.focus();});
const clr=document.createElement('button');clr.type='button';clr.className='ttile ctl';clr.textContent='✕ Clear';clr.addEventListener('click',()=>{byId('tIn').value='';box.querySelectorAll('.ttile.used').forEach(x=>{x.classList.remove('used');x.disabled=false;});byId('tIn').focus();});
box.append(back,clr);box.classList.remove('hidden');}
function tCheck(){if(tDone||!tCur)return;const val=byId('tIn').value;if(!val.trim()){toast('Type your answer first – or use 💡 Hint.');byId('tIn').focus();return;}tFinish(val,false);}
function tFinish(val,revealed){if(tRec){try{tRec.stop();}catch(e){}}tDone=true;const it=tCur,rec=tProg.by[it.key]||(tProg.by[it.key]={c:0,w:0});const m=revealed?{ok:false}:tMatch(val,it.acc),helped=tHintLv>=2,sep=it.act&&it.act.sep;
if(!revealed)tProg.total++;
if(m.ok){tProg.correct++;tProg.streak++;rec.c++;rec.last=helped?'help':'ok';tRound.ok++;}else{tProg.streak=0;rec.w++;rec.last='bad';tQueue.splice(Math.min(tIdx+4,tQueue.length),0,it);}
tSave();const fb=byId('tFb');let h='',target;
if(m.ok){target=it.acc[m.i];h+=`<strong>${helped?'✓ Correct – with word tiles. Next time, try it without them!':'✓ Richtig! Correct.'}</strong><div class="tsol" lang="de">${tVerbHTML(target,sep)}</div>`;const notes=[];if(m.i>0)notes.push(`Also good: <span lang="de">${tVerbHTML(it.acc[0],sep)}</span>`);if(!tSpoken){notes.push(...tCapsNotes(val,target));if(m.um)notes.push(...tUmlautNotes(val,target));}if(notes.length)h+=`<ul class="ttips">${notes.map(n=>`<li>${n}</li>`).join('')}</ul>`;fb.className='answer-feedback good';}
else{target=revealed?it.acc[0]:tClosest(val,it.acc);if(revealed){h+=`<strong>Here is the answer:</strong><div class="tsol" lang="de">${tVerbHTML(target,sep)}</div>`;fb.className='answer-feedback neutral';}else{h+=`<strong>✗ Not quite.</strong>${tDiffHTML(val,target)}`;const tips=tDiagnose(val,target,it);if(tips.length)h+=`<ul class="ttips">${tips.map(x=>`<li>${x}</li>`).join('')}</ul>`;fb.className='answer-feedback bad';}
h+=`<div class="tnote">${tPatHTML(tType(target))}</div><div class="tnote">↻ This one comes back later in the round.</div>`;}
if(byId('tShowEn').checked&&it.sEn&&!it.en)h+=`<div class="tnote">🇬🇧 ${esc(it.sEn)}</div>`;
fb.innerHTML=h;tSayText=target;LOG.talk(it,val,revealed,m.ok,target);if(byId('tAutoAns').checked)speak(target);
byId('tIn').disabled=true;byId('tCheck').classList.add('hidden');byId('tNext').classList.remove('hidden');byId('tNext').textContent=tIdx>=tQueue.length-1?'New round ↻':'Next →';byId('tHint').disabled=true;byId('tReveal').disabled=true;byId('tTiles').classList.add('hidden');
byId('tSay').classList.remove('hidden');byId('tSay').textContent='🔊 Hear the answer';byId('tScore').textContent='✓ '+tRound.ok;byId('tCount').textContent=`${tIdx+1} / ${tQueue.length}`;tStats();byId('tNext').focus();}
function tNext(){if(!tDone)return;tIdx++;if(tIdx>=tQueue.length){toast(`Round done – ${tRound.ok} correct answers. Here's a new round!`);tOptions();tNewRound();}else tShow();showTop(byId('tTask'));}
function tEnter(){tOptions();document.querySelectorAll('[data-tmode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tmode===tMode)));if(!tCur)tNewRound();else if(!tDone)setTimeout(()=>byId('tIn').focus(),50);}
document.querySelectorAll('[data-tmode]').forEach(b=>b.addEventListener('click',()=>{tMode=b.dataset.tmode;tSaveUI();document.querySelectorAll('[data-tmode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));tOptions();tNewRound();}));
byId('tTopic').addEventListener('change',e=>{tTopic=e.target.value;tSaveUI();tNewRound();});
byId('tShowEn').addEventListener('change',()=>{tSaveUI();if(tCur&&!tDone)tSetEn();});
byId('tAuto').addEventListener('change',tSaveUI);byId('tAutoAns').addEventListener('change',tSaveUI);
byId('tForm').addEventListener('submit',e=>{e.preventDefault();if(tDone)tNext();else tCheck();});
byId('tHint').addEventListener('click',tHint);
byId('tReveal').addEventListener('click',()=>{if(tCur&&!tDone)tFinish('',true);});
byId('tNext').addEventListener('click',tNext);
byId('tSay').addEventListener('click',()=>{if(tCur)speak(tDone?tSayText:tCur.prompt);});
byId('tNew').addEventListener('click',()=>{tOptions();tNewRound();toast('New round.');});
byId('tAllBtn').addEventListener('click',()=>{tTopic='all';tSaveUI();tOptions();tNewRound();});
byId('tResetBtn').addEventListener('click',()=>{if(!confirm('Reset your conversation progress? (Other progress is not touched.)'))return;tProg={total:0,correct:0,streak:0,by:{}};tSave();tOptions();tNewRound();toast('Conversation progress reset.');});
try{byId('tLesson').open=localStorage.getItem(tKey+'-lesson')!=='closed';}catch(e){byId('tLesson').open=true;}
byId('tLesson').addEventListener('toggle',()=>{try{localStorage.setItem(tKey+'-lesson',byId('tLesson').open?'open':'closed');}catch(e){}});
byId('tIn').addEventListener('input',()=>{tSpoken=false;});
document.addEventListener('keydown',e=>{if(activeTab!=='talk'||e.key!=='Enter'||!tDone)return;if(e.target.closest&&e.target.closest('input,select,button,textarea,summary'))return;e.preventDefault();tNext();});
/* optional: speak the answer (browser speech recognition, German) */
const TSR=window.SpeechRecognition||window.webkitSpeechRecognition;let tRec=null;
if(!TSR)byId('tMic').classList.add('hidden');
byId('tMic').addEventListener('click',()=>{if(!TSR||tDone)return;if(tRec){try{tRec.stop();}catch(e){}return;}const b=byId('tMic'),off=()=>{tRec=null;b.classList.remove('on');b.textContent='🎤';};let r;try{r=new TSR();}catch(e){toast('Speech input is not available in this browser.');return;}tRec=r;r.lang='de-DE';r.interimResults=false;r.maxAlternatives=1;b.classList.add('on');b.textContent='● Stop';
r.onresult=e=>{byId('tIn').value=e.results[0][0].transcript;tSpoken=true;};r.onerror=e=>{toast(e.error==='not-allowed'||e.error==='service-not-allowed'?'Microphone access is blocked – allow it in your browser to speak your answers.':'Didn’t catch that – try again.');};r.onend=off;try{r.start();}catch(e){off();toast('Speech input could not start.');}});

