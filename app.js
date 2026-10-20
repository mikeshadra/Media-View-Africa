/* Media View Africa site logic: routing, newsroom, services, contact, hero map. */
(()=>{
"use strict";
const {SAMPLE,CATS,CAT,SERVICES}=window.MVA_DATA;

const CONFIG=window.MVA_CONFIG||{};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function h(tag,attrs,...kids){const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs||{})){if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else if(k==="style")e.style.cssText=v;else e.setAttribute(k,v===true?"":v)}for(const kid of kids.flat()){if(kid==null||kid===false)continue;e.append(kid.nodeType?kid:document.createTextNode(String(kid)))}return e}
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const state={posts:SAMPLE.map((p,i)=>({id:"sample-"+i,...p})),live:false,cat:"all",q:"",canWrite:false,uid:null,admin:false,db:null,mode:"preview"};
const fmtDate=ms=>new Date(ms).toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
const words=t=>(t||"").trim().split(/\s+/).filter(Boolean).length;
const readMin=t=>Math.max(1,Math.round(words(t)/200));
let toastT;
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),2600)}
async function copy(text,label){try{await navigator.clipboard.writeText(text);toast(label||"Copied")}catch(e){toast("Select the text and copy it manually")}}

/* ---------- router ---------- */
const VIEWS=["home","about","services","newsroom","contact"];
function show(name,scroll=true){
  if(!VIEWS.includes(name))name="home";
  $$(".view").forEach(v=>v.hidden=v.dataset.view!==name);
  $$("[data-nav]").forEach(a=>a.getAttribute("data-nav")===name?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
  if(scroll)window.scrollTo(0,0);
  if(name==="home")startMap();
}
function go(name){location.hash=name;show(name)}
window.addEventListener("hashchange",()=>show(location.hash.slice(1)));
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");if(g){go(g.dataset.go);return}
  const c=e.target.closest("[data-copy]");if(c){copy(c.dataset.copy,"Copied "+c.dataset.copy);return}
  const x=e.target.closest("[data-close]");if(x){closeOv($("#"+x.dataset.close))}
});

/* ---------- overlays ---------- */
let lastFocus=null;
function openOv(el){lastFocus=document.activeElement;el.hidden=false;document.body.style.overflow="hidden";const f=$("button,input,select,textarea",el);f&&f.focus()}
function closeOv(el){el.hidden=true;if($$(".ov").every(o=>o.hidden))document.body.style.overflow="";lastFocus&&lastFocus.focus&&lastFocus.focus()}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const o=$$(".ov").filter(o=>!o.hidden).pop();o&&closeOv(o)}});
$$(".ov").forEach(o=>o.addEventListener("pointerdown",e=>{if(e.target===o)closeOv(o)}));
$("#pBtn").onclick=()=>openOv($("#proposal"));

