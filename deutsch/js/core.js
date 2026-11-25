/* CORE – small helpers every trainer uses.
   All files are plain <script>s that share one global scope (so the page also works when
   opened straight from disk), which is why later files can call everything defined here.
*/
const storeKey='deutsch-practice-a11-2026-v1';
const byId=id=>document.getElementById(id);
function norm(s,mode=0,keepCase=false){let t=String(s).trim().normalize('NFKC');if(!keepCase)t=t.toLocaleLowerCase('de');t=t.replace(/[“”„‘’]/g,"'");if(mode===1)t=t.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue');t=t.replace(/ß/g,mode===2?'s':'ss').normalize('NFD').replace(/[̀-ͯ]/g,'');return t.replace(/[.,!?;:()\/\-]/g,' ').replace(/\s+/g,' ').trim();}
function speakBrowser(text){if(!('speechSynthesis' in window)){toast('Your browser does not support text-to-speech.');return;}const synth=window.speechSynthesis;const go=()=>{const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';u.rate=.85;const v=synth.getVoices();u.voice=v.find(x=>x.lang.replace('_','-').toLowerCase()==='de-de')||v.find(x=>x.lang.toLowerCase().startsWith('de'))||null;synth.speak(u);};synth.cancel();setTimeout(go,80);}
if('speechSynthesis' in window)window.speechSynthesis.getVoices();
let ttsAudio=null;
function speak(text){if('speechSynthesis' in window)window.speechSynthesis.cancel();if(ttsAudio){ttsAudio.pause();ttsAudio=null;}let failed=false;const fallback=()=>{if(failed)return;failed=true;speakBrowser(text);};const a=new Audio('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=de&q='+encodeURIComponent(text));ttsAudio=a;a.addEventListener('error',fallback,{once:true});const pr=a.play();if(pr&&pr.catch)pr.catch(fallback);}
let toastTimeout=null;
function toast(msg){const e=byId('toast');e.textContent=msg;e.classList.add('on');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>e.classList.remove('on'),2400);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const lc=s=>s.toLocaleLowerCase('de');
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
