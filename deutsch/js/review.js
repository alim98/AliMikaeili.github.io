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
*/
const SRS=(()=>{
const MIN=6e4,DAY=864e5,KNOWN=30;
let S={},built=false,REV=[];
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
  case 'g':return !!gById[x.id]&&!gById[x.id].plural;
  case 'p':return !!P_BY[x.id];
  case 'f':return !!VINF[x.inf]&&x.i>=0&&x.i<6;}return false;}

/* one answer → the item's new state */
function upd(k,res,ts){
  let s=S[k];if(!s)s=S[k]={ivl:0,ease:2.5,step:0,reps:0,lapses:0,last:0,due:ts,prev:0};
  const was=s.ivl,el=s.last?(ts-s.last)/DAY:0,early=was>0&&el<was*.5;
  s.reps++;s.res=res;
  if(was>0&&!early&&ts>Date.now()-30*DAY)REV.push(res!=='bad');
  if(res==='bad'){if(was>0){s.prev=was;s.lapses++;s.ease=Math.max(1.3,s.ease-.2);}s.ivl=0;s.step=0;s.due=ts+MIN;s.last=ts;return;}
  if(was===0){                                   // 🌱 learning steps
    if(res==='ok')s.step++;
    if(s.step>=(s.prev?1:2)){s.ivl=s.prev?Math.max(1,Math.round(s.prev*.4)):el>=.9?Math.max(2,Math.round(el*s.ease)):1;s.prev=0;s.due=ts+fuzz(k,s.ivl)*DAY;}
    else s.due=ts+(res==='ok'?10:3)*MIN;
    s.last=ts;return;}
  if(early)return;                               // practised long before it was due: keep the schedule
  const base=Math.max(was,el);let n;
  if(res==='hard'){n=Math.max(was+1,base*1.2);s.ease=Math.max(1.3,s.ease-.15);}else n=Math.max(was+1,base*s.ease);
  s.ivl=Math.min(365,Math.round(n));s.due=ts+fuzz(k,s.ivl)*DAY;s.last=ts;}

