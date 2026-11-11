
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
style.textContent="\n.fc-notes{margin:13px 0 18px;padding:15px 17px;border:1px solid #dfe6f2;border-radius:15px;background:#fafbff;color:#304564}\n.fc-notes[hidden],.fc-notes [hidden]{display:none!important}\n.fc-notes-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}\n.fc-notes-title{display:flex;gap:8px;align-items:center;font-size:13px;font-weight:800}\n.fc-notes-status{font-size:11px;color:#788ba4;font-weight:600}\n.fc-notes-actions{display:flex;gap:7px;flex-wrap:wrap}\n.fc-notes button{font:inherit;cursor:pointer;font-size:12px;font-weight:750;border:1px solid #dfe5f0;background:#fff;color:#455a7b;padding:9px 12px;border-radius:9px}\n.fc-notes button:focus-visible,.fc-notes textarea:focus-visible{outline:2px solid #667ce0;outline-offset:2px}\n.fc-notes .fc-notes-primary{background:#576bd9;border-color:#576bd9;color:#fff}\n.fc-notes .fc-notes-danger{color:#b54e49;background:#fff3f2;border-color:#f1d9d7}\n.fc-notes-preview{padding:13px 0 2px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.6;color:#405674}\n.fc-notes-editor{margin-top:13px}\n.fc-notes textarea{font:inherit;width:100%;min-height:130px;resize:vertical;background:#fff;border:1px solid #dce3ee;border-radius:11px;padding:13px;color:#243953;line-height:1.6}\n.fc-notes-editor-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}\n.fc-notes-tip{font-size:11px;color:#8798ad;line-height:1.6;margin:9px 0 0}\n.fc-notes-message{font-size:12px;color:#426b55;margin:10px 0 0}\n@media(max-width:560px){.fc-notes{padding:13px}.fc-notes-actions{width:100%}.fc-notes-actions button{flex:1}}\n";
document.head.appendChild(style);
const panel=create("section","fc-notes");
panel.setAttribute("aria-label","Personal note for this flashcard");
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
topButtons.append(show,edit,exportButton);
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
panel.append(top,preview,editor,message);
card.after(panel);
function persist(next){
try{localStorage.setItem(storageKey,JSON.stringify(next));saved=next;return true}
catch{message.textContent="Unable to save here. Check browser storage settings or export your notes.";message.hidden=false;return false}
}
function render(){
const id=card.dataset.noteId||"";
panel.hidden=!id;
if(!id)return;
if(id!==activeId){activeId=id;editing=false;expanded=false;message.hidden=true;textarea.value=saved[id]||""}
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
exportButton.hidden=!Object.keys(saved).some(k=>saved[k]);
}
function beginEdit(){
if(!activeId)return;
editing=true;expanded=false;textarea.value=saved[activeId]||"";message.hidden=true;render();textarea.focus();
}
show.onclick=()=>{expanded=!expanded;render()};
edit.onclick=beginEdit;
cancel.onclick=()=>{editing=false;message.hidden=true;render()};
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
exportButton.onclick=()=>{
const nonempty=Object.fromEntries(Object.entries(saved).filter(([_,value])=>typeof value==="string"&&value.trim()));
const content=JSON.stringify({format:"NeuroTerms card notes",version:1,exportedAt:new Date().toISOString(),notes:nonempty},null,2);
const blob=new Blob([content],{type:"application/json"});
const url=URL.createObjectURL(blob);
const a=create("a");
a.href=url;
a.download=storageKey+".json";
document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
new MutationObserver(render).observe(card,{attributes:true,attributeFilter:["data-note-id"]});
render();
})();
