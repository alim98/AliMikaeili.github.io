/* 📅 REVIEW SCHEDULE – one spaced-repetition schedule for everything you practise (step 2 of LEARNING-PLAN.md).

   An "item" is one thing you can get right or wrong:
     v:<card id>:en-de / de-en   translate a word (each direction is its own item)
     g:<card id>                 the article of a noun (der / die / das)
     p:<card id>                 the plural of a noun
     f:<verb>:<0–5>              one verb form: ich, du, er/sie/es, wir, ihr, sie/Sie (f:haben:1 = du hast)

   Nothing new is stored: the schedule is worked out from your learning history (every answer since 25 Nov,
   from every trainer and from 🎯 Heute), and for older practice from the trainers' saved counters.
   So backups and imports carry it automatically, and practising in any trainer moves it on.

   Life of an item:  🆕 new → 🌱 learning (again after ~10 min, then 1 day) → 📅 review → 🏦 known (gap ≥ 30 days)
     right answer at review time   → the gap grows ×2.5 (a little more when you answer late)
     ≈ almost                      → the gap grows only ×1.2
     right, but long before due    → nothing changes (cramming does not count as spacing)
     wrong or revealed             → back to 🌱 learning; after relearning it restarts at 40 % of its old gap, not at zero

   Step 3 (28 Nov) – the schedule tunes itself to you:
     ⚡ speed         a right answer that comes quickly is really learned; a slow one is not automatic yet
     🎯 calibration   the gaps stretch or shrink so that you remember about 85 % of your reviews
     🆕 intake        how many new things a session brings depends on your accuracy, reviews and speed
   Each is explained where it is worked out, below. 🗃 Whatever is archived in a section is left out.
*/
const SRS=(()=>{
const MIN=6e4,DAY=864e5,KNOWN=30,TARGET=.85;
let S={},built=false,REV=[],TM={},W={},SPD=[],last=null;
const VINF={};vList.forEach(v=>{VINF[v.inf]=v;});
const PRON=['ich','du','er / sie / es','wir','ihr','sie / Sie'];
const hash=s=>{let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);};
const fuzz=(k,d)=>d<3?d:d*(.92+.16*(hash(k)%1000)/1000);          // spread reviews so they don't all fall on one day
const RES={correct:'ok',almost:'hard',wrong:'bad',revealed:'bad'};
/* which verb forms are worth their own item: all six for irregular verbs, ich/du/er for stem-changing ones, du/er for regular ones */
function fPersons(inf){return VIRR[inf]?[0,1,2,3,4,5]:VCHG[inf]?[0,1,2]:[1,2];}
function parse(k){const i=k.indexOf(':'),t=k.slice(0,i),r=k.slice(i+1);if(t==='v'||t==='f'){const j=r.lastIndexOf(':');return t==='v'?{t,id:r.slice(0,j),dir:r.slice(j+1)}:{t,inf:r.slice(0,j),i:Number(r.slice(j+1))};}return {t,id:r};}
function baseOf(k){const x=parse(k);return x.t==='f'?(VINF[x.inf]?VINF[x.inf].id:x.inf):x.id;}
function valid(k){const x=parse(k);switch(x.t){
  case 'v':return !!vocabulary[Number(x.id)]&&DIRS.includes(x.dir)&&!isArch(x.id);   // 🗃 Archive = no more translation questions
  case 'g':return !!gById[x.id]&&!gById[x.id].plural&&!inArch('gender',x.id);   // 🗃 archived in a trainer = left out (js/archive.js)
  case 'p':return !!P_BY[x.id]&&!inArch('plural',x.id);
  case 'f':return !!VINF[x.inf]&&x.i>=0&&x.i<6&&!inArch('verbs',VINF[x.inf].id);}return false;}

/* ⚡ SPEED – thinking time = time to answer − about ¼ s per letter typed. It is compared with your own typical
   thinking time for that kind of question (the median of your last 40 right answers of that kind):
     ⚡ fast   under half your typical time                       → the gap grows a little more (×1.15)
     🐢 slow   over 2½ × your typical time and at least 4 s more  → the gap grows less (×1.5 instead of ×2.5)
   Not timed: answers with hints, answers over 2 minutes (you were away), whole verb tables, ≈ almost answers,
   and the first 8 right answers of each kind (there is no "typical" yet). */
const TYPED={'v:en-de':1,'v:de-en':1,'p:write':1,'p:sing':1,'f:form':1,'f:swap':1};
function tkind(e){switch(e.section){case 'vocab':return DIRS.includes(e.mode)?'v:'+e.mode:null;case 'gender':return e.mode==='plural'?null:'g';case 'plural':return 'p:'+(e.mode||'pattern');case 'verbs':return e.mode==='form'||e.mode==='swap'?'f:'+e.mode:null;}return null;}
const medOf=a=>{const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
function speedOf(e){const tk=tkind(e);if(!tk||!(e.ms>0)||e.ms>120e3||e.hints>0||effRes(e)!=='correct')return null;
  const t=Math.max(300,e.ms-(TYPED[tk]?250*String(e.given||'').length:0)),L=TM[tk]||(TM[tk]=[]),med=L.length>=8?medOf(L):null;
  L.push(t);if(L.length>40)L.shift();
  return {sp:med==null?null:t<=med*.5?'fast':t>=med*2.5&&t-med>=4000?'slow':'norm',t,med,tk};}

/* 🎯 CALIBRATION – from your last 40 reviews of each kind (all kinds together until one kind has 20):
   remembered more than 85 % → the gaps get longer (up to ×1.3) · less than 85 % → shorter (down to ×0.8).
   (Memory fades roughly exponentially, so the gap that would give 85 % is gap × ln 0.85 / ln(your rate);
   only half of that change is used, so one good or bad week can't swing it too far.) */
function modFor(t){const L=(W[t]||[]).length>=20?W[t]:(W.all||[]).length>=20?W.all:null;if(!L)return 1;
  const r=Math.min(.98,Math.max(.5,L.filter(Boolean).length/L.length));let m=Math.log(TARGET)/Math.log(r);m=Math.min(1.6,Math.max(.6,m));return 1+(m-1)*.5;}
function pushW(t,ok){[t,'all'].forEach(x=>{const L=W[x]||(W[x]=[]);L.push(ok);if(L.length>40)L.shift();});}

/* one answer → the item's new state */
function upd(k,res,ts,sp){
  let s=S[k];if(!s)s=S[k]={ivl:0,ease:2.5,step:0,reps:0,lapses:0,last:0,due:ts,prev:0};
  const was=s.ivl,el=s.last?(ts-s.last)/DAY:0,early=was>0&&el<was*.5;let mod=1;
  s.reps++;s.res=res;
  if(was>0&&!early){mod=modFor(k[0]);pushW(k[0],res!=='bad');if(ts>Date.now()-30*DAY)REV.push(res!=='bad');}
  if(res==='bad'){if(was>0){s.prev=was;s.lapses++;s.ease=Math.max(1.3,s.ease-.2);}s.ivl=0;s.step=0;s.due=ts+MIN;s.last=ts;return;}
  if(was===0){                                   // 🌱 learning steps
    if(res==='ok')s.step++;
    if(s.step>=(s.prev?1:2)){s.ivl=s.prev?Math.max(1,Math.round(s.prev*.4)):el>=.9?Math.max(2,Math.round(el*s.ease)):1;s.prev=0;s.due=ts+fuzz(k,s.ivl)*DAY;}
    else s.due=ts+(res==='ok'?10:3)*MIN;
    s.last=ts;return;}
  if(early)return;                               // practised long before it was due: keep the schedule
  const base=Math.max(was,el);let n;
  if(res==='hard'){n=base*1.2;s.ease=Math.max(1.3,s.ease-.15);}
  else n=base*(sp==='slow'?Math.max(1.3,s.ease*.6):sp==='fast'?s.ease*1.15:s.ease);   // ⚡ speed
  n=Math.max(was+1,n*mod);                                                             // 🎯 calibration
  s.ivl=Math.min(365,Math.round(n));s.sp=sp||'';s.due=ts+fuzz(k,s.ivl)*DAY;s.last=ts;}

/* an answer an older, stricter checker marked wrong is judged again with today's rules (the history itself is not changed):
   "this is a chair, those are 2 chairs", "cellphone", "giutar", "student" without der, "fa¨hrst" … */
const RJ={};
function effRes(e){const r=e.result;if(r!=='wrong'||!e.given||e.action!=='answer')return r;if(e.uid in RJ)return RJ[e.uid];let x=r;
  try{if(e.section==='vocab'&&DIRS.includes(e.mode)){const c=vocabulary[Number(e.item)];if(c){const j=e.mode==='de-en'?enJudge(e.given,c):deJudge(e.given,c);if(j.res==='correct'||j.res==='almost')x=j.res;}}
    else if(e.section==='verbs'&&e.mode==='form'&&e.expected){const g=String(e.given).replace(/^(ich|du|er|sie|es|wir|ihr|Sie)(\s*\/\s*(sie|es|Sie))*\s+/i,'').trim();if(norm(g,1)===norm(e.expected,1))x='correct';}}catch(err){}
  return RJ[e.uid]=x;}
/* a logged answer → the items it trains */
function keysOf(e){const r=RES[effRes(e)];if(!r||e.action!=='answer')return [];const d=e.details||{};
  switch(e.section){
    case 'vocab':return DIRS.includes(e.mode)?[['v:'+e.item+':'+e.mode,r]]:[];
    case 'gender':return e.mode==='plural'?[]:[['g:'+e.item,r]];
    case 'plural':return [['p:'+e.item,e.mode==='pattern'&&r==='ok'?'hard':r]];   // picking the pattern is easier than writing it
    case 'verbs':{const inf=e.label;if(!VINF[inf])return [];
      if(e.mode==='table'&&Array.isArray(d.cells))return d.cells.map((c,i)=>['f:'+inf+':'+i,c.ok?'ok':'bad']);
      const i=VPRON.indexOf(d.person);return i>=0&&(e.mode==='swap'||e.mode==='form')?[['f:'+inf+':'+i,r]]:[];}}
  return [];}

/* practice from before the history log (only counters were saved then): a rough starting point */
function seed(){const now=Date.now(),put=(k,ivl,dueIn)=>{if(!S[k])S[k]={ivl,ease:2.5,step:ivl?2:0,reps:1,lapses:0,last:now-DAY,due:now+dueIn,prev:0,seed:true};},
  spread=(k,ivl)=>(hash(k)%1000)/1000*ivl*DAY;
  vocabulary.forEach(c=>{const r=progress.byId[c.id];if(!r)return;DIRS.forEach(dir=>{const s=r.d&&r.d[dir],k='v:'+c.id+':'+dir;if(!s||!s.seen&&!s.c)return;
    if(s.banked)put(k,INTERVALS[s.level||0],Math.max(0,(s.due||now)-now));else if(r.needsReview)put(k,0,0);else if(s.c>0){const ivl=Math.min(1+Math.floor(s.c/2),5);put(k,ivl,spread(k,ivl));}});});
  gNouns.forEach(n=>{const r=gProg.byId[n.id],k='g:'+n.id;if(n.plural||!r||!(r.c+r.w))return;if(r.s>=3)put(k,4,spread(k,4));else if(!r.s&&r.w)put(k,0,0);else put(k,1,spread(k,1));});
  P_ITEMS.forEach(p=>{const r=pProg.by[p.id],k='p:'+p.id;if(!r||!(r.c+r.w))return;if(r.s>=3)put(k,4,spread(k,4));else if(!r.s&&r.w)put(k,0,0);else put(k,1,spread(k,1));});
  vList.forEach(v=>{const r=vProg.byId[v.id];if(!r||!r.c)return;const m=vMastered(v.id);fPersons(v.inf).forEach(i=>{const k='f:'+v.inf+':'+i;if(m)put(k,3,spread(k,3));else put(k,r.p?1:0,r.p?spread(k,1):0);});});}

function feed(e){last=null;const ks=keysOf(e);if(!ks.length)return;const sp=speedOf(e);last=sp;if(sp&&sp.sp)SPD.push({ts:e.ts,sp:sp.sp});ks.forEach(([k,r])=>upd(k,r,e.ts,sp&&sp.sp));}
function build(){S={};REV=[];TM={};W={};SPD=[];LOG.all().forEach(feed);seed();built=true;last=null;}
function ensure(){if(!built&&LOG.info().ready)build();return built;}
function onAnswer(e){if(built)feed(e);}
function stage(k){const s=S[k];return !s?'new':s.ivl===0?'learning':s.ivl>=KNOWN?'known':'review';}

/* 🆕 ADAPTIVE INTAKE – how many new things a session of N questions brings (the numbers are for N = 20):
     your last 30 answers (📚 🎨 👥 🔁)  under 75 % right → none: reviews and fixing only (2 if there is little else to do)
                                       75–90 %          → 5
                                       over 90 %        → 8 if you are also quick (under 20 % 🐢 slow answers), else 6
     reviews remembered (last 30 days, 10 or more)  under 80 %   → at most 3: you are forgetting, consolidate first
     reviews waiting  N or more                                  → at most 2
     a busy week ahead (more than 1½ sessions of reviews a day)  → half */
const TRAIN={vocab:1,gender:1,plural:1,verbs:1},pc=x=>Math.round(100*x)+'%';
function recentAcc(){const A=LOG.all().filter(e=>e.action==='answer'&&RES[e.result]&&TRAIN[e.section]).slice(-30);return A.length<10?null:A.filter(e=>RES[effRes(e)]!=='bad').length/A.length;}
function weekLoad(){const now=Date.now();let n=0;for(const k in S){const d=S[k].due;if(d>now&&d<=now+7*DAY&&valid(k))n++;}return n/7;}
function intake(N,dueN){const a=recentAcc(),R=REV.slice(-30),ret=R.length>=10?R.filter(Boolean).length/R.length:null,
    T=SPD.slice(-30),slow=T.length>=10?T.filter(x=>x.sp==='slow').length/T.length:null,quick=slow!=null&&slow<.2;let b,why;
  if(a==null){b=5;why='the normal amount – after 10 answers it adapts to you';}
  else if(a<.75){b=dueN<N/2?2:0;why=`your last 30 answers were ${pc(a)} right (under 75%) – ${b?'just 2 new things':'no new things, only reviews'} until that is back up`;}
  else if(a>.9){b=quick?8:6;why=`your last 30 answers were ${pc(a)} right${quick?' and quick':''} – more new things`+(quick?'':' (8 once you are also quick)');}
  else{b=5;why=`your last 30 answers were ${pc(a)} right – the normal amount`;}
  if(ret!=null&&ret<.8&&b>3){b=3;why=`you remembered ${pc(ret)} of your recent reviews (target 85%) – consolidate first`;}
  b=Math.round(b*N/20);
  const cap=Math.max(1,Math.round(N/10));if(dueN>=N&&b>cap){b=cap;why=`${dueN} reviews are waiting – reviews first`;}
  const wk=weekLoad();if(wk>1.5*N&&b>1){b=Math.max(1,Math.round(b/2));why=`a busy week ahead (about ${Math.round(wk)} reviews a day) – fewer new things`;}
  return {n:b,why,acc:a,ret,quick,slow};}
function newBudget(N,dueN){return intake(N,dueN).n;}
/* what is due, in three groups (changed 28 Nov after the first real data: 245 items were due at once and
   old verb-table counters always came first, so a whole session was verb forms):
     fix  🌱 learning started in the last 24 hours (a wrong answer, a new word) – finished first
     rev  📅 reviews – the most overdue for their gap first
     old  📦 old mistakes – learning that stopped more than a day ago, or practice from before the history log.
          They fill what is left of a session, a few of each kind, the most recent first. */
function dueGroups(now){const g={fix:[],rev:[],old:[]};
  Object.keys(S).forEach(k=>{const s=S[k];if(s.due>now||!valid(k))return;if(s.ivl>0)g.rev.push(k);else if(s.seed||now-s.due>DAY)g.old.push(k);else g.fix.push(k);});
  g.fix.sort((a,b)=>S[a].due-S[b].due);g.rev.sort((a,b)=>(now-S[b].due)/S[b].ivl-(now-S[a].due)/S[a].ivl);g.old.sort((a,b)=>(S[b].seed?0:S[b].last)-(S[a].seed?0:S[a].last));
  return g;}
function dueList(now){const g=dueGroups(now);return g.fix.concat(g.rev,g.old);}
/* the next new things, a few of each kind: new words, their German spelling, articles, plurals, verb forms */
/* the next step for a word only comes once the previous one has settled (sleep on it): learned at least 12 h ago, or already at a 3-day gap */
function freshUnits(max,skip){const lists=[[],[],[],[],[]],now=Date.now(),has=k=>!!S[k]||skip.has(k),ok=k=>{const s=S[k];return !!s&&s.ivl>0&&(s.ivl>=3||now-s.last>12*36e5);};
  if(!max)return [];
  const words=vocabulary.filter(c=>!isArch(c.id)&&!seenCount(c.id)&&!S['v:'+c.id+':de-en']&&!S['v:'+c.id+':en-de']).sort((a,b)=>b.les-a.les||difficulty(a)-difficulty(b));
  words.slice(0,max).forEach(c=>lists[0].push({k:'v:'+c.id+':de-en',isNew:true,preview:true}));
  vocabulary.forEach(c=>{if(lists[1].length<max&&!isArch(c.id)&&ok('v:'+c.id+':de-en')&&!has('v:'+c.id+':en-de'))lists[1].push({k:'v:'+c.id+':en-de',isNew:true});});
  gNouns.forEach(n=>{if(lists[2].length<max&&!n.plural&&!inArch('gender',n.id)&&!has('g:'+n.id)&&(ok('v:'+n.id+':de-en')||ok('v:'+n.id+':en-de')||(progress.byId[n.id]?.correct||0)>0))lists[2].push({k:'g:'+n.id,isNew:true});});
  P_ITEMS.forEach(p=>{if(lists[3].length<max&&!inArch('plural',p.id)&&!has('p:'+p.id)&&(ok('g:'+p.id)||gLearned(p.id)||inArch('gender',p.id)&&(ok('v:'+p.id+':de-en')||ok('v:'+p.id+':en-de'))))lists[3].push({k:'p:'+p.id,isNew:true});});
  vList.forEach(v=>{if(lists[4].length>=max||inArch('verbs',v.id)||!(ok('v:'+v.id+':de-en')||ok('v:'+v.id+':en-de')||(progress.byId[v.id]?.correct||0)>0))return;
    fPersons(v.inf).filter(i=>!has('f:'+v.inf+':'+i)).slice(0,2).forEach(i=>lists[4].push({k:'f:'+v.inf+':'+i,isNew:true}));});
  const out=[],order=[0,2,1,4,3];let i=0,guard=0;
  while(out.length<max&&guard++<200){const L=lists[order[i++%order.length]];if(L.length)out.push(L.shift());if(lists.every(l=>!l.length))break;}
  return out;}
/* mix: never the same word twice in a row, and if possible not the same kind of question */
function interleave(L){const out=[],rest=L.slice();let prev=null;const t=x=>x&&x.k[0],b=x=>x&&baseOf(x.k);
  while(rest.length){let i=rest.findIndex(x=>b(x)!==b(prev)&&t(x)!==t(prev));if(i<0)i=rest.findIndex(x=>b(x)!==b(prev));if(i<0)i=0;prev=rest.splice(i,1)[0];out.push(prev);}return out;}
/* a session of N means about N answers: a 📅 review takes 1, anything still being learned about 2
   (it comes back later in the session), a new word 2.5 (it is shown first) */
const cost=x=>x.preview?2.5:x.isNew||!S[x.k]||S[x.k].ivl===0?2:1;
/* take turns between the kinds (words, articles, plurals, verb forms) so that no kind fills a session */
function turns(keys,mk,fits,put){const L=Object.values(keys.reduce((m,k)=>{(m[k[0]]||(m[k[0]]=[])).push(k);return m;},{}));let more=true;
  while(more){more=false;for(const q of L){if(!q.length)continue;const x=mk(q[0]);if(!fits(x))return;q.shift();put(x);more=true;}}}
/* an old mistake on a word you never got right is shown first again, like a new word */
function oldItem(k){const x={k,isNew:false,old:true};if(k[0]==='v'){const r=progress.byId[parse(k).id];if(!(r&&r.correct>0))x.preview=true;}return x;}
/* today's session of about N answers */
function plan(N){ensure();const now=Date.now(),G=dueGroups(now),I=intake(N,G.fix.length+G.rev.length),out=[],used=new Set();let left=N;
  const put=x=>{out.push(x);used.add(x.k);left-=cost(x);},fits=r=>x=>left-r>=cost(x)-.01;
  const rNew=Math.min(N/2,I.n*2.25),rOld=G.old.length?Math.min(N*(G.old.length>50?.4:.3),G.old.length*2.5):0;   // room kept for new things and for old mistakes (30 %, or 40 % while there are many)
  turns(G.fix,k=>({k,isNew:false}),fits(rNew+rOld),put);
  turns(G.rev,k=>({k,isNew:false}),fits(rNew+rOld),put);
  freshUnits(I.n,used).forEach(x=>{if(fits(rOld)(x))put(x);});
  turns(G.old,oldItem,fits(0),put);
  turns(G.rev.concat(G.fix).filter(k=>!used.has(k)),k=>({k,isNew:false}),fits(0),put);   // room left over: more reviews
  return {items:interleave(out),due:G.fix.length+G.rev.length+G.old.length,fix:G.fix.length,rev:G.rev.length,old:G.old.length,
    fresh:out.filter(x=>x.isNew).length,oldN:out.filter(x=>x.old).length,answers:Math.round(N-left),newBudget:I.n,why:I.why};}
function counts(){ensure();const now=Date.now(),eod=new Date();eod.setHours(23,59,59,999);const tom=+eod+DAY;
  const G=dueGroups(now),c={due:0,fix:G.fix.length,revDue:G.rev.length,old:G.old.length,tomorrow:0,week:0,stage:{learning:0,review:0,known:0},byType:{}};
  Object.keys(S).forEach(k=>{if(!valid(k))return;const s=S[k],st=stage(k),t=k[0];c.stage[st]++;(c.byType[t]||(c.byType[t]={learning:0,review:0,known:0,due:0}))[st]++;
    if(s.due<=now){c.due++;c.byType[t].due++;}else if(s.due<=tom)c.tomorrow++;if(s.due>now&&s.due<=now+7*DAY)c.week++;});
  c.rev={n:REV.length,ok:REV.filter(Boolean).length};c.newToday=newBudget(20,c.fix+c.revDue);return c;}
/* what the schedule has learned about you (📊 My progress and the report) */
const KNAME={'v:en-de':'📚 English → German','v:de-en':'📚 German → English','g':'🎨 der · die · das','p:pattern':'👥 Plural pattern','p:write':'👥 Write the plural','p:sing':'👥 Back to the singular','f:form':'🔁 Verb form (Heute)','f:swap':'🔁 Swap the person'};
function tuning(){ensure();const since=Date.now()-30*DAY,sp=SPD.filter(x=>x.ts>since),mods={};
  ['v','g','p','f'].forEach(t=>{const L=W[t]||[];mods[t]={m:modFor(t),n:L.length,r:L.length?L.filter(Boolean).length/L.length:null,own:L.length>=20};});
  const speed=Object.keys(KNAME).filter(k=>TM[k]&&TM[k].length).map(k=>({k,name:KNAME[k],med:medOf(TM[k]),n:TM[k].length}));
  return {mods,speed,fast:sp.filter(x=>x.sp==='fast').length,slow:sp.filter(x=>x.sp==='slow').length,timed:sp.length,intake:(()=>{const g=dueGroups(Date.now());return intake(20,g.fix.length+g.rev.length);})()};}
return {ensure,onAnswer,plan,counts,tuning,intake,effRes,stage,parse,baseOf,valid,fPersons,PRON,VINF,get:k=>S[k],all:()=>S,lastSpeed:()=>last,rebuild:()=>{built=false;return ensure();}};
})();
