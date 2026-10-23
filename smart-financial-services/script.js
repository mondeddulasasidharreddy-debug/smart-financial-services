const $=id=>document.getElementById(id);
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const num=id=>Math.max(0,parseFloat($(id).value)||0);

/* Tabs */
const tabs=[...document.querySelectorAll("nav button")];
function show(t){
  if(!document.getElementById(t))t="emi";
  document.querySelectorAll("section").forEach(s=>s.classList.toggle("on",s.id===t));
  tabs.forEach(b=>b.setAttribute("aria-selected",b.dataset.t===t));
}
tabs.forEach(b=>b.onclick=()=>show(b.dataset.t));
show(location.hash.slice(1)||"emi");

/* Theme */
$("theme").onclick=()=>{
  const d=document.documentElement,dark=getComputedStyle(d).colorScheme==="dark";
  d.dataset.theme=dark?"light":"dark";
};

/* Loan EMI */
function emi(){
  const P=num("e-p"),y=Math.max(1,num("e-y")),n=y*12,r=num("e-r")/1200;
  const m=r?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n;
  const tot=m*n,int=tot-P;
  $("e-emi").textContent=inr(m);$("e-int").textContent=inr(int);$("e-tot").textContent=inr(tot);
  const pp=tot?P/tot*100:0;$("e-b1").style.width=pp+"%";$("e-b2").style.width=(100-pp)+"%";
  let bal=P,rows="";
  for(let yr=1;yr<=y;yr++){
    let ip=0,pp2=0;
    for(let k=0;k<12;k++){const i=bal*r,p=m-i;ip+=i;pp2+=p;bal-=p}
    rows+=`<tr><td>${yr}</td><td>${inr(pp2)}</td><td>${inr(ip)}</td><td>${inr(Math.max(0,bal))}</td></tr>`;
  }
  $("e-tb").innerHTML=rows;
}

/* SIP */
function sip(){
  const m=num("s-m"),n=num("s-y")*12,r=num("s-r")/1200;
  const fv=r?m*((Math.pow(1+r,n)-1)/r)*(1+r):m*n,inv=m*n;
  $("s-fv").textContent=inr(fv);$("s-inv").textContent=inr(inv);$("s-gain").textContent=inr(fv-inv);
  const p=fv?inv/fv*100:0;$("s-b1").style.width=p+"%";$("s-b2").style.width=(100-p)+"%";
}

/* Goal */
function goal(){
  const T=num("g-t"),C=num("g-c"),n=Math.max(1,num("g-y"))*12,r=num("g-r")/1200;
  const grown=C*Math.pow(1+r,n),need=Math.max(0,T-grown);
  const pm=r?need*r/((Math.pow(1+r,n)-1)*(1+r)):need/n;
  const dep=C+pm*n;
  $("g-pm").textContent=inr(pm);$("g-dep").textContent=inr(dep);
  $("g-gr").textContent=inr(Math.max(0,T-dep));$("g-goal").textContent=inr(T);
}

["e-p","e-r","e-y"].forEach(i=>$(i).oninput=emi);
["s-m","s-r","s-y"].forEach(i=>$(i).oninput=sip);
["g-t","g-c","g-r","g-y"].forEach(i=>$(i).oninput=goal);

/* Money tracker (localStorage with in-memory fallback) */
let items=[];
try{items=JSON.parse(localStorage.getItem("sfs-items")||"[]")}catch(e){items=[]}
function save(){try{localStorage.setItem("sfs-items",JSON.stringify(items))}catch(e){}}
function esc(s){return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function draw(){
  let inc=0,out=0;
  items.forEach(x=>x.type==="income"?inc+=x.amt:out+=x.amt);
  $("b-in").textContent=inr(inc);$("b-out").textContent=inr(out);$("b-bal").textContent=inr(inc-out);
  $("b-list").innerHTML=items.length?items.slice().reverse().map(x=>
    `<tr><td>${esc(x.cat)}${x.note?" – "+esc(x.note):""}</td><td class="${x.type==="income"?"gain":"loss"}">${x.type==="income"?"+":"−"}${inr(x.amt)}</td><td><button class="del" data-id="${x.id}" aria-label="Delete entry">Delete</button></td></tr>`
  ).join(""):`<tr><td class="empty">No entries yet. Add your first income or expense.</td></tr>`;
}
$("b-add").onclick=()=>{
  const amt=num("b-amt");
  if(!amt){$("b-amt").focus();return}
  items.push({id:Date.now(),type:$("b-type").value,cat:$("b-cat").value,amt,note:$("b-note").value.trim()});
  $("b-amt").value="";$("b-note").value="";save();draw();
};
$("b-list").onclick=e=>{
  const id=e.target.dataset&&e.target.dataset.id;
  if(id){items=items.filter(x=>String(x.id)!==id);save();draw()}
};

emi();sip();goal();draw();