/* ---------- theme ---------- */
$("#themeBtn").onclick=()=>{
  const root=document.documentElement;
  const cur=root.dataset.theme||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");
  const next=cur==="dark"?"light":"dark";root.dataset.theme=next;store.set("mva-theme",next);cache=null;
};
{const t=store.get("mva-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}

/* ---------- posts UI ---------- */
function cover(p,withTag){
  const cat=CAT[p.category]||CATS[0];let n=0;for(const ch of (p.title||"x"))n=(n*31+ch.charCodeAt(0))%97;
  return h("div",{class:"cover","data-v":n%4,style:"--c:"+cat.c},h("span",{class:"tag"},cat.name+" / "+(p.kind||"")),p.sample&&h("span",{class:"smp"},"SAMPLE"))
}
function metaRow(p){const cat=CAT[p.category]||CATS[0];return h("div",{class:"meta mono"},h("i",{class:"dot",style:"--c:"+cat.c}),cat.name,"·",p.kind,"·",fmtDate(p.createdAt))}
function openBtn(p,tag="h3"){return h(tag,{},h("button",{class:"open",onclick:()=>openReader(p.id)},p.title))}
function card(p,lead){
  return h("article",{class:"card"+(lead?" lead":""),style:"--c:"+(CAT[p.category]||CATS[0]).c},cover(p),
    h("div",{class:"cbody"},metaRow(p),openBtn(p),p.dek&&h("p",{class:"dek"},p.dek),h("div",{class:"by"},"By "+p.author+" · "+readMin(p.body)+" min read")))
}
function rowCard(p){return h("article",{class:"row",style:"--c:"+(CAT[p.category]||CATS[0]).c},metaRow(p),openBtn(p),h("div",{class:"by muted",style:"font-size:.82rem"},"By "+p.author))}
function visible(){
  const q=state.q.trim().toLowerCase();
  return state.posts.filter(p=>(state.cat==="all"||p.category===state.cat)&&(!q||[p.title,p.dek,p.author,p.body,(CAT[p.category]||{}).name].join(" ").toLowerCase().includes(q)));
}
function renderHome(){
  const box=$("#homeNews");box.replaceChildren();
  const ps=state.posts.slice(0,4);
  if(!ps.length){box.append(h("div",{class:"empty"},"No stories yet. Reporters can publish the first one from the newsroom."));return}
  box.append(card(ps[0],true));
  const st=h("div",{class:"stack"});ps.slice(1).forEach(p=>st.append(rowCard(p)));box.append(st);
}
function renderTicker(){
  const tr=$("#tickTrack");tr.replaceChildren();
  const ps=state.posts.slice(0,8);if(!ps.length){tr.append(h("button",{},"Newsroom opening soon"));return}
  const mk=()=>ps.map(p=>h("button",{onclick:()=>openReader(p.id)},h("span",{},(CAT[p.category]||CATS[0]).name),p.title));
  tr.append(...mk(),...mk());
}
function renderDesks(){
  const box=$("#desks");box.replaceChildren();
  CATS.forEach(c=>{const n=state.posts.filter(p=>p.category===c.id).length;
    box.append(h("button",{class:"desk",style:"--c:"+c.c,onclick:()=>{state.cat=c.id;renderNews();go("newsroom")}},h("span",{class:"mono"},h("i",{class:"dot",style:"--c:"+c.c}),n+(n===1?" story":" stories")),h("b",{},c.name)))});
}
function renderFilters(){
  const box=$("#filters");box.replaceChildren();
  const mk=(id,name,n)=>h("button",{class:"chip","aria-pressed":state.cat===id,onclick:()=>{state.cat=id;renderNews()}},name,h("span",{class:"n"},n));
  box.append(mk("all","All",state.posts.length),...CATS.map(c=>mk(c.id,c.name,state.posts.filter(p=>p.category===c.id).length)));
}
function renderNews(){
  renderFilters();
  const g=$("#newsGrid");g.replaceChildren();const ps=visible();
  if(!ps.length)g.append(h("div",{class:"empty"},state.q?"No stories match your search.":"No stories in this category yet."));
  else ps.forEach(p=>g.append(card(p)));
  $("#srcNote").textContent=state.mode==="local"?"Demo mode: stories are saved in this browser only · "+state.posts.length+" stories":state.live?"Live from the shared newsroom · "+state.posts.length+" stories":"Preview with sample stories";
}
function renderAll(){renderHome();renderTicker();renderDesks();renderNews()}
$("#q").addEventListener("input",e=>{state.q=e.target.value;renderNews()});

/* ---------- reader ---------- */
function openReader(id){
  const p=state.posts.find(x=>x.id===id);if(!p)return;
  const cat=CAT[p.category]||CATS[0];
  const sheet=$("#readerSheet");sheet.replaceChildren();
  const paras=(p.body||"").split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  const mine=state.canWrite&&(state.admin||(state.uid&&p.authorId===state.uid))&&state.live&&!String(p.id).startsWith("sample-")||false;
  const del=h("div",{class:"actions"});
  if(mine){
    const b=h("button",{class:"btn"},"Remove story");
    b.onclick=()=>{b.remove();del.append(h("span",{class:"muted"},"Remove this story for everyone?"),h("button",{class:"btn primary",onclick:async()=>{try{await state.db.doc("posts/"+p.id).delete();closeOv($("#reader"));toast("Story removed")}catch(e){toast("Could not remove this story")}}},"Yes, remove"),h("button",{class:"btn",onclick:()=>{del.replaceChildren(b)}},"Keep"))};
    del.append(b);
  }
  const related=state.posts.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,2);
  sheet.append(
    h("button",{class:"iconbtn sheet-x","aria-label":"Close story",onclick:()=>closeOv($("#reader"))},"✕"),
    cover(p),
    h("div",{class:"art"},
      metaRow(p),h("h1",{},p.title),p.dek&&h("p",{class:"dek"},p.dek),
      h("div",{class:"byline mono"},"By "+p.author,"·",readMin(p.body)+" min read"),
      h("div",{class:"body"},paras.map(t=>h("p",{},t))),
      p.sample&&h("p",{class:"note"},"This is sample copy that shows how stories will look on the site."),
      mine&&del,
      related.length&&h("div",{style:"margin-top:12px"},h("div",{class:"mono muted",style:"margin-bottom:10px"},"More in "+cat.name),h("div",{class:"stack"},related.map(rowCard)))
    ));
  openOv($("#reader"));$("#reader").scrollTop=0;
}

/* ---------- editor ---------- */
const eCat=$("#eCat");CATS.forEach(c=>eCat.append(h("option",{value:c.id},c.name)));
const ed={kind:$("#eKind"),cat:eCat,title:$("#eTitle"),dek:$("#eDek"),body:$("#eBody"),author:$("#eAuthor")};
function draftObj(){return{kind:ed.kind.value,category:ed.cat.value,title:ed.title.value.trim(),dek:ed.dek.value.trim(),body:ed.body.value,author:ed.author.value.trim()}}
function updatePrev(){
  const d=draftObj();const p={...d,title:d.title||"Your headline appears here",dek:d.dek||"Your standfirst appears here.",author:d.author||"Your name",createdAt:Date.now(),id:"prev"};
  const prev=$("#edPrev");prev.replaceChildren(card(p,false));
  $$(".open",prev).forEach(b=>b.tabIndex=-1);
  const w=words(d.body);$("#edCount").textContent=w+" words · "+readMin(d.body)+" min read";
  store.set("mva-draft",JSON.stringify(d));$("#edDraft").textContent="Draft saved in this browser";
}
function edNote(){
  const n=$("#edNote"),b=$("#pubBtn");
  if(state.mode==="local"){n.textContent="Demo mode: stories are saved in this browser only. Connect the newsroom API (see README) to publish for everyone.";b.disabled=false}
  else if(!state.db){n.textContent="Publishing opens when you view this page signed in with newsroom access. You can still draft here and see the preview.";b.disabled=true}
  else if(!state.canWrite){n.textContent="Your account can read the newsroom but not publish. Ask an administrator for contributor access.";b.disabled=true}
  else{n.textContent="Stories go live to everyone viewing the newsroom as soon as you publish.";b.disabled=false}
}
$("#writeBtn").onclick=()=>{
  try{const d=JSON.parse(store.get("mva-draft")||"null");if(d){ed.kind.value=d.kind||"News update";ed.cat.value=d.category||"politics";ed.title.value=d.title||"";ed.dek.value=d.dek||"";ed.body.value=d.body||"";ed.author.value=d.author||""}}catch(e){}
  edNote();updatePrev();$("#edErr").textContent="";openOv($("#editor"));
};
Object.values(ed).forEach(i=>i.addEventListener("input",updatePrev));
$("#edForm").addEventListener("submit",async e=>{
  e.preventDefault();const d=draftObj(),err=$("#edErr");err.textContent="";
  if(d.title.length<8){err.textContent="Add a headline of at least 8 characters.";ed.title.focus();return}
  if(words(d.body)<30){err.textContent="Write at least 30 words in the story.";ed.body.focus();return}
  if(!d.author){err.textContent="Add a byline.";ed.author.focus();return}
  const b=$("#pubBtn");b.disabled=true;b.textContent="Publishing…";
  try{
    await state.db.collection("posts").add({...d,authorId:state.uid||"",createdAt:Date.now()});
    store.del("mva-draft");Object.values(ed).forEach(i=>{if(i.tagName!=="SELECT")i.value=""});
    closeOv($("#editor"));state.cat="all";renderNews();go("newsroom");toast("Story published");
  }catch(x){err.textContent=x&&x.code==="invalid_argument"?"Your account is not allowed to publish stories.":"Could not publish. Try again in a moment."}
  b.textContent="Publish";edNote();
});

/* ---------- services ---------- */
const picked=new Set();
function renderServices(){
  const acc=$("#acc");acc.replaceChildren();
  SERVICES.forEach((s,i)=>{
    const item=h("div",{class:"acc-item","data-open":i===0});
    const head=h("button",{class:"acc-head","aria-expanded":i===0,onclick:()=>{const o=item.dataset.open!=="true";$$(".acc-item",acc).forEach(x=>{x.dataset.open="false";$(".acc-head",x).setAttribute("aria-expanded","false")});item.dataset.open=o;head.setAttribute("aria-expanded",o)}},
      h("h3",{},s.name),h("span",{class:"sub"},s.sub),h("span",{class:"plus","aria-hidden":"true"},"+"));
    const inn=h("div",{class:"acc-in"},h("div",{style:"display:flex;flex-direction:column;gap:18px;align-items:flex-start"},h("p",{},s.text),h("button",{class:"btn primary",onclick:()=>{picked.add(s.id);renderChips();go("contact")}},"Add to my brief")),
      h("div",{class:"chips"},s.items.map(t=>h("span",{class:"chip",style:"cursor:default"},t))));
    item.append(head,h("div",{class:"acc-panel"},h("div",{},inn)));acc.append(item);
  });
}
function renderChips(){
  const box=$("#svcChips");box.replaceChildren();
  SERVICES.forEach(s=>box.append(h("button",{type:"button",class:"chip","aria-pressed":picked.has(s.id),onclick:()=>{picked.has(s.id)?picked.delete(s.id):picked.add(s.id);renderChips()}},s.name)));
}
$("#form").addEventListener("submit",e=>{
  e.preventDefault();let ok=true;
  const name=$("#cName").value.trim(),email=$("#cEmail").value.trim(),msg=$("#cMsg").value.trim();
  $("#eName").textContent=name?"":"Enter your name.";
  const em=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);$("#eEmail").textContent=em?"":"Enter a valid email address.";
  $("#eMsg").textContent=msg.length>=10?"":"Tell us a little more (10 characters or more).";
  if(!name||!em||msg.length<10)return;
  const svc=SERVICES.filter(s=>picked.has(s.id)).map(s=>s.name).join(", ")||"Not specified";
  $("#briefText").value=["Brief for Media View Africa","","Name: "+name,"Email: "+email,"Organisation: "+($("#cOrg").value.trim()||"-"),"Services: "+svc,"","Message:",msg].join("\n");
  const payload={name,email,organisation:$("#cOrg").value.trim(),services:svc,message:msg};
  const showBrief=()=>{$("#form").hidden=true;$("#briefOut").hidden=false};
  if(!CONFIG.contactEndpoint){showBrief();return}
  const btn=$("#form button[type=submit]");btn.disabled=true;btn.textContent="Sending…";
  fetch(CONFIG.contactEndpoint,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload)})
    .then(r=>{if(!r.ok)throw new Error("bad status");$("#form").hidden=true;$("#sent").hidden=false;$("#form").reset();picked.clear();renderChips()})
    .catch(()=>{toast("Could not send. Your brief is ready to copy instead.");showBrief()})
    .finally(()=>{btn.disabled=false;btn.textContent="Prepare my brief"});
});
$("#copyBrief").onclick=()=>copy($("#briefText").value,"Brief copied");
$("#editBrief").onclick=()=>{$("#form").hidden=false;$("#briefOut").hidden=true};