/* a logged answer → the items it trains */
function keysOf(e){const r=RES[e.result];if(!r||e.action!=='answer')return [];const d=e.details||{};
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

function build(){S={};REV=[];LOG.all().forEach(e=>keysOf(e).forEach(([k,r])=>upd(k,r,e.ts)));seed();built=true;}
function ensure(){if(!built&&LOG.info().ready)build();return built;}
function onAnswer(e){if(built)keysOf(e).forEach(([k,r])=>upd(k,r,e.ts));}
function stage(k){const s=S[k];return !s?'new':s.ivl===0?'learning':s.ivl>=KNOWN?'known':'review';}

/* how many new things today: fewer when your recent answers show it is too much, more when it is easy */
function recentAcc(){const A=LOG.all().filter(e=>e.action==='answer'&&RES[e.result]).slice(-30);return A.length<10?null:A.filter(e=>RES[e.result]!=='bad').length/A.length;}
function newBudget(N,dueN){const a=recentAcc();let b=a==null?5:a<.75?2:a>.9?8:5;b=Math.round(b*N/20);if(dueN>=N)b=Math.min(b,Math.max(1,Math.round(N/10)));return Math.max(1,b);}
function dueList(now){return Object.keys(S).filter(k=>S[k].due<=now&&valid(k)).map(k=>{const s=S[k];return {k,pri:s.ivl===0?1e9-(now-s.due)/MIN:(now-s.due)/(s.ivl*DAY)};}).sort((a,b)=>b.pri-a.pri).map(x=>x.k);}
/* the next new things, a few of each kind: new words, their German spelling, articles, plurals, verb forms */
/* the next step for a word only comes once the previous one has settled (sleep on it): learned at least 12 h ago, or already at a 3-day gap */
function freshUnits(max,skip){const lists=[[],[],[],[],[]],now=Date.now(),has=k=>!!S[k]||skip.has(k),ok=k=>{const s=S[k];return !!s&&s.ivl>0&&(s.ivl>=3||now-s.last>12*36e5);};
  if(!max)return [];
  const words=vocabulary.filter(c=>!isArch(c.id)&&!seenCount(c.id)&&!S['v:'+c.id+':de-en']&&!S['v:'+c.id+':en-de']).sort((a,b)=>b.les-a.les||difficulty(a)-difficulty(b));
  words.slice(0,max).forEach(c=>lists[0].push({k:'v:'+c.id+':de-en',isNew:true,preview:true}));
  vocabulary.forEach(c=>{if(lists[1].length<max&&!isArch(c.id)&&ok('v:'+c.id+':de-en')&&!has('v:'+c.id+':en-de'))lists[1].push({k:'v:'+c.id+':en-de',isNew:true});});
  gNouns.forEach(n=>{if(lists[2].length<max&&!n.plural&&!has('g:'+n.id)&&(ok('v:'+n.id+':de-en')||ok('v:'+n.id+':en-de')||(progress.byId[n.id]?.correct||0)>0))lists[2].push({k:'g:'+n.id,isNew:true});});
  P_ITEMS.forEach(p=>{if(lists[3].length<max&&!has('p:'+p.id)&&(ok('g:'+p.id)||gLearned(p.id)))lists[3].push({k:'p:'+p.id,isNew:true});});
  vList.forEach(v=>{if(lists[4].length>=max||!(ok('v:'+v.id+':de-en')||ok('v:'+v.id+':en-de')||(progress.byId[v.id]?.correct||0)>0))return;
    fPersons(v.inf).filter(i=>!has('f:'+v.inf+':'+i)).slice(0,2).forEach(i=>lists[4].push({k:'f:'+v.inf+':'+i,isNew:true}));});
  const out=[],order=[0,2,1,4,3];let i=0,guard=0;
  while(out.length<max&&guard++<200){const L=lists[order[i++%order.length]];if(L.length)out.push(L.shift());if(lists.every(l=>!l.length))break;}
  return out;}
/* mix: never the same word twice in a row, and if possible not the same kind of question */
function interleave(L){const out=[],rest=L.slice();let prev=null;const t=x=>x&&x.k[0],b=x=>x&&baseOf(x.k);
  while(rest.length){let i=rest.findIndex(x=>b(x)!==b(prev)&&t(x)!==t(prev));if(i<0)i=rest.findIndex(x=>b(x)!==b(prev));if(i<0)i=0;prev=rest.splice(i,1)[0];out.push(prev);}return out;}
/* today's session of about N questions */
function plan(N){ensure();const now=Date.now(),due=dueList(now),nb=newBudget(N,due.length),take=due.slice(0,Math.max(0,N-nb));
  const fresh=freshUnits(nb,new Set(take));
  return {items:interleave(take.map(k=>({k,isNew:false})).concat(fresh)),due:due.length,fresh:fresh.length,newBudget:nb};}
function counts(){ensure();const now=Date.now(),eod=new Date();eod.setHours(23,59,59,999);const tom=+eod+DAY;
  const c={due:0,fix:0,tomorrow:0,week:0,stage:{learning:0,review:0,known:0},byType:{}};
  Object.keys(S).forEach(k=>{if(!valid(k))return;const s=S[k],st=stage(k),t=k[0];c.stage[st]++;(c.byType[t]||(c.byType[t]={learning:0,review:0,known:0,due:0}))[st]++;
    if(s.due<=now){c.due++;c.byType[t].due++;if(s.ivl===0)c.fix++;}else if(s.due<=tom)c.tomorrow++;if(s.due>now&&s.due<=now+7*DAY)c.week++;});
  c.rev={n:REV.length,ok:REV.filter(Boolean).length};c.newToday=newBudget(20,c.due);return c;}
return {ensure,onAnswer,plan,counts,stage,parse,baseOf,valid,fPersons,PRON,VINF,get:k=>S[k],all:()=>S,rebuild:()=>{built=false;return ensure();}};
})();
