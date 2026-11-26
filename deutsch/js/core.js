/* CORE – small helpers every trainer uses.
   All files are plain <script>s that share one global scope (so the page also works when
   opened straight from disk), which is why later files can call everything defined here.
*/
const storeKey='deutsch-practice-a11-2026-v1';
const byId=id=>document.getElementById(id);
function norm(s,mode=0,keepCase=false){let t=String(s).trim().normalize('NFKC');if(!keepCase)t=t.toLocaleLowerCase('de');t=t.replace(/[“”„‘’]/g,"'");if(mode===1)t=t.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue');t=t.replace(/ß/g,mode===2?'s':'ss').normalize('NFD').replace(/[̀-ͯ]/g,'');return t.replace(/[.,!?;:()\/\-]/g,' ').replace(/\s+/g,' ').trim();}
function speakBrowser(text,onEnd){if(!('speechSynthesis' in window)){toast('Your browser does not support text-to-speech.');return;}const synth=window.speechSynthesis;const go=()=>{const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';u.rate=.85;if(onEnd)u.onend=onEnd;const v=synth.getVoices();u.voice=v.find(x=>x.lang.replace('_','-').toLowerCase()==='de-de')||v.find(x=>x.lang.toLowerCase().startsWith('de'))||null;synth.speak(u);};synth.cancel();setTimeout(go,80);}
if('speechSynthesis' in window)window.speechSynthesis.getVoices();
let ttsAudio=null,ttsSeq=0;
/* speak(text, onEnd): onEnd runs when it has finished – unless something else was spoken meanwhile */
function speak(text,onEnd){const my=++ttsSeq;if('speechSynthesis' in window)window.speechSynthesis.cancel();if(ttsAudio){ttsAudio.pause();ttsAudio=null;}let failed=false,ended=false;const done=onEnd?()=>{if(ended||my!==ttsSeq)return;ended=true;onEnd();}:null;const fallback=()=>{if(failed)return;failed=true;speakBrowser(text,done);};const a=new Audio('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=de&q='+encodeURIComponent(text));ttsAudio=a;a.addEventListener('error',fallback,{once:true});if(done)a.addEventListener('ended',done,{once:true});const pr=a.play();if(pr&&pr.catch)pr.catch(fallback);}
let toastTimeout=null;
function toast(msg){const e=byId('toast');e.textContent=msg;e.classList.add('on');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>e.classList.remove('on'),2400);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const lc=s=>s.toLocaleLowerCase('de');
/* after "Next": if the new question is hidden (under the sticky tab bar or below the screen), scroll it back into view */
function showTop(el){if(!el||!el.offsetParent)return;const nav=byId('navWrap'),top=nav?nav.getBoundingClientRect().bottom:0,r=el.getBoundingClientRect();if(r.top<top+8||r.bottom>innerHeight)window.scrollBy(0,r.top-top-16);}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
