/* EXAMPLE SENTENCE under the answer in the 📚 Vocabulary trainer.
   For each card it uses
   1. the example(s) written for it in data/examples.js, if there are any,
   2. otherwise a sentence from your own course material that contains the word:
      lesson sentences (data/vocabulary.js), reading texts and Ask & answer questions.
   Cards that are whole sentences get no example. When a word has several examples,
   the next one is shown each time the card comes back.
*/
const EX=(()=>{
  const WORD=/[\p{L}\d]+(?:'[\p{L}]+)?/gu;
  const words=s=>String(s).normalize('NFC').replace(/[’‘]/g,"'").match(WORD)||[];
  const low=w=>w.toLocaleLowerCase('de');
  const cap=w=>/^\p{Lu}/u.test(w);
  const PRON=['i','you','he','she','it','we','they'];
  const SEP=['zurück','spazieren','aus','auf','an','ein','mit','vor','zu'];
  let corpus=null,lowerWords=null;

  function build(){
    const out=[],seen=new Set();
    const push=(de,en,src,les)=>{if(!de||!en)return;de=String(de).trim();const k=low(de);if(seen.has(k))return;
      const o=words(de);if(o.length<3||o.length>14)return;seen.add(k);out.push({de,en,src,les,o,t:o.map(low)});};
    vocabulary.forEach(c=>{if(isSentence(c))push(c.de,c.en,'lesson',c.les);});
    TEXTS.forEach(T=>T.p.forEach(p=>p.s.forEach(([de,en])=>push(de,en,'reading'))));
    TPAIRS.forEach(p=>{push(p.q[0],p.qen,'ask');if(p.aen)push(p.a[0],p.aen,'ask');});
    lowerWords=new Set(vocabulary.filter(c=>/^\p{Ll}+$/u.test(c.de)).map(c=>c.de));   // morgen, essen …
    return out;
  }
  function sepOf(w){const p=SEP.find(p=>w.startsWith(p)&&w.length>p.length+3);if(!p)return null;const base=w.slice(p.length);
    return VERBSET.has(base)||TACTS.some(a=>a.v===base)?{prefix:p,base}:null;}
  function isSentence(c){return c.cat==='sentences'||(/[.?!]$/.test(c.de)&&words(c.de).length>=3);}

  /* What to look for. Each group lists accepted spellings; every group must occur.
     kind 'noun' = must be written with a capital (der Morgen ≠ morgen),
     kind 'verb' = must not be (fragen ≠ die Fragen); a verb may appear in any person. */
  function want(c){
    const t=words(c.de).map(low);
    const forms=w=>{const f=new Set([w]);try{if(/n$/.test(w))vConj(w).forEach(x=>f.add(low(x)));}catch(e){}
      const sp=sepOf(w);if(sp)forms(sp.base).forEach(x=>f.add(x));return [...f];};   // ausfüllen → fülle … aus
    let W;
    if(t.length===2&&['der','die','das'].includes(t[0]))W={groups:[{alts:[t[1]],kind:'noun'}]};
    else if(t.length===1&&c.cat==='verbs'){
      const w=t[0],sp=sepOf(w);
      W={groups:[{alts:forms(w),kind:'verb'}]};if(sp)W.sep={prefix:sp.prefix,inf:w,g:0};
    }
    else if(t.length===1)W={groups:[{alts:[t[0]]}]};
    else{ // a phrase: all its words; a final verb may be conjugated, otherwise the words must stand together
      const verbish=c.cat!=='forms'&&VERBSET.has(t[t.length-1]);
      W={groups:t.map((w,i)=>i===t.length-1&&verbish?{alts:forms(w),kind:'verb'}:{alts:[w],kind:c.cat==='forms'&&i>0?'verb':null}),
         seq:t,together:!verbish&&c.cat!=='forms'};
      const sp=verbish&&sepOf(t[t.length-1]);if(sp)W.sep={prefix:sp.prefix,inf:t[t.length-1],g:t.length-1};
    }
    const p=(low(String(c.en)).match(/^[a-z]+/)||[])[0];
    if((c.cat==='forms'||c.cat==='pronouns')&&t[0]==='sie'&&PRON.includes(p))W.en=p;   // sie = she / they / polite Sie: check the English
    return W;
  }
  function hits(s,W){   // positions of the matched words, or null
    const at=[];
    for(const g of W.groups){
      const i=s.t.findIndex((x,i)=>g.alts.includes(x)&&(g.kind==='noun'?cap(s.o[i])&&(i>0||!lowerWords.has(x)):g.kind==='verb'?(i===0||!cap(s.o[i])):true));
      if(i<0)return null;at.push(i);
    }
    if(W.sep){const full=s.t.indexOf(W.sep.inf),pre=s.t.lastIndexOf(W.sep.prefix);   // separable verb: whole, or split with the prefix at the end
      if(full<0&&pre<=at[W.sep.g])return null;if(full<0)at.push(pre);}
    if(W.en&&!new RegExp('\\b'+W.en+'\\b','i').test(s.en))return null;
    if(W.together&&!(' '+s.t.join(' ')+' ').includes(' '+W.seq.join(' ')+' '))return null;
    return at;
  }
  function score(c,s,at,W){
    let sc=10;
    if(W.seq&&(' '+s.t.join(' ')+' ').includes(' '+W.seq.join(' ')+' '))sc+=4;
    if(s.src==='lesson')sc+=(s.les!=null&&s.les<=c.les)?3:1;else if(s.src==='reading')sc+=1;
    return sc-Math.max(0,s.t.length-6)*.5;
  }
  function find(c){
    if(!c||isSentence(c))return [];
    if(!corpus)corpus=build();
    if(typeof EXAMPLES!=='undefined'&&EXAMPLES[c.de]){const e=EXAMPLES[c.de];
      return (Array.isArray(e[0])?e:[e]).map(([de,en])=>({de,en,src:'written'}));}
    const W=want(c);
    return corpus.filter(s=>s.de!==c.de).map(s=>{const at=hits(s,W);return at&&{s,sc:score(c,s,at,W)};}).filter(Boolean)
      .sort((a,b)=>b.sc-a.sc||a.s.de.length-b.s.de.length).slice(0,3).map(x=>x.s);
  }
  /* the sentence as HTML with the word itself in bold */
  function mark(c,de){
    if(!corpus)corpus=build();
    const o=words(de),s={o,t:o.map(low),en:''},W=want(c);delete W.en;
    const at=new Set(hits(s,W)||[]);let k=0;
    return esc(de).replace(/[\p{L}\d]+(?:['’][\p{L}]+)?/gu,m=>at.has(k++)?'<b>'+m+'</b>':m);
  }
  return {find,mark,isSentence,corpus:()=>corpus||(corpus=build())};
})();

function addExample(){
  if(!current)return;
  const list=EX.find(current);if(!list.length)return;
  const r=progress.byId[current.id],e=list[(((r&&r.seen)||1)-1)%list.length];
  const d=document.createElement('div');d.className='tip vtip vex';
  d.innerHTML=`<span class="vtag">Example</span><div class="vexrow"><button type="button" class="speak-mini" aria-label="Listen to ${esc(e.de)}" title="Listen">🔊</button><div><div class="vexde" lang="de">${EX.mark(current,e.de)}</div><div class="vexen">${esc(e.en)}</div></div></div>`;
  d.querySelector('button').addEventListener('click',()=>speak(e.de));
  byId('feedback').appendChild(d);
}
