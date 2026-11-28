/* 🗃 ARCHIVE IN EVERY SECTION – "this question is no use to me here".
   Each trainer has its own archive, and archiving only affects that one section:
     gender  🎨 der · die · das   the article question of a noun          (id = vocabulary card id)
     plural  👥 Plural            the plural questions of a noun          (id = vocabulary card id)
     verbs   🔁 Verbs             a verb's table, its sentences, its forms (id = vocabulary card id)
     talk    💬 Ask & answer      one question                            (id = the question's key)
   📚 Vocabulary keeps its own archive for translations (js/vocab.js, key storeKey+'-archived').
   🎯 Heute leaves out whatever is archived in the section a question belongs to; its 🗃 button
   archives the current question there.
   Saved in localStorage storeKey+'-archive' as {section:[ids]}, so every backup includes it.
*/
const ARCH_KEY=storeKey+'-archive';
const ARCH_NAME={gender:'🎨 der · die · das',plural:'👥 Plural',verbs:'🔁 Verbs',talk:'💬 Ask & answer'};
const ARCH_WHAT={gender:'its article question',plural:'its plural questions',verbs:'its table, its sentences and its verb forms',talk:'this question'};
let ARCHS={};
try{const a=JSON.parse(localStorage.getItem(ARCH_KEY)||'{}');if(a&&typeof a==='object')Object.keys(ARCH_NAME).forEach(s=>{if(Array.isArray(a[s]))ARCHS[s]=new Set(a[s].map(String));});}catch(e){}
function inArch(sec,id){const s=ARCHS[sec];return !!s&&s.has(String(id));}
function archN(sec,f){const s=ARCHS[sec];if(!s)return 0;return f?[...s].filter(f).length:s.size;}
function setArch(sec,id,on,label){id=String(id);const s=ARCHS[sec]||(ARCHS[sec]=new Set());if(on)s.add(id);else s.delete(id);
  try{const o={};Object.entries(ARCHS).forEach(([k,v])=>{if(v.size)o[k]=[...v];});localStorage.setItem(ARCH_KEY,JSON.stringify(o));}catch(e){}
  LOG.add({section:sec,action:on?'archive':'restore',item:id,label});}
/* the 🗃 / ↩ button of a trainer */
function archBtnSet(b,sec,id){if(!b)return;const on=id!=null&&inArch(sec,id);b.textContent=on?'↩ Restore':'🗃 Archive';b.disabled=id==null;
  b.title=on?'Put it back into this trainer':`Not useful? Stop asking it here (${ARCH_WHAT[sec]}). Everything else stays. Find it again under “🗃 Archived”.`;}
function archToast(sec,label,on){toast(on?`🗃 “${label}” archived in ${ARCH_NAME[sec]} – find it under “🗃 Archived”.`:`↩ “${label}” is back in ${ARCH_NAME[sec]}.`);}
/* remove an item from a trainer's round: all its places from the current one on */
function archDrop(queue,from,same){for(let i=queue.length-1;i>=from;i--)if(same(queue[i]))queue.splice(i,1);}
