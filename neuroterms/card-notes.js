
(()=>{
"use strict";
const source=document.currentScript;
const card=document.querySelector(source?.dataset.card||"");
if(!card)return;
const storageKey=source.dataset.namespace||"neuroterms-card-notes-v1";
let saved={};
try{const data=JSON.parse(localStorage.getItem(storageKey)||"{}");if(data&&typeof data==="object"&&!Array.isArray(data))saved=data}catch{}
let activeId="",expanded=false,editing=false;
const create=(name,className,text)=>{const element=document.createElement(name);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element};
const style=create("style");
style.textContent="\n.fc-notes{margin:13px 0 18px;padding:15px 17px;border:1px solid #dfe6f2;border-radius:15px;background:#fafbff;color:#304564}\n.fc-notes[hidden],.fc-notes [hidden]{display:none!important}\n.fc-notes-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}\n.fc-notes-title{display:flex;gap:8px;align-items:center;font-size:13px;font-weight:800}\n.fc-notes-status{font-size:11px;color:#788ba4;font-weight:600}\n.fc-notes-actions{display:flex;gap:7px;flex-wrap:wrap}\n.fc-notes button{font:inherit;cursor:pointer;font-size:12px;font-weight:750;border:1px solid #dfe5f0;background:#fff;color:#455a7b;padding:9px 12px;border-radius:9px}\n.fc-notes button:focus-visible,.fc-notes textarea:focus-visible{outline:2px solid #667ce0;outline-offset:2px}\n.fc-notes .fc-notes-primary{background:#576bd9;border-color:#576bd9;color:#fff}\n.fc-notes .fc-notes-danger{color:#b54e49;background:#fff3f2;border-color:#f1d9d7}\n.fc-notes-preview{padding:13px 0 2px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.6;color:#405674}\n.fc-notes-editor{margin-top:13px}\n.fc-notes textarea{font:inherit;width:100%;min-height:130px;resize:vertical;background:#fff;border:1px solid #dce3ee;border-radius:11px;padding:13px;color:#243953;line-height:1.6}\n.fc-notes-editor-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}\n.fc-notes-tip{font-size:11px;color:#8798ad;line-height:1.6;margin:9px 0 0}\n.fc-notes-message{font-size:12px;color:#426b55;margin:10px 0 0}\n.fc-pics{margin-top:14px;padding-top:13px;border-top:1px solid #e6ebf4}\n.fc-pics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:9px;margin-top:11px}\n.fc-pic{position:relative;margin:0}\n.fc-notes .fc-pic-open{display:block;width:100%;padding:0;aspect-ratio:4/3;border-radius:11px;overflow:hidden;background:#eef2f9;cursor:zoom-in}\n.fc-pic-open img{display:block;width:100%;height:100%;object-fit:cover}\n.fc-pics-grid.single{grid-template-columns:1fr}\n.fc-notes .single .fc-pic-open{aspect-ratio:auto;background:#fff}\n.single .fc-pic-open img{height:auto;max-height:340px;object-fit:contain}\n.fc-notes .fc-pic-remove{position:absolute;top:6px;right:6px;padding:3px 9px;border-radius:999px;font-size:14px;line-height:1.3;background:rgba(255,255,255,.93);color:#b54e49;border-color:#f1d9d7}\n.fc-notes.fc-drop{outline:2px dashed #667ce0;outline-offset:3px}\ndialog.fc-lightbox{border:0;padding:0;background:transparent;max-width:96vw;max-height:96vh;overflow:visible}\ndialog.fc-lightbox::backdrop{background:rgba(14,22,38,.84)}\n.fc-lightbox img{display:block;max-width:94vw;max-height:88vh;border-radius:12px;background:#fff}\n.fc-lightbox button{position:fixed;top:14px;right:14px;font:inherit;font-size:13px;font-weight:750;cursor:pointer;border:0;border-radius:999px;padding:9px 14px;background:#fff;color:#304564}\n.fc-ask{margin-top:14px;padding-top:13px;border-top:1px solid #e6ebf4}\n.fc-ask-row{display:flex;gap:8px;margin-top:10px}\n.fc-notes .fc-ask input{flex:1;min-width:0;font:inherit;font-size:13px;background:#fff;border:1px solid #dce3ee;border-radius:9px;padding:9px 12px;color:#243953}\n.fc-notes .fc-ask input:focus-visible{outline:2px solid #667ce0;outline-offset:2px}\n@media(max-width:560px){.fc-notes{padding:13px}.fc-notes-actions{width:100%}.fc-notes-actions button{flex:1}}\n";
document.head.appendChild(style);
const panel=create("section","fc-notes");
panel.setAttribute("aria-label","Personal note and pictures for this flashcard");
const top=create("div","fc-notes-head");
const heading=create("div","fc-notes-title","✎ Personal note");
const status=create("span","fc-notes-status");
heading.appendChild(status);
const topButtons=create("div","fc-notes-actions");
const show=create("button",null,"Show note");
show.type="button";
show.setAttribute("aria-expanded","false");
const edit=create("button",null,"+ Add note");
edit.type="button";
const exportButton=create("button",null,"Export notes");
exportButton.type="button";
const copyButton=create("button",null,"⧉ Copy card");
copyButton.type="button";
copyButton.title="Copy front, back, details, your note and pictures";
topButtons.append(copyButton,show,edit,exportButton);
top.append(heading,topButtons);
const preview=create("div","fc-notes-preview");
preview.hidden=true;
const editor=create("div","fc-notes-editor");
editor.hidden=true;
const textarea=create("textarea");
textarea.maxLength=20000;
textarea.setAttribute("aria-label","Personal notes about this flashcard");
textarea.placeholder="Your explanation, a research example, something you want to remember…";
const editorActions=create("div","fc-notes-editor-buttons");
const save=create("button","fc-notes-primary","Save note");
save.type="button";
const cancel=create("button",null,"Cancel");
cancel.type="button";
const remove=create("button","fc-notes-danger","Delete note");
remove.type="button";
editorActions.append(save,cancel,remove);
const tip=create("p","fc-notes-tip","Saved only in this browser on this device. Export a backup if needed.");
editor.append(textarea,editorActions,tip);
const message=create("p","fc-notes-message");
message.setAttribute("role","status");
message.hidden=true;
const pics=create("div","fc-pics");
const picsHead=create("div","fc-notes-head");
const picsTitle=create("div","fc-notes-title","🖼 Pictures");
const picsStatus=create("span","fc-notes-status");
picsTitle.appendChild(picsStatus);
const picsActions=create("div","fc-notes-actions");
const addPic=create("button",null,"+ Add picture");
addPic.type="button";
picsActions.append(addPic);
picsHead.append(picsTitle,picsActions);
const picsGrid=create("div","fc-pics-grid");
const picsTip=create("p","fc-notes-tip","Choose images, drag them here, or paste one (Ctrl/⌘+V). Large images are resized to save space.");
const fileInput=create("input");
fileInput.type="file";fileInput.accept="image/*";fileInput.multiple=true;fileInput.hidden=true;
pics.append(picsHead,picsGrid,picsTip,fileInput);
const lightbox=create("dialog","fc-lightbox");
lightbox.setAttribute("aria-label","Picture");
const lightboxImg=create("img");
const lightboxClose=create("button",null,"✕ Close");
lightboxClose.type="button";
lightbox.append(lightboxImg,lightboxClose);
document.body.appendChild(lightbox);
const ask=create("form","fc-ask");
const askTitle=create("div","fc-notes-title","💬 Ask ChatGPT");
const askRow=create("div","fc-ask-row");
const askInput=create("input");
askInput.type="text";askInput.maxLength=1500;askInput.placeholder="Quick question about this card…";askInput.setAttribute("aria-label","Question for ChatGPT about this card");
const askButton=create("button","fc-notes-primary","Ask ↗");
askButton.type="submit";
askRow.append(askInput,askButton);
const askTip=create("p","fc-notes-tip","Opens ChatGPT in a new tab with this card's topic included. ChatGPT can't be shown inside this page.");
ask.append(askTitle,askRow,askTip);
ask.onsubmit=event=>{
event.preventDefault();
const question=askInput.value.trim()||"Explain this concept simply, with one example and one common misconception.";
const topic=(card.dataset.noteTitle||"").trim();
const prompt=topic?'I am studying a flashcard on "'+topic+'". '+question:question;
window.open("https://chatgpt.com/?q="+encodeURIComponent(prompt),"_blank","noopener");
askInput.value="";
};
panel.append(top,preview,editor,pics,ask,message);
card.after(panel);
function persist(next){
try{localStorage.setItem(storageKey,JSON.stringify(next));saved=next;return true}
catch{message.textContent="Unable to save here. Check browser storage settings or export your notes.";message.hidden=false;return false}
}
function render(){
const id=card.dataset.noteId||"";
panel.hidden=!id;
if(!id)return;
if(id!==activeId){activeId=id;editing=false;expanded=true;message.hidden=true;textarea.value=saved[id]||"";renderPictures()}
const note=typeof saved[id]==="string"?saved[id]:"";
status.textContent=note?"· saved":"· empty";
edit.textContent=note?"✎ Edit note":"+ Add note";
show.hidden=!note||editing;
show.textContent=expanded?"Hide note":"Show note";
show.setAttribute("aria-expanded",String(expanded));
preview.hidden=!note||!expanded||editing;
preview.textContent=note;
editor.hidden=!editing;
remove.hidden=!note;
exportButton.hidden=!Object.keys(saved).some(k=>saved[k])&&!totalPictures;
}
function beginEdit(){
if(!activeId)return;
editing=true;expanded=false;textarea.value=saved[activeId]||"";message.hidden=true;render();textarea.focus();
}
show.onclick=()=>{expanded=!expanded;render()};
edit.onclick=beginEdit;
cancel.onclick=()=>{editing=false;expanded=true;message.hidden=true;render()};
save.onclick=()=>{
if(!activeId)return;
const value=textarea.value.trim();
if(!value){message.textContent="Write something first, or use Delete note to remove an existing note.";message.hidden=false;return}
if(!persist({...saved,[activeId]:value}))return;
editing=false;expanded=true;message.textContent="Note saved in this browser.";message.hidden=false;render();
};
remove.onclick=()=>{
if(!activeId||!saved[activeId])return;
if(!confirm("Delete your personal note for this card?"))return;
const next={...saved};delete next[activeId];
if(!persist(next))return;
editing=false;expanded=false;textarea.value="";message.textContent="Note deleted.";message.hidden=false;render();
};
exportButton.onclick=async()=>{
const nonempty=Object.fromEntries(Object.entries(saved).filter(([_,value])=>typeof value==="string"&&value.trim()));
const pictures={};
try{for(const p of await allPictures())(pictures[p.cardId]||(pictures[p.cardId]=[])).push({added:new Date(p.added).toISOString(),dataUrl:await toDataUrl(p.blob)})}
catch{message.textContent="Pictures could not be read, so this export contains notes only.";message.hidden=false}
const content=JSON.stringify({format:"NeuroTerms card notes",version:2,exportedAt:new Date().toISOString(),notes:nonempty,pictures},null,2);
const blob=new Blob([content],{type:"application/json"});
const url=URL.createObjectURL(blob);
const a=create("a");
a.href=url;
a.download=storageKey+".json";
document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
const MAX_SIDE=1600,KEEP_BYTES=1.5*1024*1024;
let dbPromise=null,totalPictures=0,picToken=0,picUrls=[];
function openDb(){
if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
if(!window.indexedDB)return reject(new Error("IndexedDB unavailable"));
const request=indexedDB.open(storageKey+"-pictures",1);
request.onupgradeneeded=()=>{request.result.createObjectStore("pictures",{keyPath:"id",autoIncrement:true}).createIndex("cardId","cardId")};
request.onsuccess=()=>resolve(request.result);
request.onerror=()=>reject(request.error);
}).catch(error=>{dbPromise=null;throw error});
return dbPromise;
}
function withStore(mode,run){
return openDb().then(db=>new Promise((resolve,reject)=>{
const transaction=db.transaction("pictures",mode);
const request=run(transaction.objectStore("pictures"));
transaction.oncomplete=()=>resolve(request.result);
transaction.onerror=transaction.onabort=()=>reject(transaction.error);
}));
}
const listPictures=cardId=>withStore("readonly",store=>store.index("cardId").getAll(cardId));
const allPictures=()=>withStore("readonly",store=>store.getAll());
const countPictures=()=>withStore("readonly",store=>store.count());
const storePicture=(cardId,blob)=>withStore("readwrite",store=>store.add({cardId,blob,added:Date.now()}));
const deletePicture=id=>withStore("readwrite",store=>store.delete(id));
const toDataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});
function decode(file){
if(window.createImageBitmap)return createImageBitmap(file).catch(()=>decodeWithImg(file));
return decodeWithImg(file);
}
function decodeWithImg(file){
return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("decode"))};img.src=url});
}
async function shrink(file){
if(file.type==="image/svg+xml"&&file.size<=KEEP_BYTES)return file;
const image=await decode(file);
const width=image.width,height=image.height;
const keep=["image/jpeg","image/png","image/gif","image/webp"].includes(file.type);
if(keep&&file.size<=KEEP_BYTES&&Math.max(width,height)<=MAX_SIDE){image.close?.();return file}
const scale=Math.min(1,MAX_SIDE/Math.max(width,height));
const canvas=document.createElement("canvas");
canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
const context=canvas.getContext("2d");
context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);
context.drawImage(image,0,0,canvas.width,canvas.height);
image.close?.();
const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.86));
if(!blob)throw new Error("encode");
return blob;
}
async function addPictures(files){
const cardId=activeId;
const images=[...files].filter(file=>file&&file.type.startsWith("image/"));
if(!cardId||!images.length){if(files.length){message.textContent="Only image files can be added.";message.hidden=false}return}
let added=0,failed=0;
for(const file of images){
try{await storePicture(cardId,await shrink(file));added++}catch{failed++}
}
message.textContent=failed?(added?added+" picture(s) added; "+failed+" could not be read or stored.":"The picture could not be read or stored. Try a JPEG or PNG, or free up browser storage."):(added===1?"Picture added.":added+" pictures added.");
message.hidden=false;
renderPictures();
}
async function renderPictures(){
const token=++picToken,cardId=activeId;
let list=[];
try{list=cardId?await listPictures(cardId):[];totalPictures=await countPictures()}
catch{if(token!==picToken)return;pics.hidden=true;return}
if(token!==picToken)return;
pics.hidden=false;
picUrls.forEach(url=>URL.revokeObjectURL(url));picUrls=[];
picsGrid.replaceChildren();
picsGrid.classList.toggle("single",list.length===1);
picsGrid.hidden=!list.length;
picsStatus.textContent=list.length?"· "+list.length:"· none";
list.sort((a,b)=>a.added-b.added).forEach((picture,index)=>{
const url=URL.createObjectURL(picture.blob);picUrls.push(url);
const figure=create("figure","fc-pic");
const open=create("button","fc-pic-open");open.type="button";open.setAttribute("aria-label","Enlarge picture "+(index+1));
const img=create("img");img.src=url;img.alt="Picture "+(index+1)+" for this card";
open.appendChild(img);
open.onclick=()=>{lightboxImg.src=url;lightboxImg.alt=img.alt;if(lightbox.showModal)lightbox.showModal();else window.open(url,"_blank")};
const del=create("button","fc-pic-remove","×");del.type="button";del.setAttribute("aria-label","Remove picture "+(index+1));del.title="Remove picture";
del.onclick=async()=>{
if(!confirm("Remove this picture from the card?"))return;
try{await deletePicture(picture.id);message.textContent="Picture removed."}catch{message.textContent="The picture could not be removed."}
message.hidden=false;renderPictures();
};
figure.append(open,del);picsGrid.appendChild(figure);
});
render();
}
addPic.onclick=()=>fileInput.click();
fileInput.onchange=()=>{const files=[...fileInput.files];fileInput.value="";addPictures(files)};
lightboxClose.onclick=()=>lightbox.close();
lightbox.onclick=event=>{if(event.target===lightbox)lightbox.close()};
lightbox.addEventListener("close",()=>{lightboxImg.removeAttribute("src")});
panel.addEventListener("dragover",event=>{if([...event.dataTransfer.types].includes("Files")){event.preventDefault();panel.classList.add("fc-drop")}});
panel.addEventListener("dragleave",event=>{if(!panel.contains(event.relatedTarget))panel.classList.remove("fc-drop")});
panel.addEventListener("drop",event=>{event.preventDefault();panel.classList.remove("fc-drop");addPictures(event.dataTransfer.files)});
document.addEventListener("paste",event=>{
if(panel.hidden||pics.hidden||!panel.offsetParent)return;
const files=[...(event.clipboardData?.files||[])].filter(file=>file.type.startsWith("image/"));
if(!files.length)return;
event.preventDefault();addPictures(files);
});
const escapeHtml=text=>String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const paragraphs=text=>String(text).split(/\n{2,}/).map(part=>"<p>"+escapeHtml(part).replace(/\n/g,"<br>")+"</p>").join("");
async function buildCopy(){
const cardId=activeId;
const info=typeof window.flashcardCopy==="function"?window.flashcardCopy():null;
const note=typeof saved[cardId]==="string"?saved[cardId].trim():"";
let pictures=[];
try{pictures=cardId?(await listPictures(cardId)).sort((a,b)=>a.added-b.added):[]}catch{}
const textParts=[],htmlParts=[];
if(info){
textParts.push(info.title+(info.category?"\n("+info.category+")":""),"FRONT\n"+info.front,"BACK\n"+info.back);
htmlParts.push("<h2>"+escapeHtml(info.title)+"</h2>"+(info.category?"<p><em>"+escapeHtml(info.category)+"</em></p>":""),"<h3>Front</h3>"+paragraphs(info.front),"<h3>Back</h3>"+paragraphs(info.back));
if(typeof info.details==="function"){
const holder=document.createElement("div");
holder.style.cssText="position:fixed;left:-10000px;top:0;width:720px";
document.body.appendChild(holder);
try{
info.details(holder);
const links=[...holder.querySelectorAll("a[href]")].map(a=>({label:a.textContent.replace(/\s*↗\s*$/,"").trim(),url:a.href}));
holder.querySelectorAll("a[href]").forEach(a=>a.remove());
const detailText=holder.innerText.replace(/\n{3,}/g,"\n\n").trim();
if(detailText){textParts.push("DETAILS\n"+detailText);htmlParts.push("<h3>Details</h3>"+holder.innerHTML)}
if(links.length){textParts.push("LINKS\n"+links.map(l=>"- "+l.label+": "+l.url).join("\n"));htmlParts.push("<h3>Links</h3><ul>"+links.map(l=>'<li><a href="'+escapeHtml(l.url)+'">'+escapeHtml(l.label)+"</a></li>").join("")+"</ul>")}
}catch{}finally{holder.remove()}
}
}else{
const raw=card.innerText.trim();
textParts.push(raw);htmlParts.push(paragraphs(raw));
}
if(note){textParts.push("MY NOTE\n"+note);htmlParts.push("<h3>My note</h3>"+paragraphs(note))}
if(pictures.length){
textParts.push("PICTURES\n"+pictures.length+" picture"+(pictures.length>1?"s":"")+" attached (pasted into apps that accept images, like Notion, Google Docs or Word).");
const images=[];
for(const picture of pictures){try{images.push('<p><img src="'+await toDataUrl(picture.blob)+'" style="max-width:100%"></p>')}catch{}}
htmlParts.push("<h3>Pictures</h3>"+images.join(""));
}
return{text:textParts.join("\n\n"),html:"<div>"+htmlParts.join("")+"</div>",pictures:pictures.length};
}
function legacyCopy(text){
const area=document.createElement("textarea");
area.value=text;area.setAttribute("readonly","");area.style.cssText="position:fixed;left:-10000px;top:0";
document.body.appendChild(area);area.select();
let ok=false;try{ok=document.execCommand("copy")}catch{}
area.remove();return ok;
}
copyButton.onclick=async()=>{
if(!activeId)return;
const built=buildCopy();
let ok=false,rich=false;
try{
if(navigator.clipboard?.write&&window.ClipboardItem){
await navigator.clipboard.write([new ClipboardItem({"text/plain":built.then(b=>new Blob([b.text],{type:"text/plain"})),"text/html":built.then(b=>new Blob([b.html],{type:"text/html"}))})]);
ok=rich=true;
}
}catch{}
if(!ok){const b=await built;try{await navigator.clipboard.writeText(b.text);ok=true}catch{ok=legacyCopy(b.text)}}
const b=await built;
message.textContent=ok?"Card copied"+(b.pictures?(rich?" with "+b.pictures+" picture"+(b.pictures>1?"s":""):" (text only — this browser couldn't copy the pictures)"):"")+".":"Copying was blocked by the browser.";
message.hidden=false;
copyButton.textContent=ok?"✓ Copied":"⧉ Copy card";
clearTimeout(copyButton._timer);copyButton._timer=setTimeout(()=>{copyButton.textContent="⧉ Copy card"},1800);
};
new MutationObserver(render).observe(card,{attributes:true,attributeFilter:["data-note-id"]});
render();
})();