/* ---------- map ---------- */
const AFR=[[-5.9,35.8],[-2,35.1],[3,36.8],[10.2,37.2],[11,35],[10.1,33.9],[11.5,33.1],[15.2,32.4],[19,30.3],[20.1,32.1],[22,32.9],[25,31.6],[29,30.9],[32.3,31.3],[32.6,29.9],[33.5,27.2],[35.5,23.5],[37.2,21],[37.4,18.5],[39.7,15.3],[41.5,13.5],[43.1,12.7],[44,10.4],[47,11.2],[51.2,11.8],[51,10.4],[49.5,7.5],[48,5],[46,2.2],[43.5,-0.7],[41.5,-2],[40.2,-3.3],[39.3,-4.9],[39,-6.8],[39.5,-8.2],[40.4,-10.5],[40.5,-12.5],[40.7,-15],[37,-17.6],[35,-20],[35.2,-21.5],[35.5,-24],[33.5,-25.7],[32.9,-26.9],[32.5,-28.5],[30,-31.3],[27.5,-33.3],[25.6,-34],[22,-34.1],[20,-34.8],[18.4,-34.2],[18,-31.5],[16.5,-28.5],[15,-26.5],[14.5,-22.5],[12.5,-18.5],[11.8,-17.2],[13.7,-12],[12.5,-6],[12,-5],[9.5,-2],[9.3,0.5],[9.8,3.5],[8.8,4.5],[6,4.3],[4.5,6.2],[1.5,6.1],[-2,4.8],[-4.3,5.2],[-7.5,4.4],[-9.5,6.2],[-13,8.5],[-14.8,10.8],[-16.7,12.4],[-17.5,14.7],[-16.5,19.5],[-17,21],[-15.5,24.5],[-13,27.6],[-10,29.5],[-9.8,31],[-8.5,33.2],[-6.8,34.3]];
const MAD=[[49.3,-12],[50.4,-15.5],[47.5,-25],[44.5,-25],[43.3,-22],[44.3,-16.5],[47,-15.3]];
const KE=[36.82,-1.29];
function pip(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
const cv=$("#map"),ctx=cv.getContext("2d");
let dots=[],W=0,H=0,sc=1,ox=0,oy=0,ptr=null,raf=0,running=false,cache=null,frame=0;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const proj=(lon,lat)=>[(lon+19)*sc+ox,(38-lat)*sc+oy];
const unproj=(x,y)=>[(x-ox)/sc-19,38-(y-oy)/sc];
function size(){
  const r=cv.getBoundingClientRect();if(r.width<10)return false;
  const dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  sc=Math.min(W*.86/72,H*.86/75);ox=(W-72*sc)/2;oy=(H-75*sc)/2+H*.01;
  const g=Math.max(7,W/56);dots=[];
  for(let y=oy;y<H;y+=g)for(let x=ox-(((y-oy)/g)|0)%2*g/2;x<W;x+=g){const[lo,la]=unproj(x,y);if(pip(lo,la,AFR)||pip(lo,la,MAD))dots.push([x,y,Math.random()*6.28])}
  return true;
}
function colors(){if(!cache||frame%90===0){const s=getComputedStyle(document.documentElement);cache={dot:s.getPropertyValue("--dot").trim(),acc:s.getPropertyValue("--accent").trim(),fg:s.getPropertyValue("--fg").trim()}}return cache}
function draw(t){
  frame++;const c=colors();ctx.clearRect(0,0,W,H);
  const[kx,ky]=proj(KE[0],KE[1]);const R=reduce?0:((t/1000)*70)%320;
  const r0=Math.max(2,W/180);
  for(const[x,y,ph]of dots){
    let r=r0,a=.55,col=c.dot;
    const dk=Math.hypot(x-kx,y-ky);
    if(!reduce){a+=Math.sin(t/900+ph)*.12;const dr=Math.abs(dk-R);if(dr<18){const k=1-dr/18;r+=k*r0*.9;col=c.acc;a=.4+k*.6}}
    if(dk<W*.03){col=c.acc;a=1;r=r0*1.3}
    if(ptr){const d=Math.hypot(x-ptr[0],y-ptr[1]);if(d<80){const k=1-d/80;r+=k*r0*1.2;a=Math.max(a,.5+k*.5);if(k>.35)col=c.fg}}
    ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.strokeStyle=c.acc;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(kx,ky,r0*3.2+(reduce?0:Math.sin(t/300)*1.2),0,6.283);ctx.stroke();
  if(ptr){ctx.strokeStyle=c.fg;ctx.globalAlpha=.5;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ptr[0],0);ctx.lineTo(ptr[0],H);ctx.moveTo(0,ptr[1]);ctx.lineTo(W,ptr[1]);ctx.stroke();ctx.globalAlpha=1}
}
function loop(t){if(!running)return;draw(t);raf=requestAnimationFrame(loop)}
function startMap(){
  cancelAnimationFrame(raf);running=false;
  requestAnimationFrame(()=>{if(!size())return;if(reduce){draw(0);return}running=true;raf=requestAnimationFrame(loop)});
}
const fin=$("#finder");
fin.addEventListener("pointermove",e=>{const r=cv.getBoundingClientRect();ptr=[e.clientX-r.left,e.clientY-r.top];const[lo,la]=unproj(ptr[0],ptr[1]);$("#lat").textContent=la.toFixed(2);$("#lon").textContent=lo.toFixed(2);if(reduce)draw(0)});
fin.addEventListener("pointerleave",()=>{ptr=null;$("#lat").textContent=KE[1].toFixed(2);$("#lon").textContent=KE[0].toFixed(2);if(reduce)draw(0)});
new ResizeObserver(()=>{if($("#view-home").hidden)return;if(size()&&reduce)draw(0)}).observe(fin);
document.addEventListener("visibilitychange",()=>{if(document.hidden){running=false;cancelAnimationFrame(raf)}else if(!$("#view-home").hidden)startMap()});
function tick(){const d=new Date(Date.now()+(new Date().getTimezoneOffset()+180)*60000);$("#clock").textContent="EAT "+[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,"0")).join(":")}
tick();setInterval(tick,1000);

/* ---------- boot ---------- */
renderServices();renderChips();renderAll();
show(location.hash.slice(1),false);
const {makeStore,localDb}=window.MVA_STORE;

function subscribe(db,onErr){
  db.collection("posts").orderBy("createdAt","desc").limit(200).onSnapshot(snap=>{
    state.posts=snap.docs.map(d=>({id:d.id,...d.data()}));state.live=true;renderAll();
  },()=>{state.live=false;if(onErr)onErr()});
}
(async()=>{
  try{
    if(!window.claude||!claude.use){
      state.canWrite=true;state.admin=true;state.uid="local";state.db=makeStore();state.mode=CONFIG.apiBase?"api":"local";
      subscribe(state.db,()=>{if(state.mode==="api"){state.mode="local";state.db=localDb();subscribe(state.db)}});return}
    const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);
    if(user){try{state.uid=await user.id()}catch(e){}try{state.canWrite=(await user.can("data.write"))!==false}catch(e){state.canWrite=true}try{state.admin=!!(await user.canEdit())}catch(e){}}
    if(!db)return;state.db=db;state.mode="shared";if(!user)state.canWrite=true;
    subscribe(db);
  }catch(e){}
})();
})();
