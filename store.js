/*
 * Newsroom storage adapter. The site only needs this tiny interface:
 *   db.collection("posts").orderBy("createdAt","desc").limit(n).onSnapshot(next, onError)
 *   db.collection("posts").add(story)
 *   db.doc("posts/<id>").delete()
 * localDb keeps stories in the browser (demo). restDb talks to a REST API
 * (see server.js). Replace makeStore() to plug in your own CMS.
 */
window.MVA_STORE=(()=>{
const SAMPLE=window.MVA_DATA.SAMPLE;
const CONFIG=window.MVA_CONFIG||{};
function localDb(){
  const KEY="mva-posts-v1",subs=new Set();
  let rows=null;
  try{const v=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(v))rows=v}catch(e){}
  if(!rows)rows=SAMPLE.map((p,i)=>({id:"sample-"+i,...p}));
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(rows))}catch(e){}};
  const emit=()=>subs.forEach(f=>f());
  const snap=()=>({docs:[...rows].sort((a,b)=>b.createdAt-a.createdAt).map(r=>({id:r.id,data:()=>{const{id,...d}=r;return d}}))});
  return{
    collection:()=>({
      add:async d=>{rows=[{id:"p"+Date.now().toString(36),...d},...rows];save();emit()},
      orderBy:()=>({limit:()=>({onSnapshot:next=>{const f=()=>next(snap());subs.add(f);f();return()=>subs.delete(f)}})})
    }),
    doc:path=>({delete:async()=>{const id=path.split("/")[1];rows=rows.filter(r=>r.id!==id);save();emit()}})
  };
}

function toSnap(rows){
  return {docs:[...rows].sort((a,b)=>b.createdAt-a.createdAt).map(r=>({id:r.id,data:()=>{const{id,...d}=r;return d}}))};
}

function restDb(base){
  const subs=new Set();let rows=[];
  const headers={"Content-Type":"application/json",...(CONFIG.apiHeaders||{})};
  const emit=()=>subs.forEach(f=>f());
  const load=async()=>{const r=await fetch(base+"/posts");if(!r.ok)throw new Error("load failed");rows=await r.json();emit()};
  return{
    collection:()=>({
      add:async d=>{const r=await fetch(base+"/posts",{method:"POST",headers,body:JSON.stringify(d)});if(!r.ok)throw{code:"invalid_argument"};await load()},
      orderBy:()=>({limit:()=>({onSnapshot:(next,onError)=>{
        const f=()=>next(toSnap(rows));subs.add(f);
        load().catch(()=>onError&&onError());
        const timer=setInterval(()=>load().catch(()=>{}),30000);
        return()=>{subs.delete(f);clearInterval(timer)};
      }})})
    }),
    doc:path=>({delete:async()=>{const id=path.split("/")[1];const r=await fetch(base+"/posts/"+id,{method:"DELETE",headers});if(!r.ok)throw new Error("delete failed");await load()}})
  };
}

function makeStore(){return CONFIG.apiBase?restDb(CONFIG.apiBase):localDb()}
return {makeStore,localDb,restDb};
})();
